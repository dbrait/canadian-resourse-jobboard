import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Get total active jobs
    const { count: totalJobs, error: totalError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (totalError) {
      throw totalError
    }

    // Get jobs by sector
    const { data: sectorData, error: sectorError } = await supabase
      .from('jobs')
      .select('sector')
      .eq('is_active', true)

    if (sectorError) {
      throw sectorError
    }

    const sectorStats = sectorData?.reduce((acc: Record<string, number>, job) => {
      acc[job.sector] = (acc[job.sector] || 0) + 1
      return acc
    }, {}) || {}

    // Get jobs by province
    const { data: provinceData, error: provinceError } = await supabase
      .from('jobs')
      .select('province')
      .eq('is_active', true)

    if (provinceError) {
      throw provinceError
    }

    const provinceStats = provinceData?.reduce((acc: Record<string, number>, job) => {
      acc[job.province] = (acc[job.province] || 0) + 1
      return acc
    }, {}) || {}

    // Get recent jobs (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentJobs, error: recentError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', sevenDaysAgo.toISOString())

    if (recentError) {
      throw recentError
    }

    const stats = {
      totalJobs: totalJobs || 0,
      recentJobs: recentJobs || 0,
      sectorBreakdown: sectorStats,
      provinceBreakdown: provinceStats,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job statistics' },
      { status: 500 }
    )
  }
}