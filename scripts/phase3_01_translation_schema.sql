-- Phase 3: Translation & Content Infrastructure
SET search_path TO public, extensions;

-- 1. Content Master Table (CMS)
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type content_type NOT NULL, -- Enum from Phase 1
  slug TEXT UNIQUE,
  
  -- Ownership
  owner_id UUID REFERENCES auth.users(id),
  author_id UUID REFERENCES auth.users(id), -- Distinct from owner? Keep simple for now
  
  -- Lifecycle
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  
  -- Metadata
  category VARCHAR(100),
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX IF NOT EXISTS idx_content_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_published ON content_items(is_published) WHERE is_published = TRUE;

-- 2. Content Translations (Row-per-Locale)
CREATE TABLE IF NOT EXISTS content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  
  -- Content
  title TEXT,
  summary TEXT,
  body TEXT, -- Markdown or HTML
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- AI Embeddings (for pgvector Search)
  embedding vector(1536), -- Compatible with OpenAI text-embedding-3-small
  embedding_model VARCHAR(100),
  embedding_generated_at TIMESTAMPTZ,
  
  -- Translation Meta
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(content_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_content_translations_lookup ON content_translations(content_id, language_code);
-- Full text search index (Simple config for multi-language basic support, or use specific configs per row if advanced)
CREATE INDEX IF NOT EXISTS idx_content_translations_fts ON content_translations USING GIN(to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(body, '')));

-- 3. UI Translations (Key-Value Store)
CREATE TABLE IF NOT EXISTS ui_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace VARCHAR(50) DEFAULT 'common', -- e.g., 'auth', 'dashboard', 'settings'
  key VARCHAR(200) NOT NULL,
  language_code VARCHAR(10) NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  value TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(namespace, key, language_code)
);

CREATE INDEX IF NOT EXISTS idx_ui_translations_lookup ON ui_translations(language_code, namespace);

-- RLS Policies

-- Content Items
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Public can view published content
CREATE POLICY "Public read published content" ON content_items
  FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE AND deleted_at IS NULL);

-- Admins/Authors can manage
CREATE POLICY "Authors manage own content" ON content_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id);

-- Content Translations
ALTER TABLE content_translations ENABLE ROW LEVEL SECURITY;

-- Public can view translations of published content
CREATE POLICY "Public read translations" ON content_translations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content_items 
      WHERE id = content_translations.content_id 
      AND is_published = TRUE 
      AND deleted_at IS NULL
    )
  );

-- UI Translations
ALTER TABLE ui_translations ENABLE ROW LEVEL SECURITY;

-- Everyone can read UI translations
CREATE POLICY "Public read ui translations" ON ui_translations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins update UI translations (assuming admin table or role check later, for now restricted to service role or specific users)
-- Keeping it read-only for public for now.
