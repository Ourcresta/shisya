# OurShiksha Platform - SHISHYA + GURU

## Overview
OurShiksha is an e-learning platform comprising SHISHYA (Student Portal) and GURU (Admin Control Panel), sharing a PostgreSQL database. Its core purpose is to deliver a seamless learning experience and robust administrative tools. SHISHYA focuses on content consumption, progress tracking, and skill development for students, while GURU manages courses, students, credits, and platform settings. The platform aims to innovate e-learning through AI-powered features, virtual internships, and comprehensive content delivery, targeting broad market potential in online education and skill development.

## User Preferences
I prefer detailed explanations.
Do not make changes to the `server/` folder unless absolutely necessary for core functionality or security patches.
I like the use of functional components and hooks in React.
Please ask before making any major architectural changes or introducing new external dependencies.
I prefer an iterative development approach, focusing on one feature at a time.

## System Architecture
The platform is built with a React + Vite frontend, TypeScript, Tailwind CSS, and Shadcn UI, utilizing TanStack React Query for data fetching. The backend is an Express.js application, primarily acting as a read-only proxy to the Admin Course Factory, managing session-based authentication with PostgreSQL and Drizzle ORM.

**UI/UX Decisions:**
- **Branding:** Uses a GraduationCap icon, Inter font for body, Space Grotesk for headings, and Shadcn UI components.
- **Theming:** Supports a multi-theme system with 6 color palettes and light/dark/system modes, persisted locally for SHISHYA routes. Public pages maintain a default light appearance.
- **Animations:** Employs Framer Motion for micro-animations and transitions.
- **Modularity & Responsiveness:** Features reusable UI components and full mobile responsiveness.
- **Loading States:** Implements skeleton loading for improved user experience.
- **Navigation:** Provides adaptive header navigation based on user authentication status.

