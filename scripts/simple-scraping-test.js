#!/usr/bin/env node

// Simple scraping test that works with existing database structure
require('dotenv').config({ path: '.env.local' });

async function testScrapingWithExistingDB() {
  console.log('🚀 Testing Job Scraping with Current Database...\n');
  
  // Check environment
  if (!process.env.SCRAPINGBEE_API_KEY) {
    console.error('❌ ScrapingBee API key missing');
    return;
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Supabase credentials missing');
    return;
  }
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const { ScrapingBeeClient } = require('scrapingbee');
    
    // Initialize clients
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const scrapingBee = new ScrapingBeeClient(process.env.SCRAPINGBEE_API_KEY);
    
    console.log('✅ Clients initialized successfully');
    
    // Get current job count
    const { data: currentJobs, error: countError } = await supabase
      .from('jobs')
      .select('count', { count: 'exact' });
    
    const initialCount = currentJobs?.[0]?.count || 0;
    console.log(`📊 Initial job count: ${initialCount}`);
    
    // Test 1: Try scraping Indeed Canada with a simple search
    console.log('\n🔍 Test 1: Scraping Indeed Canada...');
    
    try {
      const indeedUrl = 'https://ca.indeed.com/jobs?q=mining+engineer&l=Alberta&fromage=7&limit=10';
      
      const response = await scrapingBee.get({
        url: indeedUrl,
        params: {
          render_js: true,
          premium_proxy: true,
          country_code: 'ca',
          wait: 2000,
          block_ads: true
        }
      });
      
      console.log(`✅ Indeed page scraped (${response.data.length} characters)`);
      
      // Try to parse some basic job info
      const cheerio = require('cheerio');
      const $ = cheerio.load(response.data);
      
      // Look for job cards using multiple selectors
      const jobSelectors = ['[data-jk]', '.jobsearch-SerpJobCard', '.job_seen_beacon'];
      let jobCards = $();
      
      for (const selector of jobSelectors) {
        jobCards = $(selector);
        if (jobCards.length > 0) break;
      }
      
      console.log(`🎯 Found ${jobCards.length} potential job cards`);
      
      // Extract some basic info from first few jobs
      const parsedJobs = [];
      jobCards.slice(0, 3).each((index, element) => {
        const $card = $(element);
        
        const title = $card.find('h2.jobTitle a span[title], .jobTitle a, h2 a span').first().text().trim();
        const company = $card.find('.companyName, span.companyName').first().text().trim();
        const location = $card.find('.companyLocation, [data-testid="job-location"]').first().text().trim();
        
        if (title && company) {
          parsedJobs.push({
            title,
            company,
            location: location || 'Canada',
            province: location.includes('Alberta') ? 'Alberta' : 'Canada',
            sector: 'mining',
            employment_type: 'Full-time',
            description: `${title} position at ${company}`,
            posted_date: new Date().toISOString().split('T')[0],
            is_active: true,
            created_at: new Date().toISOString()
          });
        }
      });
      
      console.log(`📝 Parsed ${parsedJobs.length} jobs successfully`);
      
      if (parsedJobs.length > 0) {
        console.log(`   Sample: "${parsedJobs[0].title}" at ${parsedJobs[0].company}`);
        
        // Try to insert the jobs into database
        console.log('💾 Inserting jobs into database...');
        
        const { data: insertedJobs, error: insertError } = await supabase
          .from('jobs')
          .insert(parsedJobs)
          .select();
        
        if (insertError) {
          console.error('❌ Database insertion failed:', insertError.message);
        } else {
          console.log(`✅ Successfully inserted ${insertedJobs.length} jobs!`);
          console.log(`   Job IDs: ${insertedJobs.map(j => j.id).join(', ')}`);
        }
      }
      
    } catch (indeedError) {
      console.error('❌ Indeed scraping failed:', indeedError.message);
    }
    
    // Test 2: Try Job Bank Canada
    console.log('\n🔍 Test 2: Scraping Job Bank Canada...');
    
    try {
      const jobBankUrl = 'https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=mining';
      
      const jobBankResponse = await scrapingBee.get({
        url: jobBankUrl,
        params: {
          render_js: true,
          wait: 3000,
          country_code: 'ca'
        }
      });
      
      console.log(`✅ Job Bank page scraped (${jobBankResponse.data.length} characters)`);
      
      // Simple parsing for Job Bank
      const cheerio = require('cheerio');
      const $jb = cheerio.load(jobBankResponse.data);
      const jobBankCards = $jb('.job-posting-brief, .job-result').length;
      
      console.log(`🎯 Found ${jobBankCards} potential Job Bank postings`);
      
    } catch (jobBankError) {
      console.error('❌ Job Bank scraping failed:', jobBankError.message);
    }
    
    // Final summary
    console.log('\n📈 SCRAPING TEST SUMMARY:');
    console.log('=' .repeat(50));
    
    const { data: finalJobs, error: finalCountError } = await supabase
      .from('jobs')
      .select('count', { count: 'exact' });
    
    const finalCount = finalJobs?.[0]?.count || 0;
    const newJobs = finalCount - initialCount;
    
    console.log(`📊 Initial jobs: ${initialCount}`);
    console.log(`📊 Final jobs: ${finalCount}`);
    console.log(`📊 New jobs added: ${newJobs}`);
    
    if (newJobs > 0) {
      console.log('🎉 SUCCESS! Jobs were scraped and added to database');
      console.log('💡 Check your deployed job board to see the new listings!');
      
      // Show the newly added jobs
      const { data: recentJobs } = await supabase
        .from('jobs')
        .select('id, title, company, location, created_at')
        .order('created_at', { ascending: false })
        .limit(newJobs);
      
      if (recentJobs) {
        console.log('\n🆕 Newly added jobs:');
        recentJobs.forEach((job, index) => {
          console.log(`   ${index + 1}. "${job.title}" at ${job.company}`);
          console.log(`      📍 ${job.location} | ID: ${job.id}`);
        });
      }
    } else {
      console.log('⚠️ No new jobs were added (this could be due to duplicates or parsing issues)');
    }
    
    console.log('\n✅ Scraping test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testScrapingWithExistingDB().catch(console.error);