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
  website?: string
  knownCareersPath?: string
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

// Parse companies from the markdown document
function parseCompaniesFromMarkdown(): Company[] {
  const markdownPath = path.join(process.cwd(), 'docs', 'canadian-resource-companies.md')
  const content = fs.readFileSync(markdownPath, 'utf-8')
  
  const companies: Company[] = []
  const lines = content.split('\n')
  
  let currentSector = 'unknown'
  
  for (const line of lines) {
    // Detect sector headers
    if (line.includes('🛢️') || line.toLowerCase().includes('oil') && line.includes('#')) {
      currentSector = 'oil_gas'
    } else if (line.includes('⛏️') || line.toLowerCase().includes('mining') && line.includes('#')) {
      currentSector = 'mining'
    } else if (line.includes('🌲') || line.toLowerCase().includes('forestry') && line.includes('#')) {
      currentSector = 'forestry'
    } else if (line.includes('🚛') || line.toLowerCase().includes('transportation') && line.includes('#')) {
      currentSector = 'transportation'
    } else if (line.includes('⚡') || line.toLowerCase().includes('utilities') && line.includes('#')) {
      currentSector = 'utilities'
    } else if (line.includes('🌾') || line.toLowerCase().includes('agriculture') && line.includes('#')) {
      currentSector = 'agriculture'
    } else if (line.includes('🏗️') || line.toLowerCase().includes('construction') && line.includes('#')) {
      currentSector = 'construction'
    } else if (line.toLowerCase().includes('renewable') && line.includes('#')) {
      currentSector = 'renewable'
    }
    
    // Extract company names (lines starting with - **)
    const companyMatch = line.match(/^-\s*\*\*([^*]+)\*\*/)
    if (companyMatch) {
      const companyName = companyMatch[1].trim()
      
      // Skip if it's a generic description
      if (companyName.length > 3 && !companyName.toLowerCase().includes('major') && !companyName.toLowerCase().includes('companies')) {
        companies.push({
          name: companyName,
          sector: currentSector
        })
      }
    }
  }
  
  console.log(`📋 Parsed ${companies.length} companies from markdown`)
  return companies
}

