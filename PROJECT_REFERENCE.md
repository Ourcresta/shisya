# OurShiksha - Project Reference

> Generated from live source code on March 14, 2026. Canonical source of truth: `shared/schema.ts`, `server/routes.ts`, `server/guruRoutes.ts`, `server/auth.ts`.

---

## 1. Database Schema Summary

All tables are defined in `shared/schema.ts` using Drizzle ORM with PostgreSQL.

### 1.1 Course Content Tables (Admin manages, SHISHYA reads)

| Table | Purpose | Key Columns |
|---|---|---|
| `courses` | Master course catalog | id, title, description, level, status, isActive, isFree, creditCost, price, zohoId, category |
| `modules` | Sections/chapters within a course | id, courseId (FK courses), title, orderIndex |
| `lessons` | Individual learning units | id, moduleId (FK modules), courseId, title, content, videoUrl, hlsUrl, audioTracks, subtitleTracks, attachments, codeSnippets, isPreview |
| `tests` | Assessments/quizzes | id, courseId, title, durationMinutes, passingPercentage, questions (JSON), maxAttempts |
| `projects` | Hands-on assignments | id, courseId, title, description, difficulty, requirements, resources |
| `labs` | Interactive coding exercises | id, courseId, lessonId, title, instructions, starterCode, expectedOutput, solutionCode, language |

### 1.2 SHISHYA Authentication Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `shishya_users` | Student accounts | id (UUID PK), email, passwordHash, emailVerified, authProvider, authProviderId |
| `shishya_otp_logs` | OTP verification logs | id, userId, destination, otpHash, purpose, attemptCount, expiresAt, consumedAt |
| `shishya_otp_codes` | OTP codes (legacy) | id, userId, otpHash, expiresAt, used, attempts |
| `shishya_sessions` | Active sessions | id (UUID PK), userId, expiresAt |

### 1.3 SHISHYA Profile Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `shishya_user_profiles` | Student profiles | id, userId, fullName, username, bio, profilePhoto, headline, githubUrl, linkedinUrl, portfolioVisible |

### 1.4 SHISHYA Learning Progress Tables

| Table | Purpose |
|---|---|
| `shishya_user_progress` | Lesson completion tracking (userId, courseId, lessonId, completedAt) |
| `shishya_user_lab_progress` | Lab completion tracking |
| `shishya_user_test_attempts` | Test attempt history with scores |
| `shishya_user_project_submissions` | Project submission records (githubUrl, liveUrl) |
| `shishya_user_certificates` | Earned certificates with unique certificateId |
| `shishya_course_enrollments` | Course enrollment records with creditsPaid |

### 1.5 SHISHYA Credits & Wallet Tables

| Table | Purpose |
|---|---|
| `shishya_user_credits` | Credit wallet (balance, totalEarned, totalSpent) |
| `shishya_credit_transactions` | Transaction history (amount, type, reason, balanceAfter) |
| `shishya_vouchers` | Redeemable voucher codes (code, points, bonusPercent, maxUsage) |
| `shishya_voucher_redemptions` | Voucher redemption records |
| `shishya_gift_boxes` | Gift credit boxes (senderId, recipientEmail, points, paymentId, status) |

### 1.6 SHISHYA Notifications

| Table | Purpose |
|---|---|
| `shishya_notifications` | In-app notifications (userId, role, title, message, type, isRead) |

### 1.7 AI Motivation Rules Engine Tables

| Table | Purpose |
|---|---|
| `shishya_motivation_rules` | Configurable rules with conditions/actions (ruleType, conditions, actions, priority, cooldownHours) |
| `shishya_rule_trigger_logs` | Rule execution history for idempotency |
| `shishya_motivation_cards` | Shareable achievement cards |
| `shishya_scholarships` | Rule-based discounts/free access |
| `shishya_user_scholarships` | Scholarships awarded to users |
| `shishya_ai_nudge_logs` | AI motivation messages sent |
| `shishya_mystery_boxes` | Gamification reward boxes |
| `shishya_student_streaks` | Learning streak tracking (currentStreak, longestStreak, totalActiveDays) |

### 1.8 Academic Marksheet Tables

| Table | Purpose |
|---|---|
| `shishya_marksheets` | Official transcripts (marksheetId, grades, CGPA, classification, verificationCode, pdfHash) |
| `shishya_marksheet_verifications` | Verification audit log |

### 1.9 Usha AI Tutor Tables

| Table | Purpose |
|---|---|
| `shishya_usha_conversations` | Conversation sessions (userId, courseId, pageType) |
| `shishya_usha_messages` | Message history (conversationId, role, content, responseType, helpLevel) |

