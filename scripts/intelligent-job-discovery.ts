#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import * as cheerio from 'cheerio'

// Load environment variables
config({ path: '.env.local' })

interface JobDiscoveryResult {
  company: string
  mainCareerUrl: string
  jobPortalUrls: string[]
  externalJobSites: string[]
  actualJobs: Array<{
    title: string
    location: string
    url: string
    source: string
  }>
  discoveryMethod: string
  success: boolean
}

const TEST_COMPANIES = [
  { name: 'Canadian National Railway', url: 'https://www.cn.ca/en/careers' },
  { name: 'Teck Resources', url: 'https://www.teck.com/careers' },
  { name: 'West Fraser', url: 'https://www.westfraser.com/careers' },
]

async function fetchWithScrapingBee(url: string, waitTime = 3000): Promise<string> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY
  if (!apiKey) throw new Error('SCRAPINGBEE_API_KEY not found')

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    url: url,
    country_code: 'ca',
    render_js: 'true',
    wait: waitTime.toString()
  })
  
  const response = await fetch(`https://app.scrapingbee.com/api/v1/?${queryParams}`)
  
  if (response.status !== 200) {
    throw new Error(`ScrapingBee failed: ${response.status}`)
  }

  return await response.text()
}

async function discoverJobPortals(company: { name: string, url: string }): Promise<JobDiscoveryResult> {
  console.log(`\n🔍 Discovering job portals for ${company.name}`)
  console.log(`   Starting URL: ${company.url}`)
  
  const result: JobDiscoveryResult = {
    company: company.name,
    mainCareerUrl: company.url,
    jobPortalUrls: [],
    externalJobSites: [],
    actualJobs: [],
    discoveryMethod: 'none',
    success: false
  }

  try {
    // Step 1: Get the main career page
    const html = await fetchWithScrapingBee(company.url)
    const $ = cheerio.load(html)
    
    console.log(`   📄 Main page: ${html.length} characters`)

    // Step 2: Look for job portal links
    const jobPortalKeywords = [
      'job', 'jobs', 'career', 'careers', 'position', 'positions', 
      'opportunity', 'opportunities', 'opening', 'openings', 'vacancy',
      'employment', 'apply', 'search', 'browse'
    ]

    const externalJobSitePatterns = [
      'workday.com', 'greenhouse.io', 'lever.co', 'bamboohr.com', 
      'taleo.net', 'successfactors.com', 'icims.com', 'smartrecruiters.com',
      'jobvite.com', 'workable.com', 'applytojob.com'
    ]

    // Find potential job portal links
    const potentialJobUrls: string[] = []
    $('a').each((_, element) => {
      const $link = $(element)
      const href = $link.attr('href')
      const linkText = $link.text().trim().toLowerCase()
      
      if (!href) return

      // Check for external job sites
      for (const pattern of externalJobSitePatterns) {
        if (href.includes(pattern)) {
          result.externalJobSites.push(href)
          console.log(`   🔗 External job site: ${href}`)
        }
      }

      // Check for internal job portal links
      const isJobRelated = jobPortalKeywords.some(keyword => 
        linkText.includes(keyword) || href.toLowerCase().includes(keyword)
      )

      if (isJobRelated && href.length > 5 && !href.startsWith('#') && !href.startsWith('mailto:')) {
        const fullUrl = href.startsWith('http') ? href : `${new URL(company.url).origin}${href}`
        
        // Avoid duplicate URLs and generic links
        if (!potentialJobUrls.includes(fullUrl) && 
            linkText.length > 2 && 
            linkText.length < 100 &&
            !linkText.includes('email') &&
            !linkText.includes('newsletter')) {
          potentialJobUrls.push(fullUrl)
          console.log(`   🎯 Job portal candidate: ${linkText} -> ${fullUrl}`)
        }
      }
    })

    // Step 3: If we found external job sites, use those first
    if (result.externalJobSites.length > 0) {
      console.log(`   ✅ Found ${result.externalJobSites.length} external job portals`)
      
      // Try the first external job site
      try {
        const jobSiteHtml = await fetchWithScrapingBee(result.externalJobSites[0], 5000)
        const jobs = await extractJobsFromJobSite(jobSiteHtml, result.externalJobSites[0])
        result.actualJobs.push(...jobs)
        result.discoveryMethod = 'external_portal'
        result.success = jobs.length > 0
        
        console.log(`   🎉 Found ${jobs.length} jobs from external portal`)
        return result
      } catch (error) {
        console.log(`   ⚠️  External portal failed: ${error}`)
      }
    }

    // Step 4: Try internal job portal URLs
    if (potentialJobUrls.length > 0) {
      console.log(`   🔍 Testing ${potentialJobUrls.length} internal job portal URLs`)
      
      for (const url of potentialJobUrls.slice(0, 3)) { // Test first 3 URLs
        try {
          console.log(`   🧪 Testing: ${url}`)
          const jobPageHtml = await fetchWithScrapingBee(url, 5000)
          const jobs = await extractJobsFromJobPage(jobPageHtml, url)
          
          if (jobs.length > 0) {
            result.jobPortalUrls.push(url)
            result.actualJobs.push(...jobs)
            result.discoveryMethod = 'internal_portal'
            result.success = true
            
            console.log(`   ✅ Found ${jobs.length} jobs from ${url}`)
            break // Stop after finding working portal
          }
        } catch (error) {
          console.log(`   ❌ Failed to test ${url}: ${error}`)
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // Step 5: Fallback - try to extract any job-like content from main page
    if (result.actualJobs.length === 0) {
      console.log(`   🔄 Fallback: Extracting from main career page`)
      const fallbackJobs = await extractJobsFromJobPage(html, company.url)
      result.actualJobs.push(...fallbackJobs)
      result.discoveryMethod = 'main_page_fallback'
      result.success = fallbackJobs.length > 0
    }

    return result

  } catch (error) {
    console.log(`   ❌ Discovery failed: ${error}`)
    result.discoveryMethod = 'failed'
    return result
  }
}

async function extractJobsFromJobSite(html: string, sourceUrl: string) {
  const $ = cheerio.load(html)
  const jobs: Array<{title: string, location: string, url: string, source: string}> = []

  // Common job site selectors
  const jobSelectors = [
    { card: '[data-automation-id*="job"]', title: '[data-automation-id*="title"]', location: '[data-automation-id*="location"]' }, // Workday
    { card: '.posting', title: '.posting-title', location: '.posting-location' }, // Lever
    { card: '.opening', title: '.opening-title', location: '.opening-location' }, // Greenhouse
    { card: '.job', title: '.job-title', location: '.job-location' }, // Generic
    { card: '.position', title: '.position-title', location: '.position-location' }, // Generic
  ]

  for (const selector of jobSelectors) {
    const jobCards = $(selector.card)
    
    if (jobCards.length > 0) {
      jobCards.each((index, element) => {
        if (index >= 10) return false // Limit results
        
        const $card = $(element)
        const title = $card.find(selector.title).first().text().trim() || 
                     $card.find('h1, h2, h3, h4').first().text().trim()
        const location = $card.find(selector.location).first().text().trim()
        const linkElement = $card.find('a').first()
        const url = linkElement.attr('href') || sourceUrl

        if (title && title.length > 3) {
          jobs.push({
            title: title,
            location: location || 'Not specified',
            url: url.startsWith('http') ? url : `${new URL(sourceUrl).origin}${url}`,
            source: 'external_portal'
          })
        }
      })
      
      if (jobs.length > 0) break // Stop after finding jobs with first working selector
    }
  }

  return jobs
}

async function extractJobsFromJobPage(html: string, sourceUrl: string) {
  const $ = cheerio.load(html)
  const jobs: Array<{title: string, location: string, url: string, source: string}> = []

  // Look for job-like content using multiple strategies
  const strategies = [
    // Strategy 1: Structured job elements
    () => {
      const elements = $('.job, .job-item, .job-listing, .position, .opening, .career-item')
      elements.each((index, element) => {
        if (index >= 5) return false
        
        const $el = $(element)
        const title = $el.find('h1, h2, h3, h4, .title, .job-title').first().text().trim()
        const location = $el.find('.location, .job-location').first().text().trim()
        
        if (title && title.length > 3) {
          jobs.push({
            title: title,
            location: location || 'Not specified',
            url: sourceUrl,
            source: 'structured'
          })
        }
      })
    },
    
    // Strategy 2: Links with job keywords
    () => {
      if (jobs.length > 0) return // Skip if we already found jobs
      
      const jobKeywords = ['engineer', 'manager', 'analyst', 'coordinator', 'specialist', 'technician', 'operator']
      
      $('a').each((index, element) => {
        if (jobs.length >= 5) return false
        
        const $link = $(element)
        const linkText = $link.text().trim()
        const href = $link.attr('href')
        
        if (linkText.length > 10 && linkText.length < 100 && href) {
          const hasJobKeyword = jobKeywords.some(keyword => 
            linkText.toLowerCase().includes(keyword)
          )
          
          if (hasJobKeyword) {
            jobs.push({
              title: linkText,
              location: 'Not specified',
              url: href.startsWith('http') ? href : `${new URL(sourceUrl).origin}${href}`,
              source: 'link_analysis'
            })
          }
        }
      })
    }
  ]

  // Run strategies in order
  for (const strategy of strategies) {
    strategy()
    if (jobs.length > 0) break
  }

  return jobs
}

async function main() {
  console.log('🎯 Intelligent Job Discovery System')
  console.log('🔍 Finding actual job listings from company career pages')
  console.log('='.repeat(70))

  const results: JobDiscoveryResult[] = []

  for (const company of TEST_COMPANIES) {
    const result = await discoverJobPortals(company)
    results.push(result)
    
    // Respectful delay between companies
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  // Summary
  console.log('\n📊 JOB DISCOVERY RESULTS')
  console.log('='.repeat(50))

  let totalJobs = 0
  const methods = new Map<string, number>()

  results.forEach(result => {
    console.log(`\n🏢 ${result.company}:`)
    console.log(`   ✅ Success: ${result.success}`)
    console.log(`   🎯 Jobs found: ${result.actualJobs.length}`)
    console.log(`   🔧 Method: ${result.discoveryMethod}`)
    console.log(`   🔗 External portals: ${result.externalJobSites.length}`)
    console.log(`   📋 Internal portals: ${result.jobPortalUrls.length}`)
    
    if (result.actualJobs.length > 0) {
      console.log(`   📝 Sample jobs:`)
      result.actualJobs.slice(0, 3).forEach((job, index) => {
        console.log(`      ${index + 1}. ${job.title} (${job.location})`)
      })
    }
    
    totalJobs += result.actualJobs.length
    methods.set(result.discoveryMethod, (methods.get(result.discoveryMethod) || 0) + 1)
  })

  console.log('\n🎉 SUMMARY:')
  console.log(`   Total jobs discovered: ${totalJobs}`)
  console.log(`   Successful companies: ${results.filter(r => r.success).length}/${results.length}`)
  
  console.log('\n🔧 Discovery methods used:')
  methods.forEach((count, method) => {
    console.log(`   • ${method}: ${count} companies`)
  })

  console.log('\n💡 CONCLUSIONS:')
  
  if (totalJobs > 0) {
    console.log('   ✅ Intelligent job discovery WORKS!')
    console.log('   ✅ Companies do have real job listings on their sites')
    console.log('   ✅ Following portal links is key to finding actual jobs')
    console.log('   ✅ This approach will get exclusive jobs not on job boards')
  } else {
    console.log('   ⚠️  Need to refine discovery algorithms')
    console.log('   ⚠️  Companies may use more advanced portal systems')
  }

  console.log('\n' + '='.repeat(70))
  console.log('Next: Build production system based on successful discovery methods')
}

if (require.main === module) {
  main().catch(console.error)
}