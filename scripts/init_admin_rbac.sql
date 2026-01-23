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

-- Only Super Admins can manage profiles
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

-- 2. Audit Log Table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Admins can INSERT logs (append-only for most)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

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

-- Only Super Admin & Compliance can view logs
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
