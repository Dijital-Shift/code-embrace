## Goal

Bring your existing TanStack Start code from GitHub into this blank Lovable project, then enable Lovable Cloud as the backend.

## Steps

### 1. Connect this project to GitHub (you do this)

In the Lovable editor:
- Click the **+** button in the chat input (bottom left) → **GitHub** → **Connect project**
- Authorize the Lovable GitHub App
- Choose the GitHub account/org where the repo should live
- Click **Create Repository** — Lovable creates a fresh repo containing this blank project's code

### 2. Push your existing code into that repo (you do this, locally)

Since Lovable can't import an existing repo directly, you'll overlay your code onto the new one:

```bash
# Clone the new repo Lovable just created
git clone <new-lovable-repo-url> lovable-app
cd lovable-app

# Copy your existing project's source over the top
# (keep Lovable's package.json, vite.config.ts, wrangler.jsonc, tsconfig.json,
#  src/router.tsx, src/routes/__root.tsx, src/start.ts, src/server.ts intact —
#  these wire up the TanStack Start + Cloudflare Worker runtime)

# Commit and push
git add .
git commit -m "Import existing code"
git push
```

Changes sync back into Lovable automatically (two-way sync).

### 3. I review and reconcile (after push)

Once your code is in, I'll:
- Verify routes live in `src/routes/` (flat dot-separated naming, not `src/pages/`)
- Confirm the bootstrap shell is intact (`src/router.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`)
- Check imports use `@tanstack/react-router` (not `react-router-dom`)
- Replace the placeholder index if your code didn't already
- Resolve any duplicate `/` route conflicts
- Run typecheck/build to surface issues

### 4. Enable Lovable Cloud

After the code is verified working, I'll enable Lovable Cloud. This provisions:
- PostgreSQL database
- Auth (email, Google, Apple, etc.)
- File storage
- Server-side secrets

If your existing code already uses Supabase directly, we'll migrate it to use the auto-generated clients at:
- `@/integrations/supabase/client` (browser)
- `@/integrations/supabase/auth-middleware` (authenticated server functions)
- `@/integrations/supabase/client.server` (admin / service role)

And convert any backend calls to TanStack `createServerFn` (no Supabase Edge Functions needed — TanStack Start has its own server runtime on Cloudflare Workers).

## What you should do next

1. Approve this plan
2. Connect to GitHub via the **+** menu
3. Push your code
4. Tell me when it's pushed — I'll take over from step 3

## Heads-up / constraints

- **Server runtime is Cloudflare Workers** (with `nodejs_compat`). Node-only packages (`sharp`, `child_process`, native binaries, `puppeteer`, etc.) won't work server-side. If your code uses any, we'll need to swap them.
- **Don't edit `src/routeTree.gen.ts`** — it's auto-generated.
- **No `.env` files in Lovable** — secrets go through Lovable Cloud's secrets manager.
