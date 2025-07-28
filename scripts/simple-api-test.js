#!/usr/bin/env node

// Simple test of ScrapingBee API to verify it works
require('dotenv').config({ path: '.env.local' });

async function testScrapingBeeAPI() {
  console.log('🐝 Testing ScrapingBee API...\n');
  
  if (!process.env.SCRAPINGBEE_API_KEY) {
    console.error('❌ ScrapingBee API key missing from .env.local');
    console.log('Add: SCRAPINGBEE_API_KEY=your_api_key_here');
    return;
  }
  
  try {
    const { ScrapingBeeClient } = require('scrapingbee');
    const client = new ScrapingBeeClient(process.env.SCRAPINGBEE_API_KEY);
    
    console.log('✅ ScrapingBee client created');
    console.log('🔍 Testing with a simple webpage...');
    
    // Test with a simple page first
    const response = await client.get({
      url: 'https://httpbin.org/html',
      params: {
        render_js: false,
        block_ads: true
      }
    });
    
    if (response.data && response.data.includes('<html>')) {
      console.log('✅ ScrapingBee API is working!');
      console.log(`📊 Response size: ${response.data.length} characters`);
      
      // Now test with a job site
      console.log('\n🔍 Testing with Indeed Canada...');
      
      const jobResponse = await client.get({
        url: 'https://ca.indeed.com/jobs?q=mining+engineer&l=Canada',
        params: {
          render_js: true,
          premium_proxy: true,
          country_code: 'ca',
          wait: 3000
        }
      });
      
      if (jobResponse.data && jobResponse.data.includes('job')) {
        console.log('✅ Job site scraping test successful!');
        console.log(`📊 Job page size: ${jobResponse.data.length} characters`);
        
        // Count potential job listings
        const jobMatches = (jobResponse.data.match(/data-jk|jobTitle|job-title/gi) || []).length;
        console.log(`🎯 Potential job elements found: ${jobMatches}`);
        
        console.log('\n🎉 SCRAPING BEE TEST SUCCESSFUL!');
        console.log('✅ API key is valid and working');
        console.log('✅ Canadian proxy is accessible');
        console.log('✅ Job sites can be scraped');
        console.log('\n💡 You can now run the full scraping test!');
        
      } else {
        console.log('⚠️ Job site test had unexpected response');
      }
      
    } else {
      console.log('❌ Unexpected response from ScrapingBee');
    }
    
  } catch (error) {
    console.error('❌ ScrapingBee test failed:', error.message);
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.log('💡 This looks like an API key issue. Check your ScrapingBee API key.');
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      console.log('💡 You may have reached your API quota limit.');
    }
  }
}

testScrapingBeeAPI().catch(console.error);