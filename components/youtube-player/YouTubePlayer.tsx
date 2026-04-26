'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useYouTubeApi } from '@/hooks/useYouTubeApi'
import styles from './YouTubePlayer.module.css'

interface YouTubePlayerProps {
  videoId: string
  youtubeVideoId: string
  email: string
}

export function YouTubePlayer({ videoId, youtubeVideoId, email }: YouTubePlayerProps) {
  const { isReady } = useYouTubeApi()
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ended, setEnded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isReady || !containerRef.current || playerRef.current) return

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: youtubeVideoId,
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        controls: 1,
        disablekb: 0,
        fs: 1,
        playsinline: 1
      },
      events: {
        onReady: () => setLoading(false),
        onStateChange: (event: any) => {
          // YT.PlayerState.ENDED = 0
          if (event.data === 0) {
            handleEnded()
          }
        }
      }
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      const blocked = [
        e.key === 'F12',
        e.key === 'F5' && (e.ctrlKey || e.metaKey),
        // Ctrl/Cmd + S (save), U (source), Shift+I (devtools)
        (e.ctrlKey || e.metaKey) && ['s', 'u', 'p'].includes(e.key.toLowerCase()),
        // Ctrl+Shift+I / J / C (devtools)
        (e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()),
      ]
      if (blocked.some(Boolean)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [isReady, youtubeVideoId])

  const handleEnded = async () => {
    setEnded(true)
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }

    try {
      await fetch('/api/videos/mark-watched', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      })
    } catch (error) {
      console.error('Failed to mark as watched:', error)
    }
  }

  if (ended) {
    return (
      <div className={`glass-panel ${styles.endedCard}`}>
        <div className={styles.endedIcon}>✓</div>
        <h3 className={styles.endedTitle}>Visionnage terminé</h3>
        <p className={styles.endedSubtitle}>
          Cette vidéo a été marquée comme vue. Un nouveau code d'accès sera nécessaire pour la revoir.
        </p>
      </div>
    )
  }

  // Create watermark grid
  const watermarkElements = Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className={styles.watermarkRow}>
      {Array.from({ length: 5 }).map((_, j) => (
        <span key={j}>{email}</span>
      ))}
    </div>
  ))

  return (
    <div className={styles.container} onContextMenu={(e) => e.preventDefault()}>
      {loading && <div className={styles.loader}>Chargement du lecteur sécurisé...</div>}
      
      <div className={styles.playerWrapper}>
        <div ref={containerRef} className={styles.player} />
        
        {/* Anti-Click Overlays to hide/block YouTube UI elements */}
        {/* Top overlay blocks Title, Watch Later, and Share buttons */}
        <div className={styles.topBlocker} />
        
        {/* Bottom right overlay blocks the YouTube logo watermark */}
        <div className={styles.logoBlocker} />
      </div>

      <div className={styles.watermark}>
        {watermarkElements}
      </div>
    </div>
  )
}
