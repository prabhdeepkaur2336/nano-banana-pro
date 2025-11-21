# AI Image Generator

A sleek, modern image generation application with real-time updates, built with Next.js and Supabase.

## Features

✨ **Black theme with red accents** - Modern, professional design
📤 **Multi-image upload** - Drag & drop up to 8 images
✅ **Real-time validation** - Instant feedback on file types and sizes
🔄 **Live updates** - Table refreshes automatically when data changes
📄 **Pagination** - Browse through requests, 10 per page
💾 **Download generated images** - One-click download from details modal
📱 **Fully responsive** - Works on mobile, tablet, and desktop

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Make sure your Supabase database and storage are set up:

**Database Table**: `image_generation_requests` ✅ (Already configured)
**Storage Bucket**: `nano_nanana_pro` (Must be PUBLIC)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## How It Works

### Creating a Request

1. Click **"Generate New Image"** button
2. Enter your prompt (required)
3. Optionally upload reference images (up to 8)
4. Select aspect ratio, resolution, and output format
5. Click **"Generate"**

### What Happens

1. **Upload** - Images are uploaded to Supabase Storage bucket `nano_nanana_pro`
2. **Insert** - A new row is created in `image_generation_requests` table with:
   - `prompt`: Your text prompt
   - `images`: Array of uploaded image URLs
   - `aspect_ratio`: Selected aspect ratio
   - `resolution`: Selected resolution
   - `output_format`: Selected format (png/jpg)
   - `status`: Set to 'running'
3. **Display** - Request appears in the table immediately
4. **Real-time** - When status changes to 'done', the table updates automatically

### Viewing Results

- Click any **completed** request (status = 'done') in the table
- View full prompt, input images, and settings
- See the generated image
- Download the result with one click

## Database Schema

```sql
create table public.image_generation_requests (
  id uuid not null default extensions.uuid_generate_v4(),
  prompt text not null,
  images text[] null,
  aspect_ratio text not null,
  resolution text not null,
  output_format text not null,
  status public.image_generation_status null default 'running'::image_generation_status,
  generated_image_url text null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint image_generation_requests_pkey primary key (id)
);
```

## Storage Bucket

**Name**: `nano_nanana_pro`
**Access**: Public
**Allowed files**: JPEG, PNG, WebP
**Max size**: 10MB per file

## API Endpoint

### POST `/api/generate-image`

**Request**: `multipart/form-data`
- `prompt` (string, required)
- `aspect_ratio` (string, required)
- `resolution` (string, required)
- `output_format` (string, required)
- `images` (File[], optional)

**Response**:
```json
{
  "success": true,
  "id": "uuid-of-created-request"
}
```

**Process**:
1. Validates required fields
2. Uploads images to Supabase Storage
3. Gets public URLs for uploaded images
4. Inserts row into database with status 'running'
5. Returns success with request ID

## Tech Stack

- **Next.js 13** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - Database, storage, and real-time subscriptions
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Icon library

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Troubleshooting

### Dev server shows old errors
- Stop the dev server (Ctrl+C)
- Run `npm run dev` again

### "Table not found" error
- Verify the `image_generation_requests` table exists in Supabase
- Check that RLS policies allow public access

### "Bucket not found" error
- Create the `nano_nanana_pro` bucket in Supabase Storage
- Make sure it's set to PUBLIC
- Add policies for public INSERT and SELECT

### Images don't load
- Verify storage bucket is public
- Check browser console for CORS errors
- Verify image URLs are valid

## Project Structure

```
├── app/
│   ├── api/
│   │   └── generate-image/
│   │       └── route.ts          # API endpoint
│   ├── globals.css               # Global styles with black/red theme
│   ├── layout.tsx                # Root layout with Toaster
│   └── page.tsx                  # Home page
├── components/
│   ├── generate-image-modal.tsx  # Generate form modal
│   ├── image-upload.tsx          # Image upload with validation
│   ├── request-details-modal.tsx # Request details viewer
│   ├── requests-table.tsx        # Paginated table with real-time
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── supabase-client.ts        # Supabase client config
│   └── utils.ts                  # Utility functions
└── supabase/
    └── setup.sql                 # Database setup SQL
```

## License

MIT
