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
- Two action buttons:
  - "Start Learning" - Navigate to lesson content
  - "View Projects" - Navigate to course projects (shown when projects required)
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

### 5. Course Projects Page (NEW)
- **Route:** `/courses/:courseId/projects`
- Grid layout displaying all projects for a course
- Each project card shows:
  - Project title and description
  - Difficulty badge (Beginner, Intermediate, Advanced) with color coding
  - Estimated hours to complete
  - Skill tags relevant to the project
  - Submission status badge (Submitted / Not Submitted)
- "View Project" button navigates to project details
- "View Submission" button appears for submitted projects
- Empty state when no projects available
- Skeleton loading states during data fetch

### 6. Project Detail Page (NEW)
- **Route:** `/courses/:courseId/projects/:projectId`
- Complete project information including:
  - **Project Description** - Full details about what to build
  - **Learning Outcomes** - What you will learn by completing this project
  - **Requirements** - GitHub Required, Live URL Required, Documentation Required
  - **Evaluation Criteria** - How the project will be graded
  - **Skills Validated** - Technologies and skills covered
  - Estimated time and difficulty level

### 7. Project Submission System (NEW)
- Built into Project Detail page
- Submission form with:
  - GitHub Repository URL (required)
  - Live Demo URL (optional/required based on project)
  - Notes/Explanation textarea
  - Confirmation checkbox ("I confirm this is my own work")
- Form validation with helpful error messages
- After submission:
  - Success toast notification
  - Form replaced with submission summary
  - Shows GitHub link, live URL, notes, and submission date
  - Status badge updates to "Submitted"
- Submissions persist across browser sessions

---

## How It Works

### User Flow
1. **Browse Courses** - User lands on home page, sees all available courses
2. **Select Course** - Click on a course card to see full details
3. **Start Learning** - Click "Start Learning" to access lessons
4. **Complete Lessons** - Navigate through modules, read content, mark lessons complete
5. **Track Progress** - Progress ring and bars update in real-time
6. **View Projects** - Click "View Projects" from course overview
7. **Submit Projects** - Open a project, fill out submission form, submit

### Progress Tracking
- Uses browser LocalStorage for persistence
- Centralized React Context (`ProgressContext`) for reactive updates
- When you mark a lesson complete:
  - Progress percentage updates immediately
  - Sidebar indicators update
  - Changes persist across page reloads

### Project Submissions
- Stored in LocalStorage under `shisya_project_submissions`
- Organized by courseId and projectId
- Each submission stores:
  - GitHub URL
  - Live URL (if provided)
  - Notes
  - Submission timestamp
  - Submitted status

---

## Technical Implementation

### Frontend Stack
- React with Vite
- TypeScript for type safety
- Tailwind CSS with Shadcn UI components
- TanStack React Query for data fetching
- Wouter for client-side routing
- React Hook Form with Zod validation

### Backend Stack
- Express.js server
- Proxy API routes to AISiksha Admin Course Factory
- Mock data fallback when admin backend unavailable

### API Endpoints (Backend Proxy)

#### Course & Lesson Endpoints
| Endpoint | Description |
|----------|-------------|
| `GET /api/courses` | List all published courses |
| `GET /api/courses/:id` | Get single course details |
| `GET /api/courses/:id/modules` | Get course modules |
| `GET /api/courses/:id/modules-with-lessons` | Get modules with nested lessons |
| `GET /api/modules/:id/lessons` | Get lessons for a module |
| `GET /api/lessons/:id` | Get single lesson details |
| `GET /api/lessons/:id/notes` | Get AI-generated notes for lesson |

#### Project Endpoints (NEW)
| Endpoint | Description |
|----------|-------------|
| `GET /api/courses/:id/projects` | Get all projects for a course |
| `GET /api/projects/:id` | Get single project details |
| `POST /api/projects/:id/submissions` | Submit a project |

