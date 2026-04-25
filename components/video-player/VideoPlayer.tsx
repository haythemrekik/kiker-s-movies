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

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [url])

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
      <video
        ref={videoRef}
        className={styles.video}
        controls
        controlsList="nodownload nofullscreen"
        onContextMenu={(e) => e.preventDefault()}
        src={url}
        autoPlay
      >
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
      <div className={styles.watermark}>
        {watermarkElements}
      </div>
    </div>
  )
}
