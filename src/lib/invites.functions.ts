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
      .select('lane_id, user_id, partner_id, status')
      .eq('lane_id', data.laneId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!lane) return { error: 'Path not found.' };
    if (lane.status === 'archived') return { error: 'Cannot invite Watchmen to an archived path.' };

    const attached = lane.partner_id ? 1 : 0;

    const { count: pendingCount } = await supabase
      .from('lane_invites')
      .select('invite_id', { count: 'exact', head: true })
      .eq('lane_id', data.laneId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (attached + (pendingCount ?? 0) >= 2) {
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
    return {
      found: true as const,
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
      .select('lane_id, title, partner_id, status')
      .eq('lane_id', invite.lane_id)
      .single();

    if (!lane) return { error: 'Path no longer exists.' };

    // Retap / reload: if they're already the watchman, send them to their view
    // instead of the "already used" dead end. This check comes FIRST on purpose.
    if (lane.partner_id === userId) {
      return { success: true, alreadyWatchman: true, laneId: lane.lane_id, laneTitle: lane.title };
    }

    if (invite.status === 'accepted') return { error: 'This invite has already been used.' };
    if (invite.status === 'revoked') return { error: 'This invite was cancelled.' };
    if (new Date(invite.expires_at) < new Date()) {
      return { error: 'This invite has expired.' };
    }
    if (invite.owner_id === userId) return { error: "You can't accept your own invite." };
    if (lane.status === 'archived') return { error: 'This path has been archived.' };
    if (lane.partner_id) return { error: 'This path already has a Watchman.' };

    const { count: myWatchmanCount } = await supabaseAdmin
      .from('lanes')
      .select('lane_id', { count: 'exact', head: true })
      .eq('partner_id', userId)
      .eq('status', 'active');

    if ((myWatchmanCount ?? 0) >= 2) {
      return { error: "You're already watching 2 paths. That's the limit." };
    }

    // Conditional write closes the read-then-write race: only one concurrent
    // accept can flip a NULL partner_id, the loser gets zero rows back.
    const { data: claimed, error: updErr } = await supabaseAdmin
      .from('lanes')
      .update({
        partner_id: userId,
        partner_email: accepterEmail,
        partner_relationship: invite.relationship ?? null,
      })
      .eq('lane_id', invite.lane_id)
      .is('partner_id', null)
      .select('lane_id');

    if (updErr) return { error: updErr.message };
    if (!claimed || claimed.length === 0) {
      return { error: 'This path already has a Watchman.' };
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

// Owner removes the current Watchman
export const removeWatchman = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    laneId: z.string().uuid(),
    reason: z.string().min(3).max(500),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const reason = data.reason.trim();
    if (reason.length < 3) return { error: 'A reason is required to remove a Watchman.' };

    const { data: lane } = await supabase
      .from('lanes')
      .select('lane_id, title, partner_id')
      .eq('lane_id', data.laneId)
      .eq('user_id', userId)
      .maybeSingle();
    if (!lane) return { error: 'Path not found.' };
    if (!lane.partner_id) return { error: 'This path has no Watchman.' };
    const removedId = lane.partner_id;

    const { error } = await supabase
      .from('lanes')
      .update({ partner_id: null, partner_email: null })
      .eq('lane_id', data.laneId)
      .eq('user_id', userId);
    if (error) return { error: error.message };

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
