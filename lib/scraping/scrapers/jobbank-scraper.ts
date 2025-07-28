import { BaseScraper, ScrapedJob, ScrapingResult, ScrapingOptions } from '../../../types/scraping'
import { JOB_PLATFORMS, RESOURCE_SECTORS } from '../config'
import { ScraperManager } from '../scraper-manager'
import * as cheerio from 'cheerio'

export class JobBankScraper extends BaseScraper {
  private scraperManager: ScraperManager

  constructor(scraperManager: ScraperManager) {
    super('jobbank', JOB_PLATFORMS.jobbank)
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
          console.log(`Scraping Job Bank URL: ${url}`)
          
          const html = await this.scraperManager.makeScrapingBeeRequest(url, {
            wait_for: '.job-posting-brief, .noresult',
            wait: 5000,
            render_js: true
          })

          const jobs = this.parseJobsFromHtml(html, url)
          results.jobs.push(...jobs)
          
          // Add delay between pages
          await this.delay(3000)
          
        } catch (error) {
          const errorMsg = `Error scraping URL ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(errorMsg)
          results.errors.push(errorMsg)
        }
      }

      results.total_found = results.jobs.length
      results.success = results.errors.length === 0 || results.jobs.length > 0
      
      console.log(`Job Bank scraping completed: ${results.jobs.length} jobs found in ${Date.now() - startTime}ms`)
      
    } catch (error) {
      const errorMsg = `Fatal error in Job Bank scraper: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      params.set('searchstring', keywords.slice(0, 5).join(' ')) // Job Bank has keyword limits
    }

    // Location - Job Bank uses different location codes
    const location = options?.location || ''
    if (location) {
      params.set('locationstring', location)
    }

    // Date range
    const dateRange = options?.dateRange || 'week'
    if (dateRange === 'today') {
      params.set('sort', '2') // Sort by date posted - newest first
    } else if (dateRange === 'week') {
      params.set('sort', '2')
    }

    // Language - English
    params.set('lang', 'en')

    return `${baseUrl}?${params.toString()}`
  }

  private buildSearchUrls(options?: ScrapingOptions): string[] {
    const urls: string[] = []
    const maxPages = Math.min(options?.maxPages || 3, 3) // Job Bank typically has fewer pages

    // Resource sector specific searches
    const sectors = options?.sectors || ['mining', 'oil_gas', 'forestry', 'renewable', 'utilities']
    
    for (const sector of sectors) {
      const sectorKeywords = RESOURCE_SECTORS[sector as keyof typeof RESOURCE_SECTORS]
      if (sectorKeywords) {
        // Create searches for each sector with top keywords
        const topKeywords = sectorKeywords.slice(0, 3) // Limit keywords per search
        const sectorOptions = { ...options, keywords: topKeywords }
        const baseUrl = this.buildSearchUrl(sectorOptions)
        
        urls.push(baseUrl)
        
        // Add pagination for each sector search
        for (let page = 1; page < maxPages; page++) {
          urls.push(`${baseUrl}&page=${page + 1}`)
        }
      }
    }

    return urls
  }

  private parseJobsFromHtml(html: string, sourceUrl: string): ScrapedJob[] {
    const $ = cheerio.load(html)
    const jobs: ScrapedJob[] = []

    // Job Bank uses consistent selectors
    const jobCards = $('.job-posting-brief')
    
    console.log(`Found ${jobCards.length} job cards on Job Bank`)

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
      // Extract job details
      const titleElement = $('.job-title a').first()
      const title = titleElement.text().trim()
      
      const company = $('.business-name').text().trim()
      const location = $('.location').text().trim()
      const description = $('.job-description-short').text().trim()
      const salary = $('.salary').text().trim()
      const postDateText = $('.posting-date').text().trim()

      // Extract apply link
      let applicationUrl = ''
      const href = titleElement.attr('href')
      if (href) {
        applicationUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`
      }

      // Skip if essential fields are missing
      if (!title || !company || !location) {
        return null
      }

      // Parse posting date
      let postedDate = new Date().toISOString().split('T')[0]
      if (postDateText) {
        const dateMatch = postDateText.match(/\d{4}-\d{2}-\d{2}/)
        if (dateMatch) {
          postedDate = dateMatch[0]
        }
      }

      // Determine sector based on job content
      const sector = ScraperManager.categorizeJobBySector(title, description, company)
      
      // Skip if not in resource sectors
      if (sector === 'general' && !this.hasResourceKeywords(title + ' ' + description + ' ' + company)) {
        return null
      }

      const job: ScrapedJob = {
        title: this.cleanText(title),
        company: this.cleanText(company),
        location: this.cleanText(location),
        province: this.extractProvince(location),
        sector,
        employment_type: this.normalizeEmploymentType('Full-time'),
        salary_range: salary ? this.cleanText(salary) : undefined,
        description: this.cleanText(description),
        posted_date: postedDate,
        application_url: applicationUrl,
        source_platform: this.platform,
        source_url: baseUrl,
        external_id: this.generateExternalId({
          title: this.cleanText(title),
          company: this.cleanText(company),
          location: this.cleanText(location),
          posted_date: postedDate
        } as ScrapedJob)
      }

      return job

    } catch (error) {
      console.error('Error parsing Job Bank job card:', error)
      return null
    }
  }

  private getResourceKeywords(sectors?: string[]): string[] {
    if (!sectors || sectors.length === 0) {
      // Return top keywords from each resource sector
      return [
        ...RESOURCE_SECTORS.mining.slice(0, 3),
        ...RESOURCE_SECTORS.oil_gas.slice(0, 3),
        ...RESOURCE_SECTORS.forestry.slice(0, 2),
        ...RESOURCE_SECTORS.renewable.slice(0, 2)
      ]
    }

    const keywords: string[] = []
    for (const sector of sectors) {
      const sectorKey = sector.replace(' ', '_') as keyof typeof RESOURCE_SECTORS
      if (RESOURCE_SECTORS[sectorKey]) {
        keywords.push(...RESOURCE_SECTORS[sectorKey].slice(0, 3))
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