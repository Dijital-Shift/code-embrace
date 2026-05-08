import { createFileRoute } from '@tanstack/react-router';
import { markMissedCheckins } from '@/lib/escalation.server';

export const Route = createFileRoute('/api/public/hooks/missed-checkins')({
  server: {
    handlers: {
      POST: async () => {
        const result = await markMissedCheckins();
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
