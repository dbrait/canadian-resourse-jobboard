import { NextRequest, NextResponse } from 'next/server';
import { getAllJobs as getScrapedJobs, getJobById as getScrapedJobById } from '@/lib/scraper/db';
import { getJobById as getGeneratedJobById, getJobs as getGeneratedJobs } from '../data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find in scraped jobs first
    const scrapedJobs = getScrapedJobs();
    const job = getScrapedJobById(id);

    if (job) {
      // Map scraped job to API format
      const mappedJob = {
        id: job.id,
        title: job.title,
        company: job.company,
        company_slug: job.company_slug,
        location: job.location,
        province: job.province,
        industry: job.industry,
        job_type: job.job_type,
        description: job.description,
        requirements: job.requirements,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        is_remote: job.is_remote,
        is_fly_in_fly_out: job.is_fly_in_fly_out,
        is_featured: false,
        posted_at: job.posted_at,
        source: job.source,
        source_url: job.source_url,
      };

      // Get related jobs (same industry, different job)
      const relatedJobs = scrapedJobs
        .filter(j => j.industry === job.industry && j.id !== job.id)
        .slice(0, 6)
        .map(j => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          industry: j.industry,
          posted_at: j.posted_at,
        }));

      // Get more jobs from same company
      const companyJobs = scrapedJobs
        .filter(j => j.company_slug === job.company_slug && j.id !== job.id)
        .slice(0, 4)
        .map(j => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          industry: j.industry,
          posted_at: j.posted_at,
        }));

      return NextResponse.json({
        job: mappedJob,
        relatedJobs,
        companyJobs,
        dataSource: 'scraped',
      });
    }

    // Fall back to generated jobs
    const generatedJob = getGeneratedJobById(id);

    if (!generatedJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get related jobs from generated data
    const allGeneratedJobs = getGeneratedJobs();
    const relatedJobs = allGeneratedJobs
      .filter(j => j.industry === generatedJob.industry && j.id !== generatedJob.id)
      .slice(0, 6);

    const companyJobs = allGeneratedJobs
      .filter(j => j.company_slug === generatedJob.company_slug && j.id !== generatedJob.id)
      .slice(0, 4);

    return NextResponse.json({
      job: generatedJob,
      relatedJobs,
      companyJobs,
      dataSource: 'generated',
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
