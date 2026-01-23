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
CREATE POLICY "Admins manage marketing" ON marketing_campaigns FOR ALL TO authenticated USING (exists (select 1 from admin_profiles where user_id = auth.uid()));
CREATE POLICY "Admins manage content" ON marketing_content FOR ALL TO authenticated USING (exists (select 1 from admin_profiles where user_id = auth.uid()));
CREATE POLICY "Admins manage segments" ON audience_segments FOR ALL TO authenticated USING (exists (select 1 from admin_profiles where user_id = auth.uid()));
CREATE POLICY "Admins view analytics" ON marketing_analytics FOR SELECT TO authenticated USING (exists (select 1 from admin_profiles where user_id = auth.uid()));

-- Users Read Content (Complex policy needed for targeting)
-- For high performance, fetching content usually happens via a dedicated RPC function 
-- that matches user attributes against the segments, rather than raw RLS.
-- But for basic selects:
CREATE POLICY "Users view active content" ON marketing_content FOR SELECT TO authenticated 
USING (
  exists (
    select 1 from marketing_campaigns c 
    where c.id = campaign_id 
    and c.status = 'Active' 
    and (c.start_date IS NULL OR c.start_date <= NOW())
    and (c.end_date IS NULL OR c.end_date >= NOW())
  )
);
