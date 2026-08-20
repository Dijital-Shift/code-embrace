import { createFileRoute } from "@tanstack/react-router";

// The build ID compiled into this deployment. The client compares its own
// baked-in __APP_BUILD_ID__ against this to detect a stale session.
export const Route = createFileRoute("/api/public/build-id")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify({ buildId: __APP_BUILD_ID__ }), {
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }),
    },
  },
});
