-- Enable UUID
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. SUBSCRIPTION FIX (Robust)
-- ==========================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='subscription_plans' and column_name='price_annual') then
    alter table public.subscription_plans add column price_annual numeric default 0;
  end if;
end $$;

-- ==========================================
-- 2. PLATFORM SETTINGS
-- ==========================================
create table if not exists public.platform_settings (
    id text primary key default 'global',
    platform_name text default 'Pawzly',
    primary_color text default '#4f46e5',
    logo_url text,
    favicon_url text,
    icon_url text,
    ai_icon_url text,
    contact_info jsonb default '{}'::jsonb,
    social_links jsonb default '[]'::jsonb,
    seo_defaults jsonb default '{}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.platform_settings enable row level security;

-- Policy Cleanup (DO Block for safety)
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Settings readable by all' and tablename = 'platform_settings') then
        create policy "Settings readable by all" on public.platform_settings for select using (true);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Admins can update settings' and tablename = 'platform_settings') then
        create policy "Admins can update settings" on public.platform_settings for update using (
            exists (select 1 from public.users where id = auth.uid() and roles && ARRAY['admin', 'super_admin']::text[])
        );
    end if;
end $$;

insert into public.platform_settings (id, platform_name) values ('global', 'Pawzly') on conflict (id) do nothing;


-- ==========================================
-- 3. LOCALIZATION
-- ==========================================
create table if not exists public.languages (
    code text primary key,
    name text not null,
    native_name text,
    flag_emoji text,
    is_active boolean default false,
    is_default boolean default false,
    date_format text default 'MM/DD/YYYY',
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.translations (
    key text primary key,
    translations jsonb default '{}'::jsonb,
    category text default 'common',
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.languages enable row level security;
alter table public.translations enable row level security;

do $$
begin
    -- LANGUAGES
    if not exists (select 1 from pg_policies where policyname = 'Public read languages' and tablename = 'languages') then
        create policy "Public read languages" on public.languages for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Admin manage languages' and tablename = 'languages') then
        create policy "Admin manage languages" on public.languages for all using (
            exists (select 1 from public.users where id = auth.uid() and roles && ARRAY['admin', 'super_admin']::text[])
        );
    end if;

    -- TRANSLATIONS
    if not exists (select 1 from pg_policies where policyname = 'Public read translations' and tablename = 'translations') then
         create policy "Public read translations" on public.translations for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Admin manage translations' and tablename = 'translations') then
        create policy "Admin manage translations" on public.translations for all using (
            exists (select 1 from public.users where id = auth.uid() and roles && ARRAY['admin', 'super_admin']::text[])
        );
    end if;
end $$;

insert into public.languages (code, name, native_name, flag_emoji, is_active, is_default) values
('en', 'English', 'English', '🇺🇸', true, true),
('es', 'Spanish', 'Español', '🇪🇸', true, false)
on conflict (code) do nothing;


-- ==========================================
-- 4. FEATURE FLAGS
-- ==========================================
create table if not exists public.feature_flags (
    module_key text primary key,
    module_name text not null,
    description text,
    category text default 'core',
    is_enabled boolean default true,
    show_coming_soon boolean default false,
    requires_subscription text[],
    requires_roles text[],
    dependencies text[],
    icon text,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.feature_flags enable row level security;

do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Public read features' and tablename = 'feature_flags') then
        create policy "Public read features" on public.feature_flags for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Admin manage features' and tablename = 'feature_flags') then
        create policy "Admin manage features" on public.feature_flags for all using (
            exists (select 1 from public.users where id = auth.uid() and roles && ARRAY['admin', 'super_admin']::text[])
        );
    end if;
end $$;

insert into public.feature_flags (module_key, module_name, category, is_enabled, icon) values
('ai_assistant', 'AI Health Assistant', 'core', true, 'smart_toy'),
('ocr', 'Smart Document Scan', 'premium', true, 'document_scanner')
on conflict (module_key) do nothing;
