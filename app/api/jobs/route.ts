import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to ensure env vars are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey.trim())

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const sector = searchParams.get('sector')
    const company = searchParams.get('company')
    const province = searchParams.get('province')
    const location = searchParams.get('location')
    const search = searchParams.get('search') // For role/title search
    const employmentType = searchParams.get('employment_type')
    const jobCategory = searchParams.get('job_category')

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Apply filters
    if (sector) {
      query = query.eq('sector', sector)
    }

    if (company) {
      query = query.ilike('company', `%${company}%`)
    }

    if (province) {
      query = query.eq('province', province)
    }

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (search) {
      // Search in title and description
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (employmentType) {
      query = query.eq('employment_type', employmentType)
    }

    if (jobCategory) {
      query = query.eq('job_category', jobCategory)
    }

    // Apply limit
    query = query.limit(Math.min(limit, 100)) // Max 100 jobs per request

    const { data: jobs, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }

    return NextResponse.json(jobs || [])

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}