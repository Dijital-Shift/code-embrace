import { sendPushToUser } from './push.server';
import { sendSms, SMS_BREACH, SMS_SILENCE } from './sms.server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { localParts, localDate, prevDay, DEFAULT_TZ } from './localday';
import { activeWatchmen } from './watchmen.server';

// Deliver one alert to one watchman: record it, push it, SMS only as fallback.
async function deliverToWatchman(args: {
  laneId: string;
  checkinId?: string | null;
  watchmanId: string;
  watchmanPhone: string | null;
  type: string;
  body: string;
  title: string;
  smsFallback: string;
}): Promise<boolean> {
  const { data: notif } = await supabaseAdmin.from('notifications').insert({
    lane_id: args.laneId,
    partner_id: args.watchmanId,
    checkin_id: args.checkinId ?? null,
    type: args.type,
    status: 'pending',
    message_content: args.body,
  }).select('notification_id').single();

  const sent = await sendPushToUser(args.watchmanId, { title: args.title, body: args.body, url: '/partner' });

  // Fallback only — never dual-send. Generic copy; no details over SMS.
  let channel: 'push' | 'sms' | null = sent ? 'push' : null;
  if (!sent && (await sendSms(args.watchmanPhone, args.smsFallback))) channel = 'sms';

  if (notif) {
    await supabaseAdmin.from('notifications').update({
      status: channel ? 'sent' : 'failed',
      sent_at: channel ? new Date().toISOString() : null,
      channel,
    }).eq('notification_id', notif.notification_id);
  }
  return !!channel;
}

// Every active watchman on the path is pinged immediately on a self-reported breach.
export async function triggerBreachAlert(args: {
  checkinId: string; laneId: string; laneTitle: string; userId: string;
}) {
  const watchmen = await activeWatchmen(args.laneId);
  if (!watchmen.length) return;
  const { data: u } = await supabaseAdmin.from('profiles').select('email, phone').eq('user_id', args.userId).single();
  const body = u?.phone ? `${u.email} reported a breach. Phone: ${u.phone}` : `${u?.email} reported a breach. Open to view details.`;

  for (const w of watchmen) {
    if (!w.watchman_id) continue;
    await deliverToWatchman({
      laneId: args.laneId, checkinId: args.checkinId, watchmanId: w.watchman_id,
      watchmanPhone: w.phone, type: 'breach_report', body,
      title: `Breach — ${args.laneTitle}`, smsFallback: SMS_BREACH,
    });
  }
}


// Sabbath skip — quiet notice to every active watchman.
export async function notifyPartnerSkip(args: { laneId: string; laneTitle: string; userId: string }) {
  const watchmen = await activeWatchmen(args.laneId);
  if (!watchmen.length) return;
  const { data: u } = await supabaseAdmin.from('profiles').select('email').eq('user_id', args.userId).single();
  for (const w of watchmen) {
    if (!w.watchman_id) continue;
    await sendPushToUser(w.watchman_id, {
      title: `Sabbath — ${args.laneTitle}`,
      body: `${u?.email ?? 'Your partner'} is observing the Sabbath. No check-in today.`,
      url: '/partner',
    });
  }
}





