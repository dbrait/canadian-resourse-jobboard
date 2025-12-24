// Realistic mock job data for Canadian natural resources sector

export interface Job {
  id: string;
  title: string;
  company: string;
  company_slug: string;
  location: string;
  city: string;
  province: string;
  industry: string;
  job_type: string;
  experience_level: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string;
  description: string;
  requirements: string[];
  benefits: string[];
  is_remote: boolean;
  is_fly_in_fly_out: boolean;
  posted_at: string;
  expires_at: string;
  source: string;
  source_url: string;
  views: number;
  applications: number;
  is_featured: boolean;
}

export const companies = [
  { name: 'Suncor Energy', slug: 'suncor-energy', industry: 'oil_gas', location: 'Calgary, AB', employees: '10000+', logo: null },
  { name: 'Teck Resources', slug: 'teck-resources', industry: 'mining', location: 'Vancouver, BC', employees: '5001-10000', logo: null },
  { name: 'Canadian Natural Resources', slug: 'cnrl', industry: 'oil_gas', location: 'Calgary, AB', employees: '10000+', logo: null },
  { name: 'Barrick Gold', slug: 'barrick-gold', industry: 'mining', location: 'Toronto, ON', employees: '5001-10000', logo: null },
  { name: 'Cenovus Energy', slug: 'cenovus-energy', industry: 'oil_gas', location: 'Calgary, AB', employees: '5001-10000', logo: null },
  { name: 'Imperial Oil', slug: 'imperial-oil', industry: 'oil_gas', location: 'Calgary, AB', employees: '5001-10000', logo: null },
  { name: 'Nutrien', slug: 'nutrien', industry: 'agriculture', location: 'Saskatoon, SK', employees: '10000+', logo: null },
  { name: 'West Fraser Timber', slug: 'west-fraser', industry: 'forestry', location: 'Vancouver, BC', employees: '5001-10000', logo: null },
  { name: 'Canfor Corporation', slug: 'canfor', industry: 'forestry', location: 'Vancouver, BC', employees: '1001-5000', logo: null },
  { name: 'Cooke Aquaculture', slug: 'cooke-aquaculture', industry: 'fishing', location: 'Saint John, NB', employees: '1001-5000', logo: null },
  { name: 'Clearwater Seafoods', slug: 'clearwater-seafoods', industry: 'fishing', location: 'Halifax, NS', employees: '1001-5000', logo: null },
  { name: 'TransAlta', slug: 'transalta', industry: 'renewable_energy', location: 'Calgary, AB', employees: '1001-5000', logo: null },
  { name: 'Northland Power', slug: 'northland-power', industry: 'renewable_energy', location: 'Toronto, ON', employees: '501-1000', logo: null },
  { name: 'Stantec', slug: 'stantec', industry: 'environmental', location: 'Edmonton, AB', employees: '10000+', logo: null },
  { name: 'WSP Canada', slug: 'wsp-canada', industry: 'environmental', location: 'Montreal, QC', employees: '10000+', logo: null },
  { name: 'Kinross Gold', slug: 'kinross-gold', industry: 'mining', location: 'Toronto, ON', employees: '5001-10000', logo: null },
  { name: 'Agnico Eagle', slug: 'agnico-eagle', industry: 'mining', location: 'Toronto, ON', employees: '5001-10000', logo: null },
  { name: 'Pembina Pipeline', slug: 'pembina-pipeline', industry: 'oil_gas', location: 'Calgary, AB', employees: '1001-5000', logo: null },
  { name: 'TC Energy', slug: 'tc-energy', industry: 'oil_gas', location: 'Calgary, AB', employees: '5001-10000', logo: null },
  { name: 'Enbridge', slug: 'enbridge', industry: 'oil_gas', location: 'Calgary, AB', employees: '10000+', logo: null },
];

