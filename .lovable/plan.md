# Fix the false "Fallen" count and move stats onto each path

## What's wrong today

Confirmed by reading the data and the code:

- The archived path "Meditate on Scripture daily" was created on Aug 20 (UTC), but it has a **missed** check-in stored for **Aug 18** — two days before the path existed. That phantom row is what's making you look "fallen" right after creating a path. The current cron has a guard against this, so this row is leftover history from before that guard existed.
- The dashboard's Standing/Fallen number counts check-ins across **all** paths including **archived** ones, so a stale row on a dead path keeps polluting the headline number.
- Standing/Fallen lives on the dashboard as a tappable card to a separate `/standing` page — you don't want it there.
- Not yet confirmed: your two "held" days were stored with a date one day ahead of your Phoenix local date. I'll verify how the day boundary is being resolved on the server before touching it, and only change it if the check confirms a bug.

## What I'll do

**1. Purge the phantom history**
Delete any check-in dated before the day its path was created. One cleanup pass, plus a permanent database-level guard so a check-in can never again be stored for a day before its path existed.

**2. Stop counting dead paths**
Any remaining stats only count active and paused paths — archived ones drop out.

**3. Remove Standing/Fallen from the dashboard**
The summary card and the separate `/standing` page both go away. Dashboard goes back to: today's greeting, what needs attention, and your active paths.

**4. Put the real stats on the path page**
Open a path (e.g. "Fast") and you get, above the day-by-day list:
- **Days Standing** and **Days Fallen** for that path only, counted from the day the path was created — never earlier.
- Held / Breach / Silent day-by-day underneath (already there, staying).
- Proverbs 24:16 (KJV) closing line, moved over from the old page.

**5. Verify the day boundary**
Check whether the server is resolving "today" in your timezone (Phoenix) or falling back to UTC. If it's falling back, fix the fallback so evening check-ins never land on tomorrow's date.

## Technical notes

- Migration: `DELETE FROM checkins c USING lanes l WHERE ... c.checkin_date < (l.created_at AT TIME ZONE profile tz)::date`, then a `BEFORE INSERT` trigger enforcing the same rule.
- `getLane` in `src/lib/api.functions.ts` returns per-path `standing` / `fallen` counts and the creation-date floor; the 14-day list stays.
- `src/routes/dashboard.tsx`: drop the Standing/Fallen `<Link>` block; `getDashboard` stops computing them.
- Delete `src/routes/standing.tsx` and `getStandingDetail`; add a redirect from `/standing` to `/paths` so any saved link still lands somewhere.
- `src/routes/paths.$id.tsx`: new stats row rendered from `getLane` data, styled like the existing cards.
- Day-boundary check: confirm `Intl.DateTimeFormat` with `timeZone` resolves in the server runtime rather than hitting the UTC fallback in `src/lib/localday.ts`.

---

# Check-in page rework

## 6. "Complete" paths need a "No, I didn't" option

Right now a Complete path is a one-way toggle — you can only say you did it. Silence is the only way to say you didn't, and that's wrong.

Fix: Complete paths get the same two-button answer as Avoid paths — **Yes — held** / **No — missed**. Choosing "No" opens the mandatory "What happened? Be honest." field, exactly like a breach. Same treatment for both path types, one shared row component.

## 7. Shrink the check-in rows

The Avoid box wastes a lot of vertical space, and with ten paths the page becomes a scroll marathon. Tightened layout:

- Path title and the two answer buttons on **one line** — buttons sized to their text, not full width.
- Drop the "Did you avoid this today?" prompt line; the buttons say it.
- Description shown only as a small second line when present.
- No separate Submit button on the "held" answer — tapping **Yes — held** submits immediately.
- Choosing **No** expands the honesty field inline, with a compact Submit under it. Field stays required.
- "Skip — Sabbath" becomes a small inline link, not its own row.

Target: each path is roughly one compact row until you answer "No", so ten paths fit on a screen or two.

## 8. Trial banner copy

Strip the "free / no card" wording from the "X days left in your first month" countdown wherever it appears (check-in, dashboard, anywhere the banner renders). The countdown line reads only: "X days left in your first month." Homepage marketing copy keeps its "no card" line — that one stays.
