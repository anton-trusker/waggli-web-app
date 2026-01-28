-- Phase 9: Performance Optimization
SET search_path TO public, extensions;

-- 1. Materialized View: Pet Health Dashboard Stats
-- Aggregates key metrics for the main card to avoid 6+ separate queries per pet load
DROP MATERIALIZED VIEW IF EXISTS mv_pet_health_stats;

CREATE MATERIALIZED VIEW mv_pet_health_stats AS
SELECT
  p.id AS pet_id,
  p.owner_id,
  
  -- Vaccination Status
  (SELECT COUNT(*) FROM vaccinations v 
   WHERE v.pet_id = p.id AND v.date_next_due < CURRENT_DATE) AS vaccines_overdue_count,
   
  (SELECT MIN(v.date_next_due) FROM vaccinations v 
   WHERE v.pet_id = p.id AND v.date_next_due >= CURRENT_DATE) AS next_vaccine_date,
   
  -- Visits
  (SELECT v.visit_date FROM medical_visits v 
   WHERE v.pet_id = p.id AND v.visit_date <= NOW() 
   ORDER BY v.visit_date DESC LIMIT 1) AS last_visit_date,
   
  (SELECT v.visit_date FROM medical_visits v 
   WHERE v.pet_id = p.id AND v.visit_date > NOW() 
   ORDER BY v.visit_date ASC LIMIT 1) AS next_visit_date,
   
  -- Metrics
  (SELECT m.weight_kg FROM health_metrics m 
   WHERE m.pet_id = p.id 
   ORDER BY m.recorded_at DESC LIMIT 1) AS current_weight_kg,
   
  (SELECT m.body_condition_score FROM health_metrics m 
   WHERE m.pet_id = p.id 
   ORDER BY m.recorded_at DESC LIMIT 1) AS current_bcs,
   
  -- Medications
  (SELECT COUNT(*) FROM treatments t 
   WHERE t.pet_id = p.id AND t.status = 'active') AS active_medications_count

FROM pets p;

CREATE UNIQUE INDEX idx_mv_pet_health_stats_id ON mv_pet_health_stats(pet_id);
CREATE INDEX idx_mv_pet_health_stats_owner ON mv_pet_health_stats(owner_id);

-- 2. Trigger to Refresh View
-- Note: Refreshing on every write can be heavy. 
-- For MVP, we refresh concurrently. For scale, use a queue or scheduled cron.
CREATE OR REPLACE FUNCTION refresh_pet_health_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pet_health_stats;
  RETURN NULL;
END;
$$;

-- Attach triggers to relevant tables
CREATE TRIGGER trg_refresh_stats_vaccines 
AFTER INSERT OR UPDATE OR DELETE ON vaccinations
FOR EACH STATEMENT EXECUTE FUNCTION refresh_pet_health_stats();

CREATE TRIGGER trg_refresh_stats_visits 
AFTER INSERT OR UPDATE OR DELETE ON medical_visits
FOR EACH STATEMENT EXECUTE FUNCTION refresh_pet_health_stats();

CREATE TRIGGER trg_refresh_stats_metrics 
AFTER INSERT OR UPDATE OR DELETE ON health_metrics
FOR EACH STATEMENT EXECUTE FUNCTION refresh_pet_health_stats();

CREATE TRIGGER trg_refresh_stats_treatments 
AFTER INSERT OR UPDATE OR DELETE ON treatments
FOR EACH STATEMENT EXECUTE FUNCTION refresh_pet_health_stats();

-- 3. Additional Composite Indexes for common queries
-- For Timeline: filtering events by pet and type
CREATE INDEX IF NOT EXISTS idx_visits_pet_type_date ON medical_visits(pet_id, visit_type, visit_date DESC);

-- For Search: Finding pets by name (case insensitive)
CREATE INDEX IF NOT EXISTS idx_pets_name_trgm ON pets USING GIN(name gin_trgm_ops);

-- For Breeds: autocomplete
CREATE INDEX IF NOT EXISTS idx_breeds_name_trgm ON breeds USING GIN(name gin_trgm_ops);

-- RLS for View (Views don't have RLS, access controlled via underlying tables or function wrapper)
-- Standard practice: Wrap selection in a function or use security_barrier view on top.
-- Or just allow authenticated read if they have access to the pet.
-- Since the MView contains aggregated data, we can just let owners select their rows.
-- BUT Postgres MViews don't support RLS directly.
-- Solution: Create a standard View on top of the MView that enforces RLS.

CREATE OR REPLACE VIEW v_pet_health_dashboard AS
SELECT * FROM mv_pet_health_stats
WHERE owner_id = auth.uid() 
   OR EXISTS (SELECT 1 FROM co_owners co WHERE co.pet_id = mv_pet_health_stats.pet_id AND co.user_id = auth.uid());

-- Grant access
GRANT SELECT ON v_pet_health_dashboard TO authenticated;
