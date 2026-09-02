// App email sending via Lovable's managed email API.
// Delivery, retries, suppression and unsubscribe handling are managed by
// Lovable; this module only decides what to send and records the outcome
// in the app's own email_send_log table.
import { createClient } from '@supabase/supabase-js';
import { sendTemplateEmail } from './email-templates/send-email';

const APP_URL = process.env.APP_URL || 'https://kingdomprotocol.app';

function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function logSend(entry: {
  template_name: string;
  recipient_email: string;
  status: 'sent' | 'suppressed' | 'failed';
  error_message?: string;
}) {
  const supabase = adminClient();
  if (!supabase) return;
  const { error } = await supabase.from('email_send_log').insert({
    message_id: null,
    template_name: entry.template_name,
    recipient_email: entry.recipient_email,
    status: entry.status,
    error_message: entry.error_message ?? null,
  });
  if (error) {
    console.error('[email] failed to write send log', {
      code: error.code,
      message: error.message,
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

  try {
    const result = await sendTemplateEmail('partner-invite', opts.toEmail, {
      templateData: {
        inviterName: displayName,
        pathTitle: opts.laneTitle,
        confirmationUrl,
      },
      idempotencyKey: `partner-invite-${opts.toEmail.toLowerCase()}-${opts.laneTitle}`,
    });

    if (!result.sent) {
      console.log('[email] recipient suppressed; skipping send');
      await logSend({
        template_name: 'partner_invite',
        recipient_email: opts.toEmail,
        status: 'suppressed',
      });
      return;
    }

    await logSend({
      template_name: 'partner_invite',
      recipient_email: opts.toEmail,
      status: 'sent',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    console.error('[email] partner invite send failed', { message });
    await logSend({
      template_name: 'partner_invite',
      recipient_email: opts.toEmail,
      status: 'failed',
      error_message: message,
    });
  }
}
