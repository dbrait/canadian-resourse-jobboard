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

// Parse companies (same as before but simpler)
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
    }
    
    // Extract company names
    const companyMatch = line.match(/^-\s*\*\*([^*]+)\*\*/)
    if (companyMatch) {
      const companyName = companyMatch[1].trim()
      
      if (companyName.length > 3 && !companyName.toLowerCase().includes('major')) {
        companies.push({
          name: companyName,
          sector: currentSector
        })
      }
    }
  }
  
  return companies
}

// Known working URLs for major companies
const KNOWN_CAREER_URLS: Record<string, string> = {
  'Canadian National Railway Company': 'https://www.cn.ca/en/careers',
  'Teck Resources Limited': 'https://www.teck.com/careers',
  'Canadian Natural Resources Limited': 'https://www.cnrl.com/careers',
  'Enbridge Inc.': 'https://www.enbridge.com/careers',
  'West Fraser Timber Co. Ltd.': 'https://www.westfraser.com/careers',
  'Suncor Energy Inc.': 'https://www.suncor.com/en-ca/careers',
  'Barrick Gold Corporation': 'https://www.barrick.com/careers',
  'Shoppers Drug Mart Corporation': 'https://careers.shoppersdrugmart.ca',
  'TC Energy Corporation': 'https://www.tcenergy.com/careers'
}

