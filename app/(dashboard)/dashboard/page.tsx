import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Database } from '@/types/database.types'

type Video = Database['public']['Tables']['videos']['Row']
type VideoView = Database['public']['Tables']['video_views']['Row']

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  
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
      <h1 className={styles.title}>Vidéos disponibles</h1>
      
      <div className={styles.grid}>
        {(videos || []).map((video) => {
          const view = viewsMap.get(video.id)
          const watchCount = view?.watch_count

          // No view record = never used a code → code required
          // watch_count === 0 = code redeemed, ready to watch → disponible
          // watch_count > 0 = already watched, needs a new code → code required
          let statusText = 'Code requis'
          let statusClass = styles.locked
          let buttonLabel = 'Obtenir un code'

          if (view !== undefined && watchCount === 0) {
            statusText = 'Prêt à regarder'
            statusClass = styles.available
            buttonLabel = 'Regarder'
          } else if (view !== undefined && watchCount! > 0) {
            statusText = 'Code requis'
            statusClass = styles.locked
            buttonLabel = 'Débloquer'
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
                  <Button variant={statusText === 'Prêt à regarder' ? 'default' : 'outline'}>
                    {buttonLabel}
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
        {(!videos || videos.length === 0) && (
          <p style={{ color: 'var(--muted-foreground)' }}>Aucune vidéo disponible pour le moment.</p>
        )}
      </div>
    </div>
  )
}

