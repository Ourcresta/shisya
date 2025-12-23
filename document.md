# SHISHYA - Student Portal Documentation

## Overview

SHISHYA is the learner-facing portal of the OurShiksha educational platform. It provides students with a comprehensive learning experience including course browsing, lesson viewing, guided labs, tests, project submissions, certificates, and AI-powered tutoring assistance.

**Platform Hierarchy:**
- **OurShiksha** - The overall educational platform
- **Shishya** - The student portal (this application)
- **Course Factory** - The admin backend for course management (external service)

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Shadcn UI |
| State Management | TanStack React Query |
| Routing | Wouter |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Authentication | Session-based with HTTP-only cookies |
| Email | Resend API |
| AI | OpenAI GPT-4.1-mini |

---

## Project Structure

```
shishya/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Shadcn UI primitives
│   │   │   ├── layout/       # Header, Footer components
│   │   │   ├── mithra/       # AI Tutor components
│   │   │   ├── test/         # Test-related components
│   │   │   └── landing/      # Landing page sections
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and helpers
│   │   └── App.tsx           # Main application entry
│   └── index.html
├── server/                    # Backend Express application
│   ├── routes.ts             # API route definitions
│   ├── auth.ts               # Authentication logic
│   ├── mithra.ts             # Mithra AI Tutor backend
│   ├── storage.ts            # Database operations
│   ├── db.ts                 # Database connection
│   └── index.ts              # Server entry point
├── shared/                    # Shared types and schemas
│   └── schema.ts             # Drizzle schema definitions
└── attached_assets/          # Static assets
```

---

## Features

### 1. Authentication System

**Flow:**
1. User signs up with email/password
2. OTP sent via email (Resend API)
3. User verifies OTP to complete registration
4. Session cookie set for authenticated requests

**Security:**
- Bcrypt password hashing (10 rounds)
- SHA256 OTP hashing
- HTTP-only session cookies
- Session stored in PostgreSQL
- 30-day session expiry

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Create new account |
| POST | /api/auth/verify-otp | Verify email OTP |
| POST | /api/auth/resend-otp | Resend OTP email |
| POST | /api/auth/login | Login with credentials |
| POST | /api/auth/logout | End session |
| GET | /api/auth/me | Get current user |

### 2. Course System

**Content Source:** Courses are fetched from the OurShiksha Course Factory API.

**Features:**
- Browse published courses
- View course details (modules, lessons, labs, tests)
- Track lesson completion (localStorage)
- Progress indicators

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses | List all published courses |
| GET | /api/courses/:id | Get course details |
| GET | /api/courses/:id/lessons/:lessonId | Get lesson content |

### 3. Guided Labs

**Features:**
- Browser-based JavaScript execution
- Sandboxed environment for security
- Output matching for validation
- Code persistence in localStorage
- Unlock based on lesson completion

### 4. Test System

**Features:**
- Multiple choice and coding questions
- Timed assessments
- Server-side scoring (answers never sent to client)
- One-time attempt per test
- Immediate results display
- Test history tracking

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses/:courseId/tests | List course tests |
| GET | /api/courses/:courseId/tests/:testId | Get test questions |
| POST | /api/courses/:courseId/tests/:testId/submit | Submit answers |

### 5. Certificate System

**Features:**
- Auto-generated upon course completion
- Unique certificate IDs
- QR code for public verification
- PDF generation (client-side)
- Public verification page

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/certificates | List user certificates |
| GET | /api/certificates/:id | Get certificate details |
| GET | /api/verify/:id | Public verification |

### 6. Mithra AI Tutor (v2)

**Overview:**
Mithra is an AI-powered learning assistant that provides context-aware guidance using Socratic teaching methods.

**Features:**
- Adaptive help levels (Beginner/Intermediate/Advanced)
- Response type labels (Explanation/Hint/Guidance/Notice)
- Session memory (last 6 conversation turns)
- Soft misuse detection with polite redirects
- Rate limiting (10 requests/minute)
- Disabled during active tests

**Configuration:**
| Setting | Value |
|---------|-------|
| Model | gpt-4.1-mini |
| Temperature | 0.3 |
| Max Tokens | 400 |
| Rate Limit | 10/minute per student |
| Session Memory | 6 turns |

**Page Availability:**
| Page Type | Mithra Status |
|-----------|---------------|
| Lesson | Enabled |
| Lab | Enabled |
| Project | Enabled |
| Test Prep | Enabled |
| Active Test | Disabled (blocked) |
| Dashboard | Disabled |
| Landing | Not shown |

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/mithra/ask | Send question to Mithra |

