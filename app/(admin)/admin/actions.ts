'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { b2Client, B2_BUCKET } from '@/lib/b2/client'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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
  // Clean file name: replace spaces with hyphens, remove special chars
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-]/g, '-').toLowerCase()
  const path = `${Date.now()}-${safeName}`

  try {
    const command = new PutObjectCommand({
      Bucket: B2_BUCKET,
      Key: path,
      ContentType: contentType,
    })

    const signedUrl = await getSignedUrl(b2Client, command, { expiresIn: 3600 })
    return { signedUrl, path }
  } catch (error) {
    console.error('Failed to create B2 upload URL', error)
    return { error: 'Impossible de créer l\'URL d\'upload B2' }
  }
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

