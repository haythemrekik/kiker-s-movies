import { signout } from '../(auth)/login/actions'
import { Button } from '@/components/ui/Button'
import styles from './layout.module.css'
import Link from 'next/link'
import Image from 'next/image'
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
        <div className={styles.brand}>
          <Link href="/dashboard">
            <Image src="/logo.png" alt="OneView" width={120} height={40} className={styles.logo} />
          </Link>
        </div>
        <div className={styles.nav}>
          <span className={`text-sm text-muted-foreground ${styles.navEmail}`}>{user?.email}</span>
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

