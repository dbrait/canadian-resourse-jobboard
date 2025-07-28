import { ScrapingBeeClient } from 'scrapingbee'
import { SCRAPING_CONFIG, RESOURCE_SECTORS } from './config'
import { BaseScraper, ScrapingResult, ScrapingOptions, ScrapingStats } from '../../types/scraping'
import { supabase } from '../supabase'

export class ScraperManager {
  private scrapingBee: ScrapingBeeClient
  private scrapers: Map<string, BaseScraper> = new Map()
  private rateLimitQueue: Array<() => Promise<any>> = []
  private isProcessingQueue = false

  constructor() {
    this.scrapingBee = new ScrapingBeeClient(SCRAPING_CONFIG.apiKey)
  }

  registerScraper(platform: string, scraper: BaseScraper) {
    this.scrapers.set(platform, scraper)
  }

  async scrapeAll(options?: ScrapingOptions): Promise<Record<string, ScrapingResult>> {
    const results: Record<string, ScrapingResult> = {}
    
    for (const [platform, scraper] of this.scrapers) {
      try {
        console.log(`Starting scrape for ${platform}...`)
        const result = await this.scrapeWithRateLimit(scraper, options)
        results[platform] = result
        
        // Save scraped jobs to database
        if (result.success && result.jobs.length > 0) {
          await this.saveJobsToDatabase(result.jobs, platform)
        }
        
        // Log scraping stats
        await this.logScrapingStats(platform, result)
        
      } catch (error) {
        console.error(`Error scraping ${platform}:`, error)
        results[platform] = {
          success: false,
          jobs: [],
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          platform,
          scraped_at: new Date().toISOString(),
          total_found: 0
        }
      }
    }

    return results
  }

  async scrapePlatform(platform: string, options?: ScrapingOptions): Promise<ScrapingResult> {
    const scraper = this.scrapers.get(platform)
    if (!scraper) {
      throw new Error(`No scraper registered for platform: ${platform}`)
    }

    const result = await this.scrapeWithRateLimit(scraper, options)
    
    if (result.success && result.jobs.length > 0) {
      await this.saveJobsToDatabase(result.jobs, platform)
    }
    
    await this.logScrapingStats(platform, result)
    
    return result
  }

  private async scrapeWithRateLimit(scraper: BaseScraper, options?: ScrapingOptions): Promise<ScrapingResult> {
    return new Promise((resolve, reject) => {
      this.rateLimitQueue.push(async () => {
        try {
          const result = await scraper.scrape(options)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      if (!this.isProcessingQueue) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    this.isProcessingQueue = true
    
    while (this.rateLimitQueue.length > 0) {
      const task = this.rateLimitQueue.shift()
      if (task) {
        await task()
        // Wait between requests to respect rate limits
        await this.delay(SCRAPING_CONFIG.rateLimit.delayBetweenRequests)
      }
    }
    
    this.isProcessingQueue = false
  }

  private async saveJobsToDatabase(jobs: any[], platform: string) {
    const processedJobs = []
    const duplicateJobs = []

    for (const job of jobs) {
      // Check for duplicates based on external_id or job content hash
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('external_id', job.external_id)
        .single()

      if (existingJob) {
        duplicateJobs.push(job)
        continue
      }

      // Convert scraped job to database format
      const dbJob = {
        title: job.title,
        company: job.company,
        location: job.location,
        province: job.province,
        sector: job.sector,
        employment_type: job.employment_type,
        salary_range: job.salary_range,
        description: job.description,
        requirements: job.requirements,
        posted_date: job.posted_date,
        application_url: job.application_url,
        contact_email: job.contact_email,
        is_active: true,
        created_at: new Date().toISOString(),
        source_platform: platform,
        source_url: job.source_url,
        external_id: job.external_id
      }

      processedJobs.push(dbJob)
    }

    if (processedJobs.length > 0) {
      const { error } = await supabase
        .from('jobs')
        .insert(processedJobs)

      if (error) {
        console.error('Error inserting jobs:', error)
        throw error
      }

      console.log(`Inserted ${processedJobs.length} new jobs from ${platform}`)
    }

    if (duplicateJobs.length > 0) {
      console.log(`Skipped ${duplicateJobs.length} duplicate jobs from ${platform}`)
    }
  }

  private async logScrapingStats(platform: string, result: ScrapingResult) {
    const stats: ScrapingStats = {
      platform,
      jobs_found: result.total_found,
      jobs_processed: result.jobs.length,
      jobs_added: result.jobs.length, // This would be updated after DB insertion
      jobs_updated: 0,
      duplicates_found: 0, // This would be calculated during DB insertion
      errors: result.errors.length,
      execution_time: 0, // Would need to track timing
      last_run: result.scraped_at
    }

    // Save stats to database
    const { error } = await supabase
      .from('scraping_stats')
      .insert(stats)

    if (error) {
      console.error('Error logging scraping stats:', error)
    }
  }

  async makeScrapingBeeRequest(url: string, options: any = {}) {
    const requestOptions = {
      ...SCRAPING_CONFIG.defaultOptions,
      ...options
    }

    let attempt = 0
    let lastError

    while (attempt < SCRAPING_CONFIG.retry.maxAttempts) {
      try {
        const response = await this.scrapingBee.get({
          url,
          params: requestOptions
        })

        return response.data
      } catch (error) {
        lastError = error
        attempt++
        
        if (attempt < SCRAPING_CONFIG.retry.maxAttempts) {
          const delay = SCRAPING_CONFIG.retry.initialDelay * 
                       Math.pow(SCRAPING_CONFIG.retry.backoffMultiplier, attempt - 1)
          await this.delay(delay)
        }
      }
    }

    throw lastError
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Utility method to categorize jobs by sector
  static categorizeJobBySector(title: string, description: string, company: string): string {
    const content = `${title} ${description} ${company}`.toLowerCase()
    
    for (const [sector, keywords] of Object.entries(RESOURCE_SECTORS)) {
      for (const keyword of keywords) {
        if (content.includes(keyword.toLowerCase())) {
          return sector.replace('_', ' ')
        }
      }
    }
    
    return 'general'
  }

  // Get scraping statistics
  async getScrapingStats(platform?: string, days: number = 7): Promise<ScrapingStats[]> {
    let query = supabase
      .from('scraping_stats')
      .select('*')
      .gte('last_run', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('last_run', { ascending: false })

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  }
}