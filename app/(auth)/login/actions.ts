'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/login?error=Identifiants invalides ou erreur de connexion')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'client'

  const { data: authData, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return redirect('/login?error=Erreur lors de la création du compte. Vérifiez vos informations.')
  }

  // Assign role using admin client (bypasses RLS)
  if (authData.user) {
    const admin = createAdminClient()
    await (admin.from('user_roles') as any).insert({
      user_id: authData.user.id,
      role: role,
    })
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
