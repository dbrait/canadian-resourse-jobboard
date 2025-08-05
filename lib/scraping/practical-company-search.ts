import { BaseScraper, ScrapedJob, ScrapingResult, ScrapingOptions } from '../../types/scraping'
import { ScraperManager } from './scraper-manager'
import * as cheerio from 'cheerio'

// Major Canadian resource companies for targeted searches
export const MAJOR_CANADIAN_COMPANIES = [
  // Oil & Gas (Top 15)
  'Suncor Energy', 'Canadian Natural Resources', 'Imperial Oil', 'Cenovus Energy', 
  'Enbridge', 'TC Energy', 'Kinder Morgan', 'Pembina Pipeline', 'Inter Pipeline',
  'Keyera', 'AltaGas', 'Tourmaline Oil', 'Arc Resources', 'Birchcliff Energy', 'Crescent Point Energy',
  
  // Mining (Top 15) 
  'Barrick Gold', 'Newmont', 'Agnico Eagle', 'Kinross Gold', 'Eldorado Gold',
  'Yamana Gold', 'B2Gold', 'Alamos Gold', 'Teck Resources', 'First Quantum Minerals',
  'Lundin Mining', 'Hudbay Minerals', 'Nutrien', 'Mosaic', 'Cameco',
  
  // Utilities & Power (Top 10)
  'BC Hydro', 'Hydro Quebec', 'Ontario Power Generation', 'Hydro One', 'Manitoba Hydro',
  'SaskPower', 'Nova Scotia Power', 'NB Power', 'Fortis', 'Canadian Utilities',
  
  // Transportation (Top 5)
  'Canadian National Railway', 'Canadian Pacific Railway', 'CN Rail', 'CP Rail', 'Via Rail',
  
  // Forestry (Top 8)
  'West Fraser Timber', 'Canfor Corporation', 'Interfor Corporation', 'Resolute Forest Products',
  'Catalyst Paper', 'Tolko Industries', 'Conifex Timber', 'Western Forest Products',
  
  // Construction & Engineering (Top 7)
  'SNC-Lavalin', 'Stantec', 'AECOM', 'Hatch', 'Worley', 'Fluor Canada', 'Aecon Group'
]

export class EnhancedIndeedCompanyScraper extends BaseScraper {
  private scraperManager: ScraperManager
  
  constructor(scraperManager: ScraperManager) {
    super('indeed_enhanced', {
      name: 'Enhanced Indeed Company Search',
      baseUrl: 'https://ca.indeed.com',
      searchPath: '/jobs',
      selectors: {
        jobCard: '.job_seen_beacon, .slider_container .slider_item, [data-jk]',
        title: 'h2 a span[title], .jobTitle a span, h2 a',
        company: '.companyName, [data-testid="company-name"]',
        location: '.companyLocation, [data-testid="job-location"]',
        description: '.summary, .job-snippet',
        postDate: '.date, [data-testid="job-age"]',
        applyLink: 'h2 a, .jobTitle a'
      }
    })
    this.scraperManager = scraperManager
  }

