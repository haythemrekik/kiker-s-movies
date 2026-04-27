import { createClient } from '@/lib/supabase/server'
import { generateCode } from './actions'
import { UploadVideoForm } from './UploadVideoForm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from '@/app/(admin)/admin/page.module.css'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CreateurDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // We could restrict access strictly:
  // if (roleData?.role !== 'createur' && roleData?.role !== 'admin') {
  //   redirect('/client') 
  // }

  const [{ data: videos }, { data: codes }] = await Promise.all([
    (supabase.from('videos').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }) as any),
    (supabase.from('access_codes').select('*, videos!inner(title, owner_id)').eq('videos.owner_id', user.id).order('created_at', { ascending: false }) as any)
  ])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Espace Créateur</h1>

      <div className={styles.grid}>
        {/* Management & Upload Section */}
        <div className={styles.column}>
          <UploadVideoForm />
          
          <div className={`glass-panel ${styles.card}`}>
            <h2 className={styles.cardTitle}>Mes Vidéos</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {videos?.map(v => (
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
        <div className={styles.column}>
          {/* Generate Code Form */}
          <div className={`glass-panel ${styles.card}`}>
            <h2 className={styles.cardTitle}>Générer un accès Client</h2>
            <form action={generateCode} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Vidéo</label>
                <select name="videoId" required className={styles.select}>
                  <option value="">Sélectionner une vidéo</option>
                  {videos?.map(v => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>ID du Client (Optionnel)</label>
                <Input name="userId" placeholder="ID Supabase du client ou laisser vide" />
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
            <h2 className={styles.cardTitle}>Codes d'accès générés</h2>
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
                        {/* @ts-ignore */}
                        {code.videos?.title || 'Inconnu'}
                      </td>
                      <td className={styles.td}>
                        {code.is_used ? (
                          <span className={styles.textDestructive}>Visionné</span>
                        ) : (
                          <span className={styles.textSuccess}>En attente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!codes || codes.length === 0) && (
                    <tr>
                      <td colSpan={3} className={styles.td} style={{ textAlign: 'center' }}>
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
    </div>
  )
}
