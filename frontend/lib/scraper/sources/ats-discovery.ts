/**
 * ATS Discovery & Universal Scraper
 *
 * This module:
 * 1. Discovers which ATS each company uses by following their career page
 * 2. Extracts the correct API configuration
 * 3. Scrapes jobs using the appropriate method
 *
 * Supported ATS Systems:
 * - Workday (most large companies)
 * - Greenhouse (modern companies)
 * - Lever (tech-forward companies)
 * - SmartRecruiters (enterprise)
 * - iCIMS (enterprise)
 * - BambooHR (SMB)
 * - Ashby (modern startups)
 * - Recruitee (SMB)
 * - JazzHR (SMB)
 * - Jobvite (enterprise)
 */

import { ScrapedJob } from '../db';
import { generateId, slugify, parseLocation } from '../utils';

// ============================================================================
// COMPANY DATABASE - All Target Companies
// ============================================================================

interface CompanyConfig {
  name: string;
  industry: 'mining' | 'oil_gas' | 'forestry' | 'fishing' | 'agriculture' | 'renewable_energy' | 'environmental';
  careerUrl: string;
  // Optional: pre-configured ATS info if known
  ats?: 'workday' | 'greenhouse' | 'lever' | 'smartrecruiters' | 'icims' | 'bamboohr' | 'ashby' | 'taleo' | 'unknown';
  atsConfig?: Record<string, string>;
}

