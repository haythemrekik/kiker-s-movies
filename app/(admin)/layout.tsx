import { signout } from '../(auth)/login/actions'
import { Button } from '@/components/ui/Button'
import styles from './layout.module.css'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check for admin role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single() as any

  if (roleData?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div>
      <header className={styles.header}>
        <div className={`${styles.brand} gradient-text`}>
          <Link href="/dashboard">Kiker&apos;s movies</Link>
        </div>
        <div className={styles.nav}>
          <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{user?.email}</span>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Tableau de bord</Button>
          </Link>
          <form action={signout}>
            <Button variant="outline" size="sm" type="submit">Déconnexion</Button>
          </form>
        </div>
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}

