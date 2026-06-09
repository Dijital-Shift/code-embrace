import { sendPushToUser } from './push.server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

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
  if (notif) {
    await supabaseAdmin.from('notifications').update({
      status: sent ? 'sent' : 'failed', sent_at: sent ? new Date().toISOString() : null,
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

// User missed today's check-in → nudge the user (not the watchman).
export async function notifyUserMissed(args: { laneTitle: string; userId: string }) {
  await sendPushToUser(args.userId, {
    title: `Missed check-in — ${args.laneTitle}`,
    body: "You didn't check in today. Submit before the day closes.",
    url: '/checkin',
  });
}

// Marks today's missing check-ins as `missed`, nudges the user, and pings the
// assigned watchman (Silence Rule threshold 2). Idempotent — safe to re-run.
export async function markMissedCheckins() {
  const today = new Date().toISOString().split('T')[0];

  await supabaseAdmin.from('lanes').update({ status: 'archived' })
    .eq('status', 'active').not('ends_at', 'is', null).lt('ends_at', today);

  const { data: activeLanes } = await supabaseAdmin.from('lanes')
    .select('lane_id, partner_id, title, user_id').eq('status', 'active');
  if (!activeLanes?.length) return { processed: 0, watchmenPinged: 0 };
  const { data: todayCheckins } = await supabaseAdmin.from('checkins').select('lane_id').eq('checkin_date', today);
  const checkedIds = new Set((todayCheckins ?? []).map((c: any) => c.lane_id));
  const missed = activeLanes.filter((l: any) => !checkedIds.has(l.lane_id));

  let watchmenPinged = 0;
  for (const lane of missed) {
    // Insert (or fetch) today's missed check-in. Unique on (lane_id, checkin_date).
    let { data: ci } = await supabaseAdmin.from('checkins').insert({
      lane_id: lane.lane_id, user_id: lane.user_id, checkin_date: today, status: 'missed',
    }).select('checkin_id').single();
    if (!ci) {
      const existing = await supabaseAdmin.from('checkins')
        .select('checkin_id').eq('lane_id', lane.lane_id).eq('checkin_date', today).maybeSingle();
      ci = existing.data;
    }
    if (!ci) continue;

    await notifyUserMissed({ laneTitle: lane.title, userId: lane.user_id });

    // Threshold 2 — ping the watchman. Skip if already pinged for this check-in.
    if (!lane.partner_id) continue;
    const { data: prior } = await supabaseAdmin.from('notifications')
      .select('notification_id').eq('checkin_id', ci.checkin_id).eq('type', 'missed_checkin').maybeSingle();
    if (prior) continue;

    const { data: u } = await supabaseAdmin.from('profiles')
      .select('email').eq('user_id', lane.user_id).single();
    const body = `${u?.email ?? 'Your partner'} went silent on "${lane.title}" today. Reach out.`;
    const { data: notif } = await supabaseAdmin.from('notifications').insert({
      lane_id: lane.lane_id, partner_id: lane.partner_id, checkin_id: ci.checkin_id,
      type: 'missed_checkin', status: 'pending', message_content: body,
    }).select('notification_id').single();
    const sent = await sendPushToUser(lane.partner_id, {
      title: `Silence — ${lane.title}`, body, url: '/partner',
    });
    if (notif) {
      await supabaseAdmin.from('notifications').update({
        status: sent ? 'sent' : 'failed', sent_at: sent ? new Date().toISOString() : null,
      }).eq('notification_id', notif.notification_id);
    }
    if (sent) watchmenPinged++;
  }
  return { processed: missed.length, watchmenPinged };
}

export async function sendBedtimeReminders() {
  const utcHour = new Date().getUTCHours();
  const { data: profiles } = await supabaseAdmin.from('profiles')
    .select('user_id').eq('status', 'active').eq('reminder_utc_hour', utcHour);
  if (!profiles?.length) return { sent: 0 };
  const today = new Date().toISOString().split('T')[0];
  let sent = 0;
  for (const p of profiles) {
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
