import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  Wifi,
  Plane,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Share2,
  Bookmark,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { JsonLd, generateJobPostingSchema, generateBreadcrumbSchema } from '@/components/seo/json-ld';

interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo?: string;
  company_website?: string;
  location: string;
  province?: string;
  industry: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements?: string[];
  benefits?: string[];
  is_remote: boolean;
  is_fly_in_fly_out: boolean;
  posted_at: string;
  expires_at?: string;
  source: string;
  source_url?: string;
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

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return '';

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  });

  if (min && max && min !== max) {
    return `${formatter.format(min)} - ${formatter.format(max)} per year`;
  }

  return `${formatter.format(min || max || 0)} per year`;
}

async function getJob(id: string): Promise<Job | null> {
  try {
    // Import the data functions directly for server-side rendering
    const { getAllJobs, getJobById } = await import('@/lib/scraper/db');
    const scrapedJob = getJobById(id);

    if (scrapedJob) {
      return {
        id: scrapedJob.id,
        title: scrapedJob.title,
        company_name: scrapedJob.company,
        company_website: `https://www.${scrapedJob.company_slug?.replace(/-/g, '')}.com`,
        location: scrapedJob.location,
        province: scrapedJob.province,
        industry: scrapedJob.industry,
        job_type: scrapedJob.job_type,
        salary_min: scrapedJob.salary_min ?? undefined,
        salary_max: scrapedJob.salary_max ?? undefined,
        description: scrapedJob.description,
        requirements: scrapedJob.requirements,
        benefits: [],
        is_remote: scrapedJob.is_remote,
        is_fly_in_fly_out: scrapedJob.is_fly_in_fly_out,
        posted_at: scrapedJob.posted_at,
        expires_at: scrapedJob.expires_at || undefined,
        source: scrapedJob.source,
        source_url: scrapedJob.source_url,
      };
    }

    // Fall back to mock data if not found in scraped jobs
    return getMockJob(id);
  } catch (error) {
    console.error('Error fetching job:', error);
    // Return mock data for development
    return getMockJob(id);
  }
}

