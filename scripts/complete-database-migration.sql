-- =====================================================
-- WAGGLY COMPLETE DATABASE MIGRATION SCRIPT
-- =====================================================
-- This script migrates from the incorrect pet_vaccines/pet_medications
-- schema to the proper vaccinations/treatments architecture
-- =====================================================

-- Set safety settings
SET session_replication_role = replica;
BEGIN;

-- =====================================================
-- STEP 1: CREATE MIGRATION TRACKING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS migration_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    records_migrated INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB
);

-- Log migration start
INSERT INTO migration_log (migration_name, status, metadata) 
VALUES ('database_restructure_v1', 'started', '{"version": "1.0", "description": "Migrate to proper medical records schema"}');

-- =====================================================
-- STEP 2: BACKUP EXISTING DATA
-- =====================================================

-- Create backup tables
CREATE TABLE IF NOT EXISTS pet_vaccines_backup AS 
SELECT * FROM pet_vaccines WHERE 1=0;

CREATE TABLE IF NOT EXISTS pet_medications_backup AS 
SELECT * FROM pet_medications WHERE 1=0;

-- Populate backups
INSERT INTO pet_vaccines_backup SELECT * FROM pet_vaccines;
INSERT INTO pet_medications_backup SELECT * FROM pet_medications;

RAISE NOTICE 'Backup tables created and populated';

-- =====================================================
-- STEP 3: ENSURE PROPER SCHEMA EXISTS
-- =====================================================

-- Check if proper tables exist, create if not
DO $$
BEGIN
    -- Create vaccinations table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vaccinations') THEN
        CREATE TABLE vaccinations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
            
            -- Vaccine Definition
            reference_vaccine_id UUID REFERENCES reference_vaccines(id),
            vaccine_name_other VARCHAR(200), -- Fallback if not in reference
            
            -- Administration
            date_administered DATE NOT NULL,
            date_expires DATE,
            date_next_due DATE,
            
            -- Clinical Details
            batch_number VARCHAR(100),
            manufacturer VARCHAR(100),
            site_of_injection VARCHAR(100),
            dose_sequence VARCHAR(50),
            
            -- Verification
            is_verified BOOLEAN DEFAULT FALSE,
            certificate_asset_id UUID REFERENCES media_assets(id),
            
            -- Provider
            administered_by VARCHAR(200),
            clinic_name VARCHAR(200),
            
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX idx_vaccinations_pet_due ON vaccinations(pet_id, date_next_due);
        CREATE INDEX idx_vaccinations_reference ON vaccinations(reference_vaccine_id);
        RAISE NOTICE 'vaccinations table created';
    END IF;
    
    -- Create treatments table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'treatments') THEN
        CREATE TABLE treatments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
            
            -- Medication Info
            name VARCHAR(200) NOT NULL,
            type VARCHAR(50) CHECK (type IN ('medication', 'supplement', 'therapy', 'prevention')),
            reference_medication_id UUID REFERENCES reference_medications(id),
            
            -- Dosage Logic
            dosage_amount NUMERIC(10,3),
            dosage_unit VARCHAR(50),
            frequency_type VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'prn'
            frequency_details JSONB, -- { "times": ["08:00"], "days": ["Mon"] }
            
            -- Duration
            start_date DATE NOT NULL,
            end_date DATE,
            is_ongoing BOOLEAN DEFAULT FALSE,
            
            -- Inventory
            inventory_remaining NUMERIC(10,2),
            inventory_alert_threshold NUMERIC(10,2),
            
            -- Status
            status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused'
            
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX idx_treatments_pet_status ON treatments(pet_id, status);
        CREATE INDEX idx_treatments_reference ON treatments(reference_medication_id);
        RAISE NOTICE 'treatments table created';
    END IF;
END $$;

-- =====================================================
-- STEP 4: MIGRATE VACCINATIONS
-- =====================================================

DO $$
DECLARE
    migration_count INTEGER := 0;
BEGIN
    -- Insert migrated vaccination records
    INSERT INTO vaccinations (
        pet_id,
        reference_vaccine_id,
        vaccine_name_other,
        date_administered,
        date_next_due,
        batch_number,
        manufacturer,
        administered_by,
        clinic_name,
        created_at
    )
    SELECT 
        pv.pet_id,
        rv.id,
        CASE WHEN rv.id IS NULL THEN pv.type END as vaccine_name_other,
        pv.date::date,
        pv.next_due_date::date,
        pv.batch_no,
        pv.manufacturer,
        pv.provider_name,
        pv.provider_name,
        pv.created_at
    FROM pet_vaccines pv
    LEFT JOIN reference_vaccines rv ON rv.name = pv.type
    WHERE pv.pet_id IS NOT NULL
    ON CONFLICT DO NOTHING;
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    
    -- Update migration log
    UPDATE migration_log 
    SET records_migrated = migration_count 
    WHERE migration_name = 'database_restructure_v1' AND status = 'started';
    
    RAISE NOTICE 'Migrated % vaccination records', migration_count;
END $$;

-- =====================================================
-- STEP 5: MIGRATE TREATMENTS
-- =====================================================