// Silence Rule threshold 2 — runs frequently.
// For each active lane, once the user's *local* clock is past 10:00 AM and
// they have no check-in for their local "yesterday", mark it missed and ping
// the watchman. Fixed 10 AM grace window — same yardstick for everyone.
// Idempotent — safe to re-run.
//
// Notification policy: alert rows are written per path (full detail lives in
// alert history), but PUSHES are bundled — one per person per run, however
// many paths went silent. Nobody's phone gets carpet-bombed.
export async function markMissedCheckins() {
  const nowUtc = new Date();
  const utcToday = nowUtc.toISOString().split('T')[0];

  // Auto-archive expired time-bound paths (date-based, tz-agnostic).
  await supabaseAdmin.from('lanes').update({ status: 'archived' })
    .eq('status', 'active').not('ends_at', 'is', null).lt('ends_at', utcToday);

  const { data: activeLanes } = await supabaseAdmin.from('lanes')
    .select('lane_id, title, user_id, created_at').eq('status', 'active');
  if (!activeLanes?.length) return { processed: 0, watchmenPinged: 0 };

  // Pull user timezones.
  const userIds = Array.from(new Set(activeLanes.map((l: any) => l.user_id)));
  const { data: profs } = await supabaseAdmin.from('profiles')
    .select('user_id, timezone, email, first_name').in('user_id', userIds);
  const tzMap = new Map((profs ?? []).map((p: any) => [p.user_id, p.timezone || 'America/Chicago']));
  const nameMap = new Map((profs ?? []).map((p: any) => [p.user_id, p.first_name || p.email]));

  let processed = 0;
  let watchmenPinged = 0;

  // Bundled push buckets, filled during the sweep and flushed at the end.
  const ownerSilent = new Map<string, string[]>();                       // ownerId -> path titles
  type WatchPending = { notificationIds: string[]; phone: string | null; owners: Map<string, string[]> };
  const watchQueue = new Map<string, WatchPending>();                    // watchmanId -> pending

  for (const lane of activeLanes) {
    const tz = tzMap.get(lane.user_id) ?? 'America/Chicago';
    const { date: localToday, hour: localHour } = localParts(nowUtc, tz);

    // Grace window is open until 10 AM local time.
    if (localHour < 10) continue;

    const yesterdayLocal = prevDay(localToday);

    // Never manufacture history: a path cannot be silent on a day it did not exist.
    const createdLocal = localParts(new Date(lane.created_at), tz).date;
    if (yesterdayLocal < createdLocal) continue;

    // Skip if yesterday already has any check-in (held, breached, missed, skipped).
    const { data: existing } = await supabaseAdmin.from('checkins')
      .select('checkin_id').eq('lane_id', lane.lane_id).eq('checkin_date', yesterdayLocal).maybeSingle();
    if (existing) continue;

    // Insert (or fetch) yesterday's missed check-in. Unique on (lane_id, checkin_date).
    let { data: ci } = await supabaseAdmin.from('checkins').insert({
      lane_id: lane.lane_id, user_id: lane.user_id, checkin_date: yesterdayLocal, status: 'missed',
    }).select('checkin_id').single();
    if (!ci) {
      const again = await supabaseAdmin.from('checkins')
        .select('checkin_id').eq('lane_id', lane.lane_id).eq('checkin_date', yesterdayLocal).maybeSingle();
      ci = again.data;
    }
    if (!ci) continue;
    processed++;

    // Owner push is bundled — collect, don't send yet.
    const bucket = ownerSilent.get(lane.user_id) ?? [];
    bucket.push(lane.title);
    ownerSilent.set(lane.user_id, bucket);

    // Threshold 2 — watchmen are only pinged on a SILENCE STREAK:
    // yesterday missed AND the day before also missed. Day 1 is the user's alone.
    const watchmen = await activeWatchmen(lane.lane_id);
    if (!watchmen.length) continue;
    const dayBefore = prevDay(yesterdayLocal);
    const { data: priorMiss } = await supabaseAdmin.from('checkins')
      .select('checkin_id').eq('lane_id', lane.lane_id).eq('checkin_date', dayBefore)
      .eq('status', 'missed').maybeSingle();
    if (!priorMiss) continue; // day 1 — user only

    const who = nameMap.get(lane.user_id) ?? 'Your partner';
    const body = `${who} has gone silent on "${lane.title}" two days running. Reach out.`;

    for (const w of watchmen) {
      if (!w.watchman_id) continue;
      // One alert per watchman per path per silent day — survives overlapping runs.
      const { data: prior } = await supabaseAdmin.from('notifications')
        .select('notification_id').eq('checkin_id', ci.checkin_id)
        .eq('type', 'missed_checkin').eq('partner_id', w.watchman_id).maybeSingle();
      if (prior) continue;

      const { data: notif } = await supabaseAdmin.from('notifications').insert({
        lane_id: lane.lane_id, partner_id: w.watchman_id, checkin_id: ci.checkin_id,
        type: 'missed_checkin', status: 'pending', message_content: body,
      }).select('notification_id').single();

      const pending = watchQueue.get(w.watchman_id) ?? { notificationIds: [], phone: w.phone, owners: new Map() };
      if (notif) pending.notificationIds.push(notif.notification_id);
      const titles = pending.owners.get(who) ?? [];
      titles.push(lane.title);
      pending.owners.set(who, titles);
      watchQueue.set(w.watchman_id, pending);
    }
  }

  // ---- Flush: one push per person, whatever the path count. ----

  for (const [ownerId, titles] of ownerSilent) {
    const body = titles.length === 1
      ? `Yesterday went silent on "${titles[0]}". The grace window has closed.`
      : `${titles.length} paths went silent yesterday. The grace window has closed.`;
    await sendPushToUser(ownerId, {
      title: titles.length === 1 ? `Silent — ${titles[0]}` : 'Silent — yesterday',
      body,
      url: '/checkin',
    });
  }

  for (const [watchmanId, pending] of watchQueue) {
    const owners = [...pending.owners.entries()];
    const pathCount = owners.reduce((n, [, t]) => n + t.length, 0);
    let title: string;
    let body: string;
    if (owners.length === 1 && pathCount === 1) {
      const [who, titles] = owners[0]!;
      title = `Silence — ${titles[0]}`;
      body = `${who} has gone silent on "${titles[0]}" two days running. Reach out.`;
    } else if (owners.length === 1) {
      const [who, titles] = owners[0]!;
      title = `Silence — ${who}`;
      body = `${who} has gone silent on ${titles.length} paths, two days running. Reach out.`;
    } else {
      title = 'Silence — your watch';
      body = `${owners.length} people you watch have gone silent, two days running. Reach out.`;
    }

    const sent = await sendPushToUser(watchmanId, { title, body, url: '/partner' });
    let channel: 'push' | 'sms' | null = sent ? 'push' : null;
    if (!sent && (await sendSms(pending.phone, SMS_SILENCE))) channel = 'sms';
    if (channel) watchmenPinged++;

    if (pending.notificationIds.length) {
      await supabaseAdmin.from('notifications').update({
        status: channel ? 'sent' : 'failed',
        sent_at: channel ? new Date().toISOString() : null,
        channel,
      }).in('notification_id', pending.notificationIds);
    }
  }

  return { processed, watchmenPinged };
}

export async function sendBedtimeReminders() {
  const utcHour = new Date().getUTCHours();
  const { data: profiles } = await supabaseAdmin.from('profiles')
    .select('user_id, timezone').eq('status', 'active').eq('reminder_utc_hour', utcHour);
  if (!profiles?.length) return { sent: 0 };
  let sent = 0;
  for (const p of profiles) {
    const today = localDate((p as any).timezone || DEFAULT_TZ);
    const { data: lanes } = await supabaseAdmin.from('lanes')
      .select('lane_id').eq('user_id', p.user_id).eq('status', 'active');
    if (!lanes?.length) continue;
    const { data: cs } = await supabaseAdmin.from('checkins')
      .select('lane_id').eq('user_id', p.user_id).eq('checkin_date', today);
    const checked = new Set((cs ?? []).map((c: any) => c.lane_id));
    const pending = lanes.filter((l: any) => !checked.has(l.lane_id)).length;
    if (pending > 0) {
      await sendPushToUser(p.user_id, {
        title: 'Check-in reminder', body: `${pending} path${pending !== 1 ? 's' : ''} pending before bed.`, url: '/checkin',
      });
      sent++;
    }
  }
  return { sent };
}
