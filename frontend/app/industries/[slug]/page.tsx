import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  HardHat,
  Fuel,
  TreePine,
  Fish,
  Wheat,
  Wind,
  Leaf,
  MapPin,
  Building2,
  Briefcase,
  Clock,
  DollarSign,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Industry {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  job_count: number;
  company_count: number;
  avg_salary: string;
  topLocations: string[];
  topRoles: string[];
}

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  posted_at: string;
}

interface Company {
  id: string;
  slug: string;
  name: string;
  headquarters: string;
  job_count: number;
}

const industries: Record<string, Industry> = {
  mining: {
    slug: 'mining',
    name: 'Mining',
    description: 'Explore careers in mineral extraction, processing, and mining engineering.',
    longDescription: `Canada is one of the world's leading mining nations, producing over 60 minerals and metals. The mining sector offers diverse career opportunities ranging from hands-on operational roles to engineering, geology, and environmental management positions.

Key mining regions include British Columbia (copper, coal), Ontario (gold, nickel), Quebec (iron ore, gold), and Saskatchewan (potash, uranium). The industry is embracing new technologies including automation, AI, and sustainable practices.`,
    icon: <HardHat className="h-8 w-8" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    job_count: 2340,
    company_count: 45,
    avg_salary: '$95,000',
    topLocations: ['Vancouver, BC', 'Toronto, ON', 'Sudbury, ON', 'Timmins, ON', 'Val-d\'Or, QC'],
    topRoles: ['Mining Engineer', 'Geologist', 'Heavy Equipment Operator', 'Mill Operator', 'Safety Coordinator'],
  },
  oil_gas: {
    slug: 'oil_gas',
    name: 'Oil & Gas',
    description: 'Join the energy sector with opportunities in extraction, refining, and field services.',
    longDescription: `Canada's oil and gas industry is a cornerstone of the national economy, with operations spanning Alberta's oil sands, offshore platforms in Atlantic Canada, and natural gas fields across the country.

The sector offers careers in exploration, drilling, production, pipeline operations, refining, and increasingly in emissions reduction and carbon capture technologies. With the energy transition underway, there's growing demand for professionals who can bridge traditional energy and emerging clean technologies.`,
    icon: <Fuel className="h-8 w-8" />,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
    job_count: 3120,
    company_count: 58,
    avg_salary: '$105,000',
    topLocations: ['Calgary, AB', 'Edmonton, AB', 'Fort McMurray, AB', 'St. John\'s, NL', 'Grande Prairie, AB'],
    topRoles: ['Drilling Engineer', 'Field Operator', 'Pipeline Technician', 'Process Engineer', 'HSE Coordinator'],
  },
  forestry: {
    slug: 'forestry',
    name: 'Forestry',
    description: 'Find opportunities in sustainable forest management and wood products.',
    longDescription: `Canada's forestry sector is one of the most sustainable in the world, managing over 347 million hectares of forest land. The industry spans logging operations, pulp and paper production, lumber manufacturing, and increasingly, biomass energy.

Career opportunities include forest technicians, harvesting operators, environmental specialists, and roles in manufacturing and logistics. The sector is increasingly focused on sustainable practices, carbon sequestration, and Indigenous partnerships.`,
    icon: <TreePine className="h-8 w-8" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    job_count: 890,
    company_count: 32,
    avg_salary: '$72,000',
    topLocations: ['Vancouver, BC', 'Prince George, BC', 'Thunder Bay, ON', 'Montreal, QC', 'Kamloops, BC'],
    topRoles: ['Forest Technician', 'Logging Operator', 'Millwright', 'Environmental Forester', 'Quality Control'],
  },
  fishing: {
    slug: 'fishing',
    name: 'Fishing & Aquaculture',
    description: 'Discover careers in commercial fishing, fish farming, and seafood processing.',
    longDescription: `Canada's fishing and aquaculture industry operates on all three coasts plus numerous inland waters. From wild-caught Atlantic lobster to BC farmed salmon, the sector provides diverse career opportunities.

Roles range from vessel operations and fish processing to aquaculture management, marine biology, and sustainability certification. The industry is growing through innovations in sustainable aquaculture and value-added processing.`,
    icon: <Fish className="h-8 w-8" />,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    job_count: 450,
    company_count: 24,
    avg_salary: '$58,000',
    topLocations: ['Halifax, NS', 'Vancouver, BC', 'St. John\'s, NL', 'Campbell River, BC', 'Moncton, NB'],
    topRoles: ['Aquaculture Technician', 'Vessel Captain', 'Fish Processing Worker', 'Marine Biologist', 'Quality Assurance'],
  },
  agriculture: {
    slug: 'agriculture',
    name: 'Agriculture',
    description: 'Explore farming, agribusiness, and agricultural technology opportunities.',
    longDescription: `Canadian agriculture is a diverse sector spanning grain farming on the prairies, dairy and livestock in central Canada, and specialty crops across the country. The industry is rapidly adopting precision agriculture, automation, and sustainable practices.

Career opportunities include farm management, agricultural science, equipment operation, agronomy, food processing, and agtech development. The sector offers both rural and urban opportunities with growing demand for technology-enabled roles.`,
    icon: <Wheat className="h-8 w-8" />,
    color: 'text-lime-600 dark:text-lime-400',
    bgColor: 'bg-lime-100 dark:bg-lime-900/30',
    job_count: 1560,
    company_count: 42,
    avg_salary: '$65,000',
    topLocations: ['Saskatoon, SK', 'Regina, SK', 'Winnipeg, MB', 'Lethbridge, AB', 'Guelph, ON'],
    topRoles: ['Agronomist', 'Farm Manager', 'Equipment Operator', 'Food Scientist', 'Agricultural Technician'],
  },
  renewable_energy: {
    slug: 'renewable_energy',
    name: 'Renewable Energy',
    description: 'Join the clean energy transition with careers in solar, wind, and hydro.',
    longDescription: `Canada's renewable energy sector is expanding rapidly as the country works toward net-zero emissions. From massive hydroelectric installations to growing wind and solar farms, the industry offers exciting career opportunities.

Roles include wind turbine technicians, solar installers, electrical engineers, project managers, and grid integration specialists. The sector is expected to create thousands of new jobs as Canada expands its clean energy capacity.`,
    icon: <Wind className="h-8 w-8" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    job_count: 980,
    company_count: 35,
    avg_salary: '$88,000',
    topLocations: ['Calgary, AB', 'Toronto, ON', 'Montreal, QC', 'Pincher Creek, AB', 'Chatham-Kent, ON'],
    topRoles: ['Wind Turbine Technician', 'Solar Installer', 'Electrical Engineer', 'Project Manager', 'Grid Operator'],
  },
  environmental: {
    slug: 'environmental',
    name: 'Environmental',
    description: 'Find roles in environmental consulting, impact assessment, and sustainability.',
    longDescription: `Environmental consulting supports all natural resource sectors with expertise in impact assessment, remediation, compliance, and sustainability. This growing field offers careers for those passionate about protecting Canada's natural heritage.

Opportunities include environmental scientists, remediation specialists, GIS analysts, regulatory consultants, and sustainability managers. The field is growing as environmental requirements expand and companies prioritize ESG performance.`,
    icon: <Leaf className="h-8 w-8" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    job_count: 1240,
    company_count: 28,
    avg_salary: '$78,000',
    topLocations: ['Calgary, AB', 'Vancouver, BC', 'Toronto, ON', 'Edmonton, AB', 'Ottawa, ON'],
    topRoles: ['Environmental Scientist', 'GIS Analyst', 'Remediation Specialist', 'EIA Consultant', 'Sustainability Manager'],
  },
};

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  temporary: 'Temporary',
  internship: 'Internship',
};

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return '';

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  });

  if (min && max && min !== max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  return formatter.format(min || max || 0);
}

