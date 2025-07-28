import { BaseScraper, ScrapedJob, ScrapingResult, ScrapingOptions } from '../../../types/scraping'
import { JOB_PLATFORMS, RESOURCE_SECTORS } from '../config'
import { ScraperManager } from '../scraper-manager'
import * as cheerio from 'cheerio'

export class IndeedScraper extends BaseScraper {
  private scraperManager: ScraperManager

  constructor(scraperManager: ScraperManager) {
    super('indeed', JOB_PLATFORMS.indeed)
    this.scraperManager = scraperManager
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
      const searchUrls = this.buildSearchUrls(options)
      
      for (const url of searchUrls) {
        try {
          console.log(`Scraping Indeed URL: ${url}`)
          
          const html = await this.scraperManager.makeScrapingBeeRequest(url, {
            wait_for: '.jobsearch-SerpJobCard, .job_seen_beacon',
            wait: 5000
          })

          const jobs = this.parseJobsFromHtml(html, url)
          results.jobs.push(...jobs)
          
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
      
      console.log(`Indeed scraping completed: ${results.jobs.length} jobs found in ${Date.now() - startTime}ms`)
      
    } catch (error) {
      const errorMsg = `Fatal error in Indeed scraper: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(errorMsg)
      results.errors.push(errorMsg)
    }

    return results
  }

  protected buildSearchUrl(options?: ScrapingOptions): string {
    const baseUrl = this.config.baseUrl + this.config.searchPath
    const params = new URLSearchParams()

    // Build search query with resource sector keywords
    const keywords = options?.keywords || this.getResourceKeywords(options?.sectors)
    if (keywords.length > 0) {
      params.set('q', keywords.join(' OR '))
    }

    // Location - focus on major Canadian resource regions
    const location = options?.location || 'Canada'
    params.set('l', location)

    // Date range
    const dateRange = options?.dateRange || 'week'
    const dateMap = { today: '1', week: '7', month: '30' }
    params.set('fromage', dateMap[dateRange])

    // Results per page
    params.set('limit', '50')

    // Sort by date
    params.set('sort', 'date')

    // Only show jobs with apply buttons/links
    params.set('filter', '1')

    return `${baseUrl}?${params.toString()}`
  }

  private buildSearchUrls(options?: ScrapingOptions): string[] {
    const urls: string[] = []
    const maxPages = options?.maxPages || 5

    // Base search URL
    const baseSearchUrl = this.buildSearchUrl(options)
    urls.push(baseSearchUrl)

    // Add pagination URLs
    for (let page = 1; page < maxPages; page++) {
      const pageUrl = `${baseSearchUrl}&start=${page * 50}`
      urls.push(pageUrl)
    }

    return urls
  }

  private parseJobsFromHtml(html: string, sourceUrl: string): ScrapedJob[] {
    const $ = cheerio.load(html)
    const jobs: ScrapedJob[] = []

    // Indeed uses multiple selectors for job cards
    const jobCardSelectors = [
      '.jobsearch-SerpJobCard',
      '.job_seen_beacon',
      '[data-jk]',
      '.slider_container .slider_item'
    ]

    let jobCards: cheerio.Cheerio<cheerio.Element> = $()
    
    for (const selector of jobCardSelectors) {
      jobCards = $(selector)
      if (jobCards.length > 0) break
    }

    console.log(`Found ${jobCards.length} job cards on Indeed`)

    jobCards.each((index, element) => {
      try {
        const job = this.parseJobCard($.html(element) || '', sourceUrl)
        if (job) {
          jobs.push(job)
        }
      } catch (error) {
        console.error(`Error parsing job card ${index}:`, error)
      }
    })

    return jobs
  }

  protected parseJobCard(html: string, baseUrl: string): ScrapedJob | null {
    const $ = cheerio.load(html)

    try {
      // Extract job details using multiple potential selectors
      const title = this.extractText($, [
        'h2.jobTitle a span[title]',
        '.jobTitle a',
        'h2 a span',
        '[data-testid="job-title"]'
      ])

      const company = this.extractText($, [
        '.companyName',
        'span.companyName a',
        '[data-testid="company-name"]',
        '.companyOverviewLink'
      ])

      const location = this.extractText($, [
        '.companyLocation',
        '[data-testid="job-location"]',
        '.locationsContainer'
      ])

      const description = this.extractText($, [
        '.job-snippet',
        '[data-testid="job-snippet"]',
        '.summary'
      ])

      const salary = this.extractText($, [
        '.salary-snippet',
        '.salaryText',
        '[data-testid="job-salary"]'
      ])

      // Extract apply link
      const applyLinkElement = $('h2.jobTitle a, .jobTitle a').first()
      let applicationUrl = ''
      
      if (applyLinkElement.length > 0) {
        const href = applyLinkElement.attr('href')
        if (href) {
          applicationUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`
        }
      }

      // Skip if essential fields are missing
      if (!title || !company || !location) {
        return null
      }

      // Determine sector based on job content
      const sector = ScraperManager.categorizeJobBySector(title, description, company)
      
      // Skip if not in resource sectors (unless general search)
      if (sector === 'general' && this.hasResourceKeywords(title + ' ' + description + ' ' + company) === false) {
        return null
      }

      const job: ScrapedJob = {
        title: this.cleanText(title),
        company: this.cleanText(company),
        location: this.cleanText(location),
        province: this.extractProvince(location),
        sector,
        employment_type: this.normalizeEmploymentType('Full-time'), // Indeed doesn't always show this clearly
        salary_range: salary ? this.cleanText(salary) : undefined,
        description: this.cleanText(description),
        posted_date: new Date().toISOString().split('T')[0], // Indeed doesn't always show clear dates
        application_url: applicationUrl,
        source_platform: this.platform,
        source_url: baseUrl,
        external_id: this.generateExternalId({
          title: this.cleanText(title),
          company: this.cleanText(company),
          location: this.cleanText(location),
          posted_date: new Date().toISOString().split('T')[0]
        } as ScrapedJob)
      }

      return job

    } catch (error) {
      console.error('Error parsing Indeed job card:', error)
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

  private getResourceKeywords(sectors?: string[]): string[] {
    if (!sectors || sectors.length === 0) {
      // Return keywords from all resource sectors
      return Object.values(RESOURCE_SECTORS).flat()
    }

    const keywords: string[] = []
    for (const sector of sectors) {
      const sectorKey = sector.replace(' ', '_') as keyof typeof RESOURCE_SECTORS
      if (RESOURCE_SECTORS[sectorKey]) {
        keywords.push(...RESOURCE_SECTORS[sectorKey])
      }
    }

    return keywords
  }

  private hasResourceKeywords(content: string): boolean {
    const lowercaseContent = content.toLowerCase()
    const allKeywords = Object.values(RESOURCE_SECTORS).flat()
    
    return allKeywords.some(keyword => 
      lowercaseContent.includes(keyword.toLowerCase())
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}