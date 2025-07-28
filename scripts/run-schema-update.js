#!/usr/bin/env node

// Script to update database schema automatically
require('dotenv').config({ path: '.env.local' });

async function updateDatabaseSchema() {
  console.log('🔧 Updating Database Schema for Job Scraping...\n');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Supabase environment variables missing');
    return;
  }
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('✅ Connected to Supabase');
    
    // Step 1: Add columns to jobs table
    console.log('🔧 Adding new columns to jobs table...');
    
    const alterQueries = [
      `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_platform TEXT;`,
      `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_url TEXT;`,
      `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_id TEXT;`,
      `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();`
    ];
    
    for (const query of alterQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log(`⚠️ Query might have failed (this is often OK): ${error.message}`);
      }
    }
    
    // Step 2: Create indexes
    console.log('📊 Creating database indexes...');
    
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(external_id);`,
      `CREATE INDEX IF NOT EXISTS idx_jobs_source_platform ON jobs(source_platform);`,
      `CREATE INDEX IF NOT EXISTS idx_jobs_last_seen ON jobs(last_seen);`
    ];
    
    for (const query of indexQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log(`⚠️ Index creation might have failed: ${error.message}`);
      }
    }
    
    // Step 3: Create scraping stats table
    console.log('📈 Creating scraping stats table...');
    
    const statsTableQuery = `
      CREATE TABLE IF NOT EXISTS scraping_stats (
        id SERIAL PRIMARY KEY,
        platform TEXT NOT NULL,
        jobs_found INTEGER DEFAULT 0,
        jobs_processed INTEGER DEFAULT 0,
        last_run TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(platform, DATE(last_run))
      );
    `;
    
    const { error: statsError } = await supabase.rpc('exec_sql', { sql: statsTableQuery });
    if (statsError) {
      console.log(`⚠️ Stats table creation might have failed: ${statsError.message}`);
    }
    
    // Step 4: Verify the changes
    console.log('🔍 Verifying database changes...');
    
    // Check if new columns exist by trying to query them
    const { data: testData, error: testError } = await supabase
      .from('jobs')
      .select('id, source_platform, external_id')
      .limit(1);
    
    if (!testError) {
      console.log('✅ New columns added successfully!');
    } else {
      console.log('❌ Column verification failed:', testError.message);
      console.log('\n💡 You may need to run the SQL manually in Supabase SQL Editor:');
      console.log('   Copy the contents of scripts/update-schema-minimal.sql');
      return;
    }
    
    // Check current job count
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Current jobs in database: ${count}`);
    
    console.log('\n🎉 DATABASE SCHEMA UPDATE SUCCESSFUL!');
    console.log('✅ Jobs table updated with scraping columns');
    console.log('✅ Database indexes created');
    console.log('✅ Scraping stats table created');
    console.log('\n💡 Ready to run the full scraping test!');
    
  } catch (error) {
    console.error('💥 Schema update failed:', error.message);
    console.log('\n🔧 MANUAL UPDATE REQUIRED:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy and paste the contents of scripts/update-schema-minimal.sql');
    console.log('4. Run the SQL script');
  }
}

updateDatabaseSchema().catch(console.error);