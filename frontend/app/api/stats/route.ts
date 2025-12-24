import { NextResponse } from 'next/server';
import { getAllJobs as getScrapedJobs, getStats as getScrapedStats } from '@/lib/scraper/db';
import { getJobs as getGeneratedJobs, companies } from '../jobs/data';

export async function GET() {
  const scrapedJobs = getScrapedJobs();
  const useScrapedData = scrapedJobs.length > 0;

  // Use scraped jobs if available, otherwise fall back to generated
  const jobs = useScrapedData
    ? scrapedJobs.map(j => ({
        id: j.id,
        title: j.title,
        company: j.company,
        company_slug: j.company_slug,
        location: j.location,
        province: j.province,
        industry: j.industry,
        job_type: j.job_type,
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        is_remote: j.is_remote,
        is_featured: false,
        posted_at: j.posted_at,
        source: j.source,
      }))
    : getGeneratedJobs();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Calculate stats
  const activeJobs = jobs.filter(j => new Date(j.posted_at) > thirtyDaysAgo);

  const jobsByIndustry = jobs.reduce((acc, job) => {
    acc[job.industry] = (acc[job.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobsByProvince = jobs.reduce((acc, job) => {
    if (job.province) {
      acc[job.province] = (acc[job.province] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const jobsBySource = useScrapedData
    ? jobs.reduce((acc, job: any) => {
        const src = job.source || 'unknown';
        acc[src] = (acc[src] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};

  // Get unique companies from jobs
  const uniqueCompanies = new Set(jobs.map(j => j.company_slug));

  // Featured jobs (for scraped data, show most recent)
  const featuredJobs = useScrapedData
    ? [...jobs]
        .sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())
        .slice(0, 6)
    : jobs.filter(j => j.is_featured).slice(0, 6);

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())
    .slice(0, 10);

  // Company stats
  const companyJobCounts = jobs.reduce((acc, job) => {
    acc[job.company_slug] = (acc[job.company_slug] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyJobCounts)
    .map(([slug, count]) => {
      const job = jobs.find(j => j.company_slug === slug);
      return {
        slug,
        name: job?.company || slug,
        job_count: count,
        industry: job?.industry || 'unknown',
      };
    })
    .sort((a, b) => b.job_count - a.job_count)
    .slice(0, 8);

  return NextResponse.json({
    stats: {
      total_jobs: jobs.length,
      active_jobs: activeJobs.length,
      total_companies: uniqueCompanies.size,
      total_industries: Object.keys(jobsByIndustry).length,
    },
    jobsByIndustry,
    jobsByProvince,
    jobsBySource,
    featuredJobs,
    recentJobs,
    topCompanies,
    meta: {
      dataSource: useScrapedData ? 'scraped' : 'generated',
      totalScrapedJobs: scrapedJobs.length,
      lastUpdated: useScrapedData && scrapedJobs.length > 0
        ? scrapedJobs[0].scraped_at
        : null,
    },
  });
}
