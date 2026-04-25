import { signout } from '../(auth)/login/actions'
import { Button } from '@/components/ui/Button'
import styles from './layout.module.css'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <header className={styles.header}>
        <div className={`${styles.brand} gradient-text`}>
          <Link href="/dashboard">Kiker&apos;s movies</Link>
        </div>
        <div className={styles.nav}>
          <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{user?.email}</span>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
          <form action={signout}>
            <Button variant="outline" size="sm" type="submit">Sign Out</Button>
          </form>
        </div>
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
