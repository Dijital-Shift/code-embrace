import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

// Push subscribe — auth via supabase token verified inline
async function authUser(request: Request): Promise<string | null> {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export const Route = createFileRoute('/api/push/subscribe')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await authUser(request);
        if (!userId) return new Response('Unauthorized', { status: 401 });
        const sub = await request.json();
        if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
          return new Response('Invalid subscription', { status: 400 });
        }
        await supabaseAdmin.from('push_subscriptions').upsert(
          { user_id: userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          { onConflict: 'endpoint' },
        );
        return Response.json({ ok: true });
      },
      DELETE: async ({ request }) => {
        const userId = await authUser(request);
        if (!userId) return new Response('Unauthorized', { status: 401 });
        const { endpoint } = await request.json();
        await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', userId);
        return Response.json({ ok: true });
      },
    },
  },
});
