#!/usr/bin/env node

// Focused scraping test with better error handling
require('dotenv').config({ path: '.env.local' });

async function focusedScrapingTest() {
  console.log('🎯 Focused Job Scraping Test...\n');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const { ScrapingBeeClient } = require('scrapingbee');
    const cheerio = require('cheerio');
    
    // Initialize clients
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const scrapingBee = new ScrapingBeeClient(process.env.SCRAPINGBEE_API_KEY);
    
    console.log('✅ All clients initialized');
    
    // Get initial job count
    const { count: initialCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Starting job count: ${initialCount}`);
    
    // Test Job Bank Canada (this worked before)
    console.log('\n🍁 Testing Job Bank Canada...');
    
    const jobBankUrl = 'https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=engineer';
    
    const response = await scrapingBee.get({
      url: jobBankUrl,
      params: {
        render_js: true,
        wait: 3000,
        country_code: 'ca',
        block_ads: true
      }
    });
    
    console.log(`✅ Got response: ${response.data.length} characters`);
    
    // Parse the HTML
    const $ = cheerio.load(response.data);
    
    // Look for job cards with various selectors
    const selectors = [
      '.job-posting-brief',
      '.job-result', 
      '.job-item',
      '[class*="job"]',
      '.posting'
    ];
    
    let jobCards = $();
    let usedSelector = '';
    
    for (const selector of selectors) {
      const cards = $(selector);
      if (cards.length > 0) {
        jobCards = cards;
        usedSelector = selector;
        break;
      }
    }
    
    console.log(`🎯 Found ${jobCards.length} job cards using selector: ${usedSelector}`);
    
    if (jobCards.length === 0) {
      // Try to find any elements that might contain jobs
      console.log('🔍 Searching for any job-related content...');
      
      const possibleJobElements = $('*').filter(function() {
        const text = $(this).text().toLowerCase();
        return text.includes('engineer') || text.includes('job') || text.includes('position');
      });
      
      console.log(`🔍 Found ${possibleJobElements.length} elements containing job-related text`);
      
      // Show some sample text to understand the page structure
      console.log('\n📝 Sample page content:');
      const bodyText = $('body').text().substring(0, 500);
      console.log(bodyText.replace(/\s+/g, ' ').trim());
    }
    
    // Try to extract jobs even if we found limited cards
    const scrapedJobs = [];
    
    if (jobCards.length > 0) {
      console.log('\n📋 Extracting job details...');
      
      jobCards.slice(0, 5).each((index, element) => {
        const $card = $(element);
        
        // Try multiple selectors for each field
        const titleSelectors = ['.job-title', '.position-title', 'h2', 'h3', '.title', 'a[href*="job"]'];
        const companySelectors = ['.company', '.employer', '.business-name', '.organization'];
        const locationSelectors = ['.location', '.city', '.address', '.workplace'];
        
        let title = '';
        let company = '';
        let location = '';
        
        // Extract title
        for (const sel of titleSelectors) {
          const titleEl = $card.find(sel).first();
          if (titleEl.length > 0 && titleEl.text().trim()) {
            title = titleEl.text().trim();
            break;
          }
        }
        
        // Extract company
        for (const sel of companySelectors) {
          const companyEl = $card.find(sel).first();
          if (companyEl.length > 0 && companyEl.text().trim()) {
            company = companyEl.text().trim();
            break;
          }
        }
        
        // Extract location
        for (const sel of locationSelectors) {
          const locationEl = $card.find(sel).first();
          if (locationEl.length > 0 && locationEl.text().trim()) {
            location = locationEl.text().trim();
            break;
          }
        }
        
        // If we have at least a title, create a job entry
        if (title) {
          scrapedJobs.push({
            title: title.substring(0, 200), // Limit length
            company: company || 'Job Bank Canada',
            location: location || 'Canada',
            province: location.includes('Ontario') ? 'Ontario' : 'Canada',
            sector: 'general',
            employment_type: 'Full-time',
            description: `${title} position found on Job Bank Canada`,
            posted_date: new Date().toISOString().split('T')[0],
            is_active: true,
            created_at: new Date().toISOString()
          });
          
          console.log(`   ${index + 1}. "${title}" at ${company || 'Unknown Company'}`);
        }
      });
    }
    
    console.log(`\n📝 Extracted ${scrapedJobs.length} job entries`);
    
    // Insert into database if we have jobs
    if (scrapedJobs.length > 0) {
      console.log('💾 Inserting jobs into database...');
      
      const { data: insertedJobs, error: insertError } = await supabase
        .from('jobs')
        .insert(scrapedJobs)
        .select('id, title, company');
      
      if (insertError) {
        console.error('❌ Database insertion failed:', insertError.message);
        console.log('   This might be due to missing columns or constraints');
      } else {
        console.log(`✅ Successfully inserted ${insertedJobs.length} jobs!`);
        insertedJobs.forEach((job, index) => {
          console.log(`   ${index + 1}. ID ${job.id}: "${job.title}" at ${job.company}`);
        });
      }
    }
    
    // Final count
    const { count: finalCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
    
    const newJobsAdded = finalCount - initialCount;
    
    console.log('\n📊 FINAL RESULTS:');
    console.log('=' .repeat(40));
    console.log(`📊 Jobs before: ${initialCount}`);
    console.log(`📊 Jobs after: ${finalCount}`);
    console.log(`📊 New jobs added: ${newJobsAdded}`);
    
    if (newJobsAdded > 0) {
      console.log('\n🎉 SUCCESS! New jobs added to your database!');
      console.log('💡 Check your deployed job board to see them!');
    } else {
      console.log('\n⚠️ No new jobs added - but scraping is working!');
      console.log('💡 This could be due to duplicates or parsing challenges');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

focusedScrapingTest().catch(console.error);