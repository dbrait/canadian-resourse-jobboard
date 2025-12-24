import Link from 'next/link';
import { SearchBar } from '@/components/search/search-bar';
import { IndustryCard } from '@/components/home/industry-card';
import { FeaturedJobs } from '@/components/home/featured-jobs';
import { Stats } from '@/components/home/stats';

const industryMeta = {
  mining: { name: 'Mining', description: 'Gold, copper, uranium, potash, and mineral extraction', icon: '⛏️' },
  oil_gas: { name: 'Oil & Gas', description: 'Exploration, drilling, pipelines, and energy production', icon: '🛢️' },
  forestry: { name: 'Forestry', description: 'Logging, lumber, pulp & paper, and forest management', icon: '🌲' },
  fishing: { name: 'Fishing & Aquaculture', description: 'Commercial fishing, seafood processing, and fish farming', icon: '🐟' },
  agriculture: { name: 'Agriculture', description: 'Farming, food processing, and agricultural equipment', icon: '🌾' },
  renewable_energy: { name: 'Renewable Energy', description: 'Solar, wind, hydro, and clean energy solutions', icon: '💨' },
  environmental: { name: 'Environmental', description: 'Environmental consulting, assessment, and remediation', icon: '🌍' },
};

async function getStats() {
  try {
    const res = await fetch('http://localhost:3000/api/stats', { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const data = await getStats();

  const industries = Object.entries(industryMeta).map(([id, meta]) => ({
    id,
    ...meta,
    jobCount: data?.jobsByIndustry?.[id] || 0,
  }));
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Find Your Career in{' '}
              <span className="text-emerald-300">Natural Resources</span>
            </h1>
            <p className="mb-8 text-lg text-green-100 sm:text-xl">
              Canada's premier job board for mining, oil & gas, forestry,
              fishing, agriculture, renewable energy, and environmental careers.
            </p>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <Stats />

      {/* Industries Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">Browse by Industry</h2>
            <p className="text-muted-foreground">
              Explore opportunities across Canada's natural resources sectors
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {industries.map((industry) => (
              <IndustryCard key={industry.id} industry={industry} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Featured Jobs</h2>
              <p className="text-muted-foreground">
                Latest opportunities from top employers
              </p>
            </div>
            <Link
              href="/jobs"
              className="text-primary hover:underline"
            >
              View all jobs →
            </Link>
          </div>
          <FeaturedJobs />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 p-8 text-center text-white md:p-12">
            <h2 className="mb-4 text-3xl font-bold">Ready to Hire?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-green-100">
              Post your job openings and reach thousands of qualified candidates
              in Canada's natural resources sector.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/employer/register"
                className="rounded-lg bg-white px-8 py-3 font-semibold text-green-700 hover:bg-green-50"
              >
                Post a Job
              </Link>
              <Link
                href="/employer"
                className="rounded-lg border border-white px-8 py-3 font-semibold text-white hover:bg-white/10"
              >
                Employer Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
