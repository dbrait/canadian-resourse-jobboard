import Link from 'next/link';
import { JobCard } from './job-card';
import { Pagination } from './pagination';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  province?: string;
  industry: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  is_remote: boolean;
  is_fly_in_fly_out: boolean;
  posted_at: string;
  source: string;
}

interface JobListProps {
  searchParams: Record<string, string | string[] | undefined>;
}

async function getJobs(searchParams: Record<string, string | string[] | undefined>) {
  try {
    // Import the data functions directly for server-side rendering
    const { getAllJobs } = await import('@/lib/scraper/db');
    let jobs = getAllJobs();

    // Apply filters from searchParams
    const industry = searchParams.industry as string | undefined;
    const province = searchParams.province as string | undefined;
    const jobType = searchParams.job_type as string | undefined;
    const search = searchParams.search as string | undefined;
    const isRemote = searchParams.is_remote as string | undefined;

    if (industry) {
      jobs = jobs.filter(job => job.industry === industry);
    }
    if (province) {
      jobs = jobs.filter(job => job.province === province);
    }
    if (jobType) {
      jobs = jobs.filter(job => job.job_type === jobType);
    }
    if (isRemote === 'true') {
      jobs = jobs.filter(job => job.is_remote);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by posted_at descending
    jobs.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());

    // Pagination
    const page = parseInt(searchParams.page as string || '1', 10);
    const limit = parseInt(searchParams.limit as string || '20', 10);
    const start = (page - 1) * limit;
    const paginatedJobs = jobs.slice(start, start + limit);

    // Map response to expected format
    return {
      jobs: paginatedJobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        company_name: job.company,
        location: job.location,
        province: job.province,
        industry: job.industry,
        job_type: job.job_type,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        is_remote: job.is_remote,
        is_fly_in_fly_out: job.is_fly_in_fly_out,
        posted_at: job.posted_at,
        source: job.source,
      })),
      total: jobs.length,
      page: page,
      per_page: limit,
      total_pages: Math.ceil(jobs.length / limit),
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    // Return mock data for development
    return {
      jobs: getMockJobs(),
      total: 4,
      page: 1,
      per_page: 20,
      total_pages: 1,
    };
  }
}

function getMockJobs(): Job[] {
  return [
    {
      id: '1',
      title: 'Senior Mining Engineer',
      company_name: 'Teck Resources',
      location: 'Vancouver, BC',
      province: 'BC',
      industry: 'mining',
      job_type: 'full_time',
      salary_min: 120000,
      salary_max: 160000,
      is_remote: false,
      is_fly_in_fly_out: false,
      posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'workday',
    },
    {
      id: '2',
      title: 'Drilling Supervisor',
      company_name: 'Suncor Energy',
      location: 'Fort McMurray, AB',
      province: 'AB',
      industry: 'oil_gas',
      job_type: 'full_time',
      salary_min: 95000,
      salary_max: 130000,
      is_remote: false,
      is_fly_in_fly_out: true,
      posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'workday',
    },
    {
      id: '3',
      title: 'Environmental Consultant',
      company_name: 'Stantec',
      location: 'Calgary, AB',
      province: 'AB',
      industry: 'environmental',
      job_type: 'full_time',
      salary_min: 75000,
      salary_max: 95000,
      is_remote: true,
      is_fly_in_fly_out: false,
      posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'greenhouse',
    },
    {
      id: '4',
      title: 'Wind Turbine Technician',
      company_name: 'TransAlta',
      location: 'Pincher Creek, AB',
      province: 'AB',
      industry: 'renewable_energy',
      job_type: 'full_time',
      salary_min: 65000,
      salary_max: 85000,
      is_remote: false,
      is_fly_in_fly_out: false,
      posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'lever',
    },
  ];
}

export async function JobList({ searchParams }: JobListProps) {
  const data = await getJobs(searchParams);
  const { jobs, total, page, per_page, total_pages } = data;

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <h3 className="mb-2 text-lg font-semibold">No jobs found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
        <Link
          href="/jobs"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Clear all filters
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {jobs.length} of {total.toLocaleString()} jobs
        </p>
        <select
          className="rounded-md border bg-background px-3 py-1 text-sm"
          defaultValue="recent"
        >
          <option value="recent">Most Recent</option>
          <option value="salary_high">Highest Salary</option>
          <option value="salary_low">Lowest Salary</option>
        </select>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {jobs.map((job: Job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Pagination */}
      {total_pages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={total_pages}
            searchParams={searchParams}
          />
        </div>
      )}
    </div>
  );
}
