-- Phase 8: User Management & Subscription
SET search_path TO public, extensions;

-- 1. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language_code VARCHAR(10) DEFAULT 'en' REFERENCES languages(code),
  currency_code VARCHAR(3) DEFAULT 'USD' REFERENCES currencies(code),
  
  -- UI
  theme_mode VARCHAR(20) DEFAULT 'system', -- 'light', 'dark', 'system'
  
  -- Notification Settings
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  
  -- Notification Categories
  notify_vaccines BOOLEAN DEFAULT TRUE,
  notify_medications BOOLEAN DEFAULT TRUE,
  notify_appointments BOOLEAN DEFAULT TRUE,
  notify_weight_reminders BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY, -- 'free', 'pro_monthly', 'pro_yearly', 'family'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  price_monthly NUMERIC(10,2),
  price_yearly NUMERIC(10,2),
  currency_code VARCHAR(3) DEFAULT 'USD',
  
  features TEXT[], -- Array of feature keys
  max_pets INTEGER DEFAULT 1,
  max_storage_gb INTEGER DEFAULT 1,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Plans
INSERT INTO subscription_plans (id, name, description, price_monthly, max_pets, features) VALUES
('free', 'Free Tier', 'Basic pet tracking', 0, 1, ARRAY['basic_health', 'vaccine_tracking']),
('pro', 'Waggly Pro', 'Advanced health insights and unlimited pets', 9.99, 10, ARRAY['basic_health', 'vaccine_tracking', 'health_score', 'ai_insights', 'document_storage'])
ON CONFLICT (id) DO NOTHING;

-- 3. User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  plan_id VARCHAR(50) REFERENCES subscription_plans(id),
  
  status VARCHAR(20) CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Payment Provider Info
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id);

-- 4. Onboarding Progress
CREATE TABLE IF NOT EXISTS onboarding_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  has_completed_profile BOOLEAN DEFAULT FALSE,
  has_added_pet BOOLEAN DEFAULT FALSE,
  has_added_vet BOOLEAN DEFAULT FALSE,
  current_step VARCHAR(50),
  completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users manage own preferences" ON user_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read plans" ON subscription_plans
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Users view own subscription" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own onboarding" ON onboarding_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
