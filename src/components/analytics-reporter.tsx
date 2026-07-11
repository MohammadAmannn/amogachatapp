'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function AnalyticsReporter() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    // Avoid duplicate tracking of the exact same URL string
    const currentUrl = window.location.href
    if (lastTrackedPath.current === currentUrl) return
    lastTrackedPath.current = currentUrl

    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventName: 'page_view',
            url: currentUrl,
            referrer: document.referrer || '',
            userAgent: navigator.userAgent || '',
          }),
        })
      } catch (err) {
        // Fail silently on client side to avoid user impact
        console.warn('Analytics logging failed:', err)
      }
    }

    trackPageView()
  }, [pathname, searchParams])

  return null
}
