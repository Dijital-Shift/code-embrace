# Pass 2 — Check-in interaction, undo, encouragements, library

## 1. Check-in rows: green check / red X

Every path row (both "complete" and "avoid" types) gets the same compact control: a green check button and a red X button, sized as a matched pair instead of long full-width buttons. Tapping the check logs the day immediately. Tapping the X opens the mandatory "What happened? Be honest." field (5-character minimum, already enforced) with a short Submit.

Same row height and spacing for late/today sections so ten paths still fit on one screen without scroll fatigue.

## 2. Undo after logging

Once a day is logged, the row moves to "Logged" and shows an obvious gold "Undo" affordance next to the status. Tapping it reverts the day back to unlogged and the row returns to Today. This wires up the existing but unused revert function on the server.

Undo stays available for the current local day only — once the day rolls over, the record stands.

## 3. Recent encouragements on the watchman page

Add a "Recent encouragements" section on the watchman page listing the last encouragements sent, with the path name and date, so a watchman can see what they've already said rather than repeating themselves.

## 4. Pull-to-refresh

Add pull-to-refresh on the main logged-in screens (dashboard, check-in, watchman, paths) so a downward pull at the top of the page refetches that page's data.

## 5. Path library as accordion

The library currently renders every category expanded. Change each category to a collapsible section, all collapsed by default except the first, with the count of paths shown on the header.

## 6. Edit button alignment

The Edit action on the path detail page is a link rather than a button, so its text sits slightly off compared to Pause / Archive / Delete. Match padding, line-height, and centering exactly.

## Technical notes

- `src/routes/checkin.tsx` — replace the `PathRow` yes/no controls with icon buttons (lucide `Check` / `X`), keep the existing honesty-field gating and 5-char minimum.
- `src/lib/api.functions.ts` — expose `revertComplete` to the client path; guard it to the current local day using `src/lib/localday.ts`, and invalidate `checkin` + path queries.
- `src/routes/partner.tsx` — extend `getPartnerView` to return recent `encouragements` rows for the signed-in watchman and render them.
- Pull-to-refresh: small shared hook using touch events + `queryClient.invalidateQueries`, applied inside `AppLayout`.
- `src/routes/paths.library.tsx` — wrap each category in the existing shadcn `Accordion`.
- `src/routes/paths.$id.tsx` line ~130 — align the Edit link's classes with the sibling action buttons.

Pass 3 (identity/name gate, invite accept ordering, remove-watchman reason + notification, demo page fixes) stays queued.
