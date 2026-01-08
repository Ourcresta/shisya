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

## 11. Database Connection & Configuration

### 11.1 Environment Variables

```bash
# Admin Portal Environment Variables
ADMIN_DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
ADMIN_SESSION_SECRET=your-secure-session-secret-min-32-chars
ADMIN_JWT_SECRET=your-jwt-secret-for-api-tokens
ADMIN_API_KEY=api-key-for-shishya-to-fetch-content

# Shared with SHISHYA Portal
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# External Services
OPENAI_API_KEY=sk-xxxx  # For AI Tutor configuration
RESEND_API_KEY=re_xxxx  # For email notifications

# Application Settings
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://shishya.yourplatform.com
```

### 11.2 Database Connection Pool

```typescript
// server/db/connection.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Connection Pool Configuration
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,                    // Maximum connections in pool
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Timeout for new connections
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Pool event handlers
pool.on('connect', (client) => {
  console.log('[Database] New client connected to pool');
});

pool.on('error', (err, client) => {
  console.error('[Database] Unexpected error on idle client', err);
});

// Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT 1 as health');
    return result.rows[0].health === 1;
  } catch (error) {
    console.error('[Database] Health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
  console.log('[Database] Connection pool closed');
}
```

### 11.3 Connection Usage Patterns

```typescript
// Transaction pattern for multi-table operations
async function createCourseWithModules(courseData, modules) {
  return await db.transaction(async (tx) => {
    // Insert course
    const [course] = await tx.insert(schema.courses)
      .values(courseData)
      .returning();
    
    // Insert modules with course reference
    const moduleInserts = modules.map((m, idx) => ({
      ...m,
      courseId: course.id,
      orderIndex: idx + 1
    }));
    
    await tx.insert(schema.modules).values(moduleInserts);
    
    return course;
  });
}

// Query with joins
async function getCourseWithDetails(courseId: number) {
  return await db.query.courses.findFirst({
    where: eq(schema.courses.id, courseId),
    with: {
      modules: {
        orderBy: [asc(schema.modules.orderIndex)],
        with: {
          lessons: {
            orderBy: [asc(schema.lessons.orderIndex)]
          }
        }
      },
      labs: true,
      tests: true,
      projects: true
    }
  });
}
```

---

## 12. Complete Database Schema

### 12.1 All Tables with Full Details

