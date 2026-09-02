# Seven fixes: silence math, notification noise, and the watch page

## 1. Should silent days count as fallen? — Yes

Current behavior already counts them: Days Fallen = breached + missed. Keeping it is right, and here's the rationale:

The point of the protocol is the walk, not the paperwork. A day you breached and a day you never answered both mean the path was not held. If silence didn't count, silence becomes the cheapest way to protect your number — you'd be rewarded for hiding. That inverts the whole premise ("nowhere to hide"). Proverbs 24:16 counts the fall, not the reason for it, and the man is still just because he rises.

One refinement worth making: on the path page, show the fallen number broken out underneath — "3 fallen · 1 breach, 2 silent" — so the count stays honest without flattening the difference between confessing and disappearing. No change to the totals.

## 2. Duplicate "Silence" notifications

Confirmed cause: two scheduled jobs exist, `kp-missed-checkins` and `kp-escalate-missed`, both running every 15 minutes and both calling the exact same routine. Two jobs, two pushes, same day.

Fix: remove the duplicate job so only one remains. Also add a per-day guard so a watchman can receive at most one silence alert per path per day even if a run overlaps itself.

## 3. Check-in page doesn't show yesterday's unchecked path

Cause: yesterday only appears in the "Silent Yesterday" section if a `missed` row already exists, and that row is only written by the scheduled job after 10:00 AM local. Before 10 AM, yesterday is simply absent — nothing to catch up on, even though the grace window is still open.

Fix: derive the catch-up list from the absence of a check-in rather than from a `missed` row. If yesterday has no entry at all and the path existed yesterday, show it in the catch-up section with the grace deadline stated ("closes at 10:00 AM"). After 10 AM it reads as late instead. Submitting still writes to yesterday's date, as it does today.

## 4. Archived paths are dead weight in Settings

Fix: each archived row gets two actions — Reactivate and Delete.
- Reactivate returns it to active status, subject to the 10 active path cap (clear message if at cap).
- Delete permanently removes the path and its history, behind a confirm dialog that says the history is gone for good.
- Watchman seats are not restored automatically on reactivate; the panel shows empty slots to re-invite.

## 5. Watch page organization for multiple paths

Rebuild `/partner` around people, not a flat stack of cards:

```text
NEEDS YOU (2)          <- breach or silent today, always expanded
  [ Worship · Jamae ]  status, explanation, Call/Text, encourage box
  [ Fast · Marcus ]

QUIET (3)              <- collapsed one-liners, tap to expand
  Prayer · Jamae            Held
  Reading · Marcus          Held
  Purity · Chris            Sabbath

Recent encouragements sent   (collapsed section)
Alert history                (collapsed section, most recent 10)
```

- Cards sort by urgency: breach, then silent, then held/sabbath.
- Encourage box only renders inside an expanded card, so the page isn't a wall of textareas.
- If a watchman has one path, this collapses to essentially today's layout — no regression for the 1:1 case.
- Alert history is collapsed by default and capped, which also fixes the endless repeating list in your screenshot.

## 6. You didn't know an encouragement arrived

Encouragements do send a push, so the likely gap is that push isn't registered on that device — nothing surfaced it in the app either way.

Fix, both ends:
- In-app: unread encouragement count shows as a gold dot on the Home icon and a "New" badge on the path row, so it's visible on next open even if push failed.
- Delivery: show a one-time prompt on the dashboard when push isn't enabled for a user who owns paths, same pattern the watchman prompt already uses.

## 7. Multiple silent paths = one notification, not five

Agreed — no phone flooding.

New rule: the 10 AM sweep sends **one** push per person per day, whatever the path count.
- Owner, one path silent: "Yesterday went silent on Worship." (as today)
- Owner, several: "3 paths went silent yesterday. The grace window has closed." → opens the check-in page.
- Watchman, one: current copy.
- Watchman, several: "Jamae has gone silent on 2 paths, two days running. Reach out." → opens the watch page.

Per-path detail still lands in alert history and on the pages; only the push is bundled.

## Technical notes

- Remove one of the two duplicated pg_cron jobs; keep a single sweep.
- Add a per-day dedup key on silence notifications (path + watchman + date) before push.
- `getCheckinPage` returns a `catchUp` list computed from missing yesterday entries versus path creation date, replacing the missed-row lookup in `checkin.tsx`.
- New server functions `reactivateLane` and hard `deleteArchivedLane`; the existing watchman guard on delete does not apply to archived paths with no active seats.
- Escalation sweep collects per-user results and dispatches one bundled push per recipient at the end of the run instead of one per path.
- Path stats return `breached` and `missed` separately for the fallen breakdown.
