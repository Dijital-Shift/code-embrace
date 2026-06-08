Two parts: (A) the landing-page polish you already approved, (B) three new functional additions.

---

## A. Landing page (`src/routes/index.tsx` + one `<link>` in `__root.tsx`)

1. **Header** — drop the logo image; render "Kingdom Protocol" as a majestic Cinzel display wordmark in gold.
2. **Hero mock** — swap the three generic rows for real biblical paths from `path-templates.ts`: *Meditate on Scripture* (Held), *Pray three times a day* (Held), *Fast — no fried foods, ends Fri* (No check-in).
3. **Whom this is for** — force `grid-cols-2` at every width; "Not for the one who…" gets red border, faint red tint, red ✕ marks, and red-tinted body text so it reads as a warning.
4. **Pricing** — three cards side-by-side at every width (`grid-cols-3`), tighter mobile padding so 414px fits cleanly.
5. **Footer** — remove "shipping May 2026"; remove redundant small logo+text pair; place a large readable logo image (h-20) centered above the "Built by Dijital Shift · v1.0" line.
6. **Font load** — add Cinzel `<link>` to the existing fonts block in `src/routes/__root.tsx`.

---

## B. New scope from this message

### B1. Path notes (your "fried foods" example)
Personal-but-watchman-visible note attached to a path. Surfaced everywhere the path appears.

- **DB migration** — add `notes text` (nullable, max ~500 chars) to `public.lanes`.
- **Create path** (`src/routes/lanes.new.tsx`) — add a *Notes (optional)* textarea below title/description with helper text "Anything your watchman should know — e.g. 'no fried foods', 'ends Friday 6pm'."
- **Path detail** (`src/routes/lanes.$id.tsx`) — render notes block under the scripture, styled like a sticky note (`border-l-2`, muted gold).
- **Watchman view** (`src/routes/partner.tsx`) — show notes inline on each path card so the watchman sees context without asking.
- **Demo scene 2** (`src/routes/demo.tsx`) — add the notes line to the mock so the example reads "Fast · notes: no fried foods · ends Fri 6pm."
- **Server fn** — extend `createPath`/`updatePath` in `src/lib/api.functions.ts` to accept/persist `notes`.

### B2. Two watchmen per path (restore original vision)
Current schema: one `partner_id` column = one watchman max. That's why the demo copy currently says "One watchman max." Fix:

- **DB migration** — new `public.path_watchmen` join table (`path_id`, `watchman_id` or `watchman_email` for pending invites, `status`, `created_at`). Unique on `(path_id, watchman_email)`. Enforce max 2 active rows per `path_id` via trigger. Keep existing per-watchman cap (2 active paths per person) ported to the new table.
- **Backfill** — copy existing `lanes.partner_id` / `partner_email` rows into `path_watchmen` so nothing breaks; leave the old columns in place for one release as a safety net.
- **Code sweep** — `lanes.new.tsx` lets you invite up to 2 watchmen; `lanes.$id.tsx` `WatchmenPanel` lists both, lets you remove either; `partner.tsx` already works per-watchman row; invite token flow unchanged (one token per row).
- **Copy** — kill every "one watchman max" / "one watchman per path" string across `demo.tsx`, `index.tsx` FAQ, `how-it-works.tsx`. Replace with "up to two watchmen per path."
- **Push** — when a breach fires, ping all active watchmen on that path, not just one.

### B3. Streak model — falls don't reset (Proverbs 24:16)
You're right, zeroing the counter is demoralizing and unscriptural. New model:

- **No reset.** Track `days_held` and `days_breached` independently over the path's lifetime. A breach increments breached, never decrements held.
- **Display** on dashboard + path detail + demo scene 11:
  - Big number: `days_held` ("days standing")
  - Small number beside it: `days_breached` ("days fallen")
  - Ratio line: "12 standing · 2 fallen — still rising."
- **Scene 11 (`MockPathComplete` / breach scene in `demo.tsx`)** — add the verse callout:
  > *"For a just man falleth seven times, and riseth up again."* — Proverbs 24:16 (KJV)
- **Implementation** — no schema change needed; both counts derive from existing `checkins` rows (`status='held'` vs `status='breach'`). Add a small `getPathTotals(pathId)` server fn used by dashboard, detail, and partner views.
- **Remove** any "streak broken" / "starting over" language from `checkin.tsx` and `dashboard.tsx`.

---

## Order of operations
1. Migration for `lanes.notes` + new `path_watchmen` table (one migration, awaits your approval).
2. Landing-page edits (A1–A6) — pure presentation, ship immediately after migration approval since they don't depend on it.
3. Server fns + UI for notes (B1).
4. Watchman fan-out across create / detail / partner / push / copy (B2).
5. Streak rewrite + Proverbs 24:16 callout (B3).

No Paddle work, no other route restructure, no design system overhaul in this pass.