```sql
-- =====================================================
-- ADMIN TABLES (Admin Portal Only)
-- =====================================================

-- Admin Users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'content_manager',
    -- Roles: super_admin, content_manager, user_manager, analyst, support
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id)
);

-- Admin Sessions
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Admin Activity Log (Audit Trail)
CREATE TABLE admin_activity_log (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    -- Actions: create, update, delete, login, logout, export, etc.
    entity_type VARCHAR(50) NOT NULL,
    -- Entity types: course, module, lesson, student, enrollment, etc.
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_admin ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_entity ON admin_activity_log(entity_type, entity_id);
CREATE INDEX idx_admin_activity_date ON admin_activity_log(created_at);

-- =====================================================
-- CONTENT TABLES (Admin Writes, SHISHYA Reads)
-- =====================================================

-- Courses
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(200),
    level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration VARCHAR(50),
    skills TEXT, -- Comma-separated or JSON array
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_free BOOLEAN DEFAULT false,
    credit_cost INTEGER DEFAULT 0 CHECK (credit_cost >= 0),
    test_required BOOLEAN DEFAULT true,
    project_required BOOLEAN DEFAULT true,
    thumbnail_url TEXT,
    instructor_id VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    price DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_is_free ON courses(is_free);

-- Modules
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_locked BOOLEAN DEFAULT false,
    unlock_after_module INTEGER REFERENCES modules(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

CREATE INDEX idx_modules_course ON modules(course_id);

-- Lessons
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'markdown', -- markdown, html, video
    video_url TEXT,
    video_duration_seconds INTEGER,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    -- Attachments: [{ "name": "file.pdf", "url": "...", "size": 1024 }]
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(module_id, order_index)
);

CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_preview ON lessons(is_preview);

-- Labs
CREATE TABLE labs (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    objective TEXT,
    instructions TEXT NOT NULL,
    -- Can be plain text or JSON array of steps
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    language VARCHAR(20) NOT NULL, -- javascript, python, typescript, html, css
    starter_code TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    solution_code TEXT, -- Hidden from students
    hints JSONB DEFAULT '[]',
    -- Hints: ["First hint", "Second hint", "Final hint with more detail"]
    test_cases JSONB DEFAULT '[]',
    -- Test cases: [{ "input": "...", "expected": "..." }]
    order_index INTEGER NOT NULL,
    time_limit_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_labs_course ON labs(course_id);
CREATE INDEX idx_labs_lesson ON labs(lesson_id);

-- Tests
CREATE TABLE tests (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    instructions TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    passing_percentage INTEGER NOT NULL CHECK (passing_percentage BETWEEN 1 AND 100),
    questions JSONB NOT NULL,
    -- Questions array structure defined in section 1.5
    max_attempts INTEGER DEFAULT 3 CHECK (max_attempts > 0),
    shuffle_questions BOOLEAN DEFAULT true,
    shuffle_options BOOLEAN DEFAULT true,
    show_correct_answers BOOLEAN DEFAULT false,
    show_explanations BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tests_course ON tests(course_id);

-- Projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    requirements JSONB NOT NULL,
    -- Requirements: ["Feature 1", "Feature 2", ...]
    resources JSONB DEFAULT '[]',
    -- Resources: [{ "title": "MDN Docs", "url": "..." }]
    rubric JSONB,
    -- Rubric structure defined in section 1.6
    estimated_hours INTEGER,
    submission_type VARCHAR(20) DEFAULT 'url' CHECK (submission_type IN ('url', 'file', 'github', 'replit')),
    deadline_days INTEGER, -- Days after enrollment
    sample_solution_url TEXT, -- Admin only
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_course ON projects(course_id);

-- =====================================================
-- USER TABLES (SHISHYA Writes, Admin Reads/Adjusts)
-- =====================================================

-- Students
CREATE TABLE shishya_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    bio TEXT,
    profile_photo TEXT, -- Base64 or URL
    phone VARCHAR(20),
    location VARCHAR(100),
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    otp_hash VARCHAR(255),
    otp_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_public_portfolio BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    -- Preferences: { "theme": "dark", "emailNotifications": true }
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON shishya_users(email);
CREATE INDEX idx_users_username ON shishya_users(username);
CREATE INDEX idx_users_verified ON shishya_users(email_verified);

-- User Credits
CREATE TABLE user_credits (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0 CHECK (balance >= 0),
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    last_transaction_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credits_user ON user_credits(user_id);

-- Credit Transactions
CREATE TABLE credit_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positive for credit, negative for debit
    type VARCHAR(50) NOT NULL,
    -- Types: welcome_bonus, enrollment, refund, admin_adjustment, achievement, referral, purchase
    description TEXT,
    reference_type VARCHAR(50), -- course, order, referral, admin
    reference_id VARCHAR(100),
    balance_after INTEGER NOT NULL,
    admin_id UUID REFERENCES admin_users(id), -- For admin adjustments
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_transactions_type ON credit_transactions(type);
CREATE INDEX idx_transactions_date ON credit_transactions(created_at);

-- Course Enrollments
CREATE TABLE course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    credits_paid INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'expired')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    enrolled_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP, -- First lesson accessed
    completed_at TIMESTAMP,
    expires_at TIMESTAMP, -- For time-limited access
    enrolled_by VARCHAR(20) DEFAULT 'self', -- self, admin, gift, promotion
    admin_id UUID REFERENCES admin_users(id), -- If enrolled by admin
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_status ON course_enrollments(status);

-- Lesson Progress
CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    notes TEXT, -- Student's personal notes
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_course ON lesson_progress(course_id);

-- Lab Attempts
CREATE TABLE lab_attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    output TEXT,
    is_correct BOOLEAN DEFAULT false,
    hints_used INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lab_attempts_user ON lab_attempts(user_id);
CREATE INDEX idx_lab_attempts_lab ON lab_attempts(lab_id);

-- Lab Completions (Best attempt)
CREATE TABLE lab_completions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    final_code TEXT NOT NULL,
    attempts_count INTEGER DEFAULT 1,
    total_time_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lab_id)
);

CREATE INDEX idx_lab_completions_user ON lab_completions(user_id);
CREATE INDEX idx_lab_completions_course ON lab_completions(course_id);

-- Test Attempts
CREATE TABLE test_attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    answers JSONB NOT NULL,
    -- Answers: { "q1": 2, "q2": 0, "q3": 1 }
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    questions_correct INTEGER DEFAULT 0,
    questions_total INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    time_taken_seconds INTEGER,
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX idx_test_attempts_test ON test_attempts(test_id);
CREATE INDEX idx_test_attempts_passed ON test_attempts(passed);

-- Project Submissions
CREATE TABLE project_submissions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    submission_url TEXT NOT NULL,
    submission_type VARCHAR(20) NOT NULL,
    files JSONB DEFAULT '[]',
    -- Files: [{ "name": "...", "url": "...", "size": ... }]
    notes TEXT, -- Student notes
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'revision_requested')),
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    rubric_scores JSONB,
    -- Rubric scores: { "functionality": 35, "code_quality": 25, "ui_ux": 28 }
    feedback TEXT, -- Reviewer feedback
    reviewed_by UUID REFERENCES admin_users(id),
    reviewed_at TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submissions_user ON project_submissions(user_id);
CREATE INDEX idx_submissions_project ON project_submissions(project_id);
CREATE INDEX idx_submissions_status ON project_submissions(status);

-- =====================================================
-- SYSTEM TABLES (Admin Manages, Both Use)
-- =====================================================

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    -- Format: CERT-XXXX-XXXX-XXXX
    student_name VARCHAR(100) NOT NULL,
    course_title VARCHAR(100) NOT NULL,
    completion_date DATE NOT NULL,
    grade VARCHAR(10), -- O, A+, A, B+, B, C, F
    score INTEGER,
    skills JSONB DEFAULT '[]',
    is_valid BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES admin_users(id),
    revoke_reason TEXT,
    pdf_url TEXT,
    qr_code_data TEXT,
    issued_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);

-- Marksheets
CREATE TABLE marksheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    marksheet_number VARCHAR(50) UNIQUE NOT NULL,
    -- Format: MS-XXXX-XXXX
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    courses_data JSONB NOT NULL,
    -- Courses: [{ courseId, title, code, credits, testScore, grade, projectStatus, status }]
    total_credits INTEGER DEFAULT 0,
    courses_passed INTEGER DEFAULT 0,
    courses_failed INTEGER DEFAULT 0,
    cgpa DECIMAL(3, 2), -- 0.00 to 10.00
    classification VARCHAR(50), -- Distinction, First Class, Second Class, Pass
    is_valid BOOLEAN DEFAULT true,
    generated_at TIMESTAMP DEFAULT NOW(),
    pdf_url TEXT,
    qr_code_data TEXT,
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_marksheets_user ON marksheets(user_id);
CREATE INDEX idx_marksheets_number ON marksheets(marksheet_number);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'announcement',
    -- Types: announcement, course_update, reminder, achievement, system
    target_type VARCHAR(50) DEFAULT 'all',
    -- Targets: all, course, user, role
    target_ids JSONB DEFAULT '[]',
    -- For course: [1, 2, 3], for user: ["uuid1", "uuid2"]
    action_url TEXT,
    action_text VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'normal',
    -- Priority: low, normal, high, urgent
    is_published BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_published ON notifications(is_published);
CREATE INDEX idx_notifications_target ON notifications(target_type);

-- User Notifications (Read status per user)
CREATE TABLE user_notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, notification_id)
);

CREATE INDEX idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(is_read);

-- Usha Conversations
CREATE TABLE usha_conversations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    session_id UUID DEFAULT gen_random_uuid(),
    context_type VARCHAR(50),
    -- Context: lesson, lab, project, general
    context_id INTEGER, -- lesson_id, lab_id, project_id
    course_id INTEGER REFERENCES courses(id),
    messages JSONB DEFAULT '[]',
    -- Messages: [{ role: "user"|"assistant", content: "...", timestamp: "..." }]
    tokens_used INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT false,
    flag_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usha_user ON usha_conversations(user_id);
CREATE INDEX idx_usha_context ON usha_conversations(context_type, context_id);
CREATE INDEX idx_usha_flagged ON usha_conversations(is_flagged);

-- Platform Settings
CREATE TABLE platform_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    -- Categories: general, credits, email, ai, security
    is_public BOOLEAN DEFAULT false, -- Visible to SHISHYA
    updated_by UUID REFERENCES admin_users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Default settings
INSERT INTO platform_settings (key, value, category, description) VALUES
('welcome_credits', '500', 'credits', 'Credits given to new users'),
('referral_credits', '100', 'credits', 'Credits for referrer'),
('referral_bonus', '50', 'credits', 'Credits for referred user'),
('usha_rate_limit_minute', '10', 'ai', 'Max AI requests per minute'),
('usha_rate_limit_hour', '100', 'ai', 'Max AI requests per hour'),
('usha_model', '"gpt-4.1-mini"', 'ai', 'OpenAI model for Usha'),
('maintenance_mode', 'false', 'general', 'Platform maintenance mode'),
('support_email', '"support@ourshiksha.com"', 'general', 'Support email'),
('max_file_upload_mb', '10', 'general', 'Max file upload size');

-- Email Templates
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '[]',
    -- Variables: ["{{user_name}}", "{{course_title}}"]
    is_active BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES admin_users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Default templates
INSERT INTO email_templates (name, subject, body_html, variables) VALUES
('welcome', 'Welcome to OurShiksha!', '<h1>Welcome {{user_name}}!</h1><p>...</p>', '["user_name"]'),
('email_verification', 'Verify your email', '<p>Your OTP: {{otp_code}}</p>', '["otp_code", "user_name"]'),
('course_enrolled', 'You are enrolled in {{course_title}}', '<p>Start learning now!</p>', '["user_name", "course_title"]'),
('certificate_issued', 'Certificate for {{course_title}}', '<p>Congratulations!</p>', '["user_name", "course_title", "certificate_url"]');

-- =====================================================
-- ANALYTICS TABLES (Admin Only)
-- =====================================================

-- Daily Metrics Snapshot
CREATE TABLE daily_metrics (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0, -- Logged in that day
    total_enrollments INTEGER DEFAULT 0,
    new_enrollments INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    tests_taken INTEGER DEFAULT 0,
    tests_passed INTEGER DEFAULT 0,
    labs_completed INTEGER DEFAULT 0,
    projects_submitted INTEGER DEFAULT 0,
    credits_issued INTEGER DEFAULT 0,
    credits_spent INTEGER DEFAULT 0,
    usha_conversations INTEGER DEFAULT 0,
    usha_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_daily_metrics_date ON daily_metrics(date);

-- Course Analytics (Aggregated)
CREATE TABLE course_analytics (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    enrollments INTEGER DEFAULT 0,
    active_learners INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    labs_completed INTEGER DEFAULT 0,
    tests_taken INTEGER DEFAULT 0,
    tests_passed INTEGER DEFAULT 0,
    projects_submitted INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    avg_progress DECIMAL(5, 2) DEFAULT 0,
    avg_test_score DECIMAL(5, 2) DEFAULT 0,
    credits_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(course_id, date)
);

CREATE INDEX idx_course_analytics_course ON course_analytics(course_id);
CREATE INDEX idx_course_analytics_date ON course_analytics(date);

-- User Activity Log (For behavior tracking)
CREATE TABLE user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES shishya_users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    -- Types: login, lesson_view, lesson_complete, lab_start, lab_complete, test_start, test_submit, etc.
    entity_type VARCHAR(50),
    entity_id INTEGER,
    metadata JSONB DEFAULT '{}',
    -- Metadata: { duration: 120, score: 85 }
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_activity_user ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_type ON user_activity_log(activity_type);
CREATE INDEX idx_user_activity_date ON user_activity_log(created_at);
```

