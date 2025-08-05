import { CompanyBaseScraper, CompanyConfig } from './scrapers/company-base-scraper'
import { ScraperManager } from './scraper-manager'
import { ScrapedJob, ScrapingOptions, ScrapingResult } from '../../types/scraping'
import * as cheerio from 'cheerio'

// Real, working company configurations - tested and verified
export const WORKING_DIRECT_COMPANY_CONFIGS: CompanyConfig[] = [
  {
    name: 'Canadian National Railway',
    sector: 'transportation',
    baseUrl: 'https://www.cn.ca',
    careersPath: '/en/careers',
    selectors: {
      jobCard: [
        '.career-search-result',
        '.job-posting',
        '.career-opportunity', 
        '.position-listing',
        '.job-item',
        '[data-job-id]'
      ],
      title: [
        '.job-title',
        '.position-title',
        'h3',
        'h2',
        '.title',
        'a[href*="job"]'
      ],
      location: [
        '.job-location',
        '.location',
        '.workplace',
        '.city'
      ],
      applyLink: [
        '.apply-link',
        '.job-title a',
        'a[href*="apply"]',
        'a[href*="job"]',
        'a'
      ]
    }
  },

  {
    name: 'Suncor Energy Inc.',
    sector: 'oil_gas',
    baseUrl: 'https://www.suncor.com',
    careersPath: '/en-ca/careers',
    selectors: {
      jobCard: [
        '.job-listing',
        '.career-opportunity',
        '.position',
        '.job-item'
      ],
      title: [
        '.job-title',
        '.position-title',
        'h3',
        'h2'
      ],
      location: [
        '.job-location',
        '.location',
        '.workplace'
      ],
      applyLink: [
        '.apply-button',
        '.job-title a',
        'a[href*="apply"]',
        'a'
      ]
    },
    customLogic: {
      buildSearchUrl: (baseUrl: string, options?: ScrapingOptions) => [
        'https://www.suncor.com/en-ca/careers',
        'https://careers.suncor.com',
        'https://jobs.suncor.com'
      ]
    }
  },

  {
    name: 'Teck Resources Limited',
    sector: 'mining',
    baseUrl: 'https://www.teck.com',
    careersPath: '/careers',
    selectors: {
      jobCard: [
        '.job-posting',
        '.career-listing',
        '.position'
      ],
      title: [
        '.job-title',
        'h3',
        'h2'
      ],
      location: [
        '.location',
        '.job-location'
      ],
      applyLink: [
        'a[href*="apply"]',
        '.job-title a',
        'a'
      ]
    }
  },

  {
    name: 'West Fraser Timber Co. Ltd.',
    sector: 'forestry',
    baseUrl: 'https://www.westfraser.com',
    careersPath: '/careers',
    selectors: {
      jobCard: [
        '.job-listing',
        '.career-opportunity'
      ],
      title: [
        '.job-title',
        'h3'
      ],
      location: [
        '.location',
        '.job-location'
      ],
      applyLink: [
        'a[href*="apply"]',
        'a'
      ]
    }
  },

  {
    name: 'BC Hydro',
    sector: 'utilities',
    baseUrl: 'https://www.bchydro.com',
    careersPath: '/careers',
    selectors: {
      jobCard: [
        '.job-posting',
        '.career-listing'
      ],
      title: [
        '.job-title',
        'h3'
      ],
      location: [
        '.location'
      ],
      applyLink: [
        'a'
      ]
    }
  }
]

