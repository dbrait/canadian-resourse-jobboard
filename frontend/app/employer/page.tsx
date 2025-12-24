'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mock data for employer dashboard
const mockStats = {
  activeJobs: 5,
  totalApplicants: 127,
  totalViews: 3420,
  viewsChange: 12.5,
};

const mockJobs = [
  {
    id: '1',
    title: 'Senior Mining Engineer',
    status: 'active',
    applicants: 23,
    views: 456,
    posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Environmental Coordinator',
    status: 'active',
    applicants: 18,
    views: 312,
    posted_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Heavy Equipment Operator',
    status: 'active',
    applicants: 45,
    views: 892,
    posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Safety Supervisor',
    status: 'paused',
    applicants: 12,
    views: 234,
    posted_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Geologist',
    status: 'expired',
    applicants: 29,
    views: 526,
    posted_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockRecentApplicants = [
  {
    id: '1',
    name: 'John Smith',
    job_title: 'Senior Mining Engineer',
    applied_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    job_title: 'Heavy Equipment Operator',
    applied_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: '3',
    name: 'Michael Chen',
    job_title: 'Environmental Coordinator',
    applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'reviewed',
  },
  {
    id: '4',
    name: 'Emily Davis',
    job_title: 'Senior Mining Engineer',
    applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'interviewed',
  },
];

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertCircle },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: Clock },
};

const applicantStatusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  reviewed: { label: 'Reviewed', color: 'bg-purple-100 text-purple-700' },
  interviewed: { label: 'Interviewed', color: 'bg-amber-100 text-amber-700' },
  offered: { label: 'Offered', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export default function EmployerDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold">Employer Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your job postings and track applicants
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockStats.activeJobs}</p>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockStats.totalApplicants}</p>
              <p className="text-sm text-muted-foreground">Total Applicants</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">+{mockStats.viewsChange}%</p>
              <p className="text-sm text-muted-foreground">Views This Week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Job Postings */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Job Postings</h2>
            <Link
              href="/employer/jobs"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y">
            {mockJobs.slice(0, 4).map((job) => {
              const status = statusConfig[job.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              return (
                <Link
                  key={job.id}
                  href={`/employer/jobs/${job.id}`}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{job.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{job.applicants} applicants</span>
                      <span>{job.views} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="border-t p-4">
            <Link
              href="/employer/jobs/new"
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              Post New Job
            </Link>
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Recent Applicants</h2>
            <Link
              href="/employer/applicants"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y">
            {mockRecentApplicants.map((applicant) => {
              const status = applicantStatusConfig[applicant.status as keyof typeof applicantStatusConfig];
              return (
                <Link
                  key={applicant.id}
                  href={`/employer/applicants/${applicant.id}`}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-medium">
                        {applicant.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{applicant.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {applicant.job_title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(applicant.applied_at), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h3 className="font-semibold">Tips to Attract More Candidates</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            Include salary ranges to increase application rates by 30%
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            Add detailed job descriptions with clear requirements
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            Highlight benefits and company culture to stand out
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            Respond to applicants within 48 hours for better engagement
          </li>
        </ul>
      </div>
    </div>
  );
}