---

## 13. Core Functions & Stored Procedures

### 13.1 Credit Management Functions

```sql
-- Function: Adjust user credits with transaction logging
CREATE OR REPLACE FUNCTION adjust_user_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id VARCHAR(100) DEFAULT NULL,
    p_admin_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Update balance
    UPDATE user_credits 
    SET 
        balance = balance + p_amount,
        total_earned = CASE WHEN p_amount > 0 THEN total_earned + p_amount ELSE total_earned END,
        total_spent = CASE WHEN p_amount < 0 THEN total_spent + ABS(p_amount) ELSE total_spent END,
        last_transaction_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING balance INTO v_new_balance;
    
    -- Log transaction
    INSERT INTO credit_transactions 
        (user_id, amount, type, description, reference_type, reference_id, balance_after, admin_id)
    VALUES 
        (p_user_id, p_amount, p_type, p_description, p_reference_type, p_reference_id, v_new_balance, p_admin_id);
    
    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- Function: Enroll user in course with credit deduction
CREATE OR REPLACE FUNCTION enroll_user_in_course(
    p_user_id UUID,
    p_course_id INTEGER,
    p_admin_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_credit_cost INTEGER;
    v_user_balance INTEGER;
    v_is_free BOOLEAN;
BEGIN
    -- Get course details
    SELECT credit_cost, is_free INTO v_credit_cost, v_is_free
    FROM courses WHERE id = p_course_id;
    
    -- Get user balance
    SELECT balance INTO v_user_balance
    FROM user_credits WHERE user_id = p_user_id;
    
    -- Check if can afford (or free)
    IF NOT v_is_free AND v_user_balance < v_credit_cost THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;
    
    -- Create enrollment
    INSERT INTO course_enrollments (user_id, course_id, credits_paid, enrolled_by, admin_id)
    VALUES (
        p_user_id, 
        p_course_id, 
        CASE WHEN v_is_free THEN 0 ELSE v_credit_cost END,
        CASE WHEN p_admin_id IS NOT NULL THEN 'admin' ELSE 'self' END,
        p_admin_id
    );
    
    -- Deduct credits if not free
    IF NOT v_is_free THEN
        PERFORM adjust_user_credits(
            p_user_id, 
            -v_credit_cost, 
            'enrollment',
            'Course enrollment',
            'course',
            p_course_id::VARCHAR
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 13.2 Analytics Functions

```sql
-- Function: Calculate course completion percentage
CREATE OR REPLACE FUNCTION calculate_course_progress(
    p_user_id UUID,
    p_course_id INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
    v_progress INTEGER;
BEGIN
    -- Count total lessons
    SELECT COUNT(*) INTO v_total_lessons
    FROM lessons WHERE course_id = p_course_id;
    
    IF v_total_lessons = 0 THEN
        RETURN 0;
    END IF;
    
    -- Count completed lessons
    SELECT COUNT(*) INTO v_completed_lessons
    FROM lesson_progress 
    WHERE user_id = p_user_id 
      AND course_id = p_course_id 
      AND status = 'completed';
    
    v_progress := (v_completed_lessons * 100) / v_total_lessons;
    
    -- Update enrollment progress
    UPDATE course_enrollments
    SET progress_percentage = v_progress
    WHERE user_id = p_user_id AND course_id = p_course_id;
    
    RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate grade from score
CREATE OR REPLACE FUNCTION calculate_grade(p_score INTEGER)
RETURNS VARCHAR(5) AS $$
BEGIN
    RETURN CASE
        WHEN p_score >= 90 THEN 'O'
        WHEN p_score >= 80 THEN 'A+'
        WHEN p_score >= 70 THEN 'A'
        WHEN p_score >= 60 THEN 'B+'
        WHEN p_score >= 50 THEN 'B'
        WHEN p_score >= 40 THEN 'C'
        ELSE 'F'
    END;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate daily metrics snapshot
CREATE OR REPLACE FUNCTION generate_daily_metrics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_metrics (
        date, total_users, new_users, active_users, 
        total_enrollments, new_enrollments, completions,
        tests_taken, tests_passed, labs_completed,
        projects_submitted, credits_issued, credits_spent,
        usha_conversations, usha_tokens
    )
    SELECT
        p_date,
        (SELECT COUNT(*) FROM shishya_users),
        (SELECT COUNT(*) FROM shishya_users WHERE DATE(created_at) = p_date),
        (SELECT COUNT(DISTINCT user_id) FROM user_activity_log WHERE DATE(created_at) = p_date),
        (SELECT COUNT(*) FROM course_enrollments),
        (SELECT COUNT(*) FROM course_enrollments WHERE DATE(enrolled_at) = p_date),
        (SELECT COUNT(*) FROM course_enrollments WHERE DATE(completed_at) = p_date),
        (SELECT COUNT(*) FROM test_attempts WHERE DATE(submitted_at) = p_date),
        (SELECT COUNT(*) FROM test_attempts WHERE DATE(submitted_at) = p_date AND passed = true),
        (SELECT COUNT(*) FROM lab_completions WHERE DATE(completed_at) = p_date),
        (SELECT COUNT(*) FROM project_submissions WHERE DATE(submitted_at) = p_date),
        (SELECT COALESCE(SUM(amount), 0) FROM credit_transactions WHERE DATE(created_at) = p_date AND amount > 0),
        (SELECT COALESCE(SUM(ABS(amount)), 0) FROM credit_transactions WHERE DATE(created_at) = p_date AND amount < 0),
        (SELECT COUNT(*) FROM usha_conversations WHERE DATE(created_at) = p_date),
        (SELECT COALESCE(SUM(tokens_used), 0) FROM usha_conversations WHERE DATE(created_at) = p_date)
    ON CONFLICT (date) DO UPDATE SET
        total_users = EXCLUDED.total_users,
        new_users = EXCLUDED.new_users,
        active_users = EXCLUDED.active_users,
        total_enrollments = EXCLUDED.total_enrollments,
        new_enrollments = EXCLUDED.new_enrollments,
        completions = EXCLUDED.completions,
        tests_taken = EXCLUDED.tests_taken,
        tests_passed = EXCLUDED.tests_passed,
        labs_completed = EXCLUDED.labs_completed,
        projects_submitted = EXCLUDED.projects_submitted,
        credits_issued = EXCLUDED.credits_issued,
        credits_spent = EXCLUDED.credits_spent,
        usha_conversations = EXCLUDED.usha_conversations,
        usha_tokens = EXCLUDED.usha_tokens;
END;
$$ LANGUAGE plpgsql;
```

### 13.3 Certificate Generation Functions

```sql
-- Function: Generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    v_number VARCHAR(20);
BEGIN
    LOOP
        v_number := 'CERT-' || 
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)) || '-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)) || '-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
        
        -- Check uniqueness
        IF NOT EXISTS (SELECT 1 FROM certificates WHERE certificate_number = v_number) THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Function: Issue certificate
