import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { sendPushToUser } from './push.server';
import { activeWatchmen } from './watchmen.server';
import { createStripeClient, type StripeEnv } from './stripe.server';

export const DELETION_HOLD_DAYS = 14;

/**
 * Put an account into the 14-day deletion hold: record the reason, cancel any
 * live Stripe subscription so no further charges occur, and alert every active
 * watchman across the member's paths — nobody leaves the wall quietly.
 */
export async function requestDeletion(userId: string, reason: string) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ deletion_requested_at: now, deletion_reason: reason })
    .eq('user_id', userId);
  if (error) return { error: error.message };

  // Cancel live subscriptions at Stripe (lifetime rows have no subscription id
  // to cancel — the purchase simply stays completed and is forfeited).
  const { data: subs } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_subscription_id, environment, status, price_id')
    .eq('user_id', userId);
  for (const s of subs ?? []) {
    if (!s.stripe_subscription_id || !['active', 'trialing', 'past_due'].includes(s.status)) continue;
    try {
      const stripe = createStripeClient(s.environment as StripeEnv);
      await stripe.subscriptions.cancel(s.stripe_subscription_id);
    } catch (e) {
      console.error('[deletion] stripe cancel failed', s.stripe_subscription_id, e);
    }
  }

  // Alert every active watchman once, with the member's reason word for word.
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('first_name, email').eq('user_id', userId).maybeSingle();
  const who = profile?.first_name || profile?.email || 'Your partner';
  const { data: lanes } = await supabaseAdmin
    .from('lanes').select('lane_id, title').eq('user_id', userId).neq('status', 'archived');

  const notified = new Set<string>();
  for (const lane of lanes ?? []) {
    for (const w of await activeWatchmen(lane.lane_id)) {
      if (!w.watchman_id || notified.has(w.watchman_id)) continue;
      notified.add(w.watchman_id);
      const body = `${who} has asked to delete their account. Their reason: "${reason}" They are in a ${DELETION_HOLD_DAYS}-day hold — reach out before the account is gone.`;
      await supabaseAdmin.from('notifications').insert({
        lane_id: lane.lane_id, partner_id: w.watchman_id, checkin_id: null,
        type: 'account_deletion', status: 'pending', message_content: body,
      });
      await sendPushToUser(w.watchman_id, {
        title: `${who} is leaving the wall`,
        body,
        url: '/partner',
      });
    }
  }
  return { success: true, watchmenNotified: notified.size };
}

/** Cancel the hold — one tap restores everything. */
export async function cancelDeletion(userId: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ deletion_requested_at: null, deletion_reason: null })
    .eq('user_id', userId)
    .not('deletion_requested_at', 'is', null);
  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Hard-delete every account whose hold has expired. Watchman partner links are
 * cleared first (lanes.partner_id restricts auth user deletion); the auth user
 * delete then cascades profiles, check-ins, encouragements and push tokens.
 */
export async function purgeExpiredDeletions() {
  const cutoff = new Date(Date.now() - DELETION_HOLD_DAYS * 86400000).toISOString();
  const { data: doomed } = await supabaseAdmin
    .from('profiles')
    .select('user_id')
    .not('deletion_requested_at', 'is', null)
    .lt('deletion_requested_at', cutoff);

  let purged = 0;
  for (const p of doomed ?? []) {
    const uid = p.user_id;
    await supabaseAdmin.from('lanes').update({ partner_id: null }).eq('partner_id', uid);
    await supabaseAdmin.from('path_watchmen').delete().eq('watchman_id', uid);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error) {
      console.error('[deletion] purge failed for', uid, error.message);
      continue;
    }
    purged++;
  }
  return { purged };
}
