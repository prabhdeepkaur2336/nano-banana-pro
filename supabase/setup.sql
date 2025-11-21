-- ============================================
-- DATABASE SETUP FOR IMAGE GENERATION APP
-- ============================================
-- Please run this SQL in your Supabase SQL Editor
-- ============================================

-- Create the image_generation_requests table
CREATE TABLE IF NOT EXISTS image_generation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt text NOT NULL,
  images text[] DEFAULT '{}',
  aspect_ratio text NOT NULL,
  resolution text NOT NULL,
  output_format text NOT NULL,
  status text DEFAULT 'running' NOT NULL CHECK (status IN ('running', 'done', 'failed')),
  generated_image_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE image_generation_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Anyone can read image generation requests"
  ON image_generation_requests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert image generation requests"
  ON image_generation_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update image generation requests"
  ON image_generation_requests
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_image_generation_requests_created_at
  ON image_generation_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_image_generation_requests_status
  ON image_generation_requests(status);

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================
-- Please create a storage bucket in the Supabase dashboard:
-- 1. Go to Storage in the Supabase dashboard
-- 2. Create a new bucket named: nano_nanana_pro
-- 3. Make it public
-- 4. Allow the following file types: image/jpeg, image/png, image/webp
-- 5. Set max file size to 10MB
-- ============================================

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE image_generation_requests;
