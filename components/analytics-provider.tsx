'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initGA, trackPageView, trackTimeOnPage, trackScrollDepth, GA_TRACKING_ID } from '@/lib/analytics/google-analytics'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize Google Analytics
    if (GA_TRACKING_ID && typeof window !== 'undefined') {
      initGA()
    }
  }, [])

  useEffect(() => {
    // Track page views
    if (GA_TRACKING_ID && typeof window !== 'undefined') {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      trackPageView(url)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    // Set up engagement tracking
    const cleanupTime = trackTimeOnPage()
    const cleanupScroll = trackScrollDepth()

    return () => {
      cleanupTime?.()
      cleanupScroll?.()
    }
  }, [pathname])

  return <>{children}</>
}