# Pets Table & Reference Data - Deep Analysis
## Comprehensive Database Gap Analysis

> **Date**: January 28, 2026  
> **Scope**: Complete analysis of pets table + all reference tables  
> **Database**: PAWAG (Supabase Project: `zcskkzeguyirfliebjqg`)  
> **Sources**: Specification docs + actual database structure

---

## 1. PETS TABLE ANALYSIS

### 1.1 Current Structure (From Production DB)

Based on the actual database structure retrieved via Supabase API:

```sql
-- CURRENT pets table columns (~30 fields)
CREATE TABLE pets (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  
  -- Basic Info (✅ EXIST)
  name TEXT,
  type TEXT,
  species TEXT,
  breed TEXT,
  gender TEXT,
  
  -- Dates (✅ EXIST)
  date_of_birth DATE,
  age TEXT,
  is_neutered BOOLEAN,
  neutered_date DATE,
  
  -- Physical (✅ EXIST)
  weight TEXT,  -- ⚠️ Should be NUMERIC
  height TEXT,  -- ⚠️ Should be NUMERIC
  size TEXT,
  color TEXT,
  coat_type TEXT,
  eye_color TEXT,
  ear_type TEXT,
  tail_type TEXT,
  distinctive_markings TEXT,
  
  -- Photos (✅ EXIST)
  photo_url TEXT,
  image_url TEXT,  -- Duplicate of photo_url?
  
  -- Identification (✅ EXIST)
  microchip_number TEXT,
  microchip_date DATE,
  microchip_implantation_date DATE,  -- Duplicate?
  registration_id TEXT,
  tattoo_id TEXT,
  passport_id TEXT,
  
  -- Status (✅ EXIST)
  status TEXT,
  notes TEXT,
  health_score INTEGER,
  
  -- Timestamps (✅ EXIST)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### 1.2 Required Structure (From Specifications)

Based on `/spec/03-pet-profiles/database-schema.sql` and `/spec/12-architecture/database-architecture-complete.md`:

```sql
-- SPECIFICATION pets table (~60 fields)
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  name VARCHAR(50) NOT NULL CHECK (char_length(name) >= 1),
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'rabbit', 'bird', 'other')),
  breed_id UUID REFERENCES breeds(id),  -- ⚠️ Should be FK, not TEXT
  breed_name VARCHAR(100) NOT NULL,
  secondary_breed_id UUID REFERENCES breeds(id),  -- ❌ MISSING
  is_mixed_breed BOOLEAN DEFAULT false,  -- ❌ MISSING
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  
  -- Dates
  date_of_birth DATE NOT NULL,
  date_of_birth_approximate BOOLEAN DEFAULT false,  -- ❌ MISSING
  
  -- Status
  is_neutered BOOLEAN,
  neutered_date DATE,
  is_deceased BOOLEAN DEFAULT false,  -- ❌ MISSING
  deceased_date DATE,  -- ❌ MISSING
  deceased_cause TEXT,  -- ❌ MISSING
  is_archived BOOLEAN DEFAULT false,  -- ❌ MISSING
  
  -- Appearance
  photo_url TEXT,
  cover_photo_url TEXT,  -- ❌ MISSING
  color_primary VARCHAR(50),  -- Currently just "color"
  color_secondary VARCHAR(50),  -- ❌ MISSING
  color_pattern VARCHAR(50),  -- ❌ MISSING
  coat_type VARCHAR(50),  -- ✅ EXISTS
  distinctive_markings TEXT[],  -- Currently TEXT, should be TEXT[]
  eye_color VARCHAR(50),  -- ✅ EXISTS
  ear_type VARCHAR(50),  -- ✅ EXISTS
  tail_type VARCHAR(50),  -- ✅ EXISTS
  
  -- Physical Measurements
  weight NUMERIC,  -- Currently TEXT! ⚠️ WRONG TYPE
  height NUMERIC,  -- Currently TEXT! ⚠️ WRONG TYPE
  size VARCHAR(20) CHECK (size IN ('toy', 'small', 'medium', 'large', 'giant')),
  ideal_weight_min NUMERIC,  -- ❌ MISSING
  ideal_weight_max NUMERIC,  -- ❌ MISSING
  
  -- Identification
  microchip_number VARCHAR(15),  -- ✅ EXISTS
  microchip_date DATE,  -- ✅ EXISTS (duplicate of microchip_implantation_date)
  microchip_location VARCHAR(100),  -- ❌ MISSING
  microchip_brand VARCHAR(100),  -- ❌ MISSING
  tattoo_id VARCHAR(50),  -- ✅ EXISTS
  registration_number VARCHAR(100),  -- Currently "registration_id"
  registration_type VARCHAR(50),  -- ❌ MISSING
  passport_number VARCHAR(50),  -- ❌ MISSING (different from passport_id)
  passport_id VARCHAR(50) UNIQUE,  -- ✅ EXISTS (digital passport ID)
  
  -- Acquisition (ALL MISSING ❌)
  acquisition_date DATE,  -- ❌ MISSING
  acquisition_type VARCHAR(50),  -- ❌ MISSING
  acquisition_location VARCHAR(200),  -- ❌ MISSING
  breeder_name VARCHAR(200),  -- ❌ MISSING
  shelter_name VARCHAR(200),  -- ❌ MISSING
  previous_owner_count INTEGER,  -- ❌ MISSING
  
  -- Health (Computed/Cached)
  health_score INTEGER CHECK (health_score BETWEEN 0 AND 100),  -- ✅ EXISTS
  vaccination_status VARCHAR(20) CHECK (...),  -- ❌ MISSING
  blood_type TEXT,  -- ❌ MISSING
  
  -- EU Passport (some exist, some missing)
  passport_generated_at TIMESTAMP,  -- ❌ MISSING
  passport_updated_at TIMESTAMP,  -- ❌ MISSING
  passport_issuer TEXT,  -- ❌ MISSING
  passport_issue_date DATE,  -- ❌ MISSING
  
  -- Address (for different from owner)
  address_json JSONB,  -- ❌ MISSING
  
  -- Status
  pet_status VARCHAR DEFAULT 'active' CHECK (...),  -- Currently just "status"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.3 Gap Analysis Summary

