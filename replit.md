# SHISYA - Student Portal

## Overview
SHISYA is the learner-facing portal of the AISiksha ecosystem. It represents the "Student / Shisya" side of learning - a read-only content consumption portal that fetches data from the AISiksha Admin Course Factory backend.

**App Name:** SHISYA  
**Tagline:** Learn. Practice. Prove.  
**Purpose:** Allow students to browse published courses, view modules/lessons, track learning progress, and submit course projects.

## Tech Stack
- React + Vite (Frontend)
- TypeScript
- Tailwind CSS with Shadcn UI components
- TanStack React Query for data fetching
- Express.js (Backend proxy)
- LocalStorage for progress tracking and project submissions

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Layout
│   │   ├── course/          # CourseCard, CourseCardSkeleton, EmptyState
│   │   ├── project/         # ProjectCard, ProjectSubmissionForm, ProjectStatusBadge
│   │   ├── test/            # QuestionCard, TestTimer, TestProgress
│   │   └── ui/              # Shadcn components + custom badges
│   ├── contexts/
│   │   ├── ProgressContext.tsx      # Centralized lesson progress state
│   │   └── TestAttemptContext.tsx   # Test attempt state management
│   ├── lib/
│   │   ├── api.ts           # API fetching utilities
│   │   ├── progress.ts      # LocalStorage progress tracking
│   │   ├── submissions.ts   # LocalStorage project submissions
│   │   ├── testAttempts.ts  # LocalStorage test attempt tracking
│   │   ├── queryClient.ts   # React Query client
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── CourseCatalog.tsx    # Home page - course grid
│   │   ├── CourseOverview.tsx   # Course details page
│   │   ├── LearnView.tsx        # Modules & lessons view
│   │   ├── LessonViewer.tsx     # Individual lesson content
│   │   ├── CourseProjects.tsx   # Project list for a course
│   │   ├── ProjectDetail.tsx    # Single project with submission form
│   │   ├── CourseTests.tsx      # Test list for a course
│   │   ├── TestInstructions.tsx # Test details and start button
│   │   ├── TestAttempt.tsx      # Active test-taking interface
│   │   ├── TestResult.tsx       # Score and pass/fail display
│   │   └── not-found.tsx        # 404 page
│   ├── App.tsx
│   └── index.css
server/
├── routes.ts                # API proxy routes to Admin backend
├── mockData.ts              # Mock data for development (courses, modules, lessons, projects, tests)
└── ...
shared/
└── schema.ts                # TypeScript types and Zod schemas
```

## Routes
- `/` - Course Catalog (home)
- `/courses/:courseId` - Course Overview
- `/courses/:courseId/learn` - Learn View (modules & lessons)
- `/courses/:courseId/learn/:lessonId` - Lesson Viewer
- `/courses/:courseId/projects` - Course Projects list
- `/courses/:courseId/projects/:projectId` - Project Detail with submission form
- `/courses/:courseId/tests` - Course Tests list
- `/courses/:courseId/tests/:testId` - Test Instructions (pre-test view)
- `/courses/:courseId/tests/:testId/attempt` - Active Test Attempt
- `/courses/:courseId/tests/:testId/result` - Test Result Display

## API Endpoints (Proxy to Admin Backend)
Most routes are READ-ONLY proxies to the AISiksha Admin Course Factory:

### Course & Lesson Endpoints
- `GET /api/courses` - Published courses only
- `GET /api/courses/:courseId` - Single course (published only)
- `GET /api/courses/:courseId/modules` - Course modules
- `GET /api/courses/:courseId/modules-with-lessons` - Modules with nested lessons
- `GET /api/modules/:moduleId/lessons` - Lessons for a module
- `GET /api/lessons/:lessonId` - Single lesson
- `GET /api/lessons/:lessonId/notes` - AI notes for a lesson

### Project Endpoints
- `GET /api/courses/:courseId/projects` - Projects for a course
- `GET /api/projects/:projectId` - Single project details
- `POST /api/projects/:projectId/submissions` - Submit a project (stored in localStorage)

### Test Endpoints
- `GET /api/courses/:courseId/tests` - Tests for a course (summary without questions)
- `GET /api/tests/:testId` - Single test with questions (correct answers stripped)
- `POST /api/tests/:testId/submit` - Submit test answers (server calculates score)

## Admin Backend
Base URL: `https://course-factory.ourcresta1.repl.co`

## Core Features
1. **Course Catalog** - Browse published courses with cards showing title, level, duration, skills
2. **Course Overview** - View course details, skills, certificate requirements
3. **Learn View** - Accordion-style module/lesson navigation with progress tracking
4. **Lesson Viewer** - View lesson content including objectives, key concepts, AI notes, video links
5. **Progress Tracking** - Mark lessons complete (stored in LocalStorage)
6. **Course Projects** - View available projects with difficulty levels, skills, and requirements
7. **Project Submission** - Submit project work with GitHub URL, live URL, and notes
8. **Course Tests** - Take timed assessments with MCQ and scenario questions
9. **Test Scoring** - Immediate score calculation (server-side to prevent cheating)
10. **Test History** - View past attempt results with pass/fail status

## Design System
- Fonts: Inter (body), Space Grotesk (headings)
- Uses Shadcn UI components
- Clean, calm, student-friendly aesthetic
- Mobile responsive
- Skeleton loading states throughout

## Key Principles
- READ-ONLY for content (no editing)
- Shows ONLY published courses
- No admin features
- Student-first UX
- Graceful error handling

## LocalStorage Keys
- `shisya_course_progress` - Lesson completion tracking per course
- `shisya_project_submissions` - Project submission data per course/project
- `shisya_test_attempts` - Test attempt data (answers, scores, pass/fail status)

## Test System Design
- **Security**: Correct answers are NEVER sent to the client. Server strips `isCorrect` flag before sending questions.
- **Scoring**: Server calculates score by comparing submitted answers against stored correct answers.
- **One-Time**: Tests cannot be retaken in this version (once attempted, shows result only).
- **Timer**: Timed tests show countdown with color-coded warnings (amber < 60s, red < 30s with pulse).
- **Persistence**: Attempts stored in localStorage for instant access to past results.
