# Supabase SQL Scripts to Run

## Step 1: Run the Main Setup Script

1. Go to your Supabase dashboard → SQL Editor
2. Open `supabase-setup.sql` from this project
3. Copy and paste the entire contents
4. Click "Run"

This creates:
- `parking_reports` table
- `court_reports` table  
- Helper functions for time-weighted status calculation
- Row Level Security policies

## Step 2: Run the Community Page Setup Script

1. In SQL Editor, click "New query"
2. Open `supabase-community.sql` from this project
3. Copy and paste the entire contents
4. Click "Run"

This creates:
- `moves` table (for Community page events)
- `alerts` table (for court/area alerts)
- `parking_data` table (for parking lot occupancy)
- Helper functions for moves (add interest, add comment, cleanup)
- Row Level Security policies

## Step 3: Verify Tables Were Created

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('parking_reports', 'court_reports', 'moves', 'alerts', 'parking_data')
ORDER BY table_name;
```

You should see all 5 tables listed.

## Step 4: Test the Functions

Test the court status function:
```sql
SELECT get_court_status('basketball');
```

Test getting recent moves:
```sql
SELECT * FROM get_recent_moves();
```

## What Each Table Does

### `parking_reports`
- Stores user reports about parking lot fullness
- Used by the time-weighted algorithm
- Auto-expires after 45 minutes (handled by app)

### `court_reports`
- Stores user reports about court activity (pickleball, basketball, volleyball)
- Used by the time-weighted algorithm
- Auto-expires after 45 minutes (handled by app)

### `moves`
- Stores Community page events/moves
- Includes title, description, interested users, comments
- Auto-deletes after 1 day (via cleanup function)

### `alerts`
- Stores alerts/reports for courts and areas
- Includes alert type, area type, court ID
- Used for displaying active alerts in the app

### `parking_data`
- Stores current parking lot occupancy
- Synced from app location tracking
- One row per parking lot

## Functions Available

- `get_parking_status()` - Calculates weighted parking status
- `get_court_status(court_type)` - Calculates weighted court status
- `get_recent_moves()` - Gets moves from last 24 hours
- `add_move_interest(move_id, user_id, is_interested)` - Adds/updates interest
- `add_move_comment(move_id, comment_text, author_name)` - Adds comment to move
- `cleanup_old_moves()` - Removes moves older than 1 day

## Notes

- All tables have public read/write access for the hackathon
- In production, you'd add proper authentication
- The app works offline using local storage and syncs when Supabase is available
- Old moves are automatically cleaned up (you can set up a cron job if needed)

