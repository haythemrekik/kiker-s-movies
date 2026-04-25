import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Get all videos
  const { data: videos, error: videosError } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  // Get user's view history
  const { data: { user } } = await supabase.auth.getUser()
  const { data: views, error: viewsError } = await supabase
    .from('video_views')
    .select('*')
    .eq('user_id', user?.id || '')

  const viewsMap = new Map((views || []).map(v => [v.video_id, v]))

  return (
    <div>
      <h1 className={styles.title}>Available Videos</h1>
      
      <div className={styles.grid}>
        {videos?.map((video) => {
          const view = viewsMap.get(video.id)
          const watchCount = view?.watch_count || 0
          
          let statusText = 'Available'
          let statusClass = styles.available
          
          if (watchCount > 0) {
            statusText = 'Code Required'
            statusClass = styles.locked
          } else if (view) {
            // It has a view record but watch count is 0 (redeemed)
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
                  <Button className="w-full" variant={watchCount > 0 ? 'outline' : 'default'}>
                    {watchCount > 0 ? 'Unlock Video' : 'Watch Now'}
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
        {(!videos || videos.length === 0) && (
          <p className="text-muted-foreground">No videos available right now.</p>
        )}
      </div>
    </div>
  )
}
