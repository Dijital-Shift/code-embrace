import type { SupabaseClient } from '@supabase/supabase-js';

export const PAYWALL_MESSAGE =
  'Your free month has ended. Choose a plan to keep walking your paths.';

/** Trial-or-subscription check, evaluated in the database. */
export async function hasAccess(supabase: SupabaseClient<any>, userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_access', { _user_id: userId });
  if (error) {
    console.error('[access] has_access failed', error.message);
    // Fail open so a transient DB error never locks a paying user out.
    return true;
  }
  return data === true;
}

/** Returns an error object when the user has no access, otherwise null. */
export async function requireAccess(
  supabase: SupabaseClient<any>,
  userId: string,
): Promise<{ error: string } | null> {
  const ok = await hasAccess(supabase, userId);
  return ok ? null : { error: PAYWALL_MESSAGE };
}

export async function getAccessState(supabase: SupabaseClient<any>, userId: string) {
  const [{ data: profile }, ok] = await Promise.all([
    supabase.from('profiles').select('trial_ends_at').eq('user_id', userId).maybeSingle(),
    hasAccess(supabase, userId),
  ]);
  const trialEndsAt: string | null = (profile as any)?.trial_ends_at ?? null;
  const trialActive = !!trialEndsAt && new Date(trialEndsAt).getTime() > Date.now();
  const daysLeft = trialActive
    ? Math.max(0, Math.ceil((new Date(trialEndsAt!).getTime() - Date.now()) / 86400000))
    : 0;
  return { hasAccess: ok, trialEndsAt, trialActive, daysLeft };
}
