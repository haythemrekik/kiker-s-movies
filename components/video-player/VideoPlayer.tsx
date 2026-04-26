'use client'

import React, { useEffect, useState, useRef } from 'react'
import styles from './VideoPlayer.module.css'

interface VideoPlayerProps {
  videoId: string
  email: string
  getUrlAction: (videoId: string) => Promise<{ url?: string; error?: string }>
}

export function VideoPlayer({ videoId, email, getUrlAction }: VideoPlayerProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [ended, setEnded] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function fetchUrl() {
      try {
        const res = await getUrlAction(videoId)
        if (res.error) {
          setError(res.error)
        } else if (res.url) {
          setUrl(res.url)
        }
      } catch (err) {
        setError('Échec de la récupération de la vidéo')
      } finally {
        setLoading(false)
      }
    }
    fetchUrl()
  }, [videoId, getUrlAction])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Prevent seeking backward — anti-rewind protection
    let lastTime = 0
    const handleTimeUpdate = () => {
      if (video.currentTime < lastTime - 1) {
        video.currentTime = lastTime
      } else {
        lastTime = video.currentTime
      }
    }

    // Hide player when video ends
    const handleEnded = () => {
      setEnded(true)
      video.removeAttribute('src')
      video.load()
    }

    // Pause on tab hide
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause()
      }
    }

    // Block keyboard shortcuts that could trigger download or inspect
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

    // Prevent drag of video (could allow saving)
    const handleDragStart = (e: DragEvent) => e.preventDefault()

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('dragstart', handleDragStart)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('keydown', handleKeyDown, { capture: true })

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [url])

  // Screen capture protection — intercept getDisplayMedia
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) return

    const original = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices)

    navigator.mediaDevices.getDisplayMedia = async function (constraints?: DisplayMediaStreamOptions) {
      setIsScreenSharing(true)
      videoRef.current?.pause()
      try {
        const stream = await original(constraints)
        // When the user stops sharing, remove the overlay
        stream.getVideoTracks().forEach(track => {
          track.addEventListener('ended', () => setIsScreenSharing(false))
        })
        return stream
      } catch (e) {
        setIsScreenSharing(false)
        throw e
      }
    }

    return () => {
      navigator.mediaDevices.getDisplayMedia = original
    }
  }, [])

  if (loading) {
    return <div className={`glass-panel ${styles.messageCard}`}>Chargement du lecteur sécurisé...</div>
  }

  if (error) {
    return (
      <div className={`glass-panel ${styles.messageCard} ${styles.errorCard}`}>
        <h3 className={styles.errorTitle}>Erreur d'accès</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (!url) return null

  // Show end screen when video is finished
  if (ended) {
    return (
      <div className={`glass-panel ${styles.messageCard} ${styles.endedCard}`}>
        <div className={styles.endedIcon}>✓</div>
        <h3 className={styles.endedTitle}>Visionnage terminé</h3>
        <p className={styles.endedSubtitle}>
          Merci d'avoir regardé cette vidéo. Un nouveau code d'accès sera nécessaire pour la revoir.
        </p>
      </div>
    )
  }

  // Create a grid of emails for the watermark
  const watermarkElements = Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className={styles.watermarkRow}>
      {Array.from({ length: 5 }).map((_, j) => (
        <span key={j}>{email}</span>
      ))}
    </div>
  ))

  return (
    <div className={styles.container}>
      {isScreenSharing && (
        <div className={styles.protectionOverlay}>
          Capture d'écran détectée. La lecture est protégée.
        </div>
      )}
      <video
        ref={videoRef}
        className={styles.video}
        controls
        controlsList="nodownload nopictureinpicture"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        src={url}
        autoPlay
        playsInline
      >
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
      <div className={styles.watermark}>
        {watermarkElements}
      </div>
    </div>
  )
}
