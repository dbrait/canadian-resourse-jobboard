export interface JobCategory {
  id: string
  name: string
  description: string
  keywords: string[]
  sector: string[]
}

export const JOB_CATEGORIES: JobCategory[] = [
  // Mining & Extraction
  {
    id: 'drilling_blasting',
    name: 'Drilling & Blasting',
    description: 'Operating drilling equipment, explosive handling, and rock breaking',
    keywords: ['driller', 'blaster', 'drill operator', 'explosives', 'rock drill', 'blast hole'],
    sector: ['mining', 'oil_gas', 'construction']
  },
  {
    id: 'equipment_operation',
    name: 'Heavy Equipment Operation',
    description: 'Operating heavy machinery like excavators, loaders, dozers, and haul trucks',
    keywords: ['operator', 'excavator', 'loader', 'dozer', 'haul truck', 'crane', 'forklift', 'heavy equipment', 'machine operator', 'equipment operator'],
    sector: ['mining', 'oil_gas', 'forestry', 'construction']
  },
  {
    id: 'underground_mining',
    name: 'Underground Mining',
    description: 'Underground operations including mucking, scaling, and ground support',
    keywords: ['underground', 'miner', 'mucker', 'scaler', 'ground support', 'bolter', 'cage tender'],
    sector: ['mining']
  },
  {
    id: 'surface_mining',
    name: 'Surface Mining',
    description: 'Open pit and surface mining operations',
    keywords: ['surface miner', 'open pit', 'shovel operator', 'dragline', 'strip mining'],
    sector: ['mining']
  },

  // Oil & Gas Specific
  {
    id: 'rig_operations',
    name: 'Rig Operations',
    description: 'Drilling rig operations and oil/gas extraction',
    keywords: ['roughneck', 'derrickhand', 'driller', 'rig operator', 'floorhand', 'motorhand', 'toolpusher', 'drilling rig'],
    sector: ['oil_gas']
  },
  {
    id: 'pipeline',
    name: 'Pipeline & Distribution',
    description: 'Pipeline construction, maintenance, and operation',
    keywords: ['pipeline', 'pipelayer', 'pipeline operator', 'pipeline technician', 'pipeline welder', 'compressor operator'],
    sector: ['oil_gas', 'utilities']
  },
  {
    id: 'well_services',
    name: 'Well Services',
    description: 'Well testing, servicing, and maintenance',
    keywords: ['well tester', 'well service', 'wireline', 'coil tubing', 'cementing', 'fracturing', 'completions'],
    sector: ['oil_gas']
  },

  // Forestry Specific
  {
    id: 'logging',
    name: 'Logging & Harvesting',
    description: 'Tree falling, bucking, and timber harvesting',
    keywords: ['logger', 'faller', 'bucker', 'choker', 'timber', 'harvester operator', 'feller buncher', 'skidder'],
    sector: ['forestry']
  },
  {
    id: 'sawmill',
    name: 'Sawmill & Processing',
    description: 'Lumber processing and mill operations',
    keywords: ['sawmill', 'saw operator', 'lumber grader', 'planer', 'kiln operator', 'mill worker', 'debarker'],
    sector: ['forestry']
  },
  {
    id: 'silviculture',
    name: 'Silviculture & Reforestation',
    description: 'Tree planting, forest management, and restoration',
    keywords: ['tree planter', 'silviculture', 'forest technician', 'reforestation', 'brusher', 'spacing'],
    sector: ['forestry']
  },

  // Processing & Production
  {
    id: 'processing',
    name: 'Processing & Refining',
    description: 'Mineral processing, ore handling, and refinery operations',
    keywords: ['mill operator', 'process operator', 'crusher operator', 'concentrator', 'smelter', 'refinery', 'plant operator'],
    sector: ['mining', 'oil_gas']
  },
  {
    id: 'chemical_treatment',
    name: 'Chemical & Treatment',
    description: 'Chemical processing and water treatment',
    keywords: ['chemical operator', 'water treatment', 'reagent', 'flotation', 'leaching', 'treatment plant'],
    sector: ['mining', 'oil_gas', 'utilities']
  },

  // Transportation & Logistics
  {
    id: 'truck_driving',
    name: 'Truck Driving',
    description: 'Commercial driving including haul trucks, logging trucks, and transport',
    keywords: ['truck driver', 'haul truck', 'transport driver', 'class 1', 'class 3', 'logging truck', 'fuel truck', 'water truck'],
    sector: ['mining', 'oil_gas', 'forestry', 'transportation']
  },
  {
    id: 'rail_operations',
    name: 'Rail Operations',
    description: 'Railway operations for resource transportation',
    keywords: ['rail operator', 'locomotive', 'railway', 'train operator', 'rail car', 'trackman'],
    sector: ['mining', 'transportation']
  },

  // Maintenance & Trades
  {
    id: 'mechanical',
    name: 'Mechanical Maintenance',
    description: 'Equipment maintenance, repair, and mechanical work',
    keywords: ['mechanic', 'millwright', 'maintenance', 'hydraulic', 'mechanical technician', 'heavy duty mechanic', 'fitter'],
    sector: ['mining', 'oil_gas', 'forestry', 'utilities']
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Electrical installation, maintenance, and instrumentation',
    keywords: ['electrician', 'electrical', 'instrumentation', 'electrical technician', 'powerline', 'lineman'],
    sector: ['mining', 'oil_gas', 'utilities', 'renewable']
  },
  {
    id: 'welding',
    name: 'Welding & Fabrication',
    description: 'Welding, cutting, and metal fabrication',
    keywords: ['welder', 'fabricator', 'welding', 'fitter', 'boilermaker', 'pipefitter', 'ironworker'],
    sector: ['mining', 'oil_gas', 'construction']
  },

  // Support & Services
  {
    id: 'camp_services',
    name: 'Camp Services',
    description: 'Camp operations including cooking, housekeeping, and facilities',
    keywords: ['camp', 'cook', 'kitchen', 'housekeeping', 'janitor', 'camp attendant', 'catering'],
    sector: ['mining', 'oil_gas', 'forestry']
  },
  {
    id: 'safety',
    name: 'Safety & Emergency Response',
    description: 'Safety coordination, emergency response, and first aid',
    keywords: ['safety', 'safety officer', 'emergency response', 'first aid', 'paramedic', 'fire', 'rescue', 'HSE'],
    sector: ['mining', 'oil_gas', 'forestry', 'utilities']
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Site security and access control',
    keywords: ['security', 'security guard', 'gatehouse', 'access control', 'patrol'],
    sector: ['mining', 'oil_gas', 'utilities']
  },

  // Technical & Specialized
  {
    id: 'surveying',
    name: 'Surveying & Geology',
    description: 'Land surveying, geological sampling, and exploration',
    keywords: ['surveyor', 'geologist', 'geological', 'sampler', 'core', 'exploration', 'geotech'],
    sector: ['mining', 'oil_gas']
  },
  {
    id: 'laboratory',
    name: 'Laboratory & Quality Control',
    description: 'Lab testing, assaying, and quality control',
    keywords: ['lab technician', 'assayer', 'laboratory', 'quality control', 'QC', 'testing', 'sampler'],
    sector: ['mining', 'oil_gas']
  },
  {
    id: 'environmental',
    name: 'Environmental & Reclamation',
    description: 'Environmental monitoring, compliance, and site reclamation',
    keywords: ['environmental', 'reclamation', 'environmental technician', 'monitoring', 'remediation', 'restoration'],
    sector: ['mining', 'oil_gas', 'forestry', 'renewable']
  },

  // Renewable Energy
  {
    id: 'wind_solar',
    name: 'Wind & Solar Operations',
    description: 'Wind turbine and solar panel installation and maintenance',
    keywords: ['wind technician', 'solar installer', 'turbine', 'solar panel', 'renewable technician'],
    sector: ['renewable']
  },
  {
    id: 'hydro_operations',
    name: 'Hydro Operations',
    description: 'Hydroelectric dam and power generation operations',
    keywords: ['hydro operator', 'dam operator', 'powerhouse', 'hydro technician', 'water management'],
    sector: ['renewable', 'utilities']
  },

  // Construction & Development
  {
    id: 'construction',
    name: 'Construction',
    description: 'Site construction, civil works, and infrastructure',
    keywords: ['construction', 'carpenter', 'concrete', 'formwork', 'rebar', 'scaffolder', 'labourer', 'builder'],
    sector: ['construction', 'mining', 'oil_gas']
  },
  {
    id: 'scaffolding',
    name: 'Scaffolding & Access',
    description: 'Scaffold erection and working at heights',
    keywords: ['scaffolder', 'scaffold', 'rope access', 'working at heights'],
    sector: ['construction', 'mining', 'oil_gas']
  },

  // Power & Utilities
  {
    id: 'power_generation',
    name: 'Power Generation',
    description: 'Power plant operations and maintenance',
    keywords: ['power engineer', 'power plant', 'generator operator', 'turbine operator', 'boiler operator'],
    sector: ['utilities', 'oil_gas']
  },
  {
    id: 'distribution',
    name: 'Power Distribution',
    description: 'Electrical distribution and grid operations',
    keywords: ['lineman', 'powerline technician', 'substation', 'grid operator', 'distribution'],
    sector: ['utilities']
  },

  // Supervision & Management
  {
    id: 'supervision',
    name: 'Supervision & Foreman',
    description: 'Team leadership and site supervision',
    keywords: ['supervisor', 'foreman', 'leadhand', 'shift boss', 'team leader', 'superintendent'],
    sector: ['mining', 'oil_gas', 'forestry', 'construction', 'utilities']
  },

  // Entry Level & General Labor
  {
    id: 'general_labor',
    name: 'General Labor',
    description: 'Entry-level positions and general site labor',
    keywords: ['labourer', 'laborer', 'helper', 'general worker', 'swamper', 'entry level', 'flagger', 'spotter'],
    sector: ['mining', 'oil_gas', 'forestry', 'construction', 'utilities']
  }
]

// Helper function to determine category based on job title and description
export function categorizeJob(title: string, description: string = ''): string {
  const combinedText = `${title} ${description}`.toLowerCase()
  
  for (const category of JOB_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (combinedText.includes(keyword.toLowerCase())) {
        return category.id
      }
    }
  }
  
  return 'general_labor' // Default category
}

// Get category by ID
export function getCategoryById(id: string): JobCategory | undefined {
  return JOB_CATEGORIES.find(cat => cat.id === id)
}

// Get categories for a specific sector
export function getCategoriesBySector(sector: string): JobCategory[] {
  return JOB_CATEGORIES.filter(cat => cat.sector.includes(sector))
}

// Get all unique category IDs
export function getAllCategoryIds(): string[] {
  return JOB_CATEGORIES.map(cat => cat.id)
}

// Get category name by ID
export function getCategoryName(id: string): string {
  const category = getCategoryById(id)
  return category ? category.name : 'General Labor'
}