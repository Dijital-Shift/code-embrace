# Pass 1 — Quick wins, low risk

Small, contained changes. No database work, no new screens.

## 1. Faster navigation between logged-in pages

Right now every page change refetches from scratch and shows a loading flash, because the data layer treats all data as instantly stale and links don't preload.

- Give the query client sensible defaults: data stays fresh for 45 seconds, no refetch on window focus, one retry.
- Turn on link preloading on intent (hover/tap-down) so a page starts loading before it renders.
- Keep a short preload stale time so preloads are reused instead of discarded.

## 2. Trim redundant timezone lookups

Several server functions each hit the profile table separately for the user's timezone during a single page load. Consolidate to one lookup per request path where the same handler already has the profile row available, leaving behaviour identical.

## 3. Edit button always available on a path

Confirm and keep Edit visible for the life of a path (no time window), matching the styling of the Pause/Archive/Delete row.

## 4. Invite copy

Tighten the watchman invite page wording so it names the path, the person, and what being a watchman actually costs them (a ping when a check-in is missed or breached), with no legacy terminology.

## 5. Breach honesty field minimum

The "What happened? Be honest." field on the check-in page is currently only checked for being non-empty, so a single character passes. Require at least 5 characters before the submit enables, with the button staying visibly disabled until then. Same rule for the pause/archive reason field on the path detail page.

## Technical notes

- `src/router.tsx` — add `defaultOptions.queries` (staleTime 45s, refetchOnWindowFocus false, retry 1) and `defaultPreload: 'intent'`, `defaultPreloadStaleTime: 30_000`.
- `src/lib/day.server.ts` / `src/lib/api.functions.ts` — reuse an already-fetched profile row rather than a second `profiles.timezone` select.
- `src/routes/checkin.tsx` (~line 185) and `src/routes/paths.$id.tsx` (~lines 144-156) — change `!reason.trim()` style guards to a 5-character minimum.
- `src/routes/invite.$token.tsx` — copy only.

Passes 2 and 3 (check-in undo + encouragements, identity/invite flow, demo fixes) stay queued.
