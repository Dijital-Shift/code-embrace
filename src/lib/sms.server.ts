// Twilio SMS via REST API — pure fetch, Worker-compatible (no SDK).
// Used ONLY as a fallback when web push fails. Never dual-sends.
// Messages are intentionally generic — no path titles, no breach details.

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

export function smsConfigured(): boolean {
  return Boolean(ACCOUNT_SID && AUTH_TOKEN && FROM_NUMBER);
}

/** Returns true only if Twilio accepted the message. */
export async function sendSms(to: string | null | undefined, body: string): Promise<boolean> {
  if (!to) {
    console.warn('[sms] no phone on file; skipping');
    return false;
  }
  if (!smsConfigured()) {
    console.warn('[sms] TWILIO_* env vars not set; skipping send');
    return false;
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: FROM_NUMBER!, Body: body }),
      },
    );
    if (!res.ok) {
      console.error(`[sms] Twilio request failed [${res.status}]: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[sms] send failed', err);
    return false;
  }
}

export const SMS_BREACH = 'Breach reported. Open Kingdom Protocol to view details.';
export const SMS_SILENCE = "Your partner's gone quiet. Open Kingdom Protocol to check in.";
