# OurShiksha Platform - SHISHYA + GURU

## Overview
OurShiksha is an e-learning platform comprising SHISHYA (Student Portal) and GURU (Admin Control Panel), sharing a PostgreSQL database. Its core purpose is to deliver a seamless learning experience and robust administrative tools. SHISHYA focuses on content consumption, progress tracking, and skill development for students, while GURU manages courses, students, credits, and platform settings. The platform aims to innovate e-learning through AI-powered features, virtual internships, and comprehensive content delivery, targeting broad market potential in online education and skill development.

## User Preferences
I prefer detailed explanations.
Do not make changes to the `server/` folder unless absolutely necessary for core functionality or security patches.
I like the use of functional components and hooks in React.
Please ask before making any major architectural changes or introducing new external dependencies.
I prefer an iterative development approach, focusing on one feature at a time.

## Performance Optimizations
- **Route-level code splitting:** All 59 pages are lazy-loaded via `React.lazy()` + `Suspense` in `client/src/App.tsx`. Initial JS bundle loads only the landing page chunk; other pages download on demand.
- **Server-side course cache:** `/api/courses` (previously 274–291ms per request) is cached in memory for 5 minutes (`_coursesCache` in `server/routes.ts`). Warm requests now resolve in **~1ms**. Call `invalidateCoursesCache()` from GURU routes after course publish/update.
- **N+1 query fix:** `GET /api/modules/:courseId` previously issued one SQL query per module to fetch lessons. Now uses a single `inArray(lessonsTable.moduleId, moduleIds)` batch query, reducing DB round trips from N+1 to 2.
- **DB indexes:** Added secondary indexes to all high-frequency foreign keys: `modules.course_id`, `lessons.module_id`, `lessons.course_id`, `shishya_user_progress (user_id, course_id)`, `shishya_course_enrollments (user_id, course_id)`, `shishya_sessions.user_id`. Applied via `db:push`.

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
- **B2 Storage + Smart CDN Auto-Switch:** Backblaze B2 replaces Cloudflare R2 as the video/audio/subtitle storage backend (S3-compatible, ~60% cheaper storage). Two-phase CDN delivery: Phase 1 uses Cloudflare CDN (free, zero-egress via Bandwidth Alliance with B2), Phase 2 uses Bunny CDN (better streaming at scale). The server evaluates thresholds every hour — switches to Bunny CDN automatically when unique daily viewers exceed 100 OR buffering rate exceeds 5%, and back to Cloudflare when metrics normalise. GURU admin can monitor metrics and override CDN mode at `/guru/cdn-status`. The video player instruments `play-start` and `buffering` events via `POST /api/metrics/play-start` and `POST /api/metrics/buffering`. DB tables: `video_metrics` (daily aggregates), `video_viewer_days` (de-dup unique viewers), `platform_config` (cdn_mode + switch log). Server module: `server/cdnMetrics.ts`. Env vars: `B2_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_NAME`, `B2_ENDPOINT`, `B2_CLOUDFLARE_URL`, `BUNNY_CDN_URL`. Legacy R2 credentials retained as fallback. Proxy allowlist extended with `backblazeb2.com`.
- **Multi-Bitrate HLS (ABR Encoding):** New `POST /api/guru/r2/convert-hls-abr` endpoint in `server/r2Upload.ts`. Uses a single ffmpeg 6.1.2 pass with `filter_complex` to encode the source video into a 4-rung quality ladder (360p/800k → 480p/1400k → 720p/2800k → 1080p/5000k) in one decode. ffprobe detects source resolution — renditions that would upscale are skipped automatically. Generates a proper HLS master playlist with `#EXT-X-STREAM-INF BANDWIDTH + RESOLUTION + CODECS` so hls.js does true adaptive bitrate (ABR). All segments and sub-playlists are uploaded to B2 under `hls-abr/{timestamp}/`. GURU lesson editor now shows "Convert ABR (360p–1080p)" (purple, recommended) and "Standard HLS" (outline) buttons with live progress polling.
- **Bunny CDN Token Authentication (The CDN Rule):** `signBunnyUrl(url, expiresInSec=3600)` in `server/cdnMetrics.ts`. Implements Bunny's SHA-256/Base64Url signing algorithm: `token = base64url(sha256(BUNNY_TOKEN_AUTH_KEY + path + expiry))`. Called transparently by `/api/video-proxy` and `/api/hls-proxy` at request time — clients never see unsigned CDN URLs. When `BUNNY_TOKEN_AUTH_KEY` env var is set, ALL Bunny CDN requests are signed with a 1-hour expiry. CDN Status dashboard shows token auth status (green shield = active, amber = not configured). Env var: `BUNNY_TOKEN_AUTH_KEY`.
- **B2/R2 AI Processing Pipeline:** Handles video uploads, HLS conversion, and an AI pipeline for audio extraction, Whisper transcription, and GPT-4.1-mini translation to generate multi-language WebVTT subtitles. Previously Cloudflare R2 only — now uses B2 if configured, falls back to R2.
- **AI Processing UI in GURU:** Admin interface for generating AI content, including subtitles and managing audio conversions for lessons.
- **Combo Packs Section:** Dynamic grouping of courses on the landing page for promotional bundling.
- **Enhanced Dashboard:** A 5-zone layout providing a comprehensive overview for students.
- **Academic Marksheet System:** University-style marksheet generation with grades, CGPA, and PDF download, offering public verifiability.
- **Analytics:** Recharts-powered skill radar, sub-skill bar chart, and performance score cards.
- **Unified Certificate Verification Hub:** Public page at `/verify-certificate`. User enters any Certificate ID → backend checks both `shishya_user_certificates` (OurShiksha course certs) and `udyog_certificates` (OurUdyog internship certs) in a single flow. Shows student name, course/internship title, completion date, level, skills, platform badge, and Copy ID. Buttons: View Certificate → `/verify/:id` (Shiksha) or Udyog route; Download PDF. API: `GET /api/public/verify-certificate/:id`. Navbar "Certifications" → updated to point to this page.
- **GURU Admin Portal:** Provides full CRUD operations for courses, modules, lessons, tests, labs, projects, student and credit management. Integrates with Zoho TrainerCentral.
- **Course Groups (Bundle Builder):** Allows GURU admins to bundle multiple micro-courses into named groups (e.g. "Web Development" = HTML + CSS + JavaScript). Features a tabbed UI (All Courses / Group Courses), searchable course picker, auto-calculated duration, and auto-aggregated skills. Backed by `course_groups` and `course_group_items` DB tables. Each group has a **Group Type** (Track or Program), **Price** (in credits), and a **Thumbnail** with image preview. The Course Catalog (SHISHYA) is split into 3 tabs — Course | Track | Program — showing individual courses or grouped bundles respectively.
- **Project Detail Rendering:** Smart rendering of project details based on type (external API, local DB/AI-generated JSON tasks, plain text), including tools and resources.
- **OAuth Login:** Supports Google OAuth and SSO for user authentication.
- **Udyog Virtual Internship System:** An AI-powered virtual internship platform featuring AI skill assessment, automatic internship assignment, a kanban-style task management system, submission tracking, and certificate generation. Includes a comprehensive portfolio management system within the Udyog workspace.
- **Udyog AI Builder:** Simplifies internship creation with a feature/task/steps structure, leveraging `gpt-4.1` for generating detailed tasks, tools, processes, steps, checklists, and practice exercises, supporting various skill levels including "Mastery."
- **Site Pages CMS:** Stores editable content for marketing pages (`ai-usha-mentor`, `become-guru`, `help-center`, `become-a-partner`) with public API access and GURU admin inline editor.
- **Auth Ecosystem Rotator:** A CSS 3D rotating component on the login page showcasing "Our Shiksha," "Usha AI," and "Our Udyog" with animations and interactive elements.
- **Usha AI 3-Layer Knowledge System:** Layer 1 = Answer Book (curated Q&A DB lookup with token-overlap scoring), Layer 2 = RAG (lesson/lab content fetched from DB for context enrichment), Layer 3 = 3-Tier LLM cascade: Groq `llama-3.1-8b-instant` → Claude Haiku `claude-haiku-4-5` (Anthropic, mid-tier) → OpenAI `gpt-4o-mini` (fallback). Answer Book entries return `type: "knowledge"` shown as teal "✦ From Usha's Knowledge" subtitle in chat. GURU admin can manage the Answer Book at `/guru/usha-knowledge` (CRUD with course-specific or global scope, tags for precision matching, table layout, Markdown-enabled answer editor).
- **Hybrid STT → Intelligence → TTS Pipeline:** Full voice conversation loop in the in-video Usha chat. STT: Browser Web Speech API (primary) → OpenAI Whisper API fallback (`/api/usha/stt`). TTS: 3-mode toggle in chat header — browser `speechSynthesis` (default, grey sparkle) → OpenAI Nova TTS (`/api/usha/tts?engine=openai`, cyan sparkle) → Coqui/Edge TTS Indian English Neerja voice (`/api/usha/tts?engine=coqui`, purple sparkle, proxied to Python Edge TTS sidecar on port 8008). If Coqui sidecar is down, TTS fallback auto-switches to OpenAI. `VideoUshaChat` supports full automated voice loop (listen → ask → speak → listen). Edge TTS sidecar: `server/tts_server.py` (Flask + edge-tts, Python 3.11, workflow "Usha TTS Server").

