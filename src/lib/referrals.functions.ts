import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

function makeCode(): string {
  // 7-char URL-safe code (avoids confusing chars)
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export const getMyReferral = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: existing } = await supabaseAdmin
      .from('referrals')
      .select('code, created_at')
      .eq('referrer_id', userId)
      .maybeSingle();

    let code = existing?.code;
    if (!code) {
      for (let i = 0; i < 5; i++) {
        const c = makeCode();
        const { error } = await supabaseAdmin
          .from('referrals')
          .insert({ referrer_id: userId, code: c });
        if (!error) { code = c; break; }
      }
      if (!code) return { error: 'Could not create referral code.' };
    }

    const { count: invited } = await supabaseAdmin
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', userId);
    const { count: walking } = await supabaseAdmin
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .not('referred_user_id', 'is', null);

    return { code, invited: invited ?? 0, walking: walking ?? 0 };
  });

export const claimReferral = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ code: z.string().min(3).max(32) }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const code = data.code.trim().toLowerCase();
    // Only claim if currently unclaimed and not self-referral.
    const { data: ref } = await supabaseAdmin
      .from('referrals')
      .select('id, referrer_id, referred_user_id')
      .eq('code', code)
      .maybeSingle();
    if (!ref) return { ok: false, reason: 'not_found' as const };
    if (ref.referrer_id === userId) return { ok: false, reason: 'self' as const };
    if (ref.referred_user_id) return { ok: false, reason: 'already' as const };
    await supabaseAdmin
      .from('referrals')
      .update({ referred_user_id: userId, claimed_at: new Date().toISOString() })
      .eq('id', ref.id);
    return { ok: true };
  });
