# Three fixes: encouragement link, check-in confirmation, alert names

## 1. "Words from your watchman" goes nowhere useful

Confirmed: the dashboard banner links to the paths list, with no indication of which path holds the word. With several paths that's a guessing game.

Fix:
- The dashboard now knows which paths have unread words, not just how many.
- One path with an unread word: the banner opens that path directly, and names it — "A word from your watchman on Worship."
- More than one: the banner still opens the paths list, but every path with an unread word carries a gold "New" mark, so it's obvious where to go.

## 2. Check-in page — yesterday's missed path

Confirmed working as intended. The check-in page builds its list from two things: today's paths, and any path with no entry at all for yesterday (only for paths that already existed yesterday). It does not wait for the 10 AM sweep to write anything.

- Before 10 AM local, yesterday appears under "Yesterday — Submit Before 10AM".
- After 10 AM it appears under "Yesterday — Went Silent".

Nothing to change here. If a specific path ever fails to appear, it means an entry already exists for it yesterday (held, breach, silent, or Sabbath).

## 3. Watch page alert history shows a name on some rows, an email on others

Confirmed cause, from the actual stored alerts:

```text
Sep 11  Jamae has gone silent on "Worship"...
Sep 10  jamaealetha.music16@gmail.com has gone silent on "Worship"...
```

The alert sentence is written once, at the moment the alert fires, and stored as frozen text. Those older rows were written before that person's first name existed on their account, so they permanently say the email. It is not two people and nothing changed on her phone.

Fix:
- The watch page builds each alert line at display time from the path and the person's current name, so history reads consistently and updates if a name changes later. Stored text is used only if a line can't be rebuilt.
- Same treatment for new alerts going forward.
- One-time cleanup of the existing stored lines so any push or email replay reads with the name too.

## Technical notes

- `getDashboard` returns unread encouragement counts grouped by `lane_id`; the banner links to `/paths/$id` for the single case, and `paths.index.tsx` renders a "New" badge from the same data.
- `partner.tsx` renders alert rows from `{ type, lane title, owner first name }` joined off `notifications.lane_id`, falling back to `message_content`.
- `escalation.server.ts` keeps writing `message_content` (needed for push/SMS), so no behavior change there beyond the existing name-then-email fallback.
- Backfill migration rewrites the email-prefixed `missed_checkin` message rows to use the matching profile first name.
