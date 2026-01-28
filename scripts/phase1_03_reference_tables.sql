-- Phase 1, Step 3: Reference Tables (Corrected)
SET search_path TO public, extensions;

-- 1. Languages
CREATE TABLE IF NOT EXISTS languages (
  code VARCHAR(10) PRIMARY KEY,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  flag_emoji VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enforce only one default language via partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_languages_one_default ON languages(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_languages_active ON languages(is_active) WHERE is_active = TRUE;

-- 2. Currencies
CREATE TABLE IF NOT EXISTS currencies (
  code VARCHAR(3) PRIMARY KEY,
  name TEXT NOT NULL,
  symbol VARCHAR(10),
  decimals INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  exchange_rate_to_usd NUMERIC(12,6),
  last_updated TIMESTAMPTZ
);

-- 3. Countries
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iso2 VARCHAR(2) UNIQUE NOT NULL,
  iso3 VARCHAR(3) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  native_name TEXT,
  currency_code VARCHAR(3) REFERENCES currencies(code),
  phone_code VARCHAR(10),
  continent VARCHAR(50),
  flag_emoji VARCHAR(10),
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_countries_iso2 ON countries(iso2);

-- 4. Species
CREATE TABLE IF NOT EXISTS species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name_key VARCHAR(100) NOT NULL,
  icon_emoji VARCHAR(10),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Breeds
CREATE TABLE IF NOT EXISTS breeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES species(id),
  name VARCHAR(200) NOT NULL,
  name_key VARCHAR(200),
  slug VARCHAR(250) UNIQUE,
  
  -- Groups
  fci_group VARCHAR(100),
  akc_group VARCHAR(100),
  origin_country VARCHAR(100),
  size_category VARCHAR(50),
  
  -- Physical
  average_height_cm_min NUMERIC(5,2),
  average_height_cm_max NUMERIC(5,2),
  average_weight_kg_min NUMERIC(5,2),
  average_weight_kg_max NUMERIC(5,2),
  life_expectancy_years_min INTEGER,
  life_expectancy_years_max INTEGER,
  
  -- Arrays
  temperament TEXT[],
  health_concerns TEXT[],
  genetic_conditions TEXT[],
  
  -- Descriptive
  primary_purpose VARCHAR(100),
  training_difficulty VARCHAR(50),
  exercise_needs VARCHAR(50),
  grooming_needs VARCHAR(50),
  coat_type VARCHAR(100),
  shedding_level VARCHAR(50),
  
  -- Booleans
  good_with_families BOOLEAN,
  good_with_children BOOLEAN,
  good_with_pets BOOLEAN,
  hypoallergenic BOOLEAN DEFAULT FALSE,
  
  -- Meta
  description_key VARCHAR(200),
  image_url TEXT,
  image_asset_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  popularity_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(species_id, name)
);
CREATE INDEX IF NOT EXISTS idx_breeds_species ON breeds(species_id);
CREATE INDEX IF NOT EXISTS idx_breeds_slug ON breeds(slug);
CREATE INDEX IF NOT EXISTS idx_breeds_active ON breeds(is_active) WHERE is_active = TRUE;

-- 6. Colors
CREATE TABLE IF NOT EXISTS colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  hex_code VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Blood Types
CREATE TABLE IF NOT EXISTS blood_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES species(id),
  blood_type_code VARCHAR(50) NOT NULL,
  description_key VARCHAR(200),
  is_common BOOLEAN DEFAULT FALSE,
  
  UNIQUE(species_id, blood_type_code)
);

-- 8. Reference Vaccines
CREATE TABLE IF NOT EXISTS reference_vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID REFERENCES species(id),
  name VARCHAR(200) NOT NULL,
  vaccine_type VARCHAR(50) CHECK (vaccine_type IN ('Core', 'Non-Core', 'Optional')),
  frequency_recommendation VARCHAR(100),
  description_key VARCHAR(200),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(species_id, name)
);

-- 9. Reference Medications
CREATE TABLE IF NOT EXISTS reference_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID REFERENCES species(id),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  is_prescription BOOLEAN DEFAULT FALSE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(species_id, name)
);

-- Enable RLS
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_medications ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read languages" ON languages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read currencies" ON currencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read countries" ON countries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read species" ON species FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read breeds" ON breeds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read colors" ON colors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read blood_types" ON blood_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read ref_vaccines" ON reference_vaccines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read ref_medications" ON reference_medications FOR SELECT TO authenticated USING (true);
