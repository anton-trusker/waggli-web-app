-- Phase 5: Spec-Compliant Enhancements

-- 1. Add Segmentation and Granular Features to Plans
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT 'pet_owner' CHECK (segment IN ('pet_owner', 'service_provider')),
ADD COLUMN IF NOT EXISTS commission_rate INTEGER DEFAULT 0, -- percent (e.g. 15 = 15%)
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}'::jsonb, -- Flexible dictionary for "Health Score: Predictive" etc.
ADD COLUMN IF NOT EXISTS listings_limit INTEGER DEFAULT 0; -- For providers

-- 2. Migrate existing specific columns to 'features' (Optional, but good for cleanup)
-- We will keep the specific columns (max_pets, storage) for easier querying, 
-- but add metadata to features for display.

-- 3. Add Downgrade/Upgrade tracking (optional, good for history)
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS upgrade_logic TEXT DEFAULT 'immediate_prorated';
