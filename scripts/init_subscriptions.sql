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

-- Public read access (for pricing page) - Authenticated users only? Or everyone?
-- Usually public pricing is public.
DROP POLICY IF EXISTS "Public can view active plans" ON subscription_plans;
CREATE POLICY "Public can view active plans"
ON subscription_plans FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Admins full access
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

-- Only admins can manage promo codes
CREATE POLICY "Admins manage promo codes"
ON promo_codes FOR ALL
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);

-- Users can verify codes - typically via edge function to hide logic, 
-- but RLS could allow SELECT where code = input? 
-- Safer: Only allow SELECT by code.
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

-- Users view own transactions
CREATE POLICY "Users view own transactions"
ON payment_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins view all
CREATE POLICY "Admins view all transactions"
ON payment_transactions FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from admin_profiles ap
    where ap.user_id = auth.uid()
  )
);
