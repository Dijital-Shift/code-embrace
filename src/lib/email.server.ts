// Transactional email via Lovable's managed email system.
// Emails are pre-rendered here and enqueued into the `transactional_emails`
// pgmq queue; the queue processor route handles sending, retries and backoff.
import { createElement } from 'react';
import { render } from '@react-email/render';
import { createClient } from '@supabase/supabase-js';
import { InviteEmail } from './email-templates/invite';


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
  const confirmationUrl = `${APP_URL}/login?email=${encodeURIComponent(opts.toEmail)}`;

  const html = await render(
    createElement(InviteEmail, {
      inviterName: displayName,
      pathTitle: opts.laneTitle,
      confirmationUrl,
    }),
  );

  await enqueue({
    to: opts.toEmail,
    subject: `${displayName} asked you to stand watch`,
    html,
    label: 'partner_invite',
  });
}

