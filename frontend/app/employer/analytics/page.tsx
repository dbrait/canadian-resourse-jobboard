'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Briefcase,
  MousePointer,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

interface JobPerformance {
  id: string;
  title: string;
  views: number;
  applications: number;
  conversion_rate: number;
  status: string;
}

const metrics: MetricCard[] = [
  {
    title: 'Total Views',
    value: '12,847',
    change: 23.5,
    trend: 'up',
    icon: <Eye className="h-5 w-5" />,
  },
  {
    title: 'Applications',
    value: '342',
    change: 12.3,
    trend: 'up',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Active Jobs',
    value: '8',
    change: -2,
    trend: 'down',
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: 'Apply Rate',
    value: '2.66%',
    change: 0.4,
    trend: 'up',
    icon: <MousePointer className="h-5 w-5" />,
  },
];

const jobPerformance: JobPerformance[] = [
  {
    id: '1',
    title: 'Senior Mining Engineer',
    views: 2456,
    applications: 78,
    conversion_rate: 3.17,
    status: 'active',
  },
  {
    id: '2',
    title: 'Heavy Equipment Operator',
    views: 3892,
    applications: 124,
    conversion_rate: 3.19,
    status: 'active',
  },
  {
    id: '3',
    title: 'Environmental Coordinator',
    views: 1234,
    applications: 42,
    conversion_rate: 3.40,
    status: 'active',
  },
  {
    id: '4',
    title: 'Safety Supervisor',
    views: 987,
    applications: 28,
    conversion_rate: 2.84,
    status: 'paused',
  },
  {
    id: '5',
    title: 'Geologist',
    views: 1567,
    applications: 35,
    conversion_rate: 2.23,
    status: 'expired',
  },
];

const viewsByDay = [
  { day: 'Mon', views: 245, applications: 12 },
  { day: 'Tue', views: 312, applications: 18 },
  { day: 'Wed', views: 287, applications: 15 },
  { day: 'Thu', views: 356, applications: 22 },
  { day: 'Fri', views: 298, applications: 14 },
  { day: 'Sat', views: 189, applications: 8 },
  { day: 'Sun', views: 167, applications: 6 },
];

const applicationSources = [
  { source: 'Direct Search', count: 156, percentage: 45.6 },
  { source: 'Job Alerts', count: 89, percentage: 26.0 },
  { source: 'Company Page', count: 52, percentage: 15.2 },
  { source: 'Social Media', count: 32, percentage: 9.4 },
  { source: 'Other', count: 13, percentage: 3.8 },
];

const topLocations = [
  { location: 'Calgary, AB', applications: 89 },
  { location: 'Vancouver, BC', applications: 67 },
  { location: 'Edmonton, AB', applications: 54 },
  { location: 'Toronto, ON', applications: 42 },
  { location: 'Fort McMurray, AB', applications: 38 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const maxViews = Math.max(...viewsByDay.map((d) => d.views));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track your job posting performance and applicant insights
          </p>
        </div>

        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div key={index} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-muted p-2">{metric.icon}</div>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {Math.abs(metric.change)}%
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{metric.value}</p>
            <p className="text-sm text-muted-foreground">{metric.title}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Views & Applications Chart */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Views & Applications</h2>
          <div className="space-y-4">
            {viewsByDay.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="w-8 text-sm text-muted-foreground">{day.day}</span>
                <div className="flex-1">
                  <div className="flex gap-1">
                    <div
                      className="h-6 rounded bg-blue-500"
                      style={{ width: `${(day.views / maxViews) * 100}%` }}
                      title={`${day.views} views`}
                    />
                    <div
                      className="h-6 rounded bg-green-500"
                      style={{ width: `${(day.applications / maxViews) * 100 * 5}%` }}
                      title={`${day.applications} applications`}
                    />
                  </div>
                </div>
                <span className="w-16 text-right text-sm text-muted-foreground">
                  {day.views}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span className="text-muted-foreground">Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span className="text-muted-foreground">Applications</span>
            </div>
          </div>
        </div>

        {/* Application Sources */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Application Sources</h2>
          <div className="space-y-4">
            {applicationSources.map((source, index) => (
              <div key={index}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{source.source}</span>
                  <span className="text-muted-foreground">
                    {source.count} ({source.percentage}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Performance Table */}
      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">Job Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Job Title</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Views</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Applications</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobPerformance.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30">
                  <td className="px-4 py-4 font-medium">{job.title}</td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        job.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : job.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">{job.views.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">{job.applications}</td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={`font-medium ${
                        job.conversion_rate >= 3
                          ? 'text-green-600'
                          : job.conversion_rate >= 2
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                    >
                      {job.conversion_rate.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Applicant Locations */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Top Applicant Locations</h2>
          <div className="space-y-3">
            {topLocations.map((loc, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  <span>{loc.location}</span>
                </div>
                <span className="font-medium">{loc.applications}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Quick Insights</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <TrendingUp className="mt-0.5 h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">
                  Applications up 23%
                </p>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Your job postings are performing better than last month
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <Eye className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400">
                  Peak viewing time: 10am - 2pm
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-500">
                  Consider posting new jobs during these hours
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <Calendar className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Best day: Thursday
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-500">
                  Thursday posts receive 28% more applications
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <Users className="mt-0.5 h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-700 dark:text-purple-400">
                  Calgary leads in applications
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-500">
                  Consider targeting job seekers in this area
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