const ALL_COMPANIES: CompanyConfig[] = [
  // =====================================================
  // MINING - 25 Companies
  // =====================================================
  { name: 'Teck Resources', industry: 'mining', careerUrl: 'https://www.teck.com/careers/' },
  { name: 'Barrick Gold', industry: 'mining', careerUrl: 'https://www.barrick.com/English/careers/default.aspx' },
  { name: 'Kinross Gold', industry: 'mining', careerUrl: 'https://www.kinross.com/careers/' },
  { name: 'Agnico Eagle Mines', industry: 'mining', careerUrl: 'https://www.agnicoeagle.com/English/careers/default.aspx' },
  { name: 'Lundin Mining', industry: 'mining', careerUrl: 'https://lundinmining.com/careers/' },
  { name: 'First Quantum Minerals', industry: 'mining', careerUrl: 'https://www.first-quantum.com/English/careers/default.aspx' },
  { name: 'Hudbay Minerals', industry: 'mining', careerUrl: 'https://hudbayminerals.com/careers/' },
  { name: 'Cameco', industry: 'mining', careerUrl: 'https://www.cameco.com/careers/' },
  { name: 'Nutrien', industry: 'mining', careerUrl: 'https://www.nutrien.com/careers' },
  { name: 'Newmont', industry: 'mining', careerUrl: 'https://www.newmont.com/careers/' },
  { name: 'Pan American Silver', industry: 'mining', careerUrl: 'https://www.panamericansilver.com/careers/' },
  { name: 'Eldorado Gold', industry: 'mining', careerUrl: 'https://www.eldoradogold.com/careers/' },
  { name: 'IAMGOLD', industry: 'mining', careerUrl: 'https://www.iamgold.com/English/careers/default.aspx' },
  { name: 'Centerra Gold', industry: 'mining', careerUrl: 'https://www.centerragold.com/careers' },
  { name: 'SSR Mining', industry: 'mining', careerUrl: 'https://www.ssrmining.com/careers/' },
  { name: 'Torex Gold', industry: 'mining', careerUrl: 'https://www.torexgold.com/careers/' },
  { name: 'Capstone Copper', industry: 'mining', careerUrl: 'https://capstonecopper.com/careers/' },
  { name: 'Copper Mountain Mining', industry: 'mining', careerUrl: 'https://cumtn.com/careers/' },
  { name: 'Imperial Metals', industry: 'mining', careerUrl: 'https://www.imperialmetals.com/careers' },
  { name: 'Taseko Mines', industry: 'mining', careerUrl: 'https://www.tasekomines.com/careers' },
  { name: 'Vale Canada', industry: 'mining', careerUrl: 'https://www.vale.com/canada/EN/careers' },
  { name: 'Glencore Canada', industry: 'mining', careerUrl: 'https://www.glencore.ca/careers' },
  { name: 'ArcelorMittal Canada', industry: 'mining', careerUrl: 'https://canada.arcelormittal.com/careers' },
  { name: 'Rio Tinto', industry: 'mining', careerUrl: 'https://www.riotinto.com/careers' },
  { name: 'BHP', industry: 'mining', careerUrl: 'https://www.bhp.com/careers' },

  // =====================================================
  // OIL & GAS - 30 Companies
  // =====================================================
  { name: 'Suncor Energy', industry: 'oil_gas', careerUrl: 'https://www.suncor.com/en-ca/careers' },
  { name: 'Canadian Natural Resources', industry: 'oil_gas', careerUrl: 'https://www.cnrl.com/careers' },
  { name: 'Cenovus Energy', industry: 'oil_gas', careerUrl: 'https://www.cenovus.com/careers' },
  { name: 'Imperial Oil', industry: 'oil_gas', careerUrl: 'https://www.imperialoil.ca/en-ca/careers' },
  { name: 'TC Energy', industry: 'oil_gas', careerUrl: 'https://www.tcenergy.com/careers/' },
  { name: 'Enbridge', industry: 'oil_gas', careerUrl: 'https://www.enbridge.com/careers' },
  { name: 'Pembina Pipeline', industry: 'oil_gas', careerUrl: 'https://www.pembina.com/careers/' },
  { name: 'MEG Energy', industry: 'oil_gas', careerUrl: 'https://www.megenergy.com/careers' },
  { name: 'Tourmaline Oil', industry: 'oil_gas', careerUrl: 'https://www.tourmalineoil.com/careers/' },
  { name: 'ARC Resources', industry: 'oil_gas', careerUrl: 'https://www.arcresources.com/careers/' },
  { name: 'Whitecap Resources', industry: 'oil_gas', careerUrl: 'https://www.wcap.ca/careers/' },
  { name: 'Crescent Point Energy', industry: 'oil_gas', careerUrl: 'https://www.crescentpointenergy.com/careers' },
  { name: 'Vermilion Energy', industry: 'oil_gas', careerUrl: 'https://www.vermilionenergy.com/careers' },
  { name: 'Peyto Exploration', industry: 'oil_gas', careerUrl: 'https://www.peyto.com/careers/' },
  { name: 'Paramount Resources', industry: 'oil_gas', careerUrl: 'https://www.paramountres.com/careers' },
  { name: 'Birchcliff Energy', industry: 'oil_gas', careerUrl: 'https://www.birchcliffenergy.com/careers/' },
  { name: 'Keyera', industry: 'oil_gas', careerUrl: 'https://www.keyera.com/careers/' },
  { name: 'AltaGas', industry: 'oil_gas', careerUrl: 'https://www.altagas.ca/careers' },
  { name: 'Inter Pipeline', industry: 'oil_gas', careerUrl: 'https://www.interpipeline.com/careers/' },
  { name: 'Precision Drilling', industry: 'oil_gas', careerUrl: 'https://www.precisiondrilling.com/careers/' },
  { name: 'Ensign Energy Services', industry: 'oil_gas', careerUrl: 'https://www.ensignenergy.com/careers/' },
  { name: 'Trican Well Service', industry: 'oil_gas', careerUrl: 'https://www.trican.ca/careers/' },
  { name: 'STEP Energy Services', industry: 'oil_gas', careerUrl: 'https://www.stepenergyservices.com/careers/' },
  { name: 'Secure Energy', industry: 'oil_gas', careerUrl: 'https://www.secure-energy.com/careers' },
  { name: 'Tervita', industry: 'oil_gas', careerUrl: 'https://www.tervita.com/careers/' },
  { name: 'Gibson Energy', industry: 'oil_gas', careerUrl: 'https://www.gibsonenergy.com/careers/' },
  { name: 'Freehold Royalties', industry: 'oil_gas', careerUrl: 'https://www.freeholdroyalties.com/contact/' },
  { name: 'Athabasca Oil', industry: 'oil_gas', careerUrl: 'https://www.atha.com/careers/' },
  { name: 'Tamarack Valley Energy', industry: 'oil_gas', careerUrl: 'https://www.tamarackvalley.ca/careers/' },
  { name: 'NuVista Energy', industry: 'oil_gas', careerUrl: 'https://www.nuvistaenergy.com/careers/' },

  // =====================================================
  // FORESTRY - 15 Companies
  // =====================================================
  { name: 'West Fraser Timber', industry: 'forestry', careerUrl: 'https://www.westfraser.com/careers' },
  { name: 'Canfor Corporation', industry: 'forestry', careerUrl: 'https://www.canfor.com/careers' },
  { name: 'Resolute Forest Products', industry: 'forestry', careerUrl: 'https://www.resolutefp.com/careers/' },
  { name: 'Interfor Corporation', industry: 'forestry', careerUrl: 'https://www.interfor.com/careers/' },
  { name: 'Mercer International', industry: 'forestry', careerUrl: 'https://www.mercerint.com/careers/' },
  { name: 'Western Forest Products', industry: 'forestry', careerUrl: 'https://www.westernforest.com/careers/' },
  { name: 'Tolko Industries', industry: 'forestry', careerUrl: 'https://www.tolko.com/careers/' },
  { name: 'Doman Building Materials', industry: 'forestry', careerUrl: 'https://www.domanbm.com/careers/' },
  { name: 'Stella-Jones', industry: 'forestry', careerUrl: 'https://www.stella-jones.com/en/careers' },
  { name: 'Kruger Products', industry: 'forestry', careerUrl: 'https://www.krugerproducts.ca/careers' },
  { name: 'Cascades', industry: 'forestry', careerUrl: 'https://www.cascades.com/en/careers' },
  { name: 'Paper Excellence', industry: 'forestry', careerUrl: 'https://www.paperexcellence.com/careers/' },
  { name: 'Conifex Timber', industry: 'forestry', careerUrl: 'https://www.conifex.com/careers/' },
  { name: 'Millar Western', industry: 'forestry', careerUrl: 'https://www.millarwestern.com/careers/' },
  { name: 'Louisiana-Pacific Canada', industry: 'forestry', careerUrl: 'https://www.lpcorp.com/careers/' },

  // =====================================================
  // FISHING & AQUACULTURE - 12 Companies
  // =====================================================
  { name: 'Cooke Aquaculture', industry: 'fishing', careerUrl: 'https://www.cookeaqua.com/careers/' },
  { name: 'Mowi Canada West', industry: 'fishing', careerUrl: 'https://mowi.com/careers/' },
  { name: 'Cermaq Canada', industry: 'fishing', careerUrl: 'https://www.cermaq.com/careers' },
  { name: 'Grieg Seafood BC', industry: 'fishing', careerUrl: 'https://www.griegseafood.com/careers/' },
  { name: 'Clearwater Seafoods', industry: 'fishing', careerUrl: 'https://www.clearwater.ca/careers/' },
  { name: 'High Liner Foods', industry: 'fishing', careerUrl: 'https://www.highlinerfoods.com/en/careers/' },
  { name: 'Ocean Choice International', industry: 'fishing', careerUrl: 'https://www.oceanchoice.com/careers/' },
  { name: 'Barry Group', industry: 'fishing', careerUrl: 'https://www.barrygroup.com/careers/' },
  { name: 'Premium Brands Holdings', industry: 'fishing', careerUrl: 'https://www.premiumbrands.ca/careers/' },
  { name: 'Albion Fisheries', industry: 'fishing', careerUrl: 'https://www.albionfisheries.com/careers/' },
  { name: 'Canadian Fishing Company', industry: 'fishing', careerUrl: 'https://www.canfisco.com/careers/' },
  { name: 'Icicle Seafoods', industry: 'fishing', careerUrl: 'https://www.icicleseafoods.com/careers/' },

  // =====================================================
  // AGRICULTURE - 20 Companies
  // =====================================================
  { name: 'Richardson International', industry: 'agriculture', careerUrl: 'https://www.richardson.ca/careers/' },
  { name: 'Viterra', industry: 'agriculture', careerUrl: 'https://www.viterra.ca/en/careers' },
  { name: 'Cargill Canada', industry: 'agriculture', careerUrl: 'https://careers.cargill.com/en' },
  { name: 'Maple Leaf Foods', industry: 'agriculture', careerUrl: 'https://www.mapleleaffoods.com/careers/' },
  { name: 'Saputo', industry: 'agriculture', careerUrl: 'https://www.saputo.com/en/careers' },
  { name: 'Agropur', industry: 'agriculture', careerUrl: 'https://www.agropur.com/en/careers' },
  { name: 'Lactalis Canada', industry: 'agriculture', careerUrl: 'https://www.lactalis.ca/en/careers/' },
  { name: 'Olymel', industry: 'agriculture', careerUrl: 'https://www.olymel.com/en/careers/' },
  { name: 'Sofina Foods', industry: 'agriculture', careerUrl: 'https://www.sofinafoods.com/careers/' },
  { name: 'AGT Food and Ingredients', industry: 'agriculture', careerUrl: 'https://www.agtfoods.com/careers/' },
  { name: 'Parrish & Heimbecker', industry: 'agriculture', careerUrl: 'https://www.parrishandheimbecker.com/careers/' },
  { name: 'G3 Canada', industry: 'agriculture', careerUrl: 'https://www.g3.ca/careers/' },
  { name: 'Bunge Canada', industry: 'agriculture', careerUrl: 'https://www.bunge.com/careers' },
  { name: 'Louis Dreyfus Canada', industry: 'agriculture', careerUrl: 'https://www.ldc.com/careers/' },
  { name: 'Ag Growth International', industry: 'agriculture', careerUrl: 'https://www.aggrowth.com/en-us/careers' },
  { name: 'Rocky Mountain Equipment', industry: 'agriculture', careerUrl: 'https://www.rockymtn.com/careers/' },
  { name: 'Cervus Equipment', industry: 'agriculture', careerUrl: 'https://cervusequipment.com/careers/' },
  { name: 'United Farmers of Alberta', industry: 'agriculture', careerUrl: 'https://www.ufa.com/careers/' },
  { name: 'Federated Co-operatives', industry: 'agriculture', careerUrl: 'https://www.fcl.crs/careers' },
  { name: 'Sollio Cooperative Group', industry: 'agriculture', careerUrl: 'https://www.sollio.coop/en/careers' },

  // =====================================================
  // RENEWABLE ENERGY - 15 Companies
  // =====================================================
  { name: 'TransAlta', industry: 'renewable_energy', careerUrl: 'https://transalta.com/careers/' },
  { name: 'Capital Power', industry: 'renewable_energy', careerUrl: 'https://www.capitalpower.com/careers/' },
  { name: 'Northland Power', industry: 'renewable_energy', careerUrl: 'https://www.northlandpower.com/careers' },
  { name: 'Brookfield Renewable', industry: 'renewable_energy', careerUrl: 'https://www.brookfieldrenewable.com/careers' },
  { name: 'Innergex', industry: 'renewable_energy', careerUrl: 'https://www.innergex.com/careers/' },
  { name: 'Boralex', industry: 'renewable_energy', careerUrl: 'https://www.boralex.com/en/careers/' },
  { name: 'Algonquin Power', industry: 'renewable_energy', careerUrl: 'https://algonquinpower.com/careers/' },
  { name: 'Pattern Energy', industry: 'renewable_energy', careerUrl: 'https://patternenergy.com/careers/' },
  { name: 'BluEarth Renewables', industry: 'renewable_energy', careerUrl: 'https://bluearthrenewables.com/careers/' },
  { name: 'Potentia Renewables', industry: 'renewable_energy', careerUrl: 'https://potentiarenewables.com/careers/' },
  { name: 'Bullfrog Power', industry: 'renewable_energy', careerUrl: 'https://www.bullfrogpower.com/careers/' },
  { name: 'Spark Power', industry: 'renewable_energy', careerUrl: 'https://www.sparkpowercorp.com/careers/' },
  { name: 'Hydro-Québec', industry: 'renewable_energy', careerUrl: 'https://www.hydroquebec.com/careers/' },
  { name: 'BC Hydro', industry: 'renewable_energy', careerUrl: 'https://www.bchydro.com/careers.html' },
  { name: 'Ontario Power Generation', industry: 'renewable_energy', careerUrl: 'https://www.opg.com/careers/' },

  // =====================================================
  // ENVIRONMENTAL CONSULTING - 20 Companies
  // =====================================================
  { name: 'Stantec', industry: 'environmental', careerUrl: 'https://www.stantec.com/en/careers' },
  { name: 'WSP', industry: 'environmental', careerUrl: 'https://www.wsp.com/en-ca/careers' },
  { name: 'AECOM', industry: 'environmental', careerUrl: 'https://aecom.jobs/' },
  { name: 'SNC-Lavalin', industry: 'environmental', careerUrl: 'https://www.snclavalin.com/en/careers' },
  { name: 'Hatch', industry: 'environmental', careerUrl: 'https://www.hatch.com/en/Careers' },
  { name: 'Jacobs', industry: 'environmental', careerUrl: 'https://www.jacobs.com/careers' },
  { name: 'Wood PLC', industry: 'environmental', careerUrl: 'https://www.woodplc.com/careers' },
  { name: 'Tetra Tech', industry: 'environmental', careerUrl: 'https://www.tetratech.com/careers/' },
  { name: 'GHD', industry: 'environmental', careerUrl: 'https://www.ghd.com/en/careers/' },
  { name: 'Arcadis', industry: 'environmental', careerUrl: 'https://www.arcadis.com/en/careers' },
  { name: 'ERM', industry: 'environmental', careerUrl: 'https://www.erm.com/careers/' },
  { name: 'Golder Associates', industry: 'environmental', careerUrl: 'https://www.golder.com/careers/' },
  { name: 'Matrix Solutions', industry: 'environmental', careerUrl: 'https://www.matrix-solutions.com/careers/' },
  { name: 'Dillon Consulting', industry: 'environmental', careerUrl: 'https://www.dillon.ca/careers' },
  { name: 'Associated Engineering', industry: 'environmental', careerUrl: 'https://www.ae.ca/careers' },
  { name: 'Klohn Crippen Berger', industry: 'environmental', careerUrl: 'https://www.klohn.com/careers/' },
  { name: 'Hatfield Consultants', industry: 'environmental', careerUrl: 'https://www.hatfieldgroup.com/careers/' },
  { name: 'Intrinsik', industry: 'environmental', careerUrl: 'https://www.intrinsik.com/careers/' },
  { name: 'SLR Consulting', industry: 'environmental', careerUrl: 'https://www.slrconsulting.com/careers/' },
  { name: 'Englobe', industry: 'environmental', careerUrl: 'https://www.englobecorp.com/careers/' },
];

