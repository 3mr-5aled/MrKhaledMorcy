# Security Configuration Guide

## 🔐 Production Deployment Checklist

### 1. Environment Variables

You **MUST** update these environment variables before deploying to production:

#### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate CRON_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Required Environment Variables

Add these to your **Netlify Environment Variables**:

```env
# Database - Use your Supabase connection string
DATABASE_URL="postgresql://postgres.xxx:password@aws-x-xxx.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-publishable-key"

# NextAuth - CHANGE THESE!
NEXTAUTH_SECRET="<paste generated secret here>"
NEXTAUTH_URL="https://your-domain.netlify.app"

# CRON Job Protection
CRON_SECRET="<paste different generated secret here>"

# Registration Control
ALLOW_REGISTRATION="false"
```

### 2. Netlify Scheduled Functions Configuration

Update your Netlify scheduled functions to use the CRON_SECRET:

In Netlify Dashboard → Functions → Scheduled Functions:

- Add environment variable `CRON_SECRET` with the value you generated
- The functions will automatically include `Authorization: Bearer ${CRON_SECRET}` header

### 3. Security Features Implemented

✅ **Authentication Protection**

- Admin routes require authentication
- API routes require admin role
- Upload endpoints require authentication
- File deletion requires authentication

✅ **Input Validation**

- Path traversal protection on file operations
- File type validation (PDF, images only)
- File size limits (10MB PDF, 5MB images)
- Zod schema validation on all API endpoints

✅ **Access Control**

- Public registration disabled by default (ALLOW_REGISTRATION=false)
- Role-based access control (ADMIN, SUPER_ADMIN)
- CRON endpoints protected with secret token

✅ **Security Headers**

- Strict-Transport-Security (HSTS)
- X-Frame-Options (SAMEORIGIN)
- X-Content-Type-Options (nosniff)
- X-XSS-Protection
- Content Security Policy for images
- Referrer-Policy

✅ **Other Protections**

- Request body size limits (10MB)
- bcrypt password hashing (10 rounds)
- SQL injection protection (Prisma ORM)
- CSRF protection (NextAuth)

### 4. Verify .gitignore

Ensure `.env.local` is NOT committed to git:

```bash
# Check git history for leaked secrets
git log --all --full-history -- "*.env*"

# If found, you MUST rotate all credentials immediately!
```

### 5. Database Security

✅ Using Supabase connection pooler (recommended)
✅ Prisma ORM prevents SQL injection
⚠️ Consider enabling Row Level Security (RLS) in Supabase for additional protection

### 6. Recommended Additional Security

Consider implementing:

- **Rate Limiting**: Add rate limiting to prevent brute force attacks
  - Use `@upstash/ratelimit` or Netlify Edge Functions
  - Limit login attempts per IP
  - Limit API calls per user

- **2FA (Two-Factor Authentication)**: For admin accounts

- **Audit Logging**: Already implemented via Activity model

- **Regular Security Updates**:
  ```bash
  npm audit
  npm update
  ```

### 7. Initial Admin User Setup

To create the first admin user:

1. Temporarily set `ALLOW_REGISTRATION="true"` in environment variables
2. Make a POST request to `/api/register`:
   ```bash
   curl -X POST https://your-domain.netlify.app/api/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"secure-password","name":"Admin"}'
   ```
3. **IMMEDIATELY** set `ALLOW_REGISTRATION="false"` again
4. Redeploy or restart the application

### 8. Monitoring

Monitor these logs in production:

- Failed authentication attempts
- CRON job executions
- File upload/deletion activities
- API errors

### 9. Incident Response

If credentials are leaked:

1. Immediately rotate all secrets (NEXTAUTH_SECRET, CRON_SECRET)
2. Change database password in Supabase
3. Review access logs for unauthorized access
4. Check Activity model for suspicious actions

---

## 🚨 CRITICAL: Before Going Live

- [ ] Generated new NEXTAUTH_SECRET
- [ ] Generated new CRON_SECRET
- [ ] Set ALLOW_REGISTRATION=false
- [ ] Updated NEXTAUTH_URL to production domain
- [ ] Configured all environment variables in Netlify
- [ ] Verified .env.local is not in git
- [ ] Created initial admin user
- [ ] Tested authentication flow
- [ ] Tested CRON jobs with proper authorization
- [ ] Reviewed all API endpoints for security