### Mock Data System
Comprehensive mock data for development:
- 6 sample courses across different topics
- Multiple modules per course with 15+ lessons
- AI-generated notes for each lesson
- 7 mock projects with varying difficulty levels:
  - Personal Portfolio Website (Beginner)
  - Interactive Quiz Application (Intermediate)
  - Task Management App (Intermediate)
  - Weather Dashboard (Intermediate)
  - Data Analysis Report (Beginner)
  - RESTful API Server (Advanced)
  - Serverless Application (Advanced)

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
│   ├── project/                # NEW - Project components
│   │   ├── ProjectCard.tsx     # Project card with status
│   │   ├── ProjectStatusBadge.tsx  # Submitted/Not Submitted badges
│   │   └── ProjectSubmissionForm.tsx  # Submission form
│   └── ui/
│       ├── progress-ring.tsx   # Circular progress indicator
│       └── ...                 # Shadcn components
├── contexts/
│   └── ProgressContext.tsx     # Centralized progress state
├── lib/
│   ├── api.ts                  # API utilities
│   ├── progress.ts             # LocalStorage progress functions
│   ├── submissions.ts          # NEW - Project submission storage
│   └── queryClient.ts          # React Query client
├── pages/
│   ├── CourseCatalog.tsx       # Home page
│   ├── CourseOverview.tsx      # Course details page
│   ├── LearnView.tsx           # Module/lesson navigation
│   ├── LessonViewer.tsx        # Lesson content page
│   ├── CourseProjects.tsx      # NEW - Project list page
│   ├── ProjectDetail.tsx       # NEW - Project details + submission
│   └── not-found.tsx           # 404 page
└── App.tsx                     # Root component with routing

server/
├── routes.ts                   # API proxy routes (includes project routes)
├── mockData.ts                 # Development mock data (includes projects)
└── index.ts                    # Express server setup

shared/
└── schema.ts                   # TypeScript types including Project & Submission
```

---

## Design System

### Typography
- **Headings:** Space Grotesk font family
- **Body:** Inter font family

### Color Palette
- Primary: Indigo tones
- Success/Completed: Emerald green
- Warning (Intermediate): Amber
- Danger (Advanced): Rose
- Muted: Gray tones for secondary text
- Background: Light/Dark mode support

### Difficulty Badge Colors
| Difficulty | Color |
|------------|-------|
| Beginner | Emerald (green) |
| Intermediate | Amber (yellow/orange) |
| Advanced | Rose (red/pink) |

### Components
- Cards with subtle borders and hover states
- Badges for skills, levels, and status
- Progress indicators (ring and bar)
- Accordion for expandable content
- Form components with validation
- Skeleton loading states throughout

---

## Key Features Summary

1. **READ-ONLY Portal** - Students can only view content, no editing capabilities
2. **Published Courses Only** - Only shows courses marked as published
3. **Lesson Progress Tracking** - LocalStorage-based lesson completion tracking
4. **Project Submission System** - Submit projects with GitHub/live URLs
5. **Submission Status Tracking** - Visual indicators for submitted projects
6. **Responsive Design** - Works on mobile, tablet, and desktop
7. **Loading States** - Skeleton UI while data loads
8. **Error Handling** - Graceful fallbacks for missing data
9. **Mock Data Fallback** - Works without admin backend connection
10. **Form Validation** - Clear error messages for invalid input

---

## LocalStorage Keys

| Key | Description |
|-----|-------------|
| `shisya_course_progress` | Lesson completion tracking per course |
| `shisya_project_submissions` | Project submission data per course/project |

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
3. All published courses, modules, lessons, and projects will appear in the portal
4. Project submissions will sync with the backend database

---

## Testing Status

All end-to-end tests pass:
- Course catalog displays correctly
- Navigation between pages works
- Progress tracking updates immediately across pages
- Mark complete/incomplete toggles correctly
- LocalStorage persistence verified
- Project list displays with correct status badges
- Project submission form validates input correctly
- Submissions persist and display correctly after refresh
- Status badges update from "Not Submitted" to "Submitted"

---

## Recent Updates (Latest Session)

### Added Student Projects Module
- **CourseProjects Page** - Grid view of all projects for a course
- **ProjectDetail Page** - Complete project info with submission form
- **ProjectCard Component** - Reusable project cards with status
- **ProjectStatusBadge** - Visual submitted/not submitted indicators
- **DifficultyBadge** - Color-coded difficulty levels
- **ProjectSubmissionForm** - Form with GitHub URL, live URL, notes
- **submissions.ts** - LocalStorage utilities for submission tracking
- **Backend Routes** - 3 new API endpoints for projects
- **Mock Projects** - 7 sample projects across 5 courses
- **Schema Updates** - Project and ProjectSubmission types with Zod validation
