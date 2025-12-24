'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Shield,
  Ban,
  Trash2,
  Eye,
  Download,
  Building2,
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  CreditCard,
} from 'lucide-react';

interface Employer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  industry: string;
  location: string;
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended' | 'unverified';
  plan: 'starter' | 'professional' | 'enterprise';
  activeJobs: number;
  totalJobs: number;
  totalApplications: number;
  verified: boolean;
  featured: boolean;
}

const employers: Employer[] = [
  {
    id: '1',
    companyName: 'Suncor Energy',
    contactName: 'Jennifer Davis',
    email: 'hr@suncor.com',
    industry: 'Oil & Gas',
    location: 'Calgary, AB',
    joinedAt: '2023-06-15',
    status: 'active',
    plan: 'enterprise',
    activeJobs: 24,
    totalJobs: 156,
    totalApplications: 2345,
    verified: true,
    featured: true,
  },
  {
    id: '2',
    companyName: 'Teck Resources',
    contactName: 'Michael Brown',
    email: 'careers@teck.com',
    industry: 'Mining',
    location: 'Vancouver, BC',
    joinedAt: '2023-08-20',
    status: 'active',
    plan: 'enterprise',
    activeJobs: 18,
    totalJobs: 89,
    totalApplications: 1567,
    verified: true,
    featured: true,
  },
  {
    id: '3',
    companyName: 'CNRL',
    contactName: 'Sarah Miller',
    email: 'hr@cnrl.com',
    industry: 'Oil & Gas',
    location: 'Calgary, AB',
    joinedAt: '2023-09-10',
    status: 'active',
    plan: 'professional',
    activeJobs: 12,
    totalJobs: 45,
    totalApplications: 890,
    verified: true,
    featured: false,
  },
  {
    id: '4',
    companyName: 'West Fraser Timber',
    contactName: 'Robert Wilson',
    email: 'jobs@westfraser.com',
    industry: 'Forestry',
    location: 'Vancouver, BC',
    joinedAt: '2023-10-05',
    status: 'active',
    plan: 'professional',
    activeJobs: 8,
    totalJobs: 34,
    totalApplications: 456,
    verified: true,
    featured: false,
  },
  {
    id: '5',
    companyName: 'Northern Mining Co',
    contactName: 'David Johnson',
    email: 'info@northernmining.ca',
    industry: 'Mining',
    location: 'Yellowknife, NT',
    joinedAt: '2024-01-05',
    status: 'pending',
    plan: 'starter',
    activeJobs: 0,
    totalJobs: 0,
    totalApplications: 0,
    verified: false,
    featured: false,
  },
  {
    id: '6',
    companyName: 'Green Energy Solutions',
    contactName: 'Amanda Lee',
    email: 'hr@greenenergy.ca',
    industry: 'Renewable Energy',
    location: 'Toronto, ON',
    joinedAt: '2023-11-20',
    status: 'active',
    plan: 'starter',
    activeJobs: 3,
    totalJobs: 12,
    totalApplications: 178,
    verified: true,
    featured: false,
  },
  {
    id: '7',
    companyName: 'Fake Company Ltd',
    contactName: 'Unknown',
    email: 'spam@fakeco.com',
    industry: 'Mining',
    location: 'Unknown',
    joinedAt: '2024-01-10',
    status: 'suspended',
    plan: 'starter',
    activeJobs: 0,
    totalJobs: 2,
    totalApplications: 0,
    verified: false,
    featured: false,
  },
];

export default function EmployersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const getStatusBadge = (status: Employer['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      suspended: 'bg-red-100 text-red-700',
      unverified: 'bg-gray-100 text-gray-700',
    };
    return styles[status];
  };

  const getPlanBadge = (plan: Employer['plan']) => {
    const styles = {
      starter: 'bg-gray-100 text-gray-700',
      professional: 'bg-blue-100 text-blue-700',
      enterprise: 'bg-purple-100 text-purple-700',
    };
    return styles[plan];
  };

  const filteredEmployers = employers.filter((employer) => {
    const matchesSearch =
      employer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || employer.status === statusFilter;
    const matchesPlan = planFilter === 'all' || employer.plan === planFilter;
    const matchesIndustry = industryFilter === 'all' || employer.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesPlan && matchesIndustry;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const industries = Array.from(new Set(employers.map((e) => e.industry)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employer Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage employer accounts and company profiles
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
          <Download className="h-4 w-4" />
          Export Employers
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Employers</p>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">342</p>
          <p className="text-sm text-green-600">+12 this month</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Active Jobs</p>
            <Briefcase className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">1,234</p>
          <p className="text-sm text-muted-foreground">Across all employers</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">8</p>
          <p className="text-sm text-muted-foreground">New registrations</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <CreditCard className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">$24,567</p>
          <p className="text-sm text-green-600">+18% vs last month</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by company or email..."
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
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
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

      {/* Employers Table */}
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Company</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Plan</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Industry</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Jobs</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Applications</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEmployers.map((employer) => (
                <tr key={employer.id} className="hover:bg-muted/30">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-medium text-primary">
                        {employer.companyName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{employer.companyName}</p>
                          {employer.verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                          {employer.featured && (
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{employer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(employer.status)}`}
                    >
                      {employer.status.charAt(0).toUpperCase() + employer.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getPlanBadge(employer.plan)}`}
                    >
                      {employer.plan.charAt(0).toUpperCase() + employer.plan.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">{employer.industry}</td>
                  <td className="px-4 py-4 text-center">
                    <div>
                      <p className="font-medium">{employer.activeJobs}</p>
                      <p className="text-xs text-muted-foreground">
                        of {employer.totalJobs} total
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center font-medium">
                    {employer.totalApplications.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {formatDate(employer.joinedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowActionMenu(showActionMenu === employer.id ? null : employer.id)
                        }
                        className="rounded-lg p-2 hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {showActionMenu === employer.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-background py-1 shadow-lg">
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                            <Eye className="h-4 w-4" />
                            View Company
                          </button>
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                            <Briefcase className="h-4 w-4" />
                            View Jobs
                          </button>
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                            <Mail className="h-4 w-4" />
                            Send Email
                          </button>
                          <hr className="my-1" />
                          {employer.status === 'pending' && (
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>
                          )}
                          {!employer.verified && employer.status !== 'pending' && (
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                              <Shield className="h-4 w-4" />
                              Verify
                            </button>
                          )}
                          {!employer.featured && employer.status === 'active' && (
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
                              <Star className="h-4 w-4" />
                              Feature
                            </button>
                          )}
                          {employer.status === 'suspended' ? (
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                              <CheckCircle className="h-4 w-4" />
                              Reactivate
                            </button>
                          ) : (
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
                              <Ban className="h-4 w-4" />
                              Suspend
                            </button>
                          )}
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
            Showing {filteredEmployers.length} of {employers.length} employers
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
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
