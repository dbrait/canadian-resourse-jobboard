#!/usr/bin/env npx tsx

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function testSimpleScrapingBee() {
  console.log('🐝 Testing Simple ScrapingBee Parameters')
  console.log('🎯 Using minimal parameters to avoid 400 errors\n')
  
  const apiKey = process.env.SCRAPINGBEE_API_KEY
  
  if (!apiKey) {
    console.log('❌ SCRAPINGBEE_API_KEY not found')
    return
  }

  const testCompanies = [
    {
      name: 'Canadian National Railway',
      url: 'https://www.cn.ca/en/careers'
    },
    {
      name: 'Teck Resources',
      url: 'https://www.teck.com/careers'
    },
    {
      name: 'West Fraser',
      url: 'https://www.westfraser.com/careers'
    }
  ]

  const paramSets = [
    {
      name: 'Minimal Parameters',
      params: {
        country_code: 'ca'
      }
    },
    {
      name: 'Basic JS Rendering',
      params: {
        render_js: true,
        country_code: 'ca',
        wait: 2000
      }
    },
    {
      name: 'Standard Parameters',
      params: {
        render_js: true,
        premium_proxy: true,
        country_code: 'ca',
        wait: 3000,
        block_ads: true
      }
    }
  ]

  for (const paramSet of paramSets) {
    console.log(`\n📋 Testing: ${paramSet.name}`)
    console.log('='.repeat(40))
    
    for (const company of testCompanies) {
      console.log(`\n🏢 ${company.name}`)
      console.log(`   URL: ${company.url}`)
      
      try {
        const queryParams = new URLSearchParams({
          api_key: apiKey,
          url: company.url,
          ...Object.fromEntries(
            Object.entries(paramSet.params).map(([key, value]) => [key, String(value)])
          )
        })
        
        const scrapingUrl = `https://app.scrapingbee.com/api/v1/?${queryParams}`
        
        const startTime = Date.now()
        const response = await fetch(scrapingUrl)
        const timeElapsed = Date.now() - startTime
        
        console.log(`   Status: ${response.status} ${response.statusText}`)
        console.log(`   Time: ${timeElapsed}ms`)
        
        if (response.status === 200) {
          const html = await response.text()
          console.log(`   ✅ Success - ${html.length} characters`)
          
          // Check for career-related content
          const careerKeywords = ['career', 'job', 'position', 'opportunity', 'employment']
          const hasCareerContent = careerKeywords.some(keyword => 
            html.toLowerCase().includes(keyword)
          )
          
          if (hasCareerContent) {
            console.log(`   🎯 Contains career content`)
          } else {
            console.log(`   ⚠️  No obvious career content found`)
          }
          
        } else if (response.status === 400) {
          console.log(`   ❌ Bad Request - Likely blocked/protected`)
        } else if (response.status === 403) {
          console.log(`   ❌ Forbidden - Bot detection`)
        } else if (response.status === 500) {
          console.log(`   ❌ Server Error - Site may be down`)
        } else {
          console.log(`   ❌ Failed with status ${response.status}`)
        }
        
      } catch (error) {
        console.log(`   ❌ Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      // Small delay between companies
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  console.log('\n🎉 Testing completed!')
  console.log('\n💡 Results will show which parameter combination works best')
  console.log('   for each company website.')
}

async function main() {
  console.log('🔬 ScrapingBee Parameter Testing')
  console.log('='.repeat(50))
  
  await testSimpleScrapingBee()
  
  console.log('\n' + '='.repeat(50))
  console.log('Next: Use working parameters in direct company scrapers')
}

if (require.main === module) {
  main().catch(console.error)
}