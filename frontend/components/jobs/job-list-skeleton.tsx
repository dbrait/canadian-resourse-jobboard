export function JobListSkeleton() {
  return (
    <div>
      {/* Results count skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      </div>

      {/* Job Cards Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Main Content */}
        <div className="flex-1">
          {/* Title */}
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />

          {/* Company */}
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-muted" />

          {/* Meta Info */}
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
          </div>
        </div>

        {/* Action Button placeholder */}
        <div className="hidden sm:block">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
