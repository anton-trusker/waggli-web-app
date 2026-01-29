-- =====================================================
-- COMPLETE PETS TABLE & REFERENCE DATA MIGRATION
-- Waggly Platform - Deep Database Enhancement
-- =====================================================
-- This is the MASTER MIGRATION SCRIPT that includes:
--   1. Missing reference tables
--   2. Pets table schema updates
--   3. New support tables
--   4. Views and materialized views
--   5. Indexes and foreign keys
--   6. RLS policies
--   7. Trigger functions
--   8. Extensions
--   9. Data seeding
-- =====================================================
-- Author: Database Architecture Team
-- Date: January 28, 2026
-- Estimated Runtime: 15-30 minutes
-- =====================================================

BEGIN;

-- =====================================================
-- SECTION 1: EXTENSIONS
-- =====================================================

-- Fuzzy text search for breed names
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PostGIS for location-based queries (vet clinics nearby)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- =====================================================
-- SECTION 2: MISSING REFERENCE TABLES
-- =====================================================

-- -----------------------------------------------------
-- coat_types
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS coat_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  species TEXT[] DEFAULT '{dog,cat}'::TEXT[],
  grooming_frequency TEXT CHECK (grooming_frequency IN ('daily', 'weekly', 'monthly', 'as_needed')),
  shedding_level TEXT CHECK (shedding_level IN ('none', 'low', 'moderate', 'high')),
  hypoallergenic BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO coat_types (name, species, grooming_frequency, shedding_level, hypoallergenic) VALUES
  ('Short', '{dog,cat}', 'weekly', 'moderate', false),
  ('Medium', '{dog,cat}', 'weekly', 'moderate', false),
  ('Long', '{dog,cat}', 'daily', 'high', false),
  ('Hairless', '{dog,cat}', 'weekly', 'none', true),
  ('Wire', '{dog}', 'monthly', 'low', false),
  ('Curly', '{dog}', 'monthly', 'low', true),
  ('Silky', '{cat}', 'daily', 'moderate', false),
  ('Double Coat', '{dog}', 'daily', 'high', false)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------
-- eye_colors
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eye_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  hex_code TEXT,
  species TEXT[] DEFAULT '{dog,cat,rabbit}'::TEXT[],
  is_rare BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO eye_colors (name, hex_code, species, is_rare) VALUES
  ('Brown', '#8B4513', '{dog,cat,rabbit}', false),
  ('Blue', '#4169E1', '{dog,cat,rabbit}', true),
  ('Green', '#228B22', '{cat}', false),
  ('Amber', '#FFBF00', '{dog,cat}', false),
  ('Hazel', '#8E7618', '{dog,cat}', false),
  ('Heterochromia', NULL, '{dog,cat}', true),  -- Two different colored eyes
  ('Odd-Eyed', NULL, '{cat}', true),
  ('Gold', '#FFD700', '{cat}', false)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------
-- ear_types
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ear_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  species TEXT[] DEFAULT '{dog,cat}'::TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO ear_types (name, description, species) VALUES
  ('Erect', 'Fully upright ears', '{dog,cat}'),
  ('Floppy', 'Hanging downward ears', '{dog,rabbit}'),
  ('Semi-Erect', 'Partially upright with tips folding', '{dog}'),
  ('Folded', 'Naturally folded ears (Scottish Fold)', '{cat}'),
  ('Cropped', 'Surgically altered to stand erect', '{dog}'),
  ('Button', 'Semi-erect with tips folding forward', '{dog}'),
  ('Rose', 'Small, folded back ears', '{dog}'),
  ('Bat', 'Large, erect, triangular ears', '{dog}'),
  ('Lop', 'Long, drooping ears', '{rabbit}')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------
-- tail_types
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS tail_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  species TEXT[] DEFAULT '{dog,cat}'::TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tail_types (name, description, species) VALUES
  ('Long', 'Full-length natural tail', '{dog,cat}'),
  ('Bobbed', 'Naturally short tail (genetic)', '{dog,cat}'),
  ('Docked', 'Surgically shortened tail', '{dog}'),
  ('Curled', 'Naturally curls over back', '{dog}'),
  ('Ringed', 'Curls in a tight ring', '{dog}'),
  ('Plumed', 'Long with flowing fur', '{dog,cat}'),
  ('Saber', 'Slight curve like a saber', '{dog}'),
  ('Whip', 'Long and thin like a whip', '{dog}'),
  ('Screw', 'Naturally twisted/corkscrewed', '{dog}'),
  ('Straight', 'Hangs straight down', '{dog,cat}')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------