**Technical Implementations:**
- **Authentication:** Secure signup/login with email/password, OTP verification, Bcrypt/SHA256 hashing, and HTTP-only session cookies with PostgreSQL persistence.
- **Progress Tracking:** Client-side tracking of lesson completion, project/test submissions, and certificates.
- **Content Systems:** Includes a server-side scored Test System, auto-generated Certificate System with unique IDs and QR codes, and Guided Labs with browser-based JS execution and code persistence.
- **Profile & Portfolio:** Editable student profiles and shareable public portfolios with verified badges and statistics.
- **Usha AI Tutor:** A context-aware AI assistant (OpenAI's gpt-4.1-mini) for hints and guidance, featuring rate-limiting, conversation history, and in-video integration with STT and TTS capabilities.
- **In-App Video Player:** A custom HTML5/HLS player with hls.js for adaptive streaming, keyboard shortcuts, subtitle rendering via a custom WebVTT parser, and integrated AI chat. Supports audio dubbing with synced separate audio tracks.
- **Credit-Based Enrollment:** Manages course enrollment through a credit system, including welcome credits, free/paid course differentiation, and credit pack purchases.
- **Credit Packs System:** Database-driven `credit_packs` for dynamic pricing and management of credit bundles.
- **Cloudflare R2 Integration:** Handles video uploads, HLS conversion, and an AI pipeline for audio extraction, Whisper transcription, and GPT-4.1-mini translation to generate multi-language WebVTT subtitles.
- **AI Processing UI in GURU:** Admin interface for generating AI content, including subtitles and managing audio conversions for lessons.
- **Combo Packs Section:** Dynamic grouping of courses on the landing page for promotional bundling.
- **Enhanced Dashboard:** A 5-zone layout providing a comprehensive overview for students.
- **Academic Marksheet System:** University-style marksheet generation with grades, CGPA, and PDF download, offering public verifiability.
- **Analytics:** Recharts-powered skill radar, sub-skill bar chart, and performance score cards.
- **GURU Admin Portal:** Provides full CRUD operations for courses, modules, lessons, tests, labs, projects, student and credit management. Integrates with Zoho TrainerCentral.
- **Course Groups (Bundle Builder):** Allows GURU admins to bundle multiple micro-courses into named groups (e.g. "Web Development" = HTML + CSS + JavaScript). Features a tabbed UI (All Courses / Group Courses), searchable course picker, auto-calculated duration, and auto-aggregated skills. Backed by `course_groups` and `course_group_items` DB tables. Each group has a **Group Type** (Track or Program), **Price** (in credits), and a **Thumbnail** with image preview. The Course Catalog (SHISHYA) is split into 3 tabs — Course | Track | Program — showing individual courses or grouped bundles respectively.
- **Project Detail Rendering:** Smart rendering of project details based on type (external API, local DB/AI-generated JSON tasks, plain text), including tools and resources.
- **OAuth Login:** Supports Google OAuth and SSO for user authentication.
- **Udyog Virtual Internship System:** An AI-powered virtual internship platform featuring AI skill assessment, automatic internship assignment, a kanban-style task management system, submission tracking, and certificate generation. Includes a comprehensive portfolio management system within the Udyog workspace.
- **Udyog AI Builder:** Simplifies internship creation with a feature/task/steps structure, leveraging `gpt-4.1` for generating detailed tasks, tools, processes, steps, checklists, and practice exercises, supporting various skill levels including "Mastery."
- **Site Pages CMS:** Stores editable content for marketing pages (`ai-usha-mentor`, `become-guru`, `help-center`, `become-a-partner`) with public API access and GURU admin inline editor.
- **Auth Ecosystem Rotator:** A CSS 3D rotating component on the login page showcasing "Our Shiksha," "Usha AI," and "Our Udyog" with animations and interactive elements.
- **Usha AI 3-Layer Knowledge System:** Upgraded Usha AI pipeline: Layer 1 = Answer Book (curated Q&A DB lookup with token-overlap scoring), Layer 2 = RAG (lesson/lab content fetched from DB for context enrichment), Layer 3 = LLM call (Groq `llama-3.1-8b-instant` primary → OpenAI `gpt-4o-mini` fallback). Answer Book entries return `type: "knowledge"` shown as teal "✦ From Usha's Knowledge" subtitle in chat. GURU admin can manage the Answer Book at `/guru/usha-knowledge` (CRUD with course-specific or global scope, tags for precision matching, table layout, Markdown-enabled answer editor).
- **Hybrid STT → Intelligence → TTS Pipeline:** Full voice conversation loop in the in-video Usha chat. STT: Browser Web Speech API (primary, real-time interim results) → OpenAI Whisper API fallback (`/api/usha/stt`) for browsers without native STT or when MediaRecorder is used. TTS: Browser `speechSynthesis` (default) → OpenAI TTS API Nova voice (`/api/usha/tts`) switchable via ✦ sparkle toggle in the chat header. Intelligence: existing 3-layer pipeline. `VideoUshaChat` supports full automated voice loop (listen → ask → speak → listen) and Whisper transcription with recording status indicators.

## External Dependencies
- **AISiksha Admin Course Factory:** Primary backend for course and content data.
- **Resend:** For sending email OTPs.
- **PostgreSQL:** Main database for application data and session storage.
- **Drizzle ORM:** ORM for PostgreSQL interactions.
- **html2canvas & jsPDF:** Client-side PDF certificate generation.
- **OpenAI:** Powers the Usha AI Tutor (gpt-4o-mini) as fallback LLM.
- **Groq:** Primary LLM for Usha AI Tutor (llama-3.3-70b-versatile via `groq-sdk`). Falls back to OpenAI if unavailable. Requires `GROQ_API_KEY` secret.
- **Zoho TrainerCentral:** Integrated with GURU for course and student synchronization.
- **hls.js:** Used for HLS adaptive bitrate streaming in the video player.
- **Cloudflare R2:** Object storage for video and AI-generated assets (upload target; credentials via `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL`).
- **Bunny CDN:** CDN pull-zone for video delivery. Set `BUNNY_CDN_URL` to your Pull Zone hostname (e.g. `https://yourzone.b-cdn.net`). When set, all video delivery URLs use Bunny CDN instead of R2 directly; R2 remains the upload target. The video/HLS proxy allowlist includes `b-cdn.net` alongside R2 domains.
- **Three.js / @react-three/fiber / @react-three/drei:** Libraries available for 3D rendering (currently used for CSS 3D ecosystem rotator).