# Quick Setup Guide

## The Issue

You're getting "internal server error" because the database table and storage bucket haven't been set up yet in Supabase.

## Fix in 3 Steps

### Step 1: Create the Database Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Create the table
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

-- Enable RLS
ALTER TABLE image_generation_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read image generation requests" ON image_generation_requests;
DROP POLICY IF EXISTS "Anyone can insert image generation requests" ON image_generation_requests;
DROP POLICY IF EXISTS "Anyone can update image generation requests" ON image_generation_requests;

-- Create policies for public access
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_image_generation_requests_created_at
  ON image_generation_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_image_generation_requests_status
  ON image_generation_requests(status);
```

6. Click **RUN** (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned"

### Step 2: Create the Storage Bucket

1. Still in your Supabase Dashboard, click on **Storage** in the left sidebar
2. Click the **New bucket** button
3. Enter these details:
   - **Name**: `nano_nanana_pro`
   - **Public bucket**: ✅ **Check this box** (very important!)
4. Click **Create bucket**

### Step 3: Set Up Storage Policies

1. After creating the bucket, you'll see it in the list
2. Click on the `nano_nanana_pro` bucket
3. Click on the **Policies** tab
4. Click **New policy** → Select **For full customization**
5. Create the first policy (INSERT):
   - **Policy name**: `Anyone can upload images`
   - **Allowed operation**: INSERT
   - **Target roles**: public
   - **Policy definition**: Enter this:
     ```sql
     bucket_id = 'nano_nanana_pro'
     ```
   - Click **Review** then **Save policy**

6. Create the second policy (SELECT):
   - Click **New policy** → **For full customization** again
   - **Policy name**: `Anyone can view images`
   - **Allowed operation**: SELECT
   - **Target roles**: public
   - **Policy definition**: Enter this:
     ```sql
     bucket_id = 'nano_nanana_pro'
     ```
   - Click **Review** then **Save policy**

## That's It!

Now go back to your application and try clicking "Generate New Image" again. It should work!

## Testing Without Images

If you want to test quickly:
1. Click "Generate New Image"
2. Enter a prompt (e.g., "A beautiful sunset")
3. Leave the image upload empty
4. Select your settings
5. Click "Generate"

You should see the request appear in the table with a "running" status.

## Troubleshooting

If you still get errors:

1. **Check the browser console** (F12 → Console tab) for detailed error messages
2. **Verify the bucket is public**: Go to Storage → nano_nanana_pro → Configuration → Make sure "Public bucket" is ON
3. **Check policies**: Make sure both INSERT and SELECT policies are created with `bucket_id = 'nano_nanana_pro'` as the definition