### 1.10 Udyog Virtual Internship Tables

| Table | Purpose |
|---|---|
| `udyog_internships` | Internship definitions (title, skillLevel, domain, milestones) |
| `udyog_batches` | Cohort batches per internship |
| `udyog_batch_members` | Members of a batch with scores |
| `udyog_assignments` | Student-internship assignments |
| `udyog_tasks` | Individual tasks within an internship |
| `udyog_subtasks` | Subtasks within a task |
| `udyog_submissions` | Task submissions with AI feedback |
| `udyog_certificates` | Internship completion certificates |
| `udyog_skill_assessments` | Skill assessment records |

### 1.11 Udyog HR Hiring System Tables

| Table | Purpose |
|---|---|
| `udyog_hr_users` | HR/employer accounts (email, companyName, isApproved) |
| `udyog_jobs` | Job postings (title, requiredSkills, internshipRequired) |
| `udyog_applications` | Student job applications (matchingScore, status) |

### 1.12 GURU Admin Tables

| Table | Purpose |
|---|---|
| `guru_admin_users` | Admin accounts (email, passwordHash, name, role) |
| `guru_admin_sessions` | Admin sessions |
| `zoho_tokens` | Zoho OAuth tokens (accessToken, refreshToken, expiresAt) |

### 1.13 Platform Config Tables

| Table | Purpose |
|---|---|
| `pricing_plans` | Pricing tier definitions (name, price, features, coins, popular) |
| `credit_packs` | Purchasable credit bundles (name, price, points, bonusPercent) |
| `site_pages` | CMS-editable marketing pages (slug PK, title, content JSONB) |

---

## 2. GURU Admin Control Panel

The GURU admin panel is a separate SPA section (`/guru/*`) with its own authentication. All GURU API routes are protected by `requireGuruAuth` middleware.

### 2.1 Dashboard
- `GET /api/guru/dashboard/stats` - Aggregate counts (courses, modules, lessons, tests, projects, labs, students, enrollments, credits distributed)
- `GET /api/guru/dashboard/recent-courses` - Latest 6 courses

### 2.2 Course Management (Full CRUD)
- `GET /api/guru/courses` - List all courses
- `GET /api/guru/courses/:id` - Get single course
- `POST /api/guru/courses` - Create course (draft)
- `PUT /api/guru/courses/:id` - Update course
- `POST /api/guru/courses/:id/publish` - Publish course
- `POST /api/guru/courses/:id/unpublish` - Unpublish course
- `DELETE /api/guru/courses/:id` - Delete course (cascades modules, lessons, labs, tests, projects)

### 2.3 Module, Lesson, Test, Lab, Project CRUD
- Modules: `GET /api/guru/courses/:courseId/modules` (list with lessons), `POST /api/guru/modules`, `PUT /api/guru/modules/:id`, `DELETE /api/guru/modules/:id`
- Lessons: `POST /api/guru/lessons`, `PUT /api/guru/lessons/:id`, `DELETE /api/guru/lessons/:id`
- Tests: `GET /api/guru/tests` (all), `GET /api/guru/tests/:id`, `POST /api/guru/tests`, `PUT /api/guru/tests/:id`, `DELETE /api/guru/tests/:id`
- Labs: `GET /api/guru/labs` (all), `GET /api/guru/courses/:courseId/labs`, `POST /api/guru/labs`, `PUT /api/guru/labs/:id`, `DELETE /api/guru/labs/:id`
- Projects: `GET /api/guru/projects` (all), `GET /api/guru/courses/:courseId/projects`, `POST /api/guru/projects`, `PUT /api/guru/projects/:id`, `DELETE /api/guru/projects/:id`

### 2.4 Student Management
- `GET /api/guru/students` - List students with profiles, credits, enrollment counts (searchable)
- `GET /api/guru/students/:id` - Full student detail (profile, credits, enrollments, progress, test attempts, project submissions, certificates)

### 2.5 Credit Management
- `GET /api/guru/credits` - List all credit wallets
- `GET /api/guru/credits/transactions` - Recent 100 transactions
- `POST /api/guru/credits/grant` - Grant credits to a user
- `POST /api/guru/credits/deduct` - Deduct credits from a user

### 2.6 AI Content Generation
- `POST /api/guru/ai/generate-test` - AI-generated MCQ tests (gpt-4.1-mini)
- `POST /api/guru/ai/generate-project` - AI-generated structured projects (gpt-4.1)
- `POST /api/guru/ai/generate-lab` - AI-generated coding labs (gpt-4.1-mini)

