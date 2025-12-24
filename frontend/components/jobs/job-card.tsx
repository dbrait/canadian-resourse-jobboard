import Link from 'next/link';
import { MapPin, Building2, Clock, DollarSign, Briefcase, Wifi, Plane } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

const industryLabels: Record<string, string> = {
  mining: 'Mining',
  oil_gas: 'Oil & Gas',
  forestry: 'Forestry',
  fishing: 'Fishing',
  agriculture: 'Agriculture',
  renewable_energy: 'Renewable Energy',
  environmental: 'Environmental',
};

const industryColors: Record<string, string> = {
  mining: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  oil_gas: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  forestry: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  fishing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  agriculture: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
  renewable_energy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  environmental: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

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

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const postedTime = formatDistanceToNow(new Date(job.posted_at), { addSuffix: true });
  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Main Content */}
        <div className="flex-1">
          {/* Title */}
          <h3 className="text-lg font-semibold group-hover:text-primary">
            {job.title}
          </h3>

          {/* Company */}
          <div className="mt-1 flex items-center gap-1 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{job.company_name}</span>
          </div>

          {/* Meta Info */}
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>

            {salary && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{salary}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{jobTypeLabels[job.job_type] || job.job_type}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{postedTime}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {/* Industry Badge */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                industryColors[job.industry] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {industryLabels[job.industry] || job.industry}
            </span>

            {/* Remote Badge */}
            {job.is_remote && (
              <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <Wifi className="h-3 w-3" />
                Remote
              </span>
            )}

            {/* FIFO Badge */}
            {job.is_fly_in_fly_out && (
              <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                <Plane className="h-3 w-3" />
                Fly-in/Fly-out
              </span>
            )}
          </div>
        </div>

        {/* Action Button (visible on hover) */}
        <div className="hidden sm:block">
          <span className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View Job →
          </span>
        </div>
      </div>
    </Link>
  );
}
