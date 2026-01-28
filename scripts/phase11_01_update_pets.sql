-- Phase 11: Migration Strategy - Update Pets Schema
SET search_path TO public, extensions;

-- Add Foreign Keys if they don't exist
ALTER TABLE pets 
  ADD COLUMN IF NOT EXISTS species_id UUID REFERENCES species(id),
  ADD COLUMN IF NOT EXISTS breed_id UUID REFERENCES breeds(id),
  ADD COLUMN IF NOT EXISTS color_ids UUID[], -- Array of color table IDs
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(6,2); -- Cache current weight

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species_id);
CREATE INDEX IF NOT EXISTS idx_pets_breed ON pets(breed_id);
