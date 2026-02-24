# OurShiksha Platform - SHISHYA + GURU

## Overview
OurShiksha is a comprehensive e-learning platform featuring two integrated portals, SHISHYA (Student Portal) and GURU (Admin Control Panel), sharing a PostgreSQL database. The platform aims to provide a seamless learning experience for students and robust management tools for administrators. SHISHYA focuses on content consumption, progress tracking, and skill development, while GURU handles course, student, credit, and platform settings management.

## User Preferences
I prefer detailed explanations.
Do not make changes to the `server/` folder unless absolutely necessary for core functionality or security patches.
I like the use of functional components and hooks in React.
Please ask before making any major architectural changes or introducing new external dependencies.
I prefer an iterative development approach, focusing on one feature at a time.

## System Architecture
The SHISHYA student portal is a React + Vite frontend with TypeScript, Tailwind CSS, and Shadcn UI, using TanStack React Query for data fetching. The backend is an Express.js application serving as a read-only proxy to the Admin Course Factory, managing session-based authentication with PostgreSQL and Drizzle ORM. The GURU admin portal provides full CRUD operations and integrates with Zoho TrainerCentral.

**UI/UX Decisions:**
- **Branding & Design System:** GraduationCap icon, Inter font for body, Space Grotesk for headings, leveraging Shadcn UI.
- **Theming:** Multi-theme system with 6 color palettes and light/dark/system modes, persisted locally. **Theme is scoped to SHISHYA routes only** — public pages (Landing, Courses, Pricing, Our Udyog, Jobs) always use default light appearance regardless of user theme settings. The Appearance menu only shows in the Header when on SHISHYA routes. Udyog pages (Landing, Jobs, Assessment, Dashboard, Hub) have self-contained dark backgrounds independent of the theme system.
- **Animations:** Framer Motion for micro-animations and transitions.
- **Modularity & Responsiveness:** Reusable UI components and full mobile responsiveness.
- **Loading States:** Skeleton loading for enhanced user experience.
- **Navigation:** Adaptive header navigation based on authentication status.

**Technical Implementations:**
- **Authentication:** Secure signup/login with email/password, OTP verification (Resend), Bcrypt/SHA256 hashing, HTTP-only session cookies with PostgreSQL persistence.
- **Progress Tracking:** Client-side tracking of lesson completion, project/test submissions, and certificates using LocalStorage.
- **Content Systems:**
    - **Test System:** Server-side scoring, one-time, timed attempts.
    - **Certificate System:** Auto-generated, unique IDs, QR codes, client-side PDF generation.
    - **Guided Labs:** Browser-based JS execution with sandboxing, output matching, code persistence.
- **Profile & Portfolio:** Editable student profile and shareable public portfolio with verified badges, statistics, and skills.
- **Usha AI Tutor:** Context-aware AI assistant (OpenAI's gpt-4.1-mini) for hints and guidance, with rate-limiting and conversation history in PostgreSQL.
- **Credit-Based Enrollment:** 500 welcome credits, free/paid course differentiation, credit deduction on enrollment, dashboard display, and API for credit management.
- **Enhanced Dashboard:** 5-zone layout for welcome, learning snapshot, primary actions, pending actions, and achievements.
- **Academic Marksheet System:** University-style marksheet with grades, CGPA, and PDF download, publicly verifiable.
- **Analytics:** Recharts-powered skill radar, sub-skill bar chart, and performance score card.
- **AI Privacy:** Generic platform references for AI content generation without brand name.
- **GURU Admin Portal:** Full CRUD for courses, modules, lessons, tests, labs, projects, student and credit management, and Zoho TrainerCentral integration.
- **OAuth Login:** Google OAuth and SSO (enterprise single sign-on) buttons on login page. OAuth routes in `server/oauth.ts`. Users table has `authProvider` and `authProviderId` fields.
- **Udyog Virtual Internship System:** AI-powered virtual internship platform at `/shishya/udyog`. Features AI skill assessment (6 domains, 10 MCQ per domain), automatic internship assignment based on score (Beginner < 40 → Junior Intern, 40-75 → Project Associate, >75 → Lead Developer), intern dashboard with sidebar (Overview/Tasks/Submissions/AI Mentor/Certification), kanban-style task management, submission system, certificate generation. Backend routes in `server/udyogRoutes.ts`. Database tables: `udyog_internships`, `udyog_assignments`, `udyog_tasks`, `udyog_submissions`, `udyog_certificates`, `udyog_skill_assessments`, `udyog_batches`, `udyog_batch_members`, `udyog_hr_users`, `udyog_jobs`, `udyog_applications`. Guru admin page at `/guru/internships` for CRUD management. Batch system: auto-creates batch of 5, assigns roles (Team Lead/Developer/QA) by skill score. HR Hiring Pipeline: job postings, AI candidate matching, application management. Public jobs page at `/shishya/udyog/jobs`. Guru admin jobs page at `/guru/jobs`. "Our Udyog" dropdown in navbar with Internship and Jobs links.

**Key Principles:** Read-only content consumption for students, focus on published courses, graceful error handling, and clear separation of public/authenticated routes.

## External Dependencies
- **AISiksha Admin Course Factory:** Primary backend data source for courses and content, authenticated via API key.
- **Resend:** For sending email OTPs during user authentication.
- **PostgreSQL:** Primary database for session storage and application data.
- **Drizzle ORM:** Used for object-relational mapping with PostgreSQL.
- **html2canvas & jsPDF:** Client-side libraries for generating PDF certificates.
- **OpenAI:** Used for the Usha AI Tutor (gpt-4.1-mini model).
- **Zoho TrainerCentral:** Integrated with the GURU admin portal for course/curriculum sync and auto student/course enrollment.
- **Three.js / @react-three/fiber / @react-three/drei:** Available for 3D rendering. Previous ThreeCoin component replaced by CSS 3D ecosystem rotator.
- **Auth Ecosystem Rotator:** CSS 3D rotating component at `client/src/auth/EcosystemRotator.tsx`. Shows 3 circular faces (Our Shiksha → Usha AI → Our Udyog) at 120° intervals, 12s rotation cycle with cubic-bezier easing, radial glow, breathing aura ring, gradient border ring, hover pause + scale, floating animation, responsive (260/220/180px), prefers-reduced-motion accessible. CSS in `index.css` under `.eco-rotator` BEM classes. Flow text "Learning → AI Guidance → Industry Placement" below.