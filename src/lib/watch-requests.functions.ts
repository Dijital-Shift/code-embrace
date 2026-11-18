import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { watchRequestOffer } from './watch-referral';

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Remember whose Watchman link brought this member in. Their own links are ignored.
export const saveWatchReferral = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ token: z.string().min(10).max(100) }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { supabase, userId } = context;
    const { data: inv } = await supabaseAdmin
      .from('lane_invites').select('owner_id, invitee_id').eq('token', data.token).maybeSingle();
    if (!inv || inv.owner_id === userId || inv.invitee_id) return { saved: false };
    await supabase.from('profiles').update({ watch_referral_token: data.token }).eq('user_id', userId);
    return { saved: true };
  });

async function evaluateOffer(supabase: any, userId: string, laneId: string) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const [{ data: me }, { data: lane }] = await Promise.all([
    supabase.from('profiles').select('watch_referral_token, first_name').eq('user_id', userId).maybeSingle(),
    supabase.from('lanes').select('lane_id, title, status').eq('lane_id', laneId).eq('user_id', userId).maybeSingle(),
  ]);
  if (!me?.watch_referral_token || !lane) return null;
  const { data: inv } = await supabaseAdmin
    .from('lane_invites').select('owner_id').eq('token', me.watch_referral_token).maybeSingle();
  const referrerId = (inv?.owner_id as string | undefined) ?? null;
  if (!referrerId || referrerId === userId) return null;

  const [{ data: seats }, { data: requests }, { data: pair }, { data: ref }] = await Promise.all([
    supabaseAdmin.from('path_watchmen').select('watchman_id').eq('path_id', laneId).eq('status', 'active'),
    supabaseAdmin.from('lane_invites').select('invitee_id, status, created_at')
      .eq('lane_id', laneId).not('invitee_id', 'is', null).order('created_at', { ascending: false }),
    supabaseAdmin.from('path_watchmen').select('id, lanes!inner(user_id, status)')
      .eq('watchman_id', referrerId).eq('status', 'active')
      .eq('lanes.user_id', userId).eq('lanes.status', 'active'),
    supabaseAdmin.from('profiles').select('first_name').eq('user_id', referrerId).maybeSingle(),
  ]);
  const pendingDirect = (requests ?? []).filter((r: any) => r.status === 'pending').length;
  const mine = (requests ?? []).find((r: any) => r.invitee_id === referrerId);
  const state = watchRequestOffer({
    selfId: userId,
    referrerId,
    laneActive: lane.status === 'active',
    laneTitle: lane.title,
    referrerWatching: (seats ?? []).some((s: any) => s.watchman_id === referrerId),
    requestStatus: (mine?.status as string | undefined) ?? null,
    seatsUsed: (seats ?? []).length + pendingDirect,
    pairPaths: (pair ?? []).length,
  });
  return {
    state,
    referrerId,
    referrerName: ((ref?.first_name as string | null) || 'your inviter').split(' ')[0],
    ownerName: (me.first_name as string | null) || 'Someone',
    laneTitle: lane.title as string,
  };
}

// Path page: should we offer "Invite {name}" here?
export const getWatchReferralOffer = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ laneId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const r = await evaluateOffer(context.supabase, context.userId, data.laneId);
    if (!r || r.state === 'none') return { state: 'none' as const, name: null };
    return { state: r.state, name: r.referrerName };
  });

// Owner asks the person who invited them to watch this Path.
export const requestWatchFromReferrer = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ laneId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const r = await evaluateOffer(supabase, userId, data.laneId);
    if (!r || r.state === 'none') return { error: "This Path can't take that request right now." };
    if (r.state === 'requested') return { success: true, name: r.referrerName };
    const { error } = await supabase.from('lane_invites').insert({
      lane_id: data.laneId,
      owner_id: userId,
      invitee_id: r.referrerId,
      token: generateToken(),
    });
    if (error) return { error: "Couldn't send the request. Try again." };
    try {
      const { sendPushToUser } = await import('@/lib/push.server');
      await sendPushToUser(r.referrerId, {
        title: 'Watch request',
        body: `${r.ownerName} asked you to watch their Path "${r.laneTitle}". Tap to review.`,
        url: '/partner',
      });
    } catch {}
    return { success: true, name: r.referrerName };
  });

// Watch tab: requests addressed to me that are still waiting.
export const listWatchRequests = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: rows } = await supabaseAdmin
      .from('lane_invites').select('invite_id, token, lane_id, owner_id, created_at')
      .eq('invitee_id', context.userId).eq('status', 'pending')
      .order('created_at', { ascending: false }).limit(10);
    if (!rows?.length) return [];
    const [{ data: lanes }, { data: owners }] = await Promise.all([
      supabaseAdmin.from('lanes').select('lane_id, title, description, lane_type, status')
        .in('lane_id', rows.map((r) => r.lane_id)),
      supabaseAdmin.from('profiles').select('user_id, first_name, last_name')
        .in('user_id', rows.map((r) => r.owner_id)),
    ]);
    return rows.flatMap((r) => {
      const lane = (lanes ?? []).find((l) => l.lane_id === r.lane_id);
      if (!lane || lane.status !== 'active') return [];
      const o = (owners ?? []).find((p) => p.user_id === r.owner_id);
      return [{
        inviteId: r.invite_id as string,
        token: r.token as string,
        laneTitle: lane.title as string,
        laneDescription: (lane.description as string | null) ?? null,
        isAvoid: (lane.lane_type ?? 'avoid') !== 'complete',
        ownerName: [o?.first_name, o?.last_name].filter(Boolean).join(' ').trim() || 'Someone',
      }];
    });
  });

// Decline quietly: the request closes, nothing is said to the owner.
export const declineWatchRequest = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ inviteId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.from('lane_invites').update({ status: 'declined' })
      .eq('invite_id', data.inviteId).eq('invitee_id', context.userId).eq('status', 'pending');
    if (error) return { error: "Couldn't decline. Try again." };
    return { success: true };
  });
