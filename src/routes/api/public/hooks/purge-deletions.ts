import { createFileRoute } from '@tanstack/react-router';
import { purgeExpiredDeletions } from '@/lib/deletion.server';
import { checkCronAuth } from '@/lib/cron-auth.server';

export const Route = createFileRoute('/api/public/hooks/purge-deletions')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauth = checkCronAuth(request);
        if (unauth) return unauth;
        const result = await purgeExpiredDeletions();
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
