import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

/** A user sends a note. user_id is attached quietly — never asked for in the UI. */
export const sendFeedback = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      message: z.string().trim().min(20).max(4000),
      rating: z.number().int().min(1).max(5).nullable().optional(),
      category: z.enum(['Love it', 'Suggestion', 'Something off', 'Other']).nullable().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from('feedback').insert({
      user_id: userId,
      message: data.message,
      rating: data.rating ?? null,
      category: data.category ?? null,
    });
    if (error) return { error: 'Could not send that. Try again.' };
    return { ok: true };
  });

/** Admin-only: every note, newest first, with who sent it. */
export const getAdminFeedback = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: role } = await supabaseAdmin
      .from('user_roles').select('role').eq('user_id', context.userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Forbidden');

    const { data: rows } = await supabaseAdmin
      .from('feedback')
      .select('id, user_id, message, rating, category, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const { data: profiles } = ids.length
      ? await supabaseAdmin.from('profiles').select('user_id, email, first_name').in('user_id', ids)
      : { data: [] as any[] };
    const byId = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));

    return {
      feedback: (rows ?? []).map((r) => {
        const p = byId.get(r.user_id);
        return {
          ...r,
          submitter: p?.first_name ? `${p.first_name} (${p.email})` : p?.email ?? r.user_id,
        };
      }),
    };
  });
