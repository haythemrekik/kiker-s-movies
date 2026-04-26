'use client'

import { useState, useEffect } from 'react'

export function useYouTubeApi() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // If the API is already loaded, we're good
    if (window.YT && window.YT.Player) {
      setIsReady(true)
      return
    }

    // Otherwise, set up the callback and load the script
    const previousOnReady = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      if (previousOnReady) previousOnReady()
      setIsReady(true)
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    if (!existingScript) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    return () => {
      // We don't remove the script as it might be used elsewhere
      // but we could clean up the callback if needed
    }
  }, [])

  return { isReady }
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}