function getMockJob(id: string): Job | null {
  const mockJobs: Record<string, Job> = {
    '1': {
      id: '1',
      title: 'Senior Mining Engineer',
      company_name: 'Teck Resources',
      company_website: 'https://www.teck.com',
      location: 'Vancouver, BC',
      province: 'BC',
      industry: 'mining',
      job_type: 'full_time',
      salary_min: 120000,
      salary_max: 160000,
      description: `
        <h3>About the Role</h3>
        <p>We are seeking an experienced Senior Mining Engineer to join our team in Vancouver. This role offers the opportunity to work on world-class mining projects across Canada.</p>

        <h3>Key Responsibilities</h3>
        <ul>
          <li>Lead mine planning and design activities for open pit and underground operations</li>
          <li>Develop and optimize production schedules to maximize ore recovery</li>
          <li>Conduct feasibility studies and economic analyses for new projects</li>
          <li>Mentor junior engineers and provide technical guidance</li>
          <li>Collaborate with geologists, metallurgists, and environmental teams</li>
          <li>Ensure compliance with safety regulations and environmental standards</li>
        </ul>

        <h3>What You'll Bring</h3>
        <ul>
          <li>Bachelor's degree in Mining Engineering or related field</li>
          <li>Professional Engineer (P.Eng) designation required</li>
          <li>8+ years of experience in mining operations</li>
          <li>Proficiency in mine planning software (MineSched, Deswik, Surpac)</li>
          <li>Strong analytical and problem-solving skills</li>
          <li>Excellent communication and leadership abilities</li>
        </ul>
      `,
      requirements: [
        "Bachelor's degree in Mining Engineering",
        'P.Eng designation',
        '8+ years experience',
        'Mine planning software proficiency',
      ],
      benefits: [
        'Competitive salary and annual bonus',
        'Comprehensive health and dental benefits',
        'Pension plan with employer matching',
        'Professional development opportunities',
        'Flexible work arrangements',
        'Employee share purchase plan',
      ],
      is_remote: false,
      is_fly_in_fly_out: false,
      posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'workday',
      source_url: 'https://teck.wd3.myworkdayjobs.com/example',
    },
    '2': {
      id: '2',
      title: 'Drilling Supervisor',
      company_name: 'Suncor Energy',
      company_website: 'https://www.suncor.com',
      location: 'Fort McMurray, AB',
      province: 'AB',
      industry: 'oil_gas',
      job_type: 'full_time',
      salary_min: 95000,
      salary_max: 130000,
      description: `
        <h3>About the Role</h3>
        <p>Join Suncor Energy as a Drilling Supervisor and lead drilling operations in the heart of Canada's oil sands.</p>

        <h3>Key Responsibilities</h3>
        <ul>
          <li>Supervise all drilling operations and crew activities</li>
          <li>Ensure safe and efficient drilling performance</li>
          <li>Monitor well conditions and make real-time decisions</li>
          <li>Coordinate with engineering and geology teams</li>
          <li>Manage contractor relationships and performance</li>
        </ul>

        <h3>Requirements</h3>
        <ul>
          <li>10+ years drilling experience with 5+ in supervisory role</li>
          <li>Valid well site supervisor certification</li>
          <li>Strong leadership and communication skills</li>
          <li>Willingness to work rotational schedule</li>
        </ul>
      `,
      requirements: [
        '10+ years drilling experience',
        'Well site supervisor certification',
        'Leadership experience',
      ],
      benefits: [
        'Competitive compensation package',
        'Fly-in/fly-out rotational schedule',
        'Camp accommodations provided',
        'Health and wellness programs',
      ],
      is_remote: false,
      is_fly_in_fly_out: true,
      posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'workday',
    },
    '3': {
      id: '3',
      title: 'Environmental Consultant',
      company_name: 'Stantec',
      company_website: 'https://www.stantec.com',
      location: 'Calgary, AB',
      province: 'AB',
      industry: 'environmental',
      job_type: 'full_time',
      salary_min: 75000,
      salary_max: 95000,
      description: `
        <h3>About the Role</h3>
        <p>Stantec is seeking an Environmental Consultant to join our growing team in Calgary.</p>

        <h3>Key Responsibilities</h3>
        <ul>
          <li>Conduct environmental impact assessments</li>
          <li>Prepare regulatory submissions and permits</li>
          <li>Perform field surveys and data collection</li>
          <li>Write technical reports and recommendations</li>
          <li>Engage with stakeholders and Indigenous communities</li>
        </ul>
      `,
      is_remote: true,
      is_fly_in_fly_out: false,
      posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'greenhouse',
    },
    '4': {
      id: '4',
      title: 'Wind Turbine Technician',
      company_name: 'TransAlta',
      company_website: 'https://www.transalta.com',
      location: 'Pincher Creek, AB',
      province: 'AB',
      industry: 'renewable_energy',
      job_type: 'full_time',
      salary_min: 65000,
      salary_max: 85000,
      description: `
        <h3>About the Role</h3>
        <p>Join TransAlta's renewable energy team as a Wind Turbine Technician.</p>

        <h3>Responsibilities</h3>
        <ul>
          <li>Perform routine maintenance on wind turbines</li>
          <li>Troubleshoot and repair mechanical and electrical systems</li>
          <li>Conduct safety inspections</li>
          <li>Document maintenance activities</li>
        </ul>
      `,
      is_remote: false,
      is_fly_in_fly_out: false,
      posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'lever',
    },
  };

  return mockJobs[id] || null;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const job = await getJob(params.id);

  if (!job) {
    return {
      title: 'Job Not Found',
    };
  }

  return {
    title: `${job.title} at ${job.company_name}`,
    description: `${job.title} position at ${job.company_name} in ${job.location}. ${jobTypeLabels[job.job_type] || job.job_type} role in the ${industryLabels[job.industry] || job.industry} industry.`,
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const job = await getJob(params.id);

  if (!job) {
    notFound();
  }

  const postedTime = formatDistanceToNow(new Date(job.posted_at), { addSuffix: true });
  const postedDate = format(new Date(job.posted_at), 'MMMM d, yyyy');
  const salary = formatSalary(job.salary_min, job.salary_max);

  // Generate structured data for SEO
  const jobPostingSchema = generateJobPostingSchema({
    title: job.title,
    description: job.description.replace(/<[^>]*>/g, ''), // Strip HTML
    company: job.company_name,
    location: job.location,
    province: job.province,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    jobType: job.job_type,
    postedAt: job.posted_at,
    expiresAt: job.expires_at,
    isRemote: job.is_remote,
    sourceUrl: job.source_url,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://resourcesjobs.ca' },
    { name: 'Jobs', url: 'https://resourcesjobs.ca/jobs' },
    { name: job.title, url: `https://resourcesjobs.ca/jobs/${job.id}` },
  ]);

  return (
    <>
      <JsonLd data={jobPostingSchema} />
      <JsonLd data={breadcrumbSchema} />
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
            {/* Job Header Card */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  {/* Title */}
                  <h1 className="text-2xl font-bold md:text-3xl">{job.title}</h1>

                  {/* Company */}
                  <div className="mt-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    {job.company_website ? (
                      <a
                        href={job.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg text-primary hover:underline"
                      >
                        {job.company_name}
                      </a>
                    ) : (
                      <span className="text-lg">{job.company_name}</span>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="mt-4 flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{jobTypeLabels[job.job_type] || job.job_type}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Posted {postedTime}</span>
                    </div>
                  </div>

                  {/* Salary */}
                  {salary && (
                    <div className="mt-4 flex items-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400">
                      <DollarSign className="h-5 w-5" />
                      <span>{salary}</span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        industryColors[job.industry] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {industryLabels[job.industry] || job.industry}
                    </span>

                    {job.is_remote && (
                      <span className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        <Wifi className="h-3 w-3" />
                        Remote
                      </span>
                    )}

                    {job.is_fly_in_fly_out && (
                      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        <Plane className="h-3 w-3" />
                        Fly-in/Fly-out
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 md:flex-col">
                  {job.source_url ? (
                    <a
                      href={job.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Apply Now
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                      Apply Now
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 hover:bg-muted">
                      <Bookmark className="h-4 w-4" />
                      <span className="hidden sm:inline">Save</span>
                    </button>

                    <button className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 hover:bg-muted">
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Job Description</h2>
              <div
                className="prose prose-green max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Benefits</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Company Card */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">About the Company</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{job.company_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {industryLabels[job.industry] || job.industry}
                    </p>
                  </div>
                </div>
                {job.company_website && (
                  <a
                    href={job.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Job Details Card */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Job Details</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Posted</dt>
                    <dd className="font-medium">{postedDate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Job Type</dt>
                    <dd className="font-medium">
                      {jobTypeLabels[job.job_type] || job.job_type}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Industry</dt>
                    <dd className="font-medium">
                      {industryLabels[job.industry] || job.industry}
                    </dd>
                  </div>
                  {job.province && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Province</dt>
                      <dd className="font-medium">{job.province}</dd>
                    </div>
                  )}
                  {job.expires_at && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Expires</dt>
                      <dd className="font-medium">
                        {format(new Date(job.expires_at), 'MMM d, yyyy')}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Source</dt>
                    <dd className="font-medium capitalize">{job.source}</dd>
                  </div>
                </dl>
              </div>

              {/* Similar Jobs placeholder */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Similar Jobs</h3>
                <p className="text-sm text-muted-foreground">
                  Looking for similar positions?
                </p>
                <Link
                  href={`/jobs?industry=${job.industry}`}
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  Browse {industryLabels[job.industry] || job.industry} jobs →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
      </div>
    </>
  );
}
