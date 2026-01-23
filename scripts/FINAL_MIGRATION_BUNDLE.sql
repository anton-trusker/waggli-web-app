-- Add missing columns to platform_settings
ALTER TABLE platform_settings 
ADD COLUMN IF NOT EXISTS ai_icon_url TEXT;

-- Verify keys/foreign keys if needed (none for this)
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
-- Fix RLS Policies for Feature Flags and Reference Data
-- Run this in Supabase SQL Editor

-- Feature Flags: Allow public read access
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to feature_flags" ON feature_flags;
CREATE POLICY "Allow public read access to feature_flags"
ON feature_flags FOR SELECT
TO anon, authenticated
USING (true);

-- Reference Breeds: Allow public read access
ALTER TABLE reference_breeds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to reference_breeds" ON reference_breeds;
CREATE POLICY "Allow public read access to reference_breeds"
ON reference_breeds FOR SELECT
TO anon, authenticated
USING (true);

-- Ensure other reference tables are readable
ALTER TABLE pet_vaccines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to pet_vaccines" ON pet_vaccines;
CREATE POLICY "Allow public read access to pet_vaccines" ON pet_vaccines FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE pet_medications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to pet_medications" ON pet_medications;
CREATE POLICY "Allow public read access to pet_medications" ON pet_medications FOR SELECT TO anon, authenticated USING (true);

-- Users: Ensure users can read/update their own profile
-- (Assuming 'users' table exists and RLS enabled)
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile" ON users FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Add missing user profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;

-- These columns should already exist from previous migrations, but adding IF NOT EXISTS for safety
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
-- Phase 1: Admin RBAC & Audit Tables

-- 1. Admin Profiles Table
CREATE TABLE IF NOT EXISTS admin_profiles (
  user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'support', 'content', 'compliance', 'finance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users
);

-- RLS: Only admins can view profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Admin Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON admin_profiles;
CREATE POLICY "Admins can view all profiles"
ON admin_profiles FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
    and ap.role IN ('super_admin', 'support') -- Basic access
  )
);

DROP POLICY IF EXISTS "Super Admins can manage profiles" ON admin_profiles;
CREATE POLICY "Super Admins can manage profiles"
ON admin_profiles FOR ALL
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
    and ap.role = 'super_admin'
  )
);

-- Audit Logs
DROP POLICY IF EXISTS "Admins can insert logs" ON admin_audit_log;
CREATE POLICY "Admins can insert logs"
ON admin_audit_log FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = admin_id AND
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Compliance can view logs" ON admin_audit_log;
CREATE POLICY "Compliance can view logs"
ON admin_audit_log FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
    and ap.role IN ('super_admin', 'compliance')
  )
);

-- Phase 4: Advanced Marketing Hub

-- 1. Audience Segments (Targeting Rules)
CREATE TABLE IF NOT EXISTS audience_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL, 
  -- Example: { "breed": ["Labrador", "Poodle"], "plan": ["Premium"], "last_active_days": 30 }
  is_dynamic BOOLEAN DEFAULT true, -- If false, it's a fixed list of IDs
  estimated_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Marketing Campaigns (Parent Container)
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Scheduled', 'Active', 'Paused', 'Completed', 'Archived')),
  priority INTEGER DEFAULT 0, -- For conflicting placements (banner vs banner)
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  budget_total INTEGER, -- In cents
  budget_spent INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Marketing Content (The actual creative)
CREATE TABLE IF NOT EXISTS marketing_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES marketing_campaigns ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('banner', 'email', 'notification', 'post', 'popup', 'article')),
  
  -- Placement: where it appears. 
  -- Banners: 'home_hero', 'sidebar', 'pet_profile'
  -- Notifications: 'push', 'in_app_toast', 'header_alert'
  -- Emails: 'newsletter', 'transactional'
  -- Posts: 'feed', 'recommendation', 'news'
  placement_zone TEXT, 
  
  title TEXT,
  body TEXT, -- Markdown or HTML
  media_url TEXT, -- Main image/video
  cta_text TEXT,
  cta_link TEXT,
  
  -- Advanced Config
  metadata JSONB, -- Custom styles, specific conditions, key-value pairs
  ai_generated BOOLEAN DEFAULT false,
  
  segment_id UUID REFERENCES audience_segments, -- Specific targeting for this piece
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Campaign Analytics
CREATE TABLE IF NOT EXISTS marketing_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES marketing_campaigns,
  content_id UUID REFERENCES marketing_content,
  event_type TEXT NOT NULL, -- 'view', 'click', 'dismiss', 'conversion'
  user_id UUID REFERENCES users,
  metadata JSONB, -- device info, etc
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_analytics ENABLE ROW LEVEL SECURITY;

