import { createClient } from '@/lib/supabase/server'
import { checkAccess, validateCode, getVideoUrl } from './actions'
import { VideoPlayer } from '@/components/video-player/VideoPlayer'
import { CodeInput } from '@/components/code-input/CodeInput'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { notFound } from 'next/navigation'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function VideoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null // Handled by middleware
  }

  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!video) {
    notFound()
  }

  const accessStatus = await checkAccess(params.id)

  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backButton}>
        <Button variant="ghost" size="sm">← Back to Dashboard</Button>
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
          An error occurred checking access to this video.
        </div>
      )}
    </div>
  )
}

