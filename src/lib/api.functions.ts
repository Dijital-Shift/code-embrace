import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

import { sendPushToUser } from './push.server';
import { requireAccess } from './access.server';
import { userDay, invalidateUserTimezone } from './day.server';
import { friendlyLaneError } from './lane-errors.server';
import { localDate, prevDay, reminderUtcHour, DEFAULT_TZ } from './localday';
import { alertContextLabel } from './alert-context';

import {
  activeWatchmen,
  activeWatchmenFor,
  watchedPathIds,
  isActiveWatchman,
  watchmanName,
} from './watchmen.server';
import {
  triggerBreachAlert,
  notifyPartnerSkip,
} from './escalation.server';


// ===== Profile =====
export const getMyProfile = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    return data;
  });

export const saveOnboarding = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    first_name: z.string().min(1).max(50),
    last_name: z.string().min(1).max(50),
    gender: z.enum(['male', 'female']),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from('profiles').update(data).eq('user_id', userId);
    if (error) return { error: error.message };
    return { success: true };
  });

export const updateProfile = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      first_name: z.string().max(50).optional().nullable(),
      last_name: z.string().max(50).optional().nullable(),
      phone: z.string().max(30).optional().nullable(),
      bedtime: z.string(),
      timezone: z.string(),
      gender: z.enum(['male', 'female']).optional().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const reminder_utc_hour = reminderUtcHour(data.bedtime, data.timezone);
    const baseUpdate = {
      first_name: data.first_name || null, last_name: data.last_name || null,
      phone: data.phone || null, bedtime: data.bedtime, timezone: data.timezone, reminder_utc_hour,
    };
    const update = data.gender ? { ...baseUpdate, gender: data.gender } : baseUpdate;
    const { error } = await supabase.from('profiles').update(update).eq('user_id', userId);
    if (error) return { error: error.message };
    invalidateUserTimezone(userId);
    return { success: true };
  });

export const dismissWatchmanPrompt = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from('profiles').update({ dismissed_watchman_prompt: true }).eq('user_id', userId);
    return { ok: true };
  });

// Auto-link pending lanes after login (call after sign-in client-side)
export const linkPendingLanes = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context;
    const email = (claims as any)?.email?.toLowerCase();
    if (!email) return { ok: false };
    await supabaseAdmin.from('profiles').upsert({ user_id: userId, email }, { onConflict: 'user_id' });
    // Claim any watchman seats that were created against this email before signup.
    await supabaseAdmin.from('path_watchmen').update({ watchman_id: userId })
      .eq('watchman_email', email).is('watchman_id', null).eq('status', 'active');

    const { data: prof } = await supabaseAdmin.from('profiles').select('first_name').eq('user_id', userId).maybeSingle();
    const needsName = !(prof?.first_name ?? '').trim();
    // Seed admin role if email in ADMIN_EMAILS
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (admins.includes(email)) {
      await supabaseAdmin.from('user_roles').upsert({ user_id: userId, role: 'admin' as any }, { onConflict: 'user_id,role' });
    }
    return { ok: true, needsName };
  });

// ===== Lanes =====
export const listMyLanes = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from('lanes')
      .select('lane_id, title, description, notes, status, created_at, lane_type, support_scripture, ends_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    const lanes = data ?? [];
    const watchmenByPath = await activeWatchmenFor(lanes.map((l) => l.lane_id));
    return lanes.map((l) => {
      const ws = watchmenByPath.get(l.lane_id) ?? [];
      return {
        ...l,
        watchman_count: ws.length,
        watchman_names: ws.map((w) => watchmanName(w)),
      };
    });
  });


