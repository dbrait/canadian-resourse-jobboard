import { Job } from './job'

export interface ScrapedJob {
  title: string
  company: string
  location: string
  province: string
  sector: string
  employment_type: string
  salary_range?: string
  description: string
  requirements?: string
  posted_date: string
  application_url?: string
  contact_email?: string
  source_platform: string
  source_url: string
  external_id?: string // Platform-specific job ID for deduplication
}

export interface ScrapingResult {
  success: boolean
  jobs: ScrapedJob[]
  errors: string[]
  platform: string
  scraped_at: string
  total_found: number
}

export interface ScrapingOptions {
  keywords?: string[]
  location?: string
  dateRange?: 'today' | 'week' | 'month'
  maxPages?: number
  sectors?: string[]
  maxJobsPerCompany?: number // Limit jobs scraped per company
  updateMode?: 'initial' | 'update' // Initial scrape vs update scrape
}

export interface PlatformConfig {
  name: string
  baseUrl: string
  searchPath: string
  selectors: {
    jobCard: string
    title: string
    company: string
    location: string
    description: string
    salary?: string
    postDate: string
    applyLink: string
  }
  searchParams?: Record<string, string>
}

export interface ScrapingStats {
  platform: string
  jobs_found: number
  jobs_processed: number
  jobs_added: number
  jobs_updated: number
  duplicates_found: number
  errors: number
  execution_time: number
  last_run: string
}

export abstract class BaseScraper {
  protected platform: string
  protected config: PlatformConfig
  
  constructor(platform: string, config: PlatformConfig) {
    this.platform = platform
    this.config = config
  }

  abstract scrape(options?: ScrapingOptions): Promise<ScrapingResult>
  
  protected abstract parseJobCard(html: string, baseUrl: string): ScrapedJob | null
  
  protected abstract buildSearchUrl(options?: ScrapingOptions): string
  
  protected determineSector(title: string, description: string, company: string): string {
    // This will be implemented to categorize jobs by sector
    return 'general'
  }
  
  protected extractProvince(location: string): string {
    // Extract province from location string
    const provinceMap: Record<string, string> = {
      'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba',
      'NB': 'New Brunswick', 'NL': 'Newfoundland and Labrador', 'NS': 'Nova Scotia',
      'NT': 'Northwest Territories', 'NU': 'Nunavut', 'ON': 'Ontario',
      'PE': 'Prince Edward Island', 'QC': 'Quebec', 'SK': 'Saskatchewan',
      'YT': 'Yukon'
    }
    
    for (const [abbr, fullName] of Object.entries(provinceMap)) {
      if (location.includes(abbr) || location.includes(fullName)) {
        return fullName
      }
    }
    
    return 'Unknown'
  }
  
  protected normalizeEmploymentType(type: string): string {
    const normalized = type.toLowerCase().trim()
    
    if (normalized.includes('full') && normalized.includes('time')) return 'Full-time'
    if (normalized.includes('part') && normalized.includes('time')) return 'Part-time'
    if (normalized.includes('contract')) return 'Contract'
    if (normalized.includes('temporary')) return 'Temporary'
    if (normalized.includes('intern')) return 'Internship'
    if (normalized.includes('casual')) return 'Casual'
    
    return 'Full-time' // Default
  }
  
  protected cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
  }
  
  protected generateExternalId(job: ScrapedJob): string {
    // Generate a unique ID based on job details for deduplication
    const crypto = require('crypto')
    const content = `${job.title}_${job.company}_${job.location}_${job.posted_date}`
    return crypto.createHash('md5').update(content).digest('hex')
  }
}