#!/usr/bin/env npx tsx

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function testScrapingBeeService() {
  console.log('🔍 Testing ScrapingBee Service Status\n')

  const apiKey = process.env.SCRAPINGBEE_API_KEY
  
  if (!apiKey) {
    console.log('❌ SCRAPINGBEE_API_KEY not found in environment variables')
    return
  }

  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}`)

  try {
    // Test 1: Simple HTTP request to check API key validity
    console.log('\n1️⃣ Testing API Key Validity...')
    
    const testUrl = 'https://httpbin.org/json'
    const response = await fetch(`https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(testUrl)}`)
    
    console.log(`   Status: ${response.status} ${response.statusText}`)
    
    if (response.status === 200) {
      const data = await response.text()
      console.log(`   ✅ API Key is valid`)
      console.log(`   Response length: ${data.length} characters`)
    } else if (response.status === 401) {
      console.log('   ❌ API Key is invalid or expired')
      return
    } else if (response.status === 402) {
      console.log('   ❌ No credits remaining on account')
      return
    } else {
      console.log(`   ⚠️  Unexpected status: ${response.status}`)
    }

    // Test 2: Test with a real company website
    console.log('\n2️⃣ Testing Real Company Website...')
    
    const companyUrl = 'https://www.cn.ca/en/careers'
    const companyResponse = await fetch(`https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(companyUrl)}&render_js=true&premium_proxy=true&country_code=ca`)
    
    console.log(`   Company URL: ${companyUrl}`)
    console.log(`   Status: ${companyResponse.status} ${companyResponse.statusText}`)
    
    if (companyResponse.status === 200) {
      const html = await companyResponse.text()
      console.log(`   ✅ Successfully fetched company page`)
      console.log(`   HTML length: ${html.length} characters`)
      
      // Check if we got actual content or just error pages
      if (html.includes('careers') || html.includes('jobs') || html.includes('opportunities')) {
        console.log(`   ✅ Page contains career-related content`)
      } else {
        console.log(`   ⚠️  Page may not contain career content`)
      }
    } else {
      console.log(`   ❌ Failed to fetch company page`)
    }

    // Test 3: Check account status
    console.log('\n3️⃣ Testing Account Status...')
    
    try {
      const { ScrapingBeeClient } = require('scrapingbee')
      const client = new ScrapingBeeClient(apiKey)
      
      const accountResponse = await client.get({
        url: 'https://httpbin.org/json',
        params: {
          render_js: false
        }
      })
      
      console.log(`   ✅ ScrapingBee client working`)
      console.log(`   Response status: ${accountResponse.response?.status}`)
      
    } catch (error) {
      console.log(`   ❌ ScrapingBee client error: ${error}`)
    }

  } catch (error) {
    console.log(`❌ Error testing ScrapingBee: ${error}`)
  }
}

async function suggestFixes() {
  console.log('\n🔧 Suggested Fixes:\n')
  
  console.log('If API key is invalid/expired:')
  console.log('   • Get a new API key from scrapingbee.com')
  console.log('   • Update SCRAPINGBEE_API_KEY in .env.local')
  console.log('   • Ensure you have credits on your account\n')
  
  console.log('If API key is valid but getting errors:')
  console.log('   • Try simpler ScrapingBee parameters')
  console.log('   • Reduce render_js and premium_proxy usage')
  console.log('   • Add delays between requests')
  console.log('   • Check ScrapingBee service status page\n')
  
  console.log('Alternative approaches:')
  console.log('   • Use different scraping service (Bright Data, Proxy Scrape)')
  console.log('   • Implement simple HTTP requests with user agents')
  console.log('   • Use headless browser with Playwright/Puppeteer')
}

async function main() {
  console.log('🐝 ScrapingBee Service Diagnostics')
  console.log('='.repeat(50))
  
  await testScrapingBeeService()
  await suggestFixes()
  
  console.log('\n' + '='.repeat(50))
  console.log('Next: Fix ScrapingBee issues, then test direct company scrapers')
}

if (require.main === module) {
  main().catch(console.error)
}