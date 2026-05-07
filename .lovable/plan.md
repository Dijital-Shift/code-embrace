## What I found in the repo

**Kingdom Protocol** — a Next.js 15 (App Router) + Supabase behavioral accountability app. Solid scope, all coexisting with the TanStack Start scaffold right now (which won't run as-is — `app/` and `src/routes/` both claim `/`).

Inventory:
- **Pages** (`app/`): landing, login, register, onboarding, how-it-works, dashboard, checkin, lanes (list/new/[id]/edit), partner (+ how-it-works), settings, admin (users/notifications)
- **Server actions** (`lib/*/actions.ts`): checkin, lanes, profile, admin, supabase auth — heavy use of `'use server'`
- **API routes**: 4 cron endpoints + push subscribe/unsubscribe
- **Middleware**: Supabase auth + redirect rules for protected paths
- **Supabase**: 8 migrations (profiles, lanes, push_subscriptions, partner invites, scripture, etc.) + RLS expected
- **Other**: Web Push (VAPID), Resend invite emails, PWA manifest, Inter via `next/font`

Inline-style design system (no Tailwind classes used in the Next.js code) — gold `#c9a84c` on near-black `#0a0800`, dark UI throughout. We'll preserve this look.

## Strategy

This is a full Next.js → TanStack Start port, not a copy-paste. I'll do it in **phases** and validate the build at each step so we don't pile up errors.

### Phase 1 — Foundation & cleanup
- Delete the placeholder `src/routes/index.tsx` content (will be replaced by real landing).
- Move `app/globals.css` styles into `src/styles.css` (preserve fonts, theme color, etc.).
- Load Inter via `<link>` in `__root.tsx` head (replace `next/font`).
- Update `__root.tsx` meta: title "Kingdom Protocol", description, theme-color, manifest link, apple-web-app tags.
- Copy `public/` assets (logo, manifest, icons, service worker if any).
- Enable **Lovable Cloud** (provisions Supabase — DB, Auth, Storage, secrets).
- Add secrets to Cloud: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT_EMAIL`, `CRON_SECRET`, `ADMIN_EMAILS`, `RESEND_API_KEY`, `APP_URL`. (Supabase URL/anon/service keys are auto-wired by Cloud.)

### Phase 2 — Database
- Run the 8 SQL migrations (`supabase/migrations/001-008`) against Lovable Cloud as a single migration so RLS, tables, triggers, and seed data land intact.
- Verify RLS policies on every table (security scan).

### Phase 3 — Supabase client layer
Replace `lib/supabase/{client,server,actions}.ts` with the Lovable Cloud auto-generated clients:
- Browser: `@/integrations/supabase/client`
- Server (auth-aware): `@/integrations/supabase/auth-middleware`
- Service role: `@/integrations/supabase/client.server`

Drop `@supabase/ssr` and `next/headers` cookie plumbing — the auth middleware handles it.

### Phase 4 — Routing port (`app/` → `src/routes/`)
Convert each Next.js page to a TanStack route file using flat dot-separated names. Route groups `(auth)` / `(dashboard)` become layout routes.

| Next.js | TanStack Start |
|---|---|
| `app/page.tsx` | `src/routes/index.tsx` |
| `app/(auth)/login/page.tsx` | `src/routes/login.tsx` |
| `app/(auth)/register/page.tsx` | `src/routes/register.tsx` |
| `app/(dashboard)/layout.tsx` | `src/routes/_authenticated.tsx` (parent layout w/ Outlet) |
| `app/(dashboard)/dashboard/page.tsx` | `src/routes/_authenticated.dashboard.tsx` |
| `app/(dashboard)/checkin/page.tsx` | `src/routes/_authenticated.checkin.tsx` |
| `app/(dashboard)/lanes/page.tsx` | `src/routes/_authenticated.lanes.index.tsx` |
| `app/(dashboard)/lanes/new/page.tsx` | `src/routes/_authenticated.lanes.new.tsx` |
| `app/(dashboard)/lanes/[id]/page.tsx` | `src/routes/_authenticated.lanes.$id.index.tsx` |
| `app/(dashboard)/lanes/[id]/edit/page.tsx` | `src/routes/_authenticated.lanes.$id.edit.tsx` |
| `app/(dashboard)/partner/page.tsx` | `src/routes/_authenticated.partner.index.tsx` |
| `app/(dashboard)/settings/page.tsx` | `src/routes/_authenticated.settings.tsx` |
| `app/admin/*` | `src/routes/_admin.*.tsx` (admin gate in `beforeLoad`) |
| `app/onboarding/page.tsx` | `src/routes/_authenticated.onboarding.tsx` |
| `app/how-it-works/page.tsx` | `src/routes/how-it-works.tsx` |

Auth gating: `_authenticated.tsx` uses `beforeLoad` to redirect unauthenticated users to `/login` (replaces `middleware.ts`). `_admin.tsx` checks `ADMIN_EMAILS`. After login, redirect to `/dashboard`.

Imports swap: `next/link` → `Link` from `@tanstack/react-router`; `next/navigation` (`useRouter`, `useParams`, `useSearchParams`) → TanStack equivalents; `next/image` → plain `<img>`; remove `'use client'` directives.

### Phase 5 — Server actions → `createServerFn`
Convert every `lib/*/actions.ts` function to `createServerFn` in `*.functions.ts` files (client-safe path), with Zod validators and the Supabase auth middleware. Components use `useServerFn` + TanStack Query mutations instead of `useTransition`.

### Phase 6 — API routes & cron
- `app/api/push/subscribe/route.ts` → `src/routes/api/push/subscribe.ts` (TanStack server route, signature unchanged)
- `app/api/cron/*` → `src/routes/api/public/cron/*.ts` (Cloud Workers cron-callable, verify `CRON_SECRET` header)

### Phase 7 — Notifications & emails
- **Web Push**: `web-push` npm package is Node-only and won't run on Cloudflare Workers. Swap to native `crypto.subtle` with VAPID JWT signing, or call an external push relay. I'll use a Worker-compatible implementation.
- **Resend**: works via fetch — keep it, just read `RESEND_API_KEY` from `process.env` inside `.handler()`.
- **PWA service worker**: copy `public/sw.js` (or generate one) — TanStack Start serves `public/` directly.

### Phase 8 — Cleanup, build, verify
- Delete `app/`, `lib/supabase/`, `middleware.ts`, `components/` (after migrating to `src/components/`).
- Remove Next.js deps (`next`, `@supabase/ssr`, etc.); keep what's already in `package.json` (already has TanStack Start + shadcn deps).
- Run typecheck/build, fix what surfaces.
- Visit each route, confirm auth flow, RLS, push subscribe, cron endpoint signature check.

## Heads-up

- **This is a large port** — expect multiple iterations and some manual QA from you (especially the partner-invite + push notification flows).
- **Web Push on Cloudflare Workers** is the riskiest piece; I'll validate it works before declaring done.
- **Inline-style design** is preserved as-is (it works fine in TanStack Start — no Tailwind conversion needed unless you want one later).
- I'll **keep your git history intact** by working incrementally; nothing destructive.

## What you should do next

1. Approve this plan.
2. I'll start with Phase 1 (foundation + Cloud enable) and check in before moving to Phase 2 migrations.
