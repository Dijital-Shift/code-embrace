import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

import { sendPushToUser } from './push.server';
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
    const [hh] = data.bedtime.split(':').map(Number);
    const reminderHour = hh === 0 ? 23 : hh - 1;
    let utcOffset = 0;
    try {
      const d = new Date();
      const utcStr = d.toLocaleString('en-US', { timeZone: 'UTC', hour12: false, hour: 'numeric' });
      const tzStr = d.toLocaleString('en-US', { timeZone: data.timezone, hour12: false, hour: 'numeric' });
      utcOffset = (parseInt(tzStr) - parseInt(utcStr) + 24) % 24;
    } catch {}
    const reminder_utc_hour = ((reminderHour - utcOffset) + 24) % 24;
    const update: Record<string, any> = {
      first_name: data.first_name || null, last_name: data.last_name || null,
      phone: data.phone || null, bedtime: data.bedtime, timezone: data.timezone, reminder_utc_hour,
    };
    if (data.gender) update.gender = data.gender;
    const { error } = await supabase.from('profiles').update(update).eq('user_id', userId);
    if (error) return { error: error.message };
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
    await supabaseAdmin.from('lanes').update({ partner_id: userId })
      .eq('partner_email', email).is('partner_id', null);
    // Seed admin role if email in ADMIN_EMAILS
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (admins.includes(email)) {
      await supabaseAdmin.from('user_roles').upsert({ user_id: userId, role: 'admin' as any }, { onConflict: 'user_id,role' });
    }
    return { ok: true };
  });

// ===== Lanes =====
export const listMyLanes = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from('lanes')
      .select('lane_id, title, description, notes, status, created_at, partner_email, partner_id, lane_type, support_scripture, ends_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data ?? [];

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
    if (!lane) return { lane: null, checkins: [], partnerEmail: null };
    let partnerEmail: string | null = null;
    if (lane.partner_id) {
      const { data: p } = await supabaseAdmin.from('profiles').select('email').eq('user_id', lane.partner_id).single();
      partnerEmail = p?.email ?? null;
    }
    const { data: checkins } = await supabase
      .from('checkins').select('checkin_date, status').eq('lane_id', data.id)
      .order('checkin_date', { ascending: false }).limit(14);
    return { lane, checkins: checkins ?? [], partnerEmail };
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

    const { count: ownLaneCount } = await supabase.from('lanes')
      .select('lane_id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'active');
    if ((ownLaneCount ?? 0) >= 10) return { error: 'You have reached the maximum of 10 active paths.' };

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
    if (error) return { error: error.message };
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
    if (error) return { error: error.message };
    return { success: true };
  });


export const updateLaneStatus = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), status: z.enum(['active', 'paused', 'archived']) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lane } = await supabase.from('lanes').select('title, partner_id').eq('lane_id', data.id).eq('user_id', userId).single();
    const { error } = await supabase.from('lanes').update({ status: data.status }).eq('lane_id', data.id).eq('user_id', userId);
    if (error) return { error: error.message };
    if (data.status === 'archived' && lane?.partner_id) {
      try {
        await sendPushToUser(lane.partner_id, {
          title: `Lane archived — ${lane.title}`,
          body: 'Your partner has archived this accountability lane.',
          url: '/partner',
        });
      } catch {}
    }
    return { success: true };
  });

export const deleteLane = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lane } = await supabase.from('lanes').select('created_at').eq('lane_id', data.id).eq('user_id', userId).single();
    if (!lane) return { error: 'Lane not found.' };
    const ageMin = (Date.now() - new Date(lane.created_at).getTime()) / 60000;
    if (ageMin > 10) return { error: 'Lanes older than 10 minutes cannot be deleted. Use Archive instead.' };
    const { count } = await supabase.from('checkins').select('checkin_id', { count: 'exact', head: true }).eq('lane_id', data.id);
    if ((count ?? 0) > 0) return { error: 'This lane already has check-ins. Use Archive instead.' };
    const { error } = await supabase.from('lanes').delete().eq('lane_id', data.id).eq('user_id', userId);
    if (error) return { error: error.message };
    return { success: true };
  });

// ===== Check-in =====
function todayStr() { return new Date().toISOString().split('T')[0]; }
function yesterdayStr() {
  const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0];
}

export const getDashboard = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = todayStr();
    const [{ data: profile }, { data: lanes }, { data: todayChks }] = await Promise.all([
      supabase.from('profiles').select('first_name, gender').eq('user_id', userId).single(),
      supabase.from('lanes').select('lane_id, title, status, lane_type, description').eq('user_id', userId).eq('status', 'active'),
      supabase.from('checkins').select('lane_id, status').eq('user_id', userId).eq('checkin_date', today),
    ]);
    return { profile: profile ?? null, lanes: lanes ?? [], todayCheckins: todayChks ?? [] };
  });

export const getCheckinPage = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = todayStr();
    const yest = yesterdayStr();
    const { data: lanes } = await supabase.from('lanes')
      .select('lane_id, title, description, lane_type').eq('user_id', userId).eq('status', 'active');
    const ids = (lanes ?? []).map((l) => l.lane_id);
    const { data: chks } = ids.length
      ? await supabase.from('checkins').select('lane_id, checkin_date, status')
        .eq('user_id', userId).in('checkin_date', [today, yest]).in('lane_id', ids)
      : { data: [] };
    return { lanes: lanes ?? [], checkins: chks ?? [], today, yesterday: yest };
  });

