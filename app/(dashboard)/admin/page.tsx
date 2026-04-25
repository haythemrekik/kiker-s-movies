import { createAdminClient } from '@/lib/supabase/admin'
import { generateCode } from './actions'
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
        <h1 className={styles.title}>Admin Dashboard</h1>
      </div>

      <div className={styles.grid}>
        {/* Generate Code Form */}
        <div className={`glass-panel ${styles.card}`}>
          <h2 className={styles.cardTitle}>Generate Access Code</h2>
          <form action={generateCode} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Video</label>
              <select 
                name="videoId" 
                required 
                className={styles.select}
              >
                <option value="">Select a video</option>
                {videos?.map(v => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>User ID (Optional)</label>
              <Input name="userId" placeholder="Leave blank for global code" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Expires In (Hours, Optional)</label>
              <Input type="number" name="expiresInHours" placeholder="e.g. 24" />
            </div>
            <Button type="submit">Generate Code</Button>
          </form>
        </div>

        {/* List of Codes */}
        <div className={`glass-panel ${styles.card}`}>
          <h2 className={styles.cardTitle}>Recent Access Codes</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Code</th>
                  <th className={styles.th}>Video</th>
                  <th className={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {codes?.map(code => (
                  <tr key={code.id}>
                    <td className={`${styles.td} ${styles.tdMono}`}>{code.code}</td>
                    <td className={`${styles.td} ${styles.tdTruncate}`}>
                      {/* @ts-ignore - Supabase join typing */}
                      {code.videos?.title || 'Unknown'}
                    </td>
                    <td className={styles.td}>
                      {code.is_used ? (
                        <span className={styles.textDestructive}>Used</span>
                      ) : (
                        <span className={styles.textSuccess}>Active</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!codes || codes.length === 0) && (
                  <tr>
                    <td colSpan={3} className={styles.td} style={{ textAlign: 'center' }}>
                      No codes generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

