# Inline Undo (all responses) + condensed alert history

## 1. Subtle inline Undo — today, yesterday, and Sabbath

### Problem

- Undo only appears for **today's** "Held/Did it" confirmation. Confirming
  yesterday's path (or skipping for Sabbath) gives nothing: `PathRow.send`
  only enables Undo when `day === "today"`, and `revertComplete` only matches
  `completed` rows. Once yesterday's row is written, the path also leaves the
  "Yesterday" list entirely, so there's nowhere to undo a mis-click.
- Today's Undo is a full-width green block under the row — too heavy with
  several paths. The ask: a subtle inline link instead.

### Changes

- **Server** — `revertComplete` in `src/lib/api.functions.ts` already resolves
  the right day (today or yesterday); extend its status filter from
  `completed` only to `('completed', 'skipped')` so a Sabbath skip can be
  undone too. Same 30-minute window, same delete. No watchman notification on
  undo (it's a mis-click fix, mirroring today's behavior).
- **`src/routes/checkin.tsx`**:
  - Replace the full-width undo banner with a small inline "Undo" text link
    next to the status label — muted gold (`#c9a84c`), underlined, small,
    `title="You have 30 minutes to undo"`. No extra vertical space.
  - `PathRow.send` sets `canUndo` for `aligned` on either day.
  - Skip rows (Sabbath) also show the inline Undo for 30 minutes.
  - Build a `yesterdayMap` from `checkins` so yesterday's completed entries
    stay visible in the "Logged" section (tagged "Yesterday") with the same
    inline Undo — Undo survives a refresh for both days.

## 2. Condensed Alert History (Watch page)

`src/routes/partner.tsx` Alert History currently renders one card per alert
with the full message text — repeated "Missed" cards stack into a wall.

- **Counter at the top**, in the path-page style: e.g. `4 silent · 1 breach`
  totals across the history.
- **Group alerts by path**: one condensed line per path —
  `Worship · Justin — 4 silent, last Sep 15` — with an "Open" toggle that
  reveals the individual alert cards for that path (current styling kept).
  "Show all" behavior stays, scoped inside the expanded path.

## 3. Path page order — confirmation

Current order on `/paths/$id` (verified): path details card → encouragements
received → Watchmen panel → action buttons (Pause / Archive / Delete / Edit)
→ Standing/Fallen counters with breach/silent breakdown → Last 14 Days list →
Proverbs 24:16. If you want a different order, say so and it goes in this plan.

## Verification

- `npx tsgo --noEmit` clean; build log `build OK`.
- Playwright on `/checkin`: confirm yesterday + today + Sabbath, inline Undo
  appears, undo restores each; refresh persistence. Watch page: condensed
  groups + counter render and expand.
