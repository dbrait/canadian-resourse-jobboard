import { CompanyBaseScraper, CompanyConfig } from './company-base-scraper'
import { ScraperManager } from '../scraper-manager'
import { ScrapedJob, ScrapingOptions } from '../../../types/scraping'
import * as cheerio from 'cheerio'

export class CamecoScraper extends CompanyBaseScraper {
  constructor(scraperManager: ScraperManager) {
    const config: CompanyConfig = {
      name: 'Cameco Corporation',
      sector: 'mining',
      baseUrl: 'https://www.cameco.com',
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
          '.facility'
        ],
        department: [
          '.department',
          '.division',
          '.business-unit',
          '[class*="department"]',
          '.function',
          '.area'
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
          
          // Cameco career portal variations
          const possibleUrls = [
            `${baseUrl}/careers`,
            `${baseUrl}/careers/current-opportunities`,
            `${baseUrl}/careers/job-openings`,
            'https://careers.cameco.com',
            'https://jobs.cameco.com',
            `${baseUrl}/careers/search`,
            // Cameco might use external job portals
            'https://cameco.taleo.net/careersection/cameco_external/jobsearch.ftl',
            'https://careers-cameco.icims.com/jobs/search'
          ]

          // Add search parameters
          possibleUrls.forEach(url => {
            urls.push(url)
            
            // Add uranium/mining specific keywords
            if (options?.keywords?.length) {
              const keywords = options.keywords.join(' OR ')
              urls.push(`${url}?q=${encodeURIComponent(keywords)}`)
            }
            
            // Add location-based searches for major Cameco operations
            const camecoLocations = [
              'Saskatoon', 'Saskatchewan', 'Blind River', 'Ontario', 
              'Port Hope', 'Rabbit Lake', 'McArthur River', 'Cigar Lake'
            ]
            camecoLocations.forEach(location => {
              urls.push(`${url}?location=${encodeURIComponent(location)}`)
            })
          })

          return urls.slice(0, options?.maxPages || 5)
        },

        parseJobCard: (html: string, baseUrl: string, sector: string) => {
          const $ = cheerio.load(html)

          // Cameco specific parsing patterns
          const title = $('h3, h2, .job-title, .position-title, .career-title').first().text().trim() ||
                       $('.title, [class*="title"], .job-name, .position-name').first().text().trim()

          const location = $('.location, .job-location, .city, [class*="location"]').first().text().trim() ||
                          $('.workplace, .site, .facility').first().text().trim()

          const department = $('.department, .division, .business-unit, .function, .area').first().text().trim()
          
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
            company: 'Cameco Corporation',
            location: location || 'Saskatchewan',
            province: CamecoScraper.extractProvinceFromLocation(location),
            sector: 'mining',
            employment_type: CamecoScraper.normalizeJobType(jobType),
            description: description || `${title} position at Cameco Corporation`,
            requirements: department ? `Department: ${department}` : undefined,
            posted_date: new Date().toISOString().split('T')[0],
            application_url: applicationUrl,
            source_platform: 'cameco',
            source_url: baseUrl,
            external_id: CamecoScraper.generateJobId(title, location)
          }

          return job
        }
      }
    }

    super(scraperManager, config)
  }

  private static extractProvinceFromLocation(location: string): string {
    if (!location) return 'Saskatchewan' // Cameco's headquarters and major operations

    const locationLower = location.toLowerCase()
    
    // Cameco's major operational centers
    if (locationLower.includes('saskatoon') || locationLower.includes('saskatchewan')) return 'Saskatchewan'
    if (locationLower.includes('rabbit lake') || locationLower.includes('mcarthur river') || 
        locationLower.includes('cigar lake') || locationLower.includes('key lake')) return 'Saskatchewan'
    if (locationLower.includes('blind river') || locationLower.includes('ontario')) return 'Ontario'
    if (locationLower.includes('port hope')) return 'Ontario'
    if (locationLower.includes('toronto')) return 'Ontario'
    if (locationLower.includes('calgary') || locationLower.includes('alberta')) return 'Alberta'
    if (locationLower.includes('kazakhstan') || locationLower.includes('international')) return 'International'
    if (locationLower.includes('usa') || locationLower.includes('united states')) return 'International'
    
    // Default to Saskatchewan (Cameco's primary operations)
    return 'Saskatchewan'
  }

  private static normalizeJobType(jobType: string): string {
    if (!jobType) return 'Full-time'
    
    const typeLower = jobType.toLowerCase()
    
    if (typeLower.includes('temp') || typeLower.includes('seasonal')) return 'Temporary'
    if (typeLower.includes('part')) return 'Part-time'
    if (typeLower.includes('contract') || typeLower.includes('consultant')) return 'Contract'
    if (typeLower.includes('intern') || typeLower.includes('student')) return 'Internship'
    if (typeLower.includes('apprentice') || typeLower.includes('trainee')) return 'Apprenticeship'
    if (typeLower.includes('casual')) return 'Casual'
    
    return 'Full-time'
  }

  private static generateJobId(title: string, location: string): string {
    const crypto = require('crypto')
    const content = `cameco_${title}_${location}_${new Date().toISOString().split('T')[0]}`
    return crypto.createHash('md5').update(content).digest('hex')
  }

  // Override the scrape method to add Cameco-specific logic
  async scrape(options?: ScrapingOptions): Promise<any> {
    console.log('Starting Cameco Corporation scraping...')
    
    // Set Cameco-specific defaults
    const camecoOptions = {
      maxPages: 3,
      dateRange: 'week' as const,
      sectors: ['mining'],
      keywords: [
        'uranium', 'mining', 'nuclear', 'geology', 'geologist', 'engineer',
        'technician', 'operator', 'supervisor', 'environmental', 'safety',
        'metallurgy', 'processing', 'mill', 'radiation', 'health physics',
        'maintenance', 'mechanical', 'electrical', 'instrumentation'
      ],
      ...options
    }

    return super.scrape(camecoOptions)
  }
}