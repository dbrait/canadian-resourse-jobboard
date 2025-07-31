#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { CompanyScraperFactory, CANADIAN_RESOURCE_COMPANIES } from '../lib/scraping/company-scraper-factory'
import { createScrapingSystem } from '../lib/scraping'

// Load environment variables
config({ path: '.env.local' })

async function diagnoseScrapeIssues() {
  console.log('🔍 Diagnosing Scraper Issues...\n')

  // 1. Check environment variables
  console.log('1️⃣ Environment Variables Check:')
  console.log(`   SCRAPINGBEE_API_KEY: ${process.env.SCRAPINGBEE_API_KEY ? '✅ Present' : '❌ Missing'}`)
  console.log(`   SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing'}`)
  console.log(`   SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'}\n`)

  // 2. Check company data
  console.log('2️⃣ Company Data Check:')
  console.log(`   Total companies: ${CANADIAN_RESOURCE_COMPANIES.length}`)
  
  const sectorCounts: Record<string, number> = {}
  CANADIAN_RESOURCE_COMPANIES.forEach(company => {
    sectorCounts[company.sector] = (sectorCounts[company.sector] || 0) + 1
  })
  
  console.log('   Companies by sector:')
  Object.entries(sectorCounts).forEach(([sector, count]) => {
    console.log(`     ${sector}: ${count}`)
  })
  console.log()

  // 3. Test scraper factory
  console.log('3️⃣ Scraper Factory Test:')
  try {
    const scrapingSystem = createScrapingSystem()
    const factory = new CompanyScraperFactory(scrapingSystem.manager)
    
    console.log(`   Factory created: ✅`)
    
    const scrapers = factory.createAllCompanyScrapers()
    console.log(`   Scrapers created: ${scrapers.length}`)
    
    // Test sector filtering
    const oilGasScrapers = factory.getScrapersForSector('oil_gas')
    console.log(`   Oil & Gas scrapers: ${oilGasScrapers.length}`)
    
    const miningScrapers = factory.getScrapersForSector('mining') 
    console.log(`   Mining scrapers: ${miningScrapers.length}`)
    
  } catch (error) {
    console.log(`   ❌ Factory error: ${error}`)
  }
  console.log()

  // 4. Test individual company URLs
  console.log('4️⃣ Company URL Test:')
  const testCompanies = [
    { name: 'Suncor Energy Inc.', website: 'https://www.suncor.com', path: '/en-ca/careers' },
    { name: 'CN Rail', website: 'https://www.cn.ca', path: '/careers' },
    { name: 'Barrick Gold', website: 'https://www.barrick.com', path: '/careers' }
  ]

  for (const company of testCompanies) {
    const fullUrl = `${company.website}${company.path}`
    console.log(`   Testing: ${company.name}`)
    console.log(`   URL: ${fullUrl}`)
    
    try {
      // Simple fetch test (without ScrapingBee)
      const response = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      console.log(`   Direct fetch: ${response.status} ${response.statusText}`)
    } catch (error) {
      console.log(`   Direct fetch failed: ${error}`)
    }
    console.log()
  }

  // 5. Test ScrapingBee configuration
  console.log('5️⃣ ScrapingBee Configuration Test:')
  if (process.env.SCRAPINGBEE_API_KEY) {
    try {
      const { ScrapingBeeClient } = require('scrapingbee')
      const client = new ScrapingBeeClient(process.env.SCRAPINGBEE_API_KEY)
      
      console.log('   ScrapingBee client created: ✅')
      
      // Test with a simple URL
      console.log('   Testing with simple URL...')
      const response = await client.get({
        url: 'https://httpbin.org/json',
        params: {
          render_js: false,
          premium_proxy: false
        }
      })
      
      console.log(`   Simple test status: ${response.response?.status || 'unknown'}`)
      console.log(`   Response length: ${response.data?.length || 0} characters`)
      
    } catch (error) {
      console.log(`   ❌ ScrapingBee error: ${error}`)
    }
  } else {
    console.log('   ❌ ScrapingBee API key missing')
  }
  console.log()

  // 6. Analyze specific company websites
  console.log('6️⃣ Real Company Website Analysis:')
  
  const realCompanyTests = [
    'https://careers.suncor.com',
    'https://jobs.suncor.com', 
    'https://www.suncor.com/en-ca/careers',
    'https://careers.cn.ca',
    'https://www.cn.ca/en/careers',
    'https://jobs.barrick.com',
    'https://careers.barrick.com'
  ]

  for (const url of realCompanyTests) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      console.log(`   ${url}: ${response.status} ${response.statusText}`)
    } catch (error) {
      console.log(`   ${url}: ❌ ${error}`)
    }
  }
}

async function suggestFixes() {
  console.log('\n🔧 Suggested Fixes:\n')

  console.log('1️⃣ Environment Variables:')
  console.log('   - Ensure SCRAPINGBEE_API_KEY is valid and has credits')
  console.log('   - Check if API key is for correct ScrapingBee plan\n')

  console.log('2️⃣ Company URLs:')
  console.log('   - Many companies use external job portals (Workday, SmartRecruiters)')
  console.log('   - Consider using job board searches instead of direct company sites')
  console.log('   - Update URLs to actual career portals\n')

  console.log('3️⃣ Scraping Strategy:')
  console.log('   - Focus on Indeed company searches: "site:company.com jobs"')
  console.log('   - Use LinkedIn company job searches')
  console.log('   - Consider RSS feeds from company career pages\n')

  console.log('4️⃣ Immediate Actions:')
  console.log('   - Test ScrapingBee with simple URLs first')
  console.log('   - Verify company career page structures manually')
  console.log('   - Implement fallback to job boards only')
  console.log('   - Add better error handling and logging')
}

async function main() {
  try {
    await diagnoseScrapeIssues()
    await suggestFixes()
  } catch (error) {
    console.error('❌ Diagnostic failed:', error)
  }
}

if (require.main === module) {
  main().catch(console.error)
}