-- CRITICAL FIX: Add missing avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Fix birth_date to allow NULL (empty dates)
ALTER TABLE pets ALTER COLUMN birth_date DROP NOT NULL;

-- Add missing user columns (if not already added)
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;

-- FIX RLS POLICIES FOR ADMIN ACCESS

-- 1. Platform Settings: Allow admins to update
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage platform settings" ON platform_settings;
DROP POLICY IF EXISTS "Public can read platform settings" ON platform_settings;

-- Allow anyone to read platform settings
CREATE POLICY "Public can read platform settings"
ON platform_settings FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users with admin role to update
-- Note: This assumes you have a way to check admin role. 
-- If users.roles is an array containing 'admin', use this:
CREATE POLICY "Admins can manage platform settings"
ON platform_settings FOR ALL
TO authenticated
USING ((SELECT 'admin' = ANY(roles) FROM users WHERE id = auth.uid()))
WITH CHECK ((SELECT 'admin' = ANY(roles) FROM users WHERE id = auth.uid()));

-- 2. Users table: Ensure users can update their own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id OR 'admin' = ANY(roles));

CREATE POLICY "Admins can manage users"
ON users FOR ALL
TO authenticated
USING (auth.uid() = id OR 'admin' = ANY(roles))
WITH CHECK (auth.uid() = id OR 'admin' = ANY(roles));

-- 3. Feature Flags: Admins can manage
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage feature flags" ON feature_flags;

CREATE POLICY "Admins can manage feature flags"
ON feature_flags FOR ALL
TO authenticated
USING ((SELECT 'admin' = ANY(roles) FROM users WHERE id = auth.uid()))
WITH CHECK ((SELECT 'admin' = ANY(roles) FROM users WHERE id = auth.uid()));

-- 4. Supported Languages: Admins can manage
ALTER TABLE supported_languages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read languages" ON supported_languages;
DROP POLICY IF EXISTS "Admins can manage languages" ON supported_languages;

CREATE POLICY "Public can read languages"
ON supported_languages FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage languages"
ON supported_languages FOR ALL
TO authenticated
USING ((SELECT 'admin' = ANY(roles) FROM users WHERE id = auth.uid()))
WITH CHECK ((SELECT 'admin' = ANY(roles) FROM users WHERE id = auth.uid()));

-- 5. Translations: Admins can manage
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read translations" ON translations;
DROP POLICY IF EXISTS "Admins can manage translations" ON translations;

CREATE POLICY "Public can read translations"
ON translations FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage translations"
ON translations FOR ALL
TO authenticated
USING ((SELECT 'admin' = ANY(roles) FROM users WHERE id = auth.uid()))
WITH CHECK ((SELECT 'admin' = ANY(roles) FROM users WHERE id = auth.uid()));
