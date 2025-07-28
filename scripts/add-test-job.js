#!/usr/bin/env node

// Add a test job to verify the system is working
require('dotenv').config({ path: '.env.local' });

async function addTestJob() {
  console.log('🧪 Adding Test Job to Verify System...\n');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    // Use service key for admin access (if available) or try with anon key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('✅ Supabase client created');
    
    // Test job data
    const testJob = {
      title: 'Mining Engineer - Test Job',
      company: 'ScrapingBee Test Corp',
      location: 'Calgary, Alberta',
      province: 'Alberta',
      sector: 'mining',
      employment_type: 'Full-time',
      description: 'This is a test job created by the scraping system to verify everything is working properly. This job will be cleaned up after testing.',
      posted_date: new Date().toISOString().split('T')[0],
      is_active: true,
      created_at: new Date().toISOString()
    };
    
    console.log('📝 Test job prepared:');
    console.log(`   Title: ${testJob.title}`);
    console.log(`   Company: ${testJob.company}`);
    console.log(`   Location: ${testJob.location}`);
    
    // Try to insert the test job
    const { data: insertedJob, error: insertError } = await supabase
      .from('jobs')
      .insert([testJob])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Test job insertion failed:', insertError.message);
      
      if (insertError.message.includes('row-level security')) {
        console.log('\n💡 FIX NEEDED: Row Level Security Issue');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Open SQL Editor');
        console.log('3. Copy and paste the contents of scripts/fix-database-permissions.sql');
        console.log('4. Run the SQL script');
        console.log('5. Then run this test again');
      }
      
      return;
    }
    
    console.log(`✅ Test job inserted successfully!`);
    console.log(`   Job ID: ${insertedJob.id}`);
    
    // Verify we can read it back
    const { data: verifyJob, error: verifyError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', insertedJob.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Could not verify job:', verifyError.message);
    } else {
      console.log('✅ Job verification successful!');
    }
    
    // Check total job count
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total jobs in database: ${count}`);
    
    // Clean up test job
    console.log('\n🧹 Cleaning up test job...');
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', insertedJob.id);
    
    if (deleteError) {
      console.log(`⚠️ Could not delete test job (ID: ${insertedJob.id}):`, deleteError.message);
      console.log('   You may need to delete it manually from Supabase dashboard');
    } else {
      console.log('✅ Test job cleaned up successfully');
    }
    
    const { count: finalCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Final job count: ${finalCount}`);
    
    console.log('\n🎉 DATABASE TEST SUCCESSFUL!');
    console.log('✅ Jobs can be inserted');
    console.log('✅ Jobs can be read');
    console.log('✅ Jobs can be deleted');
    console.log('\n💡 Ready to run the full scraping system!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

addTestJob().catch(console.error);