### 2.7 Pricing & CMS Management
- `GET/POST/PUT/DELETE /api/guru/pricing-plans` - Pricing plan CRUD
- `GET /api/guru/credit-packs` - List credit packs
- `POST /api/guru/credit-packs` - Create credit pack
- `PUT /api/guru/credit-packs/:id` - Update credit pack
- `DELETE /api/guru/credit-packs/:id` - Delete credit pack
- `GET /api/guru/pages` - List all CMS pages
- `GET /api/guru/pages/:slug` - Get single CMS page
- `PUT /api/guru/pages/:slug` - Update CMS page content

### 2.8 Zoho TrainerCentral Integration
- `GET /api/guru/settings/integrations` - Integration status (Zoho, AISiksha, Resend)
- `GET /api/guru/zoho/authorize` - Get Zoho OAuth URL
- `POST /api/guru/zoho/test-connection` - Test Zoho connection
- `POST /api/guru/zoho/sync` - Sync courses from TrainerCentral
- `POST /api/guru/zoho/disconnect` - Disconnect Zoho
- `GET /api/guru/zoho/learners` - List TrainerCentral learners

---

## 3. Key API Route Index

### 3.1 Authentication (`/api/auth` - `server/auth.ts`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create account, send OTP |
| POST | `/api/auth/verify-otp` | Public | Verify OTP, create session, grant welcome bonus |
| POST | `/api/auth/login` | Public | Login with email/password |
| POST | `/api/auth/logout` | Cookie | Clear session |
| GET | `/api/auth/me` | Cookie | Get current user + profile |
| POST | `/api/auth/resend-otp` | Public | Resend signup OTP (rate-limited) |
| POST | `/api/auth/send-otp` | Public | Send OTP for any purpose (signup, login, forgot_password, verify_email) |

### 3.2 OAuth (`/api/oauth` - `server/oauth.ts`)
- Google OAuth and SSO login flows

### 3.3 GURU Admin Auth (`/api/guru/auth` - `server/guruAuth.ts`)
- Separate auth system for admin users with `guru_session` cookie

### 3.4 Public Course Routes (`server/routes.ts`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/courses` | List published courses (merges external + DB) |
| GET | `/api/courses/:courseId` | Single published course |
| GET | `/api/courses/:courseId/modules` | Course modules |
| GET | `/api/courses/:courseId/modules-with-lessons` | Modules with nested lessons |
| GET | `/api/modules/:moduleId/lessons` | Lessons for a module |
| GET | `/api/lessons/:lessonId` | Single lesson with parsed JSON fields |
| GET | `/api/lessons/:lessonId/notes` | AI-generated lesson notes |
| GET | `/api/courses/:courseId/projects` | Course projects |
| GET | `/api/projects/:projectId` | Single project |
| POST | `/api/projects/:projectId/submissions` | Submit project |
| GET | `/api/courses/:courseId/tests` | Course tests (summary, no answers) |
| GET | `/api/tests/:testId` | Single test (answers stripped) |
| POST | `/api/tests/:testId/submit` | Submit test answers, get score |
| GET | `/api/courses/:courseId/labs` | Course labs |
| GET | `/api/labs/:labId` | Single lab |

### 3.5 Credits & Enrollment (`/api/user/credits` - `server/credits.ts`)
- Credit wallet operations, course enrollment via credits

### 3.6 Payments (`/api/payments` - `server/razorpayPayments.ts`)
- Razorpay payment integration for credit pack purchases

### 3.7 Notifications (`/api/notifications` - `server/notifications.ts`)
- In-app notification management

### 3.8 Usha AI Tutor (`server/usha.ts`)
- Context-aware AI tutoring with conversation history

### 3.9 Motivation Engine (`server/motivationRoutes.ts`)
- Rule evaluation, streaks, nudges, mystery boxes, motivation cards

### 3.10 Marksheet Routes (`server/routes.ts`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/marksheet/generate` | Required | Generate academic marksheet |
| GET | `/api/marksheet` | Required | Get user's marksheet |
| GET | `/api/marksheet/verify/:code` | Public | Public verification |
| GET | `/api/marksheet/by-id/:marksheetId` | Public | Public marksheet lookup |

### 3.11 Udyog Virtual Internship (`/api/udyog` - `server/udyogRoutes.ts`)
- Internship CRUD, AI builder, task management, submissions, certificates

### 3.12 Media & Video Proxy (`server/routes.ts`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/video-proxy` | Stream R2 video through server (supports Range requests) |
| GET | `/api/hls-proxy` | Rewrite HLS manifests to proxy segments |

