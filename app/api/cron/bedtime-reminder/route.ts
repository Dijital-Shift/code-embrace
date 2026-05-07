import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Runs every hour — notifies users whose bedtime reminder falls on this UTC hour
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const currentUtcHour = new Date().getUTCHours()

  // Find users whose precomputed reminder hour matches now
  const { data: users } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('reminder_utc_hour', currentUtcHour)
    .eq('status', 'active')

  if (!users?.length) return NextResponse.json({ ok: true, notified: 0 })

  const today = new Date().toISOString().split('T')[0]
  let notified = 0

  for (const { user_id } of users) {
    // Only remind if they have pending lanes
    const { data: pending } = await supabase
      .from('lanes')
      .select('lane_id')
      .eq('user_id', user_id)
      .eq('status', 'active')

    if (!pending?.length) continue

    const { data: done } = await supabase
      .from('checkins')
      .select('lane_id')
      .eq('user_id', user_id)
      .eq('checkin_date', today)

    const doneIds = new Set((done ?? []).map(c => c.lane_id))
    const pendingCount = pending.filter(l => !doneIds.has(l.lane_id)).length

    if (pendingCount === 0) continue

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user_id)

    if (!subs?.length) continue

    const payload = JSON.stringify({
      title: 'Time to check in',
      body: `${pendingCount} lane${pendingCount > 1 ? 's' : ''} pending. Takes less than 30 seconds.`,
      url: '/checkin',
    })

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        notified++
      } catch {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      }
    }
  }

  return NextResponse.json({ ok: true, notified })
}
