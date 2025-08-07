import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { categorizeJob } from '@/lib/jobCategories'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey.trim())

    // Get request body
    const body = await request.json()
    const { jobId, recategorizeAll } = body

    if (recategorizeAll) {
      // Recategorize all jobs without a category
      const { data: jobs, error: fetchError } = await supabase
        .from('jobs')
        .select('id, title, description')
        .is('job_category', null)

      if (fetchError) {
        throw fetchError
      }

      let categorized = 0
      for (const job of jobs || []) {
        const category = categorizeJob(job.title, job.description || '')
        
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ job_category: category })
          .eq('id', job.id)

        if (!updateError) {
          categorized++
        }
      }

      return NextResponse.json({
        success: true,
        message: `Categorized ${categorized} jobs out of ${jobs?.length || 0} uncategorized jobs`
      })
    } else if (jobId) {
      // Categorize a specific job
      const { data: job, error: fetchError } = await supabase
        .from('jobs')
        .select('title, description')
        .eq('id', jobId)
        .single()

      if (fetchError) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }

      const category = categorizeJob(job.title, job.description || '')
      
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ job_category: category })
        .eq('id', jobId)

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        success: true,
        jobId,
        category,
        message: `Job ${jobId} categorized as ${category}`
      })
    } else {
      return NextResponse.json(
        { error: 'Either jobId or recategorizeAll must be provided' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Categorization error:', error)
    return NextResponse.json(
      { error: 'Failed to categorize jobs' },
      { status: 500 }
    )
  }
}

// GET endpoint to check categorization status
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey.trim())

    // Count categorized vs uncategorized jobs
    const { count: totalJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: uncategorized } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .is('job_category', null)

    const categorized = (totalJobs || 0) - (uncategorized || 0)

    return NextResponse.json({
      totalJobs: totalJobs || 0,
      categorized,
      uncategorized: uncategorized || 0,
      percentCategorized: totalJobs ? Math.round((categorized / totalJobs) * 100) : 0
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check categorization status' },
      { status: 500 }
    )
  }
}