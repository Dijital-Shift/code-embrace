import { createFileRoute } from '@tanstack/react-router';
import { escalateMissedToPartners } from '@/lib/escalation.server';
import { checkCronAuth } from '@/lib/cron-auth.server';

export const Route = createFileRoute('/api/public/hooks/escalate-missed')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauth = checkCronAuth(request);
        if (unauth) return unauth;
        const result = await escalateMissedToPartners();
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
