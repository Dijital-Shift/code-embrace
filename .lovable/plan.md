# Premium pass: Dashboard, then Path page

Two parts, done in order. Same dark/gold look, no new colors, no new words — Held / Breach / Silent / Sabbath / Open stay as they are.

## Part 1 — Dashboard

**1. Today's progress bar (top of the page, under the greeting)**
- A thin segmented bar, one segment per active path.
- Each segment fills with that path's color for today: green Held, red Breach, gold Sabbath, dim Open.
- Under it, one quiet line: "2 of 3 held tonight" or "All held. Stay aligned."
- This replaces the plain "X paths need attention" text inside the gold card; the Check In button stays, one line.

**2. Path cards get life**
Each active path row keeps its title and today's status chip, and adds:
- **Days Standing** — a small number on the left under the title (e.g. "14 standing"), taken from the same count the Path page already shows.
- **Watchman pips** — one or two small gold dots on the right showing who's watching (filled = active, outlined = invite pending). No dots = small "No Watchman" note in gold.
- A soft gold left edge on any path still Open tonight, so the eye goes straight to what's left.
- Tap feel: slight press-in on touch, gold border on hover (desktop).

**3. Quiet polish**
- Section label "Active Paths" gets a fine gold rule beside it.
- Loading state becomes shaped placeholder cards instead of the word "Loading…".
- Watchman-word banner and Call to the Wall card unchanged.

## Part 2 — Path page

**1. Standing / Fallen header**
- Two large numbers side by side (green Standing, red Fallen) with Proverbs 24:16 (KJV) beneath, as today, but larger and centered in the glowing gold card.
- A small line: "Since [start date] · [N] days walked".

**2. Lineage timeline (replaces the 14-day list)**
- A row of 14 small squares, oldest left to newest right, each colored by status. Days before the path existed are not shown.
- Tapping a square opens a small panel under the row: date, status word, and the breach note if there was one.
- Below it, "Show full history" expands the existing list view for anyone who wants detail.

**3. Order stays the same**
Title/type, verse, Standing/Fallen, timeline, encouragements (collapsed), details/Watchmen, actions.

## What does not change
- No database changes. No change to how days are counted, escalation, payments, or Watchman alerts.
- Resting (expired) members still see everything read-only.
- Scripture shown is only what's already in the app (Proverbs 24:16, KJV).

## Technical notes
- Dashboard: extend `getDashboard` in `src/lib/api.functions.ts` to return per-lane standing count and watchman seat states (active/pending) from `path_watchmen`; render in `src/routes/dashboard.tsx` using `statusColor` from `src/lib/status.ts`.
- New small components: `DayProgressBar`, `WatchmanPips`, `LineageTimeline` under `src/components/`.
- Path page: `src/routes/paths.$id.tsx` swaps the 14-day list for `LineageTimeline`, keeping the list behind a toggle; uses the history data the page already loads.
- Skeleton loaders reuse `kp-card` styling; status colors from `status.ts` only.
- Verify with a mobile-width screenshot of both pages after each part.
