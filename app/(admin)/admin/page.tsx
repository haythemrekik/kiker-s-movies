import { createAdminClient } from '@/lib/supabase/admin'
import { generateCode } from './actions'
import { UploadVideoForm } from './UploadVideoForm'
import { VideoList } from './VideoList'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabaseAdmin = createAdminClient()

  const [{ data: videos }, { data: codes }] = await Promise.all([
    supabaseAdmin.from('videos').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('access_codes').select('*, videos(title)').order('created_at', { ascending: false })
  ])

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.title}>Tableau de bord Administrateur</h1>
      </div>
 
      <div className={styles.grid}>
        {/* Management & Upload Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
          <UploadVideoForm />
          <VideoList videos={videos} />
        </div>

        {/* Access Codes Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
          {/* Generate Code Form */}
          <div className={`glass-panel ${styles.card}`}>
            <h2 className={styles.cardTitle}>Générer un code d'accès</h2>
            <form action={generateCode} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Vidéo</label>
                <select 
                  name="videoId" 
                  required 
                  className={styles.select}
                >
                  <option value="">Sélectionner une vidéo</option>
                  {videos?.map(v => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>ID Utilisateur (Optionnel)</label>
                <Input name="userId" placeholder="Laisser vide pour un code global" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Expire dans (Heures, Optionnel)</label>
                <Input type="number" name="expiresInHours" placeholder="ex: 24" />
              </div>
              <Button type="submit">Générer le code</Button>
            </form>
          </div>
  
          {/* List of Codes */}
          <div className={`glass-panel ${styles.card}`}>
            <h2 className={styles.cardTitle}>Codes d'accès récents</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Code</th>
                    <th className={styles.th}>Vidéo</th>
                    <th className={styles.th}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {codes?.map(code => (
                    <tr key={code.id}>
                      <td className={`${styles.td} ${styles.tdMono}`}>{code.code}</td>
                      <td className={`${styles.td} ${styles.tdTruncate}`}>
                        {/* @ts-ignore - Join typing */}
                        {code.videos?.title || 'Inconnu'}
                      </td>
                      <td className={styles.td}>
                        {code.is_used ? (
                          <span className={styles.textDestructive}>Utilisé</span>
                        ) : (
                          <span className={styles.textSuccess}>Actif</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!codes || codes.length === 0) && (
                    <tr>
                      <td colSpan={3} className={styles.td} style={{ textAlign: 'center' }}>
                        Aucun code généré pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


