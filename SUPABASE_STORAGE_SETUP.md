# Supabase Storage Setup for File Uploads

## Problem
Netlify serverless functions have a read-only file system (except for `/tmp`), so we can't save uploaded files to the local `public/` directory in production.

## Solution
Use **Supabase Storage** for file uploads in production, while keeping local filesystem uploads for development.

## Setup Steps

### 1. Create Storage Bucket in Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/cgmludylubixdwgfujqe
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Create a bucket named: `uploads`
5. Make it **Public** (so student images and answer files are accessible)
6. Click **Create bucket**

### 2. Set Up Bucket Policies

After creating the bucket, set up storage policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow public read access to all files
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Allow authenticated users to delete their own files (optional)
CREATE POLICY "Users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');
```

### 3. Get Your Supabase Service Role Key

1. In Supabase dashboard, go to **Settings** → **API**
2. Find the **service_role** key (NOT the anon key)
3. Copy this key - it has admin privileges

### 4. Add Environment Variables

Add to your `.env.local` (local development):
```env
# Supabase Storage (for file uploads in production)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Add to **Netlify Environment Variables**:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 5. File Structure in Supabase Storage

Files will be organized as:
```
uploads/
├── students/
│   ├── temp/              # Temporary student images
│   └── {studentId}/       # Student-specific images
│       ├── {timestamp}-{name}.webp
│       └── {timestamp}-{name}-thumb.webp
└── answers/
    └── {gradeId}/
        └── {unitId}/
            ├── {timestamp}-{name}.pdf
            ├── {timestamp}-{name}.webp
            └── {timestamp}-{name}-thumb.webp
```

### 6. How It Works

The upload endpoints now check if running on Netlify:

- **Development** (`npm run dev`): Uses local filesystem (`public/` directory)
- **Production** (Netlify): Uses Supabase Storage

Files are:
1. Validated for type and size
2. Optimized using Sharp (converted to WebP for images)
3. Uploaded to Supabase Storage bucket
4. Public URLs returned to frontend

### 7. Deploy

After setting up Supabase Storage:

```bash
git add .
git commit -m "feat: add Supabase Storage for production file uploads"
git push
```

Netlify will automatically deploy with the new storage integration.

## URLs

After upload, files are accessible at:
```
https://cgmludylubixdwgfujqe.supabase.co/storage/v1/object/public/uploads/{path}
```

Example:
```
https://cgmludylubixdwgfujqe.supabase.co/storage/v1/object/public/uploads/students/cml27cgva0000pryk1mmk0tf3/1738362000000-edited-image.webp
```

## Testing

1. Test locally first: `npm run dev` (should use filesystem)
2. Deploy to Netlify
3. Try uploading a student image from `/admin/students`
4. Check Supabase Storage dashboard to see the uploaded files

## Cost

Supabase free tier includes:
- 1 GB storage
- 2 GB bandwidth per month

Should be sufficient for educational content (student images and PDFs).
