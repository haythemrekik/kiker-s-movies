'use client'

import { useState } from 'react'
import { getSignedUploadUrl, saveVideoRecord } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './page.module.css'
import { createClient } from '@/lib/supabase/client'

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`
}

export function UploadVideoForm() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const fileInput = document.getElementById('videoFile') as HTMLInputElement
    const actualFile = file || fileInput?.files?.[0]

    if (!actualFile || !title) {
      setMessage({ type: 'error', text: 'Veuillez fournir un titre et un fichier vidéo.' })
      return
    }

    setIsUploading(true)
    setMessage(null)
    setProgress(1)

    try {
      // 1. Get Signed Upload URL for B2
      const { signedUrl, path, error: urlError } = await getSignedUploadUrl(actualFile.name, actualFile.type)
      
      if (urlError || !signedUrl || !path) {
        throw new Error(urlError || 'Impossible d\'obtenir l\'URL d\'upload')
      }

      setProgress(5) // Got URL

      // 2. Upload directly to B2 using XMLHttpRequest to track progress
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            // Map 5% to 95% for the actual upload
            const pct = 5 + Math.round((event.loaded / event.total) * 90)
            setProgress(pct)
          }
        }
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(true)
          } else {
            reject(new Error(`Échec de l'envoi HTTP: ${xhr.status} ${xhr.statusText}`))
          }
        }
        
        xhr.onerror = () => reject(new Error('Erreur réseau lors de l\'envoi'))
        xhr.onabort = () => reject(new Error('Envoi annulé'))
        
        xhr.open('PUT', signedUrl, true)
        xhr.setRequestHeader('Content-Type', actualFile.type)
        xhr.send(actualFile)
      })

      setProgress(95)

      // 3. Save to database
      const { error: saveError } = await saveVideoRecord(title, description, path)
      
      if (saveError) {
        throw new Error(saveError)
      }

      setProgress(100)
      setMessage({ type: 'success', text: 'Vidéo ajoutée avec succès !' })
      
      // Reset form
      setFile(null)
      setTitle('')
      setDescription('')
      const input = document.getElementById('videoFile') as HTMLInputElement
      if (input) input.value = ''
      
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

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Titre *</label>
          <Input 
            required 
            id="videoTitle"
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
            id="videoDesc"
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

        {file && !isUploading && (
          <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            Taille : <strong>{formatSize(file.size)}</strong>
            {file.size > 500 * 1024 * 1024 && ' — Fichier volumineux, l\'upload peut prendre plusieurs minutes.'}
          </p>
        )}

        {isUploading && progress > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.4rem' }}>
              <span>{progress < 95 ? 'Envoi en cours...' : progress < 100 ? 'Enregistrement...' : 'Terminé !'}</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #6d28d9, #8b5cf6)',
                width: `${progress}%`,
                transition: 'width 0.4s ease',
                borderRadius: '3px'
              }} />
            </div>
            {file && (
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.3rem' }}>
                {formatSize(Math.round(file.size * progress / 100))} / {formatSize(file.size)} envoyés
              </p>
            )}
          </div>
        )}

        <Button type="button" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? `Envoi en cours... ${progress}%` : 'Ajouter la vidéo'}
        </Button>
      </div>
    </div>
  )
}

