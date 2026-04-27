import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateCode } from './actions'
import { UploadVideoForm } from './UploadVideoForm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from '@/app/(dashboard)/dashboard/page.module.css'
import adminStyles from '@/app/(admin)/admin/page.module.css'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CreateurDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = createAdminClient()
  const [{ data: videos }, { data: codes }] = await Promise.all([
    admin.from('videos').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
    admin.from('access_codes').select('*, videos!inner(title, owner_id)').eq('videos.owner_id', user.id).order('created_at', { ascending: false })
  ]) as any

  const totalVideos = videos?.length || 0
  const totalCodes = (codes as any[])?.length || 0

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Marketplace Vidéo
          </div>
          <h1 className={styles.heroTitle}>
            Espace <span className={styles.heroAccent}>Créateur.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Uploadez vos vidéos et générez des codes d&apos;accès uniques pour vos clients. Chaque visionnage est sécurisé et garanti unique.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>{totalVideos}</span>
              <span className={styles.heroStatLabel}>Vidéos uploadées</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>{totalCodes}</span>
              <span className={styles.heroStatLabel}>Codes générés</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── UPLOAD + VIDEOS ── */}
      <section className={styles.section}>
        <div className={adminStyles.grid}>
          <div className={adminStyles.column}>
            <UploadVideoForm />

            <div className={`glass-panel ${adminStyles.card}`}>
              <h2 className={adminStyles.cardTitle}>Mes Vidéos</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {videos?.map((v: any) => (
                  <li key={v.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <strong>{v.title}</strong>
                    {v.description && <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{v.description}</p>}
                  </li>
                ))}
                {(!videos || videos.length === 0) && (
                  <li style={{ color: 'var(--muted-foreground)' }}>Aucune vidéo uploadée.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Access Codes Section */}
          <div className={adminStyles.column}>
            {/* Generate Code Form */}
            <div className={`glass-panel ${adminStyles.card}`}>
              <h2 className={adminStyles.cardTitle}>Générer un accès Client</h2>
              <form action={generateCode} className={adminStyles.form}>
                <div className={adminStyles.formGroup}>
                  <label className={adminStyles.label}>Vidéo</label>
                  <select name="videoId" required className={adminStyles.select}>
                    <option value="">Sélectionner une vidéo</option>
                    {videos?.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.title}</option>
                    ))}
                  </select>
                </div>
                <div className={adminStyles.formGroup}>
                  <label className={adminStyles.label}>Email du Client (Optionnel)</label>
                  <Input name="userId" placeholder="Email du client ou laisser vide" />
                </div>
                <div className={adminStyles.formGroup}>
                  <label className={adminStyles.label}>Expire dans (Heures, Optionnel)</label>
                  <Input type="number" name="expiresInHours" placeholder="ex: 24" />
                </div>
                <Button type="submit">Générer le code</Button>
              </form>
            </div>

            {/* List of Codes */}
            <div className={`glass-panel ${adminStyles.card}`}>
              <h2 className={adminStyles.cardTitle}>Codes d&apos;accès générés</h2>
              <div className={adminStyles.tableContainer}>
                <table className={adminStyles.table}>
                  <thead>
                    <tr>
                      <th className={adminStyles.th}>Code</th>
                      <th className={adminStyles.th}>Vidéo</th>
                      <th className={adminStyles.th}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(codes as any[])?.map((code: any) => (
                      <tr key={code.id}>
                        <td className={`${adminStyles.td} ${adminStyles.tdMono}`}>{code.code}</td>
                        <td className={`${adminStyles.td} ${adminStyles.tdTruncate}`}>
                          {code.videos?.title || 'Inconnu'}
                        </td>
                        <td className={adminStyles.td}>
                          {code.is_used ? (
                            <span className={adminStyles.textDestructive}>Visionné</span>
                          ) : (
                            <span className={adminStyles.textSuccess}>En attente</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!codes || (codes as any[]).length === 0) && (
                      <tr>
                        <td colSpan={3} className={adminStyles.td} style={{ textAlign: 'center' }}>
                          Aucun code généré.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
