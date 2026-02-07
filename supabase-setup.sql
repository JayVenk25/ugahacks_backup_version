-- Park Activity Crowdsourcing System - Database Schema
-- Based on Waze-style report aggregation

-- ============================================================================
-- TABLE 1: parking_reports
-- Stores user reports about parking lot fullness (one lot, ~70 spots)
-- ============================================================================

CREATE TABLE IF NOT EXISTS parking_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('light', 'medium', 'busy')),
  user_id TEXT,
  CONSTRAINT valid_status CHECK (status IN ('light', 'medium', 'busy'))
);

-- Index for fast queries on recent reports (partial index with NOW() not allowed - use full index)
CREATE INDEX idx_parking_reports_created_at ON parking_reports(created_at DESC);

-- ============================================================================
-- TABLE 2: court_reports
-- Stores user reports about court activity (pickleball, basketball, volleyball)
-- ============================================================================

CREATE TABLE IF NOT EXISTS court_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  court_type TEXT NOT NULL CHECK (court_type IN ('pickleball', 'basketball', 'volleyball', 'futsal')),
  status TEXT NOT NULL CHECK (status IN ('light', 'medium', 'busy')),
  user_id TEXT,
  CONSTRAINT valid_court_type CHECK (court_type IN ('pickleball', 'basketball', 'volleyball', 'futsal')),
  CONSTRAINT valid_court_status CHECK (status IN ('light', 'medium', 'busy'))
);

-- Indexes for fast queries (partial indexes with NOW() not allowed - use full indexes)
CREATE INDEX idx_court_reports_created_at ON court_reports(created_at DESC);
CREATE INDEX idx_court_reports_court_type ON court_reports(court_type);
CREATE INDEX idx_court_reports_type_created ON court_reports(court_type, created_at DESC);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- For hackathon: Allow public read/write (restrict in production!)
-- ============================================================================

ALTER TABLE parking_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reports
CREATE POLICY "Allow public read access to parking_reports"
  ON parking_reports FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to court_reports"
  ON court_reports FOR SELECT
  TO public
  USING (true);

-- Allow anyone to submit reports (for hackathon)
CREATE POLICY "Allow public insert to parking_reports"
  ON parking_reports FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to court_reports"
  ON court_reports FOR INSERT
  TO public
  WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTION: Calculate weighted parking status
-- Returns: 'light', 'medium', or 'busy'
-- ============================================================================

CREATE OR REPLACE FUNCTION get_parking_status()
RETURNS TEXT AS $$
DECLARE
  weighted_sum NUMERIC := 0;
  weight_total NUMERIC := 0;
  report RECORD;
  minutes_old NUMERIC;
  weight NUMERIC;
  score NUMERIC;
  weighted_avg NUMERIC;
BEGIN
  -- Get all parking reports from last 45 minutes
  FOR report IN 
    SELECT status, created_at 
    FROM parking_reports 
    WHERE created_at > NOW() - INTERVAL '45 minutes'
    ORDER BY created_at DESC
  LOOP
    -- Convert status to numeric score
    score := CASE report.status
      WHEN 'light' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'busy' THEN 3
      ELSE 1
    END;
    
    -- Calculate recency weight
    minutes_old := EXTRACT(EPOCH FROM (NOW() - report.created_at)) / 60;
    weight := 1 - (minutes_old / 45.0);
    
    -- Add to weighted sum
    weighted_sum := weighted_sum + (score * weight);
    weight_total := weight_total + weight;
  END LOOP;
  
  -- If no reports, return 'light'
  IF weight_total = 0 THEN
    RETURN 'light';
  END IF;
  
  -- Calculate weighted average
  weighted_avg := weighted_sum / weight_total;
  
  -- Convert to status label
  IF weighted_avg < 1.6 THEN
    RETURN 'light';
  ELSIF weighted_avg < 2.3 THEN
    RETURN 'medium';
  ELSE
    RETURN 'busy';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Calculate weighted court status