export const getLane = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lane } = await supabase
      .from('lanes')
      .select('*')
      .eq('lane_id', data.id)
      .eq('user_id', userId)
      .single();
    if (!lane) return { lane: null, checkins: [], watchmen: [], standing: 0, fallen: 0, encouragements: [], ownerFirstName: null };

    const watchmenRows = await activeWatchmen(data.id);
    const watchmen = watchmenRows.map((w) => ({
      id: w.id,
      watchman_id: w.watchman_id,
      name: watchmanName(w),
      email: w.watchman_email,
      relationship: w.relationship,
    }));

    // Full history for this path only — never before the day the path was created.
    const { tz } = await userDay(supabase, userId);
    const createdLocal = localDate(tz, new Date(lane.created_at));
    const { data: allChks } = await supabase
      .from('checkins').select('checkin_id, checkin_date, status').eq('lane_id', data.id)
      .gte('checkin_date', createdLocal)
      .order('checkin_date', { ascending: false });
    const history = allChks ?? [];
    const standing = history.filter((c) => c.status === 'completed').length;
    // Silence counts as a fall — but the breakdown keeps confession and hiding distinct.
    const breached = history.filter((c) => c.status === 'breached').length;
    const missed = history.filter((c) => c.status === 'missed').length;
    const fallen = breached + missed;

    const { data: encRows } = await supabase
      .from('encouragements').select('id, body, created_at, read_at, watchman_id, checkin_id')
      .eq('lane_id', data.id).eq('owner_id', userId)
      .order('created_at', { ascending: false }).limit(5);

    const nameByWatchman = new Map(watchmenRows.map((w) => [w.watchman_id, watchmanName(w)]));
    const chkById = new Map(history.map((c: any) => [c.checkin_id, c]));
    const encouragements = (encRows ?? []).map((e: any) => {
      const c = e.checkin_id ? chkById.get(e.checkin_id) : null;
      return {
        id: e.id, body: e.body, created_at: e.created_at, read_at: e.read_at,
        from_name: nameByWatchman.get(e.watchman_id) ?? 'Your watchman',
        context: c ? alertContextLabel(c.checkin_date, c.status) : null,
      };
    });

    const { data: me } = await supabase.from('profiles').select('first_name').eq('user_id', userId).maybeSingle();
    return {
      lane,
      checkins: history.slice(0, 14),
      watchmen,
      standing,
      fallen,
      breached,
      missed,
      encouragements,
      ownerFirstName: me?.first_name ?? null,
    };
  });



export const createLane = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      title: z.string().min(1).max(80),
      description: z.string().max(300).optional().nullable(),
      notes: z.string().max(500).optional().nullable(),
      lane_type: z.enum(['avoid', 'complete']),
      support_scripture: z.array(z.string().max(200)).max(3).optional(),
      ends_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const denied = await requireAccess(supabase as any, userId);
    if (denied) return denied;

    const { count: ownLaneCount } = await supabase.from('lanes')
      .select('lane_id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'active');
    if ((ownLaneCount ?? 0) >= 10) return { error: 'You have 10 active paths — that is the cap. A watchman can only truly track so much. Archive or complete one before adding another.' };

    const scriptures = (data.support_scripture ?? []).map((s) => s.trim()).filter(Boolean);
    const { data: lane, error } = await supabase.from('lanes').insert({
      user_id: userId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      notes: data.notes?.trim() || null,
      support_scripture: scriptures.length ? scriptures : null,
      lane_type: data.lane_type,
      ends_at: data.ends_at || null,
    }).select('lane_id').single();
    if (error) return { error: friendlyLaneError(error, data.title.trim()) };
    return { id: lane!.lane_id };
  });


export const updateLane = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(80),
      description: z.string().max(300).optional().nullable(),
      notes: z.string().max(500).optional().nullable(),
      support_scripture: z.array(z.string().max(200)).max(3).optional(),
      ends_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const scriptures = (data.support_scripture ?? []).map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from('lanes').update({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      notes: data.notes?.trim() || null,
      support_scripture: scriptures.length ? scriptures : null,
      ends_at: data.ends_at || null,
    }).eq('lane_id', data.id).eq('user_id', userId);
    if (error) return { error: friendlyLaneError(error, data.title.trim()) };
    return { success: true };
  });


export const updateLaneStatus = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    status: z.enum(['active', 'paused', 'archived']),
    reason: z.string().max(500).optional().nullable(),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lane } = await supabase.from('lanes').select('title').eq('lane_id', data.id).eq('user_id', userId).single();
    const reason = data.reason?.trim() || '';
    if ((data.status === 'paused' || data.status === 'archived') && !reason) {
      return { error: 'A short reason is required — your watchman will see it.' };
    }
    const { error } = await supabase.from('lanes').update({ status: data.status }).eq('lane_id', data.id).eq('user_id', userId);
    if (error) return { error: error.message };
    if (data.status === 'paused' || data.status === 'archived') {
      const verb = data.status === 'paused' ? 'paused' : 'archived';
      const body = `This path was ${verb}. Reason given: "${reason}"`;
      for (const w of await activeWatchmen(data.id)) {
        if (!w.watchman_id) continue;
        await supabaseAdmin.from('notifications').insert({
          lane_id: data.id, partner_id: w.watchman_id, type: 'path_status',
          status: 'sent', message_content: body, sent_at: new Date().toISOString(),
        });
        try {
          await sendPushToUser(w.watchman_id, {
            title: `Path ${verb} — ${lane?.title}`,
            body,
            url: '/partner',
          });
        } catch {}
      }
    }
    return { success: true };
  });