CREATE OR REPLACE FUNCTION issue_certificate(
    p_user_id UUID,
    p_course_id INTEGER
) RETURNS UUID AS $$
DECLARE
    v_cert_id UUID;
    v_cert_number VARCHAR(20);
    v_user_name VARCHAR(100);
    v_course_title VARCHAR(100);
    v_test_score INTEGER;
    v_grade VARCHAR(5);
    v_skills JSONB;
BEGIN
    -- Get user name
    SELECT full_name INTO v_user_name FROM shishya_users WHERE id = p_user_id;
    
    -- Get course info
    SELECT title, skills::JSONB INTO v_course_title, v_skills FROM courses WHERE id = p_course_id;
    
    -- Get best test score
    SELECT MAX(score) INTO v_test_score
    FROM test_attempts 
    WHERE user_id = p_user_id AND course_id = p_course_id AND passed = true;
    
    v_grade := calculate_grade(COALESCE(v_test_score, 0));
    v_cert_number := generate_certificate_number();
    
    INSERT INTO certificates (
        user_id, course_id, certificate_number, student_name,
        course_title, completion_date, grade, score, skills
    ) VALUES (
        p_user_id, p_course_id, v_cert_number, v_user_name,
        v_course_title, CURRENT_DATE, v_grade, v_test_score, v_skills
    )
    RETURNING id INTO v_cert_id;
    
    RETURN v_cert_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 14. API Usage Examples

