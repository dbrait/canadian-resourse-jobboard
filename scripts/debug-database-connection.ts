#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

async function debugDatabaseConnection() {
  console.log('🔍 Debugging Database Connection')
  console.log('================================================')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Environment Variables:')
  console.log(`  SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Not set'}`)
  console.log(`  SUPABASE_KEY: ${supabaseKey ? '✅ Set' : '❌ Not set'}`)
  console.log(`  URL starts with: ${supabaseUrl?.substring(0, 30)}...`)
  console.log(`  Project ID: ${supabaseUrl?.match(/https:\/\/(.+?)\.supabase/)?.[1]}`)

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!')
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Count jobs
    console.log('\n📊 Test 1: Counting jobs in database...')
    const { count: totalCount, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error counting jobs:', countError)
    } else {
      console.log(`✅ Total jobs in database: ${totalCount}`)
    }

    // Test 2: Count active jobs
    console.log('\n📊 Test 2: Counting active jobs...')
    const { count: activeCount, error: activeError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (activeError) {
      console.error('❌ Error counting active jobs:', activeError)
    } else {
      console.log(`✅ Active jobs: ${activeCount}`)
    }

    // Test 3: Get sample jobs
    console.log('\n📊 Test 3: Fetching sample jobs...')
    const { data: sampleJobs, error: sampleError } = await supabase
      .from('jobs')
      .select('id, title, company, is_active, created_at')
      .limit(5)
      .order('created_at', { ascending: false })

    if (sampleError) {
      console.error('❌ Error fetching sample jobs:', sampleError)
    } else {
      console.log(`✅ Found ${sampleJobs?.length || 0} jobs:`)
      sampleJobs?.forEach((job, i) => {
        console.log(`   ${i + 1}. [${job.id}] ${job.title} at ${job.company} (Active: ${job.is_active})`)
      })
    }

    // Test 4: Check table structure
    console.log('\n📊 Test 4: Checking table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('jobs')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Error checking table structure:', tableError)
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Table columns:', Object.keys(tableInfo[0]))
    }

  } catch (error) {
    console.error('❌ Fatal error:', error)
  }

  console.log('\n================================================')
  console.log('🔗 Vercel Environment Variables to Set:')
  console.log('================================================')
  console.log('NEXT_PUBLIC_SUPABASE_URL=' + supabaseUrl)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=' + supabaseKey)
  console.log('\nMake sure these EXACT values are set in:')
  console.log('Vercel Dashboard > Project Settings > Environment Variables')
}

// Run the debug script
debugDatabaseConnection().catch(console.error)