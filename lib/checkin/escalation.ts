import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/server'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

async function push(userId: string, payload: object, url: string, supabase: Awaited<ReturnType<typeof createServiceClient>>) {
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subscriptions?.length) return false

  let sent = false
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ ...payload, url })
      )
      sent = true
    } catch {
      await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
    }
  }
  return sent
}

// Breach — immediate, goes straight to partner
export async function triggerBreachAlert({ checkinId, laneId, laneTitle, partnerId, userId }: {
  checkinId: string
  laneId: string
  laneTitle: string
  partnerId: string
  userId: string
}) {
  const supabase = await createServiceClient()

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('email, phone')
    .eq('user_id', userId)
    .single()

  const body = userProfile?.phone
    ? `${userProfile.email} reported a breach. Phone: ${userProfile.phone}`
    : `${userProfile?.email} reported a breach. Open to view details.`

  const { data: notification } = await supabase
    .from('notifications')
    .insert({
      lane_id: laneId,
      partner_id: partnerId,
      checkin_id: checkinId,
      type: 'breach_report',
      status: 'pending',
      message_content: body,
    })
    .select('notification_id')
    .single()

  const sent = await push(partnerId, { title: `Breach — ${laneTitle}`, body }, '/partner', supabase)

  if (notification) {
    await supabase.from('notifications').update({
      status: sent ? 'sent' : 'failed',
      sent_at: sent ? new Date().toISOString() : null,
    }).eq('notification_id', notification.notification_id)
  }
}

// Missed step 1 — user gets a nudge, overnight grace window
export async function notifyUserMissed({ checkinId, laneId, laneTitle, userId }: {
  checkinId: string
  laneId: string
  laneTitle: string
  userId: string
}) {
  const supabase = await createServiceClient()

  await push(
    userId,
    {
      title: `Missed check-in — ${laneTitle}`,
      body: 'You didn\'t check in today. Submit before morning or your partner will be notified.',
    },
    '/checkin',
    supabase
  )
}

// Sabbath skip — partner gets a quiet notice
export async function notifyPartnerSkip({ laneId, laneTitle, partnerId, userId }: {
  laneId: string
  laneTitle: string
  partnerId: string
  userId: string
}) {
  const supabase = await createServiceClient()

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('email')
    .eq('user_id', userId)
    .single()

  const body = `${userProfile?.email ?? 'Your partner'} is observing the Sabbath. No check-in today.`

  await push(partnerId, { title: `Sabbath — ${laneTitle}`, body }, '/partner', supabase)
}

// Missed step 2 — user didn't self-correct, partner is notified
export async function notifyPartnerMissed({ checkinId, laneId, laneTitle, partnerId, userId }: {
  checkinId: string
  laneId: string
  laneTitle: string
  partnerId: string
  userId: string
}) {
  const supabase = await createServiceClient()

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('email, phone')
    .eq('user_id', userId)
    .single()

  const body = userProfile?.phone
    ? `${userProfile.email} missed their check-in and didn't respond. Phone: ${userProfile.phone}`
    : `${userProfile?.email} missed their check-in and didn't respond overnight.`

  const { data: notification } = await supabase
    .from('notifications')
    .insert({
      lane_id: laneId,
      partner_id: partnerId,
      checkin_id: checkinId,
      type: 'missed_checkin',
      status: 'pending',
      message_content: body,
    })
    .select('notification_id')
    .single()

  const sent = await push(partnerId, { title: `Missed — ${laneTitle}`, body }, '/partner', supabase)

  if (notification) {
    await supabase.from('notifications').update({
      status: sent ? 'sent' : 'failed',
      sent_at: sent ? new Date().toISOString() : null,
    }).eq('notification_id', notification.notification_id)
  }
}
