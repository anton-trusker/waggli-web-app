-- Fix RLS Policies for Feature Flags and Reference Data
-- Run this in Supabase SQL Editor

-- Feature Flags: Allow public read access
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to feature_flags"
ON feature_flags FOR SELECT
TO anon, authenticated
USING (true);

-- Reference Breeds: Allow public read access
ALTER TABLE reference_breeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reference_breeds"
ON reference_breeds FOR SELECT
TO anon, authenticated
USING (true);

-- Ensure other reference tables are readable
ALTER TABLE pet_vaccines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to pet_vaccines" ON pet_vaccines FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE pet_medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to pet_medications" ON pet_medications FOR SELECT TO anon, authenticated USING (true);

-- Users: Ensure users can read/update their own profile
-- (Assuming 'users' table exists and RLS enabled)
CREATE POLICY "Users can read own profile" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

