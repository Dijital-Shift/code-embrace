# Give the emails weight, color, and the logo

Right now every email is white-on-white with a text wordmark and thin copy. The invite in particular never tells the watchman what they are actually being asked to do.

## Visual direction

One shared shell, used by every email:

- **Dark header band** (near-black `#0a0800`) with the actual Kingdom Protocol logo image centered, gold wordmark beneath it, and the `ACCOUNTABILITY. NO NOISE.` kicker in gold `#c9a84c`.
- **Gold hairline rule** under the header, and a gold left-rule on any callout block.
- **Content area stays light** — that is a deliverability requirement, not a taste call; dark email bodies get clipped or inverted in Outlook and Gmail dark mode. The color comes from the header band, the gold accents, the callout panels, and the black/gold CTA button.
- **Dark footer band** with a short trust line, the site URL, and the `Dijital System • 01` credit.
- Code block keeps the gold-bordered cream panel, slightly heavier so it reads as the focal point.

The logo is served from the published site (`kingdomprotocol.app/kingdom-protocol-logo.png`) with an absolute URL so it renders in every client, plus alt text for image-blocking clients.

## Invite email rewrite

This is the one that has to land. New structure:

1. **Subject** — names the person and the ask, not a generic invite.
2. **Headline** — "{Name} asked you to watch their path."
3. **One-line stakes** — they made a written agreement about a specific behavior and put your name on it.
4. **A short "What this asks of you" panel** (gold-ruled), three lines:
   - You will not hear from this system most days. Silence means they are standing.
   - When they fall silent two days running, you get one message.
   - Your job is not the app. Your job is to reach out — a call, a verse, a meet-up.
5. **The weight line** — one sentence naming that they were chosen for this, and that no one else is watching.
6. **CTA** — "Accept and stand watch".
7. Quiet fallback line for people who were not expecting it.

A KJV line carries the ask (Ezekiel 33:6 for the watchman charge, matching the site's Silence Rule section).

## Auth emails

Same shell applied to all six (sign-in code, signup, recovery, invite, email change, reauthentication). Copy stays short but gains one line of voice each instead of reading like boilerplate. The 6-digit code stays the headline element.

## Technical notes

- Rework `src/lib/email-templates/_brand.tsx` — header/footer bands as table-safe `Section` rows with inline background colors, add a `Panel` component for the gold-ruled callouts and an absolute-URL `Img` logo.
- Rewrite `src/lib/email-templates/invite.tsx` to take `inviterName` and `pathTitle` props.
- Move the watchman invite in `src/lib/email.server.ts` off its hand-written HTML string onto the React invite template so both invite paths share one design.
- Templates and subjects are wired through `src/routes/lovable/email/auth/webhook.ts`; subject for the partner invite updates alongside.
- No auth logic, sender domain, or queue changes.