export const deleteLane = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), reason: z.string().max(500).optional().nullable() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lane } = await supabase.from('lanes').select('created_at, title').eq('lane_id', data.id).eq('user_id', userId).single();
    if (!lane) return { error: 'Path not found.' };
    // Delete is only available while no watchman is locked in — nobody to notify.
    if ((await activeWatchmen(data.id)).length > 0) {
      return { error: 'This path has a watchman. Use Pause or Archive instead.' };
    }

    const { error } = await supabase.from('lanes').delete().eq('lane_id', data.id).eq('user_id', userId);
    if (error) return { error: error.message };
    return { success: true };
  });

/** Bring an archived path back onto the walk, subject to the active-path cap. */
export const reactivateLane = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const denied = await requireAccess(supabase as any, userId);
    if (denied) return denied;
    const { data: lane } = await supabase.from('lanes').select('lane_id, status')
      .eq('lane_id', data.id).eq('user_id', userId).maybeSingle();
    if (!lane || lane.status !== 'archived') return { error: 'Path not found in your archive.' };
    const { count } = await supabase.from('lanes').select('lane_id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'active');
    if ((count ?? 0) >= 10) {
      return { error: 'You already have 10 active paths. Archive one before bringing this back.' };
    }
    const { error } = await supabase.from('lanes').update({ status: 'active' })
      .eq('lane_id', data.id).eq('user_id', userId);
    if (error) return { error: error.message };
    return { success: true };
  });

/** Permanently remove an archived path and everything recorded on it. */
export const deleteArchivedLane = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lane } = await supabase.from('lanes').select('lane_id, status')
      .eq('lane_id', data.id).eq('user_id', userId).maybeSingle();
    if (!lane || lane.status !== 'archived') return { error: 'Only archived paths can be deleted.' };
    // Check-ins, alerts, watchman seats and encouragements cascade with the row.
    const { error } = await supabase.from('lanes').delete().eq('lane_id', data.id).eq('user_id', userId);
    if (error) return { error: error.message };
    return { success: true };
  });



// ===== Check-in =====

export const getDashboard = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { today } = await userDay(supabase, userId);
    const [{ data: profile }, { data: lanes }, { data: todayChks }, { count: unread }] = await Promise.all([
      supabase.from('profiles').select('first_name, gender').eq('user_id', userId).single(),
      supabase.from('lanes').select('lane_id, title, status, lane_type, description').eq('user_id', userId).eq('status', 'active'),
      supabase.from('checkins').select('lane_id, status').eq('user_id', userId).eq('checkin_date', today),
      supabase.from('encouragements').select('id', { count: 'exact', head: true }).eq('owner_id', userId).is('read_at', null),
    ]);
    return {
      profile: profile ?? null,
      lanes: lanes ?? [],
      todayCheckins: todayChks ?? [],
      unreadEncouragements: unread ?? 0,
    };
  });

/** Small, cheap poll used by the nav to show an unread-encouragement dot. */
export const getUnreadEncouragementCount = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { count } = await supabase.from('encouragements')
      .select('id', { count: 'exact', head: true }).eq('owner_id', userId).is('read_at', null);
    return { count: count ?? 0 };
  });

export const getCheckinPage = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { tz, today, yesterday: yest } = await userDay(supabase, userId);
    const { data: lanes } = await supabase.from('lanes')
      .select('lane_id, title, description, lane_type, created_at').eq('user_id', userId).eq('status', 'active');
    const ids = (lanes ?? []).map((l) => l.lane_id);
    const { data: chks } = ids.length
      ? await supabase.from('checkins').select('lane_id, checkin_date, status, completion_time')
        .eq('user_id', userId).in('checkin_date', [today, yest]).in('lane_id', ids)
      : { data: [] };

    // Catch-up is derived from the ABSENCE of yesterday's entry, not from a
    // "missed" row — that row is only written by the 10 AM sweep, so before
    // 10 AM the grace window is open with nothing to show otherwise.
    const yestRows = new Set((chks ?? []).filter((c) => c.checkin_date === yest).map((c) => c.lane_id));
    const catchUp = (lanes ?? [])
      .filter((l) => !yestRows.has(l.lane_id) && localDate(tz, new Date((l as any).created_at)) <= yest)
      .map((l) => l.lane_id);
    const graceOpen = localHour(tz) < 10;

    return { lanes: lanes ?? [], checkins: chks ?? [], today, yesterday: yest, catchUp, graceOpen };
  });

