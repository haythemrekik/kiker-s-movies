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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check for admin role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user?.id || '')
    .maybeSingle() as any

  const isAdmin = roleData?.role === 'admin'

  return (
    <div>
      <header className={styles.header}>
        <div className={`${styles.brand} gradient-text`}>
          <Link href="/dashboard">Kiker&apos;s movies</Link>
        </div>
        <div className={styles.nav}>
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="sm">Admin</Button>
            </Link>
          )}
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

