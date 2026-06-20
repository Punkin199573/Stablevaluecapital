'use client'

import { useEffect } from 'react'

export default function ChatwootWidget() {
  useEffect(() => {
    // Only load Chatwoot SDK on client side
    if (typeof window !== 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL
      const websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN

      if (!baseUrl || !websiteToken) {
        console.warn('Chatwoot configuration missing. Please set NEXT_PUBLIC_CHATWOOT_BASE_URL and NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN')
        return
      }

      // Create and load Chatwoot SDK
      const script = document.createElement('script')
      script.src = `${baseUrl}/packs/js/sdk.js`
      script.async = true
      script.onload = () => {
        // Initialize Chatwoot when SDK is loaded
        if (window.chatwootSDK) {
          window.chatwootSDK.run({
            websiteToken: websiteToken,
            baseUrl: baseUrl,
          })
        }
      }
      script.onerror = () => {
        console.error('Failed to load Chatwoot SDK')
      }

      // Append script to document
      document.body.appendChild(script)

      // Cleanup function
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    }
  }, [])

  return null
}

// TypeScript augmentation for window object
declare global {
  interface Window {
    chatwootSDK: {
      run: (config: {
        websiteToken: string
        baseUrl: string
      }) => void
    }
  }
}