  protected buildSearchUrl(options?: ScrapingOptions): string {
    // Build comprehensive search for Canadian resource companies
    const baseUrl = 'https://ca.indeed.com/jobs'
    const params = new URLSearchParams()
    
    // Build company search query
    const companyQueries: string[] = []
    
    // Add major companies as search terms
    MAJOR_CANADIAN_COMPANIES.slice(0, 10).forEach(company => {
      companyQueries.push(`"${company}"`)
    })
    
    // Combine with resource industry keywords
    const industryKeywords = [
      'mining', 'oil gas', 'energy', 'utilities', 'forestry', 'lumber',
      'pipeline', 'drilling', 'exploration', 'renewable', 'hydro', 'power',
      'railway', 'transportation', 'construction engineering'
    ]
    
    // Create search query
    const companyQuery = companyQueries.slice(0, 5).join(' OR ')
    const keywordQuery = industryKeywords.slice(0, 8).join(' OR ')
    const finalQuery = `(${companyQuery}) OR (${keywordQuery})`
    
    params.set('q', finalQuery)
    params.set('l', 'Canada')
    params.set('sort', 'date')
    params.set('fromage', '7') // Last 7 days
    params.set('limit', '50')
    
    return `${baseUrl}?${params.toString()}`
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
      const maxPages = Math.min(options?.maxPages || 3, 5)
      
      for (let page = 0; page < maxPages; page++) {
        try {
          let searchUrl = this.buildSearchUrl(options)
          if (page > 0) {
            searchUrl += `&start=${page * 10}`
          }
          
          console.log(`Scraping enhanced Indeed URL (page ${page + 1}): ${searchUrl}`)
          
          const html = await this.scraperManager.makeScrapingBeeRequest(searchUrl, {
            wait_for: '.jobsearch-SerpJobCard, .job_seen_beacon',
            wait: 3000,
            render_js: true,
            country_code: 'ca'
          })

          const jobs = this.parseJobsFromHtml(html, searchUrl)
          results.jobs.push(...jobs)
          
          // Add delay between pages
          await this.delay(3000)
          
        } catch (error) {
          const errorMsg = `Error scraping page ${page + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(errorMsg)
          results.errors.push(errorMsg)
        }
      }

      results.total_found = results.jobs.length
      results.success = results.errors.length === 0 || results.jobs.length > 0
      
      console.log(`Enhanced Indeed scraping completed: ${results.jobs.length} jobs found in ${Date.now() - startTime}ms`)
      
    } catch (error) {
      const errorMsg = `Fatal error in enhanced Indeed scraper: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(errorMsg)
      results.errors.push(errorMsg)
    }

    return results
  }

  private parseJobsFromHtml(html: string, sourceUrl: string): ScrapedJob[] {
    const $ = cheerio.load(html)
    const jobs: ScrapedJob[] = []

    // Try multiple selectors for job cards
    const jobCardSelectors = ['.job_seen_beacon', '.slider_container .slider_item', '[data-jk]', '.jobsearch-SerpJobCard']
    let jobCards: any = $('')
    
    for (const selector of jobCardSelectors) {
      jobCards = $(selector)
      if (jobCards.length > 0) {
        console.log(`Found ${jobCards.length} job cards using selector: ${selector}`)
        break
      }
    }

    jobCards.each((index: number, element: any) => {
      try {
        const $card = $(element)
        
        // Extract job details with multiple fallback selectors
        const title = this.extractText($card, [
          'h2 a span[title]', '.jobTitle a span', 'h2 a', '.jobTitle', '[data-testid*="title"]'
        ])
        
        const company = this.extractText($card, [
          '.companyName', '[data-testid="company-name"]', '.company', 'span.companyName'
        ])
        
        const location = this.extractText($card, [
          '.companyLocation', '[data-testid="job-location"]', '.location', '.locationsContainer'
        ])
        
        const description = this.extractText($card, [
          '.summary', '.job-snippet', '[data-testid="job-snippet"]', '.description'
        ])
        
        // Extract apply link
        let applicationUrl = ''
        const linkSelectors = ['h2 a', '.jobTitle a', 'a[data-jk]']
        for (const selector of linkSelectors) {
          const href = $card.find(selector).first().attr('href')
          if (href) {
            applicationUrl = href.startsWith('http') ? href : `https://ca.indeed.com${href}`
            break
          }
        }

        // Skip if essential fields are missing
        if (!title || !company) {
          return
        }

        // Determine sector based on company name and title
        const sector = this.categorizeBySector(company, title, description)
        
        // Only include if it's a resource sector job
        if (sector === 'other') {
          return
        }

        const job: ScrapedJob = {
          title: this.cleanText(title),
          company: this.cleanText(company),
          location: this.cleanText(location) || 'Canada',
          province: this.extractProvince(location),
          sector: sector,
          employment_type: this.normalizeEmploymentType('Full-time'),
          description: this.cleanText(description || `${title} position at ${company}`),
          posted_date: new Date().toISOString().split('T')[0],
          application_url: applicationUrl,
          source_platform: this.platform,
          source_url: sourceUrl,
          external_id: this.generateExternalId({
            title: this.cleanText(title),
            company: this.cleanText(company),
            location: this.cleanText(location) || 'Canada',
            posted_date: new Date().toISOString().split('T')[0]
          } as ScrapedJob)
        }

        jobs.push(job)

      } catch (error) {
        console.error(`Error parsing job card ${index}:`, error)
      }
    })

    return jobs
  }

  private extractText($element: cheerio.Cheerio, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $element.find(selector).first().text().trim()
      if (text) return text
    }
    return ''
  }

