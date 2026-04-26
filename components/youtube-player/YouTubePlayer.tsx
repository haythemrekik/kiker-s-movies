'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useYouTubeApi } from '@/hooks/useYouTubeApi'
import styles from './YouTubePlayer.module.css'

interface YouTubePlayerProps {
  videoId: string
  youtubeVideoId: string
  email: string
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function YouTubePlayer({ videoId, youtubeVideoId, email }: YouTubePlayerProps) {
  const { isReady } = useYouTubeApi()
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mainWrapperRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const [ended, setEnded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0 to 100
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Track progress when playing
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const current = playerRef.current.getCurrentTime()
          const total = playerRef.current.getDuration()
          setCurrentTime(current)
          setDuration(total)
          setProgress((current / total) * 100)
        }
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isHovering && isPlaying) {
      timeout = setTimeout(() => setIsHovering(false), 3000)
    }
    return () => clearTimeout(timeout)
  }, [isHovering, isPlaying])

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Anti-download Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const blocked = [
        e.key === 'F12',
        e.key === 'F5' && (e.ctrlKey || e.metaKey),
        (e.ctrlKey || e.metaKey) && ['s', 'u', 'p'].includes(e.key.toLowerCase()),
        (e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()),
      ]
      if (blocked.some(Boolean)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [])

  // Initialize YouTube API
  useEffect(() => {
    if (!isReady || !containerRef.current || playerRef.current) return

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: youtubeVideoId,
      playerVars: {
        autoplay: 1,
        modestbranding: 1, // Will still show YT text when paused without controls:0
        rel: 0,
        showinfo: 0,
        controls: 0,       // COMPLETELY HIDE NATIVE YOUTUBE UI
        disablekb: 1,      // Disable native keyboard shortcuts
        fs: 0,             // Disable native fullscreen button (we handle it)
        playsinline: 1,
        iv_load_policy: 3  // Hide video annotations
      },
      events: {
        onReady: (event: any) => {
          setLoading(false)
          setDuration(event.target.getDuration())
          setVolume(event.target.getVolume())
          setIsMuted(event.target.isMuted())
          event.target.playVideo()
        },
        onStateChange: (event: any) => {
          // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
          setIsPlaying(event.data === 1)
          if (event.data === 0) {
            handleEnded()
          }
        }
      }
    })

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
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

  // Interaction Handlers
  const togglePlay = () => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    playerRef.current.seekTo(newTime, true)
    setCurrentTime(newTime)
    setProgress(percent * 100)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return
    const newVolume = parseInt(e.target.value)
    playerRef.current.setVolume(newVolume)
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    } else if (newVolume === 0 && !isMuted) {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }

  const toggleMute = () => {
    if (!playerRef.current) return
    if (isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
      if (volume === 0) {
        playerRef.current.setVolume(50)
        setVolume(50)
      }
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    if (!mainWrapperRef.current) return
    if (!document.fullscreenElement) {
      mainWrapperRef.current.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err)
      })
    } else {
      document.exitFullscreen()
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

  // Watermark
  const watermarkElements = Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className={styles.watermarkRow}>
      {Array.from({ length: 5 }).map((_, j) => (
        <span key={j}>{email}</span>
      ))}
    </div>
  ))

  return (
    <div 
      ref={mainWrapperRef}
      className={styles.container} 
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {loading && <div className={styles.loader}>Chargement du lecteur sécurisé...</div>}
      
      <div className={styles.playerWrapper}>
        <div ref={containerRef} className={styles.player} />
      </div>

      {/* Invisible overlay over the entire video to capture play/pause clicks and block right-clicks to iframe */}
      <div className={styles.clickOverlay} onClick={togglePlay} />

      {!isFullscreen && (
        <div className={styles.watermark}>
          {watermarkElements}
        </div>
      )}

      {/* Custom Control Bar */}
      {!loading && (
        <div className={`${styles.controlsWrapper} ${(isHovering || !isPlaying) ? styles.controlsActive : ''}`}>
          
          <div className={styles.timelineContainer} ref={timelineRef} onClick={handleTimelineClick}>
            <div className={styles.timelineTrack}>
              <div className={styles.timelineProgress} style={{ width: `${progress}%` }}>
                <div className={styles.timelineThumb} />
              </div>
            </div>
          </div>

          <div className={styles.controlsBottom}>
            <div className={styles.leftControls}>
              <button className={styles.controlButton} onClick={togglePlay}>
                {isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              
              <div className={styles.volumeContainer}>
                <button className={styles.controlButton} onClick={toggleMute}>
                  {isMuted || volume === 0 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                  ) : volume < 50 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9v6h4l5 5V4L9 9H5zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  )}
                </button>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange}
                  className={styles.volumeSlider}
                />
              </div>

              <span className={styles.timeDisplay}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className={styles.rightControls}>
              <button className={styles.controlButton} onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
