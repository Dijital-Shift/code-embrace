import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

// Generate URL-safe random token (~32 bytes → 43 base64url chars)
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Owner creates an invite link for a lane
export const createLaneInvite = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    laneId: z.string().uuid(),
    relationship: z.string().max(24).optional().nullable(),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: lane } = await supabase
      .from('lanes')
      .select('lane_id, user_id, status')
      .eq('lane_id', data.laneId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!lane) return { error: 'Path not found.' };
    if (lane.status === 'archived') return { error: 'Cannot invite Watchmen to an archived path.' };

    // path_watchmen is the source of truth for who is actually watching.
    const { count: activeCount } = await supabaseAdmin
      .from('path_watchmen')
      .select('id', { count: 'exact', head: true })
      .eq('path_id', data.laneId)
      .eq('status', 'active');

    const { count: pendingCount } = await supabase
      .from('lane_invites')
      .select('invite_id', { count: 'exact', head: true })
      .eq('lane_id', data.laneId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if ((activeCount ?? 0) + (pendingCount ?? 0) >= 2) {
      return { error: 'CAP_REACHED', code: 'CAP_REACHED' as const };
    }

    const token = generateToken();
    const rel = data.relationship?.trim() || null;
    const { error } = await supabase.from('lane_invites').insert({
      lane_id: data.laneId,
      owner_id: userId,
      token,
      relationship: rel,
    });

    if (error) return { error: error.message };
    return { token, expiresInHours: 48 };
  });


// Public preview — no auth required (uses SECURITY DEFINER RPC)
export const getInvitePreview = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().min(10).max(100) }))
  .handler(async ({ data }) => {
    const { data: rows } = await supabaseAdmin.rpc('get_invite_preview', { _token: data.token });
    if (!rows || rows.length === 0) {
      return { found: false as const };
    }
    const row = rows[0];
    // The RPC doesn't expose the path description; fetch it for the invite screen.
    let laneDescription: string | null = null;
    const { data: inv } = await supabaseAdmin
      .from('lane_invites').select('lane_id').eq('token', data.token).maybeSingle();
    if (inv?.lane_id) {
      const { data: l } = await supabaseAdmin
        .from('lanes').select('description').eq('lane_id', inv.lane_id).maybeSingle();
      laneDescription = l?.description ?? null;
    }
    return {
      found: true as const,
      laneDescription,
      status: row.status as 'pending' | 'accepted' | 'revoked' | 'expired',
      expired: row.expired as boolean,
      laneTitle: row.lane_title as string,
      ownerFirstName: (row.owner_first_name as string | null) ?? null,
      ownerEmail: (row.owner_email as string | null) ?? null,
    };
  });

// Authed user accepts an invite
export const acceptLaneInvite = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ token: z.string().min(10).max(100) }))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const accepterEmail = ((claims as any)?.email || '').toLowerCase();

    const { data: invite } = await supabaseAdmin
      .from('lane_invites')
      .select('invite_id, lane_id, owner_id, status, expires_at, relationship')
      .eq('token', data.token)
      .maybeSingle();

    if (!invite) return { error: 'Invite not found.' };

    const { data: lane } = await supabaseAdmin
      .from('lanes')
      .select('lane_id, title, status')
      .eq('lane_id', invite.lane_id)
      .single();

    if (!lane) return { error: 'Path no longer exists.' };

    // Retap / reload: if they're already a watchman here, send them to their view
    // instead of the "already used" dead end. This check comes FIRST on purpose.
    const { data: mine } = await supabaseAdmin
      .from('path_watchmen')
      .select('id')
      .eq('path_id', lane.lane_id)
      .eq('watchman_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    if (mine) {
      return { success: true, alreadyWatchman: true, laneId: lane.lane_id, laneTitle: lane.title };
    }

    if (invite.status === 'accepted') return { error: 'This invite has already been used.' };
    if (invite.status === 'revoked') return { error: 'This invite was cancelled.' };
    if (new Date(invite.expires_at) < new Date()) {
      return { error: 'This invite has expired.' };
    }
    if (invite.owner_id === userId) return { error: "You can't accept your own invite." };
    if (lane.status === 'archived') return { error: 'This path has been archived.' };

    const { count: seatsTaken } = await supabaseAdmin
      .from('path_watchmen')
      .select('id', { count: 'exact', head: true })
      .eq('path_id', lane.lane_id)
      .eq('status', 'active');
    if ((seatsTaken ?? 0) >= 2) return { error: 'This path already has two Watchmen.' };

    // Unrelated, separate cap: a watchman can watch at most 2 paths in total.
    const { count: myWatchmanCount } = await supabaseAdmin
      .from('path_watchmen')
      .select('id', { count: 'exact', head: true })
      .eq('watchman_id', userId)
      .eq('status', 'active');

    if ((myWatchmanCount ?? 0) >= 2) {
      return { error: "You're already watching 2 paths. That's the limit." };
    }

    // The DB triggers are the real race guard (2 watchmen per path, 2 paths per
    // watchman). Translate their raw text into copy a human can read.
    const { error: insErr } = await supabaseAdmin.from('path_watchmen').insert({
      path_id: lane.lane_id,
      watchman_id: userId,
      watchman_email: accepterEmail,
      relationship: invite.relationship ?? null,
      status: 'active',
    });

    if (insErr) {
      const msg = insErr.message || '';
      if (/at most 2 active watchmen/i.test(msg)) return { error: 'This path already has two Watchmen.' };
      if (/already assigned to 2 active paths/i.test(msg)) return { error: "You're already watching 2 paths. That's the limit." };
      return { error: msg };
    }

    await supabaseAdmin
      .from('lane_invites')
      .update({ status: 'accepted', accepted_by: userId, accepted_at: new Date().toISOString() })
      .eq('invite_id', invite.invite_id);

    return { success: true, laneId: invite.lane_id, laneTitle: lane.title };
  });


