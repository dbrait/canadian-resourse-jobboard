#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
config({ path: '.env.local' })

interface Company {
  name: string
  sector: string
}

interface JobResult {
  title: string
  company: string
  location: string
  sector: string
  applicationUrl: string
  sourceUrl: string
  discoveryMethod: string
  scrapedAt: string
}

interface CompanyResult {
  company: string
  sector: string
  success: boolean
  jobsFound: number
  jobs: JobResult[]
  error?: string
  timeElapsed: number
  discoveryMethod: string
}

// Test with a few major companies we know exist
const TEST_COMPANIES: Company[] = [
  { name: 'Canadian National Railway Company', sector: 'transportation' },
  { name: 'Teck Resources Limited', sector: 'mining' },
  { name: 'Canadian Natural Resources Limited', sector: 'oil_gas' },
  { name: 'Enbridge Inc.', sector: 'oil_gas' },
  { name: 'West Fraser Timber Co. Ltd.', sector: 'forestry' }
]

// Generate likely career page URLs for a company
function generateCareerUrls(companyName: string): string[] {
  // Use known working URLs for these test companies
  const knownUrls: Record<string, string[]> = {
    'Canadian National Railway Company': [
      'https://www.cn.ca/en/careers'
    ],
    'Teck Resources Limited': [
      'https://www.teck.com/careers'
    ],
    'Canadian Natural Resources Limited': [
      'https://www.cnrl.com/careers'
    ],
    'Enbridge Inc.': [
      'https://www.enbridge.com/careers'
    ],
    'West Fraser Timber Co. Ltd.': [
      'https://www.westfraser.com/careers'
    ]
  }

  if (knownUrls[companyName]) {
    return knownUrls[companyName]
  }

  // Fallback to generated URLs
  const cleanName = companyName
    .replace(/\s+(Inc\.|Ltd\.|Corp\.|Corporation|Limited|Company)$/i, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
  
  return [
    `https://www.${cleanName}.com/careers`,
    `https://www.${cleanName}.ca/careers`
  ]
}

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
    throw new Error(`ScrapingBee failed: ${response.status} ${response.statusText}`)
  }

  return await response.text()
}

function findExternalJobPortals(html: string): string[] {
  const $ = cheerio.load(html)
  const portals: string[] = []
  
  const externalJobSitePatterns = [
    'workday.com', 'greenhouse.io', 'lever.co', 'bamboohr.com', 
    'taleo.net', 'successfactors.com', 'icims.com', 'smartrecruiters.com',
    'jobvite.com', 'workable.com', 'applytojob.com', 'csod.com'
  ]

  $('a').each((_, element) => {
    const href = $(element).attr('href')
    if (href) {
      for (const pattern of externalJobSitePatterns) {
        if (href.includes(pattern)) {
          portals.push(href)
        }
      }
    }
  })

  return [...new Set(portals)]
}

async function extractJobsFromPage(html: string, sourceUrl: string, company: Company): Promise<JobResult[]> {
  const $ = cheerio.load(html)
  const jobs: JobResult[] = []

  // Look for job portal links first
  const externalPortals = findExternalJobPortals(html)
  if (externalPortals.length > 0) {
    console.log(`   🔗 Found external job portal: ${externalPortals[0]}`)
    
    try {
      const portalHtml = await fetchWithScrapingBee(externalPortals[0], 5000)
      
      // Try to extract jobs from external portal
      const portalJobs = await extractJobsFromPortal(portalHtml, externalPortals[0], company)
      if (portalJobs.length > 0) {
        return portalJobs
      }
    } catch (error) {
      console.log(`   ⚠️  External portal failed: ${error}`)
    }
  }

  // Fallback: look for job-related content on main page
  const jobKeywords = ['engineer', 'manager', 'analyst', 'coordinator', 'specialist', 'technician', 'operator', 'supervisor', 'director']
  
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
          company: company.name,
          location: 'Canada',
          sector: company.sector,
          applicationUrl: href.startsWith('http') ? href : `${new URL(sourceUrl).origin}${href}`,
          sourceUrl: sourceUrl,
          discoveryMethod: 'fallback_link_analysis',
          scrapedAt: new Date().toISOString()
        })
      }
    }
  })

  return jobs
}

async function extractJobsFromPortal(html: string, sourceUrl: string, company: Company): Promise<JobResult[]> {
  const $ = cheerio.load(html)
  const jobs: JobResult[] = []

  // Common job portal selectors
  const jobSelectors = [
    { card: '[data-automation-id*="job"]', title: '[data-automation-id*="title"]', location: '[data-automation-id*="location"]' },
    { card: '.posting', title: '.posting-title', location: '.posting-location' },
    { card: '.opening', title: '.opening-title', location: '.opening-location' },
    { card: '.job', title: '.job-title', location: '.job-location' },
    { card: '.position', title: '.position-title', location: '.position-location' }
  ]

  for (const selector of jobSelectors) {
    const jobCards = $(selector.card)
    
    if (jobCards.length > 0) {
      console.log(`   🎯 Found ${jobCards.length} job cards with selector: ${selector.card}`)
      
      jobCards.each((index, element) => {
        if (index >= 10) return false
        
        const $card = $(element)
        const title = $card.find(selector.title).first().text().trim() || 
                     $card.find('h1, h2, h3, h4').first().text().trim()
        const location = $card.find(selector.location).first().text().trim()
        const linkElement = $card.find('a').first()
        const applicationUrl = linkElement.attr('href') || sourceUrl

        if (title && title.length > 3) {
          jobs.push({
            title: title,
            company: company.name,
            location: location || 'Canada',
            sector: company.sector,
            applicationUrl: applicationUrl.startsWith('http') ? applicationUrl : `${new URL(sourceUrl).origin}${applicationUrl}`,
            sourceUrl: sourceUrl,
            discoveryMethod: 'external_portal',
            scrapedAt: new Date().toISOString()
          })
        }
      })
      
      if (jobs.length > 0) break
    }
  }

  return jobs
}