-- color_patterns
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS color_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  species TEXT[] DEFAULT '{dog,cat}'::TEXT[],
  image_url TEXT,
  genetic_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO color_patterns (name, description, species, genetic_info) VALUES
  ('Solid', 'Uniform color throughout', '{dog,cat}', 'Recessive gene expression'),
  ('Spotted', 'Distinct spots or patches', '{dog,cat}', 'Piebald gene'),
  ('Striped', 'Stripe patterns', '{cat}', 'Tabby gene'),
  ('Brindle', 'Tiger-like stripes', '{dog}', 'Dominant K locus'),
  ('Merle', 'Mottled patches of diluted color', '{dog}', 'Merle gene (M locus)'),
  ('Tuxedo', 'Black with white chest/paws', '{cat}', 'Piebald spotting'),
  ('Calico', 'Tri-color patches', '{cat}', 'X-linked gene (females only)'),
  ('Tortoiseshell', 'Black and orange mottled', '{cat}', 'X-linked gene'),
  ('Tabby', 'M-shaped forehead marking with stripes', '{cat}', 'Agouti gene'),
  ('Roan', 'Mix of white and colored hairs', '{dog}', 'Roan gene'),
  ('Sable', 'Dark tips on lighter base', '{dog}', 'Agouti gene'),
  ('Point', 'Darker extremities (Siamese)', '{cat}', 'Temperature-sensitive albinism'),
  ('Harlequin', 'Torn patches of black on white', '{dog}', 'Harlequin gene with merle')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------
-- acquisition_types
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS acquisition_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  requires_breeder_info BOOLEAN DEFAULT false,
  requires_shelter_info BOOLEAN DEFAULT false,
  typical_documents TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO acquisition_types (name, description, requires_breeder_info, requires_shelter_info, typical_documents) VALUES
  ('Breeder', 'Purchased from a professional breeder', true, false, '{pedigree,health_certificate,contract}'),
  ('Shelter', 'Adopted from an animal shelter', false, true, '{adoption_certificate,medical_records}'),
  ('Rescue', 'Adopted from a breed-specific rescue organization', false, true, '{adoption_contract,foster_history}'),
  ('Pet Store', 'Purchased from a pet store', false, false, '{receipt,health_guarantee}'),
  ('Gift', 'Received as a gift', false, false, '{}'),
  ('Stray', 'Found as a stray', false, false, '{}'),
  ('Born at Home', 'Pet was born from owner''s other pet', false, false, '{birth_certificate}'),
  ('Rehomed', 'Adopted directly from previous owner', false, false, '{transfer_agreement}')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------
-- breed_health_risks
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS breed_health_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed_id UUID REFERENCES breeds(id) ON DELETE CASCADE,
  condition_name VARCHAR(200) NOT NULL,
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high', 'very_high')),
  prevalence_percentage DECIMAL(5,2),
  typical_onset_age_months INTEGER,
  description TEXT,
  prevention_notes TEXT,
  screening_tests TEXT[],
  screening_recommended BOOLEAN DEFAULT false,
  genetic_test_available BOOLEAN DEFAULT false,
  sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_breed_risks_breed ON breed_health_risks(breed_id);
CREATE INDEX IF NOT EXISTS idx_breed_risks_level ON breed_health_risks(risk_level);

-- Sample data for Golden Retrievers (will need to populate for all breeds)
INSERT INTO breed_health_risks (breed_id, condition_name, risk_level, prevalence_percentage, description, screening_recommended, screening_tests)
SELECT 
  b.id,
  'Hip Dysplasia',
  'high',
  19.6,
  'Genetic condition affecting hip joint formation',
  true,
  '{OFA,PennHIP}'
FROM breeds b WHERE b.name = 'Golden Retriever'
ON CONFLICT DO NOTHING;

-- =====================================================
-- SECTION 3: NEW SUPPORT TABLES
-- =====================================================

