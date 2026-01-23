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
