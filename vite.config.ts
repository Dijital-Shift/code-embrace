// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

// Immutable per-build identifier. The running bundle compares this against
// what /api/public/build-id currently serves to detect a stale session even
// when the service worker itself looks up to date.
const buildId =
  process.env.SOURCE_VERSION ||
  process.env.COMMIT_SHA ||
  process.env.CF_PAGES_COMMIT_SHA ||
  `${Date.now()}`;

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    define: {
      __APP_BUILD_ID__: JSON.stringify(buildId),
    },
    plugins: [
      VitePWA({
        // The app owns update timing (gold pill, background swap, cold-start
        // activation). Keep the generated worker waiting until our code sends
        // SKIP_WAITING; mixing autoUpdate with a prompt flow races on iOS.
        registerType: "prompt",
        injectRegister: null,
        // We author the worker ourselves because /sw.js also carries the
        // watchman push handlers.
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        // public/manifest.json is the source of truth — iOS caches manifest
        // identity fields at install time, so nothing here may regenerate it.
        manifest: false,
        injectManifest: {
          globPatterns: ["**/*.{js,css,ico,svg,woff2,png}"],
          globIgnores: ["**/og-card*", "**/screenshots/**"],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        devOptions: { enabled: false },
      }),
    ],
  },
});
