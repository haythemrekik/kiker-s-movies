'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function unlockCode(formData: FormData) {
  const code = formData.get('code') as string
  if (!code) return { error: 'Code requis' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Non autorisé' }

  // Trouver le code d'accès
  const { data: accessCode, error: codeError } = await supabase
    .from('access_codes')
    .select('*, videos(title)')
    .eq('code', code)
    .single()

  if (codeError || !accessCode) {
    return { error: 'Code invalide ou introuvable' }
  }

  const codeData = accessCode as any

  if (codeData.is_used) {
    return { error: 'Ce code a déjà été utilisé' }
  }

  if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
    return { error: 'Ce code a expiré' }
  }

  if (codeData.user_id && codeData.user_id !== user.id) {
    return { error: 'Ce code ne vous est pas destiné' }
  }

  // Appeler la fonction RPC pour utiliser le code
  // NB: redeem_access_code prend (p_code, p_user_id, p_video_id)
  const { data: success, error: redeemError } = await (supabase as any).rpc('redeem_access_code', {
    p_code: code,
    p_user_id: user.id,
    p_video_id: codeData.video_id
  })

  if (redeemError || !success) {
    return { error: 'Erreur lors du déverrouillage de la vidéo' }
  }

  revalidatePath('/client')
  return { success: true, videoId: accessCode.video_id }
}
