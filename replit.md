# SHISYA - Student Portal

## Overview
SHISYA is the learner-facing portal of the AISiksha ecosystem. It represents the "Student / Shisya" side of learning - a read-only content consumption portal that fetches data from the AISiksha Admin Course Factory backend.

**App Name:** SHISYA  
**Tagline:** Learn. Practice. Prove.  
**Purpose:** Allow students to browse published courses, view modules/lessons, and track their learning progress.

## Tech Stack
- React + Vite (Frontend)
- TypeScript
- Tailwind CSS with Shadcn UI components
- TanStack React Query for data fetching
- Express.js (Backend proxy)
- LocalStorage for progress tracking

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Layout
│   │   ├── course/          # CourseCard, CourseCardSkeleton, EmptyState
│   │   └── ui/              # Shadcn components + custom badges
│   ├── lib/
│   │   ├── api.ts           # API fetching utilities
│   │   ├── progress.ts      # LocalStorage progress tracking
│   │   ├── queryClient.ts   # React Query client
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── CourseCatalog.tsx    # Home page - course grid
│   │   ├── CourseOverview.tsx   # Course details page
│   │   ├── LearnView.tsx        # Modules & lessons view
│   │   ├── LessonViewer.tsx     # Individual lesson content
│   │   └── not-found.tsx        # 404 page
│   ├── App.tsx
│   └── index.css
server/
├── routes.ts                # API proxy routes to Admin backend
└── ...
shared/
└── schema.ts                # TypeScript types and Zod schemas
```

## Routes
- `/` - Course Catalog (home)
- `/courses/:courseId` - Course Overview
- `/courses/:courseId/learn` - Learn View (modules & lessons)
- `/courses/:courseId/learn/:lessonId` - Lesson Viewer

## API Endpoints (Proxy to Admin Backend)
All routes are READ-ONLY proxies to the AISiksha Admin Course Factory:

- `GET /api/courses` - Published courses only
- `GET /api/courses/:courseId` - Single course (published only)
- `GET /api/courses/:courseId/modules` - Course modules
- `GET /api/courses/:courseId/modules-with-lessons` - Modules with nested lessons
- `GET /api/modules/:moduleId/lessons` - Lessons for a module
- `GET /api/lessons/:lessonId` - Single lesson
- `GET /api/lessons/:lessonId/notes` - AI notes for a lesson

## Admin Backend
Base URL: `https://course-factory.ourcresta1.repl.co`

## Core Features
1. **Course Catalog** - Browse published courses with cards showing title, level, duration, skills
2. **Course Overview** - View course details, skills, certificate requirements
3. **Learn View** - Accordion-style module/lesson navigation with progress tracking
4. **Lesson Viewer** - View lesson content including objectives, key concepts, AI notes, video links
5. **Progress Tracking** - Mark lessons complete (stored in LocalStorage)

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