const jobTitles = {
  mining: [
    'Mining Engineer', 'Senior Mining Engineer', 'Geologist', 'Senior Geologist', 'Mine Surveyor',
    'Blasting Technician', 'Mill Operator', 'Heavy Equipment Operator', 'Underground Miner',
    'Mine Supervisor', 'Mine Manager', 'Metallurgist', 'Environmental Coordinator', 'Safety Coordinator',
    'Exploration Geologist', 'Drill Helper', 'Haul Truck Driver', 'Maintenance Mechanic', 'Electrician',
    'Process Engineer', 'Project Manager', 'Tailings Engineer', 'Geotechnical Engineer'
  ],
  oil_gas: [
    'Petroleum Engineer', 'Drilling Engineer', 'Rig Operator', 'Pipeline Technician', 'Process Operator',
    'Field Operator', 'Instrumentation Technician', 'Production Engineer', 'Reservoir Engineer',
    'HSE Coordinator', 'Plant Operator', 'Turnaround Planner', 'Integrity Engineer', 'Corrosion Technician',
    'Wellsite Supervisor', 'Pumper', 'Compressor Operator', 'Gas Plant Operator', 'Project Coordinator',
    'Mechanical Engineer', 'Completions Engineer', 'Facilities Engineer', 'Pipeline Inspector'
  ],
  forestry: [
    'Forest Technician', 'Logging Truck Driver', 'Faller', 'Lumber Grader', 'Sawmill Operator',
    'Forest Engineer', 'Silviculture Worker', 'Tree Planter', 'Forestry Supervisor', 'Log Scaler',
    'Heavy Equipment Operator', 'Millwright', 'Kiln Operator', 'Quality Control Inspector',
    'Environmental Specialist', 'GIS Technician', 'Forest Health Technician', 'Planer Operator'
  ],
  fishing: [
    'Deckhand', 'Fish Plant Worker', 'Captain', 'Marine Biologist', 'Aquaculture Technician',
    'Net Mender', 'Processing Supervisor', 'Quality Assurance Technician', 'Hatchery Manager',
    'Fish Farm Manager', 'Vessel Engineer', 'Seafood Processing Worker', 'Ice House Worker',
    'Marine Mechanic', 'Fish Health Technician', 'Environmental Monitor', 'Fleet Manager'
  ],
  agriculture: [
    'Farm Manager', 'Agricultural Technician', 'Agronomist', 'Grain Elevator Operator', 'Equipment Operator',
    'Livestock Handler', 'Irrigation Specialist', 'Crop Scout', 'Precision Ag Specialist',
    'Fertilizer Applicator', 'Seed Sales Representative', 'Veterinary Technician', 'Ranch Hand',
    'Greenhouse Worker', 'Food Scientist', 'Grain Buyer', 'Agricultural Engineer', 'Farm Equipment Mechanic'
  ],
  renewable_energy: [
    'Wind Turbine Technician', 'Solar Panel Installer', 'Electrical Engineer', 'Project Manager',
    'Site Supervisor', 'Power Systems Engineer', 'Grid Operator', 'Energy Analyst', 'Maintenance Technician',
    'Construction Manager', 'Environmental Consultant', 'Hydro Operator', 'Battery Storage Technician',
    'Transmission Line Worker', 'Substation Technician', 'Renewable Energy Developer', 'SCADA Operator'
  ],
  environmental: [
    'Environmental Scientist', 'Environmental Engineer', 'Field Technician', 'GIS Analyst',
    'Remediation Specialist', 'Air Quality Specialist', 'Water Quality Analyst', 'Ecologist',
    'Environmental Consultant', 'Sustainability Coordinator', 'Waste Management Specialist',
    'Environmental Auditor', 'Hydrogeologist', 'Biologist', 'Permitting Specialist', 'EIA Coordinator'
  ]
};

const cities = {
  AB: ['Calgary', 'Edmonton', 'Fort McMurray', 'Red Deer', 'Grande Prairie', 'Lethbridge', 'Medicine Hat'],
  BC: ['Vancouver', 'Prince George', 'Kamloops', 'Kelowna', 'Fort St. John', 'Terrace', 'Nanaimo'],
  SK: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current', 'Estevan'],
  ON: ['Toronto', 'Sudbury', 'Thunder Bay', 'Timmins', 'North Bay', 'Sault Ste. Marie', 'Hamilton'],
  QC: ['Montreal', 'Quebec City', 'Val-d\'Or', 'Rouyn-Noranda', 'Sept-Îles', 'Chicoutimi'],
  NB: ['Saint John', 'Moncton', 'Fredericton', 'Bathurst', 'Miramichi'],
  NS: ['Halifax', 'Sydney', 'Yarmouth', 'Truro', 'New Glasgow'],
  NL: ['St. John\'s', 'Corner Brook', 'Labrador City', 'Happy Valley-Goose Bay'],
  MB: ['Winnipeg', 'Brandon', 'Thompson', 'Flin Flon', 'The Pas'],
  NT: ['Yellowknife', 'Hay River', 'Inuvik', 'Fort Smith'],
  YT: ['Whitehorse', 'Dawson City', 'Watson Lake'],
  NU: ['Iqaluit', 'Rankin Inlet', 'Cambridge Bay']
};

const requirements = [
  'Valid driver\'s license',
  'Ability to work in remote locations',
  'Strong communication skills',
  'Team player with leadership abilities',
  'Physically fit for demanding work',
  'Willing to work rotating shifts',
  'Safety certification required',
  'First Aid certification',
  'WHMIS certification',
  'Experience with Microsoft Office',
  'Ability to work in extreme weather conditions',
  'Background check required',
  'Drug and alcohol testing required',
];

