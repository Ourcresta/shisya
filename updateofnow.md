# SHISYA - Student Portal Update

## Project Overview
SHISYA is the learner-facing portal of the AISiksha ecosystem. It represents the "Student / Shisya" side of learning - a READ-ONLY content consumption portal that fetches data from the AISiksha Admin Course Factory backend.

**App Name:** SHISYA  
**Tagline:** Learn. Practice. Prove.

---

## What Was Built

### 1. Course Catalog (Home Page)
- **Route:** `/`
- Grid layout displaying all published courses
- Each course card shows:
  - Course title and description
  - Level badge (Beginner, Intermediate, Advanced)
  - Duration estimate
  - Skill tags/badges
  - Requirements indicators (Test Required, Project Required)
- Empty state when no courses are available
- Skeleton loading states during data fetch

### 2. Course Overview Page
- **Route:** `/courses/:courseId`
- Detailed course information including:
  - Full course description
  - Skills you will learn (displayed as badges)
  - Course requirements and certificate information
  - Duration and level details
- "Start Learning" button to begin the course
- Back navigation to course catalog

### 3. Learn View (Module/Lesson Navigation)
- **Route:** `/courses/:courseId/learn`
- Split layout with sidebar and main content area
- Sidebar contains:
  - Course title
  - Progress ring showing completion percentage
  - Progress bar with lesson count (e.g., "3 / 15 lessons")
  - Accordion-style module list with expandable lessons
  - Each lesson shows completion status (checkmark icon if completed)
  - Estimated time for each module/lesson
- Main content area prompts user to select a lesson

### 4. Lesson Viewer
- **Route:** `/courses/:courseId/learn/:lessonId`
- Displays complete lesson content:
  - Lesson title and estimated time
  - Learning Objectives (list with checkmarks)
  - Key Concepts (numbered list)
  - AI-generated Lesson Content (rich HTML)
  - Video link (external)
  - Additional Resources (external links)
- "Mark as Completed" button that toggles lesson completion
- Back navigation to Learn View

---

## Technical Implementation

### Frontend Stack
- React with Vite
- TypeScript for type safety
- Tailwind CSS with Shadcn UI components
- TanStack React Query for data fetching
- Wouter for client-side routing
- Framer Motion ready for animations

### Backend Stack
- Express.js server
- Proxy API routes to AISiksha Admin Course Factory
- Mock data fallback when admin backend unavailable

### Progress Tracking System
- **Storage:** LocalStorage under key `shisya_progress`
- **React Context:** Centralized `ProgressContext` for reactive state management
- **Features:**
  - Mark lessons as complete/incomplete
  - Track completion percentage per course
  - State persists across browser sessions
  - Immediate UI updates across all pages when progress changes

### API Endpoints (Backend Proxy)
| Endpoint | Description |
|----------|-------------|
| `GET /api/courses` | List all published courses |
| `GET /api/courses/:id` | Get single course details |
| `GET /api/courses/:id/modules` | Get course modules |
| `GET /api/courses/:id/modules-with-lessons` | Get modules with nested lessons |
| `GET /api/modules/:id/lessons` | Get lessons for a module |
| `GET /api/lessons/:id` | Get single lesson details |
| `GET /api/lessons/:id/notes` | Get AI-generated notes for lesson |

### Mock Data System
Since the AISiksha Admin Course Factory backend is not yet deployed, comprehensive mock data has been implemented:
- 3 sample courses (Web Development, React, Python)
- Multiple modules per course
- 15 lessons across all modules
- AI-generated notes for each lesson
- External resources and video links

---

## File Structure

```
client/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # App header with branding
│   │   └── Layout.tsx          # Page wrapper component
│   ├── course/
│   │   ├── CourseCard.tsx      # Course card for catalog
│   │   ├── CourseCardSkeleton.tsx
│   │   └── EmptyState.tsx      # No courses state
│   └── ui/
│       ├── progress-ring.tsx   # Circular progress indicator
│       └── ...                 # Shadcn components
├── contexts/
│   └── ProgressContext.tsx     # Centralized progress state
├── lib/
│   ├── api.ts                  # API utilities
│   ├── progress.ts             # LocalStorage progress functions
│   └── queryClient.ts          # React Query client
├── pages/
│   ├── CourseCatalog.tsx       # Home page
│   ├── CourseOverview.tsx      # Course details page
│   ├── LearnView.tsx           # Module/lesson navigation
│   ├── LessonViewer.tsx        # Lesson content page
│   └── not-found.tsx           # 404 page
└── App.tsx                     # Root component with routing

server/
├── routes.ts                   # API proxy routes
├── mockData.ts                 # Development mock data
└── index.ts                    # Express server setup

shared/
└── schema.ts                   # TypeScript types and Zod schemas
```

---

## Design System

### Typography
- **Headings:** Space Grotesk font family
- **Body:** Inter font family

### Color Palette
- Primary: Indigo tones
- Success/Completed: Emerald green
- Muted: Gray tones for secondary text
- Background: Light/Dark mode support

### Components
- Cards with subtle borders and hover states
- Badges for skills and levels
- Progress indicators (ring and bar)
- Accordion for expandable content
- Skeleton loading states throughout

---

## Key Features Summary

1. **READ-ONLY Portal** - Students can only view content, no editing capabilities
2. **Published Courses Only** - Only shows courses marked as published
3. **Progress Tracking** - LocalStorage-based lesson completion tracking
4. **Responsive Design** - Works on mobile, tablet, and desktop
5. **Loading States** - Skeleton UI while data loads
6. **Error Handling** - Graceful fallbacks for missing data
7. **Mock Data Fallback** - Works without admin backend connection

---

## Environment Configuration

| Variable | Description |
|----------|-------------|
| `ADMIN_API_BASE` | Base URL for AISiksha Admin Course Factory API (optional - uses mock data if not set) |

---

## Future Integration

When the AISiksha Admin Course Factory is deployed:
1. Set `ADMIN_API_BASE` environment variable to the admin API URL
2. The proxy routes will automatically fetch real data instead of mock data
3. All published courses, modules, and lessons will appear in the portal

---

## Testing Status

All end-to-end tests pass:
- Course catalog displays correctly
- Navigation between pages works
- Progress tracking updates immediately across pages
- Mark complete/incomplete toggles correctly
- LocalStorage persistence verified