| Category | Spec Requires | DB Has | Missing Count |
|----------|---------------|--------|---------------|
| **Basic Info** | 8 fields | 6 fields | 2 ❌ (secondary_breed_id, is_mixed_breed) |
| **Dates** | 7 fields | 4 fields | 3 ❌ (date_of_birth_approximate, deceased_date, deceased_cause, is_deceased) |
| **Appearance** | 11 fields | 7 fields | 4 ❌ (cover_photo_url, color_secondary, color_pattern) |
| **Physical** | 7 fields | 5 fields | 2 ❌ (ideal_weight_min/max) + 2 ⚠️ wrong type |
| **Identification** | 10 fields | 6 fields | 4 ❌ (microchip_location/brand, registration_type, passport_number) |
| **Acquisition** | 6 fields | 0 fields | 6 ❌ ALL MISSING |
| **Health** | 3 fields | 1 field | 2 ❌ (vaccination_status, blood_type) |
| **Passport** | 5 fields | 1 field | 4 ❌ (passport timestamps, issuer, issue_date) |
| **Address** | 1 field | 0 fields | 1 ❌ (address_json for pet-specific address) |

**TOTAL GAPS**: ~30 missing fields + 2 wrong types

### 1.4 Critical Issues

**1. Wrong Data Types** 🔴:
```sql
-- CURRENT (WRONG):
weight TEXT
height TEXT

-- SHOULD BE:
weight_kg NUMERIC(6,2)
height_cm NUMERIC(5,2)
```

**2. Missing Foreign Key to Breeds** 🔴:
```sql
-- CURRENT:
breed TEXT  -- Just text field!

-- SHOULD BE:
breed_id UUID REFERENCES breeds(id)
breed_name VARCHAR(100)  -- Cached for display
```

