/*
  # Fix RLS permissions for image_generation_requests

  1. Security Changes
    - Explicitly disable RLS on the table
    - Add permissive policies for all operations (INSERT, SELECT, UPDATE, DELETE)
    - Allow anonymous access to all operations

  Note: This ensures the table is fully accessible without authentication
*/

-- Force disable RLS
ALTER TABLE image_generation_requests DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies (just in case)
DROP POLICY IF EXISTS "Allow all inserts" ON image_generation_requests;
DROP POLICY IF EXISTS "Allow all selects" ON image_generation_requests;
DROP POLICY IF EXISTS "Allow all updates" ON image_generation_requests;
DROP POLICY IF EXISTS "Allow all deletes" ON image_generation_requests;

-- Re-enable RLS but add permissive policies
ALTER TABLE image_generation_requests ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all operations
CREATE POLICY "Allow all inserts"
  ON image_generation_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all selects"
  ON image_generation_requests
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow all updates"
  ON image_generation_requests
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes"
  ON image_generation_requests
  FOR DELETE
  TO anon, authenticated
  USING (true);