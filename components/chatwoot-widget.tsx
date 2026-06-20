'use client'

import { useEffect } from 'react'

export default function ChatwootWidget() {
  useEffect(() => {
    // Only load Chatwoot SDK on client side
    if (typeof window !== 'undefined') {
      // Hardcoded production values
      const baseUrl = 'https://app.chatwoot.com'
      const websiteToken = 'm6GV11nqAz1SDcDm375sV7BL'

      // Set Chatwoot position to right side (WhatsApp is on left)
      ;(window as any).chatwootSettings = {
        position: 'right',
        type: 'standard',
        launcherTitle: 'Welcome to Stable Value Capital'
      }

      // Create and load Chatwoot SDK
      const script = document.createElement('script')
      script.src = `${baseUrl}/packs/js/sdk.js`
      script.async = true
      script.onload = () => {
        // Initialize Chatwoot when SDK is loaded
        if ((window as any).chatwootSDK) {
          (window as any).chatwootSDK.run({
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