### 7. Student Profile & Portfolio

**Private Profile:**
- Editable personal information
- Learning statistics
- Course progress

**Public Portfolio:**
- Shareable URL
- Verified badge
- Skills from completed courses
- Certificates display
- Project showcase

---

## Routes

### Public Routes (No Auth Required)
| Path | Component | Description |
|------|-----------|-------------|
| / | Landing | Homepage with hero, features |
| /login | Login | User login form |
| /signup | Signup | Registration form |
| /verify-otp | VerifyOTP | Email verification |
| /courses | Courses | Browse all courses |
| /courses/:id | CourseOverview | Course details |
| /verify/:id | CertificateVerify | Public certificate verification |
| /portfolio/:username | Portfolio | Public student portfolio |

### Protected Routes (/shishya/*)
| Path | Component | Description |
|------|-----------|-------------|
| /shishya/dashboard | Dashboard | Student home |
| /shishya/learn/:courseId/:lessonId | LessonViewer | Lesson content |
| /shishya/lab/:courseId/:labId | LabViewer | Guided lab |
| /shishya/tests/:courseId/:testId | TestPrep | Test preparation |
| /shishya/tests/:courseId/:testId/attempt | TestAttempt | Active test |
| /shishya/tests/:courseId/:testId/result | TestResult | Test results |
| /shishya/projects/:courseId | ProjectSubmission | Submit project |
| /shishya/certificates | Certificates | View certificates |
| /shishya/certificates/:id | CertificateViewer | Single certificate |
| /shishya/profile | Profile | Edit profile |

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL
);
```

### OTP Codes Table
```sql
CREATE TABLE otp_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE
);
```

### Mithra Conversations Table
```sql
CREATE TABLE mithra_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  course_id INTEGER,
  page_type VARCHAR(50),
  role VARCHAR(20),
  content TEXT,
  response_type VARCHAR(50),
  help_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Environment Variables

See `env.example` for the complete list. Required variables:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| DATABASE_URL | PostgreSQL connection | Replit (automatic) |
| SESSION_SECRET | Session encryption key | Generate randomly |
| RESEND_API_KEY | Email service API key | resend.com |
| OPENAI_API_KEY | AI service API key | platform.openai.com |

---

## Email Configuration

**Provider:** Resend
**Sending Domain:** mail.dishabrooms.com
**From Address:** noreply@mail.dishabrooms.com

**Email Types:**
1. OTP Verification - Sent during signup
2. Password Reset (if implemented)

---

## Demo Account

For testing purposes:
- **Email:** demo@ourshiksha.com
- **Password:** demo123

---

## External Services

### OurShiksha Course Factory
- **URL:** https://course-factory.ourcresta1.repl.co
- **Purpose:** Course content management
- **Integration:** Read-only API proxy

### Resend Email Service
- **Purpose:** Transactional emails (OTP)
- **Documentation:** https://resend.com/docs

### OpenAI API
- **Purpose:** Mithra AI Tutor
- **Model:** gpt-4.1-mini
- **Documentation:** https://platform.openai.com/docs

---

## Development

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Resend API key
- OpenAI API key

### Setup
1. Clone the repository
2. Copy `env.example` to `.env`
3. Fill in environment variables
4. Run `npm install`
5. Run `npm run db:push` to sync database
6. Run `npm run dev` to start development server

### Scripts
| Command | Description |
|---------|-------------|
| npm run dev | Start development server |
| npm run build | Build for production |
| npm run db:push | Sync database schema |

---

## Security Considerations

1. **Secrets Management:** Never commit actual secrets to version control
2. **Password Storage:** Bcrypt with 10 rounds
3. **Session Security:** HTTP-only cookies, secure in production
4. **OTP Security:** SHA256 hashed, 10-minute expiry
5. **Test Answers:** Never sent to client
6. **AI Guardrails:** Mithra never provides direct answers
7. **Rate Limiting:** 10 Mithra requests/minute per student

---

## Deployment

The application is designed to run on Replit with:
- Automatic HTTPS
- PostgreSQL (Neon) database
- Environment secrets management
- Zero-config deployment

To deploy:
1. Ensure all environment variables are set
2. Click "Deploy" in Replit
3. Application will be available at your-repl.replit.app

---

## Support

For issues or questions:
- Check the course factory admin panel
- Review server logs for errors
- Verify environment variables are set correctly