  private categorizeBySector(company: string, title: string, description: string): string {
    const content = `${company} ${title} ${description}`.toLowerCase()
    
    // Oil & Gas keywords
    if (content.match(/\b(suncor|cnrl|imperial oil|cenovus|enbridge|tc energy|oil|gas|petroleum|pipeline|drilling|upstream|downstream|refinery|lng)\b/)) {
      return 'oil_gas'
    }
    
    // Mining keywords
    if (content.match(/\b(barrick|newmont|teck|nutrien|mining|mine|mineral|gold|copper|zinc|potash|exploration|geology|metallurgy)\b/)) {
      return 'mining'
    }
    
    // Utilities keywords
    if (content.match(/\b(hydro|power|electricity|utility|energy|transmission|distribution|generation|grid)\b/)) {
      return 'utilities'
    }
    
    // Transportation keywords
    if (content.match(/\b(railway|railroad|cn rail|cp rail|transportation|logistics|freight)\b/)) {
      return 'transportation'
    }
    
    // Forestry keywords
    if (content.match(/\b(west fraser|canfor|forestry|lumber|timber|pulp|paper|mill|logging|wood)\b/)) {
      return 'forestry'
    }
    
    // Construction keywords
    if (content.match(/\b(snc|stantec|aecom|construction|engineering|infrastructure|project)\b/)) {
      return 'construction'
    }
    
    // Renewable energy keywords
    if (content.match(/\b(renewable|solar|wind|hydroelectric|geothermal|green energy|clean energy)\b/)) {
      return 'renewable'
    }
    
    return 'other' // Filter out non-resource jobs
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Abstract methods required by BaseScraper
  protected parseJobCard(html: string, baseUrl: string): ScrapedJob | null {
    // This class uses parseJobsFromHtml instead
    return null
  }

  protected buildSearchUrl(options?: ScrapingOptions): string {
    // This class uses buildSearchUrls (plural) instead
    return ''
  }
}

// Export function to test the enhanced scraper
export async function testEnhancedIndeedScraper(): Promise<ScrapingResult> {
  console.log('🎯 Testing Enhanced Indeed Company Scraper...')
  
  const scrapingSystem = (await import('./index')).createScrapingSystem()
  const enhancedScraper = new EnhancedIndeedCompanyScraper(scrapingSystem.manager)
  
  const result = await enhancedScraper.scrape({
    maxPages: 2,
    dateRange: 'week'
  })
  
  console.log(`\n📊 Results:`)
  console.log(`   Jobs found: ${result.jobs.length}`)
  console.log(`   Errors: ${result.errors.length}`)
  console.log(`   Success: ${result.success}`)
  
  if (result.jobs.length > 0) {
    console.log(`\n📋 Sample jobs:`)
    result.jobs.slice(0, 5).forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} at ${job.company} (${job.location}) - ${job.sector}`)
    })
    
    // Show sector breakdown
    const sectorCounts: Record<string, number> = {}
    result.jobs.forEach(job => {
      sectorCounts[job.sector] = (sectorCounts[job.sector] || 0) + 1
    })
    
    console.log(`\n🏭 Jobs by sector:`)
    Object.entries(sectorCounts).forEach(([sector, count]) => {
      console.log(`   ${sector}: ${count} jobs`)
    })
  }
  
  if (result.errors.length > 0) {
    console.log(`\n❌ Errors:`)
    result.errors.forEach(error => console.log(`   ${error}`))
  }
  
  return result
}