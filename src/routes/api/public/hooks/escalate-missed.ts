import { createFileRoute } from '@tanstack/react-router';
import { markMissedCheckins } from '@/lib/escalation.server';
import { checkCronAuth } from '@/lib/cron-auth.server';

// Threshold 2 of the Silence Rule. Idempotent — safe to re-run.
export const Route = createFileRoute('/api/public/hooks/escalate-missed')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauth = checkCronAuth(request);
        if (unauth) return unauth;
        const result = await markMissedCheckins();
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
