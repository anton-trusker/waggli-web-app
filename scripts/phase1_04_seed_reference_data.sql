-- Phase 1, Step 4: Seed Reference Data
-- Description: Inserts initial data for static reference tables

-- 1. Languages
INSERT INTO languages (code, name, native_name, flag_emoji, is_default, display_order) VALUES
  ('en', 'English', 'English', '🇺🇸', TRUE, 1),
  ('es', 'Spanish', 'Español', '🇪🇸', FALSE, 2),
  ('fr', 'French', 'Français', '🇫🇷', FALSE, 3),
  ('de', 'German', 'Deutsch', '🇩🇪', FALSE, 4),
  ('pt', 'Portuguese', 'Português', '🇵🇹', FALSE, 5)
ON CONFLICT (code) DO NOTHING;

-- 2. Currencies
INSERT INTO currencies (code, name, symbol) VALUES
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'British Pound', '£'),
  ('CAD', 'Canadian Dollar', 'C$'),
  ('AUD', 'Australian Dollar', 'A$')
ON CONFLICT (code) DO NOTHING;

-- 3. Species
INSERT INTO species (code, name_key, icon_emoji, display_order) VALUES
  ('dog', 'species.dog', '🐕', 1),
  ('cat', 'species.cat', '🐈', 2),
  ('bird', 'species.bird', '🦜', 3),
  ('rabbit', 'species.rabbit', '🐰', 4),
  ('other', 'species.other', '🐾', 99)
ON CONFLICT (code) DO NOTHING;

-- 4. Colors (Common)
INSERT INTO colors (name, hex_code) VALUES
  ('Black', '#000000'),
  ('White', '#FFFFFF'),
  ('Brown', '#8B4513'),
  ('Golden', '#FFD700'),
  ('Cream', '#FFFDD0'),
  ('Grey', '#808080'),
  ('Red', '#DC143C'),
  ('Blue', '#4682B4'),
  ('Tricolor', NULL),
  ('Brindle', NULL),
  ('Merle', NULL),
  ('Spotted', NULL)
ON CONFLICT (name) DO NOTHING;
