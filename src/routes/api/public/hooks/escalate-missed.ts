import { createFileRoute } from '@tanstack/react-router';
import { escalateMissedToPartners } from '@/lib/escalation.server';

export const Route = createFileRoute('/api/public/hooks/escalate-missed')({
  server: {
    handlers: {
      POST: async () => {
        const result = await escalateMissedToPartners();
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
