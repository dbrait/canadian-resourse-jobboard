'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Star,
  StarOff,
  ChevronDown,
  Download,
  MoreVertical,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  job_id: string;
  job_title: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  applied_at: string;
  resume_url?: string;
  cover_letter?: string;
  is_starred: boolean;
  experience_years?: number;
  skills?: string[];
  notes?: string;
}

const mockApplicants: Applicant[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 604-555-0123',
    location: 'Vancouver, BC',
    job_id: '1',
    job_title: 'Senior Mining Engineer',
    status: 'new',
    applied_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resume_url: '#',
    is_starred: true,
    experience_years: 8,
    skills: ['Mine Planning', 'AutoCAD', 'Project Management'],
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 403-555-0456',
    location: 'Calgary, AB',
    job_id: '3',
    job_title: 'Heavy Equipment Operator',
    status: 'new',
    applied_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    resume_url: '#',
    is_starred: false,
    experience_years: 5,
    skills: ['CAT Equipment', 'Safety Certified', 'WHMIS'],
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    location: 'Edmonton, AB',
    job_id: '2',
    job_title: 'Environmental Coordinator',
    status: 'reviewed',
    applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resume_url: '#',
    is_starred: false,
    experience_years: 4,
    skills: ['EIA', 'GIS', 'Environmental Compliance'],
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '+1 778-555-0789',
    location: 'Victoria, BC',
    job_id: '1',
    job_title: 'Senior Mining Engineer',
    status: 'shortlisted',
    applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resume_url: '#',
    is_starred: true,
    experience_years: 10,
    skills: ['Mining Operations', 'Team Leadership', 'Deswik'],
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'dwilson@email.com',
    location: 'Toronto, ON',
    job_id: '5',
    job_title: 'Geologist',
    status: 'interviewed',
    applied_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resume_url: '#',
    is_starred: false,
    experience_years: 6,
    skills: ['Exploration', 'Core Logging', 'Leapfrog'],
  },
  {
    id: '6',
    name: 'Jennifer Brown',
    email: 'jbrown@email.com',
    phone: '+1 587-555-0321',
    location: 'Fort McMurray, AB',
    job_id: '3',
    job_title: 'Heavy Equipment Operator',
    status: 'offered',
    applied_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    resume_url: '#',
    is_starred: true,
    experience_years: 12,
    skills: ['Haul Trucks', 'Dozers', 'Graders'],
  },
  {
    id: '7',
    name: 'Robert Taylor',
    email: 'rtaylor@email.com',
    location: 'Saskatoon, SK',
    job_id: '1',
    job_title: 'Senior Mining Engineer',
    status: 'rejected',
    applied_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    resume_url: '#',
    is_starred: false,
    experience_years: 3,
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  reviewed: { label: 'Reviewed', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  shortlisted: { label: 'Shortlisted', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  interviewed: { label: 'Interviewed', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  offered: { label: 'Offered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  hired: { label: 'Hired', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);

  // Get unique jobs for filter
  const uniqueJobs = Array.from(
    new Map(applicants.map((a) => [a.job_id, { id: a.job_id, title: a.job_title }])).values()
  );

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
    const matchesJob = jobFilter === 'all' || applicant.job_id === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

  const handleToggleStar = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_starred: !a.is_starred } : a))
    );
  };

  const handleStatusChange = (id: string, newStatus: Applicant['status']) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const handleSelectAll = () => {
    if (selectedApplicants.length === filteredApplicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(filteredApplicants.map((a) => a.id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedApplicants((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const stats = {
    total: applicants.length,
    new: applicants.filter((a) => a.status === 'new').length,
    shortlisted: applicants.filter((a) => a.status === 'shortlisted').length,
    interviewed: applicants.filter((a) => a.status === 'interviewed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applicants</h1>
        <p className="mt-1 text-muted-foreground">
          Manage and track all job applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Applicants</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          <p className="text-sm text-muted-foreground">New</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.shortlisted}</p>
          <p className="text-sm text-muted-foreground">Shortlisted</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-600">{stats.interviewed}</p>
          <p className="text-sm text-muted-foreground">Interviewed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Statuses</option>
          {Object.entries(statusConfig).map(([value, config]) => (
            <option key={value} value={value}>
              {config.label}
            </option>
          ))}
        </select>

        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Jobs</option>
          {uniqueJobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        {selectedApplicants.length > 0 && (
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Export ({selectedApplicants.length})
          </button>
        )}
      </div>

      {/* Applicants Table */}
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedApplicants.length === filteredApplicants.length &&
                      filteredApplicants.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Applicant</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Job</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Applied</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No applicants found
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => {
                  const status = statusConfig[applicant.status];
                  return (
                    <tr key={applicant.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedApplicants.includes(applicant.id)}
                          onChange={() => handleSelect(applicant.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleStar(applicant.id)}
                            className="text-muted-foreground hover:text-amber-500"
                          >
                            {applicant.is_starred ? (
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </button>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <span className="text-sm font-medium">
                              {applicant.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </span>
                          </div>
                          <div>
                            <Link
                              href={`/employer/applicants/${applicant.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {applicant.name}
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {applicant.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/employer/jobs/${applicant.job_id}`}
                          className="text-sm hover:text-primary"
                        >
                          {applicant.job_title}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative inline-block">
                          <select
                            value={applicant.status}
                            onChange={(e) =>
                              handleStatusChange(applicant.id, e.target.value as Applicant['status'])
                            }
                            className={`appearance-none rounded-full py-0.5 pl-2 pr-6 text-xs font-medium ${status.color}`}
                          >
                            {Object.entries(statusConfig).map(([value, config]) => (
                              <option key={value} value={value}>
                                {config.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2" />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(applicant.applied_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {applicant.resume_url && (
                            <a
                              href={applicant.resume_url}
                              className="rounded-lg p-2 hover:bg-muted"
                              title="Download Resume"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          )}
                          <a
                            href={`mailto:${applicant.email}`}
                            className="rounded-lg p-2 hover:bg-muted"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                          <Link
                            href={`/employer/applicants/${applicant.id}`}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            View
                          </Link>
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