function generateBestCareerUrl(companyName: string): string {
  // First try known URLs
  if (KNOWN_CAREER_URLS[companyName]) {
    return KNOWN_CAREER_URLS[companyName]
  }
  
  // Generate best guess URL
  const cleanName = companyName
    .replace(/\s+(Inc\.|Ltd\.|Corp\.|Corporation|Limited|Company)$/i, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
  
  // Try most likely URL first
  return `https://www.${cleanName}.com/careers`
}

async function fetchWithScrapingBee(url: string): Promise<string> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY
  if (!apiKey) throw new Error('SCRAPINGBEE_API_KEY not found')

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    url: url,
    country_code: 'ca',
    render_js: 'true',
    wait: '3000'
  })
  
  const response = await fetch(`https://app.scrapingbee.com/api/v1/?${queryParams}`)
  
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}`)
  }

  return await response.text()
}

async function scrapeCompanyQuick(company: Company): Promise<CompanyResult> {
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
    const careerUrl = generateBestCareerUrl(company.name)
    
    const html = await fetchWithScrapingBee(careerUrl)
    
    // Quick validation
    const lowerHtml = html.toLowerCase()
    const hasCareerContent = ['career', 'job', 'position', 'opportunity'].some(keyword => 
      lowerHtml.includes(keyword)
    )
    
    if (hasCareerContent && html.length > 5000) {
      // Quick job extraction
      const jobs = extractJobsQuick(html, careerUrl, company)
      
      if (jobs.length > 0) {
        result.jobs = jobs
        result.jobsFound = jobs.length
        result.success = true
        result.discoveryMethod = 'quick_extraction'
      }
    }
    
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error'
  }

  result.timeElapsed = Date.now() - startTime
  return result
}

function extractJobsQuick(html: string, sourceUrl: string, company: Company): JobResult[] {
  const $ = cheerio.load(html)
  const jobs: JobResult[] = []

  // Look for job-related links
  const jobKeywords = ['engineer', 'manager', 'analyst', 'coordinator', 'specialist', 'technician', 'operator', 'supervisor', 'director', 'foreman', 'apprentice']
  
  $('a').each((index, element) => {
    if (jobs.length >= 5) return false
    
    const $link = $(element)
    const linkText = $link.text().trim()
    const href = $link.attr('href')
    
    if (linkText.length > 8 && linkText.length < 100 && href) {
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
          discoveryMethod: 'quick_link_extraction',
          scrapedAt: new Date().toISOString()
        })
      }
    }
  })

  return jobs
}

async function saveProgressResults(results: CompanyResult[], batchNumber: number) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `batch-${batchNumber}-results-${timestamp}.json`
  
  const summary = {
    batchNumber,
    scrapedAt: new Date().toISOString(),
    totalCompanies: results.length,
    successfulCompanies: results.filter(r => r.success).length,
    totalJobs: results.reduce((sum, r) => sum + r.jobsFound, 0),
    results: results
  }
  
  fs.writeFileSync(filename, JSON.stringify(summary, null, 2))
  console.log(`💾 Batch ${batchNumber} saved to ${filename}`)
}

async function main() {
  console.log('🇨🇦 Fast Company Scraping - All 161 Companies')
  console.log('⚡ Optimized for speed and reliability')
  console.log('='.repeat(50))

  const companies = parseCompaniesFromMarkdown()
  console.log(`📋 Found ${companies.length} companies to scrape`)

  const batchSize = 20
  const batches = Math.ceil(companies.length / batchSize)
  
  console.log(`📦 Running ${batches} batches of ${batchSize} companies each`)
  console.log(`⏱️  Estimated time: ${Math.round(companies.length * 4 / 60)} minutes`)
  console.log('')

  let allResults: CompanyResult[] = []
  
  for (let batchNum = 1; batchNum <= batches; batchNum++) {
    console.log(`\n🚀 BATCH ${batchNum}/${batches}`)
    console.log('-'.repeat(30))
    
    const startIdx = (batchNum - 1) * batchSize
    const endIdx = Math.min(startIdx + batchSize, companies.length)
    const batchCompanies = companies.slice(startIdx, endIdx)
    
    const batchResults: CompanyResult[] = []
    
    for (let i = 0; i < batchCompanies.length; i++) {
      const company = batchCompanies[i]
      const globalIdx = startIdx + i + 1
      
      console.log(`[${globalIdx}/${companies.length}] ${company.name}`)
      
      try {
        const result = await scrapeCompanyQuick(company)
        batchResults.push(result)
        
        if (result.success) {
          console.log(`  ✅ ${result.jobsFound} jobs (${(result.timeElapsed/1000).toFixed(1)}s)`)
        } else {
          console.log(`  ❌ Failed (${(result.timeElapsed/1000).toFixed(1)}s)`)
        }
        
      } catch (error) {
        console.log(`  💥 Error: ${error}`)
        batchResults.push({
          company: company.name,
          sector: company.sector,
          success: false,
          jobsFound: 0,
          jobs: [],
          error: error instanceof Error ? error.message : 'Unknown error',
          timeElapsed: 0,
          discoveryMethod: 'error'
        })
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Save batch results
    await saveProgressResults(batchResults, batchNum)
    
    // Batch summary
    const batchSuccessful = batchResults.filter(r => r.success).length
    const batchJobs = batchResults.reduce((sum, r) => sum + r.jobsFound, 0)
    
    console.log(`\n📊 Batch ${batchNum} Summary:`)
    console.log(`   Companies: ${batchResults.length}`)
    console.log(`   Successful: ${batchSuccessful} (${((batchSuccessful/batchResults.length)*100).toFixed(0)}%)`)
    console.log(`   Jobs found: ${batchJobs}`)
    
    allResults = allResults.concat(batchResults)
    
    // Overall progress
    const totalSuccessful = allResults.filter(r => r.success).length
    const totalJobs = allResults.reduce((sum, r) => sum + r.jobsFound, 0)
    
    console.log(`\n🎯 Overall Progress:`)
    console.log(`   Completed: ${allResults.length}/${companies.length} (${((allResults.length/companies.length)*100).toFixed(0)}%)`)
    console.log(`   Total successful: ${totalSuccessful}`)
    console.log(`   Total jobs: ${totalJobs}`)
    
    // Break between batches
    if (batchNum < batches) {
      console.log(`\n⏸️   5 second break before next batch...`)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(50))
  console.log('🎉 ALL COMPANY SCRAPING COMPLETED!')
  console.log('='.repeat(50))

  const finalSuccessful = allResults.filter(r => r.success)
  const finalTotalJobs = allResults.reduce((sum, r) => sum + r.jobsFound, 0)

  console.log(`\n📊 FINAL RESULTS:`)
  console.log(`   Total companies: ${allResults.length}`)
  console.log(`   Successful: ${finalSuccessful.length} (${((finalSuccessful.length/allResults.length)*100).toFixed(1)}%)`)
  console.log(`   Total jobs found: ${finalTotalJobs}`)
  console.log(`   Average per successful company: ${finalSuccessful.length > 0 ? (finalTotalJobs/finalSuccessful.length).toFixed(1) : 0}`)

  // Top companies
  const topCompanies = finalSuccessful
    .sort((a, b) => b.jobsFound - a.jobsFound)
    .slice(0, 10)

  if (topCompanies.length > 0) {
    console.log(`\n🏆 TOP COMPANIES:`)
    topCompanies.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.company}: ${result.jobsFound} jobs`)
    })
  }

  // Save final consolidated results
  const finalFilename = `final-all-companies-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const consolidatedResults = {
    completedAt: new Date().toISOString(),
    totalCompanies: allResults.length,
    successfulCompanies: finalSuccessful.length,
    successRate: (finalSuccessful.length/allResults.length*100).toFixed(1) + '%',
    totalJobs: finalTotalJobs,
    averageJobsPerCompany: finalSuccessful.length > 0 ? (finalTotalJobs/finalSuccessful.length).toFixed(1) : 0,
    topCompanies: topCompanies.slice(0, 5),
    results: allResults
  }
  
  fs.writeFileSync(finalFilename, JSON.stringify(consolidatedResults, null, 2))
  console.log(`\n💾 Final results saved to: ${finalFilename}`)
  
  console.log(`\n🎯 SUCCESS! Found ${finalTotalJobs} exclusive jobs from Canadian resource companies!`)
}

if (require.main === module) {
  main().catch(console.error)
}