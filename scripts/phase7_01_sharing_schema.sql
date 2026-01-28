-- Phase 7: Sharing & Collaboration Module
SET search_path TO public, extensions;

-- 1. Co-Owners (Care Circle)
CREATE TABLE IF NOT EXISTS co_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Permissions
  role access_role NOT NULL DEFAULT 'viewer', -- Enum (owner, co_owner, editor, viewer)
  permissions JSONB, -- Custom granular overrides
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  
  -- Audit
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(pet_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_co_owners_user ON co_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_co_owners_pet ON co_owners(pet_id);

-- 2. Invitations (Secure Onboarding)
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(64) UNIQUE NOT NULL, -- Secure random hash
  
  -- Target
  email VARCHAR(200), -- Optional if generic link (but unlikely for pet access)
  phone VARCHAR(20),
  
  -- Context
  resource_type VARCHAR(50) NOT NULL DEFAULT 'pet_access',
  resource_id UUID NOT NULL, -- pet_id
  role access_role DEFAULT 'viewer',
  
  -- Security
  inviter_id UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- 3. Public Shares (Temporary Read-only Access)
CREATE TABLE IF NOT EXISTS public_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  
  -- Access Control
  token VARCHAR(32) UNIQUE NOT NULL, -- Short URL friendly
  access_pin VARCHAR(4), -- Optional PIN
  
  -- Scope
  scope VARCHAR(20) NOT NULL CHECK (scope IN ('basic', 'medical', 'full')),
  include_documents BOOLEAN DEFAULT FALSE,
  
  -- Lifecycle
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_shares_token ON public_shares(token);

-- RLS Policies

-- Co-Owners
ALTER TABLE co_owners ENABLE ROW LEVEL SECURITY;

-- Users can see their own co-ownerships
CREATE POLICY "Users view own co-ownerships" ON co_owners
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Primary Owners can manage co-owners for their pets
CREATE POLICY "Owners manage co-owners" ON co_owners
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM pets WHERE id = co_owners.pet_id AND owner_id = auth.uid())
  );

-- Invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Inviter can see invites they sent
CREATE POLICY "Users view sent invites" ON invitations
  FOR SELECT TO authenticated
  USING (inviter_id = auth.uid());

-- Service role manages creation/redemption mostly, or edge functions

-- Public Shares
ALTER TABLE public_shares ENABLE ROW LEVEL SECURITY;

-- Owners can manage shares
CREATE POLICY "Owners manage shares" ON public_shares
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM pets WHERE id = public_shares.pet_id AND owner_id = auth.uid()) OR
    created_by = auth.uid()
  );

-- Public access to public_shares table is usually via Edge Function (secure proxy)
-- forcing application logic to validate token and return data, rather than direct table access for anon.
-- However, we can allow SELECT by token if we want direct DB access.
-- Using Edge Function approach is safer for counting views/logging.