async function getIndustryJobs(slug: string): Promise<Job[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    const response = await fetch(`${apiUrl}/jobs?industry=${slug}&limit=10`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error('Error fetching industry jobs:', error);
    return getMockJobs(slug);
  }
}

async function getIndustryCompanies(slug: string): Promise<Company[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    const response = await fetch(`${apiUrl}/companies?industry=${slug}&limit=6`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching industry companies:', error);
    return getMockCompanies(slug);
  }
}

function getMockJobs(slug: string): Job[] {
  const baseJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Engineer',
      company_name: 'Major Company',
      location: 'Calgary, AB',
      job_type: 'full_time',
      salary_min: 100000,
      salary_max: 130000,
      posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Operations Manager',
      company_name: 'Industry Leader',
      location: 'Vancouver, BC',
      job_type: 'full_time',
      salary_min: 85000,
      salary_max: 110000,
      posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Field Technician',
      company_name: 'Resources Corp',
      location: 'Edmonton, AB',
      job_type: 'full_time',
      salary_min: 65000,
      salary_max: 80000,
      posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: 'Safety Coordinator',
      company_name: 'Safety First Inc',
      location: 'Toronto, ON',
      job_type: 'full_time',
      salary_min: 70000,
      salary_max: 90000,
      posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  return baseJobs;
}

