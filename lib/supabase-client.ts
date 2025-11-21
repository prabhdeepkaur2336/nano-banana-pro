import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ImageGenerationRequest = {
  id: string;
  prompt: string;
  images: string[];
  aspect_ratio: string;
  resolution: string;
  output_format: string;
  status: 'running' | 'done' | 'failed';
  generated_image_url: string | null;
  created_at: string;
};
