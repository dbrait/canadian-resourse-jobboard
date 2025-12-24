import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function JobNotFound() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Job Not Found</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <SearchX className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mb-3 text-2xl font-bold">Job Not Found</h2>
          <p className="mb-8 text-muted-foreground">
            The job you&apos;re looking for may have been removed, expired, or
            doesn&apos;t exist. Try searching for similar opportunities.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/jobs"
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Browse All Jobs
            </Link>
            <Link
              href="/"
              className="rounded-lg border px-6 py-3 font-semibold hover:bg-muted"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
