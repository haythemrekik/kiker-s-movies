import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { UnlockForm } from './UnlockForm'
import styles from '@/app/(dashboard)/dashboard/page.module.css'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Use admin client to bypass RLS issues on the joined videos table
  const admin = createAdminClient()
  
  // Get user's unlocked videos from video_views
  const { data: viewsData } = await admin
    .from('video_views')
    .select('watch_count, last_watched_at, videos(*)')
    .eq('user_id', user.id)
    .order('last_watched_at', { ascending: false })

  const views = viewsData || []

  return (
    <div className={styles.page}>
      <section className={styles.hero} style={{ minHeight: '40vh', paddingTop: '4rem' }}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Marketplace Vidéo
          </div>
          <h1 className={styles.heroTitle}>
            Espace <span className={styles.heroAccent}>Client.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Entrez votre code d&apos;accès pour visionner les vidéos livrées par vos créateurs. Chaque visionnage est unique et protégé.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>{views.length}</span>
              <span className={styles.heroStatLabel}>Vidéos débloquées</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>{views.filter((v: any) => v.watch_count === 0).length}</span>
              <span className={styles.heroStatLabel}>Prêtes à visionner</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto 4rem auto' }}>
          <UnlockForm />
        </div>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Vos Vidéos Débloquées</h2>
          <div className={styles.sectionLine} />
        </div>

        {views.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎬</div>
            <p className={styles.emptyText}>Vous n'avez pas encore débloqué de vidéo.</p>
          </div>
        ) : (
          <div className={`${styles.grid} ${views.length === 1 ? styles.gridSingle : ''}`}>
            {views.map((view: any) => {
              const video = view.videos
              if (!video) return null

              const watchCount = view.watch_count
              const isReady = watchCount === 0

              let statusText = isReady ? 'Prêt à regarder' : 'Déjà visionné'
              let statusClass = isReady ? styles.available : styles.watched
              let buttonLabel = isReady ? 'Regarder maintenant' : 'Code requis pour revoir'

              return (
                <div key={video.id} className={`${styles.card} ${isReady ? styles.cardReady : ''}`}>
                  <div className={`${styles.cardAccent} ${isReady ? styles.cardAccentReady : ''}`} />
                  
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

                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{video.title}</h3>
                    <p className={styles.cardDescription}>
                      {video.description || 'Aucune description disponible.'}
                    </p>
                  </div>

                  <div className={styles.cardFooter}>
                    <Link href={`/video/${video.id}`} style={{ width: '100%', pointerEvents: isReady ? 'auto' : 'none' }}>
                      <Button
                        variant={isReady ? 'default' : 'outline'}
                        style={{ width: '100%' }}
                        disabled={!isReady}
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
