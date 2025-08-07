-- Add job_category field to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS job_category TEXT;

-- Create index for job_category for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(job_category);

-- Update existing jobs with categories based on title and description
-- This is a one-time migration to categorize existing jobs
UPDATE jobs
SET job_category = CASE
  -- Drilling & Blasting
  WHEN title ILIKE '%driller%' OR title ILIKE '%blaster%' OR title ILIKE '%explosives%' THEN 'drilling_blasting'
  
  -- Heavy Equipment Operation
  WHEN title ILIKE '%operator%' OR title ILIKE '%excavator%' OR title ILIKE '%loader%' OR title ILIKE '%dozer%' OR title ILIKE '%haul truck%' THEN 'equipment_operation'
  
  -- Underground Mining
  WHEN title ILIKE '%underground%' OR title ILIKE '%miner%' OR title ILIKE '%mucker%' OR title ILIKE '%scaler%' THEN 'underground_mining'
  
  -- Surface Mining
  WHEN title ILIKE '%surface miner%' OR title ILIKE '%open pit%' THEN 'surface_mining'
  
  -- Rig Operations
  WHEN title ILIKE '%roughneck%' OR title ILIKE '%derrickhand%' OR title ILIKE '%rig operator%' OR title ILIKE '%floorhand%' THEN 'rig_operations'
  
  -- Pipeline
  WHEN title ILIKE '%pipeline%' OR title ILIKE '%pipelayer%' THEN 'pipeline'
  
  -- Well Services
  WHEN title ILIKE '%well%' AND (title ILIKE '%service%' OR title ILIKE '%tester%') THEN 'well_services'
  
  -- Logging
  WHEN title ILIKE '%logger%' OR title ILIKE '%faller%' OR title ILIKE '%timber%' OR title ILIKE '%harvester%' THEN 'logging'
  
  -- Sawmill
  WHEN title ILIKE '%sawmill%' OR title ILIKE '%lumber%' OR title ILIKE '%mill worker%' THEN 'sawmill'
  
  -- Silviculture
  WHEN title ILIKE '%tree planter%' OR title ILIKE '%silviculture%' OR title ILIKE '%reforestation%' THEN 'silviculture'
  
  -- Processing
  WHEN title ILIKE '%process operator%' OR title ILIKE '%mill operator%' OR title ILIKE '%crusher%' OR title ILIKE '%plant operator%' THEN 'processing'
  
  -- Chemical Treatment
  WHEN title ILIKE '%chemical%' OR title ILIKE '%water treatment%' THEN 'chemical_treatment'
  
  -- Truck Driving
  WHEN title ILIKE '%truck driver%' OR title ILIKE '%class 1%' OR title ILIKE '%class 3%' OR title ILIKE '%transport driver%' THEN 'truck_driving'
  
  -- Rail Operations
  WHEN title ILIKE '%rail%' OR title ILIKE '%locomotive%' OR title ILIKE '%train operator%' THEN 'rail_operations'
  
  -- Mechanical Maintenance
  WHEN title ILIKE '%mechanic%' OR title ILIKE '%millwright%' OR title ILIKE '%maintenance%' THEN 'mechanical'
  
  -- Electrical
  WHEN title ILIKE '%electrician%' OR title ILIKE '%electrical%' OR title ILIKE '%instrumentation%' OR title ILIKE '%lineman%' THEN 'electrical'
  
  -- Welding
  WHEN title ILIKE '%welder%' OR title ILIKE '%welding%' OR title ILIKE '%fabricator%' OR title ILIKE '%pipefitter%' THEN 'welding'
  
  -- Camp Services
  WHEN title ILIKE '%camp%' OR title ILIKE '%cook%' OR title ILIKE '%housekeeping%' OR title ILIKE '%catering%' THEN 'camp_services'
  
  -- Safety
  WHEN title ILIKE '%safety%' OR title ILIKE '%HSE%' OR title ILIKE '%emergency response%' OR title ILIKE '%first aid%' THEN 'safety'
  
  -- Security
  WHEN title ILIKE '%security%' THEN 'security'
  
  -- Surveying
  WHEN title ILIKE '%surveyor%' OR title ILIKE '%geologist%' OR title ILIKE '%geological%' THEN 'surveying'
  
  -- Laboratory
  WHEN title ILIKE '%lab%' OR title ILIKE '%assayer%' OR title ILIKE '%quality control%' OR title ILIKE '%QC%' THEN 'laboratory'
  
  -- Environmental
  WHEN title ILIKE '%environmental%' OR title ILIKE '%reclamation%' OR title ILIKE '%remediation%' THEN 'environmental'
  
  -- Wind & Solar
  WHEN title ILIKE '%wind%' OR title ILIKE '%solar%' OR title ILIKE '%turbine technician%' THEN 'wind_solar'
  
  -- Hydro Operations
  WHEN title ILIKE '%hydro%' OR title ILIKE '%dam operator%' THEN 'hydro_operations'
  
  -- Construction
  WHEN title ILIKE '%construction%' OR title ILIKE '%carpenter%' OR title ILIKE '%concrete%' OR title ILIKE '%scaffolder%' THEN 'construction'
  
  -- Power Generation
  WHEN title ILIKE '%power engineer%' OR title ILIKE '%power plant%' OR title ILIKE '%boiler operator%' THEN 'power_generation'
  
  -- Supervision
  WHEN title ILIKE '%supervisor%' OR title ILIKE '%foreman%' OR title ILIKE '%superintendent%' OR title ILIKE '%leadhand%' THEN 'supervision'
  
  -- General Labor (default)
  ELSE 'general_labor'
END
WHERE job_category IS NULL;