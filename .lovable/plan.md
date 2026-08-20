# PWA Update Strategy — Keep it simple

## Current state (verified)

- `public/manifest.json` is declared as installable with `display: standalone`, `start_url: "/"`, `scope: "/"`, and the app icons.
- The manifest is linked in `src/routes/__root.tsx` via `<link rel="manifest" href="/manifest.json" />`.
- `public/sw.js` exists but only contains push-notification handlers. It is **not registered anywhere in the client code**, so it does not control app-shell caching.
- Because there is no app-shell service worker, every launch of the installed app fetches the app from the network and naturally receives the latest published build.

## What this means for existing installs

- **iOS / Safari:** Home screen metadata (name, icon, start URL, theme) is cached at install time. Content updates come from normal network refresh. Reinstalling is the only way to refresh metadata.
- **Android / Chrome:** Same behavior — the app is a fullscreen web view with no offline cache.
- **Trade-off:** Users cannot open the app offline, but they also avoid the stale-cache / white-screen problem that full PWAs often suffer from.

## Plan: keep it simple

1. **Do not add a service worker** for app-shell caching or offline support. No `vite-plugin-pwa`, no `public/sw.js` cache logic, no manual `navigator.serviceWorker.register` for the app shell.
2. **Keep `public/sw.js` as push-only.** If/when push notifications are implemented, the existing file already handles `push`, `notificationclick`, `skipWaiting`, and `clients.claim` correctly.
3. **Do not change `start_url`, `scope`, or `id` in the manifest** unless required, because those fields are cached by iOS at install time and changing them forces existing users to reinstall.
4. **Optional hygiene:** If you want to be explicit, add a code comment in `public/sw.js` noting that it is a push-only worker and that the app is intentionally manifest-only. No functional change needed.

## Outcome

No code changes are required. The existing setup means deployed frontend updates reach installed PWA users automatically, the same way they reach regular browser users.
