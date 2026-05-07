'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function sendOtp(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string).trim().toLowerCase()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })

  if (error) return { error: error.message }
  return { success: true, email }
}

export async function verifyOtp(formData: FormData) {
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const token = (formData.get('token') as string).trim()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) return { error: 'Invalid or expired code. Try again.' }

  let isNewUser = false

  if (data.user) {
    const { data: existing } = await serviceSupabase
      .from('profiles')
      .select('user_id, first_name')
      .eq('user_id', data.user.id)
      .single()

    isNewUser = !existing

    await serviceSupabase.from('profiles').upsert(
      { user_id: data.user.id, email },
      { onConflict: 'user_id' }
    )

    // Auto-link pending lanes — use service client to bypass RLS
    await serviceSupabase
      .from('lanes')
      .update({ partner_id: data.user.id })
      .eq('partner_email', email)
      .is('partner_id', null)

    // Check if this user has partner lanes assigned
    const { count: partnerLaneCount } = await serviceSupabase
      .from('lanes')
      .select('lane_id', { count: 'exact', head: true })
      .eq('partner_id', data.user.id)
      .eq('status', 'active')

    revalidatePath('/', 'layout')

    if (isNewUser || !existing?.first_name) {
      redirect('/onboarding')
    } else if ((partnerLaneCount ?? 0) > 0) {
      redirect('/partner')
    } else {
      redirect('/dashboard')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
