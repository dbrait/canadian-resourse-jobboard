export const SCRAPING_CONFIG = {
  // ScrapingBee API key - set this in your environment variables
  apiKey: process.env.SCRAPINGBEE_API_KEY!,
  
  // Base configuration for ScrapingBee requests
  defaultOptions: {
    render_js: true,
    premium_proxy: true,
    country_code: 'ca', // Canada-specific proxy
    wait: 3000, // Wait 3 seconds for page to load
    wait_for: '', // CSS selector to wait for (can be overridden)
    block_ads: true,
    block_resources: true,
    screenshot: false,
    extract_rules: {} // Custom extraction rules (can be overridden)
  },

  // Rate limiting configuration
  rateLimit: {
    requestsPerMinute: 30, // ScrapingBee free tier limit
    delayBetweenRequests: 2000 // 2 seconds between requests
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000
  },

  // Cache configuration for avoiding duplicate scrapes
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  }
}

// Supported job platforms and their base configurations
export const JOB_PLATFORMS = {
  indeed: {
    name: 'Indeed Canada',
    baseUrl: 'https://ca.indeed.com',
    searchPath: '/jobs',
    selectors: {
      jobCard: '[data-jk]',
      title: 'h2.jobTitle a span[title]',
      company: '.companyName',
      location: '.companyLocation',
      description: '.job-snippet',
      salary: '.salary-snippet',
      postDate: '.date',
      applyLink: 'h2.jobTitle a'
    },
    searchParams: {
      q: '', // job query
      l: '', // location
      fromage: '7', // posted within last 7 days
      limit: '50' // results per page
    }
  },
  
  workbc: {
    name: 'WorkBC',
    baseUrl: 'https://www.workbc.ca',
    searchPath: '/jobs-careers/find-jobs',
    selectors: {
      jobCard: '.job-result',
      title: '.job-title a',
      company: '.employer-name',
      location: '.job-location',
      description: '.job-description',
      salary: '.salary-range',
      postDate: '.post-date',
      applyLink: '.job-title a'
    }
  },

  jobbank: {
    name: 'Job Bank Canada',
    baseUrl: 'https://www.jobbank.gc.ca',
    searchPath: '/jobsearch/jobsearch',
    selectors: {
      jobCard: '.job-posting-brief',
      title: '.job-title a',
      company: '.business-name',
      location: '.location',
      description: '.job-description-short',
      salary: '.salary',
      postDate: '.posting-date',
      applyLink: '.job-title a'
    }
  }
}

// Company-specific scraping configurations
export const COMPANY_PLATFORMS = {
  suncor: {
    name: 'Suncor Energy Inc.',
    sector: 'oil_gas',
    baseUrl: 'https://www.suncor.com',
    careersPath: '/en-ca/careers'
  },
  
  cn_rail: {
    name: 'Canadian National Railway Company',
    sector: 'transportation',
    baseUrl: 'https://www.cn.ca',
    careersPath: '/en/careers'
  },
  
  cameco: {
    name: 'Cameco Corporation',
    sector: 'mining',
    baseUrl: 'https://www.cameco.com',
    careersPath: '/careers'
  },
  
  cnrl: {
    name: 'Canadian Natural Resources Limited',
    sector: 'oil_gas',
    baseUrl: 'https://www.cnrl.com',
    careersPath: '/careers'
  }
}

// Common resource sector keywords for filtering
export const RESOURCE_SECTORS = {
  mining: ['mining', 'mine', 'mineral', 'exploration', 'geology', 'geologist', 'metallurgy', 'ore', 'copper', 'gold', 'silver', 'iron', 'coal', 'potash', 'diamond'],
  oil_gas: ['oil', 'gas', 'petroleum', 'drilling', 'pipeline', 'refinery', 'lng', 'upstream', 'downstream', 'reservoir', 'production engineer', 'completions', 'fracking'],
  forestry: ['forestry', 'forest', 'lumber', 'timber', 'pulp', 'paper', 'mill', 'logging', 'sawmill', 'wood products', 'silviculture'],
  renewable: ['renewable', 'solar', 'wind', 'hydro', 'hydroelectric', 'geothermal', 'biomass', 'green energy', 'clean energy', 'sustainability'],
  utilities: ['utility', 'utilities', 'power', 'electricity', 'electric', 'transmission', 'distribution', 'grid', 'energy'],
  agriculture: ['agriculture', 'farming', 'farm', 'agricultural', 'agribusiness', 'crop', 'livestock', 'dairy', 'grain']
}