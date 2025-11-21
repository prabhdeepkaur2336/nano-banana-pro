/*
  # Add storage policies for nano_nanana_pro bucket

  1. Storage Policies
    - Allow anonymous users to insert (upload) files
    - Allow anonymous users to select (read) files
    - Allow anonymous users to update files
    - Allow anonymous users to delete files

  Note: This allows full public access to the storage bucket
*/

-- Allow anyone to upload files
CREATE POLICY "Allow public uploads"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'nano_nanana_pro');

-- Allow anyone to read files
CREATE POLICY "Allow public reads"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'nano_nanana_pro');

-- Allow anyone to update files
CREATE POLICY "Allow public updates"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'nano_nanana_pro')
  WITH CHECK (bucket_id = 'nano_nanana_pro');

-- Allow anyone to delete files
CREATE POLICY "Allow public deletes"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'nano_nanana_pro');