import { Suspense } from 'react';
import { Metadata } from 'next';
import { JobList } from '@/components/jobs/job-list';
import { JobFilters } from '@/components/jobs/job-filters';
import { SearchBar } from '@/components/search/search-bar';
import { JobListSkeleton } from '@/components/jobs/job-list-skeleton';

export const metadata: Metadata = {
  title: 'Browse Jobs',
  description:
    'Search and browse jobs in Canada\'s natural resources sector. Filter by industry, location, salary, and more.',
};

interface JobsPageProps {
  searchParams: {
    q?: string;
    industry?: string | string[];
    province?: string;
    job_type?: string | string[];
    salary_min?: string;
    salary_max?: string;
    is_remote?: string;
    page?: string;
  };
}

export default function JobsPage({ searchParams }: JobsPageProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
            Find Your Next Opportunity
          </h1>
          <SearchBar />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 lg:flex-shrink-0">
            <div className="sticky top-20">
              <JobFilters searchParams={searchParams} />
            </div>
          </aside>

          {/* Job Listings */}
          <main className="flex-1">
            <Suspense fallback={<JobListSkeleton />}>
              <JobList searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
