import { sendPushToUser } from './push.server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

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

export async function notifyUserMissed(args: { laneTitle: string; userId: string; checkinId?: string; laneId?: string }) {
  await sendPushToUser(args.userId, {
    title: `Missed check-in — ${args.laneTitle}`,
    body: "You didn't check in today. Submit before morning or your partner will be notified.",
    url: '/checkin',
  });
}

export async function markMissedCheckins() {
  const today = new Date().toISOString().split('T')[0];
  const { data: activeLanes } = await supabaseAdmin.from('lanes')
    .select('lane_id, partner_id, title, user_id').eq('status', 'active').eq('escalation_enabled', true);
  if (!activeLanes?.length) return { processed: 0 };
  const { data: todayCheckins } = await supabaseAdmin.from('checkins').select('lane_id').eq('checkin_date', today);
  const checkedIds = new Set((todayCheckins ?? []).map((c: any) => c.lane_id));
  const missed = activeLanes.filter((l: any) => !checkedIds.has(l.lane_id));
  for (const lane of missed) {
    const { data: ci } = await supabaseAdmin.from('checkins').insert({
      lane_id: lane.lane_id, user_id: lane.user_id, checkin_date: today, status: 'missed',
    }).select('checkin_id').single();
    if (ci) await notifyUserMissed({ laneTitle: lane.title, userId: lane.user_id, checkinId: ci.checkin_id, laneId: lane.lane_id });
  }
  return { processed: missed.length };
}

export async function escalateMissedToPartners() {
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  const { data: unresolved } = await supabaseAdmin.from('checkins')
    .select('checkin_id, lane_id, user_id').eq('checkin_date', yStr).eq('status', 'missed');
  if (!unresolved?.length) return { processed: 0 };
  const laneIds = unresolved.map((c: any) => c.lane_id);
  const { data: lanes } = await supabaseAdmin.from('lanes')
    .select('lane_id, partner_id, title').in('lane_id', laneIds).eq('escalation_enabled', true);
  const laneMap = new Map((lanes ?? []).map((l: any) => [l.lane_id, l]));
  let processed = 0;
  for (const ci of unresolved) {
    const lane: any = laneMap.get(ci.lane_id);
    if (!lane || !lane.partner_id) continue;
    await notifyPartnerMissed({ checkinId: ci.checkin_id, laneId: lane.lane_id, laneTitle: lane.title, partnerId: lane.partner_id, userId: ci.user_id });
    processed++;
  }
  return { processed };
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
        title: 'Check-in reminder', body: `${pending} lane${pending !== 1 ? 's' : ''} pending before bed.`, url: '/checkin',
      });
      sent++;
    }
  }
  return { sent };
}

export async function notifyPartnerSkip(args: { laneTitle: string; partnerId: string; userId: string }) {
  const { data: u } = await supabaseAdmin.from('profiles').select('email').eq('user_id', args.userId).single();
  await sendPushToUser(args.partnerId, {
    title: `Sabbath — ${args.laneTitle}`,
    body: `${u?.email ?? 'Your partner'} is observing the Sabbath. No check-in today.`,
    url: '/partner',
  });
}

export async function notifyPartnerMissed(args: {
  checkinId: string; laneId: string; laneTitle: string; partnerId: string; userId: string;
}) {
  const { data: u } = await supabaseAdmin.from('profiles').select('email, phone').eq('user_id', args.userId).single();
  const body = u?.phone ? `${u.email} missed their check-in. Phone: ${u.phone}` : `${u?.email} missed their check-in and didn't respond overnight.`;
  const { data: notif } = await supabaseAdmin.from('notifications').insert({
    lane_id: args.laneId, partner_id: args.partnerId, checkin_id: args.checkinId,
    type: 'missed_checkin', status: 'pending', message_content: body,
  }).select('notification_id').single();
  const sent = await sendPushToUser(args.partnerId, { title: `Missed — ${args.laneTitle}`, body, url: '/partner' });
  if (notif) {
    await supabaseAdmin.from('notifications').update({
      status: sent ? 'sent' : 'failed', sent_at: sent ? new Date().toISOString() : null,
    }).eq('notification_id', notif.notification_id);
  }
}