### 14.1 TypeScript Service Layer

```typescript
// server/services/courseService.ts
import { db } from '../db/connection';
import { courses, modules, lessons, labs, tests, projects } from '../db/schema';
import { eq, asc, desc, and, like, sql } from 'drizzle-orm';

export class CourseService {
  
  // Create course with all related content
  async createCourse(data: CreateCourseInput) {
    return await db.transaction(async (tx) => {
      // Insert course
      const [course] = await tx.insert(courses)
        .values({
          title: data.title,
          description: data.description,
          level: data.level,
          duration: data.duration,
          skills: data.skills.join(','),
          status: 'draft',
          isFree: data.isFree,
          creditCost: data.creditCost,
          testRequired: data.testRequired,
          projectRequired: data.projectRequired,
        })
        .returning();
      
      // Insert modules if provided
      if (data.modules?.length) {
        for (let i = 0; i < data.modules.length; i++) {
          const moduleData = data.modules[i];
          const [module] = await tx.insert(modules)
            .values({
              courseId: course.id,
              title: moduleData.title,
              description: moduleData.description,
              orderIndex: i + 1,
            })
            .returning();
          
          // Insert lessons for this module
          if (moduleData.lessons?.length) {
            await tx.insert(lessons).values(
              moduleData.lessons.map((lesson, idx) => ({
                moduleId: module.id,
                courseId: course.id,
                title: lesson.title,
                content: lesson.content,
                durationMinutes: lesson.durationMinutes,
                orderIndex: idx + 1,
                isPreview: lesson.isPreview || false,
              }))
            );
          }
        }
      }
      
      return course;
    });
  }
  
  // Get course with all details
  async getCourseWithDetails(courseId: number) {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        modules: {
          orderBy: [asc(modules.orderIndex)],
          with: {
            lessons: {
              orderBy: [asc(lessons.orderIndex)],
            },
          },
        },
        labs: {
          orderBy: [asc(labs.orderIndex)],
        },
        tests: true,
        projects: true,
      },
    });
    
    return course;
  }
  
  // List courses with filters and pagination
  async listCourses(options: ListCoursesOptions) {
    const { page = 1, limit = 20, status, level, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    const conditions = [];
    
    if (status) conditions.push(eq(courses.status, status));
    if (level) conditions.push(eq(courses.level, level));
    if (search) conditions.push(like(courses.title, `%${search}%`));
    
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [items, countResult] = await Promise.all([
      db.select()
        .from(courses)
        .where(where)
        .orderBy(sortOrder === 'desc' ? desc(courses[sortBy]) : asc(courses[sortBy]))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ count: sql<number>`count(*)` })
        .from(courses)
        .where(where),
    ]);
    
    return {
      items,
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit),
    };
  }
  
  // Update course
  async updateCourse(courseId: number, data: UpdateCourseInput) {
    const [updated] = await db.update(courses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning();
    
    return updated;
  }
  
  // Publish/Unpublish course
  async setCourseStatus(courseId: number, status: 'draft' | 'published' | 'archived') {
    const updateData: any = { status, updatedAt: new Date() };
    
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }
    
    const [updated] = await db.update(courses)
      .set(updateData)
      .where(eq(courses.id, courseId))
      .returning();
    
    return updated;
  }
  
  // Clone course
  async cloneCourse(courseId: number, newTitle: string) {
    const original = await this.getCourseWithDetails(courseId);
    if (!original) throw new Error('Course not found');
    
    return await db.transaction(async (tx) => {
      // Clone course
      const [newCourse] = await tx.insert(courses)
        .values({
          ...original,
          id: undefined,
          title: newTitle,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: null,
        })
        .returning();
      
      // Clone modules, lessons, labs, tests, projects...
      // (Similar pattern for each related table)
      
      return newCourse;
    });
  }
  
  // Get course analytics
  async getCourseAnalytics(courseId: number) {
    const [enrollmentStats] = await db.execute(sql`
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completions,
        AVG(progress_percentage) as avg_progress
      FROM course_enrollments
      WHERE course_id = ${courseId}
    `);
    
    const [testStats] = await db.execute(sql`
      SELECT
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN passed THEN 1 END) as passed,
        AVG(score) as avg_score
      FROM test_attempts
      WHERE course_id = ${courseId}
    `);
    
    return {
      enrollments: enrollmentStats,
      tests: testStats,
    };
  }
}

export const courseService = new CourseService();
```

