-- Phase 1, Step 2: Custom Types and Enums
-- Description: Defines all enum types used across the platform

-- Content types for CMS
DO $$ BEGIN
    CREATE TYPE content_type AS ENUM (
        'article',
        'recommendation',
        'faq',
        'care_guide',
        'training_tip',
        'health_alert',
        'breed_info',
        'product_review'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Media types for asset management
DO $$ BEGIN
    CREATE TYPE media_type AS ENUM (
        'pet_photo',
        'profile_photo',
        'document',
        'placeholder',
        'generated_image',
        'vaccine_certificate',
        'video'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AI content categorization
DO $$ BEGIN
    CREATE TYPE ai_content_type AS ENUM (
        'pet_insight',
        'breed_recommendation',
        'health_article',
        'care_guide',
        'training_tip',
        'nutrition_advice',
        'exercise_plan',
        'grooming_guide',
        'behavior_analysis'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification channels
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'push',
        'email',
        'sms',
        'in_app'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Audit action types for compliance
DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM (
        'create',
        'update',
        'delete',
        'login',
        'logout',
        'permission_change',
        'export_data',
        'share',
        'payment',
        'subscribe',
        'cancel',
        'generate_ai',
        'upload_media'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Access roles for collaboration
DO $$ BEGIN
    CREATE TYPE access_role AS ENUM (
        'owner',
        'co_owner',
        'editor',
        'viewer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Species codes (can be enum or table, using table for flexibility, but enum useful for code)
-- Keeping species dynamic in table, but 'gender' is standard
DO $$ BEGIN
    CREATE TYPE pet_gender AS ENUM (
        'Male', 
        'Female', 
        'Unknown'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