export const logComplete = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ laneId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const denied = await requireAccess(supabase as any, userId);
    if (denied) return denied;
    const { today } = await userDay(supabase, userId);
    await supabase.from('checkins').upsert(
      { lane_id: data.laneId, user_id: userId, checkin_date: today, status: 'completed', completion_time: new Date().toISOString() },
      { onConflict: 'lane_id,checkin_date' },
    );
    return { success: true };
  });

export const revertComplete = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ laneId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { today, yesterday } = await userDay(supabase, userId);
    const { data: rows } = await supabase.from('checkins')
      .select('checkin_id, completion_time, checkin_date').eq('lane_id', data.laneId).eq('user_id', userId)
      .in('checkin_date', [today, yesterday]).eq('status', 'completed')
      .order('checkin_date', { ascending: false });
    const c = (rows ?? [])[0];
    if (!c) return { error: 'No completed check-in to undo.' };
    const ageMin = (Date.now() - new Date(c.completion_time!).getTime()) / 60000;
    if (ageMin > 30) return { error: 'Check-ins can only be undone within 30 minutes.' };
    await supabase.from('checkins').delete().eq('checkin_id', c.checkin_id);
    return { success: true };
  });

export const submitCheckin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    laneId: z.string().uuid(),
    response: z.enum(['aligned', 'breach']),
    explanation: z.string().max(1000).optional().nullable(),
    forDay: z.enum(['today', 'yesterday']).optional(),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const denied = await requireAccess(supabase as any, userId);
    if (denied) return denied;
    if (data.response === 'breach' && !data.explanation?.trim()) return { error: 'Explanation required when reporting a breach.' };
    if (data.response === 'breach' && (data.explanation ?? '').trim().length < 5) {
      return { error: 'Write at least a few words about what happened.' };
    }
    const { data: lane } = await supabase.from('lanes').select('lane_id, title')
      .eq('lane_id', data.laneId).eq('user_id', userId).eq('status', 'active').single();
    if (!lane) return { error: 'Path not found or inactive.' };
    const { today, yesterday } = await userDay(supabase, userId);
    // The page says which day it is answering for; fall back to the old
    // behaviour (a written "missed" row means yesterday is the open one).
    let target = today;
    if (data.forDay === 'yesterday') {
      target = yesterday;
    } else if (!data.forDay) {
      const { data: missedY } = await supabase.from('checkins').select('checkin_id')
        .eq('lane_id', data.laneId).eq('checkin_date', yesterday).eq('status', 'missed').maybeSingle();
      if (missedY) target = yesterday;
    }
    const { data: chk, error } = await supabase.from('checkins').upsert({
      lane_id: data.laneId, user_id: userId, checkin_date: target,
      status: data.response === 'aligned' ? 'completed' : 'breached',
      completion_time: new Date().toISOString(),
      breach_explanation: data.response === 'breach' ? data.explanation : null,
    }, { onConflict: 'lane_id,checkin_date' }).select('checkin_id').single();
    if (error) return { error: error.message };
    if (data.response === 'breach') {
      await triggerBreachAlert({
        checkinId: chk!.checkin_id, laneId: data.laneId, laneTitle: lane.title, userId,
      });
    }

    return { success: true };
  });

export const skipCheckin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ laneId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const denied = await requireAccess(supabase as any, userId);
    if (denied) return denied;
    const { data: lane } = await supabase.from('lanes').select('lane_id, title')
      .eq('lane_id', data.laneId).eq('user_id', userId).eq('status', 'active').single();
    if (!lane) return { error: 'Path not found.' };
    const { today } = await userDay(supabase, userId);
    const { error } = await supabase.from('checkins').upsert({
      lane_id: data.laneId, user_id: userId, checkin_date: today,
      status: 'skipped', completion_time: new Date().toISOString(),
    }, { onConflict: 'lane_id,checkin_date' });
    if (error) return { error: error.message };
    await notifyPartnerSkip({ laneId: data.laneId, laneTitle: lane.title, userId });

    return { success: true };
  });