### 14.2 Express Route Handlers

```typescript
// server/routes/admin/courses.ts
import { Router } from 'express';
import { courseService } from '../../services/courseService';
import { requireAdmin, requirePermission } from '../../middleware/adminAuth';
import { logAdminActivity } from '../../middleware/auditLog';
import { validateBody } from '../../middleware/validation';
import { createCourseSchema, updateCourseSchema } from '../../schemas/courseSchemas';

const router = Router();

// All routes require admin authentication
router.use(requireAdmin);

// List courses
router.get('/', async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      status: req.query.status as string,
      level: req.query.level as string,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };
    
    const result = await courseService.listCourses(options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get single course with details
router.get('/:id', async (req, res) => {
  try {
    const course = await courseService.getCourseWithDetails(parseInt(req.params.id));
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create course
router.post('/', 
  requirePermission('content:create'),
  validateBody(createCourseSchema),
  logAdminActivity('create', 'course'),
  async (req, res) => {
    try {
      const course = await courseService.createCourse(req.body);
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create course' });
    }
  }
);

// Update course
router.put('/:id',
  requirePermission('content:update'),
  validateBody(updateCourseSchema),
  logAdminActivity('update', 'course'),
  async (req, res) => {
    try {
      const course = await courseService.updateCourse(parseInt(req.params.id), req.body);
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update course' });
    }
  }
);

// Change course status
router.patch('/:id/status',
  requirePermission('content:publish'),
  logAdminActivity('update_status', 'course'),
  async (req, res) => {
    try {
      const { status } = req.body;
      const course = await courseService.setCourseStatus(parseInt(req.params.id), status);
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update course status' });
    }
  }
);

// Clone course
router.post('/:id/clone',
  requirePermission('content:create'),
  logAdminActivity('clone', 'course'),
  async (req, res) => {
    try {
      const { title } = req.body;
      const course = await courseService.cloneCourse(parseInt(req.params.id), title);
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ error: 'Failed to clone course' });
    }
  }
);

// Get course analytics
router.get('/:id/analytics',
  requirePermission('analytics:view'),
  async (req, res) => {
    try {
      const analytics = await courseService.getCourseAnalytics(parseInt(req.params.id));
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
);

export default router;
```