// ============================================================================
// ATS DETECTION PATTERNS
// ============================================================================

interface ATSDetectionResult {
  ats: string;
  apiUrl?: string;
  config?: Record<string, string>;
}

const ATS_PATTERNS = [
  {
    name: 'workday',
    urlPatterns: [/myworkdayjobs\.com/, /myworkday\.com/],
    extract: (url: string, html: string): ATSDetectionResult | null => {
      // Workday URLs have format: https://{company}.wd{N}.myworkdayjobs.com/{locale}/{site}
      // Example: https://tcenergy.wd3.myworkdayjobs.com/en-US/CAREER_SITE_TC
      // We need to extract: subdomain=tcenergy, wdNumber=wd3, site=CAREER_SITE_TC

      // Find all Workday URLs in the HTML
      const workdayUrlPattern = /https?:\/\/([a-z0-9-]+)\.wd(\d+)\.myworkdayjobs\.com\/([^\s"'<>]+)/gi;
      const allUrls = Array.from(html.matchAll(workdayUrlPattern));

      for (const match of allUrls) {
        const subdomain = match[1];
        const wdNumber = match[2];
        const pathPart = match[3].split('?')[0]; // Remove query string

        // Split path into segments: e.g., "en-US/CAREER_SITE_TC" -> ["en-US", "CAREER_SITE_TC"]
        const segments = pathPart.split('/').filter(s => s.length > 0);

        // Find the site token - it's NOT a locale (not like en-XX or fr-XX)
        const localePattern = /^[a-z]{2}-[A-Z]{2}$/;
        let site: string | null = null;

        for (const segment of segments) {
          if (!localePattern.test(segment) && segment.length > 3) {
            site = segment;
            break;
          }
        }

        if (site) {
          return {
            ats: 'workday',
            config: {
              subdomain,
              wdNumber: `wd${wdNumber}`,
              site,
            },
          };
        }
      }

      // Also check the final URL if it's a Workday redirect
      const urlMatch = url.match(/https?:\/\/([a-z0-9-]+)\.wd(\d+)\.myworkdayjobs\.com\/([^\s"'<>?]+)/i);
      if (urlMatch) {
        const segments = urlMatch[3].split('/').filter(s => s.length > 0);
        const localePattern = /^[a-z]{2}-[A-Z]{2}$/;

        for (const segment of segments) {
          if (!localePattern.test(segment) && segment.length > 3) {
            return {
              ats: 'workday',
              config: {
                subdomain: urlMatch[1],
                wdNumber: `wd${urlMatch[2]}`,
                site: segment,
              },
            };
          }
        }
      }

      return null;
    },
  },
  {
    name: 'greenhouse',
    urlPatterns: [/greenhouse\.io/, /boards\.greenhouse\.io/],
    extract: (url: string, html: string): ATSDetectionResult | null => {
      // Pattern: boards.greenhouse.io/{token} or job-boards.greenhouse.io/{token}
      const match = url.match(/(?:boards|job-boards)\.greenhouse\.io\/([a-z0-9-]+)/i);
      if (match) {
        return {
          ats: 'greenhouse',
          config: { token: match[1] },
        };
      }
      // Check HTML for embedded greenhouse
      const htmlMatch = html.match(/(?:boards|job-boards)\.greenhouse\.io\/([a-z0-9-]+)/i);
      if (htmlMatch) {
        return {
          ats: 'greenhouse',
          config: { token: htmlMatch[1] },
        };
      }
      return null;
    },
  },
  {
    name: 'lever',
    urlPatterns: [/lever\.co/, /jobs\.lever\.co/],
    extract: (url: string, html: string): ATSDetectionResult | null => {
      // Pattern: jobs.lever.co/{company}
      const match = url.match(/jobs\.lever\.co\/([a-z0-9-]+)/i);
      if (match) {
        return {
          ats: 'lever',
          config: { company: match[1] },
        };
      }
      const htmlMatch = html.match(/jobs\.lever\.co\/([a-z0-9-]+)/i);
      if (htmlMatch) {
        return {
          ats: 'lever',
          config: { company: htmlMatch[1] },
        };
      }
      return null;
    },
  },
  {
    name: 'smartrecruiters',
    urlPatterns: [/smartrecruiters\.com/, /jobs\.smartrecruiters\.com/],
    extract: (url: string, html: string): ATSDetectionResult | null => {
      // Pattern: jobs.smartrecruiters.com/{company}
      const match = url.match(/jobs\.smartrecruiters\.com\/([a-zA-Z0-9-]+)/i);
      if (match) {
        return {
          ats: 'smartrecruiters',
          config: { companyId: match[1] },
        };
      }
      return null;
    },
  },
  {
    name: 'icims',
    urlPatterns: [/icims\.com/],
    extract: (url: string, html: string): ATSDetectionResult | null => {
      // Pattern: careers-{company}.icims.com
      const match = url.match(/careers[.-]([a-z0-9-]+)\.icims\.com/i);
      if (match) {
        return {
          ats: 'icims',
          config: { company: match[1] },
        };
      }
      return null;
    },
  },
  {
    name: 'bamboohr',
    urlPatterns: [/bamboohr\.com/],
    extract: (url: string, html: string): ATSDetectionResult | null => {
      // Pattern: {company}.bamboohr.com
      const match = url.match(/([a-z0-9-]+)\.bamboohr\.com/i);
      if (match) {
        return {
          ats: 'bamboohr',
          config: { company: match[1] },
        };
      }
      return null;
    },
  },
  {
    name: 'ashby',
    urlPatterns: [/ashbyhq\.com/],
    extract: (url: string, html: string): ATSDetectionResult | null => {
      const match = url.match(/jobs\.ashbyhq\.com\/([a-z0-9-]+)/i);
      if (match) {
        return {
          ats: 'ashby',
          config: { company: match[1] },
        };
      }
      return null;
    },
  },
  {
    name: 'recruitee',
    urlPatterns: [/recruitee\.com/],
    extract: (url: string, html: string): ATSDetectionResult | null => {
      const match = url.match(/([a-z0-9-]+)\.recruitee\.com/i);
      if (match) {
        return {
          ats: 'recruitee',
          config: { company: match[1] },
        };
      }
      return null;
    },
  },
  {
    name: 'jobvite',
    urlPatterns: [/jobvite\.com/, /jobs\.jobvite\.com/],
    extract: (url: string, html: string): ATSDetectionResult | null => {
      const match = url.match(/jobs\.jobvite\.com\/([a-z0-9-]+)/i);
      if (match) {
        return {
          ats: 'jobvite',
          config: { company: match[1] },
        };
      }
      return null;
    },
  },
  {
    name: 'taleo',
    urlPatterns: [/taleo\.net/],
    extract: (url: string, html: string): ATSDetectionResult | null => {
      return {
        ats: 'taleo',
        config: { url },
      };
    },
  },
];

// ============================================================================
// ATS DISCOVERY FUNCTION
// ============================================================================

async function discoverATS(careerUrl: string): Promise<ATSDetectionResult | null> {
  try {
    // Fetch the career page with redirect following
    const response = await fetch(careerUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return null;
    }

    const finalUrl = response.url;
    const html = await response.text();

    // Check each ATS pattern
    for (const pattern of ATS_PATTERNS) {
      // Check if URL matches
      for (const urlPattern of pattern.urlPatterns) {
        if (urlPattern.test(finalUrl) || urlPattern.test(html)) {
          const result = pattern.extract(finalUrl, html);
          if (result) {
            return result;
          }
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// ATS-SPECIFIC SCRAPERS
// ============================================================================

async function scrapeWorkday(
  config: Record<string, string>,
  companyName: string,
  industry: string
): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const { subdomain, wdNumber, site } = config;

  try {
    const apiUrl = `https://${subdomain}.${wdNumber}.myworkdayjobs.com/wday/cxs/${subdomain}/${site}/jobs`;
    console.log(`    Workday API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit: 100,
        offset: 0,
        searchText: '',
      }),
    });

    if (!response.ok) {
      console.log(`    Workday API returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`    Workday returned ${data.total || 0} total jobs`);

    if (!data.jobPostings) {
      console.log(`    No jobPostings in response`);
      return [];
    }

    let canadianCount = 0;
    for (const job of data.jobPostings) {
      const location = job.locationsText || 'Canada';
      const path = job.externalPath || '';

      // Check both location text AND the URL path for Canadian locations
      // Some jobs show "2 Locations" but have Calgary in the path
      const isCanadian = isCanadianLocation(location) || isCanadianLocation(path);

      if (!isCanadian) continue;
      canadianCount++;

      const { province } = parseLocation(location) || parseLocation(path);

      jobs.push({
        id: generateId(),
        title: job.title,
        company: companyName,
        company_slug: slugify(companyName),
        location,
        province,
        industry: industry as any,
        job_type: 'full_time',
        description: `${job.title} at ${companyName}.\n\n${job.bulletFields?.join('\n') || ''}`,
        requirements: job.bulletFields || [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: location.toLowerCase().includes('remote'),
        is_fly_in_fly_out: location.toLowerCase().includes('camp') || location.toLowerCase().includes('fort mcmurray'),
        posted_at: job.postedOn || new Date().toISOString(),
        expires_at: null,
        source: 'workday',
        source_url: `https://${subdomain}.${wdNumber}.myworkdayjobs.com${job.externalPath}`,
        scraped_at: new Date().toISOString(),
      });
    }
    console.log(`    Found ${canadianCount} Canadian jobs`);
  } catch (error) {
    console.log(`    Workday error: ${error}`);
  }

  return jobs;
}

async function scrapeGreenhouse(
  config: Record<string, string>,
  companyName: string,
  industry: string
): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const { token } = config;

  try {
    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResourcesJobBoard/1.0',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.jobs) return [];

    for (const job of data.jobs) {
      const location = job.location?.name || 'Canada';

      if (!isCanadianLocation(location) && !location.toLowerCase().includes('remote')) continue;

      const { province } = parseLocation(location);
      const description = job.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';

      jobs.push({
        id: generateId(),
        title: job.title,
        company: companyName,
        company_slug: slugify(companyName),
        location,
        province,
        industry: industry as any,
        job_type: 'full_time',
        description: description.slice(0, 5000) || `${job.title} at ${companyName}`,
        requirements: [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: location.toLowerCase().includes('remote'),
        is_fly_in_fly_out: false,
        posted_at: job.updated_at || new Date().toISOString(),
        expires_at: null,
        source: 'greenhouse',
        source_url: job.absolute_url,
        scraped_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Silent fail
  }

  return jobs;
}

async function scrapeLever(
  config: Record<string, string>,
  companyName: string,
  industry: string
): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const { company } = config;

  try {
    const apiUrl = `https://api.lever.co/v0/postings/${company}?mode=json`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResourcesJobBoard/1.0',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    for (const job of data) {
      const location = job.categories?.location || 'Canada';

      if (!isCanadianLocation(location) && !location.toLowerCase().includes('remote')) continue;

      const { province } = parseLocation(location);

      jobs.push({
        id: generateId(),
        title: job.text,
        company: companyName,
        company_slug: slugify(companyName),
        location,
        province,
        industry: industry as any,
        job_type: 'full_time',
        description: job.descriptionPlain || `${job.text} at ${companyName}`,
        requirements: [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: location.toLowerCase().includes('remote'),
        is_fly_in_fly_out: false,
        posted_at: new Date(job.createdAt).toISOString(),
        expires_at: null,
        source: 'lever',
        source_url: job.hostedUrl,
        scraped_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Silent fail
  }

  return jobs;
}

async function scrapeSmartRecruiters(
  config: Record<string, string>,
  companyName: string,
  industry: string
): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const { companyId } = config;

  try {
    const apiUrl = `https://api.smartrecruiters.com/v1/companies/${companyId}/postings`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResourcesJobBoard/1.0',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.content) return [];

    for (const job of data.content) {
      const location = job.location?.city
        ? `${job.location.city}, ${job.location.region || job.location.country}`
        : 'Canada';

      if (!isCanadianLocation(location)) continue;

      const { province } = parseLocation(location);

      jobs.push({
        id: generateId(),
        title: job.name,
        company: companyName,
        company_slug: slugify(companyName),
        location,
        province,
        industry: industry as any,
        job_type: 'full_time',
        description: `${job.name} at ${companyName}`,
        requirements: [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: job.location?.remote || false,
        is_fly_in_fly_out: false,
        posted_at: job.releasedDate || new Date().toISOString(),
        expires_at: null,
        source: 'smartrecruiters',
        source_url: job.ref || `https://jobs.smartrecruiters.com/${companyId}`,
        scraped_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Silent fail
  }

  return jobs;
}

async function scrapeBambooHR(
  config: Record<string, string>,
  companyName: string,
  industry: string
): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const { company } = config;

  try {
    const apiUrl = `https://${company}.bamboohr.com/careers/list`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResourcesJobBoard/1.0',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.result) return [];

    for (const job of data.result) {
      const location = job.location?.city || 'Canada';

      if (!isCanadianLocation(location)) continue;

      const { province } = parseLocation(location);

      jobs.push({
        id: generateId(),
        title: job.jobOpeningName,
        company: companyName,
        company_slug: slugify(companyName),
        location,
        province,
        industry: industry as any,
        job_type: 'full_time',
        description: job.description || `${job.jobOpeningName} at ${companyName}`,
        requirements: [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: false,
        is_fly_in_fly_out: false,
        posted_at: new Date().toISOString(),
        expires_at: null,
        source: 'bamboohr',
        source_url: `https://${company}.bamboohr.com/careers/${job.id}`,
        scraped_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Silent fail
  }

  return jobs;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isCanadianLocation(location: string): boolean {
  const lower = location.toLowerCase();
  return (
    lower.includes('canada') ||
    lower.includes('calgary') ||
    lower.includes('edmonton') ||
    lower.includes('vancouver') ||
    lower.includes('toronto') ||
    lower.includes('montreal') ||
    lower.includes('ottawa') ||
    lower.includes('winnipeg') ||
    lower.includes('saskatoon') ||
    lower.includes('regina') ||
    lower.includes('halifax') ||
    lower.includes('victoria') ||
    lower.includes('quebec') ||
    lower.includes('fort mcmurray') ||
    lower.includes('fort mac') ||
    lower.includes('red deer') ||
    lower.includes('lethbridge') ||
    lower.includes('kelowna') ||
    lower.includes('surrey') ||
    lower.includes('burnaby') ||
    lower.includes('mississauga') ||
    lower.includes('brampton') ||
    lower.includes('hamilton') ||
    lower.includes('london, on') ||
    lower.includes('kitchener') ||
    lower.includes('st. john') ||
    lower.includes('moncton') ||
    lower.includes('charlottetown') ||
    lower.includes(', ab') ||
    lower.includes(', bc') ||
    lower.includes(', on') ||
    lower.includes(', qc') ||
    lower.includes(', sk') ||
    lower.includes(', mb') ||
    lower.includes(', ns') ||
    lower.includes(', nb') ||
    lower.includes(', nl') ||
    lower.includes(', pe') ||
    lower.includes(', nt') ||
    lower.includes(', nu') ||
    lower.includes(', yt') ||
    lower.includes('alberta') ||
    lower.includes('british columbia') ||
    lower.includes('ontario') ||
    lower.includes('saskatchewan') ||
    lower.includes('manitoba') ||
    lower.includes('nova scotia') ||
    lower.includes('new brunswick')
  );
}

// ============================================================================
// MAIN SCRAPER FUNCTION
// ============================================================================

export async function scrapeAllCompanies(): Promise<ScrapedJob[]> {
  console.log('\n========================================');
  console.log('ATS DISCOVERY & SCRAPING');
  console.log(`Total companies: ${ALL_COMPANIES.length}`);
  console.log('========================================\n');

  const allJobs: ScrapedJob[] = [];
  const stats = {
    total: ALL_COMPANIES.length,
    discovered: 0,
    scraped: 0,
    jobs: 0,
    byAts: {} as Record<string, { discovered: number; jobs: number }>,
    byIndustry: {} as Record<string, number>,
  };

  for (const company of ALL_COMPANIES) {
    console.log(`\n[${ALL_COMPANIES.indexOf(company) + 1}/${ALL_COMPANIES.length}] ${company.name}`);
    console.log(`  Industry: ${company.industry}`);
    console.log(`  URL: ${company.careerUrl}`);

    // Discover ATS
    const atsInfo = await discoverATS(company.careerUrl);

    if (!atsInfo) {
      console.log(`  ❌ Could not discover ATS`);
      continue;
    }

    console.log(`  ✓ Detected: ${atsInfo.ats}`);
    if (atsInfo.config) {
      console.log(`  Config: ${JSON.stringify(atsInfo.config)}`);
    }

    stats.discovered++;
    if (!stats.byAts[atsInfo.ats]) {
      stats.byAts[atsInfo.ats] = { discovered: 0, jobs: 0 };
    }
    stats.byAts[atsInfo.ats].discovered++;

    // Scrape based on ATS type
    let jobs: ScrapedJob[] = [];

    switch (atsInfo.ats) {
      case 'workday':
        if (atsInfo.config) {
          jobs = await scrapeWorkday(atsInfo.config, company.name, company.industry);
        }
        break;
      case 'greenhouse':
        if (atsInfo.config) {
          jobs = await scrapeGreenhouse(atsInfo.config, company.name, company.industry);
        }
        break;
      case 'lever':
        if (atsInfo.config) {
          jobs = await scrapeLever(atsInfo.config, company.name, company.industry);
        }
        break;
      case 'smartrecruiters':
        if (atsInfo.config) {
          jobs = await scrapeSmartRecruiters(atsInfo.config, company.name, company.industry);
        }
        break;
      case 'bamboohr':
        if (atsInfo.config) {
          jobs = await scrapeBambooHR(atsInfo.config, company.name, company.industry);
        }
        break;
      default:
        console.log(`  ⚠️ No scraper for ${atsInfo.ats}`);
    }

    if (jobs.length > 0) {
      console.log(`  ✓ Found ${jobs.length} Canadian jobs`);
      allJobs.push(...jobs);
      stats.scraped++;
      stats.jobs += jobs.length;
      stats.byAts[atsInfo.ats].jobs += jobs.length;

      if (!stats.byIndustry[company.industry]) {
        stats.byIndustry[company.industry] = 0;
      }
      stats.byIndustry[company.industry] += jobs.length;
    } else {
      console.log(`  No Canadian jobs found`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Print summary
  console.log('\n========================================');
  console.log('SCRAPING COMPLETE');
  console.log('========================================');
  console.log(`Companies checked: ${stats.total}`);
  console.log(`ATS discovered: ${stats.discovered}`);
  console.log(`Companies with jobs: ${stats.scraped}`);
  console.log(`Total jobs found: ${stats.jobs}`);
  console.log('\nBy ATS:');
  for (const [ats, data] of Object.entries(stats.byAts)) {
    console.log(`  ${ats}: ${data.discovered} companies, ${data.jobs} jobs`);
  }
  console.log('\nBy Industry:');
  for (const [industry, count] of Object.entries(stats.byIndustry)) {
    console.log(`  ${industry}: ${count} jobs`);
  }
  console.log('========================================\n');

  return allJobs;
}

export { ALL_COMPANIES };
export default scrapeAllCompanies;