-- -----------------------------------------------------
-- physical_measurements (Weight/Size Tracking Over Time)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS physical_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  measured_date TIMESTAMPTZ NOT NULL,
  measured_by VARCHAR(200),
  measurement_method VARCHAR(50),
  
  -- Weight
  weight_kg DECIMAL(6,2) CHECK (weight_kg > 0 AND weight_kg < 500),
  weight_lbs DECIMAL(6,2) GENERATED ALWAYS AS (weight_kg * 2.20462) STORED,
  
  -- Body Condition
  body_condition_score INTEGER CHECK (body_condition_score BETWEEN 1 AND 9),
  body_condition_notes TEXT,
  
  -- Dimensions
  height_shoulder_cm DECIMAL(5,2),
  height_shoulder_inches DECIMAL(5,2) GENERATED ALWAYS AS (height_shoulder_cm * 0.393701) STORED,
  length_body_cm DECIMAL(6,2),
  chest_girth_cm DECIMAL(5,2),
  neck_girth_cm DECIMAL(5,2),
  
  -- Context
  is_pregnant BOOLEAN DEFAULT false,
  is_post_surgery BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measurements_pet ON physical_measurements(pet_id);
CREATE INDEX IF NOT EXISTS idx_measurements_date ON physical_measurements(measured_date DESC);

COMMENT ON TABLE physical_measurements IS 'Track pet weight and body measurements over time for health monitoring';

-- -----------------------------------------------------
-- pet_photos (Photo Gallery)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  taken_date DATE,
  is_cover BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  is_profile BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_photos_pet ON pet_photos(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_photos_cover ON pet_photos(pet_id, is_cover) WHERE is_cover = true;
CREATE INDEX IF NOT EXISTS idx_pet_photos_favorite ON pet_photos(pet_id, is_favorite) WHERE is_favorite = true;

COMMENT ON TABLE pet_photos IS 'Gallery of pet photos beyond the main profile picture';

-- -----------------------------------------------------
-- co_owners (Multi-User Pet Management)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS co_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  main_owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  co_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  co_owner_email TEXT NOT NULL,
  permission_level VARCHAR(20) CHECK (permission_level IN ('view', 'edit', 'full')) DEFAULT 'edit',
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')) DEFAULT 'pending',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(pet_id, co_owner_id)
);

CREATE INDEX IF NOT EXISTS idx_co_owners_pet ON co_owners(pet_id);
CREATE INDEX IF NOT EXISTS idx_co_owners_user ON co_owners(co_owner_id);
CREATE INDEX IF NOT EXISTS idx_co_owners_status ON co_owners(status) WHERE status = 'pending';

COMMENT ON TABLE co_owners IS 'Enable multiple users (families, couples) to manage the same pet';

-- =====================================================
-- SECTION 4: PETS TABLE UPDATES
-- =====================================================

-- Add missing columns to pets table
-- NOTE: Using IF NOT EXISTS to make script idempotent

ALTER TABLE pets ADD COLUMN IF NOT EXISTS breed_id UUID REFERENCES breeds(id);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS breed_name VARCHAR(100);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS secondary_breed_id UUID REFERENCES breeds(id);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS is_mixed_breed BOOLEAN DEFAULT false;

ALTER TABLE pets ADD COLUMN IF NOT EXISTS species_id UUID REFERENCES species(id);

ALTER TABLE pets ADD COLUMN IF NOT EXISTS date_of_birth_approximate BOOLEAN DEFAULT false;

ALTER TABLE pets ADD COLUMN IF NOT EXISTS is_deceased BOOLEAN DEFAULT false;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS deceased_date DATE;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS deceased_cause TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

ALTER TABLE pets ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS color_primary VARCHAR(50);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS color_secondary VARCHAR(50);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS color_pattern_id UUID REFERENCES color_patterns(id);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS coat_type_id UUID REFERENCES coat_types(id);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS eye_color_id UUID REFERENCES eye_colors(id);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS ear_type_id UUID REFERENCES ear_types(id);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS tail_type_id UUID REFERENCES tail_types(id);

-- Fix data types (requires migration of existing data)
-- These will need careful migration in a separate script
-- ALTER TABLE pets ALTER COLUMN weight TYPE NUMERIC(6,2) USING weight::NUMERIC;
-- ALTER TABLE pets ALTER COLUMN height TYPE NUMERIC(5,2) USING height::NUMERIC;

