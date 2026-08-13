# Close Out the Launch Flow

Payments are live. Four things still stand between the app and daily use. Each is verified against the current project state.

## 1. Free month, then pay (trial enforcement)

Right now nothing in the app ever checks subscription status — the `useSubscription` hook exists but is not used by any screen. So today everyone has unlimited free access.

What gets built:
- Store a trial end date on each user's profile (30 days from signup). Existing accounts get 30 days from today.
- One access rule: trial still running OR active subscription (monthly or lifetime) = full access.
- A soft banner during the trial ("X days left in your first month") and a firm gate when it lapses: you can still view your paths and history, but creating a new path and checking in requires a plan. Watchmen are never charged and never gated.
- Enforce the rule server-side too, so it isn't just a UI hint.

## 2. Cron jobs point at the wrong domain

The three scheduled jobs (missed check-ins, escalation to watchman, bedtime reminder) currently call `kingdom-protocol.lovable.app`, but the published site is `kingdomprotocol.lovable.app`. Every nightly run has been failing silently.

Fix: repoint all three jobs to a stable project URL that won't break on rename, then confirm with a live run that the endpoints answer and the reminder/escalation records are written.

Schedules after the fix:
- Missed check-ins + escalation: every 15 minutes (they self-window to each user's local 10 AM grace cutoff).
- Bedtime reminder: hourly, matched to each user's reminder hour.

## 3. Push notifications on the live domain

Push works in preview. Before relying on it: verify the service worker is served at the published domain, the VAPID key resolves in production, and a real ping lands on a phone. Dead subscriptions get pruned automatically. If Safari/iOS refuses, the email fallback already covers the same alert.

## 4. Email sending domain

Invites and watchman alerts currently send from the shared `onboarding@resend.dev` sender, which in practice only reaches your own address — invitations to your wife or brother would not arrive.

Fix: set up and verify a sending domain for Kingdom Protocol so invites, breach alerts, and weekly recaps deliver to anyone.

## 5. Final walkthrough before you use it

End-to-end on the published site: sign up fresh → onboarding (name, gender, timezone, bedtime) → create a path with notes → invite two watchmen → accept as watchman → miss a check-in → confirm the watchman gets pinged → send an encouragement → confirm streak shows days standing vs days fallen without resetting → subscribe with a real card → confirm access continues after the trial flag flips.

## Technical notes

- New `trial_ends_at timestamptz` on `public.profiles`, backfilled `created_at + 30 days` (clamped to a minimum of today for existing rows); default on insert handled in the signup/profile-creation path.
- Access helper: a `has_access(user_id)` security-definer function plus a client hook wrapping `useSubscription` + trial date, so gating is consistent on both sides.
- Server functions that create paths and record check-ins call the access check before writing.
- Cron: `cron.unschedule` + re-`schedule` jobs 1-3 against `project--<id>.lovable.app`, keeping the existing `apikey` header that `checkCronAuth` validates.
- Email: verified domain via the email setup flow, then set `RESEND_FROM_EMAIL` to the verified address.
