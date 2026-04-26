'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { b2Client, B2_BUCKET } from '@/lib/b2/client'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export type AccessStatus = 'allowed' | 'code_required' | 'error' | 'not_found'

export async function checkAccess(videoId: string): Promise<AccessStatus> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 'error'

  // Check if video exists
  const { data: videoData } = await supabase
    .from('videos')
    .select('id')
    .eq('id', videoId)
    .single()

  if (!videoData) return 'not_found'

  // Get view history using admin client to avoid RLS type conflicts
  const admin = createAdminClient()
  const { data: viewData } = await admin
    .from('video_views')
    .select('watch_count')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single()

  const view = viewData as { watch_count: number } | null

  // No view record = never redeemed a code → require code
  if (!view) return 'code_required'
  // watch_count === 0 = code was redeemed and watch hasn't been counted yet → allow
  if (view.watch_count === 0) return 'allowed'
  // watch_count > 0 = already watched, need a new code
  return 'code_required'
}

export async function validateCode(
  videoId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Non authentifié' }

  const admin = createAdminClient()

  const { data: success, error } = await admin.rpc('redeem_access_code', {
    p_code: code,
    p_user_id: user.id,
    p_video_id: videoId,
  })

  if (error || !success) {
    return { success: false, error: 'Code invalide, expiré ou déjà utilisé.' }
  }

  return { success: true }
}

export async function getVideoUrl(
  videoId: string
): Promise<{ url?: string; error?: string }> {
  const status = await checkAccess(videoId)

  if (status !== 'allowed') {
    return { error: 'Accès refusé' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const admin = createAdminClient()

  // Get the video path
  const { data: videoData } = await admin
    .from('videos')
    .select('video_path, youtube_video_id')
    .eq('id', videoId)
    .single()

  const video = videoData as { video_path: string | null; youtube_video_id: string | null } | null
  if (!video) return { error: 'Vidéo introuvable' }

  // Mark as viewed (use admin to bypass RLS)
  const { data: viewData } = await admin
    .from('video_views')
    .select('watch_count')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single()

  const view = viewData as { watch_count: number } | null

  if (!view) {
    await admin.from('video_views').insert({
      user_id: user.id,
      video_id: videoId,
      watch_count: 1,
      last_watched_at: new Date().toISOString(),
    } as any)
  } else if (view.watch_count === 0) {
    await admin
      .from('video_views')
      .update({ watch_count: 1, last_watched_at: new Date().toISOString() } as any)
      .eq('user_id', user.id)
      .eq('video_id', videoId)
  }

  // If it's a YouTube video, we don't need a signed B2 URL
  if (video.youtube_video_id) {
    return { url: 'YOUTUBE' } // Signal it's a YouTube video (though the page handles this)
  }

  if (!video.video_path) {
    return { error: 'Chemin vidéo manquant' }
  }

  // Generate 60-second signed URL from B2
  try {
    const command = new GetObjectCommand({
      Bucket: B2_BUCKET,
      Key: video.video_path,
    })

    const signedUrl = await getSignedUrl(b2Client, command, { expiresIn: 60 })
    return { url: signedUrl }
  } catch (urlError) {
    console.error('Failed to generate B2 video URL:', urlError)
    return { error: 'Impossible de générer l\'URL de la vidéo B2' }
  }
}