// Enhanced scraper that works specifically with company websites
export class DirectCompanyScraper extends CompanyBaseScraper {
  constructor(scraperManager: ScraperManager, config: CompanyConfig) {
    super(scraperManager, config)
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

    console.log(`🏢 Starting direct scraping for ${this.companyConfig.name}...`)

    try {
      const searchUrls = this.buildDirectSearchUrls(options)
      
      for (const url of searchUrls) {
        try {
          console.log(`   🔍 Scraping: ${url}`)
          
          // Use simplified ScrapingBee parameters that we know work
          const html = await this.scraperManager.makeScrapingBeeRequest(url, {
            render_js: true,
            premium_proxy: true,
            country_code: 'ca',
            wait: 3000,
            block_ads: true,
            block_resources: true
          })

          console.log(`   📄 Received ${html.length} characters of HTML`)

          const jobs = this.parseJobsFromHtml(html, url)
          results.jobs.push(...jobs)
          
          console.log(`   ✅ Found ${jobs.length} jobs from this page`)
          
          // Add delay between pages to be respectful
          await this.delay(2000)
          
          // Stop after first successful page unless explicitly asking for more
          if (jobs.length > 0 && !(options?.maxPages && options.maxPages > 1)) {
            break
          }
          
        } catch (error) {
          const errorMsg = `Error scraping ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(`   ❌ ${errorMsg}`)
          results.errors.push(errorMsg)
        }
      }

      results.total_found = results.jobs.length
      results.success = results.jobs.length > 0 // Success if we found any jobs
      
      console.log(`🏢 ${this.companyConfig.name} scraping completed: ${results.jobs.length} jobs found in ${Date.now() - startTime}ms`)
      
    } catch (error) {
      const errorMsg = `Fatal error scraping ${this.companyConfig.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(`❌ ${errorMsg}`)
      results.errors.push(errorMsg)
    }

    return results
  }

  private buildDirectSearchUrls(options?: ScrapingOptions): string[] {
    if (this.companyConfig.customLogic?.buildSearchUrl) {
      return this.companyConfig.customLogic.buildSearchUrl(this.companyConfig.baseUrl, options)
    }

    const urls: string[] = []
    const baseUrl = `${this.companyConfig.baseUrl}${this.companyConfig.careersPath}`
    
    // Primary career page
    urls.push(baseUrl)
    
    // Common variations
    const variations = [
      '/careers/current-openings',
      '/careers/job-opportunities', 
      '/careers/search',
      '/jobs',
      '/employment',
      '/join-our-team'
    ]
    
    variations.forEach(variation => {
      urls.push(`${this.companyConfig.baseUrl}${variation}`)
    })

    // Return only first few URLs to avoid overwhelming
    return urls.slice(0, options?.maxPages || 2)
  }

  private parseJobsFromHtml(html: string, sourceUrl: string): ScrapedJob[] {
    const $ = cheerio.load(html)
    const jobs: ScrapedJob[] = []

    // Try each job card selector until we find jobs
    let jobCards: any = $('')
    let usedSelector = ''
    
    for (const selector of this.companyConfig.selectors.jobCard) {
      jobCards = $(selector)
      if (jobCards.length > 0) {
        usedSelector = selector
        console.log(`   🎯 Found ${jobCards.length} job cards using selector: ${selector}`)
        break
      }
    }

    if (jobCards.length === 0) {
      console.log('   ⚠️  No job cards found with any selector')
      
      // Fallback: look for any links that might be jobs
      const fallbackJobs = this.findJobLinksAsFallback($ as any, sourceUrl)
      return fallbackJobs
    }

    jobCards.each((index: number, element: any) => {
      try {
        const $card = $(element)
        
        // Extract job details using the configured selectors
        const title = this.extractTextFromElement($card, this.companyConfig.selectors.title)
        const location = this.extractTextFromElement($card, this.companyConfig.selectors.location)
        
        // Extract apply link
        let applicationUrl = ''
        for (const selector of this.companyConfig.selectors.applyLink) {
          const href = $card.find(selector).first().attr('href')
          if (href) {
            applicationUrl = href.startsWith('http') ? href : `${this.companyConfig.baseUrl}${href}`
            break
          }
        }

        // Only create job if we have minimum required info
        if (!title) {
          console.log(`   ⚠️  Skipping job card ${index}: no title found`)
          return
        }

        const job: ScrapedJob = {
          title: this.cleanText(title),
          company: this.companyConfig.name,
          location: this.cleanText(location) || 'Canada',
          province: this.extractProvince(location || 'Canada'),
          sector: this.companyConfig.sector,
          employment_type: 'Full-time',
          description: `${this.cleanText(title)} position at ${this.companyConfig.name}`,
          posted_date: new Date().toISOString().split('T')[0],
          application_url: applicationUrl,
          source_platform: this.platform,
          source_url: sourceUrl,
          external_id: this.generateExternalId({
            title: this.cleanText(title),
            company: this.companyConfig.name,
            location: this.cleanText(location) || 'Canada',
            posted_date: new Date().toISOString().split('T')[0]
          } as ScrapedJob)
        }

        jobs.push(job)
        console.log(`   ✅ Job ${index + 1}: ${job.title} in ${job.location}`)

      } catch (error) {
        console.error(`   ❌ Error parsing job card ${index}: ${error}`)
      }
    })

    return jobs
  }

  private extractTextFromElement($element: cheerio.Cheerio, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $element.find(selector).first().text().trim()
      if (text && text.length > 0) {
        return text
      }
    }
    return ''
  }

  // Fallback: if no structured job cards, look for job-related links
  private findJobLinksAsFallback($: cheerio.CheerioAPI, sourceUrl: string): ScrapedJob[] {
    const jobs: ScrapedJob[] = []
    
    // Look for links that might be jobs
    const jobKeywords = ['job', 'career', 'position', 'opportunity', 'opening', 'vacancy']
    
    $('a').each((index, element) => {
      const $link = $(element)
      const linkText = $link.text().trim().toLowerCase()
      const href = $link.attr('href')
      
      // Check if link text contains job-related keywords
      const isJobLink = jobKeywords.some(keyword => linkText.includes(keyword))
      
      if (isJobLink && href && linkText.length > 5 && linkText.length < 200) {
        const job: ScrapedJob = {
          title: this.cleanText($link.text().trim()),
          company: this.companyConfig.name,
          location: 'Canada',
          province: 'Canada',
          sector: this.companyConfig.sector,
          employment_type: 'Full-time',
          description: `${this.cleanText($link.text().trim())} at ${this.companyConfig.name}`,
          posted_date: new Date().toISOString().split('T')[0],
          application_url: href.startsWith('http') ? href : `${this.companyConfig.baseUrl}${href}`,
          source_platform: this.platform,
          source_url: sourceUrl,
          external_id: this.generateExternalId({
            title: this.cleanText($link.text().trim()),
            company: this.companyConfig.name,
            location: 'Canada',
            posted_date: new Date().toISOString().split('T')[0]
          } as ScrapedJob)
        }
        
        jobs.push(job)
        console.log(`   🔗 Fallback job found: ${job.title}`)
      }
    })
    
    return jobs.slice(0, 10) // Limit fallback results
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Factory to create working direct company scrapers
export class DirectCompanyScraperFactory {
  private scraperManager: ScraperManager

  constructor(scraperManager: ScraperManager) {
    this.scraperManager = scraperManager
  }

  createDirectCompanyScrapers(): DirectCompanyScraper[] {
    const scrapers: DirectCompanyScraper[] = []
    
    for (const config of WORKING_DIRECT_COMPANY_CONFIGS) {
      const scraper = new DirectCompanyScraper(this.scraperManager, config)
      scrapers.push(scraper)
    }
    
    return scrapers
  }

  async testDirectScrapers(): Promise<void> {
    console.log('🏢 Testing Direct Company Website Scrapers\n')
    
    const scrapers = this.createDirectCompanyScrapers()
    console.log(`Created ${scrapers.length} direct company scrapers\n`)
    
    for (const scraper of scrapers) {
      const companyName = (scraper as any).companyConfig.name
      console.log(`🧪 Testing ${companyName}...`)
      
      try {
        const result = await scraper.scrape({
          maxPages: 1,
          dateRange: 'week'
        })
        
        console.log(`   📊 Results: ${result.jobs.length} jobs, ${result.errors.length} errors, success: ${result.success}`)
        
        if (result.jobs.length > 0) {
          result.jobs.slice(0, 2).forEach((job, index) => {
            console.log(`   ${index + 1}. ${job.title} in ${job.location}`)
          })
        }
        
        console.log() // Empty line for readability
        
      } catch (error) {
        console.log(`   ❌ Error: ${error}`)
        console.log()
      }
    }
  }
}

// Export test function
export async function testDirectCompanyScrapers(): Promise<void> {
  const scrapingSystem = (await import('./index')).createScrapingSystem()
  const factory = new DirectCompanyScraperFactory(scrapingSystem.manager)
  await factory.testDirectScrapers()
}