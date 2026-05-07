## Goal
Port the Kingdom Protocol Next.js app (in `app/`, `lib/`, `components/`, `middleware.ts`) into the TanStack Start template, using Lovable Cloud for backend, web push, and emails — no Node-only deps, no `CRON_SECRET`.

## Secrets to add (one prompt)
- `VITE_VAPID_PUBLIC_KEY` (browser-visible — same value as `VAPID_PUBLIC_KEY`)
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT_EMAIL`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `ADMIN_EMAILS` (comma-separated)

(No `CRON_SECRET`, no `APP_URL` — fallback hardcoded to `https://kingdom-protocol.lovable.app`.)

## Steps

1. **Foundation**
   - Move `app/globals.css` tokens into `src/styles.css` (gold `#c9a84c` on `#0a0800`, Inter via link).
   - Update `src/routes/__root.tsx` head: title, description, theme-color, manifest, favicon.
   - Copy `public/` assets (icons, `manifest.json`, `sw.js`).
   - Replace placeholder `src/routes/index.tsx` with ported landing page.

2. **Routes** (flat dot-naming under `src/routes/`)
   - Public: `index`, `login`, `register`, `how-it-works`, `onboarding`
   - `_authenticated.tsx` layout with `beforeLoad` session gate + bottom nav
     - `dashboard`, `checkin`, `lanes`, `lanes.new`, `lanes.$id`, `lanes.$id.edit`, `partner`, `partner.how-it-works`, `settings`
   - `_authenticated.admin.tsx` (gated via `has_role`), `.admin.users`, `.admin.notifications`
   - Swap `next/link`→`Link`, `next/navigation`→`useNavigate`/`useParams`, `next/image`→`<img>`.

3. **Server functions** (`src/lib/*.functions.ts`)
   - `auth`, `checkin`, `lanes`, `profile`, `admin`, `partner-invite`
   - All gated with `requireSupabaseAuth`, Zod validators, RLS-respecting.
   - Components call via `useServerFn` + TanStack Query.
   - `*.server.ts` helpers: escalation, weekly recap, Resend `fetch`, Worker-native VAPID signing.

4. **API routes** (`src/routes/api/`)
   - `api/push/subscribe.ts`, `api/push/unsubscribe.ts` (auth-gated)
   - `api/public/cron/missed-checkins.ts`, `bedtime-reminder.ts`, `escalate-missed.ts`, `weekly-recap.ts` — public path, gated by checking `apikey` header equals the anon key.

5. **Web Push on Worker runtime**
   - Replace Node `web-push` with `crypto.subtle` VAPID JWT signing (Worker-compatible).
   - Resend via `fetch` to `https://api.resend.com/emails`.
   - PWA `sw.js` stays in `public/`.

6. **Admin role**
   - `app_role` enum + `user_roles` table + `has_role()` already migrated. Seed admins from `ADMIN_EMAILS` on signup via trigger or server fn.

7. **Verify**
   - Build passes; signup/login/logout works; lanes CRUD respects RLS; check-in submits; partner view loads; admin gated; cron endpoints 401 without anon key.

## Risks
- VAPID signing on Workers (replacing Node `web-push`) is the riskiest piece — likely 1–2 follow-up fixes.
- Large port — expect a follow-up pass after first build.
