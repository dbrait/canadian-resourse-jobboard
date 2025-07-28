import { CompanyBaseScraper, CompanyConfig } from './company-base-scraper'
import { ScraperManager } from '../scraper-manager'
import { ScrapedJob, ScrapingOptions } from '../../../types/scraping'
import * as cheerio from 'cheerio'

export class CNRLScraper extends CompanyBaseScraper {
  constructor(scraperManager: ScraperManager) {
    const config: CompanyConfig = {
      name: 'Canadian Natural Resources Limited',
      sector: 'oil gas',
      baseUrl: 'https://www.cnrl.com',
      careersPath: '/careers',
      selectors: {
        jobCard: [
          '.job-listing',
          '.career-opportunity',
          '.job-posting',
          '[data-job]',
          '.position',
          '.job-item',
          '.career-card',
          '.job-card',
          '.opportunity'
        ],
        title: [
          '.job-title',
          '.position-title',
          '.career-title',
          'h3',
          'h2',
          '.title',
          '[class*="title"]',
          '.job-name',
          '.position-name'
        ],
        location: [
          '.job-location',
          '.location',
          '.city',
          '[class*="location"]',
          '.workplace',
          '.site',
          '.facility',
          '.region'
        ],
        department: [
          '.department',
          '.division',
          '.business-unit',
          '[class*="department"]',
          '.function',
          '.area',
          '.discipline'
        ],
        jobType: [
          '.job-type',
          '.employment-type',
          '.position-type',
          '[class*="type"]',
          '.classification',
          '.category'
        ],
        description: [
          '.job-description',
          '.description',
          '.summary',
          '.job-summary',
          '[class*="description"]',
          '.overview'
        ],
        postDate: [
          '.post-date',
          '.posted-date',
          '.date-posted',
          '[class*="date"]'
        ],
        applyLink: [
          '.apply-button',
          '.apply-link',
          'a[href*="apply"]',
          'a[href*="job"]',
          '.job-title a',
          '.position-title a',
          'a'
        ]
      },
      customLogic: {
        buildSearchUrl: (baseUrl: string, options?: ScrapingOptions) => {
          const urls: string[] = []
          
          // CNRL career portal variations
          const possibleUrls = [
            `${baseUrl}/careers`,
            `${baseUrl}/careers/current-opportunities`,
            `${baseUrl}/careers/job-openings`,
            `${baseUrl}/careers/search-jobs`,
            'https://careers.cnrl.com',
            'https://jobs.cnrl.com',
            // CNRL might use external job portals
            'https://cnrl.taleo.net/careersection/cnrl_external/jobsearch.ftl',
            'https://careers-cnrl.icims.com/jobs/search'
          ]

          // Add search parameters
          possibleUrls.forEach(url => {
            urls.push(url)
            
            // Add oil & gas specific keywords
            if (options?.keywords?.length) {
              const keywords = options.keywords.join(' OR ')
              urls.push(`${url}?q=${encodeURIComponent(keywords)}`)
            }
            
            // Add location-based searches for major CNRL operations
            const cnrlLocations = [
              'Calgary', 'Alberta', 'Fort McMurray', 'Horizon', 'Albian Sands',
              'Primrose', 'Kirby South', 'Pelican Lake', 'Jackfish', 'Wolf Lake'
            ]
            cnrlLocations.forEach(location => {
              urls.push(`${url}?location=${encodeURIComponent(location)}`)
            })
          })

          return urls.slice(0, options?.maxPages || 5)
        },

        parseJobCard: (html: string, baseUrl: string, sector: string) => {
          const $ = cheerio.load(html)

          // CNRL specific parsing patterns
          const title = $('h3, h2, .job-title, .position-title, .career-title').first().text().trim() ||
                       $('.title, [class*="title"], .job-name, .position-name').first().text().trim()

          const location = $('.location, .job-location, .city, [class*="location"]').first().text().trim() ||
                          $('.workplace, .site, .facility, .region').first().text().trim()

          const department = $('.department, .division, .business-unit, .function, .area, .discipline').first().text().trim()
          
          const jobType = $('.job-type, .employment-type, .classification, .category').first().text().trim()

          const description = $('.job-description, .description, .summary, .overview').first().text().trim()

          // Look for apply link
          let applicationUrl = ''
          const linkElement = $('a[href*="apply"], a[href*="job"], .apply-button, .apply-link').first() || $('a').first()
          if (linkElement.length > 0) {
            const href = linkElement.attr('href')
            if (href) {
              if (href.startsWith('http')) {
                applicationUrl = href
              } else if (href.startsWith('/')) {
                applicationUrl = `${baseUrl}${href}`
              } else {
                applicationUrl = `${baseUrl}/${href}`
              }
            }
          }

          if (!title) return null

          const job: ScrapedJob = {
            title: title,
            company: 'Canadian Natural Resources Limited',
            location: location || 'Calgary, Alberta',
            province: CNRLScraper.extractProvinceFromLocation(location),
            sector: 'oil gas',
            employment_type: CNRLScraper.normalizeJobType(jobType),
            description: description || `${title} position at Canadian Natural Resources Limited`,
            requirements: department ? `Department: ${department}` : undefined,
            posted_date: new Date().toISOString().split('T')[0],
            application_url: applicationUrl,
            source_platform: 'cnrl',
            source_url: baseUrl,
            external_id: CNRLScraper.generateJobId(title, location)
          }

          return job
        }
      }
    }

    super(scraperManager, config)
  }

