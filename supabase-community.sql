-- ============================================================================
-- COMMUNITY PAGE - Moves Table
-- Stores user-created events/moves for the Community page
-- ============================================================================

CREATE TABLE IF NOT EXISTS moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interested JSONB DEFAULT '[]'::jsonb,
  not_interested JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  user_id TEXT
);

-- Index for fast queries on recent moves
CREATE INDEX IF NOT EXISTS idx_moves_created_at ON moves(created_at DESC);

-- ============================================================================
-- ALERTS TABLE
-- Stores alerts/reports for courts and areas
-- ============================================================================

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('alert', 'condition')),
  alert_type TEXT,
  alert_name TEXT NOT NULL,
  area_type TEXT,
  court_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT
);

-- Indexes for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_area_type ON alerts(area_type);
CREATE INDEX IF NOT EXISTS idx_alerts_court_id ON alerts(court_id);

-- ============================================================================
-- PARKING DATA TABLE
-- Stores parking lot occupancy data
-- ============================================================================

CREATE TABLE IF NOT EXISTS parking_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id TEXT NOT NULL,
  occupied INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lot_id)
);

-- Index for parking data
CREATE INDEX IF NOT EXISTS idx_parking_data_lot_id ON parking_data(lot_id);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_data ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies - Allow public read/write for hackathon
-- ============================================================================

-- Moves policies
CREATE POLICY "Allow public read access to moves"
  ON moves FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to moves"
  ON moves FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to moves"
  ON moves FOR UPDATE
  TO public
  USING (true);

-- Alerts policies
CREATE POLICY "Allow public read access to alerts"
  ON alerts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to alerts"
  ON alerts FOR INSERT
  TO public
  WITH CHECK (true);

-- Parking data policies
CREATE POLICY "Allow public read access to parking_data"
  ON parking_data FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to parking_data"
  ON parking_data FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to parking_data"
  ON parking_data FOR UPDATE
  TO public
  USING (true);

-- ============================================================================
-- FUNCTION: Clean up old moves (older than 1 day)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_moves()
RETURNS void AS $$
BEGIN
  DELETE FROM moves
  WHERE created_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get moves from last 24 hours
-- ============================================================================

CREATE OR REPLACE FUNCTION get_recent_moves()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  interested JSONB,
  not_interested JSONB,
  comments JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.description,
    m.created_at,
    m.interested,
    m.not_interested,
    m.comments
  FROM moves m
  WHERE m.created_at > NOW() - INTERVAL '1 day'
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Add interest to a move
-- ============================================================================

CREATE OR REPLACE FUNCTION add_move_interest(
  move_id_param UUID,
  user_id_param TEXT,
  is_interested BOOLEAN
)
RETURNS void AS $$
DECLARE
  current_interested JSONB;
  current_not_interested JSONB;
BEGIN
  SELECT interested, not_interested INTO current_interested, current_not_interested
  FROM moves WHERE id = move_id_param;
  
  -- Remove user from both arrays first
  current_interested := current_interested - user_id_param;
  current_not_interested := current_not_interested - user_id_param;
  
  -- Add to appropriate array
  IF is_interested THEN
    current_interested := current_interested || jsonb_build_array(user_id_param);
  ELSE
    current_not_interested := current_not_interested || jsonb_build_array(user_id_param);
  END IF;
  
  UPDATE moves
  SET 
    interested = current_interested,
    not_interested = current_not_interested
  WHERE id = move_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Add comment to a move
-- ============================================================================

CREATE OR REPLACE FUNCTION add_move_comment(
  move_id_param UUID,
  comment_text TEXT,
  author_name TEXT DEFAULT 'Anonymous'
)
RETURNS void AS $$
DECLARE
  current_comments JSONB;
  new_comment JSONB;
BEGIN
  SELECT comments INTO current_comments
  FROM moves WHERE id = move_id_param;
  
  new_comment := jsonb_build_object(
    'text', comment_text,
    'author', author_name,
    'timestamp', extract(epoch from now()) * 1000
  );
  
  current_comments := COALESCE(current_comments, '[]'::jsonb) || jsonb_build_array(new_comment);
  
  UPDATE moves
  SET comments = current_comments
  WHERE id = move_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant access to functions
-- ============================================================================

GRANT EXECUTE ON FUNCTION cleanup_old_moves() TO public;
GRANT EXECUTE ON FUNCTION get_recent_moves() TO public;
GRANT EXECUTE ON FUNCTION add_move_interest(UUID, TEXT, BOOLEAN) TO public;
GRANT EXECUTE ON FUNCTION add_move_comment(UUID, TEXT, TEXT) TO public;

-- ============================================================================
-- Optional: Set up automatic cleanup (requires pg_cron extension)
-- Uncomment if you have pg_cron enabled in your Supabase project
-- ============================================================================

-- SELECT cron.schedule(
--   'cleanup-old-moves',
--   '0 0 * * *', -- Run daily at midnight
--   $$SELECT cleanup_old_moves()$$
-- );

