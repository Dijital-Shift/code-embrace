'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const first_name = (formData.get('first_name') as string).trim()
  const last_name = (formData.get('last_name') as string).trim()

  if (!first_name || !last_name) return { error: 'Please enter your full name.' }

  const { error } = await supabase
    .from('profiles')
    .update({ first_name, last_name })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const first_name = (formData.get('first_name') as string).trim()
  const last_name = (formData.get('last_name') as string).trim()
  const phone = (formData.get('phone') as string).trim().replace(/\s/g, '')
  const bedtime = formData.get('bedtime') as string
  const timezone = formData.get('timezone') as string

  const reminderUtcHour = computeReminderUtcHour(bedtime, timezone)

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: first_name || null,
      last_name: last_name || null,
      phone: phone || null,
      bedtime,
      timezone,
      reminder_utc_hour: reminderUtcHour,
    })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}

function computeReminderUtcHour(bedtime: string, timezone: string): number {
  const [hours] = bedtime.split(':').map(Number)
  const reminderHour = hours === 0 ? 23 : hours - 1
  try {
    const date = new Date()
    const utcOffset = getUtcOffsetHours(date, timezone)
    return ((reminderHour - utcOffset) + 24) % 24
  } catch {
    return reminderHour
  }
}

function getUtcOffsetHours(date: Date, timezone: string): number {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC', hour12: false, hour: 'numeric' })
  const tzStr = date.toLocaleString('en-US', { timeZone: timezone, hour12: false, hour: 'numeric' })
  return (parseInt(tzStr) - parseInt(utcStr) + 24) % 24
}
