-- Initialize database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- Create enum types
CREATE TYPE industry_type AS ENUM (
    'mining',
    'oil_gas',
    'forestry',
    'fishing',
    'agriculture',
    'renewable_energy',
    'environmental'
);

CREATE TYPE job_type AS ENUM (
    'full_time',
    'part_time',
    'contract',
    'temporary',
    'internship'
);

CREATE TYPE user_role AS ENUM (
    'user',
    'employer',
    'admin'
);

CREATE TYPE application_status AS ENUM (
    'pending',
    'reviewed',
    'interviewed',
    'hired',
    'rejected'
);

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE resources_job_board TO resources;
