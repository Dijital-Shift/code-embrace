// Transactional email via Lovable's managed email system.
// Emails are pre-rendered here and enqueued into the `transactional_emails`
// pgmq queue; the queue processor route handles sending, retries and backoff.
import { createClient } from '@supabase/supabase-js';

const APP_URL = process.env.APP_URL || 'https://kingdomprotocol.app';
const SENDER_DOMAIN = 'notify.kingdomprotocol.app';
const FROM = `Kingdom Protocol <hello@${SENDER_DOMAIN}>`;

function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function enqueue(opts: {
  to: string;
  subject: string;
  html: string;
  label: string;
}) {
  const supabase = adminClient();
  if (!supabase) {
    console.warn('[email] Supabase env not configured; skipping send');
    return;
  }

  const normalized = opts.to.toLowerCase();
  const { data: suppressed } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', normalized)
    .maybeSingle();
  if (suppressed) {
    console.log('[email] recipient suppressed; skipping send');
    return;
  }

  const messageId = crypto.randomUUID();
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: opts.label,
    recipient_email: opts.to,
    status: 'pending',
  });

  const { error } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: opts.to,
      from: FROM,
      sender_domain: SENDER_DOMAIN,
      subject: opts.subject,
      html: opts.html,
      purpose: 'transactional',
      label: opts.label,
      idempotency_key: messageId,
      queued_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error('[email] enqueue failed', error);
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: opts.label,
      recipient_email: opts.to,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    });
  }
}

export async function sendPartnerInvite(opts: {
  toEmail: string;
  fromEmail: string;
  fromName?: string | null;
  laneTitle: string;
}) {
  const displayName = opts.fromName ?? opts.fromEmail;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#fff;color:#111">
      <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.15rem;color:#000">Kingdom Protocol</h2>
      <p style="color:#999;font-size:.75rem;margin-bottom:2rem;letter-spacing:.05em">ACCOUNTABILITY. NO NOISE.</p>
      <p style="margin-bottom:1.5rem;font-size:.95rem;line-height:1.6"><strong>${displayName}</strong> has added you as their accountability partner for the lane: <strong>${opts.laneTitle}</strong>.</p>
      <div style="background:#f9f9f9;border-left:3px solid #c9a84c;padding:1.25rem 1.5rem;margin-bottom:1.75rem;border-radius:0 6px 6px 0">
        <p style="font-weight:700;font-size:.85rem;margin-bottom:.75rem;color:#000">What is Kingdom Protocol?</p>
        <p style="font-size:.85rem;color:#444;line-height:1.7;margin:0">A daily accountability system. Users commit to behaviors and assign a partner to watch them. You are that partner.</p>
      </div>
      <p style="font-size:.85rem;color:#555;line-height:1.6;margin-bottom:1.5rem">You'll only hear from the system when something goes wrong — silence means they're aligned.</p>
      <a href="${APP_URL}/login?email=${encodeURIComponent(opts.toEmail)}" style="display:inline-block;padding:.875rem 2rem;background:#000;color:#fff;border-radius:6px;text-decoration:none;font-weight:700;font-size:.95rem">Accept &amp; Join</a>
      <p style="color:#bbb;font-size:.75rem;margin-top:2rem;border-top:1px solid #eee;padding-top:1rem">Ignore this if you weren't expecting it. No account will be created unless you click above.</p>
    </div>`;

  await enqueue({
    to: opts.toEmail,
    subject: `${displayName} added you as an accountability partner`,
    html,
    label: 'partner_invite',
  });
}
