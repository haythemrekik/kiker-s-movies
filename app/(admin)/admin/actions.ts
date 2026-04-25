'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function generateCode(formData: FormData) {
  const supabaseAdmin = createAdminClient()
  
  const videoId = formData.get('videoId') as string
  const userId = formData.get('userId') as string
  const expiresInHours = formData.get('expiresInHours') as string
  
  if (!videoId) {
    console.error('Video ID is required')
    return
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
    console.error('Failed to generate code:', error)
    return
  }

  revalidatePath('/admin')
}

export async function getSignedUploadUrl(fileName: string, contentType: string) {
  const supabaseAdmin = createAdminClient()
  
  // Clean file name: replace spaces with hyphens, remove special chars
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-]/g, '-').toLowerCase()
  const path = `${Date.now()}-${safeName}`

  const { data, error } = await supabaseAdmin
    .storage
    .from('videos')
    .createSignedUploadUrl(path)

  if (error || !data) {
    console.error('Failed to create upload URL', error)
    return { error: 'Impossible de créer l\'URL d\'upload' }
  }

  return { signedUrl: data.signedUrl, token: data.token, path }
}

export async function saveVideoRecord(title: string, description: string, path: string) {
  if (!title || !path) {
    return { error: 'Le titre et le fichier vidéo sont obligatoires' }
  }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin.from('videos').insert({
    title,
    description: description || null,
    video_path: path
  })

  if (error) {
    console.error('Failed to save video record:', error)
    return { error: 'Échec de l\'enregistrement de la vidéo' }
  }


  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

