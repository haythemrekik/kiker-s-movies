'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  if (!view) return 'allowed'
  if (view.watch_count > 0) return 'code_required'

  return 'allowed'
}

export async function validateCode(
  videoId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const admin = createAdminClient()

  const { data: success, error } = await admin.rpc('redeem_access_code', {
    p_code: code,
    p_user_id: user.id,
    p_video_id: videoId,
  })

  if (error || !success) {
    return { success: false, error: 'Invalid, expired, or already used code.' }
  }

  return { success: true }
}

export async function getVideoUrl(
  videoId: string
): Promise<{ url?: string; error?: string }> {
  const status = await checkAccess(videoId)

  if (status !== 'allowed') {
    return { error: 'Access denied' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Get the video path
  const { data: videoData } = await admin
    .from('videos')
    .select('video_path')
    .eq('id', videoId)
    .single()

  const video = videoData as { video_path: string } | null
  if (!video) return { error: 'Video not found' }

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

  // Generate 60-second signed URL
  const { data: urlData, error: urlError } = await admin
    .storage
    .from('videos')
    .createSignedUrl(video.video_path, 60)

  if (urlError || !urlData) {
    return { error: 'Could not generate video URL' }
  }

  return { url: urlData.signedUrl }
}
