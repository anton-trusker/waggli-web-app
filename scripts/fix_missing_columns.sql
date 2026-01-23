-- Fix user status column
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Fix platform_settings
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS ai_icon_url TEXT;

-- Fix pets table with extensive missing fields from types.ts
ALTER TABLE pets ADD COLUMN IF NOT EXISTS breed_notes TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS distinguishing_marks TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS coat_type TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS tail_type TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS eye_color TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS ear_type TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS neutered BOOLEAN;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS passport_issuer TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS passport_date TEXT; -- Keeping as text for flexibility or DATE
ALTER TABLE pets ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS veterinarian TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS veterinarian_contact TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS allergies TEXT[];
ALTER TABLE pets ADD COLUMN IF NOT EXISTS personality TEXT[];
ALTER TABLE pets ADD COLUMN IF NOT EXISTS microchip_id TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS microchip_type TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS height TEXT; 

-- Ensure RLS doesn't block updates to these new columns (Policies usually cover 'ALL' columns, but good to be sure)
-- (No specific action needed if policies are "FOR UPDATE USING (auth.uid() = owner_id)")

-- Fix service_providers if needed (based on types.ts)
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS services_list TEXT[];
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS reviews_list JSONB; -- Store embedded reviews if simple
