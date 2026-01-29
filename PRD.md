# Product Requirements Document (PRD)
## Mr. Khaled Morcy Educational Platform

**Version:** 1.0  
**Date:** January 28, 2026  
**Status:** Active Development

---

## 1. Executive Summary

### 1.1 Product Vision
Mr. Khaled Morcy Educational Platform is a comprehensive web-based learning management system designed to provide Egyptian middle and high school students with easy access to educational resources, lesson answers, exercises, and exam materials. The platform serves as a digital hub connecting the teacher (Mr. Khaled Morcy) with students and parents, streamlining educational content delivery and student progress tracking.

### 1.2 Product Objectives
- Provide centralized access to lesson answers, unit exercises, and exam resources
- Enable students to access educational materials 24/7 from any device
- Showcase student achievements and success stories
- Facilitate communication between teacher, students, and parents
- Digitize and organize educational content for easy management
- Build an engaging online presence that reflects teaching quality and expertise

### 1.3 Success Metrics
- Number of active students accessing the platform monthly
- Content engagement rates (downloads, views)
- Admin efficiency in content management (time to publish new materials)
- Student satisfaction score
- Parent engagement through contact forms and inquiries

---

## 2. Target Audience

### 2.1 Primary Users
**Students**
- **Demographics:** Middle school (إعدادي) and high school (ثانوي) students in Egypt
- **Age Range:** 12-18 years old
- **Technical Proficiency:** Basic to intermediate
- **Needs:** 
  - Quick access to lesson answers and exercises
  - Study materials organized by grade and unit
  - Visual proof of achievements and success
  - Easy navigation on mobile devices

**Parents**
- **Demographics:** Parents of enrolled students
- **Needs:**
  - Schedule information
  - Teacher contact information
  - Student progress visibility
  - Testimonials and success stories

### 2.2 Secondary Users
**Admin/Teacher (Mr. Khaled Morcy)**
- **Role:** Content creator and platform administrator
- **Needs:**
  - Efficient content management dashboard
  - Upload and organize answers/exercises
  - Manage grades, units, and lessons hierarchy
  - Track content organization
  - Quick content updates

---

## 3. Product Overview

### 3.1 Product Description
A modern, responsive web application built with Next.js that serves as a digital educational platform. The platform features a public-facing website showcasing the teacher's services, achievements, and student success stories, along with a secure admin dashboard for managing educational content structured by grade, unit, and lesson.

### 3.2 Technology Stack
- **Frontend:** Next.js 16.1.5, React 19.2.3, TypeScript 5
- **Styling:** Tailwind CSS 4
- **Authentication:** NextAuth 5.0 (beta)
- **Database:** PostgreSQL with Prisma ORM 7.3.0
- **Deployment:** Netlify
- **Additional Libraries:**
  - bcrypt for password hashing
  - Zod for validation

---

## 4. Feature Requirements

### 4.1 Public Website Features

#### 4.1.1 Hero Section
**Priority:** High  
**Description:** Eye-catching landing section introducing the platform
**Requirements:**
- Prominent teacher name and branding
- Compelling value proposition
- Clear call-to-action buttons
- Responsive design for mobile/tablet/desktop

#### 4.1.2 About Section
**Priority:** High  
**Description:** Teacher biography and teaching philosophy
**Requirements:**
- Professional teacher profile
- Teaching experience and qualifications
- Teaching methodology overview
- Engaging visual design

#### 4.1.3 Services Section
**Priority:** High  
**Description:** Overview of educational services offered
**Requirements:**
- Clear description of teaching services
- Grade levels covered (middle school, high school)
- Subject areas
- Service differentiators

#### 4.1.4 Achievements Section
**Priority:** Medium  
**Description:** Showcase teaching achievements and milestones
**Requirements:**
- Display achievement cards with images
- Achievement titles and descriptions
- Load from JSON data source
- Grid/carousel layout

#### 4.1.5 Feedback/Testimonials Section
**Priority:** High  
**Description:** Student and parent testimonials
**Requirements:**
- Display testimonials from successful students
- Include student names (optional: photos)
- Ratings or success metrics
- Load from JSON data
- Carousel or card-based layout

