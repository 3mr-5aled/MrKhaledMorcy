# Troubleshooting Guide

## Upload Error on Netlify (500 Internal Server Error)

### Issue

Getting `POST /api/students/upload 500 (Internal Server Error)` when trying to upload student images.

**Latest Error Details:**

- Request ID: `01KGAZN5D0Y3VJ6CV9HE0529Q0`
- Date: January 31, 2026, 11:34:29 PM
- Duration: 1115ms (function executed but failed)
- Status: 500 Internal Server Error
- Client: Egypt, Cairo

### 🔍 IMMEDIATE ACTION REQUIRED

#### Step 1: Check Netlify Function Logs (DO THIS FIRST!)

**How to access logs:**

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site: `mrkhaledmorcy`
3. Click **"Logs"** tab in top menu
4. Select **"Functions"** from dropdown
5. Look for timestamp: `11:34:29 PM` on `January 31, 2026`
6. Find request ID: `01KGAZN5D0Y3VJ6CV9HE0529Q0`

**What to look for in logs:**

- `"Initializing Supabase client..."` - Shows env vars status
- `"Starting Supabase upload process..."` - Upload started
- `"=== Supabase upload error ==="` - Specific Supabase error
- `"=== Error uploading student image ==="` - General error
- Any red error messages

**Alternative - Real-time logs:**

```bash
netlify logs:function api-students-upload --live
```

Then try uploading and watch the error appear.

### Steps to Diagnose

1. **Check Netlify Function Logs**
   - Go to Netlify Dashboard → Site → Functions
   - Check the logs for the `/api/students/upload` function
   - Look for detailed error messages that were added

2. **Verify Environment Variables in Netlify**
   Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

   To set them:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add each variable from your `.env.local` file

3. **Verify Supabase Storage Setup**
   - Go to Supabase Dashboard → Storage
   - Ensure you have a bucket named `uploads`
   - Check bucket policies allow uploads
   - Folder structure should be: `uploads/students/{studentId}/`

4. **Check Sharp Library**
   The `sharp` library is configured in `netlify.toml` as an external module.
   If issues persist, verify:
   ```toml
   [functions]
   external_node_modules = ["@prisma/client", "sharp", "bcrypt"]
   ```

### Common Issues & Solutions

#### 1. Missing Environment Variables

**Error**: `Missing Supabase URL configuration` or `Missing Supabase API key configuration`

**Solution**: Add environment variables in Netlify:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 2. Supabase Storage Bucket Not Found

**Error**: `Failed to upload optimized image: Bucket not found`

**Solution**:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `uploads`
3. Set it to **Public** or configure RLS policies

#### 3. Sharp Library Issues

**Error**: Messages about `sharp` or image processing

**Solution**: Ensure `sharp` is in `external_node_modules` in `netlify.toml`

#### 4. Permission Denied

**Error**: `Failed to upload: Permission denied`

**Solution**: Check Supabase bucket policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow public read access
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');
```

### Deployment Checklist

Before deploying to Netlify:

- [ ] All environment variables are set in Netlify
- [ ] Supabase `uploads` bucket exists
- [ ] Supabase storage policies are configured
- [ ] `netlify.toml` has correct configuration
- [ ] Build succeeds locally with `npm run build`
- [ ] Test upload functionality locally first

### Getting More Information

After the latest changes, the error response will include:

- Detailed error message
- Environment configuration status
- Stack trace (in development)

Check the Netlify function logs for these details to identify the exact issue.
