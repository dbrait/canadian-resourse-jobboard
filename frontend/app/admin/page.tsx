'use client';

import {
  Briefcase,
  Users,
  Building2,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface ScraperStatus {
  name: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  lastRun: string;
  itemsScraped: number;
  duration: string;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'job_posted' | 'employer_signup' | 'application' | 'scraper_run';
  message: string;
  time: string;
}

const metrics: MetricCard[] = [
  {
    title: 'Total Jobs',
    value: '24,567',
    change: 12.5,
    trend: 'up',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'bg-blue-500',
  },
  {
    title: 'Active Users',
    value: '8,234',
    change: 8.3,
    trend: 'up',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-green-500',
  },
  {
    title: 'Employers',
    value: '342',
    change: 5.2,
    trend: 'up',
    icon: <Building2 className="h-5 w-5" />,
    color: 'bg-purple-500',
  },
  {
    title: 'Page Views (24h)',
    value: '156,789',
    change: -2.1,
    trend: 'down',
    icon: <Eye className="h-5 w-5" />,
    color: 'bg-amber-500',
  },
];

const scraperStatuses: ScraperStatus[] = [
  {
    name: 'Canada Job Bank',
    status: 'running',
    lastRun: '2 minutes ago',
    itemsScraped: 1234,
    duration: '15m 23s',
  },
  {
    name: 'Indeed Canada',
    status: 'completed',
    lastRun: '1 hour ago',
    itemsScraped: 3456,
    duration: '32m 45s',
  },
  {
    name: 'Workday ATS',
    status: 'completed',
    lastRun: '3 hours ago',
    itemsScraped: 2789,
    duration: '45m 12s',
  },
  {
    name: 'Greenhouse',
    status: 'failed',
    lastRun: '5 hours ago',
    itemsScraped: 0,
    duration: '-',
  },
  {
    name: 'LinkedIn Jobs',
    status: 'scheduled',
    lastRun: 'In 2 hours',
    itemsScraped: 0,
    duration: '-',
  },
];

const recentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'job_posted',
    message: 'Suncor Energy posted "Senior Mining Engineer"',
    time: '5 minutes ago',
  },
  {
    id: '2',
    type: 'user_signup',
    message: 'New user registered: john.smith@email.com',
    time: '12 minutes ago',
  },
  {
    id: '3',
    type: 'employer_signup',
    message: 'New employer registered: Teck Resources',
    time: '25 minutes ago',
  },
  {
    id: '4',
    type: 'scraper_run',
    message: 'Canada Job Bank scraper started',
    time: '32 minutes ago',
  },
  {
    id: '5',
    type: 'application',
    message: '15 new applications received',
    time: '1 hour ago',
  },
  {
    id: '6',
    type: 'job_posted',
    message: 'CNRL posted 3 new positions',
    time: '2 hours ago',
  },
];

const jobsByIndustry = [
  { industry: 'Mining', count: 8456, percentage: 34.4 },
  { industry: 'Oil & Gas', count: 6234, percentage: 25.4 },
  { industry: 'Forestry', count: 3456, percentage: 14.1 },
  { industry: 'Renewable Energy', count: 2345, percentage: 9.5 },
  { industry: 'Agriculture', count: 2123, percentage: 8.6 },
  { industry: 'Environmental', count: 1234, percentage: 5.0 },
  { industry: 'Fishing', count: 719, percentage: 2.9 },
];

const trafficByProvince = [
  { province: 'Alberta', visitors: 45234 },
  { province: 'British Columbia', visitors: 32456 },
  { province: 'Ontario', visitors: 28934 },
  { province: 'Saskatchewan', visitors: 15678 },
  { province: 'Quebec', visitors: 12345 },
];

export default function AdminDashboard() {
  const getStatusIcon = (status: ScraperStatus['status']) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: ScraperStatus['status']) => {
    const styles = {
      running: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      scheduled: 'bg-amber-100 text-amber-700',
    };
    return styles[status];
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_signup':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'job_posted':
        return <Briefcase className="h-4 w-4 text-green-500" />;
      case 'employer_signup':
        return <Building2 className="h-4 w-4 text-purple-500" />;
      case 'application':
        return <ArrowUpRight className="h-4 w-4 text-amber-500" />;
      case 'scraper_run':
        return <Bot className="h-4 w-4 text-cyan-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Platform overview and system status
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div key={index} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2 text-white ${metric.color}`}>
                {metric.icon}
              </div>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scraper Status */}
        <div className="lg:col-span-2 rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Scraper Status</h2>
            <a href="/admin/scrapers" className="text-sm text-primary hover:underline">
              View All
            </a>
          </div>
          <div className="divide-y">
            {scraperStatuses.map((scraper, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(scraper.status)}
                  <div>
                    <p className="font-medium">{scraper.name}</p>
                    <p className="text-sm text-muted-foreground">{scraper.lastRun}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {scraper.itemsScraped > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {scraper.itemsScraped.toLocaleString()} items
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(scraper.status)}`}
                  >
                    {scraper.status.charAt(0).toUpperCase() + scraper.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 rounded-lg bg-muted p-2">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Jobs by Industry */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Jobs by Industry</h2>
          <div className="space-y-4">
            {jobsByIndustry.map((item, index) => (
              <div key={index}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{item.industry}</span>
                  <span className="text-muted-foreground">
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic by Province */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Traffic by Province (24h)</h2>
          <div className="space-y-3">
            {trafficByProvince.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </span>
                  <span>{item.province}</span>
                </div>
                <span className="font-medium">{item.visitors.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">System Alerts</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">
                Greenhouse Scraper Failed
              </p>
              <p className="text-sm text-red-600 dark:text-red-400/80">
                The scraper encountered a rate limit error. Last attempt: 5 hours ago.
              </p>
              <button className="mt-2 text-sm font-medium text-red-700 hover:underline dark:text-red-400">
                View Logs →
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
            <Clock className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Database Maintenance Scheduled
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400/80">
                Scheduled maintenance window: Dec 28, 2024, 2:00 AM - 4:00 AM EST
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <TrendingUp className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-400">
                Traffic Spike Detected
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400/80">
                Unusual traffic increase of 45% compared to normal levels. Origin: Calgary, AB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
