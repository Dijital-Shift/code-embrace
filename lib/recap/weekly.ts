import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/server'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendWeeklyRecaps() {
  const supabase = await createServiceClient()

  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const from = weekAgo.toISOString().split('T')[0]
  const to = today.toISOString().split('T')[0]

  // Get all active users with push subscriptions
  const { data: users } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('status', 'active')

  if (!users?.length) return

  for (const { user_id } of users) {
    const { data: checkins } = await supabase
      .from('checkins')
      .select('status')
      .eq('user_id', user_id)
      .gte('checkin_date', from)
      .lt('checkin_date', to)

    if (!checkins?.length) continue

    const total = checkins.length
    const aligned = checkins.filter(c => c.status === 'completed').length
    const breached = checkins.filter(c => c.status === 'breached').length
    const missed = checkins.filter(c => c.status === 'missed').length

    const body = buildRecapMessage(aligned, breached, missed, total)

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user_id)

    if (!subscriptions?.length) continue

    const payload = JSON.stringify({
      title: 'Weekly Recap',
      body,
      url: '/dashboard',
    })

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      } catch {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      }
    }
  }
}

function buildRecapMessage(aligned: number, breached: number, missed: number, total: number): string {
  const clean = breached === 0 && missed === 0

  if (clean && total > 0) return `${aligned}/${total} days aligned. Clean week. Keep going.`
  if (aligned === 0) return `No aligned days this week. Reset and recommit.`

  const issues = []
  if (breached > 0) issues.push(`${breached} breach${breached > 1 ? 'es' : ''}`)
  if (missed > 0) issues.push(`${missed} missed`)

  return `${aligned}/${total} days aligned. ${issues.join(', ')} this week.`
}
