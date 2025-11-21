/*
  # Create image generation requests table

  1. New Types
    - `image_generation_status` enum with values: 'running', 'done', 'failed'

  2. New Tables
    - `image_generation_requests`
      - `id` (uuid, primary key, auto-generated)
      - `prompt` (text, required) - The text prompt for image generation
      - `images` (text[], optional) - Array of input image URLs
      - `aspect_ratio` (text, required) - Aspect ratio for generation
      - `resolution` (text, required) - Resolution for generation
      - `output_format` (text, required) - Output format (png/jpg)
      - `status` (enum, default 'running') - Current status of the request
      - `generated_image_url` (text, optional) - URL of the generated image
      - `created_at` (timestamp, auto-set) - Creation timestamp

  3. Security
    - RLS is DISABLED to allow public access
    - No authentication required for this table
*/

-- Create enum type for status
DO $$ BEGIN
  CREATE TYPE image_generation_status AS ENUM ('running', 'done', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create the table
CREATE TABLE IF NOT EXISTS image_generation_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  prompt text NOT NULL,
  images text[] NULL,
  aspect_ratio text NOT NULL,
  resolution text NOT NULL,
  output_format text NOT NULL,
  status image_generation_status NULL DEFAULT 'running'::image_generation_status,
  generated_image_url text NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT image_generation_requests_pkey PRIMARY KEY (id)
);

-- Disable RLS for public access (no authentication required)
ALTER TABLE image_generation_requests DISABLE ROW LEVEL SECURITY;