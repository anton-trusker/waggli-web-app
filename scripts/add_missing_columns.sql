-- Add missing columns to platform_settings
ALTER TABLE platform_settings 
ADD COLUMN IF NOT EXISTS ai_icon_url TEXT;

-- Verify keys/foreign keys if needed (none for this)
