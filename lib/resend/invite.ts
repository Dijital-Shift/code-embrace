import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@kingdomprotocol.app'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kingdomprotocol.app'

export async function sendPartnerInvite({
  toEmail,
  fromEmail,
  fromName,
  laneTitle,
}: {
  toEmail: string
  fromEmail: string
  fromName?: string | null
  laneTitle: string
}) {
  const displayName = fromName ?? fromEmail
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `${displayName} added you as an accountability partner`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #ffffff; color: #111;">

        <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.15rem; color: #000;">Kingdom Protocol</h2>
        <p style="color: #999; font-size: 0.75rem; margin-bottom: 2rem; letter-spacing: 0.05em;">ACCOUNTABILITY. NO NOISE.</p>

        <p style="margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.6;">
          <strong>${displayName}</strong> has added you as their accountability partner for the lane: <strong>${laneTitle}</strong>.
        </p>

        <div style="background: #f9f9f9; border-left: 3px solid #c9a84c; padding: 1.25rem 1.5rem; margin-bottom: 1.75rem; border-radius: 0 6px 6px 0;">
          <p style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.75rem; color: #000;">What is Kingdom Protocol?</p>
          <p style="font-size: 0.85rem; color: #444; line-height: 1.7; margin-bottom: 0;">
            A daily accountability system built for those who live by the Word of God. Users commit to behaviors — things to avoid or complete — and assign a partner to watch them. You are that partner.
          </p>
        </div>

        <p style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.75rem; color: #000;">What does being a partner mean?</p>
        <table style="width: 100%; margin-bottom: 1.75rem; border-collapse: collapse;">
          <tr>
            <td style="padding: 0.5rem 0; font-size: 0.85rem; color: #555; border-bottom: 1px solid #eee; vertical-align: top;">
              <strong style="color: #000;">When they're aligned</strong> — you hear nothing. Silence is the signal that the system is working.
            </td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; font-size: 0.85rem; color: #555; border-bottom: 1px solid #eee; vertical-align: top;">
              <strong style="color: #000;">When they miss a check-in</strong> — you're notified the following morning if they didn't self-correct overnight.
            </td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; font-size: 0.85rem; color: #555; vertical-align: top;">
              <strong style="color: #000;">When they report a breach</strong> — you're notified immediately. Their phone number is included. You reach out directly. Everything after that is between you two.
            </td>
          </tr>
        </table>

        <p style="font-size: 0.85rem; color: #555; margin-bottom: 1.75rem; line-height: 1.6;">
          You don't need to do anything daily. Just install the app, register, and be available when the system calls on you.
        </p>

        <a href="${APP_URL}/login?email=${encodeURIComponent(toEmail)}"
           style="display: inline-block; padding: 0.875rem 2rem; background: #000; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem;">
          Accept &amp; Join
        </a>

        <p style="margin: 0 0 0 0.25rem; display: inline;">
          <a href="${APP_URL}/how-it-works" style="font-size: 0.8rem; color: #888; text-decoration: underline; margin-left: 1rem;">
            See how it works →
          </a>
        </p>

        <p style="color: #bbb; font-size: 0.75rem; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem;">
          Ignore this if you weren't expecting it. No account will be created unless you click above.
        </p>
      </div>
    `,
  })
}
