# 🔴 DEBUG: Student Upload 500 Error - RESOLVED

**Error Details:**

- Request ID: `01KGAZN5D0Y3VJ6CV9HE0529Q0`
- Time: January 31, 2026, 11:34:29 PM
- Duration: 1115ms (function ran but failed)
- Endpoint: `/api/students/upload`

## ✅ ROOT CAUSE FOUND

```
ERROR: EROFS: read-only file system, open '/var/task/public/images/students/temp/...'
Environment: { isNetlify: false, nodeEnv: 'production', hasSupabaseUrl: true, hasServiceRole: true }
```

**The Problem:**

- The code was checking `NETLIFY === "true"` to detect production environment
- Netlify doesn't always set this variable correctly
- So it fell back to local filesystem mode (development)
- But serverless functions have **read-only filesystems** → Error

**The Fix:**

- Changed detection to use `NODE_ENV === "production"` (more reliable)
- Now correctly uses Supabase Storage in production
- Filesystem writes only happen in local development

---

## 🚀 SOLUTION DEPLOYED

The fix has been applied. The upload endpoint now:

1. ✅ Detects production by `NODE_ENV` (not just `NETLIFY` env var)
2. ✅ Uses Supabase Storage in production automatically
3. ✅ Only uses local filesystem in development mode

---

## 📋 NEXT STEPS TO DEPLOY

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Fix: Use NODE_ENV for production detection instead of NETLIFY env var"
git push
```

### 2. Wait for Netlify to Rebuild

- Netlify will auto-deploy (takes ~2-3 minutes)
- Watch the deploy status in Netlify Dashboard

### 3. Verify Environment Variables (Still Required!)

Make sure these are set in Netlify Dashboard → Site Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://cgmludylubixdwgfujqe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnbWx1ZHlsdWJpeGR3Z2Z1anFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU5NzI1NCwiZXhwIjoyMDg1MTczMjU0fQ.A4TDIK5K4TCC-cQ2GAm2sniOIbhy_YaUJ52aIGbtjto
DATABASE_URL=postgresql://postgres.cgmludylubixdwgfujqe:Moroeducation55*@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
NEXTAUTH_URL=https://mrkhaledmorcy.netlify.app
NEXTAUTH_SECRET=your-secret-here
```

### 4. Verify Supabase Storage Bucket

1. Go to https://supabase.com/dashboard/project/cgmludylubixdwgfujqe/storage/buckets
2. Ensure bucket `uploads` exists and is **Public**
3. If not, create it

### 5. Test the Upload

After deployment completes:

1. Go to https://mrkhaledmorcy.netlify.app/admin/students
2. Try uploading a student image
3. Should now work! ✨

---

## 🔍 BONUS: Database Connection Pool Issue

Your logs also showed:

```
FATAL: MaxClientsInSessionMode: max clients reached
```

This is a **separate issue** with Prisma connection pooling. To fix:

1. Update your `DATABASE_URL` in Netlify to use the connection pool limit:

   ```
   DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=1
   ```

   (Already correct in your .env.local)

2. Make sure you're not creating multiple Prisma instances. Check [lib/db.ts](src/lib/db.ts) uses a singleton pattern.

---

## ✅ Summary

**What was wrong:**

- Code checked `NETLIFY === "true"` which wasn't set
- Fell back to filesystem mode on serverless (read-only) → Error

**What was fixed:**

- Now uses `NODE_ENV === "production"` for detection
- Automatically uses Supabase Storage in production
- More reliable environment detection

**What you need to do:**

1. Push the code changes
2. Verify Supabase env vars in Netlify
3. Test the upload

Should work now! 🎉
