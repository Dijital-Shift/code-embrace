import { createFileRoute } from '@tanstack/react-router';
import { sendBedtimeReminders } from '@/lib/escalation.server';
import { checkCronAuth } from '@/lib/cron-auth.server';

export const Route = createFileRoute('/api/public/hooks/bedtime-reminder')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauth = checkCronAuth(request);
        if (unauth) return unauth;
        const result = await sendBedtimeReminders();
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
