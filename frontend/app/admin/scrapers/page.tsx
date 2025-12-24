'use client';

import { useState } from 'react';
import {
  Bot,
  Play,
  Pause,
  RotateCw,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Settings,
  ChevronDown,
  ChevronRight,
  Terminal,
  AlertTriangle,
  Calendar,
  Filter,
} from 'lucide-react';

interface Scraper {
  id: string;
  name: string;
  type: 'api' | 'static' | 'dynamic' | 'ats';
  source: string;
  status: 'running' | 'idle' | 'failed' | 'disabled';
  lastRun: string;
  nextRun: string;
  schedule: string;
  itemsScraped: number;
  successRate: number;
  avgDuration: string;
  errors: number;
}

interface ScraperLog {
  id: string;
  scraperId: string;
  scraperName: string;
  status: 'success' | 'failed' | 'partial';
  startTime: string;
  endTime: string;
  duration: string;
  itemsScraped: number;
  itemsNew: number;
  itemsUpdated: number;
  itemsDuplicate: number;
  errors: string[];
}

const scrapers: Scraper[] = [
  {
    id: '1',
    name: 'Canada Job Bank',
    type: 'api',
    source: 'jobbank.gc.ca',
    status: 'running',
    lastRun: '2 minutes ago',
    nextRun: 'In 4 hours',
    schedule: 'Every 4 hours',
    itemsScraped: 45678,
    successRate: 99.8,
    avgDuration: '18m',
    errors: 0,
  },
  {
    id: '2',
    name: 'Indeed Canada',
    type: 'dynamic',
    source: 'ca.indeed.com',
    status: 'idle',
    lastRun: '1 hour ago',
    nextRun: 'In 5 hours',
    schedule: 'Every 6 hours',
    itemsScraped: 123456,
    successRate: 95.2,
    avgDuration: '45m',
    errors: 3,
  },
  {
    id: '3',
    name: 'Workday ATS',
    type: 'ats',
    source: 'Multiple companies',
    status: 'idle',
    lastRun: '3 hours ago',
    nextRun: 'In 3 hours',
    schedule: 'Every 6 hours',
    itemsScraped: 78234,
    successRate: 97.5,
    avgDuration: '52m',
    errors: 1,
  },
  {
    id: '4',
    name: 'Greenhouse',
    type: 'ats',
    source: 'Multiple companies',
    status: 'failed',
    lastRun: '5 hours ago',
    nextRun: 'Paused',
    schedule: 'Every 6 hours',
    itemsScraped: 34567,
    successRate: 78.3,
    avgDuration: '35m',
    errors: 12,
  },
  {
    id: '5',
    name: 'Lever',
    type: 'ats',
    source: 'Multiple companies',
    status: 'idle',
    lastRun: '2 hours ago',
    nextRun: 'In 4 hours',
    schedule: 'Every 6 hours',
    itemsScraped: 23456,
    successRate: 96.8,
    avgDuration: '28m',
    errors: 2,
  },
  {
    id: '6',
    name: 'Mining Companies',
    type: 'static',
    source: '30 company career pages',
    status: 'idle',
    lastRun: '12 hours ago',
    nextRun: 'In 12 hours',
    schedule: 'Every 24 hours',
    itemsScraped: 8234,
    successRate: 92.1,
    avgDuration: '65m',
    errors: 5,
  },
  {
    id: '7',
    name: 'Oil & Gas Companies',
    type: 'static',
    source: '30 company career pages',
    status: 'disabled',
    lastRun: '2 days ago',
    nextRun: 'Disabled',
    schedule: 'Every 24 hours',
    itemsScraped: 12345,
    successRate: 88.5,
    avgDuration: '72m',
    errors: 8,
  },
];

const recentLogs: ScraperLog[] = [
  {
    id: '1',
    scraperId: '1',
    scraperName: 'Canada Job Bank',
    status: 'success',
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 10:18:23',
    duration: '18m 23s',
    itemsScraped: 1234,
    itemsNew: 45,
    itemsUpdated: 156,
    itemsDuplicate: 1033,
    errors: [],
  },
  {
    id: '2',
    scraperId: '2',
    scraperName: 'Indeed Canada',
    status: 'partial',
    startTime: '2024-01-15 09:00:00',
    endTime: '2024-01-15 09:45:12',
    duration: '45m 12s',
    itemsScraped: 3456,
    itemsNew: 234,
    itemsUpdated: 567,
    itemsDuplicate: 2655,
    errors: ['Rate limit exceeded on page 45', 'Timeout on search query: mining engineer alberta'],
  },
  {
    id: '3',
    scraperId: '4',
    scraperName: 'Greenhouse',
    status: 'failed',
    startTime: '2024-01-15 05:00:00',
    endTime: '2024-01-15 05:12:34',
    duration: '12m 34s',
    itemsScraped: 0,
    itemsNew: 0,
    itemsUpdated: 0,
    itemsDuplicate: 0,
    errors: [
      'Connection refused: boards.greenhouse.io',
      'IP blocked: Retry with different proxy',
      'Max retries exceeded',
    ],
  },
];

