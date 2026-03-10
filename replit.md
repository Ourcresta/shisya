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
- **Usha AI Tutor:** Context-aware AI assistant (OpenAI's gpt-4.1-mini) for hints and guidance, with rate-limiting and conversation history in PostgreSQL. In-video AI tutor button (Usha face) in video player control bar; chat panel below video with STT (Web Speech API) and TTS (Speech Synthesis API). Usha receives `studentName` in context (passed from frontend via `user.name`), greets students by first name, and addresses them naturally in conversation. `UshaContext` and `ushaRequestSchema` include `studentName` field; `buildContextPrompt` injects it into the system prompt.
- **In-App Video Player:** Custom HTML5/HLS video player (`UshaVideoPlayer.tsx`) with hls.js for adaptive bitrate streaming, quality switching, buffer indicator, keyboard shortcuts (Space/K=play, Arrow=seek, M=mute, F=fullscreen), and Usha AI button integrated in the control bar. `VideoUshaChat.tsx` renders below the video (not overlaying) with context-aware AI chat, quick suggestions, voice input (STT), and text-to-speech (TTS). **Voice Conversation Mode:** Prominent "Talk to Usha" toggle (PhoneCall icon) activates voice mode — large animated mic orb auto-sends speech when final, TTS auto-plays Usha's response, mic auto-reactivates for continuous conversation loop. Preferred female TTS voice (Google UK English Female / Samantha / Zira). Wired into `LearnView.tsx` — lessons with `videoUrl` show embedded player; lessons without fall back to TrainerCentral link.
- **Credit-Based Enrollment:** 500 welcome credits, free/paid course differentiation, credit deduction on enrollment, dashboard display, and API for credit management.
- **Credit Packs System:** DB-driven `credit_packs` table (id, name, price, points, bonusPercent, description, popular, isActive, orderIndex). Seeds 3 defaults on startup. Public `GET /api/credit-packs`, GURU CRUD at `/api/guru/credit-packs` (max 5 packs, min 1). `GuruPricing.tsx` has "Credit Packs" tab with full CreditPacksManager component. `Wallet.tsx` "Buy Credits" tab loads from DB dynamically; "Plans" tab shows theme-aware subscription plan cards. Razorpay payment routes use DB pack IDs (no hardcoded prices).
- **Cloudflare R2 Video Upload:** `server/r2Upload.ts` with `POST /api/guru/r2/presign` (requireGuruAuth) generates 15-min presigned PutObject URL for the R2 bucket. `GuruCourseDetail.tsx` lesson editor has "Upload to R2" button next to the video URL field — picks a video file, uploads directly from browser via XHR PUT, shows live progress bar, auto-fills the public R2 URL on success. Uses `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`. Secrets: `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL`.
- **Enhanced Dashboard:** 5-zone layout for welcome, learning snapshot, primary actions, pending actions, and achievements.
- **Academic Marksheet System:** University-style marksheet with grades, CGPA, and PDF download, publicly verifiable.
- **Analytics:** Recharts-powered skill radar, sub-skill bar chart, and performance score card.
- **AI Privacy:** Generic platform references for AI content generation without brand name.
- **GURU Admin Portal:** Full CRUD for courses, modules, lessons, tests, labs, projects, student and credit management, and Zoho TrainerCentral integration.
- **OAuth Login:** Google OAuth and SSO (enterprise single sign-on) buttons on login page. OAuth routes in `server/oauth.ts`. Users table has `authProvider` and `authProviderId` fields.
- **Udyog Virtual Internship System:** AI-powered virtual internship platform at `/shishya/udyog`. Features AI skill assessment (6 domains, 10 MCQ per domain), automatic internship assignment based on score (Beginner < 40 → Junior Intern, 40-75 → Project Associate, >75 → Lead Developer), intern dashboard with sidebar (Overview/Tasks/Submissions/AI Mentor/Certification/Portfolio), kanban-style task management, submission system, certificate generation. Portfolio tab provides full profile management (edit, photo upload, visibility toggle, skills, stats, portfolio strength meter, public link sharing) within the Udyog workspace. Backend routes in `server/udyogRoutes.ts`. Database tables: `udyog_internships`, `udyog_assignments`, `udyog_tasks`, `udyog_subtasks`, `udyog_submissions`, `udyog_certificates`, `udyog_skill_assessments`, `udyog_batches`, `udyog_batch_members`, `udyog_hr_users`, `udyog_jobs`, `udyog_applications`. Guru admin page at `/guru/internships` for CRUD management. Batch system: auto-creates batch of 5, assigns roles (Team Lead/Developer/QA) by skill score. HR Hiring Pipeline: job postings, AI candidate matching, application management. Public jobs page at `/shishya/udyog/jobs`. Guru admin jobs page at `/guru/jobs`. "Our Udyog" dropdown in navbar with Internship and Jobs links.
- **Udyog 3-Level Hierarchy (Project → Task → Sub-Task):** `udyog_subtasks` table (taskId FK, title, description, orderIndex, status). AI Builder generates 5-7 tasks each with 3-5 sub-tasks as step-by-step student guidance (max_tokens 4500). Backend: `POST /admin/tasks/:taskId/subtasks`, `PATCH /admin/subtasks/:id`, `DELETE /admin/subtasks/:id`; `getTasksWithSubtasks()` helper used by `GET /internships/:id` and `GET /my-assignment`. GURU Tasks tab redesigned as expandable accordion cards — clicking a task reveals its sub-tasks with a delete button each, plus an inline "Add Sub-task" form. AI Builder preview shows collapsible task tree with chevron expand/collapse and sub-task count badges. Student dashboard (Task Board kanban + Milestone Timeline) shows sub-tasks as step indicators within each task card.

**Key Principles:** Read-only content consumption for students, focus on published courses, graceful error handling, and clear separation of public/authenticated routes.

## External Dependencies
- **AISiksha Admin Course Factory:** Primary backend data source for courses and content, authenticated via API key.
- **Resend:** For sending email OTPs during user authentication.
- **PostgreSQL:** Primary database for session storage and application data.
- **Drizzle ORM:** Used for object-relational mapping with PostgreSQL.
- **html2canvas & jsPDF:** Client-side libraries for generating PDF certificates.
- **OpenAI:** Used for the Usha AI Tutor (gpt-4.1-mini model).
- **Zoho TrainerCentral:** Integrated with the GURU admin portal for course/curriculum sync and auto student/course enrollment.
- **hls.js:** HLS adaptive bitrate streaming for the in-app video player.
- **Three.js / @react-three/fiber / @react-three/drei:** Available for 3D rendering. Previous ThreeCoin component replaced by CSS 3D ecosystem rotator.
- **Auth Ecosystem Rotator:** CSS 3D rotating component at `client/src/auth/EcosystemRotator.tsx`. Shows 3 circular faces (Our Shiksha → Usha AI → Our Udyog) at 120° intervals, 12s rotation cycle with cubic-bezier easing, radial glow, breathing aura ring, gradient border ring, hover pause + scale, floating animation, responsive (260/220/180px), prefers-reduced-motion accessible. CSS in `index.css` under `.eco-rotator` BEM classes. Flow text "Learning → AI Guidance → Industry Placement" below. Udyog coin image: `image_1772016230351.png` (silver/navy shield emblem).