## External Dependencies
- **AISiksha Admin Course Factory:** Primary backend for course and content data.
- **Resend:** For sending email OTPs.
- **PostgreSQL:** Main database for application data and session storage.
- **Drizzle ORM:** ORM for PostgreSQL interactions.
- **html2canvas & jsPDF:** Client-side PDF certificate generation.
- **OpenAI:** Whisper STT (`/api/usha/stt`), OpenAI TTS Nova voice (`/api/usha/tts?engine=openai`), and gpt-4o-mini as Tier 3 (final fallback) LLM for Usha AI.
- **Groq:** Tier 1 LLM for Usha AI (`llama-3.1-8b-instant`, fastest). Requires `GROQ_API_KEY` secret.
- **Anthropic:** Tier 2 LLM for Usha AI (`claude-haiku-4-5`). Activated when Groq fails. Requires `ANTHROPIC_API_KEY` secret. Optional but recommended.
- **Edge TTS (Python sidecar):** Provides Coqui-style TTS using Microsoft Edge TTS (`en-IN-NeerjaNeural` Indian English voice). Runs as `server/tts_server.py` on port 8008 via the "Usha TTS Server" workflow. No API key required. Falls back to OpenAI TTS if the sidecar is offline.
- **Zoho TrainerCentral:** Integrated with GURU for course and student synchronization.
- **hls.js:** Used for HLS adaptive bitrate streaming in the video player.
- **Backblaze B2:** Primary video storage backend (S3-compatible). Credentials: `B2_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_NAME`, `B2_ENDPOINT`. Falls back to Cloudflare R2 if B2 not configured.
- **Cloudflare CDN (Phase 1 / Free):** CDN delivery layer when daily viewers < 100 and buffering rate < 5%. Set `B2_CLOUDFLARE_URL` to your Cloudflare CDN hostname. Zero-cost egress via Bandwidth Alliance with B2.
- **Bunny CDN (Phase 2 / Scale):** Auto-activated when thresholds are exceeded (> 100 viewers/day OR > 5% buffering). Set `BUNNY_CDN_URL` to your pull-zone hostname. Both CDNs serve from B2 as origin.
- **Cloudflare R2:** Legacy storage fallback (if B2 not configured). Credentials: `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL`.
- **Three.js / @react-three/fiber / @react-three/drei:** Libraries available for 3D rendering (currently used for CSS 3D ecosystem rotator).