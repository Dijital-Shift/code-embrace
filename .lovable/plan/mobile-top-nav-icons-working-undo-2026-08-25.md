# Mobile top nav (icons) + working Undo

## 1. Mobile navigation — icon bar at the top, no hamburger

The old bottom bar broke because the items were plain links in a flex column
with no fixed positioning, so they stacked down the middle of the page and only
the top one was tappable. Rather than repair that, put navigation at the top
where the wordmark already lives.

New mobile header (replaces the hamburger entirely):

```text
 ◆ Kingdom Protocol
 ─────────────────────────────────────
 [🏠]  [◎]  [✓]  [👁]  [⚙]
 Home  Paths Check Watch Settings
```

- One row, `display: grid` with 5 equal columns, each cell a full-height tap
  target (min 48px tall, full column width) — no stacking, every item tappable.
- Icons from lucide (Home, Route, CircleCheck, Eye, Settings) with a tiny
  10px label under each, gold `#c9a84c` when the route is active, muted
  `#9e968a` otherwise, plus a 2px gold underline on the active item.
- Sticky to the top so it stays reachable while scrolling.
- Hamburger, the drop-down menu, and its open/close state are removed.
- Sign Out moves into Settings (it already lives there); desktop top nav is
  untouched.

## 2. Undo doesn't work

Two real causes:

- When you were silent yesterday, the check-in is written against **yesterday's**
  date, but Undo only looks for a completed check-in dated **today**, so it
  returns "No completed check-in for today." Undo will look up the same
  target day the check-in used (yesterday if a missed row exists, else today).
- Undo only appears in the transient state right after tapping the check. Once
  the page refreshes or you come back later, the row moves to "Logged" and the
  button is gone even though you are still inside the 30 minutes.

Fixes:

- Server: `revertComplete` resolves the same day the submit used, matches
  `completed` on that day, and uses a non-throwing lookup so a missing row
  returns a clean message instead of an error.
- Check-in page: rows in the "Logged" section show the Undo button whenever the
  logged entry is `completed` and less than 30 minutes old, so Undo survives a
  refresh.
- Undo returns the row to its pending state and refreshes dashboard + check-in
  data.

## Technical notes

- `src/components/AppLayout.tsx` — replace mobile top bar + hamburger block with
  a grid icon nav; use `useRouterState().location.pathname` for active state.
- `src/styles.css` — keep the `.nav-mobile-top` / `.nav-desktop-bar` breakpoint
  switch; add sticky positioning for the mobile header.
- `src/lib/api.functions.ts` — `revertComplete`: reuse the yesterday/today
  target resolution from `submitCheckin`, swap `.single()` for `.maybeSingle()`.
- `src/routes/checkin.tsx` — surface Undo in the "Logged" list based on
  `completion_time` age; `getCheckinPage` already returns `completion_time`
  (add it to the select if missing).