export const logComplete = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ laneId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from('checkins').upsert(
      { lane_id: data.laneId, user_id: userId, checkin_date: todayStr(), status: 'completed', completion_time: new Date().toISOString() },
      { onConflict: 'lane_id,checkin_date' },
    );
    return { success: true };
  });

export const revertComplete = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ laneId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: c } = await supabase.from('checkins')
      .select('checkin_id, completion_time').eq('lane_id', data.laneId).eq('user_id', userId)
      .eq('checkin_date', todayStr()).eq('status', 'completed').single();
    if (!c) return { error: 'No completed check-in for today.' };
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
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.response === 'breach' && !data.explanation?.trim()) return { error: 'Explanation required when reporting a breach.' };
    const { data: lane } = await supabase.from('lanes').select('lane_id, partner_id, title')
      .eq('lane_id', data.laneId).eq('user_id', userId).eq('status', 'active').single();
    if (!lane) return { error: 'Lane not found or inactive.' };
    const { data: missedY } = await supabase.from('checkins').select('checkin_id')
      .eq('lane_id', data.laneId).eq('checkin_date', yesterdayStr()).eq('status', 'missed').maybeSingle();
    const target = missedY ? yesterdayStr() : todayStr();
    const { data: chk, error } = await supabase.from('checkins').upsert({
      lane_id: data.laneId, user_id: userId, checkin_date: target,
      status: data.response === 'aligned' ? 'completed' : 'breached',
      completion_time: new Date().toISOString(),
      breach_explanation: data.response === 'breach' ? data.explanation : null,
    }, { onConflict: 'lane_id,checkin_date' }).select('checkin_id').single();
    if (error) return { error: error.message };
    if (data.response === 'breach' && lane.partner_id) {
      await triggerBreachAlert({
        checkinId: chk!.checkin_id, laneId: data.laneId, laneTitle: lane.title,
        partnerId: lane.partner_id, userId,
      });
    }
    return { success: true };
  });

export const skipCheckin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ laneId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lane } = await supabase.from('lanes').select('lane_id, partner_id, title')
      .eq('lane_id', data.laneId).eq('user_id', userId).eq('status', 'active').single();
    if (!lane) return { error: 'Lane not found.' };
    const { error } = await supabase.from('checkins').upsert({
      lane_id: data.laneId, user_id: userId, checkin_date: todayStr(),
      status: 'skipped', completion_time: new Date().toISOString(),
    }, { onConflict: 'lane_id,checkin_date' });
    if (error) return { error: error.message };
    if (lane.partner_id) {
      await notifyPartnerSkip({ laneTitle: lane.title, partnerId: lane.partner_id, userId });
    }
    return { success: true };
  });

// ===== Partner view =====
export const getPartnerView = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = todayStr();
    const { data: lanes } = await supabase.from('lanes')
      .select('lane_id, title, description, notes, status, created_at, user_id, partner_relationship')
      .eq('partner_id', userId).order('status').order('created_at', { ascending: false });
    const userIds = [...new Set((lanes ?? []).map((l) => l.user_id))];
    const ownerEmails = new Map<string, { email: string; phone: string | null; first_name: string | null }>();
    if (userIds.length) {
      const { data: ps } = await supabaseAdmin.from('profiles').select('user_id, email, phone, first_name').in('user_id', userIds);
      for (const p of ps ?? []) ownerEmails.set(p.user_id, { email: p.email, phone: p.phone, first_name: p.first_name });
    }
    const laneIds = (lanes ?? []).map((l) => l.lane_id);
    const { data: todayChks } = laneIds.length
      ? await supabase.from('checkins')
        .select('lane_id, status, breach_explanation, completion_time')
        .in('lane_id', laneIds).eq('checkin_date', today)
      : { data: [] };
    const { data: history } = laneIds.length
      ? await supabase.from('checkins').select('lane_id, checkin_date, status').in('lane_id', laneIds).order('checkin_date', { ascending: false })
      : { data: [] };
    const { data: notifications } = await supabase.from('notifications')
      .select('notification_id, type, status, message_content, sent_at, lane_id')
      .eq('partner_id', userId).order('sent_at', { ascending: false }).limit(20);
    const { count: ownLaneCount } = await supabase.from('lanes').select('lane_id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'active');
    const { count: myEncouragementCount } = await supabase.from('encouragements')
      .select('id', { count: 'exact', head: true }).eq('watchman_id', userId);
    const { data: profile } = await supabase.from('profiles')
      .select('dismissed_watchman_prompt').eq('user_id', userId).maybeSingle();
    return {
      lanes: (lanes ?? []).map((l) => ({ ...l, owner: ownerEmails.get(l.user_id) ?? null })),
      todayCheckins: todayChks ?? [], history: history ?? [],
      notifications: notifications ?? [],
      showNudge: (ownLaneCount ?? 0) === 0,
      myActiveLaneCount: ownLaneCount ?? 0,
      myEncouragementCount: myEncouragementCount ?? 0,
      dismissedWatchmanPrompt: !!profile?.dismissed_watchman_prompt,
    };
  });

export const sendEncouragement = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ laneId: z.string().uuid(), body: z.string().min(1).max(280) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lane } = await supabase.from('lanes')
      .select('lane_id, user_id, title, status')
      .eq('lane_id', data.laneId).eq('partner_id', userId).maybeSingle();
    if (!lane || lane.status !== 'active') return { error: 'You are not an active watchman on this path.' };
    const body = data.body.trim();
    const { error } = await supabase.from('encouragements').insert({
      watchman_id: userId, lane_id: data.laneId, owner_id: lane.user_id, body,
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
        url: '/dashboard',
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
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
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
