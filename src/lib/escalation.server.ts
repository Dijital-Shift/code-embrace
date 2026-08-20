import { sendPushToUser } from './push.server';
import { sendSms, SMS_BREACH, SMS_SILENCE } from './sms.server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { localParts, localDate, prevDay, DEFAULT_TZ } from './localday';

// Watchman is pinged immediately on a self-reported breach.
export async function triggerBreachAlert(args: {
  checkinId: string; laneId: string; laneTitle: string; partnerId: string; userId: string;
}) {
  const { data: u } = await supabaseAdmin.from('profiles').select('email, phone').eq('user_id', args.userId).single();
  const body = u?.phone ? `${u.email} reported a breach. Phone: ${u.phone}` : `${u?.email} reported a breach. Open to view details.`;
  const { data: notif } = await supabaseAdmin.from('notifications').insert({
    lane_id: args.laneId, partner_id: args.partnerId, checkin_id: args.checkinId,
    type: 'breach_report', status: 'pending', message_content: body,
  }).select('notification_id').single();
  const sent = await sendPushToUser(args.partnerId, { title: `Breach — ${args.laneTitle}`, body, url: '/partner' });

  // Fallback only — never dual-send. Generic copy; no details over SMS.
  let channel: 'push' | 'sms' | null = sent ? 'push' : null;
  if (!sent) {
    const { data: p } = await supabaseAdmin.from('profiles').select('phone').eq('user_id', args.partnerId).single();
    if (await sendSms(p?.phone, SMS_BREACH)) channel = 'sms';
  }

  if (notif) {
    await supabaseAdmin.from('notifications').update({
      status: channel ? 'sent' : 'failed', sent_at: channel ? new Date().toISOString() : null, channel,
    }).eq('notification_id', notif.notification_id);
  }
}


// Sabbath skip — quiet notice to the watchman.
export async function notifyPartnerSkip(args: { laneTitle: string; partnerId: string; userId: string }) {
  const { data: u } = await supabaseAdmin.from('profiles').select('email').eq('user_id', args.userId).single();
  await sendPushToUser(args.partnerId, {
    title: `Sabbath — ${args.laneTitle}`,
    body: `${u?.email ?? 'Your partner'} is observing the Sabbath. No check-in today.`,
    url: '/partner',
  });
}

// Nudge the user that yesterday's check-in is overdue.
export async function notifyUserMissed(args: { laneTitle: string; userId: string }) {
  await sendPushToUser(args.userId, {
    title: `Silent — ${args.laneTitle}`,
    body: "Yesterday went silent — no check-in. The grace window has closed.",
    url: '/checkin',
  });
}

// Silence Rule threshold 2 — runs frequently.
// For each active lane, once the user's *local* clock is past 10:00 AM and
// they have no check-in for their local "yesterday", mark it missed and ping
// the watchman. Fixed 10 AM grace window — same yardstick for everyone.
// Idempotent — safe to re-run.
export async function markMissedCheckins() {
  const nowUtc = new Date();
  const utcToday = nowUtc.toISOString().split('T')[0];

  // Auto-archive expired time-bound paths (date-based, tz-agnostic).
  await supabaseAdmin.from('lanes').update({ status: 'archived' })
    .eq('status', 'active').not('ends_at', 'is', null).lt('ends_at', utcToday);

  const { data: activeLanes } = await supabaseAdmin.from('lanes')
    .select('lane_id, partner_id, title, user_id, created_at').eq('status', 'active');
  if (!activeLanes?.length) return { processed: 0, watchmenPinged: 0 };

  // Pull user timezones.
  const userIds = Array.from(new Set(activeLanes.map((l: any) => l.user_id)));
  const { data: profs } = await supabaseAdmin.from('profiles')
    .select('user_id, timezone, email').in('user_id', userIds);
  const tzMap = new Map((profs ?? []).map((p: any) => [p.user_id, p.timezone || 'America/Chicago']));
  const emailMap = new Map((profs ?? []).map((p: any) => [p.user_id, p.email]));

  let processed = 0;
  let watchmenPinged = 0;

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

    await notifyUserMissed({ laneTitle: lane.title, userId: lane.user_id });

    // Threshold 2 — the watchman is only pinged on a SILENCE STREAK:
    // yesterday missed AND the day before also missed. Day 1 is the user's alone.
    if (!lane.partner_id) continue;
    const dayBefore = prevDay(yesterdayLocal);
    const { data: priorMiss } = await supabaseAdmin.from('checkins')
      .select('checkin_id').eq('lane_id', lane.lane_id).eq('checkin_date', dayBefore)
      .eq('status', 'missed').maybeSingle();
    if (!priorMiss) continue; // day 1 — user only

    // Dedup: never ping twice for the same check-in.
    const { data: prior } = await supabaseAdmin.from('notifications')
      .select('notification_id').eq('checkin_id', ci.checkin_id).eq('type', 'missed_checkin').maybeSingle();
    if (prior) continue;

    const email = emailMap.get(lane.user_id);
    const body = `${email ?? 'Your partner'} has gone silent on "${lane.title}" two days running. Reach out.`;
    const { data: notif } = await supabaseAdmin.from('notifications').insert({
      lane_id: lane.lane_id, partner_id: lane.partner_id, checkin_id: ci.checkin_id,
      type: 'missed_checkin', status: 'pending', message_content: body,
    }).select('notification_id').single();
    const sent = await sendPushToUser(lane.partner_id, {
      title: `Silence — ${lane.title}`, body, url: '/partner',
    });

    // Fallback only — never dual-send. Generic copy over SMS.
    let channel: 'push' | 'sms' | null = sent ? 'push' : null;
    if (!sent) {
      const { data: pp } = await supabaseAdmin.from('profiles').select('phone').eq('user_id', lane.partner_id).single();
      if (await sendSms(pp?.phone, SMS_SILENCE)) channel = 'sms';
    }

    if (notif) {
      await supabaseAdmin.from('notifications').update({
        status: channel ? 'sent' : 'failed', sent_at: channel ? new Date().toISOString() : null, channel,
      }).eq('notification_id', notif.notification_id);
    }
    if (channel) watchmenPinged++;

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