**3. Missing Critical Health Fields** 🟠:
- `blood_type` - Critical for emergencies!
- `vaccination_status` - Needed for passport compliance

**4. No Acquisition History** 🟡:
Entire acquisition section missing (breeder, shelter, adoption date, etc.)

---

## 2. REFERENCE TABLES ANALYSIS

### 2.1 Current Reference Tables (From Database)

Based on the actual database, these reference tables EXIST:

1. ✅ **species** - Species lookup
2. ✅ **breeds** - Comprehensive breed database
3. ✅ **colors** - Color reference
4. ✅ **blood_types** - Blood type reference
5. ✅ **reference_vaccines** - Vaccine types
6. ✅ **reference_medications** - Medication types
7. ✅ **languages** / **supported_languages** - I18n
8. ✅ **currencies** - Currency reference
9. ✅ **countries** - Country reference

### 2.2 Required Reference Tables (From Specs)

From specification documents, we need the following reference tables:

#### ✅ **EXIST and Properly Implemented**:

**A. species**
```sql
CREATE TABLE species (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE,  -- 'dog', 'cat', 'rabbit', 'bird'
  name TEXT NOT NULL,
  name_plural TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**B. breeds**
```sql
CREATE TABLE breeds (
  id UUID PRIMARY KEY,
  species_id UUID REFERENCES species(id),  -- ⚠️ Check if FK exists
  name VARCHAR(100) NOT NULL,
  alternate_names TEXT[],
  group_name VARCHAR(100),
  origin_country VARCHAR(100),
  size_category VARCHAR(20),  -- toy, small, medium, large, giant
  weight_min_kg DECIMAL(5,2),
  weight_max_kg DECIMAL(5,2),
  height_min_cm DECIMAL(5,2),
  height_max_cm DECIMAL(5,2),
  life_expectancy_min INTEGER,
  life_expectancy_max INTEGER,
  temperament TEXT[],
  coat_types TEXT[],
  colors TEXT[],
  description TEXT,
  image_url TEXT,
  fci_number INTEGER,
  popularity_rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**C. colors**
```sql
CREATE TABLE colors (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  hex_code TEXT,  -- For UI display
  species TEXT[],  -- Which species can have this color
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**D. blood_types**
```sql
CREATE TABLE blood_types (
  id UUID PRIMARY KEY,
  species TEXT NOT NULL,  -- 'dog', 'cat'
  blood_type TEXT NOT NULL,  -- 'DEA 1.1+', 'A', 'B', 'AB'
  description TEXT,
  is_universal_donor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example data:
INSERT INTO blood_types (species, blood_type, is_universal_donor) VALUES
  ('dog', 'DEA 1.1 Negative', true),
  ('dog', 'DEA 1.1 Positive', false),
  ('cat', 'Type A', false),
  ('cat', 'Type B', false),
  ('cat', 'Type AB', false);
```

**E. reference_vaccines**
```sql
CREATE TABLE reference_vaccines (
  id UUID PRIMARY KEY,
  species_id UUID REFERENCES species(id),
  name VARCHAR(200) NOT NULL,
  abbreviation VARCHAR(20),
  vaccine_type VARCHAR(50),  -- 'core', 'non_core', 'risk_based'
  initial_age_weeks INTEGER,
  initial_series_count INTEGER DEFAULT 1,
  booster_interval_months INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**F. reference_medications**
```sql
CREATE TABLE reference_medications (
  id UUID PRIMARY KEY,
  species_id UUID REFERENCES species(id),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),  -- 'antibiotic', 'pain', 'parasite', etc.
  is_prescription BOOLEAN DEFAULT true,
  common_dosage_range TEXT,
  administration_route TEXT,  -- 'oral', 'topical', 'injection'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### ⚠️ **NEED VERIFICATION** (Might exist but need structure check):

**G. coat_types** (Referenced in pets.coat_type)
```sql
-- CHECK IF THIS TABLE EXISTS!
CREATE TABLE coat_types (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,  -- 'short', 'medium', 'long', 'hairless', 'wire', 'curly'
  description TEXT,
  species TEXT[],  -- Applicable species
  grooming_frequency TEXT,  -- 'daily', 'weekly', 'monthly'
  shedding_level TEXT,  -- 'none', 'low', 'moderate', 'high'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**H. eye_colors** (Referenced in pets.eye_color)
```sql
-- CHECK IF THIS TABLE EXISTS!
CREATE TABLE eye_colors (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,  -- 'brown', 'blue', 'green', 'amber', 'heterochromia'
  hex_code TEXT,
  species TEXT[],
  is_rare BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**I. ear_types** (Referenced in pets.ear_type)
```sql
-- CHECK IF THIS TABLE EXISTS!
CREATE TABLE ear_types (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,  -- 'erect', 'floppy', 'semi-erect', 'cropped', 'folded'
  description TEXT,
  species TEXT[],  -- Primarily 'dog'
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**J. tail_types** (Referenced in pets.tail_type)
```sql
-- CHECK IF THIS TABLE EXISTS!
CREATE TABLE tail_types (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,  -- 'long', 'bobbed', 'docked', 'curled', 'ringed'
  description TEXT,
  species TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### ❌ **MISSING BUT NEEDED**:

**K. color_patterns**
```sql
CREATE TABLE color_patterns (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,  -- 'solid', 'spotted', 'striped', 'brindle', 'merle', 'tuxedo'
  description TEXT,
  species TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**L. breed_health_risks** (From spec)
```sql
CREATE TABLE breed_health_risks (
  id UUID PRIMARY KEY,
  breed_id UUID REFERENCES breeds(id) ON DELETE CASCADE,
  condition_name VARCHAR(200) NOT NULL,
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high', 'very_high')),
  prevalence_percentage DECIMAL(5,2),
  typical_onset_months INTEGER,
  description TEXT,
  prevention_notes TEXT,
  screening_recommended BOOLEAN DEFAULT false,
  sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**M. acquisition_types** (For pets.acquisition_type)
```sql
CREATE TABLE acquisition_types (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,  -- 'breeder', 'shelter', 'rescue', 'gift', 'stray', 'pet_store'
  description TEXT,
  requires_breeder_info BOOLEAN DEFAULT false,
  requires_shelter_info BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. MISSING TABLES

### 3.1 Pet-Related Tables (From Specs)

#### ❌ **physical_measurements**
```sql
CREATE TABLE physical_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  measured_date TIMESTAMPTZ NOT NULL,
  measured_by VARCHAR(200),
  measurement_method VARCHAR(50),
  
  -- Weight
  weight_kg DECIMAL(6,2) CHECK (weight_kg > 0 AND weight_kg < 500),
  
  -- Body Condition
  body_condition_score INTEGER CHECK (body_condition_score BETWEEN 1 AND 9),
  
  -- Dimensions
  height_shoulder_cm DECIMAL(5,2),
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

CREATE INDEX idx_measurements_pet ON physical_measurements(pet_id);
CREATE INDEX idx_measurements_date ON physical_measurements(measured_date);
```

**Purpose**: Track weight/measurements over time (currently just a single weight field in pets table)

#### ❌ **pet_photos**
```sql
CREATE TABLE pet_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  taken_date DATE,
  is_cover BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pet_photos_pet ON pet_photos(pet_id);
```

**Purpose**: Gallery of pet photos beyond single profile photo

#### ⚠️ **co_owners** (Check if exists)
```sql
CREATE TABLE co_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  main_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  co_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_level VARCHAR(20) CHECK (permission_level IN ('view', 'edit', 'full')),
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_co_owners_pet ON co_owners(pet_id);
CREATE INDEX idx_co_owners_user ON co_owners(co_owner_id);
```

**Purpose**: Multi-owner pet management (families, couples)

---

## 4. VIEWS & MATERIALIZED VIEWS NEEDED

### 4.1 Pet Health Summary View

```sql
CREATE OR REPLACE VIEW pet_health_summary AS
SELECT 
  p.id AS pet_id,
  p.name,
  p.owner_id,
  
  -- Vaccination Status
  (
    SELECT COUNT(*) 
    FROM vaccinations v 
    WHERE v.pet_id = p.id 
    AND v.next_due_date < CURRENT_DATE
  ) AS overdue_vaccines,
  
  (
    SELECT COUNT(*) 
    FROM vaccinations v 
    WHERE v.pet_id = p.id 
    AND v.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ) AS upcoming_vaccines,
  
  -- Medication Status
  (
    SELECT COUNT(*) 
    FROM treatments t 
    WHERE t.pet_id = p.id 
    AND t.status = 'active'
  ) AS active_medications,
  
  -- Last Vet Visit
  (
    SELECT MAX(visit_date) 
    FROM medical_visits mv 
    WHERE mv.pet_id = p.id
  ) AS last_vet_visit,
  
  -- Next Appointment
  (
    SELECT MIN(start_time) 
    FROM appointments apt 
    WHERE apt.pet_id = p.id 
    AND apt.start_time > NOW()
  ) AS next_appointment,
  
  -- Health Score (if computed)
  p.health_score,
  
  -- Allergies Count
  (
    SELECT COUNT(*) 
    FROM allergies a 
    WHERE a.pet_id = p.id 
    AND a.is_active = true
  ) AS active_allergies
  
FROM pets p
WHERE p.status = 'active';
```

### 4.2 Vaccination Compliance View

```sql
CREATE MATERIALIZED VIEW mv_vaccination_compliance AS
SELECT 
  p.id AS pet_id,
  p.name,
  p.species,
  p.owner_id,
  
  -- Core Vaccines Status
  BOOL_AND(CASE 
    WHEN rv.vaccine_type = 'core' THEN 
      v.next_due_date IS NULL OR v.next_due_date >= CURRENT_DATE
    ELSE true
  END) AS core_vaccines_current,
  
  -- All Vaccines Status
  ARRAY_AGG(json_build_object(
    'vaccine_name', rv.name,
    'vaccine_type', rv.vaccine_type,
    'last_given', v.date_administered,
    'next_due', v.next_due_date,
    'status', CASE 
      WHEN v.next_due_date IS NULL THEN 'none'
      WHEN v.next_due_date < CURRENT_DATE THEN 'overdue'
      WHEN v.next_due_date < CURRENT_DATE + INTERVAL '30 days' THEN 'due_soon'
      ELSE 'current'
    END
  )) FILTER (WHERE v.id IS NOT NULL) AS vaccine_details
  
FROM pets p
CROSS JOIN reference_vaccines rv
LEFT JOIN vaccinations v ON v.pet_id = p.id AND v.reference_vaccine_id = rv.id
WHERE rv.species_id = p.species_id
GROUP BY p.id, p.name, p.species, p.owner_id;

-- Refresh daily
CREATE INDEX idx_mv_vaccination_compliance_pet ON mv_vaccination_compliance(pet_id);
```

### 4.3 Breed Statistics View

```sql
CREATE OR REPLACE VIEW breed_statistics AS
SELECT 
  b.id AS breed_id,
  b.name AS breed_name,
  b.species,
  COUNT(p.id) AS pet_count,
  AVG(p.health_score) AS avg_health_score,
  AVG(EXTRACT(YEAR FROM AGE(p.date_of_birth)))::INTEGER AS avg_age_years,
  
  -- Most common issues for this breed
  ARRAY_AGG(DISTINCT c.condition_name ORDER BY c.condition_name) FILTER (WHERE c.id IS NOT NULL) AS common_conditions
  
FROM breeds b
LEFT JOIN pets p ON p.breed_id = b.id
LEFT JOIN conditions c ON c.pet_id = p.id AND c.status = 'active'
GROUP BY b.id, b.name, b.species;
```

### 4.4 Pet Passport Compliance View

```sql
CREATE OR REPLACE VIEW pet_passport_compliance AS
SELECT 
  p.id AS pet_id,
  p.name,
  p.passport_id,
  
  -- Microchip Status
  p.microchip_number IS NOT NULL AS has_microchip,
  
  -- Rabies Vaccination Status (required for EU passport)
  EXISTS (
    SELECT 1 FROM vaccinations v
    JOIN reference_vaccines rv ON v.reference_vaccine_id = rv.id
    WHERE v.pet_id = p.id
    AND rv.name ILIKE '%rabies%'
    AND v.next_due_date >= CURRENT_DATE
  ) AS rabies_current,
  
  -- Vet Health Certificate Status
  (
    SELECT MAX(mv.visit_date)
    FROM medical_visits mv
    WHERE mv.pet_id = p.id
  ) > CURRENT_DATE - INTERVAL '1 year' AS annual_checkup_current,
  
  -- Overall Compliance
  (
    p.microchip_number IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM vaccinations v
      JOIN reference_vaccines rv ON v.reference_vaccine_id = rv.id
      WHERE v.pet_id = p.id
      AND rv.name ILIKE '%rabies%'
      AND v.next_due_date >= CURRENT_DATE
    )
  ) AS eu_passport_compliant
  
FROM pets p
WHERE p.species IN ('dog', 'cat');
```

---

## 5. MISSING POSTGRES EXTENSIONS

### 5.1 Current Extensions (Need to Check)

Run this query to see what's installed:
```sql
SELECT * FROM pg_extension;
```

### 5.2 Recommended Extensions

**A. pg_trgm** - For fuzzy search on breed names
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Then create GIN index for similarity search
CREATE INDEX idx_breeds_name_trgm ON breeds USING GIN (name gin_trgm_ops);

-- Usage: Find similar breed names
SELECT * FROM breeds WHERE name % 'Golden Retreiver';  -- Typo-tolerant
```

**B. postgis** - For location-based queries (vet clinics nearby)
```sql
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column to service_providers
ALTER TABLE service_providers ADD COLUMN geom geometry(POINT, 4326);

-- Find vets within 10km
SELECT * FROM service_providers
WHERE ST_DWithin(
  geom,
  ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
  10000  -- 10km
);
```

**C. uuid-ossp** - For UUID generation (might already exist)
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**D. pg_stat_statements** - For query performance monitoring
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

---

## 6. FOREIGN KEY RELATIONSHIPS ANALYSIS

### 6.1 Current Missing Foreign Keys

Based on the analysis, these foreign keys are MISSING:

```sql
-- ❌ pets.breed should be breed_id with FK
ALTER TABLE pets DROP COLUMN breed;
ALTER TABLE pets ADD COLUMN breed_id UUID REFERENCES breeds(id);
ALTER TABLE pets ADD COLUMN breed_name VARCHAR(100);  -- Cached for display

-- ❌ pets.species should be species_id with FK
ALTER TABLE pets ADD COLUMN species_id UUID REFERENCES species(id);
-- Keep species TEXT for backwards compatibility, but derive from species_id

-- ❌ vaccinations.reference_vaccine_id FK (check if exists)
-- From spec: vaccinations.vaccine_id should reference reference_vaccines
ALTER TABLE vaccinations 
  ADD COLUMN IF NOT EXISTS reference_vaccine_id UUID REFERENCES reference_vaccines(id);

-- ❌ treatments.reference_medication_id FK (check if exists)
ALTER TABLE treatments 
  ADD COLUMN IF NOT EXISTS reference_medication_id UUID REFERENCES reference_medications(id);

-- ❌ pets.color should reference colors table
ALTER TABLE pets ADD COLUMN color_id UUID REFERENCES colors(id);

-- ❌ breeds.species_id FK (check if exists)
ALTER TABLE breeds 
  ADD COLUMN IF NOT EXISTS species_id UUID REFERENCES species(id);
```

### 6.2 Recommended Composite Indexes

```sql
-- Pet health queries (most common)
CREATE INDEX idx_pets_owner_species ON pets(owner_id, species_id);
CREATE INDEX idx_pets_owner_status ON pets(owner_id, status);

-- Vaccination searches
CREATE INDEX idx_vaccinations_pet_status ON vaccinations(pet_id, next_due_date);

-- Treatment searches
CREATE INDEX idx_treatments_pet_active ON treatments(pet_id, status) WHERE status = 'active';

-- Medical visits timeline
CREATE INDEX idx_medical_visits_pet_date ON medical_visits(pet_id, visit_date DESC);

-- Breed lookups
CREATE INDEX idx_breeds_species_name ON breeds(species_id, name);
```

---

## 7. DATA INTEGRITY CHECKS NEEDED

### 7.1 Orphaned Records Check

```sql
-- Check for pets with invalid owner_id
SELECT COUNT(*) AS orphaned_pets
FROM pets p
LEFT JOIN users u ON p.owner_id = u.id
WHERE u.id IS NULL;

-- Check for vaccinations with invalid pet_id
SELECT COUNT(*) AS orphaned_vaccinations
FROM vaccinations v
LEFT JOIN pets p ON v.pet_id = p.id
WHERE p.id IS NULL;

-- Check for treatments with invalid pet_id
SELECT COUNT(*) AS orphaned_treatments
FROM treatments t
LEFT JOIN pets p ON t.pet_id = p.id
WHERE p.id IS NULL;
```

### 7.2 Data Type Inconsistencies

```sql
-- Find pets with invalid weight_kg (currently TEXT!)
SELECT id, name, weight 
FROM pets 
WHERE weight IS NOT NULL 
AND weight !~ '^[0-9.]+$';

-- Find pets with invalid height
SELECT id, name, height 
FROM pets 
WHERE height IS NOT NULL 
AND height !~ '^[0-9.]+$';
```

---

## 8. SUMMARY OF GAPS

### Critical Issues (P0 - Must Fix)

1. ❌ **30+ missing fields** in pets table
2. ⚠️ **Wrong data types** for weight/height (TEXT instead of NUMERIC)
3. ❌ **Missing FK relationships** (breed_id, species_id)
4. ❌ **Missing physical_measurements table** (weight history)
5. ❌ **Missing pet_photos table** (photo gallery)

### High Priority (P1 - Should Fix)

6. ❌ **Missing reference tables** (coat_types, eye_colors, ear_types, tail_types, color_patterns)
7. ❌ **Missing breed_health_risks table**
8. ❌ **No vaccination_status computed field**
9. ❌ **Missing views** for health summary, vaccination compliance
10. ⚠️ **Missing indexes** on foreign keys

### Medium Priority (P2 - Nice to Have)

11. ❌ **Missing extensions** (pg_trgm, postgis)
12. ❌ **No materialized views** for analytics
13. ❌ **Missing co_owners table** (multi-user pet management)

---

## 9. NEXT STEPS - RECOMMENDED MIGRATION PLAN

### Phase 1: Fix Critical Data Types (Week 1)
1. Backup pets table
2. Migrate weight/height from TEXT to NUMERIC
3. Add missing FK columns (breed_id, species_id)
4. Populate FKs from existing TEXT values

### Phase 2: Add Missing Fields (Week 2)
1. Add all 30 missing fields to pets table
2. Create missing reference tables
3. Set up FK constraints

### Phase 3: Create Missing Tables (Week 3)
1. Create physical_measurements table
2. Migrate current weight to first measurement record
3. Create pet_photos table
4. Migrate photo_url to first photo record

### Phase 4: Views & Indexes (Week 4)
1. Create all health summary views
2. Create materialized views for analytics
3. Add composite indexes
4. Install recommended extensions

### Phase 5: Data Quality (Week 5)
1. Clean up orphaned records
2. Validate all FK relationships
3. Update RLS policies for new tables
4. Performance testing

---

**Total Work Estimated**: 5 weeks  
**Database Impact**: ~10 new tables, ~30 new columns, ~20 new views/indexes  
**Data Migration Risk**: MEDIUM (weight/height type conversion)  
**Application Code Impact**: HIGH (TypeScript types, API queries, frontend components)

---

**Document Status**: 🔴 Draft - Requires Validation  
**Next Action**: Verify current database structure with actual queries