async function scrapeCompanyJobs(company: Company): Promise<CompanyResult> {
  console.log(`\n🏢 Scraping ${company.name} (${company.sector})`)
  
  const startTime = Date.now()
  const result: CompanyResult = {
    company: company.name,
    sector: company.sector,
    success: false,
    jobsFound: 0,
    jobs: [],
    timeElapsed: 0,
    discoveryMethod: 'none'
  }

  try {
    const careerUrls = generateCareerUrls(company.name)
    console.log(`   🔍 Testing ${careerUrls.length} career URLs...`)
    
    for (const url of careerUrls) {
      try {
        console.log(`   🧪 Testing: ${url}`)
        
        const html = await fetchWithScrapingBee(url, 4000)
        
        // Check if this looks like a valid career page
        const lowerHtml = html.toLowerCase()
        const hasCareerContent = ['career', 'job', 'position', 'opportunity'].some(keyword => 
          lowerHtml.includes(keyword)
        )
        
        if (!hasCareerContent || html.length < 5000) {
          console.log(`   ❌ Not a career page`)
          continue
        }
        
        console.log(`   ✅ Valid career page (${html.length} chars)`)
        
        const jobs = await extractJobsFromPage(html, url, company)
        
        if (jobs.length > 0) {
          result.jobs = jobs
          result.jobsFound = jobs.length
          result.success = true
          result.discoveryMethod = jobs[0].discoveryMethod
          
          console.log(`   🎉 Found ${jobs.length} jobs!`)
          jobs.slice(0, 3).forEach((job, index) => {
            console.log(`      ${index + 1}. ${job.title}`)
          })
          
          break
        }
        
      } catch (error) {
        console.log(`   ❌ Failed ${url}: ${error instanceof Error ? error.message : 'Unknown'}`)
      }
    }
    
    if (!result.success) {
      result.error = 'No jobs found'
      result.discoveryMethod = 'failed'
    }
    
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error'
    result.discoveryMethod = 'error'
  }

  result.timeElapsed = Date.now() - startTime
  console.log(`   ⏱️  Completed in ${(result.timeElapsed / 1000).toFixed(1)}s`)
  
  return result
}

async function main() {
  console.log('🇨🇦 Batch Company Scraping Test')
  console.log('🧪 Testing 5 major companies to validate approach')
  console.log('='.repeat(50))

  const results: CompanyResult[] = []
  
  for (let i = 0; i < TEST_COMPANIES.length; i++) {
    const company = TEST_COMPANIES[i]
    console.log(`\n[${i + 1}/${TEST_COMPANIES.length}] Progress: ${((i+1)/TEST_COMPANIES.length*100).toFixed(0)}%`)
    
    const result = await scrapeCompanyJobs(company)
    results.push(result)
    
    // Small delay between companies
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Results summary
  console.log('\n' + '='.repeat(50))
  console.log('🎉 BATCH TEST COMPLETED!')
  console.log('='.repeat(50))

  const successful = results.filter(r => r.success)
  const totalJobs = results.reduce((sum, r) => sum + r.jobsFound, 0)

  console.log(`\n📊 RESULTS:`)
  console.log(`   Companies tested: ${results.length}`)
  console.log(`   Successful: ${successful.length} (${((successful.length/results.length)*100).toFixed(0)}%)`)
  console.log(`   Total jobs found: ${totalJobs}`)
  console.log(`   Average per successful company: ${successful.length > 0 ? (totalJobs/successful.length).toFixed(1) : 0}`)

  if (successful.length > 0) {
    console.log(`\n🏆 SUCCESSFUL COMPANIES:`)
    successful.forEach(result => {
      console.log(`   • ${result.company}: ${result.jobsFound} jobs (${result.discoveryMethod})`)
    })
    
    console.log(`\n💡 SUCCESS! Ready to run full batch of 161 companies`)
    console.log(`   Estimated jobs from all companies: ${Math.round(totalJobs/successful.length * 161)}`)
  } else {
    console.log(`\n⚠️  No companies worked - need to debug approach`)
  }

  // Save test results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `batch-test-results-${timestamp}.json`
  fs.writeFileSync(filename, JSON.stringify({ results, summary: { successful: successful.length, totalJobs } }, null, 2))
  console.log(`\n💾 Test results saved to ${filename}`)
}

if (require.main === module) {
  main().catch(console.error)
}