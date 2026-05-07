'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { notifyUserMissed, notifyPartnerMissed, triggerBreachAlert, notifyPartnerSkip } from '@/lib/checkin/escalation'

// One-tap complete for Complete-type lanes
export async function logComplete(laneId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: lane } = await supabase
    .from('lanes')
    .select('lane_id')
    .eq('lane_id', laneId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('lane_type', 'complete')
    .single()

  if (!lane) return { error: 'Lane not found.' }

  await supabase.from('checkins').upsert(
    {
      lane_id: laneId,
      user_id: user.id,
      checkin_date: today,
      status: 'completed',
      completion_time: new Date().toISOString(),
    },
    { onConflict: 'lane_id,checkin_date' }
  )

  revalidatePath('/checkin')
  revalidatePath('/dashboard')
}

// Revert an accidental complete — only within 30 minutes
export async function revertComplete(laneId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: checkin } = await supabase
    .from('checkins')
    .select('checkin_id, completion_time')
    .eq('lane_id', laneId)
    .eq('checkin_date', today)
    .eq('status', 'completed')
    .eq('user_id', user.id)
    .single()

  if (!checkin) return { error: 'No completed check-in found for today.' }

  const ageMinutes = (Date.now() - new Date(checkin.completion_time).getTime()) / 60000
  if (ageMinutes > 30) return { error: 'Check-ins can only be undone within 30 minutes.' }

  await supabase
    .from('checkins')
    .delete()
    .eq('checkin_id', checkin.checkin_id)

  revalidatePath('/checkin')
  revalidatePath('/dashboard')
}

// Avoid-type lane check-in — yes/no with breach explanation
export async function submitCheckin(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const laneId = formData.get('lane_id') as string
  const response = formData.get('response') as 'aligned' | 'breach'
  const explanation = (formData.get('explanation') as string | null)?.trim() || null

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (response === 'breach' && !explanation) {
    return { error: 'Explanation required when reporting a breach.' }
  }

  const { data: lane } = await supabase
    .from('lanes')
    .select('lane_id, partner_id, title')
    .eq('lane_id', laneId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!lane) return { error: 'Lane not found or inactive.' }

  // Allow late submission against yesterday if still marked missed
  const { data: missedYesterday } = await supabase
    .from('checkins')
    .select('checkin_id')
    .eq('lane_id', laneId)
    .eq('checkin_date', yesterdayStr)
    .eq('status', 'missed')
    .single()

  const targetDate = missedYesterday ? yesterdayStr : today

  const { data: checkin, error } = await supabase
    .from('checkins')
    .upsert(
      {
        lane_id: laneId,
        user_id: user.id,
        checkin_date: targetDate,
        status: response === 'aligned' ? 'completed' : 'breached',
        completion_time: new Date().toISOString(),
        breach_explanation: response === 'breach' ? explanation : null,
      },
      { onConflict: 'lane_id,checkin_date' }
    )
    .select('checkin_id')
    .single()

  if (error) return { error: error.message }

  if (response === 'breach') {
    await triggerBreachAlert({
      checkinId: checkin.checkin_id,
      laneId,
      laneTitle: lane.title,
      partnerId: lane.partner_id,
      userId: user.id,
    })
  }

  revalidatePath('/checkin')
  revalidatePath('/dashboard')
}

// Sabbath skip — logs 'skipped', partner notified (not a breach)
export async function skipCheckin(laneId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: lane } = await supabase
    .from('lanes')
    .select('lane_id, partner_id, title')
    .eq('lane_id', laneId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!lane) return { error: 'Lane not found.' }

  const { error } = await supabase.from('checkins').upsert(
    {
      lane_id: laneId,
      user_id: user.id,
      checkin_date: today,
      status: 'skipped',
      completion_time: new Date().toISOString(),
    },
    { onConflict: 'lane_id,checkin_date' }
  )

  if (error) return { error: error.message }

  if (lane.partner_id) {
    await notifyPartnerSkip({
      laneId,
      laneTitle: lane.title,
      partnerId: lane.partner_id,
      userId: user.id,
    })
  }

  revalidatePath('/checkin')
  revalidatePath('/dashboard')
}

// 11PM cron — mark missed, notify user only
export async function markMissedCheckins() {
  const { createServiceClient } = await import('@/lib/supabase/server')
  const supabase = await createServiceClient()

  const today = new Date().toISOString().split('T')[0]

  const { data: activeLanes } = await supabase
    .from('lanes')
    .select('lane_id, partner_id, title, user_id')
    .eq('status', 'active')
    .eq('escalation_enabled', true)

  if (!activeLanes?.length) return

  const { data: todayCheckins } = await supabase
    .from('checkins')
    .select('lane_id')
    .eq('checkin_date', today)

  const checkedIds = new Set((todayCheckins ?? []).map(c => c.lane_id))
  const missed = activeLanes.filter(l => !checkedIds.has(l.lane_id))

  for (const lane of missed) {
    const { data: checkin } = await supabase
      .from('checkins')
      .insert({
        lane_id: lane.lane_id,
        user_id: lane.user_id,
        checkin_date: today,
        status: 'missed',
      })
      .select('checkin_id')
      .single()

    if (checkin) {
      await notifyUserMissed({
        checkinId: checkin.checkin_id,
        laneId: lane.lane_id,
        laneTitle: lane.title,
        userId: lane.user_id,
      })
    }
  }
}

// 7AM cron — escalate unresolved misses to partner
export async function escalateMissedToPartners() {
  const { createServiceClient } = await import('@/lib/supabase/server')
  const supabase = await createServiceClient()

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const { data: unresolved } = await supabase
    .from('checkins')
    .select('checkin_id, lane_id, user_id')
    .eq('checkin_date', yesterdayStr)
    .eq('status', 'missed')

  if (!unresolved?.length) return

  const laneIds = unresolved.map(c => c.lane_id)
  const { data: lanes } = await supabase
    .from('lanes')
    .select('lane_id, partner_id, title')
    .in('lane_id', laneIds)
    .eq('escalation_enabled', true)

  const laneMap = new Map((lanes ?? []).map(l => [l.lane_id, l]))

  for (const checkin of unresolved) {
    const lane = laneMap.get(checkin.lane_id)
    if (!lane) continue

    await notifyPartnerMissed({
      checkinId: checkin.checkin_id,
      laneId: lane.lane_id,
      laneTitle: lane.title,
      partnerId: lane.partner_id,
      userId: checkin.user_id,
    })
  }
}
