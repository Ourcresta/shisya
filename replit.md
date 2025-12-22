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

**Feature Specifications:**
- **Core Features:** Landing Page, Course Catalog, Course Overview, Student Dashboard, Learn View with Lesson Viewer, Progress Tracking, Course Projects with Submission, Course Tests with Scoring and History, Guided Labs, Certificates Dashboard and Viewer, Public Certificate Verification, Student Profile, and Public Portfolio.
- **Landing Page:** Comprehensive homepage at "/" with 7 sections - Hero, Journey (5-step learning path), Features (7 cards), Course Preview (fetches real courses), CTA, and Footer. Auth-aware CTAs show Login/Signup for guests or "Go to Shishya" for authenticated users.
- **Key Principles:** Read-only content consumption, focus on published courses only, no admin features, graceful error handling, clear separation of public and authenticated routes.

## External Dependencies
- **OurShiksha Admin Course Factory:** The primary backend source for course content and data (`https://course-factory.ourcresta1.repl.co`).
- **Resend:** For sending email OTPs during the signup and account verification process.
- **PostgreSQL:** Database used for session storage and potentially other backend data.
- **Drizzle ORM:** Used for interacting with the PostgreSQL database.
- **html2canvas & jsPDF:** Client-side libraries for generating PDF certificates.