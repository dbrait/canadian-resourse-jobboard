// Google Analytics 4 integration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Load gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: title || document.title,
      page_location: url,
    })
  }
}

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Job-specific tracking events
export const trackJobView = (jobId: number, jobTitle: string, company: string, sector: string) => {
  trackEvent('view_job', 'job_interaction', `${jobTitle} - ${company}`, jobId)
  
  // Also track job details for better analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      item_id: jobId.toString(),
      item_name: jobTitle,
      item_category: sector,
      item_brand: company,
    })
  }
}

export const trackJobApplication = (jobId: number, jobTitle: string, company: string, applicationType: 'external' | 'email') => {
  trackEvent('apply_job', 'job_interaction', `${jobTitle} - ${company} (${applicationType})`, jobId)
  
  // Track as conversion
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: GA_TRACKING_ID,
      event_category: 'job_application',
      event_label: `${jobTitle} - ${company}`,
      value: 1,
    })
  }
}

export const trackNotificationSignup = (subscriptionType: string, frequency: string, sectors: string[]) => {
  trackEvent('signup_notification', 'notification', `${subscriptionType} - ${frequency}`)
  
  // Track sectors of interest
  sectors.forEach(sector => {
    trackEvent('notification_sector_interest', 'notification', sector)
  })
}

export const trackSearch = (query: string, filters: Record<string, any>, resultsCount: number) => {
  trackEvent('search', 'site_search', query, resultsCount)
  
  // Track search filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      trackEvent('search_filter', 'site_search', `${key}:${value}`)
    }
  })
}

export const trackSectorView = (sector: string, jobCount: number) => {
  trackEvent('view_sector', 'navigation', sector, jobCount)
}

export const trackLocationView = (location: string, jobCount: number) => {
  trackEvent('view_location', 'navigation', location, jobCount)
}

// Enhanced ecommerce tracking for job board metrics
export const trackJobListView = (jobs: Array<{id: number, title: string, company: string, sector: string}>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item_list', {
      item_list_name: 'Job Listings',
      items: jobs.map((job, index) => ({
        item_id: job.id.toString(),
        item_name: job.title,
        item_category: job.sector,
        item_brand: job.company,
        index: index + 1,
      }))
    })
  }
}

// User engagement tracking
export const trackTimeOnPage = () => {
  const startTime = Date.now()
  
  const handleBeforeUnload = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    trackEvent('time_on_page', 'engagement', window.location.pathname, timeSpent)
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Also track at intervals for single-page navigation
    const interval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      if (timeSpent >= 30 && timeSpent % 30 === 0) { // Track every 30 seconds after initial 30
        trackEvent('engaged_time', 'engagement', window.location.pathname, timeSpent)
      }
    }, 30000)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(interval)
    }
  }
}

// Scroll depth tracking
export const trackScrollDepth = () => {
  let maxScroll = 0
  const milestones = [25, 50, 75, 100]
  const tracked = new Set<number>()
  
  const handleScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    )
    
    maxScroll = Math.max(maxScroll, scrollPercent)
    
    milestones.forEach(milestone => {
      if (maxScroll >= milestone && !tracked.has(milestone)) {
        tracked.add(milestone)
        trackEvent('scroll_depth', 'engagement', `${milestone}%`, milestone)
      }
    })
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }
}

// Declare global gtag interface
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}