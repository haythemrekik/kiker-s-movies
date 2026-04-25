'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AccessStatus = 'allowed' | 'code_required' | 'error' | 'not_found'

export async function checkAccess(videoId: string): Promise<AccessStatus> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 'error'

  // Check if video exists
  const { data: video } = await supabase.from('videos').select('id').eq('id', videoId).single()
  if (!video) return 'not_found'

  // Get view history
  const { data: view } = await supabase
    .from('video_views')
    .select('watch_count')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single()

  if (!view) {
    // Hasn't watched yet
    return 'allowed'
  }

  if (view.watch_count > 0) {
    return 'code_required'
  }

  return 'allowed'
}

export async function validateCode(videoId: string, code: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const supabaseAdmin = createAdminClient()

  // Use the RPC function to securely redeem code and update views in a single transaction
  const { data: success, error } = await supabaseAdmin.rpc('redeem_access_code', {
    p_code: code,
    p_user_id: user.id,
    p_video_id: videoId
  })

  if (error || !success) {
    return { success: false, error: 'Invalid, expired, or already used code.' }
  }

  return { success: true }
}

export async function getVideoUrl(videoId: string): Promise<{ url?: string; error?: string }> {
  const status = await checkAccess(videoId)
  
  if (status !== 'allowed') {
    return { error: 'Access denied' }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Record/Update the view count
  // We use admin client to bypass RLS if needed, or normal client if RLS permits
  const supabaseAdmin = createAdminClient()
  
  // First, get the video path
  const { data: video } = await supabase.from('videos').select('video_path').eq('id', videoId).single()
  if (!video) return { error: 'Video not found' }

  // Mark as viewed (increment count)
  // We only increment if it's currently 0 or doesn't exist
  // We can just upsert. If it doesn't exist, count becomes 1. If it exists and is 0 (redeemed code), it becomes 1.
  
  const { data: view } = await supabase.from('video_views').select('watch_count').eq('user_id', user.id).eq('video_id', videoId).single()
  
  if (!view) {
    await supabase.from('video_views').insert({ user_id: user.id, video_id: videoId, watch_count: 1, last_watched_at: new Date().toISOString() })
  } else if (view.watch_count === 0) {
    await supabase.from('video_views').update({ watch_count: 1, last_watched_at: new Date().toISOString() }).eq('user_id', user.id).eq('video_id', videoId)
  }

  // Generate 60-second signed URL
  const { data: urlData, error: urlError } = await supabaseAdmin
    .storage
    .from('videos')
    .createSignedUrl(video.video_path, 60)

  if (urlError || !urlData) {
    return { error: 'Could not generate video URL' }
  }

  return { url: urlData.signedUrl }
}
