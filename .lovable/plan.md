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

## 3. "Tap to send encouragement" hint (Watch page)

Collapsed assignment cards give no sign that opening one lets you write. Add
a small muted gold line under the assignments heading:
"Tap a path to send encouragement." — plus, on each collapsed card, the
"Open" caption becomes "Tap to encourage" so the affordance is obvious
without adding a second line of chrome.

## 4. Path page reorder — `src/routes/paths.$id.tsx`

New section order:

1. Header — path title (with type/status line)
2. Proverbs 24:16 verse — moved from last to directly under the header
3. Standing / Fallen counter with the breach · silent breakdown — at-a-glance,
   no scrolling
4. Last 14 Days list
5. Encouragements received — thin collapsed rows, tap to expand, matching the
   `PathCategoryAccordion` pattern; the unread "New" badge and the
   IntersectionObserver read-tracking still work (a row counts as seen when
   expanded or when visible, so nothing is silently marked read)
6. Path details card (description, scripture, notes, ends-at) + Watchmen panel
   with tightened spacing
7. Pause / Archive / Edit / Delete at the bottom

The "Path created" banner stays near the top while `newlyCreated` is set.

## Verification

- `npx tsgo --noEmit` clean; build log `build OK`.
- Playwright on `/checkin`: confirm yesterday + today + Sabbath, inline Undo
  appears, undo restores each; refresh persistence.
- Playwright on `/paths/$id` and `/partner` at 414px: section order, collapsed
  encouragement rows, condensed alert groups, and the encouragement hint.

