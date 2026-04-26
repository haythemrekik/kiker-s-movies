import { signout } from '../(auth)/login/actions'
import { Button } from '@/components/ui/Button'
import styles from './layout.module.css'
import Link from 'next/link'
import Image from 'next/image'
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
    .maybeSingle() as any

  if (roleData?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Link href="/dashboard">
            <Image src="/logo.png" alt="OneView" width={120} height={40} className={styles.logo} />
          </Link>
        </div>
        <div className={styles.nav}>
          <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', display: 'var(--show-email, block)' }}>{user?.email}</span>
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

