# Fix sign-in email + branded auth emails

## The bug you hit

The sign-in screen asks for a code, but the email that arrives contains a confirmation link button. That mismatch comes from the default email template, which sends a magic link instead of the 6-digit code the screen expects.

## Decision: use the code

Keep the 6-digit code, not the link. Reasons:
- Codes work when the email opens on a different device than the one signing in (very common on phones).
- Links break in email clients that pre-scan URLs, which can silently consume a one-time login.
- Your invite flow, login page, and demo screens are already built around the code step.

The link stays supported as a fallback in the same email, but the code is the headline action.

## What gets built

1. **Sender domain** — set up email sending on `kingdomprotocol.app` (delegated sending subdomain). This is done through the email setup dialog; DNS verification runs in the background and sending activates once it clears.

2. **Branded auth email templates** — scaffold the six auth emails (sign-in code / magic link, signup confirmation, password recovery, invite, email change, reauthentication) and restyle them to match Kingdom Protocol:
   - Dark ink on white body (email clients require a light body), gold `#c9a84c` accent rule and button
   - Cinzel-style serif wordmark "Kingdom Protocol" locked to the header, with `ACCOUNTABILITY. NO NOISE.` kicker
   - Large, spaced 6-digit code block as the primary element, expiry stated plainly
   - Secondary "or tap to sign in" link underneath
   - Footer: short trust line + Dijital System • 01 credit

3. **Watchman invite email** — the current invite email sends from `onboarding@resend.dev`. Move it onto the same branded template system and sender domain so invites stop landing in spam.

4. **Copy pass on the login screen** — make the code step read consistently ("Enter the 6-digit code we sent to …") and state the expiry.

## Technical notes

- Auth email templates are scaffolded with the managed Lovable email tooling (templates + auth webhook route + queue), not hand-written.
- Auth emails route through the queue; sends are logged and retried automatically.
- Template variables will use the OTP token as the primary content with the confirmation URL as secondary.
- Nothing else in the auth logic changes — `signInWithOtp` / `verifyOtp` in `src/routes/login.tsx` and `src/routes/invite.$token.tsx` stay as they are.

## Your one manual step

Approve the email domain setup dialog when it appears so the sending subdomain can be provisioned. Everything after that is automatic.
