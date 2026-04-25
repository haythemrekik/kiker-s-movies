'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function generateCode(formData: FormData) {
  const supabaseAdmin = createAdminClient()
  
  const videoId = formData.get('videoId') as string
  const userId = formData.get('userId') as string
  const expiresInHours = formData.get('expiresInHours') as string
  
  if (!videoId) {
    return { error: 'Video ID is required' }
  }

  const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase() + '-' + Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()

  let expiresAt = null
  if (expiresInHours) {
    const date = new Date()
    date.setHours(date.getHours() + parseInt(expiresInHours))
    expiresAt = date.toISOString()
  }

  const { error } = await supabaseAdmin.from('access_codes').insert({
    code,
    video_id: videoId,
    user_id: userId || null,
    expires_at: expiresAt,
  })

  if (error) {
    return { error: 'Failed to generate code' }
  }

  revalidatePath('/admin')
  return { success: true }
}
