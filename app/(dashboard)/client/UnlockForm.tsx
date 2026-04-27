'use client'

import { useState } from 'react'
import { unlockCode } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from '@/app/(admin)/admin/page.module.css'
import { useRouter } from 'next/navigation'

export function UnlockForm() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('code', code)
      
      const result = await unlockCode(formData)
      
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else if (result?.success) {
        setMessage({ type: 'success', text: 'Vidéo débloquée avec succès !' })
        setCode('')
        // Optionally redirect directly to the video:
        // router.push(`/video/${result.videoId}`)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Une erreur est survenue.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`glass-panel ${styles.card}`}>
      <h2 className={styles.cardTitle}>Avez-vous un code d'accès ?</h2>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Entrez le code fourni par votre créateur pour débloquer votre vidéo. Attention : le visionnage est unique.
      </p>

      {message && (
        <div className={message.type === 'error' ? styles.textDestructive : styles.textSuccess} style={{ marginBottom: '1rem' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUnlock} className={styles.form}>
        <div className={styles.formGroup}>
          <Input 
            required 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            placeholder="Ex: ABCD-1234" 
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || !code}>
          {loading ? 'Vérification...' : 'Débloquer'}
        </Button>
      </form>
    </div>
  )
}
