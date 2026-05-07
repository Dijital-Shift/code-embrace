'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function suspendUser(formData: FormData) {
  await requireAdmin()
  const supabase = await createServiceClient()
  const userId = formData.get('user_id') as string

  await supabase.from('profiles').update({ status: 'suspended' }).eq('user_id', userId)
  revalidatePath('/admin/users')
}

export async function activateUser(formData: FormData) {
  await requireAdmin()
  const supabase = await createServiceClient()
  const userId = formData.get('user_id') as string

  await supabase.from('profiles').update({ status: 'active' }).eq('user_id', userId)
  revalidatePath('/admin/users')
}