export default function ScrapersPage() {
  const [selectedScraper, setSelectedScraper] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const getStatusIcon = (status: Scraper['status']) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'idle':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'disabled':
        return <Pause className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Scraper['status']) => {
    const styles = {
      running: 'bg-blue-100 text-blue-700',
      idle: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      disabled: 'bg-gray-100 text-gray-700',
    };
    return styles[status];
  };

  const getLogStatusBadge = (status: ScraperLog['status']) => {
    const styles = {
      success: 'bg-green-100 text-green-700',
      partial: 'bg-amber-100 text-amber-700',
      failed: 'bg-red-100 text-red-700',
    };
    return styles[status];
  };

  const getTypeBadge = (type: Scraper['type']) => {
    const styles = {
      api: 'bg-purple-100 text-purple-700',
      static: 'bg-cyan-100 text-cyan-700',
      dynamic: 'bg-orange-100 text-orange-700',
      ats: 'bg-indigo-100 text-indigo-700',
    };
    return styles[type];
  };

  const filteredScrapers =
    statusFilter === 'all'
      ? scrapers
      : scrapers.filter((s) => s.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scraper Management</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor and control job scraping operations
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
            <Calendar className="h-4 w-4" />
            Schedule
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Play className="h-4 w-4" />
            Run All
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {scrapers.filter((s) => s.status === 'running').length}
              </p>
              <p className="text-sm text-muted-foreground">Running</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {scrapers.filter((s) => s.status === 'idle').length}
              </p>
              <p className="text-sm text-muted-foreground">Idle</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {scrapers.filter((s) => s.status === 'failed').length}
              </p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Bot className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {scrapers.reduce((acc, s) => acc + s.itemsScraped, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrapers Table */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">All Scrapers</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="idle">Idle</option>
              <option value="failed">Failed</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Scraper</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Items</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Success Rate</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Last Run</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Next Run</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredScrapers.map((scraper) => (
                <tr key={scraper.id} className="hover:bg-muted/30">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(scraper.status)}
                      <div>
                        <p className="font-medium">{scraper.name}</p>
                        <p className="text-sm text-muted-foreground">{scraper.source}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadge(scraper.type)}`}
                    >
                      {scraper.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(scraper.status)}`}
                    >
                      {scraper.status.charAt(0).toUpperCase() + scraper.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    {scraper.itemsScraped.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={`font-medium ${
                        scraper.successRate >= 95
                          ? 'text-green-600'
                          : scraper.successRate >= 85
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                    >
                      {scraper.successRate}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{scraper.lastRun}</td>
                  <td className="px-4 py-4 text-muted-foreground">{scraper.nextRun}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {scraper.status === 'running' ? (
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-green-600">
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <RotateCw className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Recent Scraper Logs</h2>
          <button className="text-sm text-primary hover:underline">View All Logs</button>
        </div>
        <div className="divide-y">
          {recentLogs.map((log) => (
            <div key={log.id}>
              <button
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  {expandedLog === log.id ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{log.scraperName}</p>
                    <p className="text-sm text-muted-foreground">{log.startTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {log.itemsScraped.toLocaleString()} items
                    </p>
                    <p className="text-xs text-muted-foreground">{log.duration}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getLogStatusBadge(log.status)}`}
                  >
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                </div>
              </button>

              {expandedLog === log.id && (
                <div className="border-t bg-muted/20 p-4">
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">New Items</p>
                      <p className="text-lg font-semibold text-green-600">{log.itemsNew}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Updated</p>
                      <p className="text-lg font-semibold text-blue-600">{log.itemsUpdated}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duplicates</p>
                      <p className="text-lg font-semibold text-gray-600">{log.itemsDuplicate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg font-semibold">{log.duration}</p>
                    </div>
                  </div>

                  {log.errors.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        Errors ({log.errors.length})
                      </p>
                      <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                        <pre className="text-xs text-red-700 dark:text-red-400">
                          {log.errors.map((error, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              {error}
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                      <Terminal className="h-4 w-4" />
                      View Full Log
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                      <RotateCw className="h-4 w-4" />
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
