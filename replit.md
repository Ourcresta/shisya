# SHISHYA - Student Portal

## Overview
SHISHYA is the learner-facing portal of the OurShiksha platform, designed for content consumption. It enables students to browse courses, view modules and lessons, track learning progress, and submit course projects. The platform's vision is to empower learners through a structured and engaging educational experience, facilitating skill development and career readiness.

## User Preferences
I prefer detailed explanations.
Do not make changes to the `server/` folder unless absolutely necessary for core functionality or security patches.
I like the use of functional components and hooks in React.
Please ask before making any major architectural changes or introducing new external dependencies.
I prefer an iterative development approach, focusing on one feature at a time.

## System Architecture
The SHISHYA student portal is built with a React + Vite frontend, utilizing TypeScript and Tailwind CSS with Shadcn UI for a clean, calm, and student-friendly aesthetic. TanStack React Query handles data fetching from the backend, ensuring efficient state management and caching. The backend is an Express.js application acting primarily as a read-only proxy to the OurShiksha Admin Course Factory, with session-based authentication managed by PostgreSQL and Drizzle ORM.

**UI/UX Decisions:**
- **Design System:** Inter font for body, Space Grotesk for headings. Leverages Shadcn UI components for consistency.
- **Multi-Theme System:** 6 curated color palettes (Default, Ocean, Forest, Sunset, Midnight, Rose) with light/dark/system mode support. ThemeSwitcher in header. Theme persisted to localStorage.
- **Micro-Animations:** Framer Motion used for staggered card reveals, page transitions, and subtle UI feedback. Animation variants in `client/src/lib/animations.ts`.
- **Modular Components:** Reusable UI components including PageHeader, StatCard, EmptyState, LoadingPage for consistent design patterns.
- **Responsiveness:** Fully mobile-responsive design.
- **Loading States:** Implements skeleton loading for a smooth user experience.
- **Navigation:** Header navigation adapts based on authentication status, providing access to public and authenticated routes.
- **Student-first UX:** Prioritizes ease of use and clarity for learners.

**Technical Implementations:**
- **Authentication:** Features a secure signup and login flow with email/password, OTP verification (via Resend), Bcrypt password hashing, SHA256 OTP hashing, and HTTP-only session cookies with PostgreSQL persistence. Protected routes redirect unauthenticated users.
- **Progress Tracking:** LocalStorage is used for client-side tracking of lesson completion, project submissions, test attempts, certificates, and lab progress.
- **Test System:** Correct answers are never sent to the client; scoring is server-side. Tests are one-time attempts with timed assessments and immediate results.
- **Certificate System:** Auto-generated upon meeting course requirements, with unique IDs, QR codes for public verification, and client-side PDF generation.
- **Guided Labs:** Browser-based JavaScript execution with security sandboxing, output matching, and code persistence in LocalStorage. Labs can be unlocked based on lesson completion.
- **Profile & Portfolio:** Students can manage a private editable profile and generate a public shareable portfolio with a verified badge, learning statistics, skills aggregated from completed courses/certificates, projects, and certificates.
- **Mithra AI Tutor:** Context-aware AI assistant integrated into lesson, lab, and project pages. Uses OpenAI's gpt-4.1-mini model with strict guardrails to never give direct answers - only explanations, hints, and guidance. Rate-limited to 10 requests/minute per student. Backend endpoint at POST /api/mithra/ask. Appears as floating avatar button in bottom-right corner. Conversation history stored in PostgreSQL.

**Feature Specifications:**
- **Core Features:** Landing Page, Course Catalog, Course Overview, Student Dashboard, Learn View with Lesson Viewer, Progress Tracking, Course Projects with Submission, Course Tests with Scoring and History, Guided Labs, Certificates Dashboard and Viewer, Public Certificate Verification, Student Profile, Public Portfolio, Centralized Projects View, and Centralized Tests View.
- **Centralized Projects Page:** `/shishya/projects` displays all projects from all enrolled courses in a modular table format with course name, project title, difficulty badge, status (Pending/Submitted), and clickable rows for navigation to project details.
- **Centralized Tests Page:** `/shishya/tests` displays all tests from all enrolled courses in a modular table format with course name, test title, duration, passing percentage, status (Not Attempted/Passed/Failed with score), and clickable rows for navigation to test details.
- **Profile Photo Upload:** Students can upload a profile photo by hovering over their avatar on the profile page and clicking the camera icon. Supports image files up to 2MB, stored as base64 in localStorage.
- **Landing Page:** Comprehensive homepage at "/" with 7 sections - Hero, Journey (5-step learning path), Features (7 cards), Course Preview (fetches real courses), CTA, and Footer. Auth-aware CTAs show Login/Signup for guests or "Go to Shishya" for authenticated users.
- **Credit-Based Enrollment System:** Students use Learning Credits to enroll in courses:
  - 500 credits welcome bonus granted automatically upon signup/email verification
  - Free courses (isFree: true) have no credit cost
  - Paid courses deduct credits upon enrollment
  - Dashboard displays credit balance in Zone 2 metrics
  - Course Overview page shows credit cost badges and enrollment status
  - Enrollment modal confirms cost before deducting credits
  - Database tables: user_credits (balance tracking), credit_transactions (history), course_enrollments (enrollment records)
  - API endpoints: GET /api/user/credits, POST /api/user/credits/enrollments, GET /api/user/credits/enrollments/check/:courseId
  - CreditContext provides global state for credits and enrollment functions
- **Enhanced Dashboard:** Restructured with 5 clear zones for optimal UX:
  - Zone 1 (Welcome & Status): Personalized greeting, Learning Status Badge (Beginner/Intermediate/Advanced), motivational subtitle, Quick Links to key sections
  - Zone 2 (Learning Snapshot): 5 clickable metric cards - Credits, In Progress, Completed, Certificates, Tests Passed
  - Zone 3 (Primary Action): Smart CTA logic - Continue Learning (if active course), Start Learning (if new), or Complete Pending Actions (if blockers exist)
  - Zone 4 (Pending Actions): Checklist-style cards showing tests to take and projects to submit, with "All caught up!" empty state
  - Zone 5 (Achievements): Recent Certificates with links and Skills Gained from completed courses
- **Portfolio Preview System:** Private preview at `/shishya/profile/portfolio-preview` shows students how their portfolio appears to recruiters. Public portfolios accessible at `/profile/:username` and `/portfolio/:username` with OurShiksha branding and verification links.
- **Key Principles:** Read-only content consumption, focus on published courses only, no admin features, graceful error handling, clear separation of public and authenticated routes.

## External Dependencies
- **AISiksha Admin Course Factory:** The primary backend source for course content and data. Configured via environment variables:
  - `AISIKSHA_ADMIN_URL`: The base URL of the Admin Course Factory
  - `AISIKSHA_API_KEY`: API key for authentication (stored as secret)
  - All API requests include `X-API-Key` header for authentication
  - Endpoints used: `/api/public/courses`, `/api/public/courses/:id`, `/api/public/courses/:id/tests`, `/api/public/courses/:id/projects`, `/api/public/courses/:id/labs`
  - Graceful fallback to mock data when Admin API is unavailable
- **Resend:** For sending email OTPs during the signup and account verification process.
- **PostgreSQL:** Database used for session storage and potentially other backend data.
- **Drizzle ORM:** Used for interacting with the PostgreSQL database.
- **html2canvas & jsPDF:** Client-side libraries for generating PDF certificates.

## Documentation Files
- **document.md:** Comprehensive project documentation with full feature specs, routes, database schema, and deployment guide.
- **env.example:** Template for environment variables (copy to .env and fill in values).