# One vocabulary for status, everywhere

Right now four different word sets describe the same day. This locks in one.

## The lexicon

Path types stay as they are: **Complete** (do it) and **Avoid** (don't do it). Those are what a path *is*, not how a day went.

A day's status becomes one of these, on both path types:

| State | Word | Color |
|---|---|---|
| Kept it | **Held** | green |
| Admitted failure | **Breach** | red |
| No check-in, grace window closed | **Silent** | amber |
| Sabbath skip | **Sabbath** | gold (unchanged) |
| Not yet checked in today | **Open** | dim |

"Done", "Pending", "Aligned", "No check-in", and "Missed" all disappear from visible copy. Database values (`completed`, `breached`, `missed`, `skipped`) stay untouched — this is a display layer change only.

## Where it changes

- **Dashboard** — path rows read Held / Open instead of Done / Pending.
- **Check-in screen** — the Avoid buttons become "Yes — held" and "No — breach"; submitted states read "Held" and "Breach reported"; the late banner reads "Silent Yesterday — Submit Before 10AM" (also fixes the wrong 7AM time currently shown).
- **Path detail** — history rows use the same five words.
- **Homepage mock** — already says Held; the second row's "No check-in" becomes "Silent" and the summary line becomes "1 silent path".
- **Demo screens** — "Done" becomes "Held", "Aligned" becomes "Held", the watchman alert copy keeps "silent" wording.
- **Notifications** — the day-1 user push and the day-2 watchman push are reworded to use Silent/Held consistently.

## Streak counters on the real dashboard

The demo shows Days Standing / Days Fallen; the real app has nothing. Adding it:

- Server: `getDashboard` returns a per-user count of held days and fallen days (breach or silent) over the life of the account.
- Dashboard: a two-number block above Active Paths, green Standing and red Fallen, with the same "still rising" line the demo uses, plus the Proverbs 24:16 framing.
- A breach never zeroes the standing count — both numbers just accumulate, as designed.

## Who sees what (documenting the current behavior, unchanged)

- **You** see Open / Held / Breach / Silent / Sabbath on your own screens.
- **Your watchman** sees nothing day to day. They are pinged only on a breach you report, or on the second consecutive silent day. They never see "open" or a single missed night.

## Technical notes

Files touched: `src/routes/dashboard.tsx`, `src/routes/checkin.tsx`, `src/routes/paths.$id.tsx`, `src/routes/index.tsx`, `src/routes/demo.tsx`, `src/routes/how-it-works.tsx`, `src/lib/escalation.server.ts` (push copy only), and `src/lib/api.functions.ts` (add streak counts to `getDashboard`). A small shared status-label helper keeps the mapping in one place so it can't drift again. No migration, no schema change.
