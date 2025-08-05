import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Basic checks
    const checks = {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPrefix: supabaseUrl?.substring(0, 30),
      projectId: supabaseUrl?.match(/https:\/\/(.+?)\.supabase/)?.[1],
      timestamp: new Date().toISOString()
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        checks
      }, { status: 500 })
    }

    // Try to connect and count jobs
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({
        error: 'Database query failed',
        details: error.message,
        checks
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      activeJobs: count,
      checks
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}