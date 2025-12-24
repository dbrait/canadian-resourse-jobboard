import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, MapPin, Briefcase, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Companies',
  description:
    'Browse companies hiring in Canada\'s natural resources sector. Find employers in mining, oil & gas, forestry, and more.',
};

interface Company {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  industry: string;
  headquarters: string;
  description: string;
  job_count: number;
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

async function getCompanies(): Promise<Company[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    const response = await fetch(`${apiUrl}/companies`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching companies:', error);
    return getMockCompanies();
  }
}

function getMockCompanies(): Company[] {
  return [
    {
      id: '1',
      slug: 'teck-resources',
      name: 'Teck Resources',
      industry: 'mining',
      headquarters: 'Vancouver, BC',
      description: 'Teck is a diversified resource company committed to responsible mining and mineral development.',
      job_count: 45,
    },
    {
      id: '2',
      slug: 'suncor-energy',
      name: 'Suncor Energy',
      industry: 'oil_gas',
      headquarters: 'Calgary, AB',
      description: 'Suncor is an integrated energy company developing petroleum resources while advancing the transition to a lower-carbon future.',
      job_count: 78,
    },
    {
      id: '3',
      slug: 'stantec',
      name: 'Stantec',
      industry: 'environmental',
      headquarters: 'Edmonton, AB',
      description: 'Stantec is a global design and delivery firm with expertise in engineering, architecture, and environmental sciences.',
      job_count: 120,
    },
    {
      id: '4',
      slug: 'transalta',
      name: 'TransAlta',
      industry: 'renewable_energy',
      headquarters: 'Calgary, AB',
      description: 'TransAlta is a leading clean electricity company with operations across Canada, the US, and Australia.',
      job_count: 32,
    },
    {
      id: '5',
      slug: 'west-fraser',
      name: 'West Fraser Timber',
      industry: 'forestry',
      headquarters: 'Vancouver, BC',
      description: 'West Fraser is a leading forest products company with operations in Canada, the US, and Europe.',
      job_count: 56,
    },
    {
      id: '6',
      slug: 'nutrien',
      name: 'Nutrien',
      industry: 'agriculture',
      headquarters: 'Saskatoon, SK',
      description: 'Nutrien is the world\'s largest provider of crop inputs and services.',
      job_count: 89,
    },
    {
      id: '7',
      slug: 'clearwater-seafoods',
      name: 'Clearwater Seafoods',
      industry: 'fishing',
      headquarters: 'Halifax, NS',
      description: 'Clearwater is one of the largest seafood companies in North America, harvesting premium wild shellfish.',
      job_count: 24,
    },
    {
      id: '8',
      slug: 'barrick-gold',
      name: 'Barrick Gold',
      industry: 'mining',
      headquarters: 'Toronto, ON',
      description: 'Barrick is one of the largest gold mining companies in the world.',
      job_count: 67,
    },
    {
      id: '9',
      slug: 'canadian-natural-resources',
      name: 'Canadian Natural Resources',
      industry: 'oil_gas',
      headquarters: 'Calgary, AB',
      description: 'Canadian Natural is one of the largest independent crude oil and natural gas producers in Canada.',
      job_count: 112,
    },
    {
      id: '10',
      slug: 'brookfield-renewable',
      name: 'Brookfield Renewable',
      industry: 'renewable_energy',
      headquarters: 'Toronto, ON',
      description: 'Brookfield Renewable operates one of the world\'s largest publicly traded platforms for renewable power.',
      job_count: 41,
    },
  ];
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  // Group companies by industry
  const companiesByIndustry = companies.reduce(
    (acc, company) => {
      if (!acc[company.industry]) {
        acc[company.industry] = [];
      }
      acc[company.industry].push(company);
      return acc;
    },
    {} as Record<string, Company[]>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Companies Hiring
          </h1>
          <p className="mt-2 text-lg text-white/80">
            Explore {companies.length}+ companies in Canada&apos;s natural resources sector
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{companies.length}</p>
            <p className="text-sm text-muted-foreground">Companies</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold">
              {companies.reduce((sum, c) => sum + c.job_count, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Open Positions</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold">
              {Object.keys(companiesByIndustry).length}
            </p>
            <p className="text-sm text-muted-foreground">Industries</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold">13</p>
            <p className="text-sm text-muted-foreground">Provinces</p>
          </div>
        </div>

        {/* Companies by Industry */}
        {Object.entries(companiesByIndustry).map(([industry, industryCompanies]) => (
          <section key={industry} className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {industryLabels[industry] || industry}
              </h2>
              <Link
                href={`/jobs?industry=${industry}`}
                className="text-sm text-primary hover:underline"
              >
                View all jobs →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {industryCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.slug}`}
                  className="group rounded-xl border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold group-hover:text-primary">
                        {company.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{company.headquarters}</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {company.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        industryColors[company.industry] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {industryLabels[company.industry] || company.industry}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                      <Briefcase className="h-4 w-4" />
                      {company.job_count} jobs
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
