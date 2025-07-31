import { CompanyBaseScraper, CompanyConfig } from './scrapers/company-base-scraper'
import { ScraperManager } from './scraper-manager'
import { ScrapingOptions } from '../../types/scraping'

// Company data extracted from the companies list
export interface CompanyData {
  name: string
  sector: 'oil_gas' | 'mining' | 'forestry' | 'renewable' | 'utilities' | 'transportation' | 'agriculture' | 'construction'
  website?: string
  knownCareersPath?: string
  aliases?: string[]
}

// Comprehensive list of Canadian resource companies
export const CANADIAN_RESOURCE_COMPANIES: CompanyData[] = [
  // Oil & Gas Companies
  { name: 'Suncor Energy Inc.', sector: 'oil_gas', website: 'https://www.suncor.com', knownCareersPath: '/en-ca/careers' },
  { name: 'Canadian Natural Resources Limited', sector: 'oil_gas', website: 'https://www.cnrl.com', knownCareersPath: '/careers', aliases: ['CNRL'] },
  { name: 'Cenovus Energy Inc.', sector: 'oil_gas', website: 'https://www.cenovus.com', knownCareersPath: '/careers' },
  { name: 'Imperial Oil Limited', sector: 'oil_gas', website: 'https://www.imperialoil.ca', knownCareersPath: '/careers' },
  { name: 'MEG Energy Corp.', sector: 'oil_gas', website: 'https://www.megenergy.com', knownCareersPath: '/careers' },
  { name: 'Enbridge Inc.', sector: 'oil_gas', website: 'https://www.enbridge.com', knownCareersPath: '/careers' },
  { name: 'TC Energy Corporation', sector: 'oil_gas', website: 'https://www.tcenergy.com', knownCareersPath: '/careers' },
  { name: 'Kinder Morgan Canada', sector: 'oil_gas', website: 'https://www.kindermorgan.com', knownCareersPath: '/careers' },
  { name: 'Pembina Pipeline Corporation', sector: 'oil_gas', website: 'https://www.pembina.com', knownCareersPath: '/careers' },
  { name: 'Inter Pipeline Ltd.', sector: 'oil_gas', website: 'https://www.interpipeline.com', knownCareersPath: '/careers' },
  { name: 'Keyera Corp.', sector: 'oil_gas', website: 'https://www.keyera.com', knownCareersPath: '/careers' },
  { name: 'AltaGas Ltd.', sector: 'oil_gas', website: 'https://www.altagas.ca', knownCareersPath: '/careers' },
  { name: 'Tourmaline Oil Corp.', sector: 'oil_gas', website: 'https://www.tourmalineoil.com', knownCareersPath: '/careers' },
  { name: 'Arc Resources Ltd.', sector: 'oil_gas', website: 'https://www.arcresources.com', knownCareersPath: '/careers' },
  { name: 'Birchcliff Energy Ltd.', sector: 'oil_gas', website: 'https://www.birchcliffenergy.com', knownCareersPath: '/careers' },
  { name: 'Crescent Point Energy Corp.', sector: 'oil_gas', website: 'https://www.crescentpointenergy.com', knownCareersPath: '/careers' },
  { name: 'Baytex Energy Corp.', sector: 'oil_gas', website: 'https://www.baytexenergy.com', knownCareersPath: '/careers' },
  { name: 'Whitecap Resources Inc.', sector: 'oil_gas', website: 'https://www.wcap.ca', knownCareersPath: '/careers' },
  { name: 'Peyto Exploration & Development Corp.', sector: 'oil_gas', website: 'https://www.peyto.com', knownCareersPath: '/careers' },
  { name: 'NuVista Energy Ltd.', sector: 'oil_gas', website: 'https://www.nuvistaenergy.com', knownCareersPath: '/careers' },

  // Mining Companies
  { name: 'Barrick Gold Corporation', sector: 'mining', website: 'https://www.barrick.com', knownCareersPath: '/careers' },
  { name: 'Newmont Canada', sector: 'mining', website: 'https://www.newmont.com', knownCareersPath: '/careers' },
  { name: 'Agnico Eagle Mines Limited', sector: 'mining', website: 'https://www.agnicoeagle.com', knownCareersPath: '/careers' },
  { name: 'Kinross Gold Corporation', sector: 'mining', website: 'https://www.kinross.com', knownCareersPath: '/careers' },
  { name: 'Eldorado Gold Corporation', sector: 'mining', website: 'https://www.eldoradogold.com', knownCareersPath: '/careers' },
  { name: 'Yamana Gold Inc.', sector: 'mining', website: 'https://www.yamana.com', knownCareersPath: '/careers' },
  { name: 'B2Gold Corp.', sector: 'mining', website: 'https://www.b2gold.com', knownCareersPath: '/careers' },
  { name: 'Alamos Gold Inc.', sector: 'mining', website: 'https://www.alamosgold.com', knownCareersPath: '/careers' },
  { name: 'Centerra Gold Inc.', sector: 'mining', website: 'https://www.centerragold.com', knownCareersPath: '/careers' },
  { name: 'New Gold Inc.', sector: 'mining', website: 'https://www.newgold.com', knownCareersPath: '/careers' },
  { name: 'Franco-Nevada Corporation', sector: 'mining', website: 'https://www.franco-nevada.com', knownCareersPath: '/careers' },
  { name: 'Teck Resources Limited', sector: 'mining', website: 'https://www.teck.com', knownCareersPath: '/careers' },
  { name: 'First Quantum Minerals Ltd.', sector: 'mining', website: 'https://www.first-quantum.com', knownCareersPath: '/careers' },
  { name: 'Lundin Mining Corporation', sector: 'mining', website: 'https://www.lundinmining.com', knownCareersPath: '/careers' },
  { name: 'Hudbay Minerals Inc.', sector: 'mining', website: 'https://www.hudbay.com', knownCareersPath: '/careers' },
  { name: 'Capstone Mining Corp.', sector: 'mining', website: 'https://www.capstonemining.com', knownCareersPath: '/careers' },
  { name: 'Taseko Mines Limited', sector: 'mining', website: 'https://www.tasekomines.com', knownCareersPath: '/careers' },
  { name: 'Nutrien Ltd.', sector: 'mining', website: 'https://www.nutrien.com', knownCareersPath: '/careers' },
  { name: 'Mosaic Company Canada', sector: 'mining', website: 'https://www.mosaicco.com', knownCareersPath: '/careers' },
  { name: 'Cameco Corporation', sector: 'mining', website: 'https://www.cameco.com', knownCareersPath: '/careers' },

  // Forestry Companies
  { name: 'West Fraser Timber Co. Ltd.', sector: 'forestry', website: 'https://www.westfraser.com', knownCareersPath: '/careers' },
  { name: 'Canfor Corporation', sector: 'forestry', website: 'https://www.canfor.com', knownCareersPath: '/careers' },
  { name: 'Interfor Corporation', sector: 'forestry', website: 'https://www.interfor.com', knownCareersPath: '/careers' },
  { name: 'Resolute Forest Products Inc.', sector: 'forestry', website: 'https://www.resolutefp.com', knownCareersPath: '/careers' },
  { name: 'Catalyst Paper Corporation', sector: 'forestry', website: 'https://www.catalystpaper.com', knownCareersPath: '/careers' },
  { name: 'Tolko Industries Ltd.', sector: 'forestry', website: 'https://www.tolko.com', knownCareersPath: '/careers' },
  { name: 'Conifex Timber Inc.', sector: 'forestry', website: 'https://www.conifex.com', knownCareersPath: '/careers' },
  { name: 'Western Forest Products Inc.', sector: 'forestry', website: 'https://www.westernforest.com', knownCareersPath: '/careers' },
  { name: 'Domtar Corporation', sector: 'forestry', website: 'https://www.domtar.com', knownCareersPath: '/careers' },

  // Renewable Energy & Utilities
  { name: 'Hydro-Québec', sector: 'utilities', website: 'https://www.hydroquebec.com', knownCareersPath: '/careers' },
  { name: 'BC Hydro', sector: 'utilities', website: 'https://www.bchydro.com', knownCareersPath: '/careers' },
  { name: 'Ontario Power Generation Inc.', sector: 'utilities', website: 'https://www.opg.com', knownCareersPath: '/careers', aliases: ['OPG'] },
  { name: 'Hydro One Limited', sector: 'utilities', website: 'https://www.hydroone.com', knownCareersPath: '/careers' },
  { name: 'Manitoba Hydro', sector: 'utilities', website: 'https://www.hydro.mb.ca', knownCareersPath: '/careers' },
  { name: 'SaskPower', sector: 'utilities', website: 'https://www.saskpower.com', knownCareersPath: '/careers' },
  { name: 'Nova Scotia Power Inc.', sector: 'utilities', website: 'https://www.nspower.ca', knownCareersPath: '/careers' },
  { name: 'NB Power', sector: 'utilities', website: 'https://www.nbpower.com', knownCareersPath: '/careers' },
  { name: 'Fortis Inc.', sector: 'utilities', website: 'https://www.fortisinc.com', knownCareersPath: '/careers' },
  { name: 'Canadian Utilities Limited', sector: 'utilities', website: 'https://www.canadianutilities.com', knownCareersPath: '/careers' },
  { name: 'ATCO Ltd.', sector: 'utilities', website: 'https://www.atco.com', knownCareersPath: '/careers' },
  { name: 'Capital Power Corporation', sector: 'utilities', website: 'https://www.capitalpower.com', knownCareersPath: '/careers' },
  { name: 'TransAlta Corporation', sector: 'utilities', website: 'https://www.transalta.com', knownCareersPath: '/careers' },
  { name: 'Innergex Renewable Energy Inc.', sector: 'renewable', website: 'https://www.innergex.com', knownCareersPath: '/careers' },
  { name: 'Northland Power Inc.', sector: 'renewable', website: 'https://www.northlandpower.com', knownCareersPath: '/careers' },
  { name: 'Boralex Inc.', sector: 'renewable', website: 'https://www.boralex.com', knownCareersPath: '/careers' },
  { name: 'Canadian Solar Inc.', sector: 'renewable', website: 'https://www.canadiansolar.com', knownCareersPath: '/careers' },
  { name: 'Pattern Energy Group Inc.', sector: 'renewable', website: 'https://www.patternenergy.com', knownCareersPath: '/careers' },

  // Transportation
  { name: 'Canadian National Railway Company', sector: 'transportation', website: 'https://www.cn.ca', knownCareersPath: '/careers', aliases: ['CN', 'CN Rail'] },
  { name: 'Canadian Pacific Kansas City Limited', sector: 'transportation', website: 'https://www.cpr.ca', knownCareersPath: '/careers', aliases: ['CPKC', 'CP Rail'] },
  { name: 'Via Rail Canada Inc.', sector: 'transportation', website: 'https://www.viarail.ca', knownCareersPath: '/careers' },

  // Construction & Engineering
  { name: 'SNC-Lavalin Group Inc.', sector: 'construction', website: 'https://www.snclavalin.com', knownCareersPath: '/careers' },
  { name: 'Stantec Inc.', sector: 'construction', website: 'https://www.stantec.com', knownCareersPath: '/careers' },
  { name: 'AECOM Canada Ltd.', sector: 'construction', website: 'https://www.aecom.com', knownCareersPath: '/careers' },
  { name: 'Hatch Ltd.', sector: 'construction', website: 'https://www.hatch.com', knownCareersPath: '/careers' },
  { name: 'Worley Canada', sector: 'construction', website: 'https://www.worley.com', knownCareersPath: '/careers' },
  { name: 'Fluor Canada Ltd.', sector: 'construction', website: 'https://www.fluor.com', knownCareersPath: '/careers' },
  { name: 'Aecon Group Inc.', sector: 'construction', website: 'https://www.aecon.com', knownCareersPath: '/careers' },
  { name: 'PCL Construction', sector: 'construction', website: 'https://www.pcl.com', knownCareersPath: '/careers' },

  // Agriculture
  { name: 'Cargill Limited', sector: 'agriculture', website: 'https://www.cargill.ca', knownCareersPath: '/careers' },
  { name: 'Richardson International Limited', sector: 'agriculture', website: 'https://www.richardson.ca', knownCareersPath: '/careers' },
  { name: 'Viterra Inc.', sector: 'agriculture', website: 'https://www.viterra.com', knownCareersPath: '/careers' },
  { name: 'Maple Leaf Foods Inc.', sector: 'agriculture', website: 'https://www.mapleleaffoods.com', knownCareersPath: '/careers' },
  { name: 'McCain Foods Limited', sector: 'agriculture', website: 'https://www.mccain.com', knownCareersPath: '/careers' }
]