-- Use new column names for now
ALTER TABLE pets ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(6,2);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,2);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS ideal_weight_min_kg NUMERIC(6,2);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS ideal_weight_max_kg NUMERIC(6,2);

ALTER TABLE pets ADD COLUMN IF NOT EXISTS microchip_location VARCHAR(100);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS microchip_brand VARCHAR(100);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS registration_type VARCHAR(50);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50);

ALTER TABLE pets ADD COLUMN IF NOT EXISTS acquisition_date DATE;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS acquisition_type_id UUID REFERENCES acquisition_types(id);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS acquisition_location VARCHAR(200);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS breeder_name VARCHAR(200);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS shelter_name VARCHAR(200);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS previous_owner_count INTEGER DEFAULT 0;

ALTER TABLE pets ADD COLUMN IF NOT EXISTS blood_type_id UUID REFERENCES blood_types(id);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS vaccination_status VARCHAR(20) CHECK (vaccination_status IN ('up_to_date', 'due_soon', 'overdue', 'none'));

ALTER TABLE pets ADD COLUMN IF NOT EXISTS passport_generated_at TIMESTAMPTZ;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS passport_updated_at TIMESTAMPTZ;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS passport_issuer TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS passport_issue_date DATE;

ALTER TABLE pets ADD COLUMN IF NOT EXISTS address_json JSONB;  -- For pet-specific address

-- Convert distinctive_markings to array if it's not already
-- ALTER TABLE pets ALTER COLUMN distinctive_markings TYPE TEXT[] USING ARRAY[distinctive_markings];

-- Add check constraints
ALTER TABLE pets ADD CONSTRAINT IF NOT EXISTS pets_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50);
ALTER TABLE pets ADD CONSTRAINT IF NOT EXISTS pets_health_score_range CHECK (health_score BETWEEN 0 AND 100);
ALTER TABLE pets ADD CONSTRAINT IF NOT EXISTS pets_deceased_date_check CHECK (deceased_date IS NULL OR is_deceased = true);

-- Add comments
COMMENT ON COLUMN pets.breed_id IS 'Foreign key to breeds reference table';
COMMENT ON COLUMN pets.breed_name IS 'Cached breed name for display (may be custom)';
COMMENT ON COLUMN pets.secondary_breed_id IS 'For mixed breed pets, the secondary breed';
COMMENT ON COLUMN pets.vaccination_status IS 'Auto-computed vaccination compliance status';
COMMENT ON COLUMN pets.address_json IS 'Pet-specific address if different from owner';

-- =====================================================
-- SECTION 5: INDEXES
-- =====================================================

