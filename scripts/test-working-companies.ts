#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { DirectCompanyScraperFactory } from '../lib/scraping/direct-company-scrapers'
import { createScrapingSystem } from '../lib/scraping'

// Load environment variables
config({ path: '.env.local' })

async function testWorkingCompanies() {
  console.log('🏢 Testing Known Working Company Websites\n')
  
  try {
    const scrapingSystem = createScrapingSystem()
    const factory = new DirectCompanyScraperFactory(scrapingSystem.manager)
    const scrapers = factory.createDirectCompanyScrapers()
    
    console.log(`Testing ${scrapers.length} company scrapers with 30-second timeout each...\n`)
    
    const results: Array<{company: string, jobs: number, success: boolean, time: number}> = []
    
    for (const scraper of scrapers) {
      const companyName = (scraper as any).companyConfig.name
      const startTime = Date.now()
      
      console.log(`🧪 Testing ${companyName}...`)
      
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout after 30 seconds')), 30000)
        )
        
        const scrapePromise = scraper.scrape({
          maxPages: 1,
          dateRange: 'week'
        })
        
        const result = await Promise.race([scrapePromise, timeoutPromise]) as any
        const timeElapsed = Date.now() - startTime
        
        console.log(`   ✅ Completed in ${(timeElapsed/1000).toFixed(1)}s`)
        console.log(`   📊 Jobs: ${result.jobs.length}, Errors: ${result.errors.length}`)
        
        if (result.jobs.length > 0) {
          console.log(`   🎯 Sample jobs:`)
          result.jobs.slice(0, 3).forEach((job: any, index: number) => {
            console.log(`      ${index + 1}. ${job.title} in ${job.location}`)
          })
        }
        
        results.push({
          company: companyName,
          jobs: result.jobs.length,
          success: result.success,
          time: timeElapsed
        })
        
      } catch (error) {
        const timeElapsed = Date.now() - startTime
        console.log(`   ❌ Failed after ${(timeElapsed/1000).toFixed(1)}s: ${error instanceof Error ? error.message : 'Unknown error'}`)
        
        results.push({
          company: companyName,
          jobs: 0,
          success: false,
          time: timeElapsed
        })
      }
      
      console.log() // Empty line for readability
    }
    
    // Summary
    console.log('📊 SUMMARY RESULTS:')
    console.log('='.repeat(50))
    
    const successful = results.filter(r => r.success)
    const totalJobs = results.reduce((sum, r) => sum + r.jobs, 0)
    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length
    
    console.log(`✅ Successful scrapers: ${successful.length}/${results.length}`)
    console.log(`🎯 Total jobs found: ${totalJobs}`)
    console.log(`⏱️  Average time per scraper: ${(avgTime/1000).toFixed(1)}s`)
    console.log()
    
    console.log('🏆 Working Companies:')
    successful.forEach(result => {
      console.log(`   • ${result.company}: ${result.jobs} jobs (${(result.time/1000).toFixed(1)}s)`)
    })
    
    const failed = results.filter(r => !r.success)
    if (failed.length > 0) {
      console.log('\n❌ Failed Companies:')
      failed.forEach(result => {
        console.log(`   • ${result.company}: Failed after ${(result.time/1000).toFixed(1)}s`)
      })
    }
    
    console.log('\n🎉 CONCLUSION:')
    if (successful.length > 0) {
      console.log(`✅ Direct company scraping WORKS for ${successful.length} companies!`)
      console.log(`📈 This approach will get you exclusive jobs not on job boards`)
      console.log(`⚡ Average runtime: ${(avgTime/1000).toFixed(1)} seconds per company`)
      
      const estimatedTotalTime = (avgTime * 175) / 1000 / 60 // minutes for all companies
      console.log(`🕒 Estimated time for all 175 companies: ${estimatedTotalTime.toFixed(0)} minutes`)
    } else {
      console.log(`⚠️  No companies worked - may need to adjust selectors or approach`)
    }
    
    return results
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return []
  }
}

async function main() {
  console.log('🇨🇦 Direct Company Website Scraper Test')
  console.log('🎯 Getting jobs directly from company career pages')
  console.log('='.repeat(60))
  console.log()
  
  const results = await testWorkingCompanies()
  
  console.log('\n' + '='.repeat(60))
  console.log('🏁 Test completed!')
}

if (require.main === module) {
  main().catch(console.error)
}