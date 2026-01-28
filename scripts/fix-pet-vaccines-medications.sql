-- Fix pet_vaccines and pet_medications tables
-- This script ensures the tables have the correct schema

-- Add owner_id column to pet_vaccines if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pet_vaccines' AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE pet_vaccines ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add owner_id column to pet_medications if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pet_medications' AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE pet_medications ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Update RLS policies for pet_vaccines
DROP POLICY IF EXISTS "Allow public read access to pet_vaccines" ON pet_vaccines;
CREATE POLICY "Allow public read access to pet_vaccines" 
ON pet_vaccines FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow users to manage their own pet vaccines
CREATE POLICY "Users can manage own pet vaccines" 
ON pet_vaccines FOR ALL 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Update RLS policies for pet_medications
DROP POLICY IF EXISTS "Allow public read access to pet_medications" ON pet_medications;
CREATE POLICY "Allow public read access to pet_medications" 
ON pet_medications FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow users to manage their own pet medications
CREATE POLICY "Users can manage own pet medications" 
ON pet_medications FOR ALL 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Ensure RLS is enabled
ALTER TABLE pet_vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_medications ENABLE ROW LEVEL SECURITY;
