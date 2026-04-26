'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
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
      <div className={styles.logoContainer}>
        <Image src="/logo12.png" alt="OneView" width={320} height={120} className={styles.logo} priority />
      </div>
      <h2 className={styles.title}>{mode === 'login' ? 'Sign In' : 'Sign Up'}</h2>
      <p className={styles.subtitle}>
        {mode === 'login' ? 'Welcome back to OneView' : 'Create your secure account'}
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
          <Input id="email" name="email" type="email" required placeholder="Email address" className={styles.sleekInput} />
        </div>
        <div className={styles.formGroup}>
          <Input id="password" name="password" type="password" required placeholder="Password" className={styles.sleekInput} />
        </div>
        
        {mode === 'login' && (
          <div className={styles.forgotPassword}>
            <a href="#">Forgot Password</a>
          </div>
        )}

        <div className={styles.buttonGroup}>
          {mode === 'login' ? (
            <Button formAction={login} className={styles.neonButton}>Sign In</Button>
          ) : (
            <Button formAction={signup} className={styles.neonButton}>Sign Up</Button>
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

