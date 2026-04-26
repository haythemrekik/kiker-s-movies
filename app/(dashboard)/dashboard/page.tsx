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
  
  const { data: videosData } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  const videos = videosData as Video[] | null

  const { data: { user } } = await supabase.auth.getUser()
  const { data: viewsData } = await supabase
    .from('video_views')
    .select('*')
    .eq('user_id', user?.id || '')

  const views = viewsData as VideoView[] | null
  const viewsMap = new Map((views || []).map((v) => [v.video_id, v]))

  const totalVideos = videos?.length || 0
  const readyToWatch = (videos || []).filter(v => {
    const view = viewsMap.get(v.id)
    return view !== undefined && view.watch_count === 0
  }).length

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Plateforme Exclusive
          </div>
          <h1 className={styles.heroTitle}>
            Votre cinéma<br />
            <span className={styles.heroAccent}>privé, en ligne.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Accédez à votre collection de films avec un code d&apos;accès personnel.<br className={styles.heroBr} />
            Chaque visionnage, une expérience unique.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>{totalVideos}</span>
              <span className={styles.heroStatLabel}>Films disponibles</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>{readyToWatch}</span>
              <span className={styles.heroStatLabel}>Prêts à regarder</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILMS ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Catalogue</h2>
          <div className={styles.sectionLine} />
        </div>

        {(!videos || videos.length === 0) ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎬</div>
            <p className={styles.emptyText}>Aucune vidéo disponible pour le moment.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {videos.map((video) => {
              const view = viewsMap.get(video.id)
              const watchCount = view?.watch_count

              let statusText = 'Code requis'
              let statusClass = styles.locked
              let buttonLabel = 'Obtenir un code'
              let isReady = false

              if (view !== undefined && watchCount === 0) {
                statusText = 'Prêt à regarder'
                statusClass = styles.available
                buttonLabel = 'Regarder maintenant'
                isReady = true
              } else if (view !== undefined && watchCount! > 0) {
                statusText = 'Déjà visionné'
                statusClass = styles.watched
                buttonLabel = 'Débloquer à nouveau'
              }

              return (
                <div key={video.id} className={`${styles.card} ${isReady ? styles.cardReady : ''}`}>
                  {/* Top accent line */}
                  <div className={`${styles.cardAccent} ${isReady ? styles.cardAccentReady : ''}`} />

                  {/* Icon + Badge row */}
                  <div className={styles.cardTop}>
                    <div className={styles.filmIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                        <line x1="7" y1="2" x2="7" y2="22"/>
                        <line x1="17" y1="2" x2="17" y2="22"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <line x1="2" y1="7" x2="7" y2="7"/>
                        <line x1="2" y1="17" x2="7" y2="17"/>
                        <line x1="17" y1="17" x2="22" y2="17"/>
                        <line x1="17" y1="7" x2="22" y2="7"/>
                      </svg>
                    </div>
                    <span className={`${styles.badge} ${statusClass}`}>{statusText}</span>
                  </div>

                  {/* Content */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{video.title}</h3>
                    <p className={styles.cardDescription}>
                      {video.description || 'Aucune description disponible.'}
                    </p>
                  </div>

                  {/* Action */}
                  <div className={styles.cardFooter}>
                    <Link href={`/video/${video.id}`} style={{ width: '100%' }}>
                      <Button
                        variant={isReady ? 'default' : 'outline'}
                        style={{ width: '100%' }}
                      >
                        {isReady && (
                          <svg style={{ marginRight: '0.5rem' }} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        )}
                        {buttonLabel}
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