export class CompanyScraperFactory {
  private scraperManager: ScraperManager
  private companyScrapers: Map<string, CompanyBaseScraper> = new Map()

  constructor(scraperManager: ScraperManager) {
    this.scraperManager = scraperManager
  }

  // Generate comprehensive list of company scrapers
  createAllCompanyScrapers(): CompanyBaseScraper[] {
    const scrapers: CompanyBaseScraper[] = []

    for (const company of CANADIAN_RESOURCE_COMPANIES) {
      const scraper = this.createCompanyScraper(company)
      if (scraper) {
        scrapers.push(scraper)
        this.companyScrapers.set(company.name, scraper)
      }
    }

    return scrapers
  }

  // Create individual company scraper
  private createCompanyScraper(company: CompanyData): CompanyBaseScraper | null {
    if (!company.website) {
      // Generate likely website URL based on company name
      company.website = this.generateWebsiteUrl(company.name)
    }

    const config = this.generateCompanyConfig(company)
    return new DynamicCompanyScraper(this.scraperManager, config)
  }

  // Generate company configuration based on industry patterns
  private generateCompanyConfig(company: CompanyData): CompanyConfig {
    const baseConfig: CompanyConfig = {
      name: company.name,
      sector: company.sector,
      baseUrl: company.website!,
      careersPath: company.knownCareersPath || '/careers',
      selectors: this.getSelectorsForSector(company.sector),
      customLogic: {
        buildSearchUrl: (baseUrl: string, options?: ScrapingOptions) => {
          return this.generateSearchUrls(baseUrl, company, options)
        }
      }
    }

    return baseConfig
  }

