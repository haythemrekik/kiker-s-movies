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
  const [role, setRole] = useState<'createur' | 'client'>('client')
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className={`glass-panel ${styles.card}`}>
      <div className={styles.logoContainer}>
        <Image src="/logo12.png" alt="OneView" width={320} height={120} className={styles.logo} priority />
      </div>
      <p className={styles.tagline}>La marketplace vidéo sécurisée</p>
      <h2 className={styles.title}>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h2>
      <p className={styles.subtitle}>
        {mode === 'login' 
          ? 'Accédez à votre espace créateur ou client' 
          : 'Rejoignez la plateforme en tant que créateur ou client'}
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
          <Input id="email" name="email" type="email" required placeholder="Adresse email" className={styles.sleekInput} />
        </div>
        <div className={styles.formGroup}>
          <Input id="password" name="password" type="password" required placeholder="Mot de passe" className={styles.sleekInput} />
        </div>

        {mode === 'signup' && (
          <>
            <label className={styles.roleLabel}>Je suis :</label>
            <div className={styles.roleSelector}>
              <button
                type="button"
                className={`${styles.roleCard} ${role === 'createur' ? styles.roleCardActive : ''}`}
                onClick={() => setRole('createur')}
              >
                <span className={styles.roleIcon}>🎬</span>
                <span className={styles.roleName}>Créateur</span>
                <span className={styles.roleDesc}>J&apos;envoie mes vidéos à mes clients</span>
              </button>
              <button
                type="button"
                className={`${styles.roleCard} ${role === 'client' ? styles.roleCardActive : ''}`}
                onClick={() => setRole('client')}
              >
                <span className={styles.roleIcon}>👁️</span>
                <span className={styles.roleName}>Client</span>
                <span className={styles.roleDesc}>Je visionne les vidéos de mes créateurs</span>
              </button>
            </div>
            <input type="hidden" name="role" value={role} />
          </>
        )}
        
        {mode === 'login' && (
          <div className={styles.forgotPassword}>
            <a href="#">Mot de passe oublié ?</a>
          </div>
        )}

        <div className={styles.buttonGroup}>
          {mode === 'login' ? (
            <Button formAction={login} className={styles.neonButton}>Se connecter</Button>
          ) : (
            <Button formAction={signup} className={styles.neonButton}>Créer mon compte</Button>
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
