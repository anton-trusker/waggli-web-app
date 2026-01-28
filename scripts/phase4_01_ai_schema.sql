-- Phase 4: AI Content Caching & Embeddings
SET search_path TO public, extensions;

-- 1. AI Content Cache (Cost Optimization)
CREATE TABLE IF NOT EXISTS ai_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type ai_content_type NOT NULL, -- Enum from Phase 1
  
  -- Cache Key (Deterministic)
  input_hash VARCHAR(64) NOT NULL, -- SHA256 of normalized inputs
  input_params JSONB NOT NULL,     -- The actual params used
  
  -- Output
  title TEXT,
  summary TEXT,
  full_content TEXT NOT NULL,
  structured_output JSONB,         -- For JSON responses
  
  -- AI Metadata
  model_used VARCHAR(100),
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  cost_usd NUMERIC(10,6),
  generation_time_ms INTEGER,
  
  -- Locale
  language_code VARCHAR(10) REFERENCES languages(code),
  
  -- Cache Lifecycle
  is_stale BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(type, input_hash, language_code)
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_lookup ON ai_content_cache(type, input_hash, language_code) WHERE is_stale = FALSE;

-- 2. Embedding Jobs Queue (Async Processing)
CREATE TABLE IF NOT EXISTS embedding_jobs (
  id BIGSERIAL PRIMARY KEY,
  content_table TEXT NOT NULL DEFAULT 'content_translations',
  content_id UUID NOT NULL,
  language_code VARCHAR(10),
  
  -- Status
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'done', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  priority INTEGER DEFAULT 0, -- Higher first
  
  -- Context
  payload JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_embedding_jobs_status ON embedding_jobs(status, priority DESC, created_at);

-- 3. AI Prompts / Templates
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL, -- 'breed_recommendation_v1'
  template_text TEXT NOT NULL,
  required_inputs TEXT[],
  model_config JSONB DEFAULT '{"model": "gpt-4o", "temperature": 0.7}'::jsonb,
  
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Audit/Usage Log specifically for AI
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  feature_name VARCHAR(100),
  model VARCHAR(100),
  
  -- Cost
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_cost_usd NUMERIC(10,6),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_log(user_id);

-- RLS
ALTER TABLE ai_content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Policies
-- Cache: Public read (it's optimization), Admin write
CREATE POLICY "Public read AI cache" ON ai_content_cache FOR SELECT TO anon, authenticated USING (true);

-- Prompts: Public read (needed for app instructions), Admin write
CREATE POLICY "Public read AI prompts" ON ai_prompts FOR SELECT TO anon, authenticated USING (is_active = TRUE);

-- Usage Log: Users see own, Admins see all
CREATE POLICY "Users see own usage" ON ai_usage_log FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Embedding Jobs: Service Role only usually, or admin
-- For now, authenticated users can insert (triggering generation) but only read their own?
-- Actually, the trigger creates these.
CREATE POLICY "System manages jobs" ON embedding_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Trigger: Content Change -> Enqueue Embedding
CREATE OR REPLACE FUNCTION enqueue_content_embedding()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Trigger on Insert OR Update of critical fields
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND (
       OLD.title IS DISTINCT FROM NEW.title OR 
       OLD.body IS DISTINCT FROM NEW.body OR
       OLD.summary IS DISTINCT FROM NEW.summary
     )) THEN
     
    INSERT INTO embedding_jobs (content_table, content_id, language_code, status, priority)
    VALUES ('content_translations', NEW.content_id, NEW.language_code, 'queued', 10);
    
  END IF;
  return NEW;
END;
$$;

-- Attach trigger to content_translations
DROP TRIGGER IF EXISTS trg_enqueue_embedding ON content_translations;
CREATE TRIGGER trg_enqueue_embedding
AFTER INSERT OR UPDATE ON content_translations
FOR EACH ROW
EXECUTE FUNCTION enqueue_content_embedding();
