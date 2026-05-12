## Scope: open up early access on the landing page

Flip the landing from "waitlist coming soon" to "free early access, sign up now." No billing, no trial logic, no expiry. Landing copy + CTA only — product code stays as-is.

### 1. Hero / top of `src/routes/index.tsx`
- Remove or replace the "v1.0 · shipping May 2026" eyebrow with: `Early access · free while we pair the first cohort`
- Primary CTA: change from waitlist language to `Start free` → links to `/login`
- Secondary CTA (if present): `How it works` → `/how-it-works` (unchanged)

### 2. Pricing section
- Section subhead: add one line under the existing subhead:
  *"Free for everyone during early access. Paid tiers unlock when billing goes live — no card needed today."*
- All three tier CTAs: swap `disabled` "Join the waitlist" buttons for active `Start free` links to `/login`
- Keep the tier cards, prices, and feature lists exactly as they are — they describe the future paid structure, which is fine

### 3. FAQ
- Add one new accordion item at the top:
  - Q: *"Is it really free?"*
  - A: *"Yes. During early access every tier is free — no card, no trial timer. When billing turns on, you'll get notice before anything changes."*
- Existing items unchanged

### 4. ClosingCall
- If the final CTA still says "Join the waitlist," change to `Start free` → `/login`
- Leave the Galatians quote and centered layout alone

### Out of scope
- Stripe / Paddle / any billing wiring
- Trial timers, expiry dates, usage caps
- Onboarding flow changes, dashboard changes, product code
- The `app/` vs `src/routes/` migration question — separate task
- Auth itself — already works via `/login`

### Technical notes
- All edits in `src/routes/index.tsx`
- CTAs use TanStack `<Link to="/login">` (already imported in that file)
- No new dependencies, no new routes, no schema changes
