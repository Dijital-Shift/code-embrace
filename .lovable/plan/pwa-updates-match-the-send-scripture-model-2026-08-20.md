# PWA updates — match the Send Scripture model

Replace the current "no service worker, always network" setup with the same controlled update flow Send Scripture uses: a real service worker, a gold "Update ready" pill, silent background swaps, and a manual "Check for updates" control.

## What Send Scripture actually does

1. `vite-plugin-pwa` generates a service worker at `/sw.js` with `registerType: "prompt"` and `skipWaiting: false`, so the app — not the browser — decides when a new build takes over.
2. A single registration module owns everything: registration guards, update detection, background swap, and forced refresh.
3. Registration is refused in dev, iframes, Lovable preview hosts, and when `?sw=off` is in the URL. In those cases it unregisters any stale worker and clears app caches.
4. Update detection runs on registration, on focus, on `pageshow`, on visibility change, and on a 15-minute poll. It also compares an immutable build ID baked into the bundle against the build ID the server is currently serving, which catches stale bundles even when the worker itself looks current.
5. When an update is found, a small gold pill appears: "Update ready · tap to refresh". It auto-collapses to a dot after 30 seconds.
6. If the user backgrounds the app, the new build is applied silently (immediately on `hidden`/`pagehide`/`freeze`, since iOS freezes timers) and the app is on the new version at next launch.
7. A "user is busy" guard blocks any automatic reload while a dialog is open or the user is typing.
8. A cold start with a build already waiting activates it at boot instead of leaving the user stale.
9. A "Check for updates" button plus a nuclear "Force refresh" (unregister worker, wipe caches, cache-busted reload) exists in the account/footer area.

## What is different about Kingdom Protocol

Two real differences to work around, both handled in the plan below:

- **`/sw.js` is already taken.** Kingdom Protocol already registers `/sw.js` as a push-notification worker (used by `WatchmanPushPrompt.tsx` and the watchman invite welcome screen, backed by `/api/push/subscribe`). A generated Workbox worker at the same path would wipe out push. So we author one worker that does both.
- **This is a TanStack Start SSR app, not a static SPA.** There is no `index.html` on the server to read a build ID from, and `navigateFallback: "/index.html"` does not apply. The build ID is exposed through a small public API route instead, and HTML navigations are always `NetworkFirst`.

## Plan

**1. Bake a build ID into the bundle**
Add a `define` for `__APP_BUILD_ID__` in `vite.config.ts` (through the Lovable config wrapper's `vite` passthrough), derived from the commit SHA with a timestamp fallback.

**2. Expose the served build ID**
Add `src/routes/api/public/build-id.ts` returning `{ buildId: __APP_BUILD_ID__ }` with no-store headers. The client compares this against the build ID compiled into its own bundle to detect a stale session.

**3. Add `vite-plugin-pwa` in `injectManifest` mode**
Install `vite-plugin-pwa`, configure it with `strategies: "injectManifest"`, `srcDir: "src"`, `filename: "sw.ts"`, `injectRegister: null`, `registerType: "prompt"`, `devOptions: { enabled: false }`. The existing `public/manifest.json` stays as the manifest — no changes to `name`, `short_name`, `start_url`, `scope`, or `id`, since iOS caches those at install time.

**4. Author `src/sw.ts` — one worker, both jobs**
- Keeps the current `push` and `notificationclick` handlers verbatim so watchman push keeps working.
- Adds Workbox precaching of the injected manifest, `cleanupOutdatedCaches`, and `clientsClaim: true`.
- Does **not** call `skipWaiting()` on install. Instead it waits for a `{ type: "SKIP_WAITING" }` message from the app.
- Runtime caching: `NetworkFirst` for HTML navigations (excluding `/~oauth`, `/auth/`, `/api/`), `CacheFirst` for same-origin hashed assets and Google Fonts.

**5. Port the registration module to `src/lib/registerServiceWorker.ts`**
A Kingdom Protocol version of the Send Scripture module, keeping all of its behavior: preview/iframe/dev guards, `?sw=off` kill switch, `updateAvailable` event bus, busy guard, background silent apply on `hidden`/`pagehide`/`freeze`, boot activation of a waiting worker, focus/visibility/pageshow checks, the 15-minute poll, build-ID comparison against `/api/public/build-id`, and `forceAppRefresh()`. Cache-name matching is scoped to Kingdom Protocol's own cache names so nothing unrelated is deleted.

**6. Register it once, client-side only**
Because this app is SSR, registration is called from a `useEffect` in `src/routes/__root.tsx` (deferred to idle), not from a `main.tsx`.

**7. Add the update pill, in Kingdom Protocol's colors**
`src/components/UpdateAvailablePill.tsx` — same expand/collapse behavior and 30-second timeout, restyled to the gold `#c9a84c` on `#0a0800` theme with Cinzel/Inter type instead of Send Scripture's palette. Rendered once in `__root.tsx`.

**8. Add "Check for updates" to Settings**
A row in the settings page that calls `checkForAppUpdate("manual")` and reports current / update found, plus a "Force refresh" action underneath for the nuclear path.

## Notes

- Nothing changes for installed users' home-screen icon or app name — the manifest identity fields are left alone deliberately.
- Offline support comes along with this by design; that is inherent to the Send Scripture model.
- Because the worker only takes over when the app says so, the first release after this ships is the one that establishes the worker. Update prompts start working from the release *after* that, which is normal for any PWA rollout.