-- Admins Manage All
DROP POLICY IF EXISTS "Admins manage marketing" ON marketing_campaigns;
CREATE POLICY "Admins manage marketing" ON marketing_campaigns FOR ALL TO authenticated USING (exists (select 1 from admin_profiles where user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage content" ON marketing_content;
CREATE POLICY "Admins manage content" ON marketing_content FOR ALL TO authenticated USING (exists (select 1 from admin_profiles where user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage segments" ON audience_segments;
CREATE POLICY "Admins manage segments" ON audience_segments FOR ALL TO authenticated USING (exists (select 1 from admin_profiles where user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins view analytics" ON marketing_analytics;
CREATE POLICY "Admins view analytics" ON marketing_analytics FOR SELECT TO authenticated USING (exists (select 1 from admin_profiles where user_id = auth.uid()));

-- Ensure columns exist (in case table was created previously without them)
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Critical Fix: Users need to see the Campaign to verify its status in the Content policy below
DROP POLICY IF EXISTS "Users view active campaigns" ON marketing_campaigns;
CREATE POLICY "Users view active campaigns" ON marketing_campaigns FOR SELECT TO authenticated USING (status = 'Active');

DROP POLICY IF EXISTS "Users view active content" ON marketing_content;
CREATE POLICY "Users view active content" ON marketing_content FOR SELECT TO authenticated 
USING (
  exists (
    select 1 from marketing_campaigns
    where marketing_campaigns.id = marketing_content.campaign_id 
    and marketing_campaigns.status = 'Active' 
    and (marketing_campaigns.start_date IS NULL OR marketing_campaigns.start_date <= NOW())
    and (marketing_campaigns.end_date IS NULL OR marketing_campaigns.end_date >= NOW())
  )
);

-- Phase 2: User Moderation & Support

-- 1. User Moderation Table (Bans/Suspensions)
CREATE TABLE IF NOT EXISTS user_moderation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('shadowban', 'suspension', 'hard_ban')),
  reason_internal TEXT,
  reason_user_facing TEXT,
  status TEXT DEFAULT 'active', -- active, expired, revoked
  expires_at TIMESTAMPTZ, -- NULL for permanent
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users
);

-- RLS: Only admins can view/manage moderation
ALTER TABLE user_moderation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view moderation" ON user_moderation;
CREATE POLICY "Admins can view moderation"
ON user_moderation FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can insert moderation" ON user_moderation;
CREATE POLICY "Admins can insert moderation"
ON user_moderation FOR INSERT
TO authenticated
WITH CHECK (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can update moderation" ON user_moderation;
CREATE POLICY "Admins can update moderation"
ON user_moderation FOR UPDATE
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

-- 2. User Support Notes
CREATE TABLE IF NOT EXISTS user_support_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  author_id UUID REFERENCES auth.users NOT NULL,
  note TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_support_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all notes" ON user_support_notes;
CREATE POLICY "Admins can view all notes"
ON user_support_notes FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage notes" ON user_support_notes;
CREATE POLICY "Admins can manage notes"
ON user_support_notes FOR ALL
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

-- Phase 3: Subscription Engine

-- 1. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  internal_name TEXT UNIQUE NOT NULL, -- 'pro_monthly_v1'
  display_name TEXT NOT NULL,         -- 'Pro Plan'
  stripe_product_id TEXT,
  price_monthly INTEGER NOT NULL,     -- price in cents (e.g. 999 = $9.99)
  price_yearly INTEGER,
  trial_days INTEGER DEFAULT 7,
  
  -- Entitlements
  max_pets INTEGER DEFAULT 1,         -- -1 for unlimited
  can_use_ai_assistant BOOLEAN DEFAULT false,
  can_share_passport BOOLEAN DEFAULT false,
  monthly_ai_queries INTEGER DEFAULT 10,
  storage_limit_mb INTEGER DEFAULT 100,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Ensure critical columns exist (if table was pre-existing)
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS price_monthly INTEGER DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS internal_name TEXT;

DROP POLICY IF EXISTS "Public can view active plans" ON subscription_plans;
CREATE POLICY "Public can view active plans"
ON subscription_plans FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admins full access plans" ON subscription_plans;
CREATE POLICY "Admins full access plans"
ON subscription_plans FOR ALL
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

-- 2. Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,      -- 'SUMMER2025'
  type TEXT NOT NULL CHECK (type IN ('percent_off', 'fixed_amount', 'extended_trial')),
  value INTEGER NOT NULL,         -- 20 (percent) or 500 ($5.00) or 14 (days)
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage promo codes" ON promo_codes;
CREATE POLICY "Admins manage promo codes"
ON promo_codes FOR ALL
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can verify codes" ON promo_codes;
CREATE POLICY "Users can verify codes"
ON promo_codes FOR SELECT
TO authenticated
USING (true); 

-- 3. Payment Transactions (Simple log)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- 'succeeded', 'failed', 'refunded'
  stripe_charge_id TEXT,
  plan_id UUID REFERENCES subscription_plans,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own transactions" ON payment_transactions;
CREATE POLICY "Users view own transactions"
ON payment_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all transactions" ON payment_transactions;
CREATE POLICY "Admins view all transactions"
ON payment_transactions FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);
-- Database Optimization Script
-- Run this in your Supabase SQL Editor

-- Pets Indexes
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);

-- Appointments Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_owner_id ON appointments(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
-- CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date); -- Column might be named differently (start_time, etc)
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Health Records Indexes
-- CREATE INDEX IF NOT EXISTS idx_vaccines_pet_id ON pet_vaccines(pet_id);
-- CREATE INDEX IF NOT EXISTS idx_medications_pet_id ON pet_medications(pet_id);
-- CREATE INDEX IF NOT EXISTS idx_health_metrics_pet_id ON health_metrics(pet_id);

-- Service Providers Indexes (Optional)
-- CREATE INDEX IF NOT EXISTS idx_service_providers_owner_id ON service_providers(owner_id);
-- CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
-- CREATE INDEX IF NOT EXISTS idx_service_providers_status ON service_providers(status);
-- CREATE INDEX IF NOT EXISTS idx_service_providers_location ON service_providers USING GIST (ll_to_earth(latitude, longitude));
-- CREATE INDEX IF NOT EXISTS idx_service_providers_lat_long ON service_providers(latitude, longitude);

-- Usage:
-- Copy and paste into Supabase Dashboard -> SQL Editor
-- Seed Localization Data (if tables are empty)

-- Insert supported languages if none exist
INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'en', 'English', '🇺🇸', true, true
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'en');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'es', 'Spanish', '🇪🇸', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'es');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'fr', 'French', '🇫🇷', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'fr');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'de', 'German', '🇩🇪', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'de');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'it', 'Italian', '🇮🇹', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'it');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'pt', 'Portuguese', '🇵🇹', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'pt');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'ja', 'Japanese', '🇯🇵', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'ja');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'zh', 'Chinese', '🇨🇳', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'zh');

