/// <reference lib="webworker" />
// Kingdom Protocol service worker.
//
// One worker, two jobs:
//   1. Watchman push notifications (previously the whole of public/sw.js).
//   2. App-shell caching + controlled updates (Workbox).
//
// It never calls skipWaiting() on install — the app decides when a new build
// takes over, via a { type: "SKIP_WAITING" } message.
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { clientsClaim } from "workbox-core";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// ---------------------------------------------------------------- push

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data: { title?: string; body?: string; url?: string } = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "Kingdom Protocol", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Kingdom Protocol", {
      body: data.body || "",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});

// ------------------------------------------------------- update control

self.addEventListener("message", (event) => {
  if ((event.data as { type?: string } | undefined)?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// ----------------------------------------------------- runtime caching

// HTML navigations are server-rendered — always try the network first so
// newly deployed routes resolve. Auth callbacks and API calls never cache.
registerRoute(
  ({ request, url }) =>
    request.mode === "navigate" &&
    !url.pathname.startsWith("/api/") &&
    !url.pathname.startsWith("/auth/") &&
    !url.pathname.startsWith("/~oauth"),
  new NetworkFirst({
    cacheName: "kp-pages",
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// Same-origin hashed build assets are immutable — cache-first is safe.
registerRoute(
  ({ url, sameOrigin, request }) =>
    !!sameOrigin &&
    (request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "font" ||
      request.destination === "image") &&
    !url.pathname.startsWith("/api/"),
  new CacheFirst({
    cacheName: "kp-assets",
    plugins: [
      new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

// Google Fonts.
registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new NetworkFirst({
    cacheName: "kp-google-fonts-stylesheets",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);
registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "kp-gstatic-fonts",
    plugins: [
      new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);