// ===== Partner view =====
export const getPartnerView = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { today } = await userDay(supabase, userId);

    // Source of truth is path_watchmen — a second watchman has no lanes.partner_id.
    const myPathIds = await watchedPathIds(userId);
    const { data: lanes } = myPathIds.length
      ? await supabase.from('lanes')
        .select('lane_id, title, description, notes, status, created_at, user_id')
        .in('lane_id', myPathIds).order('status').order('created_at', { ascending: false })
      : { data: [] as any[] };

    // My own seat on each path carries the relationship label.
    const { data: mySeats } = myPathIds.length
      ? await supabaseAdmin.from('path_watchmen')
        .select('path_id, relationship').eq('watchman_id', userId).eq('status', 'active')
      : { data: [] as any[] };
    const relByPath = new Map((mySeats ?? []).map((s: any) => [s.path_id, s.relationship]));

    const userIds = [...new Set((lanes ?? []).map((l) => l.user_id))];
    const ownerEmails = new Map<string, { email: string; phone: string | null; first_name: string | null }>();
    if (userIds.length) {
      const { data: ps } = await supabaseAdmin.from('profiles').select('user_id, email, phone, first_name').in('user_id', userIds);
      for (const p of ps ?? []) ownerEmails.set(p.user_id, { email: p.email, phone: p.phone, first_name: p.first_name });
    }
    const laneIds = (lanes ?? []).map((l) => l.lane_id);
    const { data: todayChks } = laneIds.length
      ? await supabase.from('checkins')
        .select('checkin_id, lane_id, status, breach_explanation, completion_time')
        .in('lane_id', laneIds).eq('checkin_date', today)
      : { data: [] };
    const { data: history } = laneIds.length
      ? await supabase.from('checkins').select('checkin_id, lane_id, checkin_date, status').in('lane_id', laneIds).order('checkin_date', { ascending: false })
      : { data: [] };

    // The most recent breach/silent day per path — what an encouragement answers.
    const latestAlert = new Map<string, { checkin_id: string; checkin_date: string; status: string; label: string }>();
    for (const c of (history ?? []) as any[]) {
      if (latestAlert.has(c.lane_id)) continue;
      if (c.status !== 'breached' && c.status !== 'missed') continue;
      const label = alertContextLabel(c.checkin_date, c.status);
      if (label) latestAlert.set(c.lane_id, { checkin_id: c.checkin_id, checkin_date: c.checkin_date, status: c.status, label });
    }

    const { data: notifications } = await supabase.from('notifications')
      .select('notification_id, type, status, message_content, sent_at, lane_id')
      .eq('partner_id', userId).order('sent_at', { ascending: false }).limit(20);
    const { count: ownLaneCount } = await supabase.from('lanes').select('lane_id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'active');
    const { count: myEncouragementCount } = await supabase.from('encouragements')
      .select('id', { count: 'exact', head: true }).eq('watchman_id', userId);
    const { data: sentEncouragementRows } = await supabase.from('encouragements')
      .select('id, body, created_at, lane_id, checkin_id')
      .eq('watchman_id', userId).order('created_at', { ascending: false }).limit(5);
    const laneTitles = new Map((lanes ?? []).map((l) => [l.lane_id, l.title]));
    const chkById = new Map(((history ?? []) as any[]).map((c) => [c.checkin_id, c]));
    const sentEncouragements = (sentEncouragementRows ?? []).map((e: any) => {
      const c = e.checkin_id ? chkById.get(e.checkin_id) : null;
      return {
        ...e,
        lane_title: laneTitles.get(e.lane_id) ?? 'Path',
        context: c ? alertContextLabel(c.checkin_date, c.status) : null,
      };
    });
    const { data: profile } = await supabase.from('profiles')
      .select('dismissed_watchman_prompt').eq('user_id', userId).maybeSingle();
    return {
      lanes: (lanes ?? []).map((l) => ({
        ...l,
        partner_relationship: relByPath.get(l.lane_id) ?? null,
        owner: ownerEmails.get(l.user_id) ?? null,
        latestAlert: latestAlert.get(l.lane_id) ?? null,
      })),
      todayCheckins: todayChks ?? [], history: history ?? [],
      notifications: notifications ?? [],
      showNudge: (ownLaneCount ?? 0) === 0,
      myActiveLaneCount: ownLaneCount ?? 0,
      myEncouragementCount: myEncouragementCount ?? 0,
      sentEncouragements,
      dismissedWatchmanPrompt: !!profile?.dismissed_watchman_prompt,
    };
  });

