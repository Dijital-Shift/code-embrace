# Four fixes: duplicate-title error, bottom nav, Send Scripture path, Edit button

## 1. The "duplicate key value violates unique constraint" error

Cause: paths are uniquely keyed on your account + the path title, so creating a second path named "Fast" (even if the first one is paused or archived) is rejected by the database, and the raw database message is shown to you.

Fix (presentation + guard, no schema change):
- In the create and edit handlers, catch that specific conflict and return plain English: "You already have a path called '<title>'. Give this one a different name — for example 'Fast — Ramadan week' — or reopen the existing one."
- Same treatment on the edit-path save.

## 2. Bottom nav

Remove the "Home" and "Paths" entries from the mobile bottom bar. Remaining tabs: Check In, Watchman, Settings. Home and Paths stay reachable from the hamburger menu and the wordmark. Desktop top nav is unchanged.

## 3. New path: Send Scripture

Add a template under Devotion:
- Title: Send Scripture
- Type: complete
- Description: Send a verse to someone every day — a word in season, not a sermon.
- Scripture: Proverbs 25:11 (KJV) and Colossians 3:16 (KJV)
- A clean one-line helper on the template card and on the created path page: "Quick way to do this: SendScripture.xyz" — plain gold text link, no banner, no logo.

## 4. Edit button

Restyle Edit on the path page to match Pause/Archive/Delete exactly (same padding, radius, border, and `#2a2518` background), so all four read as one row of equal buttons.

## Technical notes

- `src/lib/api.functions.ts` — map Postgres error code 23505 to friendly copy in `createLane` and `updateLane`.
- `src/components/AppLayout.tsx` — drop the two label-only items from `items` (bottom nav) while keeping the desktop nav list intact.
- `src/lib/path-templates.ts` — new `send-scripture` template; `src/components/PathTemplateCard.tsx` and `src/routes/paths.$id.tsx` render the SendScripture.xyz line when that template/title is in play.
- `src/routes/paths.$id.tsx` — align Edit link classes with the sibling buttons.
