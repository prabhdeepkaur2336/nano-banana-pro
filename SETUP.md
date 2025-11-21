# AI Image Generator - Setup Instructions

## Database Setup

To complete the setup of your AI Image Generator application, you need to configure your Supabase database and storage. Follow these steps:

### 1. Create the Database Table

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Copy and paste the SQL from `supabase/setup.sql`
4. Click **Run** to execute the SQL

This will create:
- The `image_generation_requests` table with all necessary columns
- Row Level Security (RLS) policies for public access
- Indexes for better performance
- Real-time subscriptions enabled

### 2. Create the Storage Bucket

1. In your Supabase dashboard, navigate to **Storage**
2. Click **New bucket**
3. Configure the bucket as follows:
   - **Name**: `nano_nanana_pro`
   - **Public bucket**: ✅ Yes (check this box)
   - Click **Create bucket**

4. After creating the bucket, configure upload policies:
   - Click on the `nano_nanana_pro` bucket
   - Go to **Policies** tab
   - Click **New policy** and select **For full customization**
   - Create a policy for INSERT operations:
     ```sql
     CREATE POLICY "Anyone can upload images"
     ON storage.objects FOR INSERT
     TO public
     WITH CHECK (bucket_id = 'nano_nanana_pro');
     ```
   - Create a policy for SELECT operations:
     ```sql
     CREATE POLICY "Anyone can view images"
     ON storage.objects FOR SELECT
     TO public
     USING (bucket_id = 'nano_nanana_pro');
     ```

### 3. Configure Environment Variables

Update the `.env` file with your webhook URL:

```env
WEBHOOK_URL=https://your-actual-webhook-url.com/webhook
```

Replace `https://your-webhook-url.com/webhook` with your actual webhook endpoint that will receive notifications when new image generation requests are created.

## Features

### ✅ Implemented Features

- **Black theme with red accents** - Modern, sleek design with high contrast
- **Image upload with drag-and-drop** - Upload up to 8 images with validation
- **File validation** - Supports JPEG, PNG, WebP up to 10MB each
- **Form validation** - Real-time validation with clear error messages
- **Real-time updates** - Table updates automatically when requests change
- **Pagination** - Browse through requests 10 at a time
- **Status indicators** - Visual feedback for running, done, and failed requests
- **Request details modal** - View full details and download generated images
- **Webhook integration** - Automatically notifies your webhook with new request IDs
- **Responsive design** - Works seamlessly on mobile, tablet, and desktop

## How It Works

1. **Create a Request**: Click "Generate New Image" to open the modal
2. **Fill the Form**:
   - Enter your prompt
   - Optionally upload reference images (up to 8)
   - Select aspect ratio, resolution, and output format
3. **Submit**: Click "Generate" to create the request
4. **Upload**: Images are uploaded to Supabase Storage
5. **Database**: Request is saved with status "running"
6. **Webhook**: Your webhook receives the request ID for processing
7. **Real-time Updates**: When your webhook updates the status to "done" and adds the generated image URL, the table updates automatically
8. **View Results**: Click on completed requests to view details and download

## Webhook Integration

Your webhook should:

1. Receive POST requests with payload: `{ "id": "uuid-of-request" }`
2. Process the image generation using the request data from the database
3. Update the database record when complete:
   ```typescript
   await supabase
     .from('image_generation_requests')
     .update({
       status: 'done',
       generated_image_url: 'https://your-generated-image-url.com/image.png'
     })
     .eq('id', requestId);
   ```

## Tech Stack

- **Next.js 13** - React framework with App Router
- **Supabase** - Database, storage, and real-time subscriptions
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`
