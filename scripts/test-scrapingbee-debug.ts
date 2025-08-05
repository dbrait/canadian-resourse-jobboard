#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { ScrapingBeeClient } from 'scrapingbee'

// Load environment variables
config({ path: '.env.local' })

async function testScrapingBee() {
  console.log('🐝 Testing ScrapingBee API...')
  console.log('================================================')

  const apiKey = process.env.SCRAPINGBEE_API_KEY

  if (!apiKey) {
    console.error('❌ SCRAPINGBEE_API_KEY not found in environment variables')
    return
  }

  console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...`)

  try {
    const client = new ScrapingBeeClient(apiKey)

    // Test 1: Simple request
    console.log('\n📝 Test 1: Simple request to example.com')
    try {
      const response = await client.get({
        url: 'https://example.com',
        params: {
          render_js: false,
          block_ads: true
        }
      })
      console.log('✅ Success! Status:', response.status)
      console.log('   Response length:', response.data.length)
    } catch (error: any) {
      console.error('❌ Failed:', error.response?.status, error.response?.data || error.message)
    }

    // Test 2: Canadian company website
    console.log('\n📝 Test 2: CN Rail careers page')
    try {
      const response = await client.get({
        url: 'https://www.cn.ca/en/careers',
        params: {
          render_js: true,
          wait: 3000,
          country_code: 'ca',
          premium_proxy: true
        }
      })
      console.log('✅ Success! Status:', response.status)
      console.log('   Response length:', response.data.length)
    } catch (error: any) {
      console.error('❌ Failed:', error.response?.status, error.response?.data || error.message)
      
      // Log detailed error info
      if (error.response) {
        console.log('\n🔍 Error Details:')
        console.log('   Status:', error.response.status)
        console.log('   Status Text:', error.response.statusText)
        console.log('   Headers:', error.response.headers)
        console.log('   Data:', JSON.stringify(error.response.data, null, 2))
      }
    }

    // Test 3: Check account credits
    console.log('\n📝 Test 3: Checking account credits')
    try {
      // Make a simple request to check if we have credits
      const response = await client.get({
        url: 'https://httpbin.org/get',
        params: {
          render_js: false
        }
      })
      console.log('✅ API is working and has credits')
    } catch (error: any) {
      if (error.response?.status === 402) {
        console.error('❌ No credits remaining in ScrapingBee account')
      } else {
        console.error('❌ Error checking credits:', error.message)
      }
    }

  } catch (error) {
    console.error('Fatal error:', error)
  }
}

// Run the test
testScrapingBee().catch(console.error)