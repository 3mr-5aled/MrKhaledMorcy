# Answers Management System - Setup Instructions

This implementation adds a complete answers management system to the Mr. Khaled Morcy website with teacher authentication, admin dashboard, and student-facing answers pages.

## 🗄️ Database Setup

### 1. Install PostgreSQL

You need PostgreSQL installed on your local machine. Download from: https://www.postgresql.org/download/

### 2. Create Database

After installing PostgreSQL, create a database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mrkhaled_db;

# Exit
\q
```

### 3. Update Environment Variables

The `.env.local` file has been created with default values. Update the `DATABASE_URL` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mrkhaled_db"
NEXTAUTH_SECRET="your-secret-key-change-in-production-min-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"
```

**Important**: Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## 📦 Installation & Migration

### 1. Install Dependencies

Dependencies have already been installed. If needed, run:

```bash
npm install
```

### 2. Run Prisma Migration

Create the database tables:

```bash
npx prisma migrate dev --name init
```

### 3. Seed Initial Data

Create the admin user and sample grades:

```bash
npm run prisma:seed
```

This creates:

- **Admin user**: `admin@mrkhaledmorcy.com` / `KhaledEng2020*`
- **6 Grades**: prep-1, prep-2, prep-3, sec-1, sec-2, sec-3

### 4. Generate Prisma Client

```bash
npx prisma generate
```

## 🚀 Running the Application

```bash
npm run dev
```

Visit: http://localhost:3000

## 🔑 Admin Access

1. Go to http://localhost:3000/login
2. Login with:
   - **Email**: admin@mrkhaledmorcy.com
   - **Password**: KhaledEng2020\*
3. You'll be redirected to the admin dashboard

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/              # Admin dashboard
│   │   ├── layout.tsx      # Admin layout with sidebar
│   │   ├── page.tsx        # Dashboard home
│   │   ├── grades/         # Grades management
│   │   ├── units/          # Units management
│   │   ├── lessons/        # Lessons management
│   │   └── answers/        # Answers management
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth routes
│   │   ├── grades/         # Grades CRUD
│   │   ├── units/          # Units CRUD
│   │   ├── lessons/        # Lessons CRUD
│   │   ├── answers/        # Answers CRUD
│   │   └── upload/         # File upload
│   ├── answers/            # Student answers page
│   └── login/              # Login page
├── components/
│   ├── admin/              # Admin components
│   │   ├── Sidebar.tsx
│   │   ├── StatsCard.tsx
│   │   └── PageHeader.tsx
│   └── Providers.tsx       # SessionProvider wrapper
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client singleton
│   └── fileUtils.ts        # File handling utilities
├── middleware.ts           # Route protection
└── prisma/
    ├── schema.prisma       # Database schema
    └── seed.ts             # Seed script
```

## 🎯 Features Implemented

### Teacher/Admin Features:

- ✅ Secure authentication with NextAuth
- ✅ Protected admin dashboard
- ✅ Grades management (CRUD)
- ✅ Units management (CRUD)
- ✅ Lessons management (CRUD)
- ✅ Answers management with:
  - PDF uploads (≤ 10MB)
  - Image uploads (≤ 5MB)
  - YouTube video links
  - Category types: LESSON, UNIT_EXERCISE, EXAM, OTHER (with custom title)
  - Orderable answers
  - Automatic file deletion on answer removal

### Student Features:

- ✅ Grade selection dropdown
- ✅ Unit selection (cascading based on grade)
- ✅ Answers display by category
- ✅ PDF download
- ✅ Image lightbox viewer
- ✅ YouTube video embeds

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT session tokens
- ✅ Protected API routes (POST/PUT/DELETE require authentication)
- ✅ Middleware protecting /admin/\* routes
- ✅ File upload validation (type & size)
- ✅ Sanitized filenames

## 📝 Usage Guide

### Adding Answers (Teacher):

1. Login to admin dashboard
2. Go to "إدارة الإجابات" (Answers Management)
3. Click "+ إضافة إجابة جديدة"
4. Fill in the form:
   - Select Grade → Unit → Lesson (optional)
   - Choose category type
   - If "OTHER", add custom title (e.g., "تمارين على الوحدة 1 و 2 و 3")
   - Upload file or add YouTube URL
   - Add title and description
5. Click "حفظ الإجابة"

### Viewing Answers (Student):

1. Go to http://localhost:3000/answers
2. Select your grade from dropdown
3. Select unit
4. View answers grouped by category

## 🛠️ Database Management

### View Database in Browser:

```bash
npx prisma studio
```

### Reset Database:

```bash
npx prisma migrate reset
```

### Create New Migration:

```bash
npx prisma migrate dev --name migration_name
```

## 📚 API Endpoints

### Public (GET):

- `GET /api/grades` - Get all grades
- `GET /api/units?gradeId=...` - Get units by grade
- `GET /api/lessons?unitId=...` - Get lessons by unit
- `GET /api/answers?unitId=...` - Get answers by unit

### Protected (Admin only):

- `POST /api/grades` - Create grade
- `POST /api/units` - Create unit
- `POST /api/lessons` - Create lesson
- `POST /api/answers` - Create answer
- `POST /api/upload` - Upload file
- `PUT /api/[resource]/[id]` - Update resource
- `DELETE /api/[resource]/[id]` - Delete resource

## ⚠️ Important Notes

1. **Change Admin Password**: After first login, change the default admin password
2. **Secure NEXTAUTH_SECRET**: Use a strong random value in production
3. **File Storage**: Files are stored in `public/answers/` - ensure this directory has write permissions
4. **Database Backups**: Regularly backup your PostgreSQL database
5. **Environment Variables**: Never commit `.env.local` to version control

## 🐛 Troubleshooting

### "Can't reach database server"

- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env.local`
- Verify database exists: `psql -U postgres -l`

### "Prisma Client is not generated"

```bash
npx prisma generate
```

### Migration errors:

```bash
npx prisma migrate reset
npx prisma migrate dev --name init
npm run prisma:seed
```

### File upload fails:

- Check directory permissions for `public/answers/`
- Ensure file size limits are respected (PDF: 10MB, Images: 5MB)

## 🎨 Customization

### Add More Grades:

Edit `prisma/seed.ts` and add new grades, then run:

```bash
npm run prisma:seed
```

### Change File Size Limits:

Edit `src/lib/fileUtils.ts`:

```typescript
export const FILE_SIZE_LIMITS = {
  PDF: 10 * 1024 * 1024, // 10MB
  IMAGE: 5 * 1024 * 1024, // 5MB
};
```

## 📞 Support

For issues or questions, contact the development team.

---

**Built with**: Next.js 16, React 19, Prisma 7, PostgreSQL, NextAuth, TypeScript, Tailwind CSS
