// Scraping schedule configuration
export const SCRAPING_SCHEDULE = {
  // Initial scraping configuration
  initial: {
    maxJobsPerCompany: 50,
    maxPages: 5,
    dateRange: 'month' as const,
    updateMode: 'initial' as const
  },
  
  // Daily update configuration (for high-activity companies)
  daily: {
    maxJobsPerCompany: 20,
    maxPages: 2,
    dateRange: 'today' as const,
    updateMode: 'update' as const
  },
  
  // Weekly update configuration (for most companies)
  weekly: {
    maxJobsPerCompany: 30,
    maxPages: 3,
    dateRange: 'week' as const,
    updateMode: 'update' as const
  }
}

// Company update frequency mapping
export const COMPANY_UPDATE_FREQUENCY: Record<string, 'daily' | 'weekly'> = {
  // High-activity companies (daily updates)
  'suncor': 'daily',
  'cn_rail': 'daily',
  'tc_energy': 'daily',
  'enbridge': 'daily',
  'canadian_natural_resources': 'daily',
  
  // Default is weekly for all other companies
}

export function getScrapingOptions(companyId: string, isInitial: boolean = false) {
  if (isInitial) {
    return SCRAPING_SCHEDULE.initial
  }
  
  const frequency = COMPANY_UPDATE_FREQUENCY[companyId] || 'weekly'
  return SCRAPING_SCHEDULE[frequency]
}