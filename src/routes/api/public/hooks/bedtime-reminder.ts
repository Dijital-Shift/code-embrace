import { createFileRoute } from '@tanstack/react-router';
import { sendBedtimeReminders } from '@/lib/escalation.server';

export const Route = createFileRoute('/api/public/hooks/bedtime-reminder')({
  server: {
    handlers: {
      POST: async () => {
        const result = await sendBedtimeReminders();
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