### 3.13 Utility Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/username/check/:username` | Check username availability with suggestions |
| GET | `/api/config/public` | Public config (support email, company info) |
| POST | `/api/contact` | Contact form email via Resend |
| GET | `/api/credit-packs` | Public active credit packs |
| GET | `/api/pages/:slug` | CMS page content |
| GET | `/api/pricing-plans` | Active pricing plans |
| GET | `/api/tc/verify/course-progress/:courseId` | TrainerCentral progress verification |
| GET | `/api/tc/verify/certificate-eligibility/:courseId` | TrainerCentral certificate check |

---

## 4. Authentication Flow

### 4.1 SHISHYA (Student) Auth
1. **Signup**: `POST /api/auth/signup` -> creates user with hashed password (bcrypt, 12 rounds) -> sends 6-digit OTP via Resend email
2. **Verify OTP**: `POST /api/auth/verify-otp` -> marks email verified -> grants 500 welcome bonus credits -> creates 7-day session -> sets `shishya_session` HTTP-only cookie -> optionally registers on TrainerCentral
3. **Login**: `POST /api/auth/login` -> validates password -> requires verified email -> creates session cookie
4. **Session Check**: `GET /api/auth/me` -> validates cookie -> returns user + profile
5. **OAuth**: Google OAuth via `/api/oauth` routes (alternative to email/password)
6. **OTP Purposes**: signup, login, forgot_password, verify_email
7. **Rate Limiting**: Resend cooldown enforced per email address

### 4.2 GURU (Admin) Auth
- Separate auth system in `server/guruAuth.ts`
- Uses `guru_session` cookie
- Protected by `requireGuruAuth` middleware
- Seeded admin user created on startup via `server/seedGuru.ts`

---

## 5. Environment Variables & External Integrations

### 5.1 Required Environment Variables

| Variable | Service | Purpose |
|---|---|---|
| `DATABASE_URL` | PostgreSQL | Database connection string |
| `OPENAI_API_KEY` | OpenAI | Usha AI Tutor & AI content generation |
| `RESEND_API_KEY` | Resend | OTP & contact form emails |
| `RAZORPAY_KEY_ID` | Razorpay | Payment processing |
| `RAZORPAY_KEY_SECRET` | Razorpay | Payment processing |

### 5.2 Optional Environment Variables

| Variable | Service | Purpose |
|---|---|---|
| `AISIKSHA_ADMIN_URL` | AISiksha Admin | External course data source |
| `AISIKSHA_API_KEY` | AISiksha Admin | API authentication |
| `ZOHO_CLIENT_ID` | Zoho TrainerCentral | OAuth integration |
| `ZOHO_CLIENT_SECRET` | Zoho TrainerCentral | OAuth integration |
| `ZOHO_ORG_ID` | Zoho TrainerCentral | Organization identifier |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Cloudflare R2 | Video storage |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Cloudflare R2 | Video storage |
| `CLOUDFLARE_R2_BUCKET` | Cloudflare R2 | Bucket name |
| `CLOUDFLARE_R2_PUBLIC_URL` | Cloudflare R2 | Public access URL |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare R2 | Account identifier |
| `GOOGLE_CLIENT_ID` | Google OAuth | Social login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Social login |
| `STRIPE_SECRET_KEY` | Stripe | Payment processing (integration installed) |
| `SUPPORT_EMAIL` | Config | Contact form recipient (default: support@ourshiksha.com) |
| `PRIVACY_EMAIL` | Config | Privacy policy email |
| `LEGAL_EMAIL` | Config | Legal contact email |
| `COMPANY_LOCATION` | Config | Company address display |
| `GURU_ADMIN_EMAIL` | Seeding | Default admin email |
| `GURU_ADMIN_PASSWORD` | Seeding | Default admin password |

### 5.3 Installed Integrations (Replit)
- **Resend** (v1.0.0) - Email delivery
- **OpenAI AI Integrations** (v2.0.0) - AI model access
- **Stripe** (v2.0.0) - Payment processing

### 5.4 External Service Dependencies
- **PostgreSQL** - Primary database (Drizzle ORM)
- **OpenAI** - gpt-4.1-mini (Usha tutor, test/lab generation), gpt-4.1 (project generation)
- **Resend** - Transactional email (OTPs, contact form)
- **Razorpay** - Payment gateway (INR)
- **Zoho TrainerCentral** - Course/learner sync (optional)
- **Cloudflare R2** - Video & asset storage with HLS streaming
- **AISiksha Admin** - External course content API (falls back to mock data)
