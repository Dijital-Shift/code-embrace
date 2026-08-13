# Copy fix: "brother" → "watchman"

## The change

The Silence Rule section still assumes a male watchman. Since the app has both male and female users, swap the gendered word for the role word.

- Threshold 03 body: "The loop closes with a **watchman**, not a banner."
- Section subhead above it: "...until a **watchman** shows up."
- FAQ closing line (lying/judgment answer): "Better to be seen by a **watchman** now than exposed at the throne later."
- Leave "a brother or sister on the wall" in the Who This Is For list as-is — it already names both.

File: `src/routes/index.tsx` (lines 145, 150, 490). No logic changes.

## Is it ready to use once payments are set up?

Short answer: payments are the last big blocker, but not the only one. Current state:

Working end to end
- Sign up, onboarding (timezone, bedtime, gender), paths with notes, daily check-in
- Watchman invites (up to 2 per path), breach alerts, missed check-in escalation at local 10AM
- Weekly recap, referrals, encouragements, push notifications, landing/demo/legal pages

Remaining before real users
1. **Stripe go-live** — the live publishable key is still a placeholder, so live checkout is disabled by design. Needs claiming the Stripe account, completing verification, and installing the app on the live account. Test-mode checkout already works.
2. **Trial enforcement** — confirm the 30-day free window actually gates access when it expires (subscribe / lifetime / locked out), not just displays.
3. **Cron scheduling** — bedtime reminder, missed-checkin escalation, and weekly recap endpoints exist but must be on a live schedule in production.
4. **Push in production** — verify the service worker and VAPID key work on the published domain, not just preview.
5. **Email deliverability** — invite and recap emails should send from your own verified domain.

If you want, after this copy fix I can do a readiness pass on items 2–5 and report exactly which are wired and which are not.
