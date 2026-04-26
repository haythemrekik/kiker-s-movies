import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { videoId } = await req.json()
    if (!videoId) {
      return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    
    // Update or Insert view record
    const { data: viewData } = await admin
      .from('video_views')
      .select('watch_count')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single()

    const view = viewData as { watch_count: number } | null

    if (!view) {
      // Should not happen if they had access, but for safety:
      await admin.from('video_views').insert({
        user_id: user.id,
        video_id: videoId,
        watch_count: 1,
        last_watched_at: new Date().toISOString()
      })
    } else {
      await admin
        .from('video_views')
        .update({ 
          watch_count: view.watch_count + 1, 
          last_watched_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('video_id', videoId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Mark Watched Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
