import { BaseScraper, ScrapedJob, ScrapingResult, ScrapingOptions } from '../../../types/scraping'
import { ScraperManager } from '../scraper-manager'
import * as cheerio from 'cheerio'

export interface CompanyConfig {
  name: string
  sector: string
  baseUrl: string
  careersPath: string
  searchPath?: string
  selectors: {
    jobCard: string[]
    title: string[]
    location: string[]
    department?: string[]
    jobType?: string[]
    description?: string[]
    postDate?: string[]
    applyLink: string[]
    nextPage?: string[]
  }
  searchParams?: Record<string, string>
  customLogic?: {
    buildSearchUrl?: (baseUrl: string, options?: ScrapingOptions) => string[]
    parseJobCard?: (html: string, baseUrl: string, sector: string) => ScrapedJob | null
    extractJobDetails?: (applyUrl: string) => Promise<Partial<ScrapedJob>>
  }
}

export abstract class CompanyBaseScraper extends BaseScraper {
  protected scraperManager: ScraperManager
  protected companyConfig: CompanyConfig

  constructor(scraperManager: ScraperManager, companyConfig: CompanyConfig) {
    super(companyConfig.name.toLowerCase().replace(/\s+/g, '_'), {
      name: companyConfig.name,
      baseUrl: companyConfig.baseUrl,
      searchPath: companyConfig.careersPath,
      selectors: {
        jobCard: companyConfig.selectors.jobCard[0],
        title: companyConfig.selectors.title[0],
        company: companyConfig.name, // Static company name
        location: companyConfig.selectors.location[0],
        description: companyConfig.selectors.description?.[0] || '',
        postDate: companyConfig.selectors.postDate?.[0] || '',
        applyLink: companyConfig.selectors.applyLink[0]
      }
    })
    this.scraperManager = scraperManager
    this.companyConfig = companyConfig
  }

