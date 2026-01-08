# SHISHYA Admin Control Panel - Complete Specification

## Overview

The Admin Control Panel is the centralized management system for the SHISHYA student learning portal. It provides administrators with complete control over content, users, analytics, and system settings. Both portals share a common PostgreSQL database.

---

## Architecture

### Shared Database Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
├─────────────────────────────────────────────────────────────────┤
│  CONTENT TABLES           │  USER TABLES                        │
│  - courses                │  - shishya_users                    │
│  - modules                │  - user_credits                     │
│  - lessons                │  - credit_transactions              │
│  - labs                   │  - course_enrollments               │
│  - tests                  │  - lesson_progress                  │
│  - projects               │  - test_attempts                    │
│                           │  - project_submissions              │
├───────────────────────────┼─────────────────────────────────────┤
│  SYSTEM TABLES            │  ANALYTICS TABLES                   │
│  - certificates           │  - user_activity_logs               │
│  - notifications          │  - course_analytics                 │
│  - usha_conversations     │  - enrollment_stats                 │
│  - platform_settings      │  - daily_metrics                    │
│  - admin_users            │                                     │
└─────────────────────────────────────────────────────────────────┘
```

### API Integration
- **SHISHYA Portal**: Reads from database via `/api/public/*` endpoints (read-only)
- **Admin Portal**: Full CRUD access via `/api/admin/*` endpoints (protected)
- **Authentication**: Separate admin user table with role-based access

---

## 1. Core Content Management

### 1.1 Courses

#### What to Control
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | Integer | Auto-generated primary key | System-managed |
| title | String | Course name | Required, 5-100 chars |
| description | Text | Full course description | Required, 50-2000 chars |
| short_description | String | Brief summary | Optional, max 200 chars |
| level | Enum | beginner/intermediate/advanced | Required |
| duration | String | Estimated completion time | Format: "X hours" |
| skills | Array | Skills taught | Min 1, max 10 skills |
| status | Enum | draft/published/archived | Required |
| is_free | Boolean | Free or paid course | Default: false |
| credit_cost | Integer | Credits required | 0-1000, required if not free |
| test_required | Boolean | Must pass test to complete | Default: true |
| project_required | Boolean | Must submit project | Default: true |
| thumbnail_url | String | Course cover image | URL or upload |
| language | String | Course language | Default: "en" |
| instructor_id | String | Assigned instructor | Optional |

#### How to Control
- **Create**: Form with all fields, validation before save
- **Edit**: Inline editing or full form, auto-save drafts
- **Publish/Unpublish**: Toggle button with confirmation
- **Archive**: Soft delete, maintains enrollments
- **Clone**: Duplicate course with all content
- **Reorder**: Drag-and-drop in course list

#### Admin Actions
```
POST   /api/admin/courses              - Create new course
GET    /api/admin/courses              - List all courses (with filters)
GET    /api/admin/courses/:id          - Get course details
PUT    /api/admin/courses/:id          - Update course
PATCH  /api/admin/courses/:id/status   - Change status
DELETE /api/admin/courses/:id          - Archive course
POST   /api/admin/courses/:id/clone    - Clone course
```

---

### 1.2 Modules

#### What to Control
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | Integer | Auto-generated primary key | System-managed |
| course_id | Integer | Parent course | Required, FK |
| title | String | Module name | Required, 5-100 chars |
| description | Text | Module overview | Optional, max 500 chars |
| order_index | Integer | Position in course | Auto-managed |
| is_locked | Boolean | Requires previous completion | Default: false |

#### How to Control
- **Create**: Add module within course editor
- **Edit**: Inline title/description editing
- **Reorder**: Drag-and-drop within course
- **Delete**: Remove with confirmation, cascades to lessons

#### Admin Actions
```
POST   /api/admin/courses/:courseId/modules           - Create module
GET    /api/admin/courses/:courseId/modules           - List modules
PUT    /api/admin/modules/:id                         - Update module
DELETE /api/admin/modules/:id                         - Delete module
PATCH  /api/admin/courses/:courseId/modules/reorder   - Reorder modules
```

---

### 1.3 Lessons

#### What to Control
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | Integer | Auto-generated primary key | System-managed |
| module_id | Integer | Parent module | Required, FK |
| course_id | Integer | Parent course | Required, FK |
| title | String | Lesson name | Required, 5-100 chars |
| content | Text | Lesson content (Markdown) | Required |
| video_url | String | Video URL (YouTube/Vimeo/S3) | Optional |
| duration_minutes | Integer | Estimated time | 1-180 minutes |
| order_index | Integer | Position in module | Auto-managed |
| is_preview | Boolean | Available without enrollment | Default: false |
| attachments | Array | Downloadable files | Optional |

#### How to Control
- **Create**: Rich text editor with Markdown support
- **Edit**: WYSIWYG editor with preview mode
- **Video**: URL input or file upload
- **Preview Toggle**: Quick switch for free preview
- **Reorder**: Drag-and-drop within module

#### Rich Content Features
- Markdown editor with syntax highlighting
- Code block support with language detection
- Image upload and embedding
- Video embedding (YouTube, Vimeo, custom)
- File attachments (PDF, ZIP, etc.)

#### Admin Actions
```
POST   /api/admin/modules/:moduleId/lessons     - Create lesson
GET    /api/admin/modules/:moduleId/lessons     - List lessons
GET    /api/admin/lessons/:id                   - Get lesson
PUT    /api/admin/lessons/:id                   - Update lesson
DELETE /api/admin/lessons/:id                   - Delete lesson
POST   /api/admin/lessons/:id/upload            - Upload attachment
PATCH  /api/admin/modules/:moduleId/lessons/reorder - Reorder lessons
```

---

### 1.4 Labs (Guided Coding Exercises)

#### What to Control
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | Integer | Auto-generated primary key | System-managed |
| course_id | Integer | Parent course | Required, FK |
| lesson_id | Integer | Associated lesson | Optional, FK |
| title | String | Lab name | Required, 5-100 chars |
| objective | Text | What student will learn | Required, 50-500 chars |
| instructions | Array | Step-by-step instructions | Required, 1-20 steps |
| difficulty | Enum | easy/medium/hard | Required |
| language | String | Programming language | Required (javascript/python/etc) |
| starter_code | Text | Initial code template | Required |
| expected_output | Text | Correct output to match | Required |
| hints | Array | Progressive hints | Optional, max 5 |
| solution_code | Text | Reference solution | Required (hidden from students) |
| order_index | Integer | Position in course | Auto-managed |
| time_limit_minutes | Integer | Max allowed time | Optional, 5-120 |

#### How to Control
- **Create**: Multi-step form with code editor
- **Instructions Builder**: Add/remove/reorder steps
- **Code Editor**: Syntax-highlighted editor with language selection
- **Test Runner**: Validate expected output matches
- **Hints Manager**: Add progressive hints
- **Preview**: Test lab as student would see it

#### Lab Validation
- Auto-run code to verify starter code is valid
- Verify expected output matches solution
- Test hint progression

#### Admin Actions
```
POST   /api/admin/courses/:courseId/labs    - Create lab
GET    /api/admin/courses/:courseId/labs    - List labs
GET    /api/admin/labs/:id                  - Get lab details
PUT    /api/admin/labs/:id                  - Update lab
DELETE /api/admin/labs/:id                  - Delete lab
POST   /api/admin/labs/:id/validate         - Validate lab works
POST   /api/admin/labs/:id/preview          - Run as student
```

---

### 1.5 Tests (Assessments)

#### What to Control
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | Integer | Auto-generated primary key | System-managed |
| course_id | Integer | Parent course | Required, FK |
| title | String | Test name | Required, 5-100 chars |
| description | Text | Test instructions | Optional |
| duration_minutes | Integer | Time limit | Required, 5-180 |
| passing_percentage | Integer | Pass threshold | Required, 1-100 |
| questions | JSON Array | Question objects | Required, 5-50 questions |
| max_attempts | Integer | Retake limit | Required, 1-10 |
| shuffle_questions | Boolean | Randomize order | Default: true |
| shuffle_options | Boolean | Randomize answers | Default: true |
| show_correct_answers | Boolean | Show after submission | Default: false |
| is_active | Boolean | Available to students | Default: true |

#### Question Structure
```json
{
  "id": "q1",
  "type": "multiple_choice",
  "question": "What does HTML stand for?",
  "options": [
    "Hyper Text Markup Language",
    "High Tech Modern Language",
    "Home Tool Markup Language",
    "Hyperlinks and Text Markup Language"
  ],
  "correctAnswer": 0,
  "explanation": "HTML stands for Hyper Text Markup Language",
  "points": 1
}
```

#### Question Types Supported
- **Multiple Choice**: Single correct answer
- **Multiple Select**: Multiple correct answers
- **True/False**: Binary choice
- **Fill in Blank**: Text input matching
- **Code Output**: What does this code print?

#### How to Control
- **Question Builder**: Visual editor for each type
- **Bulk Import**: CSV/JSON import for questions
- **Question Bank**: Reuse questions across tests
- **Preview Mode**: Take test as student
- **Analytics**: See question difficulty stats

#### Admin Actions
```
POST   /api/admin/courses/:courseId/tests     - Create test
GET    /api/admin/courses/:courseId/tests     - List tests
GET    /api/admin/tests/:id                   - Get test details
PUT    /api/admin/tests/:id                   - Update test
DELETE /api/admin/tests/:id                   - Delete test
POST   /api/admin/tests/:id/questions         - Add question
PUT    /api/admin/tests/:id/questions/:qId    - Update question
DELETE /api/admin/tests/:id/questions/:qId    - Delete question
POST   /api/admin/tests/:id/import            - Bulk import questions
GET    /api/admin/tests/:id/analytics         - Question analytics
```

---

### 1.6 Projects (Capstone Assignments)

#### What to Control
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | Integer | Auto-generated primary key | System-managed |
| course_id | Integer | Parent course | Required, FK |
| title | String | Project name | Required, 5-100 chars |
| description | Text | Project overview | Required, 100-2000 chars |
| difficulty | Enum | beginner/intermediate/advanced | Required |
| requirements | Array | Must-have features | Required, 3-10 items |
| resources | Array | Helpful links/materials | Optional |
| estimated_hours | Integer | Expected completion time | Required, 1-100 |
| submission_type | Enum | url/file/github | Required |
| rubric | JSON | Grading criteria | Optional |
| deadline_days | Integer | Days after enrollment | Optional |

#### Rubric Structure
```json
{
  "criteria": [
    {
      "name": "Functionality",
      "description": "All features work as expected",
      "maxPoints": 40
    },
    {
      "name": "Code Quality",
      "description": "Clean, readable, well-organized",
      "maxPoints": 30
    },
    {
      "name": "UI/UX",
      "description": "User-friendly interface",
      "maxPoints": 30
    }
  ],
  "totalPoints": 100,
  "passingScore": 70
}
```

#### How to Control
- **Requirements Builder**: Add/remove checklist items
- **Resources Manager**: Add helpful links, files
- **Rubric Editor**: Define grading criteria
- **Sample Solutions**: Upload reference implementations

#### Admin Actions
```
POST   /api/admin/courses/:courseId/projects    - Create project
GET    /api/admin/courses/:courseId/projects    - List projects
GET    /api/admin/projects/:id                  - Get project
PUT    /api/admin/projects/:id                  - Update project
DELETE /api/admin/projects/:id                  - Delete project
```

---

## 2. User Management

### 2.1 Students

#### What to Control
| Field | Type | Description | Admin Access |
|-------|------|-------------|--------------|
| id | UUID | User identifier | View only |
| email | String | User email | View, search |
| full_name | String | Display name | View, edit |
| email_verified | Boolean | Verification status | View, toggle |
| created_at | Timestamp | Registration date | View only |
| last_login | Timestamp | Last activity | View only |
| is_active | Boolean | Account status | Toggle |
| profile_photo | String | Avatar URL | View only |
| bio | Text | User bio | View only |

#### How to Control
- **Search**: By email, name, or ID
- **Filter**: By status, date range, enrollment
- **Verify Email**: Manual verification toggle
- **Suspend/Activate**: Account status toggle
- **Impersonate**: View as student (read-only)
- **Export**: CSV export of user data

#### Admin Actions
```
GET    /api/admin/students                    - List all students
GET    /api/admin/students/:id                - Get student details
PUT    /api/admin/students/:id                - Update student
PATCH  /api/admin/students/:id/verify         - Verify email
PATCH  /api/admin/students/:id/status         - Toggle active status
GET    /api/admin/students/:id/activity       - Get activity log
POST   /api/admin/students/export             - Export to CSV
```

---

### 2.2 Enrollments

#### What to Control
| Field | Type | Description | Admin Access |
|-------|------|-------------|--------------|
| id | Integer | Enrollment ID | View only |
| user_id | UUID | Student | View, search |
| course_id | Integer | Course | View, search |
| credits_paid | Integer | Credits spent | View only |
| enrolled_at | Timestamp | Enrollment date | View only |
| completed_at | Timestamp | Completion date | View only |
| status | Enum | active/completed/dropped | View, change |

#### How to Control
- **View All**: List with filters (course, student, status)
- **Manual Enroll**: Enroll student in course (free)
- **Revoke Access**: Remove enrollment
- **Extend Access**: Grant additional time
- **Bulk Enroll**: Enroll multiple students

#### Admin Actions
```
GET    /api/admin/enrollments                 - List enrollments
POST   /api/admin/enrollments                 - Manual enrollment
DELETE /api/admin/enrollments/:id             - Revoke enrollment
PATCH  /api/admin/enrollments/:id/status      - Change status
POST   /api/admin/enrollments/bulk            - Bulk enroll
GET    /api/admin/courses/:id/enrollments     - Course enrollments
GET    /api/admin/students/:id/enrollments    - Student enrollments
```

---

### 2.3 Credits Management

#### What to Control
| Field | Type | Description | Admin Access |
|-------|------|-------------|--------------|
| balance | Integer | Current credits | View, adjust |
| total_earned | Integer | All-time earned | View only |
| total_spent | Integer | All-time spent | View only |
| transactions | Array | Credit history | View only |

#### Transaction Types
- `welcome_bonus` - Initial signup credits
- `enrollment` - Course purchase (debit)
- `refund` - Course refund (credit)
- `admin_adjustment` - Manual adjustment
- `achievement` - Gamification reward
- `referral` - Referral bonus

#### How to Control
- **View Balance**: See any student's credits
- **Add Credits**: Grant bonus credits with reason
- **Deduct Credits**: Remove credits with reason
- **Transaction History**: Full audit trail
- **Bulk Adjustment**: Adjust multiple students

#### Admin Actions
```
GET    /api/admin/students/:id/credits              - Get balance
POST   /api/admin/students/:id/credits/adjust       - Adjust credits
GET    /api/admin/students/:id/credits/transactions - Transaction history
POST   /api/admin/credits/bulk-adjust               - Bulk adjustment
GET    /api/admin/credits/summary                   - Platform-wide summary
```

---

### 2.4 Progress Tracking

#### What to View
- **Lesson Progress**: Which lessons completed, when
- **Lab Completions**: Labs finished, attempts, time spent
- **Test Attempts**: Scores, attempts used, answers given
- **Project Status**: Submitted, pending, approved
- **Overall Progress**: % complete per course

#### How to Control
- **View Progress**: Detailed breakdown by student/course
- **Reset Progress**: Clear lesson completions (with confirmation)
- **Grant Completion**: Mark lesson/lab as complete
- **Override Test**: Allow extra attempt or pass

#### Admin Actions
```
GET    /api/admin/students/:id/progress              - Overall progress
GET    /api/admin/students/:id/courses/:cId/progress - Course progress
PATCH  /api/admin/students/:id/lessons/:lId/complete - Mark complete
PATCH  /api/admin/students/:id/tests/:tId/override   - Override test
DELETE /api/admin/students/:id/courses/:cId/progress - Reset progress
```

---

## 3. Analytics & Reporting

### 3.1 Dashboard Metrics

#### Real-Time Metrics
| Metric | Description | Update Frequency |
|--------|-------------|------------------|
| Total Students | All registered users | Real-time |
| Active Students | Active in last 7 days | Hourly |
| New Signups Today | Today's registrations | Real-time |
| Active Sessions | Currently online | Real-time |
| Lessons Completed Today | Today's completions | Real-time |
| Tests Passed Today | Today's passes | Real-time |

#### Trend Metrics
| Metric | Period | Chart Type |
|--------|--------|------------|
| Signups | Daily/Weekly/Monthly | Line chart |
| Enrollments | Daily/Weekly/Monthly | Bar chart |
| Completions | Daily/Weekly/Monthly | Line chart |
| Revenue (Credits) | Daily/Weekly/Monthly | Area chart |

#### Admin Actions
```
GET    /api/admin/analytics/dashboard        - Dashboard summary
GET    /api/admin/analytics/trends           - Trend data
GET    /api/admin/analytics/real-time        - Live metrics
```

---

### 3.2 Course Analytics

#### Per-Course Metrics
| Metric | Description |
|--------|-------------|
| Total Enrollments | Students enrolled |
| Completion Rate | % who finished |
| Average Progress | Mean % complete |
| Drop-off Points | Where students quit |
| Average Time | Time to complete |
| Test Pass Rate | % passing tests |
| Rating | Average student rating |

#### Content Analytics
- **Lesson Engagement**: Time spent per lesson
- **Lab Difficulty**: Attempts, success rate
- **Question Analysis**: Per-question success rate
- **Common Mistakes**: Most failed questions

#### Admin Actions
```
GET    /api/admin/courses/:id/analytics      - Course overview
GET    /api/admin/courses/:id/funnel         - Drop-off funnel
GET    /api/admin/courses/:id/lessons/stats  - Lesson stats
GET    /api/admin/courses/:id/test/analysis  - Question analysis
```

---

### 3.3 Revenue & Transactions

#### Credit Analytics
| Metric | Description |
|--------|-------------|
| Total Credits Issued | All-time credits given |
| Total Credits Spent | All-time enrollments |
| Current Circulation | Credits in user wallets |
| Revenue by Course | Credits spent per course |
| Refunds | Credits refunded |

#### Reports
- Daily/Weekly/Monthly transaction summary
- Top-selling courses
- Credit distribution (how many users have X credits)
- Refund rate

#### Admin Actions
```
GET    /api/admin/analytics/revenue          - Revenue overview
GET    /api/admin/analytics/transactions     - Transaction log
GET    /api/admin/analytics/courses/revenue  - Per-course revenue
POST   /api/admin/reports/generate           - Generate report
```

---

## 4. System Settings

### 4.1 AI Tutor (Usha) Configuration

#### What to Control
| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| enabled | Boolean | AI tutor active | true |
| rate_limit_per_minute | Integer | Max requests/min | 10 |
| rate_limit_per_hour | Integer | Max requests/hour | 100 |
| model | String | OpenAI model | gpt-4.1-mini |
| max_tokens | Integer | Response length | 1000 |
| temperature | Float | Creativity (0-1) | 0.7 |
| system_prompt | Text | Base personality | (preset) |
| forbidden_topics | Array | Topics to avoid | [] |

#### Conversation Monitoring
- View recent conversations
- Flag inappropriate content
- Export conversation logs
- Clear conversation history

#### Admin Actions
```
GET    /api/admin/usha/config               - Get config
PUT    /api/admin/usha/config               - Update config
GET    /api/admin/usha/conversations        - List conversations
GET    /api/admin/usha/conversations/:id    - View conversation
DELETE /api/admin/usha/conversations/:id    - Delete conversation
GET    /api/admin/usha/usage                - Usage statistics
```

---

### 4.2 Certificates

#### What to Control
| Setting | Type | Description |
|---------|------|-------------|
| template | HTML | Certificate template |
| logo | Image | Organization logo |
| signature | Image | Authorized signature |
| validity | Text | Certificate validity text |
| verification_url | String | Public verification URL |

#### Certificate Management
- View all issued certificates
- Revoke certificates
- Regenerate certificates
- Verify certificate authenticity
- Export certificate records

#### Admin Actions
```
GET    /api/admin/certificates              - List certificates
GET    /api/admin/certificates/:id          - View certificate
PATCH  /api/admin/certificates/:id/revoke   - Revoke certificate
POST   /api/admin/certificates/:id/regenerate - Regenerate
GET    /api/admin/certificates/template     - Get template
PUT    /api/admin/certificates/template     - Update template
```

---

### 4.3 Notifications

#### Notification Types
- **System Announcements**: Platform-wide notices
- **Course Updates**: New content available
- **Reminders**: Incomplete courses, expiring access
- **Achievements**: Badges, milestones
- **Custom**: Admin-created messages

#### How to Control
- **Create Announcement**: Title, message, target audience
- **Schedule**: Send now or schedule for later
- **Target**: All users, specific course, individual
- **Track**: View delivery and read status

#### Admin Actions
```
GET    /api/admin/notifications             - List notifications
POST   /api/admin/notifications             - Create notification
PUT    /api/admin/notifications/:id         - Update notification
DELETE /api/admin/notifications/:id         - Delete notification
POST   /api/admin/notifications/:id/send    - Send now
GET    /api/admin/notifications/:id/stats   - Delivery stats
```

---

### 4.4 Platform Settings

#### General Settings
| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| welcome_credits | Integer | Signup bonus | 500 |
| referral_credits | Integer | Referral bonus | 100 |
| support_email | String | Support contact | support@... |
| privacy_email | String | Privacy contact | privacy@... |
| max_enrollments | Integer | Max courses/user | 0 (unlimited) |
| maintenance_mode | Boolean | Site offline | false |

#### Email Templates
- Welcome email
- Email verification
- Password reset
- Course enrollment
- Certificate issued
- Test results

#### Admin Actions
```
GET    /api/admin/settings                  - Get all settings
PUT    /api/admin/settings                  - Update settings
GET    /api/admin/settings/emails           - Get email templates
PUT    /api/admin/settings/emails/:id       - Update template
POST   /api/admin/settings/emails/test      - Send test email
```

---

## 5. Content Moderation

### 5.1 Project Submissions

#### Submission Status Flow
```
Submitted → Under Review → Approved/Rejected → (Resubmit)
```

#### What to Review
| Field | Description |
|-------|-------------|
| student | Who submitted |
| project | Which project |
| submission_url | GitHub/URL submitted |
| submitted_at | When submitted |
| files | Attached files |
| notes | Student comments |

#### Review Actions
- **Approve**: Mark as complete, issue certificate eligibility
- **Reject**: Request changes, provide feedback
- **Request Revision**: Ask for specific changes
- **Score**: Assign rubric scores

#### Admin Actions
```
GET    /api/admin/submissions               - List all submissions
GET    /api/admin/submissions/pending       - Pending review
GET    /api/admin/submissions/:id           - View submission
PATCH  /api/admin/submissions/:id/approve   - Approve
PATCH  /api/admin/submissions/:id/reject    - Reject with feedback
POST   /api/admin/submissions/:id/feedback  - Add feedback
```

---

### 5.2 Marksheets

#### What to Control
- **Generate**: Create marksheet for student
- **Verify**: Check marksheet authenticity
- **Revoke**: Invalidate marksheet
- **Regenerate**: Update with new data

#### Marksheet Data
- Student details
- All completed courses with grades
- Test scores and grades
- Project statuses
- CGPA calculation
- Classification (Distinction/First Class/Pass)

#### Admin Actions
```
GET    /api/admin/marksheets                    - List marksheets
GET    /api/admin/marksheets/:id                - View marksheet
POST   /api/admin/students/:id/marksheet        - Generate marksheet
PATCH  /api/admin/marksheets/:id/revoke         - Revoke
POST   /api/admin/marksheets/:id/regenerate     - Regenerate
GET    /api/admin/marksheets/verify/:code       - Verify authenticity
```

---

## 6. Admin User Management

### 6.1 Admin Roles

| Role | Permissions |
|------|-------------|
| Super Admin | Full access to everything |
| Content Manager | Courses, modules, lessons, labs, tests, projects |
| User Manager | Students, enrollments, credits |
| Analyst | View-only analytics and reports |
| Support | Student issues, notifications |

### 6.2 Admin Actions
```
GET    /api/admin/admins                    - List admin users
POST   /api/admin/admins                    - Create admin
PUT    /api/admin/admins/:id                - Update admin
DELETE /api/admin/admins/:id                - Remove admin
GET    /api/admin/admins/:id/activity       - Admin activity log
```

---

## 7. Database Schema Reference

### Content Tables (Shared - Admin manages, SHISHYA reads)

```sql
-- Courses
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(200),
    level VARCHAR(20) NOT NULL,
    duration VARCHAR(50),
    skills TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    is_free BOOLEAN DEFAULT false,
    credit_cost INTEGER DEFAULT 0,
    test_required BOOLEAN DEFAULT true,
    project_required BOOLEAN DEFAULT true,
    thumbnail_url TEXT,
    instructor_id VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Modules
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    video_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Labs
CREATE TABLE labs (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id),
    title VARCHAR(100) NOT NULL,
    objective TEXT,
    instructions TEXT NOT NULL,
    difficulty VARCHAR(20),
    language VARCHAR(20) NOT NULL,
    starter_code TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    hints TEXT,
    solution_code TEXT,
    order_index INTEGER NOT NULL,
    time_limit_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tests
CREATE TABLE tests (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    passing_percentage INTEGER NOT NULL,
    questions JSONB NOT NULL,
    max_attempts INTEGER DEFAULT 3,
    shuffle_questions BOOLEAN DEFAULT true,
    shuffle_options BOOLEAN DEFAULT true,
    show_correct_answers BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    requirements JSONB NOT NULL,
    resources JSONB,
    rubric JSONB,
    estimated_hours INTEGER,
    submission_type VARCHAR(20) DEFAULT 'url',
    deadline_days INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### User Tables (SHISHYA manages, Admin views/adjusts)

```sql
-- Students (shishya_users)
CREATE TABLE shishya_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email_verified BOOLEAN DEFAULT false,
    otp_hash VARCHAR(255),
    otp_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Credits
CREATE TABLE user_credits (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES shishya_users(id),
    balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Credit Transactions
CREATE TABLE credit_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES shishya_users(id),
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments
CREATE TABLE course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES shishya_users(id),
    course_id INTEGER REFERENCES courses(id),
    credits_paid INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);
```

---

## 8. Security Considerations

### Authentication
- Separate admin user table
- Strong password requirements (12+ chars)
- Two-factor authentication (2FA)
- Session timeout (30 minutes)
- IP whitelisting (optional)

### Authorization
- Role-based access control (RBAC)
- Action-level permissions
- Audit logging for all changes
- Sensitive data masking

### Data Protection
- All API calls over HTTPS
- Database connection encryption
- PII data encryption at rest
- GDPR compliance features

---

## 9. UI/UX Guidelines

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  Admin Portal               [Search] [Notif] [Profile]  │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│  Navigation  │              Main Content Area                   │
│              │                                                  │
│  - Dashboard │  ┌─────────────────────────────────────────────┐ │
│  - Courses   │  │  Metrics Cards / Charts / Tables            │ │
│  - Students  │  │                                             │ │
│  - Analytics │  │                                             │ │
│  - Settings  │  │                                             │ │
│              │  └─────────────────────────────────────────────┘ │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### Design Principles
- Clean, professional interface
- Data tables with sorting/filtering
- Inline editing where possible
- Confirmation dialogs for destructive actions
- Toast notifications for feedback
- Loading states and skeletons
- Responsive design (tablet-friendly)

---

## 10. Implementation Phases

### Phase 1: Core Content Management
- [ ] Admin authentication
- [ ] Course CRUD
- [ ] Module CRUD
- [ ] Lesson CRUD with rich editor
- [ ] Basic dashboard

### Phase 2: Labs & Assessments
- [ ] Lab builder with code editor
- [ ] Test builder with question types
- [ ] Project manager
- [ ] Preview modes

### Phase 3: User Management
- [ ] Student listing and search
- [ ] Enrollment management
- [ ] Credit adjustments
- [ ] Progress viewing

### Phase 4: Analytics & Settings
- [ ] Dashboard metrics
- [ ] Course analytics
- [ ] Platform settings
- [ ] Notification system

### Phase 5: Advanced Features
- [ ] AI tutor management
- [ ] Certificate templates
- [ ] Project review system
- [ ] Marksheet generation
- [ ] Admin roles/permissions

---

## Conclusion

This Admin Control Panel provides complete management capabilities for the SHISHYA student portal. By sharing the same database, content changes are immediately reflected in the student-facing app, while user data remains synchronized across both platforms.

The modular API design allows for incremental implementation while maintaining a clear separation between admin and student functionality.
