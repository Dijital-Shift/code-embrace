# Polish pass v2 — honesty, gender, relationship, referrals, micro-prompt

## 1. FAQ — two new entries (`src/routes/index.tsx`)

**Q: "What stops me from lying?"**
A: Nothing in the software — and that's the point. This is a covenant, not a behavior tracker. If you lie to your watchman, you've only widened the gap between you and the Lord. The system pings a real person who knows you. Lies surface — in tone, in patterns, in the silence between check-ins. "For there is nothing covered, that shall not be revealed; neither hid, that shall not be known." — Luke 12:2. If you came here to game it, this isn't your tool yet. Come ready to be seen.

**Q: "What does the Word say about lying and being watched?"**
A: Plainly:
- "Lying lips are abomination to the LORD: but they that deal truly are his delight." — Proverbs 12:22
- "But I say unto you, That every idle word that men shall speak, they shall give account thereof in the day of judgment." — Matthew 12:36
- "The LORD is in his holy temple, the LORD's throne is in heaven: his eyes behold, his eyelids try, the children of men." — Psalm 11:4
- "The eyes of the LORD are in every place, beholding the evil and the good." — Proverbs 15:3
- "The eyes of the Lord are ten thousand times brighter than the sun, beholding all the ways of men, and considering the most secret parts." — Sirach 23:19
- "He hath commanded no man to do wickedly, neither hath he given any man licence to sin." — Sirach 15:20 *(close paraphrase of the 16:17 / 17:19–20 thrust — "say not thou, I shall be hidden from the Lord… his eyes are upon the ways of every man, and he seeth into secret places.")*
What's done in the dark comes to the light. Better to be seen by a brother now than exposed at the throne later.

> Note: apocryphal citations (Sirach) included per your direction. We'll label them as Sirach so users know the source.

## 2. Demo copy — gender-neutral pronoun (`src/routes/demo.tsx`)

Line 175: `"…pinged when he misses or breaks the fast."` → `"…pinged when they miss or break the fast."` Sweep `src/routes/` and `src/components/` for stray "he misses / she misses."

## 3. Gender capture — Male/Female, copy stays neutral

**Why now** (per your reasoning): future pairing for users without a watchman; same-gender pastoral fit; cheap now, painful to backfill later.

**Migration**: add `gender text` to `public.profiles` with CHECK `gender in ('male','female')`, nullable.

**Onboarding** (`src/routes/onboarding.tsx`): required two-button choice — **Male** / **Female**. Helper: *"This is how the Father made you. We use it for pairing and pastoral fit, not for public display."*

**Settings** (`src/routes/settings.tsx`): editable radio.

**Existing users**: soft prompt on `/dashboard` first visit until set; dismissible to settings.

User-facing copy stays gender-neutral everywhere ("they," "watchman" as role).

## 4. Watchman relationship tag

**Migration**: add `relationship text` to `public.path_watchmen`, nullable. Free string capped at 24 chars; UI offers presets but allows custom.

Presets: **Dad, Mom, Brother, Sister, Husband, Wife, Son, Daughter, Pastor, Friend, Mentor, Other**.

**Where it shows**:
- Path detail Watchmen panel — `"Dad · alex@email.com"`.
- Partner page — *"Walking with: Brother"* under the path owner's name.
- Invite flow — owner picks relationship when sending the invite (optional).

Role term **"watchman" stays unchanged.** Relationship is the closeness tag.

## 5. Referrals — share link + quiet ledger

**Migration**: `public.referrals` (`referrer_id`, `referred_user_id` nullable, `code text unique`, `created_at`, `claimed_at`). Standard GRANTs, RLS scoped to referrer.

**`handle_new_user` update**: if `raw_user_meta_data->>'ref'` matches a code, stamp `referred_user_id` + `claimed_at`.

**Server fns** (`src/lib/referrals.functions.ts`):
- `getMyReferralCode()` — get or create.
- `getMyReferralLedger()` — `{ invited, walking }`.

**UI** — card on `/dashboard` and `/settings`:
- Headline: **"Call someone to the wall."** *(gender-neutral — replaces "Bring a brother…")*
- Sub: *"Not as your watchman — as someone walking their own path. If they become your watchman later, that's the Lord's doing."*
- Copy-link button → `/?ref=CODE`.
- Ledger: *"You've invited **N** · **M** are walking."*

Landing page captures `?ref=CODE` to `localStorage` and passes through signup metadata. No banner.

*(Internal: future surprise appreciation reads from `referrals.claimed_at`. Not user-facing.)*

## 6. Watchman micro-prompt after first encouragement

**Migration**: 
- `public.encouragements` (`watchman_id`, `lane_id`, `owner_id`, `body`, `created_at`). RLS: watchman + lane owner read own; watchman insert when active on lane.
- `profiles.dismissed_watchman_prompt boolean default false`.

**Server fn**: `sendEncouragement({ laneId, body })` — verifies active watchman, inserts row + a `notifications` row (type `encouragement`) so the owner sees it.

**Partner page UI** (`src/routes/partner.tsx`):
- Each active lane card: small "Send encouragement" textarea (280 chars) + Send.
- After the watchman's **first** encouragement, one-time card above assignments — **only if the watchman has zero active lanes of their own**:
  - *"You just held someone up. The watch goes both ways — start your own path when you're ready."*
  - **Start a path** → `/lanes/new` · **Not now** → sets `dismissed_watchman_prompt = true`.
- If the watchman already walks their own paths, suppress the micro-prompt entirely (they don't need the nudge).

## Files touched

- `src/routes/index.tsx` — 2 FAQ items, `?ref=` capture, referral card surface.
- `src/routes/demo.tsx` — pronoun fix.
- `src/routes/onboarding.tsx`, `src/routes/settings.tsx` — gender field, dashboard soft prompt for existing users.
- `src/routes/dashboard.tsx` — referral card, gender soft prompt.
- `src/routes/lanes.$id.tsx`, `src/routes/lanes.new.tsx` — relationship tag on watchman invite + display.
- `src/routes/partner.tsx` — relationship label, encouragement send UI, one-time micro-prompt.
- `src/lib/api.functions.ts` — gender on profile, relationship on watchman, `sendEncouragement`, extended `getPartnerView` (with `myActiveLaneCount` for micro-prompt gating).
- New `src/lib/referrals.functions.ts`.
- Migrations: `profiles.gender` + `dismissed_watchman_prompt`, `path_watchmen.relationship`, `referrals` table, `encouragements` table, `handle_new_user` update.

## Out of scope

- Rewards/gift cards (data captured, no UI).
- Push notification on encouragement (uses existing in-app notification row).
- Pairing/matchmaking by gender (data captured for v2).
