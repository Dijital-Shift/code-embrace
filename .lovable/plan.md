## Logo decision

Use **`kingdom-protocol-logo.png`** (the squarer one with throne-mark above the wordmark). It's the more commanding composition — circular throne emblem reads strongly at large sizes, and the "KINGDOM / PROTOCOL" wordmark sits underneath as one unified mark. The other file is the same art cropped tighter, which loses presence when scaled up.

## Plan

### 1. Install the real logo
- Copy `user-uploads://kingdom-protocol-logo.png` to:
  - `src/assets/kingdom-protocol-logo.png` (imported by React)
  - `public/kingdom-protocol-logo.png` (PWA / OG share)
- Remove the old generated `logo-full.png` from `src/assets/` and `public/` so we don't ship a stale wordmark.
- Update `manifest.json` icons + `__root.tsx` favicon/og:image to point at the new file.

### 2. Make it big & commanding on the homepage
In `src/routes/index.tsx`:
- Drop the `<p>Behavioral Accountability for the Kingdom-Minded</p>` tagline directly under the logo (it duplicates the wordmark).
- Replace `<img className="w-72 ...">` with a hero treatment:
  - `w-[clamp(280px,60vw,460px)]` — large on desktop, dominant on mobile
  - Soft gold radial glow behind it (already partially there — tighten it to sit behind the mark, not above the page)
  - Subtle drop-shadow (`filter: drop-shadow(0 0 40px rgba(201,168,76,0.35))`) so the gold pops on the near-black bg
- Keep the Ecclesiastes 4:9–10 verse and CTAs below, but tighten spacing so the logo owns the top half of the viewport.

### 3. End-to-end smoke test (so you can onboard people today)
Walk the live preview:
1. `/` — new logo renders crisp, large, glowing
2. `/login` — sign up a fresh test account
3. `/onboarding` — display name + timezone save
4. `/lanes/new` — create a lane with partner email + schedule
5. `/checkin` — submit a check-in
6. `/partner` — view assignments
7. `/settings` — push subscribe works (VAPID), notification toggle persists
8. Server fns return 200 with auth header injected; console + network clean

Fix anything that fails before reporting.

### 4. Free cron (no $)
Use Lovable Cloud's built-in **`pg_cron` + `pg_net`** (zero cost, already enabled). One SQL migration schedules:
- `*/15 * * * *` → `/api/public/hooks/missed-checkins`
- `*/15 * * * *` → `/api/public/hooks/escalate-missed`
- `0 * * * *` → `/api/public/hooks/bedtime-reminder` (handler filters by user-local bedtime)

I'll add a shared `CRON_HOOK_SECRET` header check on the public hooks (auto-generated, no action from you) so the URLs can't be abused. No external scheduler, no recurring cost.

### 5. Report back
Pass/fail per smoke-test step, plus a green light to start adding people — or any issues found with fixes already applied.