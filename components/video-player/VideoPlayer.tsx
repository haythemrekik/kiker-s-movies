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
      // Allow a small tolerance of 1 second
      if (video.currentTime < lastTime - 1) {
        video.currentTime = lastTime
      } else {
        lastTime = video.currentTime
      }
    }

    // Hide player when video ends
    const handleEnded = () => {
      setEnded(true)
      // Revoke the object URL to prevent any replay attempt
      if (url) {
        video.removeAttribute('src')
        video.load()
      }
    }

    // Pause on tab hide
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause()
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
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
