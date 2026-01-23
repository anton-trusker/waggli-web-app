-- Database Optimization Script
-- Run this in your Supabase SQL Editor

-- Pets Indexes
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);

-- Appointments Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_owner_id ON appointments(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Health Records Indexes
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_id ON vaccines(pet_id);
CREATE INDEX IF NOT EXISTS idx_medications_pet_id ON medications(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_pet_id ON health_metrics(pet_id);

-- Service Providers
CREATE INDEX IF NOT EXISTS idx_service_providers_owner_id ON service_providers(owner_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_status ON service_providers(status);
CREATE INDEX IF NOT EXISTS idx_service_providers_location ON service_providers USING GIST (ll_to_earth(latitude, longitude)); -- Requires earthdistance extension, fallback below
-- CREATE INDEX IF NOT EXISTS idx_service_providers_lat_long ON service_providers(latitude, longitude);

-- Usage:
-- Copy and paste into Supabase Dashboard -> SQL Editor
