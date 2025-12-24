import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/jobs"
            className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Column */}
          <main className="flex-1">
            {/* Job Header Card Skeleton */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  {/* Title */}
                  <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />

                  {/* Company */}
                  <div className="mt-3 h-5 w-1/3 animate-pulse rounded bg-muted" />

                  {/* Meta Info */}
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-28 animate-pulse rounded bg-muted" />
                  </div>

                  {/* Salary */}
                  <div className="mt-4 h-6 w-48 animate-pulse rounded bg-muted" />

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 md:flex-col">
                  <div className="h-12 w-32 animate-pulse rounded-lg bg-muted" />
                  <div className="flex gap-2">
                    <div className="h-12 w-16 animate-pulse rounded-lg bg-muted" />
                    <div className="h-12 w-16 animate-pulse rounded-lg bg-muted" />
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description Skeleton */}
            <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 h-6 w-40 animate-pulse rounded bg-muted" />
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </main>

          {/* Sidebar Skeleton */}
          <aside className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Company Card Skeleton */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                  <div className="flex-1">
                    <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                    <div className="mt-1 h-4 w-16 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </div>

              {/* Job Details Card Skeleton */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="mb-4 h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
