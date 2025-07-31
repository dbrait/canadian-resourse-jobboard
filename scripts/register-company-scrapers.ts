#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { createScrapingSystem } from '../lib/scraping'
import { CompanyScraperFactory, CANADIAN_RESOURCE_COMPANIES } from '../lib/scraping/company-scraper-factory'

// Load environment variables
config({ path: '.env.local' })

async function registerCompanyScrapers() {
  console.log('🏭 Registering Canadian Resource Company Scrapers...')
  console.log(`📊 Total companies to register: ${CANADIAN_RESOURCE_COMPANIES.length}`)

  try {
    // Create scraping system
    const scrapingSystem = createScrapingSystem()
    
    // Create company scraper factory
    const factory = new CompanyScraperFactory(scrapingSystem.manager)
    
    // Get company count by sector
    const sectorCounts = factory.getCompanyCountBySector()
    console.log('\n📈 Companies by sector:')
    Object.entries(sectorCounts).forEach(([sector, count]) => {
      console.log(`  ${sector}: ${count} companies`)
    })

    // Create and register all company scrapers
    console.log('\n🔧 Creating company scrapers...')
    const companyScrapers = factory.createAllCompanyScrapers()
    
    console.log(`✅ Created ${companyScrapers.length} company scrapers`)

    // Register each scraper with the manager
    let registeredCount = 0
    for (const scraper of companyScrapers) {
      try {
        const scraperId = (scraper as any).platform
        scrapingSystem.manager.registerScraper(scraperId, scraper)
        registeredCount++
      } catch (error) {
        console.error(`❌ Failed to register scraper: ${error}`)
      }
    }

    console.log(`🎉 Successfully registered ${registeredCount} company scrapers`)

    // Test a few major companies
    console.log('\n🧪 Testing major company scrapers...')
    const testCompanies = [
      'Suncor Energy Inc.',
      'Canadian National Railway Company',
      'Barrick Gold Corporation',
      'Hydro-Québec',
      'West Fraser Timber Co. Ltd.'
    ]

    for (const companyName of testCompanies) {
      const scraper = factory.getCompanyScraper(companyName)
      if (scraper) {
        console.log(`✅ ${companyName} scraper ready`)
        
        // Test scrape with minimal options
        try {
          const testResult = await scraper.scrape({
            maxPages: 1,
            dateRange: 'today'
          })
          console.log(`  📊 Test result: ${testResult.jobs.length} jobs found, ${testResult.errors.length} errors`)
        } catch (error) {
          console.log(`  ⚠️  Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      } else {
        console.log(`❌ ${companyName} scraper not found`)
      }
    }

    return {
      totalCompanies: CANADIAN_RESOURCE_COMPANIES.length,
      scrapersCreated: companyScrapers.length,
      scrapersRegistered: registeredCount,
      sectorBreakdown: sectorCounts
    }

  } catch (error) {
    console.error('❌ Error registering company scrapers:', error)
    throw error
  }
}

// Run comprehensive company scraping test
async function runComprehensiveScrapeTest() {
  console.log('\n🚀 Running comprehensive company scraping test...')
  
  try {
    const scrapingSystem = createScrapingSystem()
    const factory = new CompanyScraperFactory(scrapingSystem.manager)
    
    // Test scraping by sector
    const sectors = ['oil_gas', 'mining', 'utilities', 'forestry', 'renewable']
    const results: Record<string, any> = {}

    for (const sector of sectors) {
      console.log(`\n📊 Testing ${sector} sector...`)
      const sectorScrapers = factory.getScrapersForSector(sector)
      console.log(`  Found ${sectorScrapers.length} companies in ${sector} sector`)

      const sectorResults = {
        companiesFound: sectorScrapers.length,
        jobsFound: 0,
        successfulScrapes: 0,
        failedScrapes: 0,
        errors: [] as string[]
      }

      // Test first 3 companies in each sector
      const testScrapers = sectorScrapers.slice(0, 3)
      
      for (const scraper of testScrapers) {
        const companyName = (scraper as any).companyConfig.name
        console.log(`  🔍 Testing ${companyName}...`)
        
        try {
          const result = await scraper.scrape({
            maxPages: 1,
            dateRange: 'week'
          })
          
          if (result.success && result.jobs.length > 0) {
            sectorResults.successfulScrapes++
            sectorResults.jobsFound += result.jobs.length
            console.log(`    ✅ Found ${result.jobs.length} jobs`)
          } else {
            sectorResults.failedScrapes++
            console.log(`    ⚠️  No jobs found (${result.errors.length} errors)`)
          }
        } catch (error) {
          sectorResults.failedScrapes++
          sectorResults.errors.push(`${companyName}: ${error}`)
          console.log(`    ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        // Add delay between company scrapes
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      results[sector] = sectorResults
      console.log(`  📈 Sector summary: ${sectorResults.successfulScrapes}/${testScrapers.length} successful, ${sectorResults.jobsFound} total jobs`)
    }

    console.log('\n🎯 Comprehensive test results:')
    let totalJobs = 0
    let totalSuccessful = 0
    let totalTested = 0

    Object.entries(results).forEach(([sector, data]) => {
      totalJobs += data.jobsFound
      totalSuccessful += data.successfulScrapes
      totalTested += data.successfulScrapes + data.failedScrapes
      console.log(`  ${sector}: ${data.successfulScrapes} successful scrapes, ${data.jobsFound} jobs`)
    })

    console.log(`\n🏆 Overall Results:`)
    console.log(`  Total companies tested: ${totalTested}`)
    console.log(`  Successful scrapes: ${totalSuccessful}`)
    console.log(`  Success rate: ${((totalSuccessful / totalTested) * 100).toFixed(1)}%`)
    console.log(`  Total jobs found: ${totalJobs}`)

    return results

  } catch (error) {
    console.error('❌ Error in comprehensive test:', error)
    throw error
  }
}

// Main execution
async function main() {
  console.log('🇨🇦 Canadian Resource Job Board - Company Scraper Setup')
  console.log('='.repeat(60))

  try {
    // Register all scrapers
    const registrationResults = await registerCompanyScrapers()
    
    console.log('\n📋 Registration Summary:')
    console.log(`  Total companies: ${registrationResults.totalCompanies}`)
    console.log(`  Scrapers created: ${registrationResults.scrapersCreated}`)
    console.log(`  Scrapers registered: ${registrationResults.scrapersRegistered}`)
    console.log(`  Success rate: ${((registrationResults.scrapersRegistered / registrationResults.totalCompanies) * 100).toFixed(1)}%`)

    // Run comprehensive test if requested
    const runTest = process.argv.includes('--test')
    if (runTest) {
      await runComprehensiveScrapeTest()
    } else {
      console.log('\n💡 To run comprehensive testing, use: npm run setup-companies --test')
    }

    console.log('\n🎉 Company scraper setup completed successfully!')
    console.log('✨ Ready to scrape jobs from 175+ Canadian resource companies!')

  } catch (error) {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  }
}

// Export for use in other scripts
export { registerCompanyScrapers, runComprehensiveScrapeTest }

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}