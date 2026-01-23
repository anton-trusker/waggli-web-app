-- 1. Fix 'type' column in pets table
ALTER TABLE pets ADD COLUMN IF NOT EXISTS type TEXT;

-- 2. Ensure RLS is enabled on key tables
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- 3. Fix RLS Policies for Pets (CRUD for Owner)
-- Drop existing policies to avoid conflicts/duplicates
DROP POLICY IF EXISTS "Users can view their own pets" ON pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON pets;

-- Create comprehensive policies
CREATE POLICY "Users can view their own pets" 
ON pets FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own pets" 
ON pets FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pets" 
ON pets FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own pets" 
ON pets FOR DELETE 
USING (auth.uid() = owner_id);

-- 4. Fix properties/columns availability (Add any other missing ones found in types.ts)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Fix Reference Data (Breeds) Access
-- Allow Public Read access to reference_breeds (Authenticated and Anon)
DROP POLICY IF EXISTS "Public read access" ON reference_breeds;
CREATE POLICY "Public read access" 
ON reference_breeds FOR SELECT 
TO anon, authenticated 
USING (true);

-- 6. Fix Feature Flags Access (Admin vs User issue)
DROP POLICY IF EXISTS "Public read feature flags" ON feature_flags;
CREATE POLICY "Public read feature flags" 
ON feature_flags FOR SELECT 
TO anon, authenticated 
USING (true);
