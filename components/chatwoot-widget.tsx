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

      // Add CSS to position Chatwoot widget on the left side
      const style = document.createElement('style')
      style.textContent = `
        .chatwoot-widget-holder {
          position: fixed !important;
          bottom: 20px !important;
          left: 20px !important;
          right: auto !important;
          z-index: 99997 !important;
        }
        
        .chatwoot-widget-container {
          left: 0 !important;
          right: auto !important;
        }
        
        .chatwoot-dark-mode .chatwoot-widget-holder {
          left: 20px !important;
          right: auto !important;
        }
      `
      document.head.appendChild(style)

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

        // Ensure widget is positioned on the left after initialization
        setTimeout(() => {
          const widget = document.querySelector('.chatwoot-widget-holder')
          if (widget) {
            widget.style.left = '20px'
            widget.style.right = 'auto'
            widget.style.bottom = '20px'
          }
        }, 500)
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
        if (style.parentNode) {
          style.parentNode.removeChild(style)
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
