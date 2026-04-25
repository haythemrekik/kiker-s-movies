'use client'

import { useState, Suspense } from 'react'
import { login, signup } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './page.module.css'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className={`glass-panel ${styles.card}`}>
      <h1 className={`${styles.title} gradient-text`}>Kiker&apos;s movies</h1>
      <p className={styles.subtitle}>
        {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuit'}
      </p>

      <div className={styles.tabs}>
        <button 
          type="button"
          className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
          onClick={() => setMode('login')}
        >
          Connexion
        </button>
        <button 
          type="button"
          className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
          onClick={() => setMode('signup')}
        >
          Inscription
        </button>
      </div>
      
      {error && (
        <div className={styles.error}>{error}</div>
      )}

      <form className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email</label>
          <Input id="email" name="email" type="email" required placeholder="vous@exemple.com" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">Mot de passe</label>
          <Input id="password" name="password" type="password" required placeholder="••••••••" />
        </div>
        <div className={styles.buttonGroup}>
          {mode === 'login' ? (
            <Button formAction={login}>Se connecter</Button>
          ) : (
            <Button formAction={signup}>Créer un compte</Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Chargement...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

