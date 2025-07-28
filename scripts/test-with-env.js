#!/usr/bin/env node

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Starting Test Scrape of All 6 Sources...\n');

// Check environment variables
if (!process.env.SCRAPINGBEE_API_KEY) {
  console.error('❌ SCRAPINGBEE_API_KEY environment variable is required');
  console.log('Please add your ScrapingBee API key to .env.local');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Supabase environment variables are required');  
  console.log('Please add your Supabase credentials to .env.local');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log(`✅ ScrapingBee API Key: ${process.env.SCRAPINGBEE_API_KEY ? 'Present' : 'Missing'}`);
console.log(`✅ Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing'}`);
console.log(`✅ Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}\n`);

// Simple test using the API endpoint instead of direct imports
async function testViaAPI() {
  console.log('🧪 Testing via API endpoint (simpler approach)...\n');
  
  try {
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/scraping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'scrape',
        platform: 'all',
        options: {
          maxPages: 1,
          dateRange: 'week',
          sectors: ['mining', 'oil_gas', 'transportation']
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API response not ok: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('🎉 API Test Successful!');
      console.log('Results:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ API Test Failed:', result.error);
    }

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    
    // Fallback: suggest manual API testing
    console.log('\n💡 To test manually:');
    console.log('1. Run: npm run dev');
    console.log('2. Open another terminal and run:');
    console.log('   curl -X POST http://localhost:3000/api/scraping \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"action":"scrape","platform":"indeed","options":{"maxPages":1}}\'');
  }
}

// Alternative: Test database connection
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Import Supabase client
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Test query
    const { data, error } = await supabase
      .from('jobs')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('❌ Database Error:', error.message);
    } else {
      console.log('✅ Database Connection Successful!');
      console.log(`📊 Current jobs in database: ${data?.[0]?.count || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testDatabaseConnection();
  console.log('\n' + '='.repeat(50) + '\n');
  await testViaAPI();
}

runTests().catch(console.error);