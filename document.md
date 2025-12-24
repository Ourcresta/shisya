# SHISHYA - Student Portal Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [All Pages & Tabs](#all-pages--tabs)
5. [Authentication System](#authentication-system)
6. [Credit System & Wallet](#credit-system--wallet)
7. [Payment Integration (Razorpay)](#payment-integration-razorpay)
8. [Course System](#course-system)
9. [Learning Features](#learning-features)
10. [Certificate System](#certificate-system)
11. [Marksheet System](#marksheet-system)
12. [Mithra AI Tutor](#mithra-ai-tutor)
13. [Notification System](#notification-system)
14. [Profile & Portfolio](#profile--portfolio)
15. [Admin Portal Integration](#admin-portal-integration)
16. [Complete API Documentation](#complete-api-documentation)
17. [Database Schema](#database-schema)
18. [Environment Variables](#environment-variables)
19. [Scenarios & Edge Cases](#scenarios--edge-cases)
20. [Security Considerations](#security-considerations)
21. [Deployment Guide](#deployment-guide)

---

## Overview

SHISHYA is the learner-facing portal of the **OurShiksha** educational platform. It provides students with a comprehensive learning experience including:

- Course browsing and enrollment
- Lesson viewing with progress tracking
- Guided JavaScript labs with sandboxed execution
- Timed tests with server-side scoring
- Project submissions for evaluation
- AI-powered tutoring (Mithra)
- Digital certificates with QR verification
- Academic marksheet with CGPA calculation
- Credit-based monetization system
- Razorpay payment gateway integration
- Real-time notification system
- Public portfolio for recruiters

**Platform Hierarchy:**
```
OurShiksha (Platform)
├── Course Factory (Admin Portal) - Course creation and management
└── SHISHYA (Student Portal) - Course consumption and learning
```

**Data Flow:**
```
Admin Portal (Course Factory) ──[API]──> SHISHYA Backend ──[API]──> SHISHYA Frontend
                                              │
                                              ▼
                                    PostgreSQL Database
                                    (Users, Credits, Sessions)
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + TypeScript | UI components and logic |
| Build Tool | Vite | Fast development and bundling |
| Styling | Tailwind CSS + Shadcn UI | Modern, accessible UI |
| Animations | Framer Motion | Smooth micro-animations |
| State | TanStack React Query | Server state management |
| Routing | Wouter | Lightweight client routing |
| Backend | Express.js + TypeScript | API server |
| Database | PostgreSQL (Neon) | Persistent data storage |
| ORM | Drizzle ORM | Type-safe database queries |
| Auth | express-session + bcrypt | Session-based authentication |
| Email | Resend API | Transactional emails (OTP) |
| AI | OpenAI GPT-4.1-mini | Mithra AI Tutor |
| Payments | Razorpay | Credit purchases |
| PDF | html2canvas + jsPDF | Certificate/Marksheet generation |
| QR | qrcode.react | Certificate verification QR codes |

---

## Project Architecture

```
shishya/
├── client/                         # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # Shadcn UI primitives (button, card, etc.)
│   │   │   ├── layout/            # Header, Footer, NotificationBell
│   │   │   ├── landing/           # Landing page sections
│   │   │   ├── mithra/            # AI Tutor components
│   │   │   ├── test/              # Test-related components
│   │   │   └── modals/            # Dialog modals
│   │   ├── pages/                 # Route page components
│   │   │   ├── Dashboard.tsx      # Student home dashboard
│   │   │   ├── MyLearnings.tsx    # Enrolled courses view
│   │   │   ├── Courses.tsx        # Course catalog
│   │   │   ├── CourseOverview.tsx # Course details
│   │   │   ├── LessonViewer.tsx   # Lesson content player
│   │   │   ├── LabViewer.tsx      # Guided lab environment
│   │   │   ├── TestPrep.tsx       # Test preparation page
│   │   │   ├── TestAttempt.tsx    # Active test taking
│   │   │   ├── TestResult.tsx     # Test results display
│   │   │   ├── ProjectPage.tsx    # Project submission
│   │   │   ├── Certificates.tsx   # Certificates dashboard
│   │   │   ├── CertificateViewer.tsx  # Single certificate
│   │   │   ├── Marksheet.tsx      # Academic marksheet
│   │   │   ├── Wallet.tsx         # Credit management
│   │   │   ├── Profile.tsx        # User profile
│   │   │   ├── PortfolioPreview.tsx   # Portfolio preview
│   │   │   ├── PublicPortfolio.tsx    # Public portfolio
│   │   │   ├── Pricing.tsx        # Pricing plans page
│   │   │   └── Landing.tsx        # Homepage
│   │   ├── auth/                  # Auth pages (Login, Signup, VerifyOTP)
│   │   ├── contexts/              # React contexts
│   │   │   ├── AuthContext.tsx    # Authentication state
│   │   │   ├── CreditContext.tsx  # Credit balance state
│   │   │   ├── ThemeContext.tsx   # Theme management
│   │   │   └── NotificationContext.tsx  # Notifications
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Utilities
│   │   │   ├── queryClient.ts     # API client configuration
│   │   │   ├── animations.ts      # Framer Motion variants
│   │   │   └── progressStorage.ts # LocalStorage helpers
│   │   └── App.tsx                # Main app with routing
│   └── index.html
├── server/                        # Backend Express application
│   ├── index.ts                   # Server entry point
│   ├── routes.ts                  # All API route definitions
│   ├── auth.ts                    # Authentication logic
│   ├── mithra.ts                  # Mithra AI Tutor backend
│   ├── razorpayPayments.ts        # Razorpay payment handling
│   ├── storage.ts                 # Database operations (IStorage)
│   ├── db.ts                      # Database connection
│   └── vite.ts                    # Vite dev server integration
├── shared/                        # Shared between frontend/backend
│   └── schema.ts                  # Drizzle schema definitions
├── design_guidelines.md           # UI/UX design system
├── document.md                    # This documentation
├── replit.md                      # Project summary for AI
└── env.example                    # Environment variables template
```

---

## All Pages & Tabs

### Public Pages (No Authentication Required)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Homepage with Hero, Learning Journey, Features, Course Preview, CTA, Footer |
| `/login` | Login | Email/password authentication form |
| `/signup` | Signup | New user registration form |
| `/verify-otp` | Verify OTP | Email verification with 6-digit code |
| `/courses` | Courses | Browse all published courses (catalog) |
| `/courses/:id` | Course Overview | Course details, modules, enrollment |
| `/pricing` | Pricing | Subscription plans and coin pricing |
| `/verify/certificate/:id` | Certificate Verify | Public certificate verification |
| `/verify/marksheet/:id` | Marksheet Verify | Public marksheet verification |
| `/portfolio/:username` | Public Portfolio | Shareable student portfolio |
| `/profile/:username` | Public Portfolio | Alternate portfolio URL |

### Protected Pages (Authentication Required - `/shishya/*`)

| Route | Page | Tab/Zone | Description |
|-------|------|----------|-------------|
| `/shishya/dashboard` | Dashboard | Home | 5-zone student dashboard with stats |
| `/shishya/my-learnings` | My Learnings | Courses | Enrolled courses with progress |
| `/shishya/learn/:courseId/:lessonId` | Lesson Viewer | Learning | Video/text lesson content |
| `/shishya/lab/:courseId/:labId` | Lab Viewer | Learning | Interactive JavaScript labs |
| `/shishya/tests` | Tests List | Tests | All tests from all enrolled courses |
| `/shishya/tests/:courseId/:testId` | Test Prep | Tests | Test info before attempting |
| `/shishya/tests/:courseId/:testId/attempt` | Test Attempt | Tests | Active timed test taking |
| `/shishya/tests/:courseId/:testId/result` | Test Result | Tests | Score and review |
| `/shishya/projects` | Projects List | Projects | All projects from enrolled courses |
| `/shishya/projects/:courseId` | Project Page | Projects | Project details and submission |
| `/shishya/certificates` | Certificates | Achievements | All earned certificates |
| `/shishya/certificates/:id` | Certificate Viewer | Achievements | Single certificate with PDF download |
| `/shishya/marksheet` | Marksheet | Achievements | Academic grade sheet with CGPA |
| `/shishya/wallet` | Wallet | Account | Credit balance, purchases, vouchers |
| `/shishya/profile` | Profile | Account | Edit personal information |
| `/shishya/profile/portfolio-preview` | Portfolio Preview | Account | Preview public portfolio |

### Dashboard 5-Zone Structure

| Zone | Name | Contents |
|------|------|----------|
| Zone 1 | Welcome & Status | Personalized greeting, Learning Status Badge (Beginner/Intermediate/Advanced), Quick Links |
| Zone 2 | Learning Snapshot | 5 clickable metric cards: Credits, In Progress, Completed, Certificates, Tests Passed |
| Zone 3 | Primary Action | Smart CTA: Continue Learning / Start Learning / Complete Pending Actions |
| Zone 4 | Pending Actions | Tests to take, projects to submit (checklist style) |
| Zone 5 | Achievements | Recent certificates, skills gained from courses |

---

## Authentication System

### Registration Flow

```
1. User visits /signup
2. Enters: Full Name, Email, Password
3. Backend: Creates user with hashed password (bcrypt 12 rounds)
4. Backend: Generates 6-digit OTP, hashes with SHA256, stores in DB
5. Backend: Sends OTP via Resend email
6. Frontend: Redirects to /verify-otp
7. User: Enters OTP
8. Backend: Verifies OTP, marks email_verified = true
9. Backend: Grants 500 welcome credits
10. Backend: Creates session, sets HTTP-only cookie
11. Frontend: Redirects to /shishya/dashboard
```

### Login Flow

```
1. User visits /login
2. Enters: Email, Password
3. Backend: Finds user by email
4. Backend: Compares password with bcrypt
5. Backend: Checks email_verified = true
6. Backend: Creates session, sets HTTP-only cookie
7. Frontend: Redirects to /shishya/dashboard
```

### Security Specifications

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with 12 salt rounds |
| OTP Hashing | SHA256 |
| OTP Expiry | 10 minutes |
| OTP Length | 6 digits |
| Session Storage | PostgreSQL (connect-pg-simple) |
| Session Cookie | HTTP-only, Secure in production, 30-day expiry |
| CSRF | SameSite=Lax cookie attribute |

---

## Credit System & Wallet

### Credit Economy

| Action | Credit Cost |
|--------|-------------|
| AI Mithra Query | 5 coins |
| Practice Lab Attempt | 20 coins |
| Test Attempt | 30 coins |
| Project Submission | 50 coins |
| Certificate Generation | 100 coins |
| Course Enrollment (Free) | 0 coins |
| Course Enrollment (Paid) | Varies per course |

### Credit Acquisition

| Method | Credits | Cost |
|--------|---------|------|
| Welcome Bonus | 500 | Free (one-time on signup) |
| Basic Subscription | 2,000/month | ₹199/month |
| Pro Subscription | 6,000/month | ₹499/month |
| Elite Subscription | 15,000/month | ₹999/month |
| Coin Packs | 100-10,000 | ₹10-₹800 |
| Voucher Redemption | Varies | Free |
| Daily Login Bonus | 10 | Free |
| Gift Box Mystery | 5-500 | Free (random) |

### Wallet Features

1. **Balance Display**: Current credit balance with coin icon
2. **Buy Coins**: Coin packs with Razorpay payment
3. **Redeem Voucher**: Enter voucher code for free credits
4. **Gift Box**: Daily mystery box with random credits
5. **Transaction History**: All credit transactions with timestamps

### Database Tables

```sql
-- User credit balance
CREATE TABLE user_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE,
  balance INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Credit transactions
CREATE TABLE credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  reference_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Voucher codes
CREATE TABLE vouchers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  credits INTEGER NOT NULL,
  max_uses INTEGER DEFAULT 1,
  uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Payment Integration (Razorpay)

### Configuration

| Setting | Value |
|---------|-------|
| Provider | Razorpay |
| Currency | INR |
| Payment Methods | UPI, Cards, NetBanking, Wallets (Google Pay, Paytm) |
| Webhook | `/api/payments/webhook` |

### Payment Flow

```
1. User selects coin pack on /shishya/wallet
2. Frontend: Calls POST /api/payments/create-order
3. Backend: Creates Razorpay order
4. Frontend: Opens Razorpay checkout modal
5. User: Completes payment (UPI/Card/NetBanking)
6. Razorpay: Sends success callback
7. Frontend: Calls POST /api/payments/verify
8. Backend: Verifies signature with Razorpay secret
9. Backend: Credits user account
10. Backend: Creates credit_transaction record
11. Frontend: Shows success message, updates balance
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment and credit |
| POST | `/api/payments/webhook` | Razorpay webhook handler |

### Required Secrets

```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
```

### Error Handling

| Scenario | Response |
|----------|----------|
| Payment failed | Show error, no credits deducted |
| Webhook failure | Retry with exponential backoff |
| Duplicate payment | Idempotent, only credit once |
| Signature mismatch | Reject, log security alert |

---

## Course System

### Course Structure

```
Course
├── Modules (ordered list)
│   ├── Lessons (video/text content)
│   │   └── Content (HTML/markdown)
│   └── Labs (JavaScript exercises)
│       ├── Instructions
│       ├── Starter Code
│       └── Expected Output
├── Tests
│   ├── Questions (MCQ/coding)
│   ├── Time Limit
│   └── Passing Percentage
├── Projects
│   ├── Description
│   ├── Requirements
│   └── Submission Form
└── Certificates
    ├── Template
    └── Requirements
```

### Course States

| State | Description | Visible To |
|-------|-------------|------------|
| Draft | Work in progress | Admin only |
| Published | Live and accessible | All students |
| Archived | No longer active | Enrolled students only |

### Enrollment Logic

```
1. User views course at /courses/:id
2. If course.isFree OR user has sufficient credits:
   - Show "Enroll" button
3. User clicks Enroll:
   - Deduct credits (if paid course)
   - Create course_enrollments record
   - Redirect to first lesson
4. Already enrolled:
   - Show "Continue Learning" button
```

---

## Learning Features

### Lesson Viewer

- **Video Lessons**: Embedded video player with progress tracking
- **Text Lessons**: Rendered markdown/HTML content
- **Navigation**: Previous/Next lesson buttons
- **Progress**: Mark as complete (stored in localStorage)
- **Mithra AI**: Floating help button for questions

### Guided Labs

- **Sandboxed Execution**: JavaScript runs in isolated iframe
- **Code Editor**: Syntax highlighted textarea
- **Run Button**: Execute code and show output
- **Validation**: Compare output with expected result
- **Persistence**: Code saved to localStorage
- **Unlock Logic**: Labs unlock after completing prerequisite lessons

### Progress Storage (LocalStorage)

```javascript
// Key format
`shishya_progress_${userId}_${courseId}` = {
  lessonsCompleted: ["lesson-1", "lesson-2"],
  labsCompleted: ["lab-1"],
  testsCompleted: { "test-1": { score: 85, passed: true } },
  projectsSubmitted: ["project-1"],
  certificateGenerated: true,
  lastAccessed: "2024-12-24T10:00:00Z"
}
```

---

## Certificate System

### Generation Requirements

```
To generate a certificate, student must:
1. Complete all lessons in the course (100%)
2. Pass the course test (score >= passingPercentage)
3. Submit the course project (if required)
4. Have sufficient credits (100 coins)
```

### Certificate Data

| Field | Description |
|-------|-------------|
| Certificate ID | Unique UUID |
| Student Name | From user profile |
| Course Name | From course data |
| Completion Date | When requirements met |
| Score | Test percentage |
| Skills | Skills from course metadata |
| QR Code | Links to verification page |

### PDF Generation (Client-Side)

```javascript
// Using html2canvas + jsPDF
1. Render certificate HTML in hidden div
2. Capture as canvas with html2canvas
3. Convert to PDF with jsPDF
4. Download as certificate.pdf
```

### Public Verification

- **URL**: `/verify/certificate/:certificateId`
- **Display**: Student name, course, date, skills
- **Branding**: OurShiksha logo and verification badge

---

## Marksheet System

### Academic Marksheet Features

- **University-Style Format**: Modeled after academic transcripts
- **Marksheet ID**: Unique identifier for verification
- **QR Code**: Links to public verification page
- **Student Details**: Name, email, enrollment date
- **Course Grades**: All completed courses with scores

### Grade Calculation

| Score Range | Grade | Points |
|-------------|-------|--------|
| 90-100 | O (Outstanding) | 10 |
| 80-89 | A+ (Excellent) | 9 |
| 70-79 | A (Very Good) | 8 |
| 60-69 | B+ (Good) | 7 |
| 50-59 | B (Above Average) | 6 |
| 40-49 | C (Average) | 5 |
| <40 | F (Fail) | 0 |

### CGPA Calculation

```
CGPA = Σ(Course Credits × Grade Points) / Σ(Course Credits)
```

### Classification

| CGPA Range | Classification |
|------------|----------------|
| 8.0-10.0 | Distinction |
| 6.0-7.99 | First Class |
| 5.0-5.99 | Second Class |
| <5.0 | Pass |

### Public Verification

- **URL**: `/verify/marksheet/:marksheetId`
- **Display**: Student details, all courses, CGPA, classification

---

## Mithra AI Tutor

### Philosophy

Mithra is a Socratic AI tutor that **never gives direct answers**. Instead, it:
- Asks guiding questions
- Provides hints and explanations
- Encourages critical thinking
- Adapts to student's level

### Technical Specifications

| Setting | Value |
|---------|-------|
| Model | OpenAI GPT-4.1-mini |
| Temperature | 0.3 (focused responses) |
| Max Tokens | 400 |
| Rate Limit | 10 requests/minute/student |
| Session Memory | Last 6 conversation turns |
| Credit Cost | 5 coins per query |

### Page Availability

| Page | Mithra | Reason |
|------|--------|--------|
| Lesson | Enabled | Help understand content |
| Lab | Enabled | Debugging assistance |
| Project | Enabled | Guidance on approach |
| Test Prep | Enabled | Concept clarification |
| Active Test | **Disabled** | Prevent cheating |
| Dashboard | Disabled | No learning context |
| Landing | Not shown | Pre-auth page |

### Response Types

| Type | Icon | Use Case |
|------|------|----------|
| Explanation | 📖 | Concept breakdowns |
| Hint | 💡 | Nudges toward solution |
| Guidance | 🧭 | Step-by-step direction |
| Notice | ⚠️ | Important warnings |

### Help Levels

| Level | Description |
|-------|-------------|
| Beginner | More scaffolding, simpler language |
| Intermediate | Balanced guidance |
| Advanced | Minimal hints, encourages exploration |

---

## Notification System

### Architecture

```
Frontend (NotificationBell)
  │
  ├── Polls every 30 seconds
  │
  └── GET /api/notifications ──> Backend ──> PostgreSQL
```

### Notification Types

| Type | Icon | Example |
|------|------|---------|
| enrollment | 📚 | "You enrolled in Web Development" |
| test_result | ✅/❌ | "You passed JavaScript Test" |
| certificate | 🏆 | "Certificate generated for React" |
| credit | 💰 | "500 welcome credits added" |
| system | 🔔 | "New course available" |

### API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | Fetch unread notifications |
| POST | `/api/notifications/:id/read` | Mark as read |
| POST | `/api/notifications/read-all` | Mark all as read |

### Database Table

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Profile & Portfolio

### Private Profile (`/shishya/profile`)

- **Editable Fields**: Name, bio, location, LinkedIn, GitHub, website
- **Profile Photo**: Upload with camera icon overlay (stored as base64 in localStorage)
- **Learning Stats**: Courses, certificates, total hours
- **View Portfolio**: Button to preview public portfolio

### Profile Photo Upload

```
1. User hovers avatar on profile page
2. Camera icon appears as overlay
3. User clicks, file picker opens
4. User selects image (max 2MB)
5. Image resized client-side
6. Stored as base64 in localStorage
7. Displayed across all pages
```

### Public Portfolio (`/portfolio/:username`)

- **Verified Badge**: OurShiksha verified checkmark
- **About Section**: Bio and social links
- **Skills**: Aggregated from all completed courses
- **Certificates**: Visual certificate cards
- **Projects**: Submitted projects with descriptions
- **Stats**: Courses completed, certificates earned

---

## Admin Portal Integration

### Connection Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    OurShiksha Admin Course Factory              │
│                 (https://course-factory.repl.co)                │
├─────────────────────────────────────────────────────────────────┤
│  Endpoints:                                                      │
│  - GET /api/public/courses                                       │
│  - GET /api/public/courses/:id                                   │
│  - GET /api/public/courses/:id/modules                          │
│  - GET /api/public/courses/:id/lessons/:lessonId                │
│  - GET /api/public/courses/:id/labs                             │
│  - GET /api/public/courses/:id/tests                            │
│  - GET /api/public/courses/:id/tests/:testId                    │
│  - POST /api/public/courses/:id/tests/:testId/submit            │
│  - GET /api/public/courses/:id/projects                         │
│  - POST /api/public/courses/:id/projects/:projectId/submit      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS + API Key Header
                            │ X-API-Key: ${AISIKSHA_API_KEY}
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SHISHYA Backend                            │
│                   (Express.js Proxy Layer)                       │
├─────────────────────────────────────────────────────────────────┤
│  - Authenticates requests with API key                          │
│  - Caches course data (optional)                                │
│  - Adds user context to submissions                             │
│  - Handles errors gracefully                                    │
│  - Falls back to mock data if Admin unavailable                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Session Cookie Auth
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SHISHYA Frontend                           │
│                     (React Application)                          │
├─────────────────────────────────────────────────────────────────┤
│  - Displays courses, lessons, labs, tests                       │
│  - Tracks progress locally (localStorage)                       │
│  - Submits tests and projects                                   │
│  - Generates certificates client-side                           │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Fetching from Admin

```
┌─────────────┐    ┌───────────────┐    ┌──────────────────┐
│  Frontend   │    │ SHISHYA API   │    │   Admin Portal   │
└──────┬──────┘    └───────┬───────┘    └────────┬─────────┘
       │                   │                      │
       │ GET /api/courses  │                      │
       │──────────────────>│                      │
       │                   │                      │
       │                   │ GET /api/public/courses
       │                   │ + X-API-Key header   │
       │                   │─────────────────────>│
       │                   │                      │
       │                   │    JSON Response     │
       │                   │<─────────────────────│
       │                   │                      │
       │  Filtered Response│                      │
       │<──────────────────│                      │
       │                   │                      │
```

### Data Flow: Submitting to Admin (Tests)

```
┌─────────────┐    ┌───────────────┐    ┌──────────────────┐
│  Frontend   │    │ SHISHYA API   │    │   Admin Portal   │
└──────┬──────┘    └───────┬───────┘    └────────┬─────────┘
       │                   │                      │
       │ POST /api/courses/:id/tests/:testId/submit
       │ { answers: [...] }│                      │
       │──────────────────>│                      │
       │                   │                      │
       │                   │ Validate user session│
       │                   │                      │
       │                   │ POST /api/public/...  │
       │                   │ { answers, userId }   │
       │                   │─────────────────────>│
       │                   │                      │
       │                   │   { score, passed }   │
       │                   │<─────────────────────│
       │                   │                      │
       │                   │ Store in DB           │
       │                   │ Deduct credits        │
       │                   │                      │
       │   Result Response │                      │
       │<──────────────────│                      │
       │                   │                      │
```

### Data Flow: Submitting to Admin (Projects)

```
┌─────────────┐    ┌───────────────┐    ┌──────────────────┐
│  Frontend   │    │ SHISHYA API   │    │   Admin Portal   │
└──────┬──────┘    └───────┬───────┘    └────────┬─────────┘
       │                   │                      │
       │ POST /api/courses/:id/projects/:projectId/submit
       │ { githubUrl, liveUrl, description }      │
       │──────────────────>│                      │
       │                   │                      │
       │                   │ Validate user session│
       │                   │                      │
       │                   │ POST /api/public/...  │
       │                   │ + submission data     │
       │                   │─────────────────────>│
       │                   │                      │
       │                   │   { submitted: true } │
       │                   │<─────────────────────│
       │                   │                      │
       │                   │ Deduct credits (50)   │
       │                   │ Create notification   │
       │                   │                      │
       │   Success Response│                      │
       │<──────────────────│                      │
       │                   │                      │
```

### Admin API Authentication

```javascript
// server/routes.ts
const ADMIN_API_URL = process.env.AISIKSHA_ADMIN_URL;
const ADMIN_API_KEY = process.env.AISIKSHA_API_KEY;

async function fetchFromAdmin(endpoint: string) {
  const response = await fetch(`${ADMIN_API_URL}${endpoint}`, {
    headers: {
      'X-API-Key': ADMIN_API_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Admin API error: ${response.status}`);
  }
  
  return response.json();
}
```

### Error Handling & Fallback

```javascript
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await fetchFromAdmin('/api/public/courses');
    res.json(courses);
  } catch (error) {
    console.error('Admin API unavailable, using mock data');
    res.json(MOCK_COURSES); // Fallback to mock data
  }
});
```

---

## Complete API Documentation

### Authentication APIs

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|--------------|----------|
| POST | `/api/auth/signup` | No | `{ name, email, password }` | `{ success, message }` |
| POST | `/api/auth/verify-otp` | No | `{ email, otp }` | `{ success, user }` |
| POST | `/api/auth/resend-otp` | No | `{ email }` | `{ success }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ success, user }` |
| POST | `/api/auth/logout` | Yes | - | `{ success }` |
| GET | `/api/auth/me` | Yes | - | `{ user }` or `401` |

### User Profile APIs

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/user/profile` | Yes | - | `{ profile }` |
| PUT | `/api/user/profile` | Yes | `{ name, bio, ... }` | `{ profile }` |
| GET | `/api/user/portfolio/:username` | No | - | `{ portfolio }` |

### Credit APIs

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/user/credits` | Yes | - | `{ balance }` |
| POST | `/api/user/credits/deduct` | Yes | `{ amount, type }` | `{ newBalance }` |
| GET | `/api/user/credits/transactions` | Yes | - | `{ transactions[] }` |
| POST | `/api/user/credits/enrollments` | Yes | `{ courseId }` | `{ enrolled }` |
| GET | `/api/user/credits/enrollments/check/:courseId` | Yes | - | `{ enrolled }` |

### Payment APIs

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|--------------|----------|
| POST | `/api/payments/create-order` | Yes | `{ amount, coins }` | `{ orderId, ... }` |
| POST | `/api/payments/verify` | Yes | `{ razorpay_order_id, signature, ... }` | `{ success, newBalance }` |
| POST | `/api/payments/webhook` | No | Razorpay webhook payload | `200 OK` |

### Voucher APIs

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|--------------|----------|
| POST | `/api/vouchers/redeem` | Yes | `{ code }` | `{ success, credits }` |

### Course APIs (Proxy to Admin)

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/courses` | No | - | `{ courses[] }` |
| GET | `/api/courses/:id` | No | - | `{ course }` |
| GET | `/api/courses/:id/modules` | No | - | `{ modules[] }` |
| GET | `/api/courses/:id/lessons/:lessonId` | Yes | - | `{ lesson }` |
| GET | `/api/courses/:id/labs` | Yes | - | `{ labs[] }` |
| GET | `/api/courses/:id/labs/:labId` | Yes | - | `{ lab }` |
| GET | `/api/courses/:id/tests` | Yes | - | `{ tests[] }` |
| GET | `/api/courses/:id/tests/:testId` | Yes | - | `{ test, questions }` |
| POST | `/api/courses/:id/tests/:testId/submit` | Yes | `{ answers[] }` | `{ score, passed }` |
| GET | `/api/courses/:id/projects` | Yes | - | `{ projects[] }` |
| POST | `/api/courses/:id/projects/:projectId/submit` | Yes | `{ githubUrl, ... }` | `{ success }` |

### Certificate APIs

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/certificates` | Yes | - | `{ certificates[] }` |
| POST | `/api/certificates/generate` | Yes | `{ courseId }` | `{ certificate }` |
| GET | `/api/certificates/:id` | Yes | - | `{ certificate }` |
| GET | `/api/verify/certificate/:id` | No | - | `{ verification }` |

### Marksheet APIs

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/marksheet` | Yes | - | `{ marksheet }` |
| GET | `/api/verify/marksheet/:id` | No | - | `{ verification }` |

### Notification APIs

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/notifications` | Yes | - | `{ notifications[] }` |
| POST | `/api/notifications/:id/read` | Yes | - | `{ success }` |
| POST | `/api/notifications/read-all` | Yes | - | `{ success }` |

### Mithra AI APIs

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|--------------|----------|
| POST | `/api/mithra/ask` | Yes | `{ question, context, pageType }` | `{ answer, responseType }` |

---

## Database Schema

### Complete Schema (Drizzle ORM)

```typescript
// shared/schema.ts

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  emailVerified: boolean("email_verified").default(false),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  githubUrl: varchar("github_url", { length: 255 }),
  websiteUrl: varchar("website_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// OTP codes for email verification
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  otpHash: varchar("otp_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User credit balance
export const userCredits = pgTable("user_credits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  balance: integer("balance").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit transaction history
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: integer("amount").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  referenceId: varchar("reference_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Course enrollments
export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: varchar("course_id", { length: 255 }).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});

// Voucher codes
export const vouchers = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  credits: integer("credits").notNull(),
  maxUses: integer("max_uses").default(1),
  uses: integer("uses").default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Voucher redemptions
export const voucherRedemptions = pgTable("voucher_redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  voucherId: integer("voucher_id").references(() => vouchers.id),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  read: boolean("read").default(false),
  link: varchar("link", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mithra conversations
export const mithraConversations = pgTable("mithra_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: varchar("course_id", { length: 255 }),
  pageType: varchar("page_type", { length: 50 }),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  responseType: varchar("response_type", { length: 50 }),
  helpLevel: varchar("help_level", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Test attempts
export const testAttempts = pgTable("test_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: varchar("course_id", { length: 255 }).notNull(),
  testId: varchar("test_id", { length: 255 }).notNull(),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  answers: json("answers"),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

// Project submissions
export const projectSubmissions = pgTable("project_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: varchar("course_id", { length: 255 }).notNull(),
  projectId: varchar("project_id", { length: 255 }).notNull(),
  githubUrl: varchar("github_url", { length: 255 }),
  liveUrl: varchar("live_url", { length: 255 }),
  description: text("description"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Certificates
export const certificates = pgTable("certificates", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: varchar("course_id", { length: 255 }).notNull(),
  courseName: varchar("course_name", { length: 255 }).notNull(),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  score: integer("score"),
  skills: json("skills"),
  issuedAt: timestamp("issued_at").defaultNow(),
});

// Session table (managed by connect-pg-simple)
export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});
```

---

## Environment Variables

### Required Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Replit (auto-provided) |
| `SESSION_SECRET` | Session encryption key | Generate: `openssl rand -hex 32` |
| `RESEND_API_KEY` | Resend email API key | https://resend.com/api-keys |
| `AISIKSHA_ADMIN_URL` | Admin portal base URL | Admin team |
| `AISIKSHA_API_KEY` | Admin portal API key | Admin team (secret) |
| `RAZORPAY_KEY_ID` | Razorpay key ID | https://dashboard.razorpay.com |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | https://dashboard.razorpay.com |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `VITE_RAZORPAY_KEY_ID` | Frontend Razorpay key | Same as backend |

### env.example Template

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Session
SESSION_SECRET=your-secret-key-here

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Admin Portal
AISIKSHA_ADMIN_URL=https://course-factory.example.com
AISIKSHA_API_KEY=your-admin-api-key

# Payments (Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## Scenarios & Edge Cases

### Authentication Scenarios

| Scenario | Behavior |
|----------|----------|
| Email already registered | Show error, suggest login |
| Wrong password (login) | Show "Invalid credentials" |
| OTP expired | Show error, offer resend |
| OTP already used | Show error |
| Email not verified (login) | Redirect to verify-otp page |
| Session expired | Redirect to login |

### Credit Scenarios

| Scenario | Behavior |
|----------|----------|
| Insufficient credits | Show modal, redirect to wallet |
| Welcome bonus already claimed | No duplicate credits |
| Payment failed | No credits added, show error |
| Duplicate payment verification | Idempotent, no duplicate credits |
| Voucher already used by user | Show "Already redeemed" |
| Voucher max uses reached | Show "Voucher exhausted" |
| Voucher expired | Show "Voucher expired" |

### Course Scenarios

| Scenario | Behavior |
|----------|----------|
| Course not published | 404 Not Found |
| Already enrolled | Show "Continue Learning" |
| Free course enrollment | No credits deducted |
| Admin API unavailable | Use cached/mock data |

### Test Scenarios

| Scenario | Behavior |
|----------|----------|
| Test already attempted | Show previous result |
| Insufficient credits for test | Block attempt, redirect to wallet |
| Timer expires | Auto-submit current answers |
| Browser refresh during test | Warn user, allow continue |
| Network error during submit | Retry, show error |

### Certificate Scenarios

| Scenario | Behavior |
|----------|----------|
| Not all lessons complete | Cannot generate, show progress |
| Test not passed | Cannot generate, show requirements |
| Already generated | Show existing certificate |
| PDF generation failed | Retry, fallback to online view |

### AI Mithra Scenarios

| Scenario | Behavior |
|----------|----------|
| Rate limit exceeded | Show "Wait a moment" |
| Insufficient credits | Show credit purchase modal |
| During active test | Mithra completely hidden |
| Off-topic question | Polite redirect to learning |
| Request for direct answer | Provide hint instead |

### Payment Scenarios

| Scenario | Behavior |
|----------|----------|
| Razorpay modal closed | No action, user can retry |
| Payment successful, verification failed | Webhook will handle |
| Webhook signature invalid | Reject, log security alert |
| Network error during payment | Razorpay handles retry |

---

## Security Considerations

### Authentication Security

| Measure | Implementation |
|---------|----------------|
| Password hashing | bcrypt with 12 rounds |
| OTP hashing | SHA256 |
| Session storage | PostgreSQL (not client-side) |
| Cookie security | HTTP-only, Secure, SameSite=Lax |
| Session expiry | 30 days |

### API Security

| Measure | Implementation |
|---------|----------------|
| Authentication | Session-based with passport.js |
| Rate limiting | 10 req/min for Mithra |
| Input validation | Zod schema validation |
| SQL injection | Parameterized queries (Drizzle) |
| XSS prevention | React auto-escaping |

### Payment Security

| Measure | Implementation |
|---------|----------------|
| Signature verification | Razorpay HMAC-SHA256 |
| Webhook validation | Secret signature check |
| Idempotency | Prevent duplicate credits |
| PCI compliance | Razorpay handles card data |

### Test Security

| Measure | Implementation |
|---------|----------------|
| Answer hiding | Never sent to client |
| One-time attempt | Database check before attempt |
| Timer enforcement | Server-side validation |
| AI blocking | Mithra disabled during tests |

### Data Protection

| Measure | Implementation |
|---------|----------------|
| Secrets management | Replit Secrets (encrypted) |
| Environment isolation | Dev/Prod separation |
| Logging | No sensitive data in logs |
| Error messages | Generic messages to client |

---

## Deployment Guide

### Prerequisites

1. Replit account
2. PostgreSQL database (auto-provisioned by Replit)
3. Required API keys:
   - Resend API key
   - OpenAI API key (for Mithra)
   - Razorpay credentials
   - Admin portal API key

### Deployment Steps

1. **Clone/Fork Repository**
   ```bash
   git clone https://github.com/ourshiksha/shishya.git
   ```

2. **Configure Secrets**
   - Go to Replit Secrets tab
   - Add all required environment variables
   - Never commit secrets to git

3. **Database Setup**
   ```bash
   npm run db:push
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Deploy Production**
   - Click "Deploy" in Replit
   - Select "Reserved VM" for always-on
   - Configure custom domain (optional)

### Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database schema synced
- [ ] Email sending works (test OTP)
- [ ] Payment gateway configured (test mode)
- [ ] Admin API connection working
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)

### Monitoring

| Metric | Tool |
|--------|------|
| Server logs | Replit console |
| Error tracking | Console errors |
| Database | Replit database panel |
| Payments | Razorpay dashboard |
| Email delivery | Resend dashboard |

---

## Multi-Theme System

### Available Themes

| Theme | Primary Color | Description |
|-------|---------------|-------------|
| Default | Blue | Clean, professional |
| Ocean | Teal | Calm, trustworthy |
| Forest | Green | Growth, nature |
| Sunset | Orange | Warm, energetic |
| Midnight | Indigo | Dark, focused |
| Rose | Pink | Soft, friendly |

### Theme Implementation

- **ThemeSwitcher**: Located in header
- **Storage**: localStorage with key `shishya-theme`
- **Modes**: Light / Dark / System
- **CSS Variables**: Dynamic HSL values

---

## Support & Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| OTP not received | Check spam, verify Resend domain |
| Payment not reflecting | Wait for webhook, check logs |
| Course not loading | Verify Admin API key |
| Certificate not generating | Check completion requirements |
| Mithra not responding | Check OpenAI API key, rate limits |

### Contact

- **Technical Issues**: Review server logs
- **Payment Issues**: Razorpay dashboard
- **Admin Portal**: Contact admin team

---

*Last Updated: December 24, 2024*
*Version: 2.0.0*
