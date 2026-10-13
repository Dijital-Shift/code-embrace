import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { requestDeletion, cancelDeletion } from './deletion.server';

export const requestAccountDeletion = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ reason: z.string().trim().min(5).max(500) }))
  .handler(async ({ data, context }) => {
    return requestDeletion(context.userId, data.reason);
  });

export const cancelAccountDeletion = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return cancelDeletion(context.userId);
  });
