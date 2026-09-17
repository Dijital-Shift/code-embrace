# Subtle inline Undo for check-ins (today and yesterday)

## Problem

- Confirming a path for **yesterday** gives no Undo at all: the client only enables
  Undo when `day === "today"` (`PathRow.send` in `src/routes/checkin.tsx`). Worse,
  once yesterday's row is written, the path leaves the "Yesterday" list entirely
  (it becomes a normal pending "Today" path), so the confirmation vanishes with
  no way to undo a mis-click.
- Today's Undo is a full-width green block under the row — too heavy when there
  are several paths. The user wants a subtle inline link.

The server side is already correct: `revertComplete` (`src/lib/api.functions.ts:442`)
looks at both today's and yesterday's completed rows, picks the newest, enforces
the 30-minute window, and deletes it. Only the check-in page needs changes.

## Changes — `src/routes/checkin.tsx` only

1. **Yesterday's logged entries stay visible.** In `CheckIn`, build a
   `yesterdayMap` from `checkins` (rows where `checkin_date === data.yesterday`).
   Yesterday's completed/breached entries render in the existing "Logged"
   section (labeled with a small "Yesterday" tag), using the same `LoggedRow`
   pattern already used for today — so Undo survives a refresh there too.

2. **Subtle inline Undo replaces the block.** In both the transient result state
   of `PathRow` and `LoggedRow`, remove the full-width undo banner and put a
   small "Undo" text link inline next to the status label — muted gold
   (`#c9a84c`), small text, underlined, with `title="You have 30 minutes to undo"`
   and an aria-label. No extra rows, no banners; it takes no vertical space in a
   long list.

3. **Undo enabled for yesterday confirmations.** `PathRow.send` sets `canUndo`
   for `aligned` on either day (not just today). The transient result row shows
   the same subtle inline Undo; once the query refreshes, the entry moves to the
   Logged section (yesterday) where the 30-minute Undo link continues.

4. **No change to the 30-minute rule or to breach/skip behavior.** Undo remains
   for "Held/Did it" completions only; `revertComplete` is untouched.

## Verification

- `npx tsgo --noEmit` clean; build log shows `build OK`.
- Playwright against `/checkin`: confirm a path for yesterday → subtle inline
  Undo link appears → tap it → path returns to the "Yesterday" list; same flow
  for today including after a page refresh.
