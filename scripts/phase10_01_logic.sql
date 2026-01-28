-- Phase 10: Business Logic & Automation
SET search_path TO public, extensions;

-- 1. Calculate Health Score (PL/pgSQL)
-- Returns integer 0-100
CREATE OR REPLACE FUNCTION calculate_pet_health_score(target_pet_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 100;
  
  -- Factors
  has_overdue_vaccines BOOLEAN;
  months_since_visit INTEGER;
  bcs_score INTEGER;
  age_years INTEGER;
BEGIN
  -- 1. Vaccine Check (Penalty: -20 if any overdue core vaccine)
  SELECT EXISTS (
    SELECT 1 FROM vaccinations v 
    JOIN reference_vaccines rv ON v.reference_vaccine_id = rv.id
    WHERE v.pet_id = target_pet_id 
    AND rv.vaccine_type = 'Core'
    AND v.date_next_due < CURRENT_DATE
  ) INTO has_overdue_vaccines;
  
  IF has_overdue_vaccines THEN
    score := score - 20;
  END IF;

  -- 2. Medical Visit Check (Penalty: -10 if no visit in 12 months)
  SELECT 
    COALESCE(extract(year from age(NOW(), MAX(visit_date))) * 12 + extract(month from age(NOW(), MAX(visit_date))), 999)
  INTO months_since_visit
  FROM medical_visits 
  WHERE pet_id = target_pet_id;
  
  IF months_since_visit > 12 THEN
    score := score - 10;
  END IF;

  -- 3. Body Condition Score (Penalty: -15 if not ideal)
  -- Ideal is usually 4/9 or 5/9. 
  -- 1-3 (Thin) -> -15
  -- 4-5 (Ideal) -> 0
  -- 6-9 (Overweight) -> -15
  SELECT body_condition_score INTO bcs_score
  FROM health_metrics
  WHERE pet_id = target_pet_id
  ORDER BY recorded_at DESC LIMIT 1;
  
  IF bcs_score IS NOT NULL THEN
    IF bcs_score < 4 OR bcs_score > 5 THEN
      score := score - 15;
    END IF;
  ELSE
    -- No BCS recorded is a slight penalty (unknown health)
    score := score - 5;
  END IF;

  -- 4. Age Factor (Minor adjustments)
  -- Older pets might have naturally lower baseline, but we keep score absolute for health status
  
  -- Clamp range
  IF score < 0 THEN score := 0; END IF;
  IF score > 100 THEN score := 100; END IF;
  
  RETURN score;
END;
$$;

-- 2. Trigger to Auto-Update Score
-- We add a column to 'pets' table to cache this score? Or just 'mv_pet_health_stats'?
-- Phase 9 created 'mv_pet_health_stats' but didn't include score column explicitly.
-- Let's update the MView or add a computed column to pets.
-- Adding to 'pets' table is easiest for realtime access without MView refresh lag.

ALTER TABLE pets ADD COLUMN IF NOT EXISTS computed_health_score INTEGER DEFAULT 80;

CREATE OR REPLACE FUNCTION trigger_update_health_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  p_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'vaccinations' THEN p_id := NEW.pet_id;
  ELSIF TG_TABLE_NAME = 'medical_visits' THEN p_id := NEW.pet_id;
  ELSIF TG_TABLE_NAME = 'health_metrics' THEN p_id := NEW.pet_id;
  END IF;

  IF p_id IS NOT NULL THEN
    UPDATE pets 
    SET computed_health_score = calculate_pet_health_score(p_id)
    WHERE id = p_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach Triggers
DROP TRIGGER IF EXISTS trg_score_vaccines ON vaccinations;
CREATE TRIGGER trg_score_vaccines AFTER INSERT OR UPDATE OR DELETE ON vaccinations
FOR EACH ROW EXECUTE FUNCTION trigger_update_health_score();

DROP TRIGGER IF EXISTS trg_score_visits ON medical_visits;
CREATE TRIGGER trg_score_visits AFTER INSERT OR UPDATE OR DELETE ON medical_visits
FOR EACH ROW EXECUTE FUNCTION trigger_update_health_score();

DROP TRIGGER IF EXISTS trg_score_metrics ON health_metrics;
CREATE TRIGGER trg_score_metrics AFTER INSERT OR UPDATE OR DELETE ON health_metrics
FOR EACH ROW EXECUTE FUNCTION trigger_update_health_score();
