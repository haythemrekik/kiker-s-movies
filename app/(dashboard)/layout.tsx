import { signout } from '../(auth)/login/actions'
import { Button } from '@/components/ui/Button'
import styles from './layout.module.css'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Note: we can verify admin via metadata, but for now we'll just link to admin
  // A real app might check `user?.app_metadata?.role === 'admin'` or via DB.

  return (
    <div>
      <header className={styles.header}>
        <div className={`${styles.brand} gradient-text`}>
          <Link href="/dashboard">Kiker&apos;s movies</Link>
        </div>
        <div className={styles.nav}>
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Link href="/admin">
            <Button variant="ghost" size="sm">Admin</Button>
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
