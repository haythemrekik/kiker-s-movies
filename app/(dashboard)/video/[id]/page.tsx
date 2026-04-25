import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAccess, validateCode, getVideoUrl } from './actions'
import { VideoPlayer } from '@/components/video-player/VideoPlayer'
import { CodeInput } from '@/components/code-input/CodeInput'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { notFound } from 'next/navigation'
import styles from './page.module.css'
import { Database } from '@/types/database.types'

type Video = Database['public']['Tables']['videos']['Row']

export const dynamic = 'force-dynamic'

export default async function VideoPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null // Handled by middleware
  }

  const admin = createAdminClient()
  const { data: videoData } = await admin
    .from('videos')
    .select('*')
    .eq('id', params.id)
    .single()

  const video = videoData as Video | null

  if (!video) {
    notFound()
  }

  const accessStatus = await checkAccess(params.id)


  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backButton}>
        <Button variant="ghost" size="sm">← Retour au tableau de bord</Button>
      </Link>
      
      <div className={styles.header}>
        <h1 className={styles.title}>{video.title}</h1>
        <p className={styles.description}>{video.description}</p>
      </div>
 
      {accessStatus === 'allowed' ? (
        <VideoPlayer videoId={params.id} email={user.email || 'user'} getUrlAction={getVideoUrl} />
      ) : accessStatus === 'code_required' ? (
        <CodeInput videoId={params.id} validateAction={validateCode} />
      ) : (
        <div className={`glass-panel ${styles.errorCard}`}>
          Une erreur est survenue lors de la vérification de l'accès à cette vidéo.
        </div>
      )}
    </div>
  )
}


