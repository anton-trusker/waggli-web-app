-- Init Missing Tables for Waggli Platform
-- FIXED: Explicitly adds columns to handle pre-existing tables with divergent schemas

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('alert', 'reminder', 'info', 'marketing')) DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = owner_id);


-- 2. Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users NOT NULL,
  pet_id UUID REFERENCES pets,
  title TEXT NOT NULL,
  date DATE, -- Allow null initially to prevent errors if adding to existing rows
  time TIME,
  priority TEXT DEFAULT 'Medium',
  repeat TEXT DEFAULT 'Never',
  category TEXT DEFAULT 'General',
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix Missing Columns if Table Exists
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS time TIME;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS repeat TEXT;

-- RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own reminders" ON reminders;
CREATE POLICY "Users manage own reminders" ON reminders FOR ALL USING (auth.uid() = owner_id);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users NOT NULL,
  pet_id UUID REFERENCES pets,
  provider_id UUID REFERENCES service_providers,
  title TEXT NOT NULL,
  date DATE,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'Scheduled',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix Missing Columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES service_providers;

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own appointments" ON appointments;
CREATE POLICY "Users manage own appointments" ON appointments FOR ALL USING (auth.uid() = owner_id);

-- 4. User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users NOT NULL,
  plan_id UUID REFERENCES subscription_plans,
  status TEXT DEFAULT 'trialing',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users;
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS status TEXT;

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own subscription" ON user_subscriptions;
CREATE POLICY "Users view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = owner_id);


-- Indexes (Safe Creation)
CREATE INDEX IF NOT EXISTS idx_notifications_owner_id ON notifications(owner_id);
CREATE INDEX IF NOT EXISTS idx_reminders_owner_date ON reminders(owner_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);

