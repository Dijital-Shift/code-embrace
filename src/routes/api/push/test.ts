import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const Body = z.object({ endpoint: z.string().url().max(2000) });
const lastSent = new Map<string, number>();

async function authUser(request: Request): Promise<string | null> {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.auth.getUser(auth.slice(7));
  if (error || !data.user) return null;
  return data.user.id;
}

export const Route = createFileRoute('/api/push/test')({
  server: {
    handlers: {
      // Is this endpoint registered for the caller?
      GET: async ({ request }) => {
        const userId = await authUser(request);
        if (!userId) return new Response('Unauthorized', { status: 401 });
        const parsed = Body.safeParse({ endpoint: new URL(request.url).searchParams.get('endpoint') });
        if (!parsed.success) return new Response('Invalid', { status: 400 });
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { data } = await supabaseAdmin
          .from('push_subscriptions')
          .select('endpoint')
          .eq('user_id', userId)
          .eq('endpoint', parsed.data.endpoint)
          .maybeSingle();
        return Response.json({ registered: Boolean(data) });
      },
      // Send a test alert to the caller's own device.
      POST: async ({ request }) => {
        const userId = await authUser(request);
        if (!userId) return new Response('Unauthorized', { status: 401 });
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response('Invalid', { status: 400 });
        const now = Date.now();
        if (now - (lastSent.get(userId) ?? 0) < 60_000) {
          return Response.json({ result: 'rate_limited' }, { status: 429 });
        }
        lastSent.set(userId, now);
        const { sendPushToEndpoint } = await import('@/lib/push.server');
        const result = await sendPushToEndpoint(userId, parsed.data.endpoint, {
          title: 'Kingdom Protocol — test alert',
          body: "You're on watch. Alerts will reach this device.",
          url: '/partner',
        });
        return Response.json({ result });
      },
    },
  },
});