function getMockCompanies(slug: string): Company[] {
  return [
    { id: '1', slug: 'company-a', name: 'Major Resources Ltd', headquarters: 'Calgary, AB', job_count: 45 },
    { id: '2', slug: 'company-b', name: 'Industry Leader Inc', headquarters: 'Vancouver, BC', job_count: 32 },
    { id: '3', slug: 'company-c', name: 'National Corp', headquarters: 'Toronto, ON', job_count: 28 },
    { id: '4', slug: 'company-d', name: 'Western Operations', headquarters: 'Edmonton, AB', job_count: 21 },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const industry = industries[params.slug];

  if (!industry) {
    return {
      title: 'Industry Not Found',
    };
  }

  return {
    title: `${industry.name} Jobs in Canada`,
    description: `Find ${industry.name.toLowerCase()} jobs across Canada. ${industry.job_count.toLocaleString()} positions available at ${industry.company_count} companies. Average salary: ${industry.avg_salary}.`,
  };
}

export default async function IndustryPage({
  params,
}: {
  params: { slug: string };
}) {
  const industry = industries[params.slug];

  if (!industry) {
    notFound();
  }

  const [jobs, companies] = await Promise.all([
    getIndustryJobs(params.slug),
    getIndustryCompanies(params.slug),
  ]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/industries"
            className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All Industries
          </Link>
        </div>
      </div>

      {/* Industry Header */}
      <div className="container mx-auto px-4">
        <div className="-mt-4 rounded-xl border bg-card p-6 shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Icon */}
            <div
              className={`inline-flex rounded-xl p-4 ${industry.bgColor} ${industry.color}`}
            >
              {industry.icon}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold md:text-3xl">{industry.name} Jobs</h1>
              <p className="mt-2 text-muted-foreground">{industry.description}</p>

              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-6">
                <div>
                  <p className="text-2xl font-bold">{industry.job_count.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Open Positions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{industry.company_count}</p>
                  <p className="text-sm text-muted-foreground">Companies</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {industry.avg_salary}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Salary</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/jobs?industry=${industry.slug}`}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              View All Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Column */}
          <main className="flex-1">
            {/* About Section */}
            <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">About {industry.name} Careers</h2>
              <div className="prose prose-green max-w-none dark:prose-invert">
                {industry.longDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent {industry.name} Jobs</h2>
                <Link
                  href={`/jobs?industry=${industry.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="divide-y">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="group flex items-center justify-between py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium group-hover:text-primary">
                        {job.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {job.company_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        {job.salary_min && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <DollarSign className="h-3 w-3" />
                            {formatSalary(job.salary_min, job.salary_max)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Top Locations */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Top Locations</h3>
                <ul className="space-y-2">
                  {industry.topLocations.map((location) => (
                    <li key={location}>
                      <Link
                        href={`/jobs?industry=${industry.slug}&location=${encodeURIComponent(location)}`}
                        className="flex items-center gap-2 text-sm hover:text-primary"
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {location}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Roles */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Popular Roles</h3>
                <ul className="space-y-2">
                  {industry.topRoles.map((role) => (
                    <li key={role}>
                      <Link
                        href={`/jobs?industry=${industry.slug}&q=${encodeURIComponent(role)}`}
                        className="flex items-center gap-2 text-sm hover:text-primary"
                      >
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        {role}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Companies */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Top Companies</h3>
                <ul className="space-y-3">
                  {companies.slice(0, 5).map((company) => (
                    <li key={company.id}>
                      <Link
                        href={`/companies/${company.slug}`}
                        className="group flex items-center justify-between text-sm"
                      >
                        <span className="group-hover:text-primary">{company.name}</span>
                        <span className="text-muted-foreground">{company.job_count} jobs</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/companies?industry=${industry.slug}`}
                  className="mt-4 inline-block text-sm text-primary hover:underline"
                >
                  View all companies →
                </Link>
              </div>

              {/* Job Alert CTA */}
              <div className="rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm dark:from-green-900/20 dark:to-emerald-900/20">
                <h3 className="mb-2 font-semibold">Get {industry.name} Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when new {industry.name.toLowerCase()} jobs are posted.
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