#### 4.1.6 Best Students Section
**Priority:** Medium  
**Description:** Highlight top-performing students
**Requirements:**
- Student photos and names
- Achievement details
- Load from JSON data
- Inspiring presentation format

#### 4.1.7 Schedule Section
**Priority:** High  
**Description:** Class schedule information
**Requirements:**
- Weekly schedule display
- Class times for different grades
- Clear, readable format
- Load from JSON data
- Mobile-friendly view

#### 4.1.8 Quick Links Section
**Priority:** Medium  
**Description:** Fast navigation to important resources
**Requirements:**
- Links to answers page
- Links to quiz page
- Other important navigation shortcuts
- Icon-based or card-based design

#### 4.1.9 Contact Section
**Priority:** High  
**Description:** Contact information and inquiry form
**Requirements:**
- Contact form (name, email, message)
- Phone number display
- WhatsApp integration
- Email address
- Social media links
- Form validation

#### 4.1.10 Floating WhatsApp Button
**Priority:** Medium  
**Description:** Persistent WhatsApp contact button
**Requirements:**
- Floating button on all pages
- Direct WhatsApp chat link
- Unobtrusive positioning
- Mobile and desktop compatible

#### 4.1.11 Header Component
**Priority:** High  
**Description:** Global navigation header
**Requirements:**
- Logo/branding
- Navigation menu
- Responsive mobile menu
- Links to main sections
- Login link for admin

#### 4.1.12 Footer Component
**Priority:** Medium  
**Description:** Site footer with information
**Requirements:**
- Copyright information
- Quick links
- Contact information
- Social media links

### 4.2 Student Features

#### 4.2.1 Answers Page
**Priority:** High  
**Description:** Browse and access lesson answers, exercises, and exams
**Requirements:**
- View all available answers organized by category
- Filter by:
  - Category type (Lesson Answers, Unit Exercises, Exams, Other)
  - Grade level
  - Unit
  - Lesson
- Display answer cards with:
  - Title
  - Description
  - Type indicator (PDF, Image, YouTube)
  - File size (for downloads)
  - Creation date
- Download or view content
- YouTube video embedding for video content
- Search functionality
- Responsive grid/list layout
- Pagination or infinite scroll for large datasets

#### 4.2.2 Quizzes Page
**Priority:** Medium  
**Description:** Access to quizzes and practice tests
**Requirements:**
- Quiz listing interface
- Quiz categories/filters
- Access quiz content
- (Future: Interactive quiz functionality)

### 4.3 Admin Dashboard Features

#### 4.3.1 Admin Authentication
**Priority:** Critical  
**Description:** Secure login system for admin access
**Requirements:**
- Email and password authentication
- Session management with NextAuth
- Password hashing with bcrypt
- Role-based access (ADMIN, SUPER_ADMIN)
- Protected routes
- Logout functionality
- Password reset capability (future)

#### 4.3.2 Admin Dashboard Overview
**Priority:** High  
**Description:** Main dashboard with statistics and quick actions
**Requirements:**
- Statistics cards showing:
  - Total grades
  - Total units
  - Total lessons
  - Total answers
- Quick action buttons
- Recent activity feed
- Clean, intuitive layout

#### 4.3.3 Grades Management
**Priority:** High  
**Description:** CRUD operations for grade levels
**Requirements:**
- List all grades with:
  - Name (e.g., "أولى إعدادي", "ثالثة ثانوي")
  - Stage (إعدادي/ثانوي)
  - Color coding
  - Order/sequence
  - Unit count
- Create new grade
- Edit existing grade
- Delete grade (with cascade to units/lessons)
- Reorder grades
- Color picker for UI customization
- Form validation

#### 4.3.4 Units Management
**Priority:** High  
**Description:** CRUD operations for units within grades
**Requirements:**
- List all units with:
  - Unit name
  - Associated grade
  - Order/sequence
  - Lesson count
- Filter by grade
- Create new unit
- Edit existing unit
- Delete unit (with cascade to lessons)
- Reorder units within grade
- Form validation
- Breadcrumb navigation (Grade > Unit)