---

## 15. Data Synchronization Between Portals

### 15.1 How Data Flows

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SHARED DATABASE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ADMIN PORTAL                          SHISHYA PORTAL                  │
│   ────────────                          ──────────────                  │
│                                                                         │
│   [WRITE]                               [READ]                          │
│   - courses                             - courses (published only)      │
│   - modules                             - modules                       │
│   - lessons                             - lessons                       │
│   - labs                                - labs (no solutions)           │
│   - tests                               - tests (no answers)            │
│   - projects                            - projects                      │
│   - notifications                       - notifications                 │
│   - platform_settings                   - platform_settings (public)    │
│   - email_templates                                                     │
│                                                                         │
│   [READ]                                [WRITE]                         │
│   - shishya_users                       - shishya_users                 │
│   - user_credits                        - user_credits                  │
│   - credit_transactions                 - credit_transactions           │
│   - course_enrollments                  - course_enrollments            │
│   - lesson_progress                     - lesson_progress               │
│   - lab_attempts                        - lab_attempts                  │
│   - lab_completions                     - lab_completions               │
│   - test_attempts                       - test_attempts                 │
│   - project_submissions                 - project_submissions           │
│   - usha_conversations                  - usha_conversations            │
│                                                                         │
│   [WRITE]                               [READ]                          │
│   - certificates (issue/revoke)         - certificates (own only)       │
│   - marksheets (generate)               - marksheets (own only)         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 15.2 API Endpoints for SHISHYA