-- Insert default translations if none exist
INSERT INTO translations (key, translations)
SELECT 'Welcome', '{"en": "Welcome", "es": "Bienvenido", "fr": "Bienvenue", "de": "Willkommen", "it": "Benvenuto", "pt": "Bem-vindo", "ja": "ようこそ", "zh": "欢迎"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Welcome');

INSERT INTO translations (key, translations)
SELECT 'Dashboard', '{"en": "Dashboard", "es": "Panel", "fr": "Tableau de bord", "de": "Armaturenbrett", "it": "Cruscotto", "pt": "Painel", "ja": "ダッシュボード", "zh": "仪表板"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Dashboard');

INSERT INTO translations (key, translations)
SELECT 'Profile', '{"en": "Profile", "es": "Perfil", "fr": "Profil", "de": "Profil", "it": "Profilo", "pt": "Perfil", "ja": "プロフィール", "zh": "个人资料"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Profile');

INSERT INTO translations (key, translations)
SELECT 'Settings', '{"en": "Settings", "es": "Configuración", "fr": "Paramètres", "de": "Einstellungen", "it": "Impostazioni", "pt": "Configurações", "ja": "設定", "zh": "设置"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Settings');

INSERT INTO translations (key, translations)
SELECT 'Pets', '{"en": "Pets", "es": "Mascotas", "fr": "Animaux", "de": "Haustiere", "it": "Animali domestici", "pt": "Animais de estimação", "ja": "ペット", "zh": "宠物"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Pets');

INSERT INTO translations (key, translations)
SELECT 'Add Pet', '{"en": "Add Pet", "es": "Agregar mascota", "fr": "Ajouter un animal", "de": "Haustier hinzufügen", "it": "Aggiungi animale", "pt": "Adicionar animal", "ja": "ペットを追加", "zh": "添加宠物"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Add Pet');

INSERT INTO translations (key, translations)
SELECT 'Save', '{"en": "Save", "es": "Guardar", "fr": "Enregistrer", "de": "Speichern", "it": "Salva", "pt": "Salvar", "ja": "保存", "zh": "保存"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Save');

INSERT INTO translations (key, translations)
SELECT 'Cancel', '{"en": "Cancel", "es": "Cancelar", "fr": "Annuler", "de": "Abbrechen", "it": "Annulla", "pt": "Cancelar", "ja": "キャンセル", "zh": "取消"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Cancel');
-- Create a helper function to execute SQL from the client
-- This allows us to run migrations via the JS SDK (protected by admin role ideally)

create or replace function exec_sql(sql_query text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql_query;
end;
$$;
-- Verify and fix supported_languages table schema

-- Check if table exists and has correct columns
-- Expected columns: code, name, flag, is_active, is_default

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS supported_languages (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    flag TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE supported_languages ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE supported_languages ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE supported_languages ADD COLUMN IF NOT EXISTS flag TEXT;
ALTER TABLE supported_languages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE supported_languages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Check if translations table has correct schema
CREATE TABLE IF NOT EXISTS translations (
    key TEXT PRIMARY KEY,
    translations JSONB NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE translations ADD COLUMN IF NOT EXISTS translations JSONB;
ALTER TABLE translations ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE translations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE translations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Verify the admin has access (RLS policies should already be set from fix_critical_schema_and_rls.sql)