DO $$
DECLARE
    migration_count INTEGER := 0;
BEGIN
    -- Insert migrated treatment records
    INSERT INTO treatments (
        pet_id,
        reference_medication_id,
        name,
        type,
        start_date,
        end_date,
        frequency_type,
        status,
        created_at
    )
    SELECT 
        pm.pet_id,
        rm.id,
        pm.name,
        CASE 
            WHEN pm.category ILIKE '%supplement%' THEN 'supplement'
            WHEN pm.category ILIKE '%therapy%' THEN 'therapy'
            WHEN pm.category ILIKE '%prevention%' THEN 'prevention'
            ELSE 'medication'
        END as type,
        pm.start_date::date,
        pm.end_date::date,
        pm.frequency,
        CASE WHEN pm.active THEN 'active' ELSE 'completed' END as status,
        pm.created_at
    FROM pet_medications pm
    LEFT JOIN reference_medications rm ON rm.name = pm.name
    WHERE pm.pet_id IS NOT NULL
    ON CONFLICT DO NOTHING;
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    
    -- Update migration log with additional count
    UPDATE migration_log 
    SET records_migrated = records_migrated + migration_count 
    WHERE migration_name = 'database_restructure_v1' AND status = 'started';
    
    RAISE NOTICE 'Migrated % treatment records', migration_count;
END $$;

-- =====================================================
-- STEP 6: UPDATE RLS POLICIES
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Allow public read access to pet_vaccines" ON pet_vaccines;
DROP POLICY IF EXISTS "Users can manage own pet vaccines" ON pet_vaccines;
DROP POLICY IF EXISTS "Allow public read access to pet_medications" ON pet_medications;
DROP POLICY IF EXISTS "Users can manage own pet medications" ON pet_medications;

-- Create new policies for vaccinations
DO $$ BEGIN
    CREATE POLICY "Users manage pet vaccinations" 
    ON vaccinations FOR ALL 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM pets 
        WHERE id = vaccinations.pet_id AND owner_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM pets 
        WHERE id = vaccinations.pet_id AND owner_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create new policies for treatments
DO $$ BEGIN
    CREATE POLICY "Users manage pet treatments" 
    ON treatments FOR ALL 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM pets 
        WHERE id = treatments.pet_id AND owner_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM pets 
        WHERE id = treatments.pet_id AND owner_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =====================================================
-- STEP 7: CLEANUP OLD TABLES
-- =====================================================

-- Drop old tables (commented out for safety - uncomment after verification)
-- DROP TABLE IF EXISTS pet_vaccines CASCADE;
-- DROP TABLE IF EXISTS pet_medications CASCADE;

-- For now, just disable RLS on old tables
ALTER TABLE pet_vaccines DISABLE ROW LEVEL SECURITY;
ALTER TABLE pet_medications DISABLE ROW LEVEL SECURITY;

RAISE NOTICE 'Old tables disabled (not dropped for safety)';

-- =====================================================
-- STEP 8: FINALIZE MIGRATION
-- =====================================================

-- Complete migration log
UPDATE migration_log 
SET 
    status = 'completed',
    completed_at = NOW(),
    metadata = metadata || '{"tables_migrated": ["vaccinations", "treatments"], "old_tables_disabled": true}'::jsonb
WHERE migration_name = 'database_restructure_v1' AND status = 'started';

COMMIT;
SET session_replication_role = DEFAULT;

RAISE NOTICE '====================================================';
RAISE NOTICE 'DATABASE MIGRATION COMPLETED SUCCESSFULLY';
RAISE NOTICE '====================================================';
RAISE NOTICE 'Migrated to proper vaccinations/treatments schema';
RAISE NOTICE 'Backup tables: pet_vaccines_backup, pet_medications_backup';
RAISE NOTICE 'Old tables disabled but not dropped (verify before dropping)';
RAISE NOTICE 'Check migration_log table for details';
RAISE NOTICE '====================================================';

-- =====================================================
-- STEP 9: VERIFICATION QUERIES
-- =====================================================

-- Run these to verify migration success:
/*
-- Check migration results
SELECT * FROM migration_log WHERE migration_name = 'database_restructure_v1';

-- Verify data counts
SELECT 
    'vaccinations' as table_name, 
    COUNT(*) as count 
FROM vaccinations
UNION ALL
SELECT 
    'treatments' as table_name, 
    COUNT(*) as count 
FROM treatments
UNION ALL
SELECT 
    'pet_vaccines_backup' as table_name, 
    COUNT(*) as count 
FROM pet_vaccines_backup
UNION ALL
SELECT 
    'pet_medications_backup' as table_name, 
    COUNT(*) as count 
FROM pet_medications_backup;

-- Check orphaned records (should be minimal)
SELECT 'Orphaned vaccinations' as issue, COUNT(*) as count
FROM vaccinations v
LEFT JOIN pets p ON v.pet_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 'Orphaned treatments' as issue, COUNT(*) as count
FROM treatments t
LEFT JOIN pets p ON t.pet_id = p.id
WHERE p.id IS NULL;
*/
