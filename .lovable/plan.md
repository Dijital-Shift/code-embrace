# Smooth landing at the end of the free month

Right now nothing happens before the free month runs out except a small "X days left" line, and the moment it ends everything locks with a red "Your free month has ended" panel. This plan turns the last stretch into a decision people can make early, without losing any free days.

## What happens today (verified)

- Access is granted if the free month is still running OR there is a paid plan on the account.
- The countdown line has no button — there is no way to act on it.
- When the month ends, check-ins and path creation are blocked behind a red panel with the two prices. Paths, history and watchmen are all kept.
- Watchmen keep free access either way.
- Choosing monthly today charges immediately, so deciding early costs remaining free days.

## What we build

**1. Billing starts the day the free month ends**

When someone picks $4.99/month during their free month, the card is saved and locked in, but the first charge is scheduled for the exact day their free month ends. They keep every remaining free day. The $99 lifetime option charges right away (nothing to defer).

**2. The last-5-days reminder**

Inside the final 5 days, the countdown strip changes from a passive line to an active one: a stronger gold strip reading "5 days left in your free month" with a "Keep walking" button opening the two choices right there.

**3. Once-a-day pop-up**

On the first sign-in of each day during the last 5 days, a dismissible pop-up appears:

- Heading: "Your free month ends in 5 days."
- Body: keeps their paths, history and watchmen; picking now changes nothing until the day it ends.
- Two buttons: $4.99 / month and $99 lifetime.
- "Not yet" closes it for the rest of that day (remembered on the device).

It never shows for anyone already on a plan, and it stops entirely once they've chosen.

**4. Confirmation after choosing early**

Once monthly is locked in during the free month, the strip and pop-up disappear and are replaced by a quiet line: "You're set. First payment DATE, $4.99/month." Lifetime buyers see "Lifetime — you're set."

**5. Softer wording after it ends**

The expired panel stays, but the tone shifts from a wall to an invitation: "Your free month is up. Everything is still here." with the same two buttons.

## Technical notes

- `createCheckoutSession` gains an optional `trialEnd` (unix seconds) passed as `subscription_data.trial_end` for recurring prices only; the value comes from the server's `profiles.trial_ends_at`, never the client.
- `getAccessState` additionally returns `inFinalStretch` (trial active, `daysLeft <= 5`) and the subscription's `price_id` / `current_period_end` so the confirmation line can render.
- New `TrialEndingModal` component; daily dismissal stored in `localStorage` keyed by user id + local date.
- `AccessBanner` gains the final-stretch and locked-in states; `PlanButtons` is reused as-is.
- No database changes needed.
