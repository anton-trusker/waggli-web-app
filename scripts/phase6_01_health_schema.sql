-- Phase 6: Core Business Logic (Health Module)
SET search_path TO public, extensions;

-- 1. Medical Visits (Comprehensive Clinical Record)
CREATE TABLE IF NOT EXISTS medical_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  
  -- Visit Details
  visit_type VARCHAR(50) CHECK (visit_type IN (
    'routine_checkup', 'vaccination', 'sick_visit', 'emergency',
    'surgery', 'specialist', 'follow_up', 'dental', 'lab_work'
  )),
  visit_date TIMESTAMPTZ NOT NULL,
  
  -- Provider Context
  clinic_name VARCHAR(200),
  provider_id UUID REFERENCES service_providers(id), -- If using internal booking
  veterinarian_name VARCHAR(200),
  
  -- Clinical Data
  reason_for_visit TEXT NOT NULL,
  diagnosis TEXT,
  treatment_summary TEXT, -- High level summary
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  follow_up_notes TEXT,
  
  -- Financial
  cost_total NUMERIC(10,2),
  currency_code VARCHAR(3) DEFAULT 'USD',
  insurance_covered BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  notes TEXT,
  attachments UUID[], -- Array of media_asset ids
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_pet_date ON medical_visits(pet_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_type ON medical_visits(visit_type);

-- 2. Vaccinations (Enhanced Tracking)
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  
  -- Vaccine Definition
  reference_vaccine_id UUID REFERENCES reference_vaccines(id),
  vaccine_name_other VARCHAR(200), -- Fallback if not in reference
  
  -- Administration
  date_administered DATE NOT NULL,
  date_expires DATE,
  date_next_due DATE,
  
  -- Clinical Details
  batch_number VARCHAR(100),
  manufacturer VARCHAR(100),
  site_of_injection VARCHAR(100),
  dose_sequence VARCHAR(50), 
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  certificate_asset_id UUID REFERENCES media_assets(id),
  
  -- Provider
  administered_by VARCHAR(200),
  clinic_name VARCHAR(200),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_due ON vaccinations(pet_id, date_next_due);

-- 3. Treatments & Medications
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  
  -- Medication Info
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('medication', 'supplement', 'therapy', 'prevention')),
  reference_medication_id UUID REFERENCES reference_medications(id),
  
  -- Dosage Logic
  dosage_amount NUMERIC(10,3),
  dosage_unit VARCHAR(50),
  frequency_type VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'prn'
  frequency_details JSONB, -- { "times": ["08:00"], "days": ["Mon"] }
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT FALSE,
  
  -- Inventory
  inventory_remaining NUMERIC(10,2),
  inventory_alert_threshold NUMERIC(10,2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatments_pet_status ON treatments(pet_id, status);

-- 4. Treatment Doses (Logs)
CREATE TABLE IF NOT EXISTS treatment_doses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_time TIMESTAMPTZ,
  
  status VARCHAR(20) CHECK (status IN ('pending', 'taken', 'skipped', 'late')),
  skipped_reason TEXT,
  given_by_user_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doses_treatment_time ON treatment_doses(treatment_id, scheduled_time);

-- 5. Health Metrics (Vitals)
CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Core
  weight_kg NUMERIC(6,2),
  body_condition_score INTEGER CHECK (body_condition_score BETWEEN 1 AND 9),
  
  -- Vitals
  temperature_celsius NUMERIC(4,1),
  heart_rate_bpm INTEGER,
  respiratory_rate_rpm INTEGER,
  
  -- Context
  notes TEXT,
  recorded_by_user_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_pet_date ON health_metrics(pet_id, recorded_at DESC);

-- 6. Allergies & Conditions
CREATE TABLE IF NOT EXISTS allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  allergen VARCHAR(200) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
  reaction TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  diagnosis_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'remission', 'resolved'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE medical_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

-- Generic Owner Policy (Can be refined later with Co-Owner logic)
-- "Users can access data if they own the pet"
-- Note: Subqueries in RLS can be expensive, but necessary for normalized schema.
-- We will implement the "Co-Owner" check in Phase 7. For now, simple ownership.

DO $$ BEGIN
  CREATE POLICY "Owners manage visits" ON medical_visits FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM pets WHERE id = medical_visits.pet_id AND owner_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners manage vaccinations" ON vaccinations FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM pets WHERE id = vaccinations.pet_id AND owner_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners manage treatments" ON treatments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM pets WHERE id = treatments.pet_id AND owner_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners manage doses" ON treatment_doses FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM treatments t JOIN pets p ON t.pet_id = p.id WHERE t.id = treatment_doses.treatment_id AND p.owner_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners manage metrics" ON health_metrics FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM pets WHERE id = health_metrics.pet_id AND owner_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners manage allergies" ON allergies FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM pets WHERE id = allergies.pet_id AND owner_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners manage conditions" ON conditions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM pets WHERE id = conditions.pet_id AND owner_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;
