// Worker-compatible Web Push using crypto.subtle for VAPID JWT signing
// Replaces the Node-only `web-push` library.

import { supabaseAdmin } from '@/integrations/supabase/client.server';

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const VAPID_CONTACT = process.env.VAPID_CONTACT_EMAIL || 'admin@kingdomprotocol.app';

function b64urlToUint8(b64: string): Uint8Array {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const s = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(s);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
function uint8ToB64url(u: Uint8Array): string {
  let s = '';
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function strToB64url(s: string): string {
  return uint8ToB64url(new TextEncoder().encode(s));
}

async function importVapidPrivate(): Promise<CryptoKey> {
  // VAPID private key is a 32-byte raw scalar. Build PKCS8 wrapper.
  const d = b64urlToUint8(VAPID_PRIVATE);
  const pub = b64urlToUint8(VAPID_PUBLIC); // 65 bytes uncompressed (0x04 + X + Y)
  // Use JWK form instead — much simpler.
  const x = pub.slice(1, 33);
  const y = pub.slice(33, 65);
  return crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      d: uint8ToB64url(d),
      x: uint8ToB64url(x),
      y: uint8ToB64url(y),
      ext: true,
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
}

async function buildVapidJwt(audience: string): Promise<string> {
  const header = strToB64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const payload = strToB64url(
    JSON.stringify({
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 12 * 3600,
      sub: `mailto:${VAPID_CONTACT}`,
    }),
  );
  const signingInput = `${header}.${payload}`;
  const key = await importVapidPrivate();
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${uint8ToB64url(new Uint8Array(sig))}`;
}

// HKDF helper
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm as BufferSource, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: salt as BufferSource, info: info as BufferSource },
    key,
    length * 8,
  );
  return new Uint8Array(bits);
}

function concat(...arrs: Uint8Array[]): Uint8Array {
  const len = arrs.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(len);
  let off = 0;
  for (const a of arrs) { out.set(a, off); off += a.length; }
  return out;
}

// AES128GCM encryption per RFC 8291
async function encryptPayload(
  payload: string,
  p256dhB64: string,
  authB64: string,
): Promise<{ body: Uint8Array; pubKey: Uint8Array }> {
  const clientPub = b64urlToUint8(p256dhB64);
  const auth = b64urlToUint8(authB64);

  // Generate ephemeral ECDH keypair
  const ephemeral = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  );
  const ephemeralPubRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', ephemeral.publicKey),
  );

  // Import client public key for ECDH
  const clientKey = await crypto.subtle.importKey(
    'raw',
    clientPub as BufferSource,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: clientKey },
      ephemeral.privateKey,
      256,
    ),
  );

  // Per RFC 8291: PRK_key = HKDF(auth, sharedSecret, "WebPush: info\0" + clientPub + serverPub, 32)
  const keyInfo = concat(
    new TextEncoder().encode('WebPush: info\0'),
    clientPub,
    ephemeralPubRaw,
  );
  const ikm = await hkdf(auth, sharedSecret, keyInfo, 32);

  // Salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // CEK
  const cek = await hkdf(salt, ikm, new TextEncoder().encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, new TextEncoder().encode('Content-Encoding: nonce\0'), 12);

  // Plaintext + 0x02 padding delimiter
  const pt = new TextEncoder().encode(payload);
  const padded = concat(pt, new Uint8Array([0x02]));

  const aesKey = await crypto.subtle.importKey('raw', cek as BufferSource, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce as BufferSource }, aesKey, padded as BufferSource),
  );

  // aes128gcm header: salt(16) || rs(4 BE = 4096) || idlen(1=65) || keyid(serverPub 65)
  const rs = new Uint8Array([0, 0, 16, 0]);
  const idlen = new Uint8Array([ephemeralPubRaw.length]);
  const header = concat(salt, rs, idlen, ephemeralPubRaw);

  return { body: concat(header, ct), pubKey: ephemeralPubRaw };
}

async function sendOne(sub: { endpoint: string; p256dh: string; auth: string }, payload: string): Promise<boolean> {
  try {
    const url = new URL(sub.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const jwt = await buildVapidJwt(audience);

    const { body } = await encryptPayload(payload, sub.p256dh, sub.auth);

    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        TTL: '86400',
        Authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC}`,
      },
      body: body as BodyInit,
    });

    if (res.status === 404 || res.status === 410) {
      // Subscription is gone — clean up
      await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      return false;
    }
    return res.ok;
  } catch (err) {
    console.error('[push] send failed', err);
    return false;
  }
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string },
): Promise<boolean> {
  const { data: subs } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (!subs?.length) return false;

  const json = JSON.stringify(payload);
  let sent = false;
  for (const s of subs) {
    if (await sendOne(s, json)) sent = true;
  }
  return sent;
}
