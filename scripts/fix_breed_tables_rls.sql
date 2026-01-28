-- Fix RLS Policies for Breed Tables
-- These tables need public read access for the Add Pet form

-- Enable RLS on breed tables
ALTER TABLE dog_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat_breeds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to dog_breeds" ON dog_breeds;
DROP POLICY IF EXISTS "Allow public read access to cat_breeds" ON cat_breeds;

-- Create policies to allow anyone (authenticated and anonymous) to read breeds
CREATE POLICY "Allow public read access to dog_breeds"
ON dog_breeds FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to cat_breeds"
ON cat_breeds FOR SELECT
TO anon, authenticated
USING (true);

-- Also check reference_vaccines table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reference_vaccines') THEN
        ALTER TABLE reference_vaccines ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow public read access to reference_vaccines" ON reference_vaccines;
        
        CREATE POLICY "Allow public read access to reference_vaccines"
        ON reference_vaccines FOR SELECT
        TO anon, authenticated
        USING (true);
    END IF;
END $$;
