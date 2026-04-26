'use client'

import { useState } from 'react'
import { saveYouTubeVideo } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './page.module.css'

export function AddYouTubeForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const extractVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !youtubeUrl) {
      setMessage({ type: 'error', text: 'Veuillez fournir un titre et un lien YouTube.' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const videoId = extractVideoId(youtubeUrl)
      if (videoId.length !== 11) {
        throw new Error('ID YouTube invalide. Veuillez fournir un lien YouTube valide.')
      }

      const res = await saveYouTubeVideo(title, description, videoId)
      
      if (res.error) {
        throw new Error(res.error)
      }

      setMessage({ type: 'success', text: 'Vidéo YouTube ajoutée avec succès !' })
      setTitle('')
      setDescription('')
      setYoutubeUrl('')
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Une erreur est survenue' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`glass-panel ${styles.card}`}>
      <h2 className={styles.cardTitle}>Ajouter une vidéo YouTube</h2>
      
      {message && (
        <div className={message.type === 'error' ? styles.textDestructive : styles.textSuccess} style={{ marginBottom: '1rem' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Titre *</label>
          <Input 
            required 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="ex: Bande-annonce Inception" 
            disabled={isSubmitting}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea 
            className={styles.select} 
            style={{ minHeight: '80px', padding: '0.5rem', resize: 'vertical' }}
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Description..."
            disabled={isSubmitting}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Lien ou ID YouTube *</label>
          <Input 
            required 
            value={youtubeUrl} 
            onChange={e => setYoutubeUrl(e.target.value)} 
            placeholder="https://www.youtube.com/watch?v=..." 
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Ajouter la vidéo YouTube'}
        </Button>
      </form>
    </div>
  )
}
