'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { b2Client, B2_BUCKET } from '@/lib/b2/client'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function getSignedUploadUrl(fileName: string, contentType: string) {
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
  } catch (error: any) {
    return { error: 'Impossible de créer l\'URL d\'upload B2: ' + error.message }
  }
}

export async function saveVideoRecord(title: string, description: string, path: string) {
  if (!title || !path) {
    return { error: 'Le titre et le fichier vidéo sont obligatoires' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non autorisé' }
  }

  const { error } = await (supabase.from('videos') as any).insert({
    title,
    description: description || null,
    video_path: path,
    owner_id: user.id
  })

  if (error) {
    console.error('Failed to save video record:', error)
    return { error: 'Échec de l\'enregistrement de la vidéo' }
  }

  revalidatePath('/createur')
  return { success: true }
}

export async function generateCode(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Non autorisé' }
  
  const videoId = formData.get('videoId') as string
  const userId = formData.get('userId') as string
  const expiresInHours = formData.get('expiresInHours') as string
  
  if (!videoId) {
    return { error: 'Vidéo requise' }
  }

  // Verify the video belongs to this creator
  const { data: video } = await (supabase
    .from('videos')
    .select('id')
    .eq('id', videoId)
    .eq('owner_id', user.id) as any)
    .single()

  if (!video) {
    return { error: 'Vidéo introuvable ou vous n\'en êtes pas le propriétaire' }
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

  const { error } = await (supabase.from('access_codes') as any).insert({
    code,
    video_id: videoId,
    user_id: userId || null,
    expires_at: expiresAt,
  })

  if (error) {
    console.error('Failed to generate code:', error)
    return { error: 'Erreur lors de la génération du code' }
  }

  revalidatePath('/createur')
  return { success: true }
}
