# Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Cauley Creek Tracker (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
5. Click "Create new project"
6. Wait for the project to be set up (takes 1-2 minutes)

## Step 2: Run the SQL Setup Script

1. In your Supabase dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Open the file `supabase-setup.sql` from this project
4. Copy the entire contents
5. Paste it into the SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

This will create:
- `parking_reports` table
- `court_reports` table
- Helper functions for calculating weighted status
- Row Level Security policies (public read/write for hackathon)

## Step 3: Get Your Supabase Credentials

1. In Supabase dashboard, click on "Settings" (gear icon) in the left sidebar
2. Click on "API" under Project Settings
3. You'll see:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)

## Step 4: Configure the App

1. Open `app.json` in your project
2. Find the `extra` section:
   ```json
   "extra": {
     "supabaseUrl": "YOUR_SUPABASE_URL",
     "supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"
   }
   ```
3. Replace `YOUR_SUPABASE_URL` with your Project URL from Step 3
4. Replace `YOUR_SUPABASE_ANON_KEY` with your anon public key from Step 3

Example:
```json
"extra": {
  "supabaseUrl": "https://abcdefghijklmnop.supabase.co",
  "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Step 5: Install Dependencies

Run in your terminal:
```bash
npm install
```

This will install `@supabase/supabase-js` which is already added to `package.json`.

## Step 6: Restart the App

1. Stop your Expo server (Ctrl+C)
2. Clear the cache: `npx expo start -c`
3. Scan the QR code again

## How It Works

- **Activity Reports**: When users report activity levels (Low/Medium/High), the app saves to both:
  - Local storage (AsyncStorage) - for offline functionality
  - Supabase `court_reports` table - for cloud sync
  
- **Status Calculation**: The app tries to use Supabase's `get_court_status()` function first, which uses the time-weighted algorithm. If Supabase is unavailable, it falls back to local calculation.

- **Offline Support**: The app continues to work offline using local storage, and syncs with Supabase when available.

## Testing

After setup, you can test by:
1. Reporting an activity level in the app
2. Going to Supabase dashboard → Table Editor → `court_reports`
3. You should see your report appear there

## Troubleshooting

- **"Supabase URL or Anon Key not found"**: Make sure you've updated `app.json` with your credentials
- **Connection errors**: Check that your Supabase project is active and the URL/key are correct
- **SQL errors**: Make sure you ran the entire `supabase-setup.sql` script successfully

## Security Note

For the hackathon, the database is set to public read/write. In production, you would:
- Add proper authentication
- Restrict write access to authenticated users
- Add rate limiting
- Use service role key for server-side operations only

