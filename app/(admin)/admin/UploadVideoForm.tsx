'use client'

import { useState } from 'react'
import { getSignedUploadUrl, saveVideoRecord } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './page.module.css'
import { createClient } from '@/lib/supabase/client'

export function UploadVideoForm() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file || !title) {
      setMessage({ type: 'error', text: 'Veuillez fournir un titre et un fichier vidéo.' })
      return
    }

    setIsUploading(true)
    setMessage(null)
    setProgress(10) // Started

    try {
      // 1. Get Signed Upload URL
      const { signedUrl, token, path, error: urlError } = await getSignedUploadUrl(file.name, file.type)
      
      if (urlError || !signedUrl || !path) {
        throw new Error(urlError || 'Impossible d\'obtenir l\'URL d\'upload')
      }

      setProgress(30) // Got URL

      // 2. Upload file directly to Supabase using the client
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .uploadToSignedUrl(path, token, file)

      if (uploadError) {
        throw new Error(`Échec de l'envoi : ${uploadError.message}`)
      }

      setProgress(80) // Upload complete

      // 3. Save to database
      const { error: saveError } = await saveVideoRecord(title, description, path)
      
      if (saveError) {
        throw new Error(saveError)
      }

      setProgress(100) // Done
      setMessage({ type: 'success', text: 'Vidéo ajoutée avec succès !' })
      
      // Reset form
      setFile(null)
      setTitle('')
      setDescription('')
      if (document.getElementById('videoFile') as HTMLInputElement) {
        (document.getElementById('videoFile') as HTMLInputElement).value = ''
      }
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Une erreur inattendue est survenue' })
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  return (
    <div className={`glass-panel ${styles.card}`}>
      <h2 className={styles.cardTitle}>Ajouter une nouvelle vidéo</h2>
      
      {message && (
        <div className={message.type === 'error' ? styles.textDestructive : styles.textSuccess} style={{ marginBottom: '1rem' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpload} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Titre *</label>
          <Input 
            required 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="ex: Inception" 
            disabled={isUploading}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea 
            className={styles.select} 
            style={{ minHeight: '80px', padding: '0.5rem', resize: 'vertical' }}
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Une brève description de la vidéo..."
            disabled={isUploading}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Fichier Vidéo *</label>
          <input 
            type="file" 
            id="videoFile"
            accept="video/*" 
            required 
            onChange={e => setFile(e.target.files?.[0] || null)}
            className={styles.select}
            style={{ padding: '0.5rem' }}
            disabled={isUploading}
          />
        </div>

        {isUploading && progress > 0 && (
          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ height: '100%', backgroundColor: 'var(--primary)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
          </div>
        )}

        <Button type="submit" disabled={isUploading || !file || !title}>
          {isUploading ? `Envoi en cours... ${progress}%` : 'Ajouter la vidéo'}
        </Button>
      </form>
    </div>
  )
}

