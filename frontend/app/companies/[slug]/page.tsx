import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  Briefcase,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface Company {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  website?: string;
  industry: string;
  headquarters: string;
  description: string;
  about?: string;
  founded?: number;
  employees?: string;
  job_count: number;
}

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string;
  posted_at: string;
}

const industryLabels: Record<string, string> = {
  mining: 'Mining',
  oil_gas: 'Oil & Gas',
  forestry: 'Forestry',
  fishing: 'Fishing',
  agriculture: 'Agriculture',
  renewable_energy: 'Renewable Energy',
  environmental: 'Environmental',
};

const industryColors: Record<string, string> = {
  mining: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  oil_gas: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  forestry: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  fishing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  agriculture: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
  renewable_energy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  environmental: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  temporary: 'Temporary',
  internship: 'Internship',
};

async function getCompany(slug: string): Promise<Company | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    const response = await fetch(`${apiUrl}/companies/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch company');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching company:', error);
    return getMockCompany(slug);
  }
}

async function getCompanyJobs(companySlug: string): Promise<Job[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    const response = await fetch(`${apiUrl}/companies/${companySlug}/jobs`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company jobs');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    return getMockJobs();
  }
}

function getMockCompany(slug: string): Company | null {
  const companies: Record<string, Company> = {
    'teck-resources': {
      id: '1',
      slug: 'teck-resources',
      name: 'Teck Resources',
      website: 'https://www.teck.com',
      industry: 'mining',
      headquarters: 'Vancouver, BC',
      description: 'Teck is a diversified resource company committed to responsible mining and mineral development.',
      about: `Teck Resources Limited is one of Canada's leading mining companies, focused on providing essential resources for a better quality of life. We are committed to responsible resource development with world-class programs in safety, sustainability, and community engagement.

Our operations include steelmaking coal operations in British Columbia, the Highland Valley Copper mine in BC, the Quebrada Blanca copper operation in Chile, and a 22.5% interest in the Fort Hills oil sands mine in Alberta.

At Teck, we believe in creating value for all our stakeholders through a commitment to sustainability and a culture of innovation. We are focused on reducing our carbon footprint and advancing technologies that will help us meet our climate goals.`,
      founded: 1906,
      employees: '10,000+',
      job_count: 45,
    },
    'suncor-energy': {
      id: '2',
      slug: 'suncor-energy',
      name: 'Suncor Energy',
      website: 'https://www.suncor.com',
      industry: 'oil_gas',
      headquarters: 'Calgary, AB',
      description: 'Suncor is an integrated energy company developing petroleum resources while advancing the transition to a lower-carbon future.',
      about: `Suncor Energy is Canada's leading integrated energy company. Our operations include oil sands development, production and upgrading; offshore oil and gas; petroleum refining in Canada and the U.S.; and our product marketing network.

We're committed to responsibly developing petroleum resources while also advancing the transition to a lower-carbon future. This includes investing in renewable energy, developing carbon capture solutions, and improving the environmental performance of our operations.`,
      founded: 1967,
      employees: '15,000+',
      job_count: 78,
    },
    'stantec': {
      id: '3',
      slug: 'stantec',
      name: 'Stantec',
      website: 'https://www.stantec.com',
      industry: 'environmental',
      headquarters: 'Edmonton, AB',
      description: 'Stantec is a global design and delivery firm with expertise in engineering, architecture, and environmental sciences.',
      about: `Stantec is a global leader in sustainable design and engineering. We design with community in mind and create solutions that benefit people and the planet.

With over 25,000 employees worldwide, we collaborate across disciplines to bring projects to life. Our expertise spans buildings, energy and resources, environmental services, infrastructure, and water.`,
      founded: 1954,
      employees: '25,000+',
      job_count: 120,
    },
  };

  return companies[slug] || null;
}

function getMockJobs(): Job[] {
  return [
    {
      id: '1',
      title: 'Senior Mining Engineer',
      location: 'Vancouver, BC',
      job_type: 'full_time',
      posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Environmental Coordinator',
      location: 'Sparwood, BC',
      job_type: 'full_time',
      posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Maintenance Supervisor',
      location: 'Elkford, BC',
      job_type: 'full_time',
      posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: 'Heavy Equipment Operator',
      location: 'Sparwood, BC',
      job_type: 'full_time',
      posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      title: 'Safety Coordinator',
      location: 'Vancouver, BC',
      job_type: 'full_time',
      posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const company = await getCompany(params.slug);

  if (!company) {
    return {
      title: 'Company Not Found',
    };
  }

  return {
    title: `${company.name} - Jobs & Careers`,
    description: company.description,
  };
}

export default async function CompanyProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const company = await getCompany(params.slug);

  if (!company) {
    notFound();
  }

  const jobs = await getCompanyJobs(params.slug);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/companies"
            className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All Companies
          </Link>
        </div>
      </div>

      {/* Company Header Card */}
      <div className="container mx-auto px-4">
        <div className="-mt-4 rounded-xl border bg-card p-6 shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Logo */}
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">{company.name}</h1>
                  <p className="mt-1 text-muted-foreground">{company.description}</p>
                </div>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Visit Website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Meta Info */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{company.headquarters}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    industryColors[company.industry] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {industryLabels[company.industry] || company.industry}
                </span>
                {company.founded && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {company.founded}</span>
                  </div>
                )}
                {company.employees && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{company.employees} employees</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Column */}
          <main className="flex-1">
            {/* About Section */}
            {company.about && (
              <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">About {company.name}</h2>
                <div className="prose prose-green max-w-none dark:prose-invert">
                  {company.about.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Open Positions */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Open Positions ({jobs.length})
                </h2>
                <Link
                  href={`/jobs?company=${company.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  View all →
                </Link>
              </div>

              {jobs.length === 0 ? (
                <p className="text-muted-foreground">
                  No open positions at this time. Check back later!
                </p>
              ) : (
                <div className="divide-y">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="group flex items-center justify-between py-4 transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <h3 className="font-medium group-hover:text-primary">
                          {job.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {jobTypeLabels[job.job_type] || job.job_type}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Quick Stats */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Company Overview</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Industry</dt>
                    <dd className="font-medium">
                      {industryLabels[company.industry] || company.industry}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Headquarters</dt>
                    <dd className="font-medium">{company.headquarters}</dd>
                  </div>
                  {company.founded && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Founded</dt>
                      <dd className="font-medium">{company.founded}</dd>
                    </div>
                  )}
                  {company.employees && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Employees</dt>
                      <dd className="font-medium">{company.employees}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Open Positions</dt>
                    <dd className="font-medium">{company.job_count}</dd>
                  </div>
                </dl>
              </div>

              {/* Similar Companies */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Similar Companies</h3>
                <p className="text-sm text-muted-foreground">
                  Looking for similar opportunities?
                </p>
                <Link
                  href={`/companies?industry=${company.industry}`}
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  Browse {industryLabels[company.industry] || company.industry} companies →
                </Link>
              </div>

              {/* Job Alert CTA */}
              <div className="rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm dark:from-green-900/20 dark:to-emerald-900/20">
                <h3 className="mb-2 font-semibold">Get Notified</h3>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when {company.name} posts new jobs.
                </p>
                <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
                  Create Job Alert
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
