import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

function makeCode(): string {
  // 7-char URL-safe code (avoids confusing chars)
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export const getMyReferral = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: existing } = await supabaseAdmin
      .from('referrals')
      .select('code, created_at')
      .eq('referrer_id', userId)
      .maybeSingle();

    let code = existing?.code;
    if (!code) {
      for (let i = 0; i < 5; i++) {
        const c = makeCode();
        const { error } = await supabaseAdmin
          .from('referrals')
          .insert({ referrer_id: userId, code: c });
        if (!error) { code = c; break; }
      }
      if (!code) return { error: 'Could not create referral code.' };
    }

    // Invited = people who actually signed up with this link (never the code row itself).
    const { data: claims } = await supabaseAdmin
      .from('referral_claims')
      .select('referred_user_id')
      .eq('referrer_id', userId);
    const ids = (claims ?? []).map((c) => c.referred_user_id);
    let walking = 0;
    if (ids.length) {
      // Walking = actually engaged: logged at least one check-in, or added a
      // path of their own beyond the auto-seeded "Send Scripture" starter.
      const engaged = new Set<string>();
      const [{ data: active }, { data: checkins }] = await Promise.all([
        supabaseAdmin.from('lanes').select('user_id, title').in('user_id', ids).eq('status', 'active'),
        supabaseAdmin.from('checkins').select('user_id').in('user_id', ids),
      ]);
      for (const c of checkins ?? []) engaged.add(c.user_id);
      for (const l of active ?? []) if (l.title !== 'Send Scripture') engaged.add(l.user_id);
      walking = engaged.size;
    }
    const invited = ids.length;
    return { code, invited, walking };
  });

export const claimReferral = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ code: z.string().min(3).max(32) }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const code = data.code.trim().toLowerCase();
    // One link, unlimited friends; each person can only be claimed once.
    const { data: ref } = await supabaseAdmin
      .from('referrals')
      .select('referrer_id')
      .eq('code', code)
      .maybeSingle();
    if (!ref) return { ok: false, reason: 'not_found' as const };
    if (ref.referrer_id === userId) return { ok: false, reason: 'self' as const };
    const { error } = await supabaseAdmin
      .from('referral_claims')
      .insert({ referrer_id: ref.referrer_id, referred_user_id: userId, code });
    if (error) return { ok: false, reason: 'already' as const };
    return { ok: true };
  });