// Owner revokes a pending invite
export const revokeLaneInvite = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ inviteId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from('lane_invites')
      .update({ status: 'revoked' })
      .eq('invite_id', data.inviteId)
      .eq('owner_id', userId)
      .eq('status', 'pending');
    if (error) return { error: error.message };
    return { success: true };
  });

// Owner lists invites for a lane
export const listLaneInvites = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ laneId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows } = await supabase
      .from('lane_invites')
      .select('invite_id, token, status, expires_at, created_at, accepted_at, relationship')
      .eq('lane_id', data.laneId)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    return rows ?? [];
  });

// Owner removes ONE specific Watchman — any other watchman on the path stays put.
export const removeWatchman = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    laneId: z.string().uuid(),
    watchmanRowId: z.string().uuid(),
    reason: z.string().min(3).max(500),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const reason = data.reason.trim();
    if (reason.length < 3) return { error: 'A reason is required to remove a Watchman.' };

    const { data: lane } = await supabase
      .from('lanes')
      .select('lane_id, title')
      .eq('lane_id', data.laneId)
      .eq('user_id', userId)
      .maybeSingle();
    if (!lane) return { error: 'Path not found.' };

    const { data: row } = await supabaseAdmin
      .from('path_watchmen')
      .select('id, watchman_id, status')
      .eq('id', data.watchmanRowId)
      .eq('path_id', data.laneId)
      .maybeSingle();
    if (!row || row.status !== 'active') return { error: 'That Watchman is no longer on this path.' };
    const removedId = row.watchman_id;

    // Only this one seat is released. The sync trigger repoints the path's
    // primary watchman to whoever is left, or clears it if nobody is.
    const { error } = await supabaseAdmin
      .from('path_watchmen')
      .update({ status: 'removed' })
      .eq('id', row.id);
    if (error) return { error: error.message };

    if (!removedId) return { success: true };

    // Tell the watchman — silently dropping someone is the thing we don't do.
    const { data: owner } = await supabaseAdmin
      .from('profiles').select('first_name, email').eq('user_id', userId).maybeSingle();
    const who = (owner?.first_name || owner?.email || 'Someone') as string;
    const when = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const message = `${who} removed you from ${lane.title} on ${when}.`;

    await supabaseAdmin.from('notifications').insert({
      lane_id: lane.lane_id,
      partner_id: removedId,
      type: 'watchman_removed',
      status: 'sent',
      channel: 'in_app',
      message_content: `${message} Reason: ${reason}`,
      sent_at: new Date().toISOString(),
    });

    try {
      const { sendPushToUser } = await import('@/lib/push.server');
      await sendPushToUser(removedId, {
        title: 'Watch ended',
        body: message,
        url: '/partner',
      });
    } catch {}

    return { success: true };
  });

