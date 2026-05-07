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

export async function notifyUserMissed(args: { laneTitle: string; userId: string }) {
  await sendPushToUser(args.userId, {
    title: `Missed check-in — ${args.laneTitle}`,
    body: "You didn't check in today. Submit before morning or your partner will be notified.",
    url: '/checkin',
  });
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
