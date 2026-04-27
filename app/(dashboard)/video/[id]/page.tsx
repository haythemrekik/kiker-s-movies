import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAccess, validateCode, getVideoUrl } from './actions'
import { VideoPlayer } from '@/components/video-player/VideoPlayer'
import { YouTubePlayer } from '@/components/youtube-player/YouTubePlayer'
import { CodeInput } from '@/components/code-input/CodeInput'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { notFound } from 'next/navigation'
import styles from './page.module.css'
import { Database } from '@/types/database.types'

type Video = Database['public']['Tables']['videos']['Row']

export const dynamic = 'force-dynamic'

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null // Handled by middleware
  }

  const admin = createAdminClient()
  const { data: videoData } = await admin
    .from('videos')
    .select('*')
    .eq('id', id)
    .single()

  const video = videoData as Video | null

  if (!video) {
    notFound()
  }

  const accessStatus = await checkAccess(id)

  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backButton}>
        <Button variant="ghost" size="sm">← Retour à mon espace</Button>
      </Link>
      
      <div className={styles.header}>
        <h1 className={styles.title}>{video.title}</h1>
        <p className={styles.description}>{video.description}</p>
      </div>
 
      {accessStatus === 'allowed' ? (
        video.youtube_video_id ? (
          <YouTubePlayer videoId={id} youtubeVideoId={video.youtube_video_id} email={user.email || 'user'} />
        ) : (
          <VideoPlayer videoId={id} email={user.email || 'user'} getUrlAction={getVideoUrl} />
        )
      ) : accessStatus === 'code_required' ? (
        <CodeInput videoId={id} validateAction={validateCode} />
      ) : (
        <div className={`glass-panel ${styles.errorCard}`}>
          Une erreur est survenue lors de la vérification de l'accès à cette vidéo.
        </div>
      )}
    </div>
  )
}