export const sendEncouragement = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    laneId: z.string().uuid(),
    body: z.string().min(1).max(280),
    checkinId: z.string().uuid().optional().nullable(),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!(await isActiveWatchman(data.laneId, userId))) {
      return { error: 'You are not an active watchman on this path.' };
    }
    const { data: lane } = await supabaseAdmin.from('lanes')
      .select('lane_id, user_id, title, status')
      .eq('lane_id', data.laneId).maybeSingle();
    if (!lane || lane.status !== 'active') return { error: 'You are not an active watchman on this path.' };

    // Only accept an alert reference that really belongs to this path.
    let checkinId: string | null = null;
    if (data.checkinId) {
      const { data: c } = await supabaseAdmin.from('checkins')
        .select('checkin_id').eq('checkin_id', data.checkinId).eq('lane_id', data.laneId).maybeSingle();
      checkinId = c?.checkin_id ?? null;
    }

    const body = data.body.trim();
    const { error } = await supabase.from('encouragements').insert({
      watchman_id: userId, lane_id: data.laneId, owner_id: lane.user_id, body, checkin_id: checkinId,
    });
    if (error) return { error: error.message };
    // Mirror to notifications so the owner sees it in-app.
    await supabaseAdmin.from('notifications').insert({
      lane_id: data.laneId, partner_id: lane.user_id, type: 'encouragement',
      status: 'sent', message_content: body, sent_at: new Date().toISOString(),
    });
    try {
      await sendPushToUser(lane.user_id, {
        title: `Encouragement — ${lane.title}`,
        body,
        url: `/paths/${data.laneId}`,
      });
    } catch {}
    return { success: true };
  });


// ===== Settings =====
export const getSettings = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from('profiles')
      .select('email, first_name, last_name, phone, timezone, bedtime, gender').eq('user_id', userId).single();
    const { data: archived } = await supabase.from('lanes')
      .select('lane_id, title, created_at').eq('user_id', userId).eq('status', 'archived').order('created_at', { ascending: false });
    return { profile: profile ?? null, archivedLanes: archived ?? [] };
  });

// ===== VAPID public key for client =====
export const getVapidPublicKey = createServerFn({ method: 'GET' }).handler(async () => {
  return { key: process.env.VAPID_PUBLIC_KEY || '' };
});

// ===== Admin =====
async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
  if (!data) throw new Error('Forbidden');
}

export const getAdminOverview = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const today = localDate(DEFAULT_TZ);
    let weekAgoStr = today;
    for (let i = 0; i < 7; i++) weekAgoStr = prevDay(weekAgoStr);
    const [users, lanes, doneT, missT, brT, failed, newWeek] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('lanes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('checkins').select('*', { count: 'exact', head: true }).eq('checkin_date', today).eq('status', 'completed'),
      supabaseAdmin.from('checkins').select('*', { count: 'exact', head: true }).eq('checkin_date', today).eq('status', 'missed'),
      supabaseAdmin.from('checkins').select('*', { count: 'exact', head: true }).eq('checkin_date', today).eq('status', 'breached'),
      supabaseAdmin.from('notifications').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgoStr),
    ]);
    return {
      totalUsers: users.count ?? 0, activeLanes: lanes.count ?? 0,
      todayCheckins: doneT.count ?? 0, todayMissed: missT.count ?? 0, todayBreaches: brT.count ?? 0,
      failedNotifs: failed.count ?? 0, newUsersWeek: newWeek.count ?? 0,
    };
  });

export const getAdminUsers = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data } = await supabaseAdmin.from('profiles')
      .select('user_id, email, phone, status, created_at, last_active, timezone')
      .order('created_at', { ascending: false });
    return { users: data ?? [] };
  });

export const setUserStatus = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ user_id: z.string().uuid(), status: z.enum(['active', 'suspended']) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    await supabaseAdmin.from('profiles').update({ status: data.status }).eq('user_id', data.user_id);
    return { ok: true };
  });

export const isAdmin = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', context.userId).eq('role', 'admin').maybeSingle();
    return { admin: !!data };
  });

export const markEncouragementsRead = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ ids: z.array(z.string().uuid()).max(20) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.ids.length) return { success: true };
    await supabase.from('encouragements')
      .update({ read_at: new Date().toISOString() })
      .in('id', data.ids).eq('owner_id', userId).is('read_at', null);
    return { success: true };
  });
