-- Phase 5: Media & Asset Management
SET search_path TO public, extensions;

-- 1. Media Assets Master Table
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id), -- Uploader
  
  -- Storage Info
  storage_bucket VARCHAR(50) NOT NULL DEFAULT 'main',
  storage_path TEXT NOT NULL, -- 'users/123/avatar.jpg'
  filename VARCHAR(255) NOT NULL,
  
  -- File Info
  public_url TEXT, -- Cached public URL if applicable
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  
  -- Classification
  type media_type NOT NULL DEFAULT 'pet_photo',
  
  -- Metadata
  alt_text TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Exif, AI tags, etc.
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_media_assets_user ON media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);

-- 2. Placeholder Templates (Default Images)
CREATE TABLE IF NOT EXISTS placeholder_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL, -- 'dog_default', 'cat_avatar', 'vet_icon'
  category VARCHAR(50), -- 'species', 'ui', 'user'
  
  -- The asset
  media_asset_id UUID REFERENCES media_assets(id),
  fallback_url TEXT NOT NULL, -- CDN URL
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

-- Media Assets
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Public read access (Images are generally public if they have a URL, but we can restrict)
-- For now, allow public read for non-deleted assets
CREATE POLICY "Public read media assets" ON media_assets
  FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

-- Owners can upload/update their own
CREATE POLICY "Users manage own assets" ON media_assets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Placeholders
ALTER TABLE placeholder_templates ENABLE ROW LEVEL SECURITY;

-- Public read placeholders
CREATE POLICY "Public read placeholders" ON placeholder_templates
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- Storage Objects Policy (Safe attempt, might fail if 'storage' schema not accessible via migration)
-- Usually managed via Supabase Dashboard or separate API, but simple RLS on storage.objects is possible in SQL
-- We will skip storage.objects RLS here to avoid permission errors, assuming standard bucket setup.