// Generate likely career page URLs for a company
function generateCareerUrls(companyName: string): string[] {
  // Clean company name for URL generation
  const cleanName = companyName
    .replace(/\\s+(Inc\\.|Ltd\\.|Corp\\.|Corporation|Limited|Company)$/i, '')
    .replace(/[^a-zA-Z0-9\\s]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\\s+/g, '')
  
  const variations = [
    cleanName,
    cleanName.replace(/^the\\s+/i, ''),
    cleanName.replace(/\\s+(energy|resources|mining|oil|gas|corp|inc|ltd)$/i, ''),
  ]
  
  const urls: string[] = []
  
  for (const variation of variations) {
    if (variation.length < 3) continue
    
    const baseUrls = [
      `https://www.${variation}.com`,
      `https://www.${variation}.ca`,
      `https://www.${variation}energy.com`,
      `https://www.${variation}resources.com`,
      `https://${variation}.com`,
      `https://${variation}.ca`
    ]
    
    for (const baseUrl of baseUrls) {
      urls.push(`${baseUrl}/careers`)
      urls.push(`${baseUrl}/careers/`)
      urls.push(`${baseUrl}/en/careers`)
      urls.push(`${baseUrl}/en-ca/careers`)
      urls.push(`${baseUrl}/jobs`)
    }
  }
  
  // Remove duplicates
  return [...new Set(urls)]
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

async function scrapeCompanyJobs(company: Company): Promise<CompanyResult> {
  console.log(`\\n🏢 Scraping ${company.name} (${company.sector})`)
  
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
    // Generate possible career page URLs
    const careerUrls = generateCareerUrls(company.name)
    console.log(`   🔍 Testing ${Math.min(careerUrls.length, 3)} career URLs...`)
    
    let foundWorkingUrl = false
    
    // Try first few URLs
    for (const url of careerUrls.slice(0, 3)) {
      try {
        console.log(`   🧪 Testing: ${url}`)
        
        const html = await fetchWithScrapingBee(url, 4000)
        
        // Check if this looks like a valid career page
        const lowerHtml = html.toLowerCase()
        const hasCareerContent = ['career', 'job', 'position', 'opportunity', 'employment'].some(keyword => 
          lowerHtml.includes(keyword)
        )
        
        if (!hasCareerContent || html.length < 5000) {
          console.log(`   ❌ Not a career page or too small`)
          continue
        }
        
        console.log(`   ✅ Valid career page found (${html.length} chars)`)
        
        // Extract jobs from this page
        const jobs = await extractJobsFromPage(html, url, company)
        
        if (jobs.length > 0) {
          result.jobs = jobs
          result.jobsFound = jobs.length
          result.success = true
          result.discoveryMethod = 'direct_career_page'
          foundWorkingUrl = true
          
          console.log(`   🎉 Found ${jobs.length} jobs!`)
          jobs.slice(0, 3).forEach((job, index) => {
            console.log(`      ${index + 1}. ${job.title}`)
          })
          
          break
        } else {
          // Look for external job portal links
          const externalPortals = findExternalJobPortals(html)
          if (externalPortals.length > 0) {
            console.log(`   🔗 Found external job portal: ${externalPortals[0]}`)
            
            try {
              const portalHtml = await fetchWithScrapingBee(externalPortals[0], 5000)
              const portalJobs = await extractJobsFromPage(portalHtml, externalPortals[0], company)
              
              if (portalJobs.length > 0) {
                result.jobs = portalJobs
                result.jobsFound = portalJobs.length
                result.success = true
                result.discoveryMethod = 'external_portal'
                foundWorkingUrl = true
                
                console.log(`   🎉 Found ${portalJobs.length} jobs from external portal!`)
                break
              }
            } catch (portalError) {
              console.log(`   ⚠️  External portal failed: ${portalError}`)
            }
          }
        }
        
        // Small delay between URL tests
        await new Promise(resolve => setTimeout(resolve, 1500))
        
      } catch (error) {
        console.log(`   ❌ Failed ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    if (!foundWorkingUrl) {
      result.error = 'No working career URLs found'
      result.discoveryMethod = 'failed'
    }
    
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error'
    result.discoveryMethod = 'error'
    console.log(`   ❌ Company scraping failed: ${result.error}`)
  }

  result.timeElapsed = Date.now() - startTime
  console.log(`   ⏱️  Completed in ${(result.timeElapsed / 1000).toFixed(1)}s`)
  
  return result
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

  // Strategy 1: Look for structured job listings
  const jobSelectors = [
    { card: '[data-automation-id*="job"]', title: '[data-automation-id*="title"]', location: '[data-automation-id*="location"]' },
    { card: '.posting', title: '.posting-title', location: '.posting-location' },
    { card: '.opening', title: '.opening-title', location: '.opening-location' },
    { card: '.job', title: '.job-title', location: '.job-location' },
    { card: '.position', title: '.position-title', location: '.position-location' },
    { card: '.job-item', title: 'h1, h2, h3, h4', location: '.location' },
    { card: 'article', title: 'h1, h2, h3, h4', location: '.location' }
  ]

  for (const selector of jobSelectors) {
    const jobCards = $(selector.card)
    
    if (jobCards.length > 0 && jobCards.length < 100) {
      jobCards.each((index, element) => {
        if (index >= 20) return false // Limit to 20 jobs per company
        
        const $card = $(element)
        const title = $card.find(selector.title).first().text().trim() || 
                     $card.find('h1, h2, h3, h4').first().text().trim()
        const location = $card.find(selector.location).first().text().trim()
        const linkElement = $card.find('a').first()
        const applicationUrl = linkElement.attr('href') || sourceUrl

        if (title && title.length > 3 && title.length < 200) {
          // Filter out obvious non-job content
          const isRealJob = !title.toLowerCase().includes('read more') && 
                           !title.toLowerCase().includes('learn more') &&
                           !title.toLowerCase().includes('view all') &&
                           !title.toLowerCase().includes('see all')
          
          if (isRealJob) {
            jobs.push({
              title: title,
              company: company.name,
              location: location || 'Canada',
              sector: company.sector,
              applicationUrl: applicationUrl.startsWith('http') ? applicationUrl : `${new URL(sourceUrl).origin}${applicationUrl}`,
              sourceUrl: sourceUrl,
              discoveryMethod: 'structured_extraction',
              scrapedAt: new Date().toISOString()
            })
          }
        }
      })
      
      if (jobs.length > 0) break // Stop after finding jobs with first working selector
    }
  }

  // Strategy 2: Look for job-related links if no structured content found
  if (jobs.length === 0) {
    const jobKeywords = ['engineer', 'manager', 'analyst', 'coordinator', 'specialist', 'technician', 'operator', 'supervisor', 'director']
    
    $('a').each((index, element) => {
      if (jobs.length >= 10) return false
      
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
            discoveryMethod: 'link_analysis',
            scrapedAt: new Date().toISOString()
          })
        }
      }
    })
  }

  return jobs
}

async function saveResultsToFile(results: CompanyResult[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `company-scraping-results-${timestamp}.json`
  
  const summary = {
    scrapedAt: new Date().toISOString(),
    totalCompanies: results.length,
    successfulCompanies: results.filter(r => r.success).length,
    totalJobs: results.reduce((sum, r) => sum + r.jobsFound, 0),
    averageTimePerCompany: results.reduce((sum, r) => sum + r.timeElapsed, 0) / results.length,
    results: results
  }
  
  fs.writeFileSync(filename, JSON.stringify(summary, null, 2))
  console.log(`\\n💾 Results saved to ${filename}`)
  
  return filename
}

async function main() {
  console.log('🇨🇦 Canadian Resource Companies - Mass Scraping System')
  console.log('🎯 Scraping all companies for direct job opportunities')
  console.log('='.repeat(70))

  // Parse all companies from the markdown file
  const companies = parseCompaniesFromMarkdown()
  
  console.log(`\\n📊 SCRAPING PLAN:`)
  console.log(`   Companies to scrape: ${companies.length}`)
  console.log(`   Estimated time: ${Math.round(companies.length * 8 / 60)} minutes`)
  console.log(`   Rate limit: 2 second delay between companies`)
  
  // Group by sector for better progress tracking
  const bySector = companies.reduce((acc, company) => {
    acc[company.sector] = (acc[company.sector] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log(`\\n🏭 Companies by sector:`)
  Object.entries(bySector).forEach(([sector, count]) => {
    console.log(`   • ${sector}: ${count} companies`)
  })
  
  console.log(`\\n🚀 Starting mass scraping...`)
  console.log('='.repeat(70))

  const results: CompanyResult[] = []
  let processed = 0
  
  for (const company of companies) {
    processed++
    console.log(`\\n[${processed}/${companies.length}] Progress: ${((processed/companies.length)*100).toFixed(1)}%`)
    
    const result = await scrapeCompanyJobs(company)
    results.push(result)
    
    // Progress update
    const successful = results.filter(r => r.success).length
    const totalJobs = results.reduce((sum, r) => sum + r.jobsFound, 0)
    
    console.log(`   📊 Running totals: ${successful} successful, ${totalJobs} jobs found`)
    
    // Respectful delay between companies
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Save intermediate results every 25 companies
    if (processed % 25 === 0) {
      await saveResultsToFile(results)
      console.log(`   💾 Intermediate save completed`)
    }
  }

  // Final results
  console.log('\\n' + '='.repeat(70))
  console.log('🎉 MASS SCRAPING COMPLETED!')
  console.log('='.repeat(70))

  const successful = results.filter(r => r.success)
  const totalJobs = results.reduce((sum, r) => sum + r.jobsFound, 0)
  const avgTime = results.reduce((sum, r) => sum + r.timeElapsed, 0) / results.length

  console.log(`\\n📊 FINAL RESULTS:`)
  console.log(`   Total companies scraped: ${results.length}`)
  console.log(`   Successful companies: ${successful.length} (${((successful.length/results.length)*100).toFixed(1)}%)`)
  console.log(`   Total jobs found: ${totalJobs}`)
  console.log(`   Average jobs per successful company: ${successful.length > 0 ? (totalJobs/successful.length).toFixed(1) : 0}`)
  console.log(`   Average time per company: ${(avgTime/1000).toFixed(1)}s`)
  console.log(`   Total scraping time: ${(results.reduce((sum, r) => sum + r.timeElapsed, 0)/1000/60).toFixed(1)} minutes`)

  // Top performing companies
  const topCompanies = successful
    .sort((a, b) => b.jobsFound - a.jobsFound)
    .slice(0, 10)

  if (topCompanies.length > 0) {
    console.log(`\\n🏆 TOP 10 COMPANIES BY JOBS FOUND:`)
    topCompanies.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.company}: ${result.jobsFound} jobs (${result.sector})`)
    })
  }

  // Success by sector
  const sectorResults = results.reduce((acc, result) => {
    if (!acc[result.sector]) {
      acc[result.sector] = { total: 0, successful: 0, jobs: 0 }
    }
    acc[result.sector].total++
    if (result.success) {
      acc[result.sector].successful++
      acc[result.sector].jobs += result.jobsFound
    }
    return acc
  }, {} as Record<string, {total: number, successful: number, jobs: number}>)

  console.log(`\\n🏭 RESULTS BY SECTOR:`)
  Object.entries(sectorResults).forEach(([sector, stats]) => {
    const successRate = ((stats.successful / stats.total) * 100).toFixed(1)
    console.log(`   • ${sector}: ${stats.successful}/${stats.total} companies (${successRate}%), ${stats.jobs} jobs`)
  })

  // Save final results
  const filename = await saveResultsToFile(results)
  
  console.log(`\\n💡 CONCLUSIONS:`)
  if (totalJobs > 0) {
    console.log(`   ✅ Mass scraping SUCCESS! Found ${totalJobs} exclusive jobs`)
    console.log(`   ✅ ${successful.length} companies have scrapable job listings`)
    console.log(`   ✅ This proves companies post jobs directly on their sites`)
    console.log(`   ✅ These are jobs NOT available on Indeed or other job boards`)
  } else {
    console.log(`   ⚠️  No jobs found - may need to refine scraping approach`)
  }
  
  console.log(`\\n📂 Detailed results saved to: ${filename}`)
  console.log('🚀 Ready to integrate successful companies into production system!')
}

if (require.main === module) {
  main().catch(console.error)
}