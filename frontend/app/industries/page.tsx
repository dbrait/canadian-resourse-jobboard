import { Metadata } from 'next';
import Link from 'next/link';
import {
  HardHat,
  Fuel,
  TreePine,
  Fish,
  Wheat,
  Wind,
  Leaf,
  ArrowRight,
  Briefcase,
  Building2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Industries',
  description:
    'Explore careers across Canada\'s natural resources sector: Mining, Oil & Gas, Forestry, Fishing, Agriculture, Renewable Energy, and Environmental.',
};

interface IndustryStats {
  slug: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  job_count: number;
  company_count: number;
  avg_salary: string;
  color: string;
  bgColor: string;
}

const industries: IndustryStats[] = [
  {
    slug: 'mining',
    name: 'Mining',
    description:
      'Explore careers in mineral extraction, processing, and mining engineering across Canada\'s rich deposits.',
    icon: <HardHat className="h-8 w-8" />,
    job_count: 2340,
    company_count: 45,
    avg_salary: '$95,000',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    slug: 'oil_gas',
    name: 'Oil & Gas',
    description:
      'Join the energy sector with opportunities in extraction, refining, pipelines, and field services.',
    icon: <Fuel className="h-8 w-8" />,
    job_count: 3120,
    company_count: 58,
    avg_salary: '$105,000',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
  },
  {
    slug: 'forestry',
    name: 'Forestry',
    description:
      'Find opportunities in sustainable forest management, logging operations, and wood products manufacturing.',
    icon: <TreePine className="h-8 w-8" />,
    job_count: 890,
    company_count: 32,
    avg_salary: '$72,000',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    slug: 'fishing',
    name: 'Fishing & Aquaculture',
    description:
      'Discover careers in commercial fishing, fish farming, seafood processing, and marine operations.',
    icon: <Fish className="h-8 w-8" />,
    job_count: 450,
    company_count: 24,
    avg_salary: '$58,000',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  {
    slug: 'agriculture',
    name: 'Agriculture',
    description:
      'Explore farming, agribusiness, food processing, and agricultural technology opportunities.',
    icon: <Wheat className="h-8 w-8" />,
    job_count: 1560,
    company_count: 42,
    avg_salary: '$65,000',
    color: 'text-lime-600 dark:text-lime-400',
    bgColor: 'bg-lime-100 dark:bg-lime-900/30',
  },
  {
    slug: 'renewable_energy',
    name: 'Renewable Energy',
    description:
      'Join the clean energy transition with careers in solar, wind, hydro, and energy storage.',
    icon: <Wind className="h-8 w-8" />,
    job_count: 980,
    company_count: 35,
    avg_salary: '$88,000',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    slug: 'environmental',
    name: 'Environmental',
    description:
      'Find roles in environmental consulting, impact assessment, remediation, and sustainability.',
    icon: <Leaf className="h-8 w-8" />,
    job_count: 1240,
    company_count: 28,
    avg_salary: '$78,000',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
];

export default function IndustriesPage() {
  const totalJobs = industries.reduce((sum, i) => sum + i.job_count, 0);
  const totalCompanies = industries.reduce((sum, i) => sum + i.company_count, 0);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Explore Industries
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Canada&apos;s natural resources sector offers diverse career opportunities.
            Find your path in one of these vital industries.
          </p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                {totalJobs.toLocaleString()}+
              </p>
              <p className="text-sm text-white/70">Open Positions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{totalCompanies}+</p>
              <p className="text-sm text-white/70">Companies Hiring</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">7</p>
              <p className="text-sm text-white/70">Industry Sectors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Industries Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/industries/${industry.slug}`}
              className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary hover:shadow-lg"
            >
              {/* Icon */}
              <div
                className={`mb-4 inline-flex rounded-xl p-3 ${industry.bgColor} ${industry.color}`}
              >
                {industry.icon}
              </div>

              {/* Title & Description */}
              <h2 className="text-xl font-semibold group-hover:text-primary">
                {industry.name}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {industry.description}
              </p>

              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {industry.job_count.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">jobs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{industry.company_count}</span>
                  <span className="text-muted-foreground">companies</span>
                </div>
              </div>

              {/* Avg Salary */}
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">Avg. Salary: </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {industry.avg_salary}
                </span>
              </div>

              {/* CTA */}
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                Explore {industry.name} Jobs
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Ready to Start Your Career?</h2>
          <p className="mt-2 text-muted-foreground">
            Browse all open positions or create a job alert to get notified about new
            opportunities.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/jobs"
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Browse All Jobs
            </Link>
            <Link
              href="/dashboard/alerts"
              className="rounded-lg border bg-background px-6 py-3 font-semibold hover:bg-muted"
            >
              Create Job Alert
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