-- Returns: 'light', 'medium', or 'busy'
-- ============================================================================

CREATE OR REPLACE FUNCTION get_court_status(court_type_param TEXT)
RETURNS TEXT AS $$
DECLARE
  weighted_sum NUMERIC := 0;
  weight_total NUMERIC := 0;
  report RECORD;
  minutes_old NUMERIC;
  weight NUMERIC;
  score NUMERIC;
  weighted_avg NUMERIC;
BEGIN
  -- Get all reports for this court type from last 45 minutes
  FOR report IN 
    SELECT status, created_at 
    FROM court_reports 
    WHERE court_type = court_type_param 
      AND created_at > NOW() - INTERVAL '45 minutes'
    ORDER BY created_at DESC
  LOOP
    -- Convert status to numeric score
    score := CASE report.status
      WHEN 'light' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'busy' THEN 3
      ELSE 1
    END;
    
    -- Calculate recency weight
    minutes_old := EXTRACT(EPOCH FROM (NOW() - report.created_at)) / 60;
    weight := 1 - (minutes_old / 45.0);
    
    -- Add to weighted sum
    weighted_sum := weighted_sum + (score * weight);
    weight_total := weight_total + weight;
  END LOOP;
  
  -- If no reports, return 'light'
  IF weight_total = 0 THEN
    RETURN 'light';
  END IF;
  
  -- Calculate weighted average
  weighted_avg := weighted_sum / weight_total;
  
  -- Convert to status label
  IF weighted_avg < 1.6 THEN
    RETURN 'light';
  ELSIF weighted_avg < 2.3 THEN
    RETURN 'medium';
  ELSE
    RETURN 'busy';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW: Current park status (computed dynamically)
-- ============================================================================

CREATE OR REPLACE VIEW current_park_status AS
SELECT 
  get_parking_status() as parking_status,
  get_court_status('pickleball') as pickleball_status,
  get_court_status('basketball') as basketball_status,
  get_court_status('volleyball') as volleyball_status,
  get_court_status('futsal') as futsal_status;

-- Grant access
GRANT SELECT ON current_park_status TO public;

-- ============================================================================
-- SEED DATA (optional - for testing)
-- ============================================================================

-- Insert some sample parking reports
INSERT INTO parking_reports (status, created_at) VALUES
  ('light', NOW() - INTERVAL '5 minutes'),
  ('medium', NOW() - INTERVAL '3 minutes'),
  ('light', NOW() - INTERVAL '1 minute');

-- Insert some sample court reports
INSERT INTO court_reports (court_type, status, created_at) VALUES
  ('basketball', 'medium', NOW() - INTERVAL '10 minutes'),
  ('basketball', 'busy', NOW() - INTERVAL '2 minutes'),
  ('pickleball', 'busy', NOW() - INTERVAL '15 minutes'),
  ('pickleball', 'busy', NOW() - INTERVAL '5 minutes'),
  ('volleyball', 'light', NOW() - INTERVAL '20 minutes'),
  ('futsal', 'light', NOW() - INTERVAL '8 minutes');

-- ============================================================================
-- UTILITY QUERIES (for debugging)
-- ============================================================================

-- See current status
-- SELECT * FROM current_park_status;

-- See recent parking reports
-- SELECT status, created_at, 
--        EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 as minutes_old
-- FROM parking_reports 
-- WHERE created_at > NOW() - INTERVAL '45 minutes'
-- ORDER BY created_at DESC;

-- See recent court reports
-- SELECT court_type, status, created_at,
--        EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 as minutes_old
-- FROM court_reports 
-- WHERE created_at > NOW() - INTERVAL '45 minutes'
-- ORDER BY created_at DESC;

-- Manual status calculation test
-- SELECT get_parking_status() as parking,
--        get_court_status('basketball') as basketball,
--        get_court_status('pickleball') as pickleball,
--        get_court_status('volleyball') as volleyball,
--        get_court_status('futsal') as futsal;
