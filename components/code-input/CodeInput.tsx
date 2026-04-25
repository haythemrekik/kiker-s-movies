'use client'

import React, { useState, useTransition } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import styles from './CodeInput.module.css'

interface CodeInputProps {
  videoId: string
  validateAction: (videoId: string, code: string) => Promise<{ success: boolean; error?: string }>
}

export function CodeInput({ videoId, validateAction }: CodeInputProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!code.trim()) {
      setError('Veuillez entrer un code')
      return
    }

    startTransition(async () => {
      const res = await validateAction(videoId, code.trim())
      if (res.error) {
        setError(res.error)
      } else if (res.success) {
        // Reload page to show video
        window.location.reload()
      }
    })
  }

  return (
    <div className={`glass-panel ${styles.container}`}>
      <h2 className={styles.title}>Accès Restreint</h2>
      <p className={styles.description}>
        Cette vidéo n'est accessible qu'une seule fois. Veuillez entrer un code d'accès fourni par l'administrateur pour la regarder à nouveau.
      </p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        <Input 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Entrez le code d'accès" 
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Validation...' : 'Débloquer la vidéo'}
        </Button>
      </form>
    </div>
  )
}