  // Generate potential website URLs based on company name
  private generateWebsiteUrl(companyName: string): string {
    const cleanName = companyName
      .toLowerCase()
      .replace(/\s+(inc\.|ltd\.|corp\.|corporation|limited|company)$/i, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')

    // Common patterns for Canadian company websites
    const patterns = [
      `https://www.${cleanName}.com`,
      `https://www.${cleanName}.ca`,
      `https://${cleanName}.com`,
      `https://${cleanName}.ca`
    ]

    return patterns[0] // Return the most likely pattern
  }

  // Generate search URLs for different companies
  private generateSearchUrls(baseUrl: string, company: CompanyData, options?: ScrapingOptions): string[] {
    const urls: string[] = []
    
    // Common career page patterns
    const careerPaths = [
      company.knownCareersPath || '/careers',
      '/careers/current-openings',
      '/careers/job-opportunities',
      '/careers/search',
      '/jobs',
      '/employment',
      '/join-our-team',
      '/work-with-us',
      '/career-opportunities'
    ]

    // Add base URLs
    careerPaths.forEach(path => {
      urls.push(`${baseUrl}${path}`)
    })

    // Add external job board URLs for major companies
    if (this.isMajorCompany(company.name)) {
      const cleanName = company.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      urls.push(
        `https://jobs.${cleanName}.com`,
        `https://careers.${cleanName}.com`,
        `https://${cleanName}.jobs`,
        `https://jobs.smartrecruiters.com/oneclick-ui/company/${cleanName}`,
        `https://careers.workday.com/${cleanName}`,
        `https://${cleanName}.wd1.myworkdayjobs.com`
      )
    }

    return urls.slice(0, options?.maxPages || 5)
  }

  // Check if company is major (likely to have dedicated job portals)
  private isMajorCompany(companyName: string): boolean {
    const majorCompanies = [
      'suncor', 'cnrl', 'cenovus', 'imperial oil', 'enbridge', 'tc energy',
      'barrick', 'newmont', 'teck', 'nutrien', 'canadian national', 'cp rail',
      'hydro-québec', 'bc hydro', 'snc-lavalin', 'stantec'
    ]

    return majorCompanies.some(major => 
      companyName.toLowerCase().includes(major) || 
      major.includes(companyName.toLowerCase().split(' ')[0])
    )
  }

  // Get appropriate selectors based on industry sector
  private getSelectorsForSector(sector: string): CompanyConfig['selectors'] {
    // Base selectors that work for most corporate websites
    const baseSelectors = {
      jobCard: [
        '.job-listing', '.job-item', '.career-opportunity', '.position',
        '[data-job-id]', '.job-card', '.job-row', '.opportunity',
        '.career-posting', '.job-opening', '.position-listing',
        '.job', '.career', '.opening', '.vacancy', '.role'
      ],
      title: [
        '.job-title', '.position-title', '.career-title', '.title',
        'h1', 'h2', 'h3', 'h4', '[class*="title"]', '.name',
        '.job-name', '.position-name', '.role-title'
      ],
      location: [
        '.job-location', '.location', '.workplace', '.city',
        '[class*="location"]', '.address', '.place', '.site',
        '.work-location', '.office', '.facility'
      ],
      department: [
        '.department', '.division', '.business-unit', '.team',
        '[class*="department"]', '.group', '.function', '.area'
      ],
      jobType: [
        '.job-type', '.employment-type', '.position-type', '.type',
        '[class*="type"]', '.schedule', '.employment', '.classification'
      ],
      description: [
        '.job-description', '.description', '.summary', '.job-summary',
        '[class*="description"]', '.content', '.job-content', '.details'
      ],
      postDate: [
        '.post-date', '.posted-date', '.date-posted', '.date',
        '[class*="date"]', '.posted', '.created', '.published'
      ],
      applyLink: [
        '.apply-button', '.apply-link', 'a[href*="apply"]',
        'a[href*="job"]', '.job-title a', '.position-title a',
        '.view-job', '.job-link', 'a'
      ]
    }

    // Sector-specific selector additions
    switch (sector) {
      case 'oil_gas':
        baseSelectors.jobCard.unshift('.field-job', '.operations-role', '.energy-position')
        baseSelectors.department.unshift('.field', '.operations', '.upstream', '.downstream')
        break
      case 'mining':
        baseSelectors.jobCard.unshift('.mine-job', '.mining-role', '.operations-position')
        baseSelectors.department.unshift('.mine', '.operations', '.exploration', '.production')
        break
      case 'utilities':
        baseSelectors.jobCard.unshift('.utility-job', '.power-role', '.energy-position')
        baseSelectors.department.unshift('.generation', '.transmission', '.distribution', '.operations')
        break
      case 'construction':
        baseSelectors.jobCard.unshift('.project-job', '.construction-role', '.engineering-position')
        baseSelectors.department.unshift('.project', '.engineering', '.construction', '.design')
        break
    }

    return baseSelectors
  }

  // Get scraper for specific company
  getCompanyScraper(companyName: string): CompanyBaseScraper | undefined {
    return this.companyScrapers.get(companyName)
  }

  // Get all scrapers for a specific sector
  getScrapersForSector(sector: string): CompanyBaseScraper[] {
    return Array.from(this.companyScrapers.values()).filter(
      scraper => (scraper as any).companyConfig.sector === sector
    )
  }

  // Get count of companies by sector
  getCompanyCountBySector(): Record<string, number> {
    const counts: Record<string, number> = {}
    
    for (const company of CANADIAN_RESOURCE_COMPANIES) {
      counts[company.sector] = (counts[company.sector] || 0) + 1
    }

    return counts
  }

  // Get total number of companies
  getTotalCompanyCount(): number {
    return CANADIAN_RESOURCE_COMPANIES.length
  }
}

// Dynamic scraper class that can adapt to different company websites
class DynamicCompanyScraper extends CompanyBaseScraper {
  constructor(scraperManager: ScraperManager, config: CompanyConfig) {
    super(scraperManager, config)
  }

