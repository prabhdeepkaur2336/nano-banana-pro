const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('Setting up database...\n');

  const createTableSQL = `
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

    ALTER TABLE image_generation_requests ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can read image generation requests" ON image_generation_requests;
    CREATE POLICY "Anyone can read image generation requests"
      ON image_generation_requests
      FOR SELECT
      TO public
      USING (true);

    DROP POLICY IF EXISTS "Anyone can insert image generation requests" ON image_generation_requests;
    CREATE POLICY "Anyone can insert image generation requests"
      ON image_generation_requests
      FOR INSERT
      TO public
      WITH CHECK (true);

    DROP POLICY IF EXISTS "Anyone can update image generation requests" ON image_generation_requests;
    CREATE POLICY "Anyone can update image generation requests"
      ON image_generation_requests
      FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);

    CREATE INDEX IF NOT EXISTS idx_image_generation_requests_created_at
      ON image_generation_requests(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_image_generation_requests_status
      ON image_generation_requests(status);
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      console.error('Error creating table:', error);
      console.log('\nPlease run the SQL in supabase/setup.sql manually in your Supabase SQL Editor.');
    } else {
      console.log('✅ Table created successfully!');
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.log('\n⚠️  Could not automatically create table.');
    console.log('Please run the SQL in supabase/setup.sql manually in your Supabase SQL Editor.');
  }

  console.log('\n📦 Checking storage bucket...');

  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else {
      const bucketExists = buckets.some(b => b.name === 'nano_nanana_pro');

      if (bucketExists) {
        console.log('✅ Storage bucket "nano_nanana_pro" exists!');
      } else {
        console.log('⚠️  Storage bucket "nano_nanana_pro" not found.');
        console.log('Creating bucket...');

        const { data: newBucket, error: createError } = await supabase.storage.createBucket('nano_nanana_pro', {
          public: true,
          fileSizeLimit: 10485760,
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
          console.log('\nPlease create the bucket manually in Supabase Dashboard:');
          console.log('1. Go to Storage');
          console.log('2. Create new bucket: nano_nanana_pro');
          console.log('3. Make it public');
        } else {
          console.log('✅ Bucket created successfully!');
        }
      }
    }
  } catch (err) {
    console.error('Error with storage:', err.message);
  }

  console.log('\n✨ Setup complete! Try generating an image now.');
}

setupDatabase();
