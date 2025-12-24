'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Bookmark,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Trash2,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SavedJob {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  industry: string;
  saved_at: string;
  posted_at: string;
  source_url?: string;
}

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  temporary: 'Temporary',
  internship: 'Internship',
};

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return '';

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  });

  if (min && max && min !== max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  return formatter.format(min || max || 0);
}

// Mock saved jobs data
const mockSavedJobs: SavedJob[] = [
  {
    id: '1',
    title: 'Senior Mining Engineer',
    company_name: 'Teck Resources',
    location: 'Vancouver, BC',
    job_type: 'full_time',
    salary_min: 120000,
    salary_max: 160000,
    industry: 'mining',
    saved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source_url: 'https://example.com/job/1',
  },
  {
    id: '2',
    title: 'Drilling Supervisor',
    company_name: 'Suncor Energy',
    location: 'Fort McMurray, AB',
    job_type: 'full_time',
    salary_min: 95000,
    salary_max: 130000,
    industry: 'oil_gas',
    saved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Environmental Consultant',
    company_name: 'Stantec',
    location: 'Calgary, AB',
    job_type: 'full_time',
    salary_min: 75000,
    salary_max: 95000,
    industry: 'environmental',
    saved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function SavedJobsPage() {
  const { data: session } = useSession();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(mockSavedJobs);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleRemove = async (jobId: string) => {
    setIsDeleting(jobId);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
    setIsDeleting(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Saved Jobs</h1>
        <p className="mt-1 text-muted-foreground">
          Jobs you&apos;ve saved for later. {savedJobs.length} job{savedJobs.length !== 1 && 's'} saved.
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Bookmark className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <h2 className="mb-2 text-lg font-semibold">No saved jobs</h2>
          <p className="mb-4 text-muted-foreground">
            Save jobs you&apos;re interested in to review them later
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Briefcase className="h-4 w-4" />
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border bg-card p-5 transition-all hover:border-primary/50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <Link href={`/jobs/${job.id}`} className="group">
                    <h2 className="text-lg font-semibold group-hover:text-primary">
                      {job.title}
                    </h2>
                  </Link>

                  <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{job.company_name}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>

                    {job.salary_min && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{jobTypeLabels[job.job_type] || job.job_type}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Posted {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Saved {formatDistanceToNow(new Date(job.saved_at), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    View Job
                  </Link>

                  {job.source_url && (
                    <a
                      href={job.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Apply
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  <button
                    onClick={() => handleRemove(job.id)}
                    disabled={isDeleting === job.id}
                    className="rounded-lg border p-2 text-muted-foreground hover:border-destructive hover:text-destructive disabled:opacity-50"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