```typescript
// Public endpoints that SHISHYA calls (read-only)
// Admin Portal exposes these for SHISHYA to consume

// GET /api/public/courses - Published courses only
// GET /api/public/courses/:id - Course details (no admin data)
// GET /api/public/courses/:id/modules - Course modules
// GET /api/public/courses/:id/lessons - Course lessons
// GET /api/public/courses/:id/labs - Labs (without solutions)
// GET /api/public/courses/:id/tests - Test metadata (without answers)
// GET /api/public/courses/:id/projects - Project info
// GET /api/public/settings - Public platform settings

// These endpoints filter out:
// - Draft/archived courses
// - Solution code from labs
// - Correct answers from tests
// - Admin-only fields
```

### 15.3 Webhook Notifications (Optional)

```typescript
// Admin can notify SHISHYA of content changes
// server/services/webhookService.ts

export async function notifyContentChange(
  entityType: string,
  entityId: number,
  action: 'create' | 'update' | 'delete'
) {
  const SHISHYA_WEBHOOK_URL = process.env.SHISHYA_WEBHOOK_URL;
  
  if (!SHISHYA_WEBHOOK_URL) return;
  
  await fetch(SHISHYA_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': process.env.WEBHOOK_SECRET,
    },
    body: JSON.stringify({
      type: 'content_change',
      entity: entityType,
      entityId,
      action,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

---

## 16. Backup & Recovery

### 16.1 Database Backup Strategy

```bash
# Daily automated backup script
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DATABASE_URL="$ADMIN_DATABASE_URL"

# Create backup
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" "s3://your-bucket/backups/"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
```

### 16.2 Point-in-Time Recovery Tables

```sql
-- Keep history of critical changes
CREATE TABLE content_history (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID,
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Trigger to auto-log course changes
CREATE OR REPLACE FUNCTION log_course_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO content_history (entity_type, entity_id, action, old_data, new_data)
    VALUES (
        'course',
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON courses
FOR EACH ROW EXECUTE FUNCTION log_course_changes();
```

---

## Conclusion

This Admin Control Panel provides complete management capabilities for the SHISHYA student portal. By sharing the same database, content changes are immediately reflected in the student-facing app, while user data remains synchronized across both platforms.

The modular API design allows for incremental implementation while maintaining a clear separation between admin and student functionality.

Key features of this specification:
- **Complete database schema** with all tables, indexes, and relationships
- **Stored procedures** for complex operations like credit management and certificate generation
- **TypeScript service layer** for clean business logic
- **Express route handlers** with authentication and validation
- **Data synchronization patterns** between Admin and SHISHYA portals
- **Backup and recovery** strategies for data protection
