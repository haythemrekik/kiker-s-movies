import { login, signup } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './page.module.css'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error: string }
}) {
  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.card}`}>
        <h1 className={`${styles.title} gradient-text`}>Kiker&apos;s movies</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
        
        {searchParams?.error && (
          <div className={styles.error}>{searchParams.error}</div>
        )}

        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>
          <div className={styles.buttonGroup}>
            <Button formAction={login}>Sign In</Button>
            <Button formAction={signup} variant="outline">Create Account</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