#### 4.3.5 Lessons Management
**Priority:** High  
**Description:** CRUD operations for lessons within units
**Requirements:**
- List all lessons with:
  - Lesson name
  - Associated unit and grade
  - Order/sequence
  - Answer count
- Filter by grade and unit
- Create new lesson
- Edit existing lesson
- Delete lesson (with cascade to answers)
- Reorder lessons within unit
- Form validation
- Breadcrumb navigation (Grade > Unit > Lesson)

#### 4.3.6 Answers Management
**Priority:** High  
**Description:** CRUD operations for answers, exercises, and exams
**Requirements:**
- List all answers with:
  - Title
  - Description
  - Type (PDF, Image, YouTube)
  - Category (Lesson Answer, Unit Exercise, Exam, Other)
  - Associated lesson (if applicable)
  - File size
  - URL/file path
  - Creation date
- Filter by:
  - Category type
  - Grade
  - Unit
  - Lesson
  - Answer type
- Create new answer with:
  - File upload (PDF, images)
  - YouTube URL input
  - Title and description
  - Category selection
  - Lesson association (optional)
  - Custom title for "Other" category
- Edit existing answer
- Delete answer (with file cleanup)
- Preview content before publishing
- Bulk upload capability (future)
- Form validation
- File size limits and validation

#### 4.3.7 File Upload System
**Priority:** Critical  
**Description:** Handle file uploads for PDFs and images
**Requirements:**
- Upload endpoint API
- File type validation (PDF, JPG, PNG, etc.)
- File size validation
- Unique filename generation
- Store in `/public/answers/` directory
- Return file URL and metadata
- Error handling
- Progress indication
- Support for multiple file uploads

#### 4.3.8 Admin Sidebar Navigation
**Priority:** High  
**Description:** Persistent navigation in admin panel
**Requirements:**
- Dashboard link
- Grades management link
- Units management link
- Lessons management link
- Answers management link
- User profile/settings
- Logout button
- Active state indication
- Collapsible on mobile

### 4.4 API Endpoints

#### 4.4.1 Authentication API
**Endpoint:** `/api/auth/[...nextauth]`  
**Priority:** Critical  
**Methods:** GET, POST
**Description:** NextAuth handlers for authentication

#### 4.4.2 Grades API
**Endpoint:** `/api/grades`  
**Priority:** High  
**Methods:**
- GET: Fetch all grades
- POST: Create new grade
**Endpoint:** `/api/grades/[id]`  
**Methods:**
- GET: Fetch single grade
- PUT: Update grade
- DELETE: Delete grade

#### 4.4.3 Units API
**Endpoint:** `/api/units`  
**Priority:** High  
**Methods:**
- GET: Fetch all units (with optional grade filter)
- POST: Create new unit
**Endpoint:** `/api/units/[id]`  
**Methods:**
- GET: Fetch single unit
- PUT: Update unit
- DELETE: Delete unit

#### 4.4.4 Lessons API
**Endpoint:** `/api/lessons`  
**Priority:** High  
**Methods:**
- GET: Fetch all lessons (with optional filters)
- POST: Create new lesson
**Endpoint:** `/api/lessons/[id]`  
**Methods:**
- GET: Fetch single lesson
- PUT: Update lesson
- DELETE: Delete lesson

#### 4.4.5 Answers API
**Endpoint:** `/api/answers`  
**Priority:** High  
**Methods:**
- GET: Fetch all answers (with filters)
- POST: Create new answer
**Endpoint:** `/api/answers/[id]`  
**Methods:**
- GET: Fetch single answer
- PUT: Update answer
- DELETE: Delete answer

#### 4.4.6 Upload API
**Endpoint:** `/api/upload`  
**Priority:** Critical  
**Methods:**
- POST: Handle file uploads
**Requirements:**
- Accept multipart/form-data
- Validate file type and size
- Save to public directory
- Return file metadata

---

## 5. Data Models

