import { NextRequest, NextResponse } from 'next/server';
import { getFreshJobs as getScrapedJobs, ScrapedJob } from '@/lib/scraper/db';
import { getJobs as getGeneratedJobs } from './data';

// Map scraped job format to API format
function mapScrapedJob(job: ScrapedJob) {
  return {
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
    is_featured: false, // Scraped jobs aren't featured by default
    posted_at: job.posted_at,
    source: job.source,
    source_url: job.source_url,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Get filter parameters
  const query = searchParams.get('q')?.toLowerCase() || '';
  const industry = searchParams.get('industry');
  const province = searchParams.get('province');
  const jobType = searchParams.get('job_type');
  const remote = searchParams.get('remote');
  const salaryMin = searchParams.get('salary_min');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sort = searchParams.get('sort') || 'newest';
  const source = searchParams.get('source'); // Filter by source

  // Get scraped jobs from database, fall back to generated if none exist
  let scrapedJobs = getScrapedJobs();
  let jobs: any[];

  if (scrapedJobs.length > 0) {
    console.log(`Serving ${scrapedJobs.length} scraped jobs`);
    jobs = scrapedJobs.map(mapScrapedJob);
  } else {
    console.log('No scraped jobs found, using generated data');
    jobs = getGeneratedJobs();
  }

  // Filter by source if specified
  if (source && source !== 'all') {
    jobs = jobs.filter(job => job.source === source);
  }

  // Apply filters
  if (query) {
    jobs = jobs.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      (job.description && job.description.toLowerCase().includes(query))
    );
  }

  if (industry && industry !== 'all') {
    jobs = jobs.filter(job => job.industry === industry);
  }

  if (province && province !== 'all') {
    jobs = jobs.filter(job => job.province === province);
  }

  if (jobType && jobType !== 'all') {
    jobs = jobs.filter(job => job.job_type === jobType);
  }

  if (remote === 'true') {
    jobs = jobs.filter(job => job.is_remote);
  }

  if (salaryMin) {
    const minSalary = parseInt(salaryMin);
    jobs = jobs.filter(job => job.salary_min && job.salary_min >= minSalary);
  }

  // Sort
  switch (sort) {
    case 'newest':
      jobs.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
      break;
    case 'oldest':
      jobs.sort((a, b) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime());
      break;
    case 'salary_high':
      jobs.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
      break;
    case 'salary_low':
      jobs.sort((a, b) => (a.salary_min || 999999) - (b.salary_min || 999999));
      break;
    case 'relevance':
    default:
      // Featured jobs first, then by date
      jobs.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
      });
  }

  // Calculate stats
  const total = jobs.length;
  const totalPages = Math.ceil(total / limit);

  // Paginate
  const startIndex = (page - 1) * limit;
  const paginatedJobs = jobs.slice(startIndex, startIndex + limit);

  // Get facet counts from all jobs (not filtered)
  const allJobs = scrapedJobs.length > 0 ? scrapedJobs.map(mapScrapedJob) : getGeneratedJobs();

  const industryCounts = allJobs.reduce((acc, job) => {
    acc[job.industry] = (acc[job.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const provinceCounts = allJobs.reduce((acc, job) => {
    acc[job.province] = (acc[job.province] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceCounts = allJobs.reduce((acc, job) => {
    const src = job.source || 'unknown';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    jobs: paginatedJobs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    facets: {
      industries: industryCounts,
      provinces: provinceCounts,
      sources: sourceCounts,
    },
    meta: {
      dataSource: scrapedJobs.length > 0 ? 'scraped' : 'generated',
      totalScrapedJobs: scrapedJobs.length,
    },
  });
}
