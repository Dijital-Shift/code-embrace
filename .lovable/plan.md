# Plan: Finish Kingdom Protocol port (Option A)

You picked A: reuse the same VAPID public key for the browser-visible secret and continue the full port.

## Step 1 — Add the missing secret
- Prompt for `VITE_VAPID_PUBLIC_KEY` (paste the same value as `VAPID_PUBLIC_KEY`).
- Confirm all other secrets already present: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAILS`.

## Step 2 — Foundation
- Move `app/globals.css` content into `src/styles.css` (preserve gold `#c9a84c` on near-black `#0a0800`, Inter via `<link>`).
- Update `src/routes/__root.tsx` head meta (title, description, theme-color, manifest, favicon).
- Copy `public/` assets (icons, manifest.json, service worker `sw.js`).
- Replace placeholder `src/routes/index.tsx` with ported landing page.

## Step 3 — Routes (flat dot-naming under `src/routes/`)
- Public: `index.tsx`, `login.tsx`, `register.tsx`, `how-it-works.tsx`, `onboarding.tsx`
- Authenticated layout: `_authenticated.tsx` with `beforeLoad` session gate + `<Outlet/>` and bottom nav
  - `_authenticated.dashboard.tsx`
  - `_authenticated.checkin.tsx`
  - `_authenticated.lanes.tsx`, `_authenticated.lanes.new.tsx`, `_authenticated.lanes.$id.tsx`, `_authenticated.lanes.$id.edit.tsx`
  - `_authenticated.partner.tsx`, `_authenticated.partner.how-it-works.tsx`
  - `_authenticated.settings.tsx`
- Admin: `_authenticated.admin.tsx` (role check via `has_role`), `.admin.users.tsx`, `.admin.notifications.tsx`
- Swap `next/link`→`Link`, `next/navigation`→`useNavigate`/`useParams`, `next/image`→`<img>`.

## Step 4 — Server functions (`src/lib/*.functions.ts`)
- `checkin.functions.ts`, `lanes.functions.ts`, `profile.functions.ts`, `admin.functions.ts`, `partner-invite.functions.ts`
- All protected with `requireSupabaseAuth`, Zod `inputValidator`, RLS-respecting queries.
- Components call via `useServerFn` + TanStack Query.
- `*.server.ts` helpers for escalation, weekly recap, Resend email, web-push signing.

## Step 5 — API routes (`src/routes/api/`)
- `api/push/subscribe.ts`, `api/push/unsubscribe.ts` (auth-gated)
- `api/public/cron/missed-checkins.ts`, `bedtime-reminder.ts`, `escalate-missed.ts`, `weekly-recap.ts` (verify `CRON_SECRET` header; use `supabaseAdmin`)

## Step 6 — Web Push on Worker runtime
- Replace Node `web-push` lib with native `crypto.subtle` VAPID JWT signing (Worker-compatible).
- Resend via `fetch` to `https://api.resend.com/emails`.
- Keep PWA service worker in `public/sw.js`.

## Step 7 — Add admin role
- Migration: create `app_role` enum + `user_roles` table + `has_role()` security-definer function (per project convention; never store roles on profiles).
- Seed admins from `ADMIN_EMAILS` on signup or via one-off insert.

## Step 8 — Verify
- Build passes; auth flow (signup/login/logout) works; lanes CRUD respects RLS; check-in submits; partner view loads; admin gated; cron endpoints return 401 without secret.

## Risks
- Web Push on Cloudflare Workers (replacing Node `web-push`) is the riskiest piece — may need iteration.
- Large port: expect a few follow-up fixes after the first build.

After approval, I'll request `VITE_VAPID_PUBLIC_KEY` first, then execute steps 2–8.
