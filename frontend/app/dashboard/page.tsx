'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Bookmark,
  Bell,
  FileText,
  TrendingUp,
  ChevronRight,
  MapPin,
  Building2,
  Clock,
  PartyPopper,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mock data for dashboard
const mockSavedJobs = [
  {
    id: '1',
    title: 'Senior Mining Engineer',
    company_name: 'Teck Resources',
    location: 'Vancouver, BC',
    saved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Drilling Supervisor',
    company_name: 'Suncor Energy',
    location: 'Fort McMurray, AB',
    saved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockAlerts = [
  {
    id: '1',
    name: 'Mining Jobs in BC',
    industry: 'mining',
    location: 'British Columbia',
    frequency: 'daily',
    new_matches: 5,
  },
  {
    id: '2',
    name: 'Remote Environmental Jobs',
    industry: 'environmental',
    location: 'Remote',
    frequency: 'weekly',
    new_matches: 12,
  },
];

const mockRecommendedJobs = [
  {
    id: '3',
    title: 'Environmental Consultant',
    company_name: 'Stantec',
    location: 'Calgary, AB',
    match_score: 95,
    posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Wind Turbine Technician',
    company_name: 'TransAlta',
    location: 'Pincher Creek, AB',
    match_score: 88,
    posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Geologist',
    company_name: 'Barrick Gold',
    location: 'Toronto, ON',
    match_score: 82,
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get('welcome') === 'true';

  return (
    <div className="space-y-6">
      {/* Welcome Banner for New Users */}
      {isNewUser && (
        <div className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <PartyPopper className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">Welcome to ResourcesJobs.ca!</h2>
              <p className="mt-1 text-white/80">
                Your account is ready. Start exploring jobs in Canada&apos;s natural resources sector.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-white/90"
            >
              Browse Jobs
            </Link>
            <Link
              href="/dashboard/alerts"
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Set Up Alerts
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Bookmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockSavedJobs.length}</p>
              <p className="text-sm text-muted-foreground">Saved Jobs</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockAlerts.length}</p>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Applications</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockAlerts.reduce((sum, a) => sum + a.new_matches, 0)}
              </p>
              <p className="text-sm text-muted-foreground">New Matches</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Saved Jobs */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Saved Jobs</h2>
            <Link
              href="/dashboard/saved"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y">
            {mockSavedJobs.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bookmark className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No saved jobs yet</p>
                <Link href="/jobs" className="mt-2 inline-block text-sm text-primary hover:underline">
                  Browse jobs
                </Link>
              </div>
            ) : (
              mockSavedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block p-4 transition-colors hover:bg-muted/50"
                >
                  <h3 className="font-medium">{job.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {job.company_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Saved {formatDistanceToNow(new Date(job.saved_at), { addSuffix: true })}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Job Alerts */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Job Alerts</h2>
            <Link
              href="/dashboard/alerts"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Manage
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y">
            {mockAlerts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No job alerts set up</p>
                <Link
                  href="/dashboard/alerts"
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  Create an alert
                </Link>
              </div>
            ) : (
              mockAlerts.map((alert) => (
                <div key={alert.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{alert.name}</h3>
                    {alert.new_matches > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        {alert.new_matches} new
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {alert.location} &bull; {alert.frequency}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Recommended for You</h2>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all jobs
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y">
          {mockRecommendedJobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
            >
              <div>
                <h3 className="font-medium">{job.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {job.company_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {job.match_score}% match
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
