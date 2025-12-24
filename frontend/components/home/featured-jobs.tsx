'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Building2, Clock, DollarSign } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  posted_at: string;
  industry: string;
  is_featured: boolean;
}

const industryBadgeClasses: Record<string, string> = {
  mining: 'badge-mining',
  oil_gas: 'badge-oil-gas',
  forestry: 'badge-forestry',
  fishing: 'badge-fishing',
  agriculture: 'badge-agriculture',
  renewable_energy: 'badge-renewable-energy',
  environmental: 'badge-environmental',
};

const industryNames: Record<string, string> = {
  mining: 'Mining',
  oil_gas: 'Oil & Gas',
  forestry: 'Forestry',
  fishing: 'Fishing',
  agriculture: 'Agriculture',
  renewable_energy: 'Renewable Energy',
  environmental: 'Environmental',
};

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'Competitive';
  if (min && max) {
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  }
  if (min) return `From $${(min / 1000).toFixed(0)}k`;
  if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
  return 'Competitive';
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

export function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setJobs(data.featuredJobs || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border bg-card p-6">
            <div className="mb-4 h-6 w-3/4 rounded bg-muted"></div>
            <div className="mb-2 h-4 w-1/2 rounded bg-muted"></div>
            <div className="h-4 w-2/3 rounded bg-muted"></div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured jobs at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {jobs.slice(0, 6).map((job) => (
        <Link
          key={job.id}
          href={`/jobs/${job.id}`}
          className="group rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="mb-1 text-lg font-semibold group-hover:text-primary">
                {job.title}
              </h3>
              <div className="flex items-center text-muted-foreground">
                <Building2 className="mr-1 h-4 w-4" />
                <span className="text-sm">{job.company}</span>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                industryBadgeClasses[job.industry] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {industryNames[job.industry] || job.industry}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              {job.location}
            </div>
            <div className="flex items-center">
              <DollarSign className="mr-1 h-4 w-4" />
              {formatSalary(job.salary_min, job.salary_max)}
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {timeAgo(job.posted_at)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