  // Override scrape method with enhanced error handling and fallback logic
  async scrape(options?: ScrapingOptions): Promise<any> {
    console.log(`Starting scraping for ${this.companyConfig.name}...`)
    
    try {
      // First attempt with primary configuration
      const result = await super.scrape(options)
      
      if (result.jobs.length > 0) {
        return result
      }

      // If no jobs found, try fallback strategies
      console.log(`No jobs found for ${this.companyConfig.name}, trying fallback strategies...`)
      return await this.tryFallbackStrategies(options)

    } catch (error) {
      console.error(`Error scraping ${this.companyConfig.name}:`, error)
      return {
        success: false,
        jobs: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        platform: this.platform,
        scraped_at: new Date().toISOString(),
        total_found: 0
      }
    }
  }

  // Fallback strategies when primary scraping fails
  private async tryFallbackStrategies(options?: ScrapingOptions): Promise<any> {
    const fallbackResults = {
      success: false,
      jobs: [],
      errors: [] as string[],
      platform: this.platform,
      scraped_at: new Date().toISOString(),
      total_found: 0
    }

    // Strategy 1: Try common external job boards
    const jobBoardUrls = [
      `https://ca.indeed.com/jobs?q=company:"${this.companyConfig.name}"`,
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(this.companyConfig.name)}`,
      `https://www.glassdoor.ca/Jobs/${this.companyConfig.name.replace(/\s+/g, '-')}-jobs-SRCH_IE.htm`
    ]

    for (const url of jobBoardUrls) {
      try {
        console.log(`Trying fallback URL: ${url}`)
        // This would require specific parsers for each job board
        // For now, we'll log the attempt
        fallbackResults.errors.push(`Fallback attempted: ${url}`)
      } catch (error) {
        fallbackResults.errors.push(`Fallback failed for ${url}: ${error}`)
      }
    }

    return fallbackResults
  }
}