'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pencil,
  Trash2,
  Copy,
  Pause,
  Play,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string;
  status: 'active' | 'paused' | 'expired' | 'draft';
  applicants: number;
  views: number;
  posted_at: string;
  expires_at: string;
  is_featured: boolean;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Mining Engineer',
    location: 'Vancouver, BC',
    job_type: 'full_time',
    status: 'active',
    applicants: 23,
    views: 456,
    posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
  },
  {
    id: '2',
    title: 'Environmental Coordinator',
    location: 'Calgary, AB',
    job_type: 'full_time',
    status: 'active',
    applicants: 18,
    views: 312,
    posted_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
  },
  {
    id: '3',
    title: 'Heavy Equipment Operator',
    location: 'Fort McMurray, AB',
    job_type: 'full_time',
    status: 'active',
    applicants: 45,
    views: 892,
    posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
  },
  {
    id: '4',
    title: 'Safety Supervisor',
    location: 'Edmonton, AB',
    job_type: 'full_time',
    status: 'paused',
    applicants: 12,
    views: 234,
    posted_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
  },
  {
    id: '5',
    title: 'Geologist',
    location: 'Toronto, ON',
    job_type: 'contract',
    status: 'expired',
    applicants: 29,
    views: 526,
    posted_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
  },
  {
    id: '6',
    title: 'Project Manager',
    location: 'Vancouver, BC',
    job_type: 'full_time',
    status: 'draft',
    applicants: 0,
    views: 0,
    posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
  },
];

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertCircle },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: Clock },
};

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  temporary: 'Temporary',
  internship: 'Internship',
};

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            status: job.status === 'active' ? 'paused' : 'active',
          };
        }
        return job;
      })
    );
    setOpenMenu(null);
  };

  const handleDelete = (jobId: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    }
    setOpenMenu(null);
  };

  const stats = {
    active: jobs.filter((j) => j.status === 'active').length,
    paused: jobs.filter((j) => j.status === 'paused').length,
    expired: jobs.filter((j) => j.status === 'expired').length,
    draft: jobs.filter((j) => j.status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Postings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your job listings and track performance
          </p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Post New Job
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          All ({jobs.length})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          Active ({stats.active})
        </button>
        <button
          onClick={() => setStatusFilter('paused')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === 'paused'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
          }`}
        >
          Paused ({stats.paused})
        </button>
        <button
          onClick={() => setStatusFilter('expired')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === 'expired'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          Expired ({stats.expired})
        </button>
        <button
          onClick={() => setStatusFilter('draft')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === 'draft'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Drafts ({stats.draft})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search job postings..."
          className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Jobs Table */}
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Job Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Applicants</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Views</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Posted</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Expires</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No job postings found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const status = statusConfig[job.status];
                  const StatusIcon = status.icon;
                  const daysUntilExpiry = Math.ceil(
                    (new Date(job.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={job.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <div>
                          <Link
                            href={`/employer/jobs/${job.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {job.title}
                          </Link>
                          {job.is_featured && (
                            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                              Featured
                            </span>
                          )}
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {job.location} &bull; {jobTypeLabels[job.job_type]}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          href={`/employer/jobs/${job.id}/applicants`}
                          className="inline-flex items-center gap-1 text-sm hover:text-primary"
                        >
                          <Users className="h-4 w-4" />
                          {job.applicants}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          {job.views}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {format(new Date(job.posted_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-4">
                        {job.status === 'expired' ? (
                          <span className="text-sm text-red-600">Expired</span>
                        ) : (
                          <span
                            className={`text-sm ${
                              daysUntilExpiry <= 7 ? 'text-amber-600' : 'text-muted-foreground'
                            }`}
                          >
                            {daysUntilExpiry} days left
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === job.id ? null : job.id)}
                            className="rounded-lg p-2 hover:bg-muted"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenu === job.id && (
                            <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border bg-card py-1 shadow-lg">
                              <Link
                                href={`/employer/jobs/${job.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </Link>
                              <Link
                                href={`/employer/jobs/${job.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Link>
                              <Link
                                href={`/employer/jobs/${job.id}/applicants`}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                              >
                                <Users className="h-4 w-4" />
                                View Applicants
                              </Link>
                              <button
                                onClick={() => handleToggleStatus(job.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                              >
                                {job.status === 'active' ? (
                                  <>
                                    <Pause className="h-4 w-4" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </button>
                              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                                <Copy className="h-4 w-4" />
                                Duplicate
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => handleDelete(job.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
