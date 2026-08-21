# Two fixes: Check In button + notification tap

## 1. Dashboard "Check In" button wraps to two lines

The button in the "paths need attention" card wraps ("Check" / "In") on narrow
phones because the card's text block squeezes it.

Fix in `src/routes/dashboard.tsx`:
- Add `whitespace-nowrap` and `shrink-0` to the Check In link so it always sits
  on one line.
- Let the text block shrink (`min-w-0`) so the layout stays balanced instead of
  pushing the button narrow.

## 2. Tapping a push notification flashes white / hard-refreshes

Today the service worker always calls `clients.openWindow(url)` on
`notificationclick`. If the app is already open, that spawns a fresh document
load — the white flash and the jarring reload.

Fix in `src/sw.ts`:
- On `notificationclick`, list existing window clients first.
- If one is already open on this origin: `focus()` it and send it a
  `{ type: "NAVIGATE", url }` message instead of reloading.
- Only fall back to `openWindow(url)` when no window exists.

Fix on the app side (`src/routes/__root.tsx`):
- Listen for `navigator.serviceWorker` messages of type `NAVIGATE` and call
  the router's client-side navigate to that path. No document load, no flash —
  it slides to the path page the same as tapping a link in-app.

## Notes

Neither change touches check-in logic, data, or the update/refresh flow.
The notification behavior only takes effect on the published app after the new
service worker rolls out (the usual one update cycle).
