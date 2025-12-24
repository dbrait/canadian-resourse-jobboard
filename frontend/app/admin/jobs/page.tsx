'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Bot,
  User,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  industry: string;
  salary: string;
  postedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'flagged' | 'pending' | 'removed';
  source: 'scraped' | 'employer';
  views: number;
  applications: number;
  flags: number;
}

const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Mining Engineer',
    company: 'Teck Resources',
    location: 'Vancouver, BC',
    industry: 'Mining',
    salary: '$120,000 - $150,000',
    postedAt: '2024-01-10',
    expiresAt: '2024-02-10',
    status: 'active',
    source: 'employer',
    views: 2456,
    applications: 78,
    flags: 0,
  },
  {
    id: '2',
    title: 'Heavy Equipment Operator',
    company: 'Suncor Energy',
    location: 'Fort McMurray, AB',
    industry: 'Oil & Gas',
    salary: '$45/hour',
    postedAt: '2024-01-08',
    expiresAt: '2024-02-08',
    status: 'active',
    source: 'scraped',
    views: 3892,
    applications: 124,
    flags: 0,
  },
  {
    id: '3',
    title: 'Environmental Coordinator',
    company: 'Stantec',
    location: 'Edmonton, AB',
    industry: 'Environmental',
    salary: '$80,000 - $100,000',
    postedAt: '2024-01-05',
    expiresAt: '2024-02-05',
    status: 'active',
    source: 'scraped',
    views: 1234,
    applications: 42,
    flags: 1,
  },
  {
    id: '4',
    title: 'Forestry Technician',
    company: 'West Fraser Timber',
    location: 'Prince George, BC',
    industry: 'Forestry',
    salary: '$55,000 - $70,000',
    postedAt: '2023-12-20',
    expiresAt: '2024-01-20',
    status: 'expired',
    source: 'employer',
    views: 987,
    applications: 28,
    flags: 0,
  },
  {
    id: '5',
    title: 'FAKE JOB - Work From Home $5000/week',
    company: 'Unknown Company',
    location: 'Remote',
    industry: 'Mining',
    salary: '$5,000/week',
    postedAt: '2024-01-12',
    expiresAt: '2024-02-12',
    status: 'flagged',
    source: 'employer',
    views: 456,
    applications: 0,
    flags: 15,
  },
  {
    id: '6',
    title: 'Geologist',
    company: 'Barrick Gold',
    location: 'Toronto, ON',
    industry: 'Mining',
    salary: '$90,000 - $120,000',
    postedAt: '2024-01-14',
    expiresAt: '2024-02-14',
    status: 'pending',
    source: 'employer',
    views: 0,
    applications: 0,
    flags: 0,
  },
  {
    id: '7',
    title: 'Solar Panel Installer',
    company: 'Green Energy Solutions',
    location: 'Calgary, AB',
    industry: 'Renewable Energy',
    salary: '$25-35/hour',
    postedAt: '2024-01-11',
    expiresAt: '2024-02-11',
    status: 'active',
    source: 'scraped',
    views: 567,
    applications: 23,
    flags: 0,
  },
];

export default function AdminJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const getStatusBadge = (status: Job['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      expired: 'bg-gray-100 text-gray-700',
      flagged: 'bg-red-100 text-red-700',
      pending: 'bg-amber-100 text-amber-700',
      removed: 'bg-red-100 text-red-700',
    };
    return styles[status];
  };

  const getSourceIcon = (source: Job['source']) => {
    return source === 'scraped' ? (
      <Bot className="h-4 w-4 text-cyan-500" />
    ) : (
      <User className="h-4 w-4 text-purple-500" />
    );
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || job.source === sourceFilter;
    const matchesIndustry = industryFilter === 'all' || job.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesSource && matchesIndustry;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const industries = Array.from(new Set(jobs.map((j) => j.industry)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Management</h1>
          <p className="mt-1 text-muted-foreground">
            Review and manage all job listings on the platform
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
          <Download className="h-4 w-4" />
          Export Jobs
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Jobs</p>
          <p className="mt-1 text-2xl font-bold">24,567</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Active</p>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="mt-1 text-2xl font-bold">18,234</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1 text-2xl font-bold">45</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Flagged</p>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-1 text-2xl font-bold">12</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Scraped Today</p>
            <Bot className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="mt-1 text-2xl font-bold">1,234</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
            <option value="expired">Expired</option>
            <option value="removed">Removed</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="scraped">Scraped</option>
            <option value="employer">Employer Posted</option>
          </select>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Job</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Source</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Industry</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Views</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Apps</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Posted</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className={`hover:bg-muted/30 ${job.status === 'flagged' ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                >
                  <td className="px-4 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{job.title}</p>
                        {job.flags > 0 && (
                          <span className="flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                            <Flag className="h-3 w-3" />
                            {job.flags}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {getSourceIcon(job.source)}
                      <span className="text-xs text-muted-foreground">
                        {job.source === 'scraped' ? 'Scraped' : 'Posted'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(job.status)}`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">{job.industry}</td>
                  <td className="px-4 py-4 text-right">{job.views.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">{job.applications}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {formatDate(job.postedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowActionMenu(showActionMenu === job.id ? null : job.id)
                        }
                        className="rounded-lg p-2 hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {showActionMenu === job.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-background py-1 shadow-lg">
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                            <Eye className="h-4 w-4" />
                            View Job
                          </button>
                          {job.status === 'pending' && (
                            <>
                              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </button>
                              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <XCircle className="h-4 w-4" />
                                Reject
                              </button>
                            </>
                          )}
                          {job.status === 'flagged' && (
                            <>
                              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                                <CheckCircle className="h-4 w-4" />
                                Clear Flags
                              </button>
                              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                                Remove Job
                              </button>
                            </>
                          )}
                          {job.status === 'active' && (
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
                              <Flag className="h-4 w-4" />
                              Flag for Review
                            </button>
                          )}
                          <hr className="my-1" />
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
          <div className="flex gap-1">
            <button className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              Previous
            </button>
            <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
              1
            </button>
            <button className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              2
            </button>
            <button className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              3
            </button>
            <button className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
