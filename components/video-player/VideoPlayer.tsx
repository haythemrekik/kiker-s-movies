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
        setError('Failed to fetch video')
      } finally {
        setLoading(false)
      }
    }
    fetchUrl()
  }, [videoId, getUrlAction])

  if (loading) {
    return <div className={`glass-panel ${styles.messageCard}`}>Loading secure video player...</div>
  }

  if (error) {
    return (
      <div className={`glass-panel ${styles.messageCard} ${styles.errorCard}`}>
        <h3 className={styles.errorTitle}>Access Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (!url) return null

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
        className={styles.video}
        controls
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        src={url}
      >
        Your browser does not support the video tag.
      </video>
      <div className={styles.watermark}>
        {watermarkElements}
      </div>
    </div>
  )
}