const benefits = [
  'Competitive salary',
  'Comprehensive health benefits',
  'Dental and vision coverage',
  'RRSP matching program',
  'Paid vacation and holidays',
  'Employee assistance program',
  'Career development opportunities',
  'Relocation assistance',
  'Fly-in/fly-out schedule',
  'Camp accommodations provided',
  'Annual bonus program',
  'Life insurance',
  'Disability coverage',
  'Wellness programs',
  'Tuition reimbursement',
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateSalary(industry: string, level: string): { min: number; max: number; period: string } {
  const baseSalaries: Record<string, Record<string, number>> = {
    mining: { entry: 55000, mid: 85000, senior: 130000 },
    oil_gas: { entry: 60000, mid: 95000, senior: 150000 },
    forestry: { entry: 45000, mid: 65000, senior: 95000 },
    fishing: { entry: 40000, mid: 55000, senior: 80000 },
    agriculture: { entry: 40000, mid: 60000, senior: 90000 },
    renewable_energy: { entry: 55000, mid: 80000, senior: 120000 },
    environmental: { entry: 50000, mid: 75000, senior: 110000 },
  };

  const base = baseSalaries[industry]?.[level] || 60000;
  const variation = base * 0.15;
  const min = Math.round((base - variation) / 1000) * 1000;
  const max = Math.round((base + variation) / 1000) * 1000;

  return { min, max, period: 'yearly' };
}

function generateDescription(title: string, company: string, industry: string): string {
  const industryNames: Record<string, string> = {
    mining: 'mining and mineral extraction',
    oil_gas: 'oil and gas',
    forestry: 'forestry and lumber',
    fishing: 'fishing and aquaculture',
    agriculture: 'agriculture and food production',
    renewable_energy: 'renewable energy',
    environmental: 'environmental consulting',
  };

  return `${company} is seeking a qualified ${title} to join our ${industryNames[industry]} team. This is an excellent opportunity to work with one of Canada's leading natural resources companies.

As a ${title}, you will play a key role in our operations, contributing to safe and efficient practices while maintaining the highest standards of environmental stewardship.

We offer a dynamic work environment with opportunities for professional growth and development. Join our team of dedicated professionals who are committed to excellence in everything we do.

${company} is an equal opportunity employer committed to diversity and inclusion in the workplace.`;
}

// Generate 500+ realistic jobs
export function generateJobs(): Job[] {
  const jobs: Job[] = [];
  const industries = Object.keys(jobTitles) as Array<keyof typeof jobTitles>;
  const provinces = Object.keys(cities) as Array<keyof typeof cities>;
  const experienceLevels = ['entry', 'mid', 'senior'];
  const jobTypes = ['full_time', 'contract', 'temporary'];
  const sources = ['jobbank', 'indeed', 'linkedin', 'company'];

  let id = 1;

  // Generate jobs for each company
  for (const company of companies) {
    const companyIndustry = company.industry as keyof typeof jobTitles;
    const titles = jobTitles[companyIndustry];
    const jobCount = Math.floor(Math.random() * 15) + 5; // 5-20 jobs per company

    for (let i = 0; i < jobCount; i++) {
      const title = titles[Math.floor(Math.random() * titles.length)];
      const level = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
      const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
      const province = provinces[Math.floor(Math.random() * provinces.length)];
      const cityList = cities[province];
      const city = cityList[Math.floor(Math.random() * cityList.length)];
      const salary = generateSalary(companyIndustry, level);
      const isRemote = Math.random() < 0.1;
      const isFlyInFlyOut = !isRemote && Math.random() < 0.3;
      const postedDate = randomDate(new Date('2024-12-01'), new Date());
      const expiresDate = new Date(postedDate);
      expiresDate.setDate(expiresDate.getDate() + 30);

      jobs.push({
        id: `job-${id++}`,
        title: level === 'senior' ? `Senior ${title}` : level === 'entry' ? `Junior ${title}` : title,
        company: company.name,
        company_slug: company.slug,
        location: `${city}, ${province}`,
        city,
        province,
        industry: companyIndustry,
        job_type: jobType,
        experience_level: level,
        salary_min: Math.random() < 0.2 ? null : salary.min,
        salary_max: Math.random() < 0.2 ? null : salary.max,
        salary_period: salary.period,
        description: generateDescription(title, company.name, companyIndustry),
        requirements: getRandomItems(requirements, Math.floor(Math.random() * 5) + 4),
        benefits: getRandomItems(benefits, Math.floor(Math.random() * 6) + 5),
        is_remote: isRemote,
        is_fly_in_fly_out: isFlyInFlyOut,
        posted_at: postedDate.toISOString(),
        expires_at: expiresDate.toISOString(),
        source: sources[Math.floor(Math.random() * sources.length)],
        source_url: `https://${company.slug}.com/careers/${id}`,
        views: Math.floor(Math.random() * 5000) + 100,
        applications: Math.floor(Math.random() * 150) + 5,
        is_featured: Math.random() < 0.1,
      });
    }
  }

  // Sort by posted date (newest first)
  jobs.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());

  return jobs;
}

// Cache the generated jobs
let cachedJobs: Job[] | null = null;

export function getJobs(): Job[] {
  if (!cachedJobs) {
    cachedJobs = generateJobs();
  }
  return cachedJobs;
}

export function getJobById(id: string): Job | undefined {
  return getJobs().find(job => job.id === id);
}

export function getCompanyBySlug(slug: string) {
  return companies.find(c => c.slug === slug);
}
