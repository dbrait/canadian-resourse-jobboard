import { NextRequest, NextResponse } from 'next/server';
import { companies, getJobs } from '../jobs/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const industry = searchParams.get('industry');
  const query = searchParams.get('q')?.toLowerCase();

  let filteredCompanies = [...companies];

  // Apply filters
  if (industry && industry !== 'all') {
    filteredCompanies = filteredCompanies.filter(c => c.industry === industry);
  }

  if (query) {
    filteredCompanies = filteredCompanies.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.location.toLowerCase().includes(query)
    );
  }

  // Add job counts
  const jobs = getJobs();
  const companiesWithStats = filteredCompanies.map(company => {
    const companyJobs = jobs.filter(j => j.company_slug === company.slug);
    return {
      ...company,
      job_count: companyJobs.length,
      active_jobs: companyJobs.filter(j => new Date(j.expires_at) > new Date()).length,
    };
  });

  // Sort by job count
  companiesWithStats.sort((a, b) => b.job_count - a.job_count);

  return NextResponse.json({
    companies: companiesWithStats,
    total: companiesWithStats.length,
  });
}