  async scrape(options?: ScrapingOptions): Promise<ScrapingResult> {
    const startTime = Date.now()
    const results: ScrapingResult = {
      success: false,
      jobs: [],
      errors: [],
      platform: this.platform,
      scraped_at: new Date().toISOString(),
      total_found: 0
    }

    try {
      const maxJobs = options?.maxJobsPerCompany || 50 // Default to 50 jobs per company
      const searchUrls = this.buildSearchUrls(options)
      
      for (const url of searchUrls) {
        // Stop if we've reached the job limit
        if (results.jobs.length >= maxJobs) {
          console.log(`Reached job limit of ${maxJobs} for ${this.companyConfig.name}`)
          break
        }
        
        try {
          console.log(`Scraping ${this.companyConfig.name} URL: ${url}`)
          
          const html = await this.scraperManager.makeScrapingBeeRequest(url, {
            wait_for: this.companyConfig.selectors.jobCard[0],
            wait: 3000,
            render_js: true
          })

          const jobs = this.parseJobsFromHtml(html, url)
          
          // Only add jobs up to the limit
          const remainingSlots = maxJobs - results.jobs.length
          const jobsToAdd = jobs.slice(0, remainingSlots)
          results.jobs.push(...jobsToAdd)
          
          console.log(`Added ${jobsToAdd.length} jobs from ${url} (${results.jobs.length}/${maxJobs})`)
          
          // Add delay between pages
          await this.delay(2000)
          
        } catch (error) {
          const errorMsg = `Error scraping URL ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(errorMsg)
          results.errors.push(errorMsg)
        }
      }

      results.total_found = results.jobs.length
      results.success = results.errors.length === 0 || results.jobs.length > 0
      
      console.log(`${this.companyConfig.name} scraping completed: ${results.jobs.length} jobs found in ${Date.now() - startTime}ms`)
      
    } catch (error) {
      const errorMsg = `Fatal error in ${this.companyConfig.name} scraper: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(errorMsg)
      results.errors.push(errorMsg)
    }

    return results
  }

  protected buildSearchUrl(options?: ScrapingOptions): string {
    if (this.companyConfig.customLogic?.buildSearchUrl) {
      const urls = this.companyConfig.customLogic.buildSearchUrl(this.companyConfig.baseUrl, options)
      return urls[0] || `${this.companyConfig.baseUrl}${this.companyConfig.careersPath}`
    }

    return `${this.companyConfig.baseUrl}${this.companyConfig.careersPath}`
  }

  private buildSearchUrls(options?: ScrapingOptions): string[] {
    if (this.companyConfig.customLogic?.buildSearchUrl) {
      return this.companyConfig.customLogic.buildSearchUrl(this.companyConfig.baseUrl, options)
    }

    const maxPages = Math.min(options?.maxPages || 3, 5)
    const urls: string[] = []
    
    // Base careers page
    const baseUrl = `${this.companyConfig.baseUrl}${this.companyConfig.careersPath}`
    urls.push(baseUrl)

    // Add potential pagination URLs
    for (let page = 2; page <= maxPages; page++) {
      urls.push(`${baseUrl}?page=${page}`)
      urls.push(`${baseUrl}&page=${page}`)
    }

    return urls
  }

  private parseJobsFromHtml(html: string, sourceUrl: string): ScrapedJob[] {
    const $ = cheerio.load(html)
    const jobs: ScrapedJob[] = []

    // Try multiple selectors for job cards
    let jobCards: any = $('')
    
    for (const selector of this.companyConfig.selectors.jobCard) {
      jobCards = $(selector)
      if (jobCards.length > 0) break
    }

    console.log(`Found ${jobCards.length} job cards for ${this.companyConfig.name}`)

    jobCards.each((index: number, element: any) => {
      try {
        const job = this.parseJobCard($.html(element) || '', sourceUrl)
        if (job) {
          jobs.push(job)
        }
      } catch (error) {
        console.error(`Error parsing job card ${index} for ${this.companyConfig.name}:`, error)
      }
    })

    return jobs
  }

  protected parseJobCard(html: string, baseUrl: string): ScrapedJob | null {
    if (this.companyConfig.customLogic?.parseJobCard) {
      return this.companyConfig.customLogic.parseJobCard(html, baseUrl, this.companyConfig.sector)
    }

    const $ = cheerio.load(html)

    try {
      // Extract job details using multiple potential selectors
      const title = this.extractText($ as any, this.companyConfig.selectors.title)
      const location = this.extractText($ as any, this.companyConfig.selectors.location)
      const department = this.companyConfig.selectors.department ? 
        this.extractText($ as any, this.companyConfig.selectors.department) : ''
      const jobType = this.companyConfig.selectors.jobType ? 
        this.extractText($ as any, this.companyConfig.selectors.jobType) : ''
      const description = this.companyConfig.selectors.description ? 
        this.extractText($ as any, this.companyConfig.selectors.description) : ''

      // Extract apply link
      let applicationUrl = ''
      for (const selector of this.companyConfig.selectors.applyLink) {
        const linkElement = $(selector).first()
        if (linkElement.length > 0) {
          const href = linkElement.attr('href')
          if (href) {
            applicationUrl = href.startsWith('http') ? href : `${this.companyConfig.baseUrl}${href}`
            break
          }
        }
      }

      // Skip if essential fields are missing
      if (!title || !location) {
        return null
      }

      const job: ScrapedJob = {
        title: this.cleanText(title),
        company: this.companyConfig.name,
        location: this.cleanText(location),
        province: this.extractProvince(location),
        sector: this.companyConfig.sector,
        employment_type: this.normalizeEmploymentType(jobType || 'Full-time'),
        description: this.cleanText(description || `${title} position at ${this.companyConfig.name}`),
        requirements: department ? `Department: ${this.cleanText(department)}` : undefined,
        posted_date: new Date().toISOString().split('T')[0], // Default to today
        application_url: applicationUrl,
        source_platform: this.platform,
        source_url: baseUrl,
        external_id: this.generateExternalId({
          title: this.cleanText(title),
          company: this.companyConfig.name,
          location: this.cleanText(location),
          posted_date: new Date().toISOString().split('T')[0]
        } as ScrapedJob)
      }

      return job

    } catch (error) {
      console.error(`Error parsing ${this.companyConfig.name} job card:`, error)
      return null
    }
  }

  private extractText($: cheerio.CheerioAPI, selectors: string[]): string {
    for (const selector of selectors) {
      const element = $(selector).first()
      if (element.length > 0) {
        const text = element.text().trim()
        if (text) return text
      }
    }
    return ''
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Helper method to fetch additional job details from individual job pages
  protected async fetchJobDetails(jobUrl: string): Promise<Partial<ScrapedJob>> {
    try {
      const html = await this.scraperManager.makeScrapingBeeRequest(jobUrl, {
        wait: 2000,
        render_js: true
      })

      const $ = cheerio.load(html)
      
      // Common selectors for job detail pages
      const detailSelectors = {
        description: ['.job-description', '.description', '[class*="description"]', '.content', '.job-content'],
        requirements: ['.requirements', '.qualifications', '[class*="requirement"]', '.job-requirements'],
        postDate: ['.post-date', '.posted', '[class*="date"]', '.job-date'],
        jobType: ['.job-type', '.employment-type', '[class*="type"]'],
        department: ['.department', '.division', '[class*="department"]']
      }

      return {
        description: this.extractText($ as any, detailSelectors.description),
        requirements: this.extractText($ as any, detailSelectors.requirements),
        employment_type: this.extractText($ as any, detailSelectors.jobType)
      }

    } catch (error) {
      console.error(`Error fetching job details from ${jobUrl}:`, error)
      return {}
    }
  }
}