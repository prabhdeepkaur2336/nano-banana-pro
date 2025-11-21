# Troubleshooting Guide

## "Internal Server Error" when clicking Generate

This error occurs because the **database table and storage bucket haven't been set up yet**. Follow the [QUICK_SETUP.md](./QUICK_SETUP.md) guide to fix this.

### Quick Fix Summary:

1. **Create the database table** in Supabase SQL Editor (copy SQL from `supabase/setup.sql`)
2. **Create storage bucket** named `nano_nanana_pro` (make it PUBLIC)
3. **Add storage policies** for INSERT and SELECT operations

## Detailed Error Messages

The application now provides specific error messages to help you identify the issue:

### "Database table not found"
- **Cause**: The `image_generation_requests` table doesn't exist
- **Fix**: Run the SQL from `supabase/setup.sql` in your Supabase SQL Editor

### "Storage bucket not found"
- **Cause**: The `nano_nanana_pro` bucket doesn't exist
- **Fix**: Create the bucket in Supabase Storage and make it public

### "Failed to upload image: new row violates row-level security policy"
- **Cause**: Storage bucket exists but policies aren't set up correctly
- **Fix**: Add INSERT and SELECT policies with `bucket_id = 'nano_nanana_pro'` as the policy definition

### "Failed to create request: new row violates row-level security policy"
- **Cause**: Table exists but RLS policies aren't configured correctly
- **Fix**: Re-run the policy creation SQL from `supabase/setup.sql`

## Checking Your Setup

### 1. Verify Database Table

In Supabase SQL Editor, run:
```sql
SELECT * FROM image_generation_requests LIMIT 1;
```

- **Success**: Returns "Success. No rows returned" or shows data
- **Error**: "relation does not exist" → Table not created yet

### 2. Verify Storage Bucket

1. Go to Storage in Supabase Dashboard
2. Look for `nano_nanana_pro` bucket
3. Click on it → Check Configuration → "Public bucket" should be ON

### 3. Verify Storage Policies

1. Go to Storage → `nano_nanana_pro` → Policies tab
2. You should see:
   - One policy for INSERT operations
   - One policy for SELECT operations
3. Both should target the `public` role

### 4. Verify Database Policies

In Supabase SQL Editor, run:
```sql
SELECT * FROM pg_policies WHERE tablename = 'image_generation_requests';
```

You should see 3 policies:
- "Anyone can read image generation requests"
- "Anyone can insert image generation requests"
- "Anyone can update image generation requests"

## Testing the Application

### Test 1: Without Images
1. Click "Generate New Image"
2. Enter prompt: "A beautiful sunset"
3. Don't upload any images
4. Select settings (defaults are fine)
5. Click "Generate"
6. Should see toast notification "Image generation request submitted successfully!"
7. Request appears in table with "running" status

### Test 2: With Images
1. Click "Generate New Image"
2. Enter prompt: "Transform this image"
3. Upload 1-2 test images
4. Select settings
5. Click "Generate"
6. Should see successful submission
7. Request appears in table

## Common Issues

### Issue: "WebSocket connection failed"
- **Cause**: Realtime subscriptions not enabled or network issue
- **Impact**: Table won't update automatically, need to refresh page
- **Fix**: Check Supabase Dashboard → Database → Replication → Enable for `image_generation_requests` table

### Issue: Images show broken/don't load
- **Cause**: Storage bucket is not public or wrong URL
- **Impact**: Can't see uploaded or generated images
- **Fix**: Make bucket public in Storage → Configuration

### Issue: Can't click on completed requests
- **Cause**: Request status is not exactly 'done' (might be 'Done' or 'completed')
- **Fix**: Ensure your webhook updates status to exactly `'done'` (lowercase)

### Issue: Pagination not working correctly
- **Cause**: Database query issues or incorrect total count
- **Impact**: Can't navigate between pages
- **Fix**: Check browser console for errors, verify database connection

## Environment Variables Check

Verify your `.env` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
WEBHOOK_URL=https://your-webhook-url.com/webhook
```

### How to find your Supabase credentials:
1. Go to Supabase Dashboard
2. Select your project
3. Click Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Still Having Issues?

1. **Check browser console** (F12 → Console tab)
   - Look for red error messages
   - Note the exact error text

2. **Check server logs**
   - Look at your terminal running `npm run dev`
   - Error messages will appear there with more details

3. **Test Supabase connection**
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT now();`
   - Should return current timestamp

4. **Restart dev server**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

## Getting Help

If you're still stuck:
1. Note the exact error message
2. Check which step failed (database, storage, upload, etc.)
3. Verify all setup steps were completed
4. Check that credentials in `.env` are correct
