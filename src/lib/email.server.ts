// Resend email — pure fetch, Worker-compatible.
// Configurable so the sender/domain swaps over with one setting once
// kingdomprotocol.app finishes DNS — no code change needed.
const APP_URL = process.env.APP_URL || 'https://kingdomprotocol.lovable.app';
const FROM = process.env.RESEND_FROM_EMAIL || 'Kingdom Protocol <onboarding@resend.dev>';

export async function sendPartnerInvite(opts: {
  toEmail: string;
  fromEmail: string;
  fromName?: string | null;
  laneTitle: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set; skipping invite');
    return;
  }
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
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: FROM,
      to: opts.toEmail,
      subject: `${displayName} added you as an accountability partner`,
      html,
    }),
  });
  if (!res.ok) console.error('[email] resend failed', res.status, await res.text());
}
