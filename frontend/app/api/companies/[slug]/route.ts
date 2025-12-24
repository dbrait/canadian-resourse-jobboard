import { NextRequest, NextResponse } from 'next/server';
import { companies, getJobs } from '../../jobs/data';

const industryLabels: Record<string, string> = {
  mining: 'Mining',
  oil_gas: 'Oil & Gas',
  forestry: 'Forestry',
  fishing: 'Fishing & Aquaculture',
  agriculture: 'Agriculture',
  renewable_energy: 'Renewable Energy',
  environmental: 'Environmental',
};

const companyDescriptions: Record<string, string> = {
  'suncor-energy': `Suncor Energy is Canada's leading integrated energy company. We are committed to responsible development, operating in a safe, reliable and environmentally responsible way. Our operations include oil sands development and upgrading, offshore oil and gas production, petroleum refining, and product marketing.`,
  'teck-resources': `Teck Resources Limited is Canada's largest diversified resource company, committed to responsible mining and mineral development with major business units focused on copper, zinc, steelmaking coal and energy. We provide responsible development of natural resources, creating value for shareholders and communities.`,
  'cnrl': `Canadian Natural Resources Limited is one of the largest independent crude oil and natural gas producers in the world. We are committed to achieving safe and effective operations while minimizing our environmental footprint.`,
  'barrick-gold': `Barrick Gold Corporation is a leading international gold mining company with operations and projects in North America, South America, Australia, and Africa. We are committed to sustainable, responsible mining.`,
  'nutrien': `Nutrien is the world's largest provider of crop inputs and services. We play a critical role in helping growers increase food production in a sustainable manner.`,
  'west-fraser': `West Fraser Timber Co. Ltd. is one of the largest lumber producers in the world, with operations in British Columbia, Alberta, the U.S. South and U.K. We are committed to sustainable forest management.`,
  'stantec': `Stantec is a global design firm with over 25,000 employees working in over 400 offices across six continents. We provide engineering, architecture, and environmental consulting services.`,
  'transalta': `TransAlta Corporation is a Canadian power generator and wholesale marketing company with operations in Canada, the United States, and Australia. We are transitioning to clean electricity.`,
};

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const company = companies.find(c => c.slug === params.slug);

  if (!company) {
    return NextResponse.json(
      { error: 'Company not found' },
      { status: 404 }
    );
  }

  // Get company jobs
  const jobs = getJobs();
  const companyJobs = jobs.filter(j => j.company_slug === company.slug);
  const activeJobs = companyJobs.filter(j => new Date(j.expires_at) > new Date());

  // Generate stats
  const stats = {
    total_jobs: companyJobs.length,
    active_jobs: activeJobs.length,
    total_views: companyJobs.reduce((sum, j) => sum + j.views, 0),
    total_applications: companyJobs.reduce((sum, j) => sum + j.applications, 0),
  };

  // Get unique locations
  const locations = Array.from(new Set(companyJobs.map(j => j.location)));

  const companyDetail = {
    ...company,
    industry_label: industryLabels[company.industry] || company.industry,
    description: companyDescriptions[company.slug] || `${company.name} is a leading company in the ${industryLabels[company.industry]?.toLowerCase() || company.industry} sector, committed to excellence and sustainable practices.`,
    founded: Math.floor(Math.random() * 50) + 1970,
    website: `https://www.${company.slug.replace(/-/g, '')}.com`,
    stats,
    locations,
    jobs: activeJobs.slice(0, 10),
  };

  return NextResponse.json(companyDetail);
}
