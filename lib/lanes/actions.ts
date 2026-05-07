'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendPartnerInvite } from '@/lib/resend/invite'
import webpush from 'web-push'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

async function pushToPartner(partnerId: string, title: string, body: string) {
  const supabase = await createServiceClient()
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', partnerId)

  for (const sub of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url: '/partner' })
      )
    } catch {
      await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
    }
  }
}

export async function createLane(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const partnerEmail = (formData.get('partner_email') as string).trim().toLowerCase()
  const laneType = formData.get('lane_type') as 'avoid' | 'complete'
  const scriptures = ['1', '2', '3']
    .map(n => (formData.get(`support_scripture_${n}`) as string | null)?.trim() || '')
    .filter(Boolean)
  const supportScripture = scriptures.length > 0 ? scriptures : null

  // Get current user's profile for the invite
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('email, first_name, last_name')
    .eq('user_id', user.id)
    .single()

  if (partnerEmail === userProfile?.email?.toLowerCase()) {
    return { error: 'You cannot assign yourself as a partner.' }
  }

  // Enforce max 10 active lanes per user
  const { count: userLaneCount } = await supabase
    .from('lanes')
    .select('lane_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  if ((userLaneCount ?? 0) >= 10) {
    return { error: 'You have reached the maximum of 10 active lanes.' }
  }

  // Check if partner already has an account
  const { data: partnerProfile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('email', partnerEmail)
    .single()

  // Enforce max 2 active lanes per partner (by user_id or email)
  if (partnerProfile) {
    const { count } = await supabase
      .from('lanes')
      .select('lane_id', { count: 'exact', head: true })
      .eq('partner_id', partnerProfile.user_id)
      .eq('status', 'active')

    if ((count ?? 0) >= 2) {
      return { error: 'That partner already has 2 active lanes. Choose a different partner.' }
    }
  } else {
    // Check pending invites count for this email
    const { count } = await supabase
      .from('lanes')
      .select('lane_id', { count: 'exact', head: true })
      .eq('partner_email', partnerEmail)
      .eq('status', 'active')
      .is('partner_id', null)

    if ((count ?? 0) >= 2) {
      return { error: 'That partner already has 2 active lanes pending. Choose a different partner.' }
    }
  }

  const { error } = await supabase.from('lanes').insert({
    user_id: user.id,
    partner_id: partnerProfile?.user_id ?? null,
    partner_email: partnerEmail,
    title,
    description: description || null,
    support_scripture: supportScripture,
    lane_type: laneType,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You already have a lane with that title.' }
    return { error: error.message }
  }

  // Send invite if partner doesn't have an account yet
  if (!partnerProfile) {
    try {
      const fromName = userProfile?.first_name && userProfile?.last_name
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : null
      await sendPartnerInvite({
        toEmail: partnerEmail,
        fromEmail: userProfile?.email ?? user.email ?? 'Someone',
        fromName,
        laneTitle: title,
      })
    } catch {
      // Don't block lane creation if email fails
    }
  }

  revalidatePath('/lanes')
  redirect('/lanes')
}

export async function updateLaneStatus(laneId: string, status: 'active' | 'paused' | 'archived') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lane } = await supabase
    .from('lanes')
    .select('title, partner_id')
    .eq('lane_id', laneId)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('lanes')
    .update({ status })
    .eq('lane_id', laneId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  if (status === 'archived' && lane?.partner_id) {
    try {
      await pushToPartner(
        lane.partner_id,
        `Lane archived — ${lane.title}`,
        'Your partner has archived this accountability lane.'
      )
    } catch {
      // Don't block if push fails
    }
  }

  revalidatePath('/lanes')
  revalidatePath(`/lanes/${laneId}`)
}

export async function updateLane(laneId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const scriptures = ['1', '2', '3']
    .map(n => (formData.get(`support_scripture_${n}`) as string | null)?.trim() || '')
    .filter(Boolean)
  const supportScripture = scriptures.length > 0 ? scriptures : null

  const { error } = await supabase
    .from('lanes')
    .update({ title, description: description || null, support_scripture: supportScripture })
    .eq('lane_id', laneId)
    .eq('user_id', user.id)

  if (error) {
    if (error.code === '23505') return { error: 'You already have a lane with that title.' }
    return { error: error.message }
  }

  revalidatePath('/lanes')
  revalidatePath(`/lanes/${laneId}`)
  redirect(`/lanes/${laneId}`)
}

export async function deleteLane(laneId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lane } = await supabase
    .from('lanes')
    .select('created_at')
    .eq('lane_id', laneId)
    .eq('user_id', user.id)
    .single()

  if (!lane) return { error: 'Lane not found.' }

  const ageMinutes = (Date.now() - new Date(lane.created_at).getTime()) / 60000
  if (ageMinutes > 10) {
    return { error: 'Lanes older than 10 minutes cannot be deleted. Use Archive instead.' }
  }

  const { count } = await supabase
    .from('checkins')
    .select('checkin_id', { count: 'exact', head: true })
    .eq('lane_id', laneId)

  if ((count ?? 0) > 0) {
    return { error: 'This lane already has check-ins and cannot be deleted. Use Archive instead.' }
  }

  const { error } = await supabase
    .from('lanes')
    .delete()
    .eq('lane_id', laneId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/lanes')
  redirect('/lanes')
}