### 5.1 User Model
```typescript
{
  id: string (CUID)
  email: string (unique)
  name: string (optional)
  password: string (bcrypt hashed)
  role: Role (ADMIN | SUPER_ADMIN)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 5.2 Grade Model
```typescript
{
  id: string (CUID)
  name: string           // "أولى إعدادي"
  stage: string          // "المرحلة الإعدادية"
  color: string          // Hex color
  order: number
  createdAt: DateTime
  updatedAt: DateTime
  units: Unit[]
}
```

### 5.3 Unit Model
```typescript
{
  id: string (CUID)
  name: string           // "Unit 1"
  gradeId: string
  grade: Grade
  order: number
  createdAt: DateTime
  updatedAt: DateTime
  lessons: Lesson[]
}
```

### 5.4 Lesson Model
```typescript
{
  id: string (CUID)
  name: string           // "Lesson 1"
  unitId: string
  unit: Unit
  order: number
  createdAt: DateTime
  updatedAt: DateTime
  answers: Answer[]
}
```

### 5.5 Answer Model
```typescript
{
  id: string (CUID)
  title: string
  description: string (optional)
  type: AnswerType       // PDF | IMAGE | YOUTUBE
  url: string            // File path or YouTube URL
  lessonId: string (optional)
  lesson: Lesson (optional)
  categoryType: CategoryType  // LESSON | UNIT_EXERCISE | EXAM | OTHER
  customTitle: string (optional)
  order: number
  fileSize: number (optional, bytes)
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 6. User Flows

### 6.1 Student User Flow
1. Land on homepage
2. Browse through sections (Hero, About, Services, etc.)
3. View schedule and testimonials
4. Navigate to Answers page via Quick Links
5. Filter answers by grade/unit/lesson/category
6. View answer details
7. Download PDF/image or watch YouTube video
8. Contact teacher via WhatsApp or contact form

### 6.2 Admin User Flow
1. Navigate to /login
2. Enter credentials
3. Authenticate
4. Redirect to admin dashboard
5. View statistics
6. Navigate to management section (Grades/Units/Lessons/Answers)
7. Perform CRUD operations
8. Upload files when creating answers
9. Logout

### 6.3 Content Creation Flow
1. Admin creates Grade (e.g., "ثانية إعدادي")
2. Admin creates Units within Grade (e.g., "Unit 1", "Unit 2")
3. Admin creates Lessons within Units (e.g., "Lesson 1")
4. Admin creates Answers for Lessons:
   - Upload PDF/images
   - Or provide YouTube URL
   - Set category type
   - Associate with lesson (if applicable)
5. Content appears on student-facing Answers page
6. Students can filter and access content

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Page load time < 3 seconds on 4G connection
- API response time < 500ms for most endpoints
- File upload support up to 10MB per file
- Optimized images and assets
- Lazy loading for images and components
- Server-side rendering for public pages

### 7.2 Security
- HTTPS enforced (via Netlify)
- Password hashing with bcrypt (10+ rounds)
- JWT session tokens with NextAuth
- CSRF protection
- SQL injection prevention via Prisma ORM
- File upload validation and sanitization
- Admin routes protected by authentication middleware
- Role-based access control

### 7.3 Scalability
- Database connection pooling
- Pagination for large datasets
- CDN for static assets
- Efficient database queries with proper indexing
- File storage in public directory (scalable to cloud storage)

### 7.4 Usability
- Mobile-first responsive design
- Intuitive navigation
- Clear visual hierarchy
- Fast load times
- Accessible forms with validation feedback
- Error messages in Arabic/English
- Consistent UI/UX patterns

### 7.5 Accessibility
- Semantic HTML
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- Sufficient color contrast
- Focus indicators
- Screen reader compatibility

### 7.6 Browser Compatibility
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 7.7 Localization
- Primary language: Arabic
- RTL (Right-to-Left) support
- Arabic date formatting
- English for technical terms where appropriate

---

## 8. Technical Constraints

### 8.1 Technology Requirements
- Node.js 20+
- PostgreSQL database
- Netlify deployment platform
- Modern browser support

### 8.2 Dependencies
- Must use Next.js App Router
- Must use Prisma for database operations
- Must use NextAuth for authentication
- Must use Tailwind CSS for styling

### 8.3 Development Constraints
- TypeScript for type safety
- ESLint for code quality
- Environment variables for configuration
- Git for version control

---

## 9. Future Enhancements

### 9.1 Phase 2 Features
- Interactive quizzes with auto-grading
- Student registration and accounts
- Progress tracking for students
- Assignments submission system
- Notifications system
- Parent portal with student progress
- Payment integration for premium content

### 9.2 Phase 3 Features
- Mobile app (iOS/Android)
- Live video classes integration
- Discussion forums
- Peer-to-peer study groups
- Gamification (badges, points, leaderboards)
- AI-powered recommendations
- Analytics dashboard for insights
- Multi-teacher platform expansion

### 9.3 Technical Improvements
- Cloud file storage (AWS S3, Cloudflare R2)
- Full-text search (Elasticsearch)
- Real-time features (WebSockets)
- Advanced caching strategies
- CDN integration for media files
- Automated testing suite
- CI/CD pipeline
- Performance monitoring
- Error tracking (Sentry)

---

## 10. Success Criteria

### 10.1 Launch Criteria
- [ ] All public sections functional
- [ ] Admin dashboard complete with CRUD operations
- [ ] Authentication system working
- [ ] File upload system operational
- [ ] Answers page with filtering functional
- [ ] Responsive design on all devices
- [ ] Content seeded with sample data
- [ ] Production deployment on Netlify
- [ ] SSL certificate active
- [ ] Database migrations complete

### 10.2 Quality Criteria
- [ ] Zero critical bugs
- [ ] All user flows tested
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Accessibility checks passed
- [ ] Cross-browser testing complete

### 10.3 Business Criteria
- [ ] 100+ students using platform in first month
- [ ] 90% positive user feedback
- [ ] Admin can update content in < 5 minutes
- [ ] 50% reduction in content distribution time
- [ ] Increased student engagement metrics

---

## 11. Risks and Mitigations

### 11.1 Technical Risks
**Risk:** File storage limitations on Netlify  
**Mitigation:** Implement cloud storage solution (S3, R2) if needed; monitor storage usage

**Risk:** Database performance with large datasets  
**Mitigation:** Implement pagination, indexing, and query optimization

**Risk:** File upload security vulnerabilities  
**Mitigation:** Strict file validation, size limits, type checking, sanitization

### 11.2 User Adoption Risks
**Risk:** Low student adoption  
**Mitigation:** Promote platform in classes, make content valuable and easy to access

**Risk:** Admin complexity  
**Mitigation:** Simple, intuitive admin interface; provide training/documentation

### 11.3 Business Risks
**Risk:** Content creation bottleneck  
**Mitigation:** Efficient bulk upload tools; streamlined workflow

**Risk:** Platform downtime  
**Mitigation:** Reliable hosting (Netlify), monitoring, backup strategies

---

## 12. Timeline and Milestones

### Phase 1: MVP (Current)
- ✓ Project setup and architecture
- ✓ Database schema design
- ✓ Authentication implementation
- ✓ Admin dashboard structure
- ⏳ CRUD operations for all entities
- ⏳ File upload system
- ⏳ Public website sections
- ⏳ Answers page with filtering

### Phase 2: Enhancement (Q1 2026)
- Advanced filtering and search
- Performance optimization
- Content organization improvements
- User feedback integration

### Phase 3: Expansion (Q2 2026)
- Interactive quizzes
- Student accounts
- Additional features from future enhancements list

---

## 13. Appendix

### 13.1 Glossary
- **Grade:** Educational level (e.g., First Preparatory, Third Secondary)
- **Unit:** Curriculum unit within a grade level
- **Lesson:** Individual lesson within a unit
- **Answer:** Learning resource (PDF, image, video) for lessons/exercises/exams
- **CRUD:** Create, Read, Update, Delete operations
- **RTL:** Right-to-Left text direction for Arabic

### 13.2 References
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- NextAuth Documentation: https://next-auth.js.org
- Tailwind CSS: https://tailwindcss.com

### 13.3 Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 28, 2026 | - | Initial PRD creation |

---

**Document Owner:** Development Team  
**Last Updated:** January 28, 2026  
**Next Review:** February 28, 2026
