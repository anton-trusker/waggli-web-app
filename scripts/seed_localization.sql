-- Seed Localization Data (if tables are empty)

-- Insert supported languages if none exist
INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'en', 'English', '🇺🇸', true, true
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'en');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'es', 'Spanish', '🇪🇸', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'es');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'fr', 'French', '🇫🇷', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'fr');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'de', 'German', '🇩🇪', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'de');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'it', 'Italian', '🇮🇹', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'it');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'pt', 'Portuguese', '🇵🇹', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'pt');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'ja', 'Japanese', '🇯🇵', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'ja');

INSERT INTO supported_languages (code, name, flag, is_active, is_default)
SELECT 'zh', 'Chinese', '🇨🇳', false, false
WHERE NOT EXISTS (SELECT 1 FROM supported_languages WHERE code = 'zh');

-- Insert default translations if none exist
INSERT INTO translations (key, translations)
SELECT 'Welcome', '{"en": "Welcome", "es": "Bienvenido", "fr": "Bienvenue", "de": "Willkommen", "it": "Benvenuto", "pt": "Bem-vindo", "ja": "ようこそ", "zh": "欢迎"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Welcome');

INSERT INTO translations (key, translations)
SELECT 'Dashboard', '{"en": "Dashboard", "es": "Panel", "fr": "Tableau de bord", "de": "Armaturenbrett", "it": "Cruscotto", "pt": "Painel", "ja": "ダッシュボード", "zh": "仪表板"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Dashboard');

INSERT INTO translations (key, translations)
SELECT 'Profile', '{"en": "Profile", "es": "Perfil", "fr": "Profil", "de": "Profil", "it": "Profilo", "pt": "Perfil", "ja": "プロフィール", "zh": "个人资料"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Profile');

INSERT INTO translations (key, translations)
SELECT 'Settings', '{"en": "Settings", "es": "Configuración", "fr": "Paramètres", "de": "Einstellungen", "it": "Impostazioni", "pt": "Configurações", "ja": "設定", "zh": "设置"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Settings');

INSERT INTO translations (key, translations)
SELECT 'Pets', '{"en": "Pets", "es": "Mascotas", "fr": "Animaux", "de": "Haustiere", "it": "Animali domestici", "pt": "Animais de estimação", "ja": "ペット", "zh": "宠物"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Pets');

INSERT INTO translations (key, translations)
SELECT 'Add Pet', '{"en": "Add Pet", "es": "Agregar mascota", "fr": "Ajouter un animal", "de": "Haustier hinzufügen", "it": "Aggiungi animale", "pt": "Adicionar animal", "ja": "ペットを追加", "zh": "添加宠物"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Add Pet');

INSERT INTO translations (key, translations)
SELECT 'Save', '{"en": "Save", "es": "Guardar", "fr": "Enregistrer", "de": "Speichern", "it": "Salva", "pt": "Salvar", "ja": "保存", "zh": "保存"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Save');

INSERT INTO translations (key, translations)
SELECT 'Cancel', '{"en": "Cancel", "es": "Cancelar", "fr": "Annuler", "de": "Abbrechen", "it": "Annulla", "pt": "Cancelar", "ja": "キャンセル", "zh": "取消"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'Cancel');
