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

CREATE POLICY "Admins can view moderation"
ON user_moderation FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert moderation"
ON user_moderation FOR INSERT
TO authenticated
WITH CHECK (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

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

CREATE POLICY "Admins can view all notes"
ON user_support_notes FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage notes"
ON user_support_notes FOR ALL
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);
