-- Phase 1, Step 1: Enable Required Extensions (Corrected)
-- Description: Enables all extensions required for the new architecture

-- Create schemas
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS topology;

-- Enable Extensions
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA extensions;

-- Advanced indexing
CREATE EXTENSION IF NOT EXISTS "btree_gist" SCHEMA extensions;

-- Query performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" SCHEMA extensions;

-- Scheduled jobs for automation
CREATE EXTENSION IF NOT EXISTS "pg_cron" SCHEMA extensions;

-- Vector embeddings for AI features (requires pgvector installation on db)
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;

-- Geospatial features (requires PostGIS installation on db)
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- PostGIS Topology MUST be in 'topology' schema
CREATE EXTENSION IF NOT EXISTS postgis_topology SCHEMA topology;

-- Full-text search helper
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- Grant permissions (ensure accessing roles can use them)
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA topology TO postgres, anon, authenticated, service_role;
