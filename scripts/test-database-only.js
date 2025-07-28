#!/usr/bin/env node

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Database Connection and Job Board Setup...\n');

async function testDatabase() {
  try {
    // Import Supabase client
    const { createClient } = require('@supabase/supabase-js');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase environment variables missing');
      return;
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('✅ Supabase client created successfully');
    console.log(`📡 Database URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);
    
    // Test basic connection
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('jobs')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (testError) {
      console.error('❌ Database Connection Failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful!');
    const currentJobCount = testData?.[0]?.count || 0;
    console.log(`📊 Current jobs in database: ${currentJobCount}\n`);
    
    // Check if we have recent jobs
    console.log('🔍 Checking for recent jobs...');
    const { data: recentJobs, error: recentError } = await supabase
      .from('jobs')
      .select('id, title, company, location, sector, created_at, source_platform')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentError) {
      console.error('❌ Error fetching recent jobs:', recentError.message);
    } else if (recentJobs && recentJobs.length > 0) {
      console.log('✅ Recent jobs found:');
      recentJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. "${job.title}" at ${job.company}`);
        console.log(`      📍 ${job.location} | 🏷️ ${job.sector} | 📅 ${new Date(job.created_at).toLocaleDateString()}`);
        console.log(`      🔗 Source: ${job.source_platform || 'unknown'}\n`);
      });
    } else {
      console.log('📝 No recent jobs found - database is empty');
    }
    
    // Check database schema
    console.log('🔍 Checking database schema...');
    const { data: tableInfo, error: schemaError } = await supabase
      .from('jobs')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema check failed:', schemaError.message);
    } else {
      console.log('✅ Database schema looks good for job scraping');
    }
    
    // Test inserting a sample job (to verify write permissions)
    console.log('\n🧪 Testing database write permissions...');
    const testJob = {
      title: 'Test Job - Software Engineer',
      company: 'Test Company Inc.',
      location: 'Toronto, Ontario',
      province: 'Ontario',
      sector: 'technology',
      employment_type: 'Full-time',
      description: 'This is a test job created by the scraping system test.',
      posted_date: new Date().toISOString().split('T')[0],
      is_active: true,
      source_platform: 'test',
      external_id: `test_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('jobs')
      .insert([testJob])
      .select();
    
    if (insertError) {
      console.error('❌ Database write test failed:', insertError.message);
      console.log('   This might indicate a permissions issue or missing database schema');
    } else {
      console.log('✅ Database write test successful!');
      console.log(`📝 Test job inserted with ID: ${insertData[0].id}`);
      
      // Clean up test job
      await supabase
        .from('jobs')
        .delete()
        .eq('id', insertData[0].id);
      
      console.log('🧹 Test job cleaned up');
    }
    
    console.log('\n📈 DATABASE TEST SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`✅ Connection: Working`);
    console.log(`✅ Read permissions: Working`);
    console.log(`✅ Write permissions: ${insertError ? 'Failed' : 'Working'}`);
    console.log(`📊 Current job count: ${currentJobCount}`);
    console.log(`🔗 Database URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    
    if (!process.env.SCRAPINGBEE_API_KEY) {
      console.log('\n💡 NEXT STEPS:');
      console.log('1. Get a ScrapingBee API key from: https://scrapingbee.com/');
      console.log('2. Add it to your .env.local file as: SCRAPINGBEE_API_KEY=your_api_key_here');
      console.log('3. Run the full scraping test');
      console.log('\n📝 ScrapingBee offers a free tier with 1,000 API calls/month');
    }
    
    // Test if the app is running
    console.log('\n🔍 Testing if Next.js app is running...');
    try {
      const response = await fetch('http://localhost:3000/api/scraping');
      if (response.ok) {
        console.log('✅ Next.js app is running and API endpoint is accessible');
      } else {
        console.log('⚠️ Next.js app might not be running (start with: npm run dev)');
      }
    } catch (fetchError) {
      console.log('⚠️ Next.js app is not running. Start it with: npm run dev');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testDatabase().catch(console.error);