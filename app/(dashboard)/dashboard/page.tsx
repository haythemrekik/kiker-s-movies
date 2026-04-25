import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Database } from '@/types/database.types'

type Video = Database['public']['Tables']['videos']['Row']
type VideoView = Database['public']['Tables']['video_views']['Row']

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Get all videos
  const { data: videosData } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  const videos = videosData as Video[] | null

  // Get user's view history
  const { data: { user } } = await supabase.auth.getUser()
  const { data: viewsData } = await supabase
    .from('video_views')
    .select('*')
    .eq('user_id', user?.id || '')

  const views = viewsData as VideoView[] | null

  const viewsMap = new Map((views || []).map((v) => [v.video_id, v]))

  return (
    <div>
      <h1 className={styles.title}>Available Videos</h1>
      
      <div className={styles.grid}>
        {(videos || []).map((video) => {
          const view = viewsMap.get(video.id)
          const watchCount = view?.watch_count || 0
          
          let statusText = 'Available'
          let statusClass = styles.available
          
          if (watchCount > 0) {
            statusText = 'Code Required'
            statusClass = styles.locked
          } else if (view) {
            statusText = 'Available'
            statusClass = styles.available
          }

          return (
            <div key={video.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{video.title}</h3>
                <span className={`${styles.badge} ${statusClass}`}>
                  {statusText}
                </span>
              </div>
              <p className={styles.cardDescription}>{video.description}</p>
              <div style={{ marginTop: 'auto' }}>
                <Link href={`/video/${video.id}`}>
                  <Button variant={watchCount > 0 ? 'outline' : 'default'}>
                    {watchCount > 0 ? 'Unlock Video' : 'Watch Now'}
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
        {(!videos || videos.length === 0) && (
          <p style={{ color: 'var(--muted-foreground)' }}>No videos available right now.</p>
        )}
      </div>
    </div>
  )
}
