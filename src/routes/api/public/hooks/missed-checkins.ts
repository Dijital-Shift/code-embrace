import { createFileRoute } from '@tanstack/react-router';
import { markMissedCheckins } from '@/lib/escalation.server';
import { checkCronAuth } from '@/lib/cron-auth.server';

export const Route = createFileRoute('/api/public/hooks/missed-checkins')({
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