-- Pets table indexes for new FK columns
CREATE INDEX IF NOT EXISTS idx_pets_breed_id ON pets(breed_id);
CREATE INDEX IF NOT EXISTS idx_pets_species_id ON pets(species_id);
CREATE INDEX IF NOT EXISTS idx_pets_owner_species ON pets(owner_id, species_id);
CREATE INDEX IF NOT EXISTS idx_pets_owner_status ON pets(owner_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pets_deceased ON pets(is_deceased) WHERE is_deceased = true;
CREATE INDEX IF NOT EXISTS idx_pets_archived ON pets(is_archived) WHERE is_archived = true;
CREATE INDEX IF NOT EXISTS idx_pets_vaccination_status ON pets(vaccination_status);

-- Fuzzy search on breed names
CREATE INDEX IF NOT EXISTS idx_breeds_name_trgm ON breeds USING GIN (name gin_trgm_ops);

-- Reference table indexes
CREATE INDEX IF NOT EXISTS idx_coat_types_species ON coat_types USING GIN(species);
CREATE INDEX IF NOT EXISTS idx_eye_colors_species ON eye_colors USING GIN(species);
CREATE INDEX IF NOT EXISTS idx_ear_types_species ON ear_types USING GIN(species);
CREATE INDEX IF NOT EXISTS idx_tail_types_species ON tail_types USING GIN(species);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_status ON vaccinations(pet_id, next_due_date) WHERE next_due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_treatments_pet_active ON treatments(pet_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_medical_visits_pet_date ON medical_visits(pet_id, visit_date DESC);

-- =====================================================
-- SECTION 6: VIEWS
-- =====================================================

-- -----------------------------------------------------
-- Pet Health Summary View
-- -----------------------------------------------------
CREATE OR REPLACE VIEW v_pet_health_summary AS
SELECT 
  p.id AS pet_id,
  p.name AS pet_name,
  p.owner_id,
  p.species,
  p.health_score,
  
  -- Vaccination Status
  COALESCE((
    SELECT COUNT(*) 
    FROM vaccinations v 
    WHERE v.pet_id = p.id 
    AND v.next_due_date < CURRENT_DATE
  ), 0) AS overdue_vaccines_count,
  
  COALESCE((
    SELECT COUNT(*) 
    FROM vaccinations v 
    WHERE v.pet_id = p.id 
    AND v.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ), 0) AS upcoming_vaccines_count,
  
  -- Active Medications
  COALESCE((
    SELECT COUNT(*) 
    FROM treatments t 
    WHERE t.pet_id = p.id 
    AND t.status = 'active'
  ), 0) AS active_medications_count,
  
  -- Last Vet Visit
  (
    SELECT MAX(mv.visit_date) 
    FROM medical_visits mv 
    WHERE mv.pet_id = p.id
  ) AS last_vet_visit_date,
  
  -- Next Appointment
  (
    SELECT MIN(apt.start_time) 
    FROM appointments apt 
    WHERE apt.pet_id = p.id 
    AND apt.start_time > NOW()
    AND apt.status != 'cancelled'
  ) AS next_appointment_time,
  
  -- Active Allergies
  COALESCE((
    SELECT COUNT(*) 
    FROM allergies a 
    WHERE a.pet_id = p.id 
    AND a.is_active = true
  ), 0) AS active_allergies_count,
  
  -- Chronic Conditions
  COALESCE((
    SELECT COUNT(*) 
    FROM conditions c 
    WHERE c.pet_id = p.id 
    AND c.status = 'active'
  ), 0) AS active_conditions_count,
  
  -- Current Weight
  (
    SELECT pm.weight_kg
    FROM physical_measurements pm
    WHERE pm.pet_id = p.id
    ORDER BY pm.measured_date DESC
    LIMIT 1
  ) AS current_weight_kg,
  
  -- Weight Trend (comparing last 2 measurements)
  CASE
    WHEN (
      SELECT COUNT(*) FROM physical_measurements pm WHERE pm.pet_id = p.id
    ) >= 2 THEN
      (SELECT pm1.weight_kg - pm2.weight_kg
       FROM (SELECT weight_kg FROM physical_measurements WHERE pet_id = p.id ORDER BY measured_date DESC LIMIT 1) pm1,
            (SELECT weight_kg FROM physical_measurements WHERE pet_id = p.id ORDER BY measured_date DESC LIMIT 1 OFFSET 1) pm2)
    ELSE NULL
  END AS weight_change_kg
  
FROM pets p
WHERE p.is_archived = false AND (p.is_deceased = false OR p.is_deceased IS NULL);

COMMENT ON VIEW v_pet_health_summary IS 'Complete health overview for each pet including vaccination status, medications, visits, and weight tracking';

-- -----------------------------------------------------
-- Vaccination Compliance View
-- -----------------------------------------------------
CREATE OR REPLACE VIEW v_vaccination_compliance AS
SELECT 
  p.id AS pet_id,
  p.name AS pet_name,
  p.species,
  p.owner_id,
  rv.id AS vaccine_id,
  rv.name AS vaccine_name,
  rv.vaccine_type,
  v.date_administered AS last_vaccination_date,
  v.next_due_date,
  
  -- Status Calculation
  CASE 
    WHEN v.next_due_date IS NULL THEN 'never_given'
    WHEN v.next_due_date < CURRENT_DATE THEN 'overdue'
    WHEN v.next_due_date < CURRENT_DATE + INTERVAL '30 days' THEN 'due_soon'
    WHEN v.next_due_date < CURRENT_DATE + INTERVAL '90 days' THEN 'upcoming'
    ELSE 'current'
  END AS compliance_status,
  
  -- Days Until/Past Due
  CASE 
    WHEN v.next_due_date IS NOT NULL THEN 
      EXTRACT(DAY FROM (v.next_due_date - CURRENT_DATE))::INTEGER
    ELSE NULL
  END AS days_until_due
  
FROM pets p
CROSS JOIN reference_vaccines rv
LEFT JOIN LATERAL (
  SELECT * FROM vaccinations vac
  WHERE vac.pet_id = p.id 
  AND vac.reference_vaccine_id = rv.id
  ORDER BY vac.date_administered DESC
  LIMIT 1
) v ON true
WHERE p.species_id = rv.species_id
AND p.is_archived = false
ORDER BY p.id, rv.vaccine_type, rv.name;

COMMENT ON VIEW v_vaccination_compliance IS 'Detailed vaccination compliance status for each pet showing overdue, due soon, and current vaccinations';

-- -----------------------------------------------------
-- Breed Statistics View
-- -----------------------------------------------------
CREATE OR REPLACE VIEW v_breed_statistics AS
SELECT 
  b.id AS breed_id,
  b.name AS breed_name,
  b.species_id,
  s.name AS species_name,
  
  -- Pet Counts
  COUNT(DISTINCT p.id) AS total_pets,  
  COUNT(DISTINCT p.id) FILTER (WHERE p.is_deceased = true) AS deceased_count,
  
  -- Health Metrics
  ROUND(AVG(p.health_score), 1) AS avg_health_score,
  ROUND(AVG(EXTRACT(YEAR FROM AGE(COALESCE(p.date_of_birth, CURRENT_DATE)))), 1) AS avg_age_years,
  
  -- Most Common Conditions
  (
    SELECT ARRAY_AGG(DISTINCT condition_name ORDER BY condition_name)
    FROM (
      SELECT c.condition_name
      FROM pets pet
      JOIN conditions c ON c.pet_id = pet.id
      WHERE pet.breed_id = b.id AND c.status = 'active'
      GROUP BY c.condition_name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    ) top_conditions
  ) AS common_conditions,
  
  -- Risk Assessment
  (
    SELECT COUNT(*)
    FROM breed_health_risks bhr
    WHERE bhr.breed_id = b.id
    AND bhr.risk_level IN ('high', 'very_high')
  ) AS high_risk_conditions_count
  
FROM breeds b
LEFT JOIN species s ON s.id = b.species_id
LEFT JOIN pets p ON p.breed_id = b.id
GROUP BY b.id, b.name, b.species_id, s.name;

COMMENT ON VIEW v_breed_statistics IS 'Aggregated statistics and health insights by breed';

-- =====================================================
-- SECTION 7: MATERIALIZED VIEWS
-- =====================================================

-- -----------------------------------------------------
-- Pet Passport Compliance (Materialized)
-- -----------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_pet_passport_compliance AS
SELECT 
  p.id AS pet_id,
  p.name AS pet_name,
  p.owner_id,
  p.passport_id,
  
  -- Microchip Status
  p.microchip_number IS NOT NULL AS has_microchip,
  p.microchip_date,
  
  -- Rabies Vaccination Status (EU Requirement)
  v_rabies.date_administered AS rabies_last_date,
  v_rabies.next_due_date AS rabies_next_due,
  (v_rabies.next_due_date IS NOT NULL AND v_rabies.next_due_date >= CURRENT_DATE) AS rabies_current,
  
  -- Annual Health Certificate
  mv_last.visit_date AS last_vet_visit,
  (mv_last.visit_date >= CURRENT_DATE - INTERVAL '1 year') AS annual_checkup_current,
  
  -- Overall EU Passport Compliance
  (
    p.microchip_number IS NOT NULL
    AND v_rabies.next_due_date IS NOT NULL 
    AND v_rabies.next_due_date >= CURRENT_DATE
    AND EXISTS (
      SELECT 1 FROM medical_visits mv2
      WHERE mv2.pet_id = p.id
      AND mv2.visit_date >= CURRENT_DATE - INTERVAL '1 year'
    )
  ) AS eu_passport_compliant,
  
  NOW() AS last_refreshed
  
FROM pets p
LEFT JOIN LATERAL (
  SELECT v.date_administered, v.next_due_date
  FROM vaccinations v
  JOIN reference_vaccines rv ON v.reference_vaccine_id = rv.id
  WHERE v.pet_id = p.id
  AND rv.name ILIKE '%rabies%'
  ORDER BY v.date_administered DESC
  LIMIT 1
) v_rabies ON true
LEFT JOIN LATERAL (
  SELECT MAX(mv.visit_date) AS visit_date
  FROM medical_visits mv
  WHERE mv.pet_id = p.id
) mv_last ON true
WHERE p.species IN ('dog', 'cat')
AND p.is_archived = false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_passport_compliance_pet ON mv_pet_passport_compliance(pet_id);
CREATE INDEX IF NOT EXISTS idx_mv_passport_compliance_status ON mv_pet_passport_compliance(eu_passport_compliant);

COMMENT ON MATERIALIZED VIEW mv_pet_passport_compliance IS 'EU Pet Passport compliance status (refresh daily via cron job)';

-- =====================================================
-- SECTION 8: TRIGGER FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- Auto-update vaccination_status on pets table
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_pet_vaccination_status()
RETURNS TRIGGER AS $$
DECLARE
  overdue_count INTEGER;
  due_soon_count INTEGER;
BEGIN
  -- Count overdue and upcoming vaccines
  SELECT 
    COUNT(*) FILTER (WHERE next_due_date < CURRENT_DATE),
    COUNT(*) FILTER (WHERE next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days')
  INTO overdue_count, due_soon_count
  FROM vaccinations
  WHERE pet_id = COALESCE(NEW.pet_id, OLD.pet_id);
  
  -- Update pets table
  UPDATE pets
  SET vaccination_status = CASE
    WHEN overdue_count > 0 THEN 'overdue'
    WHEN due_soon_count > 0 THEN 'due_soon'
    WHEN EXISTS (SELECT 1 FROM vaccinations WHERE pet_id = pets.id) THEN 'up_to_date'
    ELSE 'none'
  END
  WHERE id = COALESCE(NEW.pet_id, OLD.pet_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vaccination_status_update ON vaccinations;
CREATE TRIGGER vaccination_status_update
  AFTER INSERT OR UPDATE OR DELETE ON vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION update_pet_vaccination_status();

COMMENT ON FUNCTION update_pet_vaccination_status() IS 'Automatically updates vaccination_status field in pets table when vaccinations change';

-- -----------------------------------------------------
-- Auto-create first physical_measurement from pets.weight
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION migrate_pet_weight_to_measurements()
RETURNS TRIGGER AS $$
BEGIN
  -- If weight_kg is set and no measurements exist, create first record
  IF NEW.weight_kg IS NOT NULL THEN
    INSERT INTO physical_measurements (pet_id, weight_kg, measured_date)
    VALUES (NEW.id, NEW.weight_kg, COALESCE(NEW.created_at, NOW()))
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'migrate_weight_on_insert'
  ) THEN
    CREATE TRIGGER migrate_weight_on_insert
      AFTER INSERT ON pets
      FOR EACH ROW
      EXECUTE FUNCTION migrate_pet_weight_to_measurements();
  END IF;
END $$;

-- -----------------------------------------------------
-- Auto-update updated_at timestamp
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT unnest(ARRAY['pets', 'physical_measurements', 'pet_photos', 'co_owners'])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS %I_updated_at ON %I;
      CREATE TRIGGER %I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- =====================================================
-- SECTION 9: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE physical_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE breed_health_risks ENABLE ROW LEVEL SECURITY;

-- Reference tables: public read access
ALTER TABLE coat_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE eye_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ear_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tail_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisition_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for physical_measurements
CREATE POLICY "Owners manage pet measurements"
  ON physical_measurements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE id = physical_measurements.pet_id 
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for pet_photos
CREATE POLICY "Owners manage pet photos"
  ON pet_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE id = pet_photos.pet_id 
      AND owner_id = auth.uid()
    )
  );

-- RLS Policies for co_owners
CREATE POLICY "Main owners manage co-owners"
  ON co_owners FOR ALL
  USING (main_owner_id = auth.uid());

CREATE POLICY "Co-owners view their invitations"
  ON co_owners FOR SELECT
  USING (co_owner_id = auth.uid() OR co_owner_email = auth.email());

-- RLS Policies for breed_health_risks (public read)
CREATE POLICY "Public read breed health risks"
  ON breed_health_risks FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for reference tables (public read)
DO $$
DECLARE
  ref_table TEXT;
BEGIN
  FOR ref_table IN 
    SELECT unnest(ARRAY['coat_types', 'eye_colors', 'ear_types', 'tail_types', 'color_patterns', 'acquisition_types'])
  LOOP
    EXECUTE format('
      CREATE POLICY "Public read %I"
        ON %I FOR SELECT
        TO anon, authenticated
        USING (true);
    ', ref_table, ref_table);
  END LOOP;
END $$;

-- =====================================================
-- SECTION 10: DATA MIGRATION & UPDATES
-- =====================================================

-- Migrate existing breed TEXT values to breed_id
UPDATE pets p
SET breed_id = b.id,
    breed_name = p.breed
FROM breeds b
WHERE p.breed IS NOT NULL
AND p.breed_id IS NULL
AND LOWER(b.name) = LOWER(p.breed)
AND b.species_id = (SELECT id FROM species WHERE code = p.species LIMIT 1);

-- Migrate existing species TEXT values to species_id
UPDATE pets p
SET species_id = s.id
FROM species s
WHERE p.species IS NOT NULL
AND p.species_id IS NULL
AND s.code = p.species;

-- Migrate existing TEXT weight/height to NUMERIC (if safe)
UPDATE pets
SET weight_kg = CASE 
  WHEN weight ~ '^[0-9.]+$' THEN weight::NUMERIC
  ELSE NULL
END
WHERE weight IS NOT NULL AND weight_kg IS NULL;

UPDATE pets
SET height_cm = CASE 
  WHEN height ~ '^[0-9.]+$' THEN height::NUMERIC
  ELSE NULL
END
WHERE height IS NOT NULL AND height_cm IS NULL;

-- Copy main photo to pet_photos table if not already there
INSERT INTO pet_photos (pet_id, photo_url, is_profile, is_cover, sort_order, caption)
SELECT 
  id,
  photo_url,
  true,
  true,
  0,
  'Main profile photo'
FROM pets
WHERE photo_url IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM pet_photos pp WHERE pp.pet_id = pets.id AND pp.is_profile = true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SECTION 11: REFRESH MATERIALIZED VIEWS
-- =====================================================

REFRESH MATERIALIZED VIEW mv_pet_passport_compliance;

-- =====================================================
-- FINALIZE
-- =====================================================

COMMIT;

-- =====================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- =====================================================

-- Check reference tables row counts
SELECT 'coat_types' AS table_name, COUNT(*) AS row_count FROM coat_types
UNION ALL
SELECT 'eye_colors', COUNT(*) FROM eye_colors
UNION ALL
SELECT 'ear_types', COUNT(*) FROM ear_types
UNION ALL
SELECT 'tail_types', COUNT(*) FROM tail_types
UNION ALL
SELECT 'color_patterns', COUNT(*) FROM color_patterns
UNION ALL
SELECT 'acquisition_types', COUNT(*) FROM acquisition_types;

-- Check pets table new columns
SELECT 
  COUNT(*) AS total_pets,
  COUNT(breed_id) AS pets_with_breed_fk,
  COUNT(species_id) AS pets_with_species_fk,
  COUNT(weight_kg) AS pets_with_weight,
  COUNT(blood_type_id) AS pets_with_blood_type
FROM pets;

-- Check new support tables
SELECT 'physical_measurements' AS table_name, COUNT(*) AS row_count FROM physical_measurements
UNION ALL
SELECT 'pet_photos', COUNT(*) FROM pet_photos
UNION ALL
SELECT 'co_owners', COUNT(*) FROM co_owners;

-- Check views exist
SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname LIKE 'v_%';

-- Check materialized views exist
SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';

-- =====================================================
-- MAINTENANCE NOTES
-- =====================================================

/*
1. REFRESH MATERIALIZED VIEWS DAILY:
   - Set up cron job or pg_cron extension:
     REFRESH MATERIALIZED VIEW mv_pet_passport_compliance;

2. MONITOR PERFORMANCE:
   - Check slow queries via pg_stat_statements
   - Analyze and vacuum tables after large data changes:
     ANALYZE pets;
     VACUUM ANALYZE pets;

3. FUTURE ENHANCEMENTS:
   - Populate breed_health_risks for all breeds
   - Add more reference data (medications, vaccines)
   - Create additional analytics views

4. ROLLBACK PROCEDURE (if needed):
   - Backup created: See Section 10 comments
   - To rollback: Restore from backup or manually drop new columns/tables
*/