  private static extractProvinceFromLocation(location: string): string {
    if (!location) return 'Alberta' // CNRL's headquarters and major operations

    const locationLower = location.toLowerCase()
    
    // CNRL's major operational centers
    if (locationLower.includes('calgary') || locationLower.includes('alberta')) return 'Alberta'
    if (locationLower.includes('fort mcmurray') || locationLower.includes('oil sands')) return 'Alberta'
    if (locationLower.includes('horizon') || locationLower.includes('albian sands')) return 'Alberta'
    if (locationLower.includes('primrose') || locationLower.includes('wolf lake')) return 'Alberta'
    if (locationLower.includes('kirby') || locationLower.includes('jackfish')) return 'Alberta'
    if (locationLower.includes('pelican lake') || locationLower.includes('peace river')) return 'Alberta'
    if (locationLower.includes('lloydminster')) return 'Alberta' // Could be SK too, but CNRL ops mainly AB side
    if (locationLower.includes('saskatchewan') || locationLower.includes('regina')) return 'Saskatchewan'
    if (locationLower.includes('british columbia') || locationLower.includes('vancouver')) return 'British Columbia'
    if (locationLower.includes('toronto') || locationLower.includes('ontario')) return 'Ontario'
    if (locationLower.includes('north sea') || locationLower.includes('uk') || 
        locationLower.includes('offshore') || locationLower.includes('international')) return 'International'
    
    // Default to Alberta (CNRL's primary operations)
    return 'Alberta'
  }

  private static normalizeJobType(jobType: string): string {
    if (!jobType) return 'Full-time'
    
    const typeLower = jobType.toLowerCase()
    
    if (typeLower.includes('temp') || typeLower.includes('seasonal')) return 'Temporary'
    if (typeLower.includes('part')) return 'Part-time'
    if (typeLower.includes('contract') || typeLower.includes('consultant')) return 'Contract'
    if (typeLower.includes('intern') || typeLower.includes('student') || typeLower.includes('coop')) return 'Internship'
    if (typeLower.includes('apprentice') || typeLower.includes('trainee')) return 'Apprenticeship'
    if (typeLower.includes('casual')) return 'Casual'
    
    return 'Full-time'
  }

  private static generateJobId(title: string, location: string): string {
    const crypto = require('crypto')
    const content = `cnrl_${title}_${location}_${new Date().toISOString().split('T')[0]}`
    return crypto.createHash('md5').update(content).digest('hex')
  }

  // Override the scrape method to add CNRL-specific logic
  async scrape(options?: ScrapingOptions): Promise<any> {
    console.log('Starting Canadian Natural Resources Limited scraping...')
    
    // Set CNRL-specific defaults
    const cnrlOptions = {
      maxPages: 4,
      dateRange: 'week' as const,
      sectors: ['oil_gas'],
      keywords: [
        'engineer', 'operator', 'technician', 'supervisor', 'analyst',
        'specialist', 'coordinator', 'advisor', 'consultant', 'manager',
        'oil sands', 'heavy oil', 'drilling', 'production', 'operations',
        'maintenance', 'mechanical', 'electrical', 'instrumentation',
        'process', 'reservoir', 'geology', 'geophysics', 'environmental',
        'safety', 'reliability', 'integrity', 'completions', 'facilities'
      ],
      ...options
    }

    return super.scrape(cnrlOptions)
  }
}