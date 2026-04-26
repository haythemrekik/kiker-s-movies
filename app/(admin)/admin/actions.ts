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
  console.log('--- getSignedUploadUrl called ---')
  console.log('B2_BUCKET:', B2_BUCKET)
  
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
    console.log('Successfully generated signed URL')
    return { signedUrl, path }
  } catch (error: any) {
    console.error('B2 upload URL error:', error.message, error.stack)
    return { error: 'Impossible de créer l\'URL d\'upload B2: ' + error.message }
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
  revalidatePath('/')
  return { success: true }
}

export async function deleteVideo(videoId: string, videoPath?: string) {
  const supabaseAdmin = createAdminClient()

  // 1. Delete from Supabase
  const { error } = await supabaseAdmin.from('videos').delete().eq('id', videoId)
  
  if (error) {
    console.error('Failed to delete video record:', error)
    return { error: 'Échec de la suppression de la vidéo' }
  }

  // 2. Note: Ideally we would delete from B2 here as well using b2Client.send(new DeleteObjectCommand(...))
  // For now we'll focus on the DB record to make the UI work.

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateVideo(videoId: string, title: string, description: string) {
  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin.from('videos').update({
    title,
    description: description || null,
  }).eq('id', videoId)

  if (error) {
    console.error('Failed to update video record:', error)
    return { error: 'Échec de la mise à jour de la vidéo' }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

