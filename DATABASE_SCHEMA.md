# OurShiksha Database Schema Documentation

## Overview

This document describes the complete database schema for the OurShiksha platform, covering both **Admin Course Factory** and **SHISHYA Student Portal**. The system uses a single PostgreSQL database with schema-based separation for scalability and maintainability.

---

## Database Architecture

```
ourshiksha_db (Single PostgreSQL Database)
│
├── SHARED TABLES (Both Admin & SHISHYA)
│   ├── Course Content (Admin writes, SHISHYA reads)
│   └── User Authentication
│
├── SHISHYA-SPECIFIC TABLES
│   ├── Student Profiles
│   ├── Learning Progress
│   ├── Credits & Wallet
│   ├── Gamification
│   └── Academic Records
│
└── ADMIN-SPECIFIC TABLES
    └── Content Management
```

---

## Table Categories

| Category | Tables | Owner | Access |
|----------|--------|-------|--------|
| Course Content | 6 tables | Admin | Admin: Read/Write, SHISHYA: Read |
| Authentication | 4 tables | Shared | Both portals |
| Student Profiles | 1 table | SHISHYA | SHISHYA only |
| Learning Progress | 5 tables | SHISHYA | SHISHYA only |
| Credits & Wallet | 6 tables | SHISHYA | SHISHYA only |
| Notifications | 1 table | Shared | Both portals |
| AI Motivation Engine | 8 tables | SHISHYA | SHISHYA only |
| Academic Records | 2 tables | SHISHYA | SHISHYA only |

---

# COURSE CONTENT TABLES (Admin Manages)

These tables store course content created by instructors in Admin. SHISHYA reads from these tables.

---

## 1. courses

**Purpose:** Master catalog of all courses available on the platform.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key, auto-increment |
| title | VARCHAR(255) | NO | Course title displayed to students |
| description | TEXT | YES | Full course description |
| short_description | VARCHAR(500) | YES | Brief summary for cards/listings |
| level | VARCHAR(20) | NO | Difficulty: 'beginner', 'intermediate', 'advanced' |
| duration | VARCHAR(50) | YES | Estimated time: "8 hours", "2 weeks" |
| skills | TEXT | YES | JSON array of skills taught |
| status | VARCHAR(20) | NO | 'draft', 'published', 'archived' |
| is_free | BOOLEAN | NO | True if course has no credit cost |
| credit_cost | INTEGER | NO | Learning credits required to enroll |
| test_required | BOOLEAN | NO | Must pass test to complete course |
| project_required | BOOLEAN | NO | Must submit project to complete course |
| thumbnail_url | TEXT | YES | Course image URL |
| instructor_id | VARCHAR(36) | YES | FK to users.id (course creator) |
| created_at | TIMESTAMP | NO | When course was created |
| updated_at | TIMESTAMP | NO | Last modification time |

**Indexes:** status, level, is_free, created_at

---

## 2. modules

**Purpose:** Sections/chapters within a course. Organizes lessons into logical groups.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key, auto-increment |
| course_id | INTEGER | NO | FK to courses.id |
| title | VARCHAR(255) | NO | Module title |
| description | TEXT | YES | Module overview |
| order_index | INTEGER | NO | Display order within course |
| created_at | TIMESTAMP | NO | When module was created |

**Indexes:** course_id, order_index

---

## 3. lessons

**Purpose:** Individual learning units containing content students consume.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key, auto-increment |
| module_id | INTEGER | NO | FK to modules.id |
| course_id | INTEGER | NO | FK to courses.id (denormalized for queries) |
| title | VARCHAR(255) | NO | Lesson title |
| content | TEXT | YES | Lesson content (HTML/Markdown) |
| video_url | TEXT | YES | Video URL (YouTube, Vimeo, etc.) |
| duration_minutes | INTEGER | YES | Estimated reading/watching time |
| order_index | INTEGER | NO | Display order within module |
| is_preview | BOOLEAN | NO | True if viewable before enrollment |
| created_at | TIMESTAMP | NO | When lesson was created |

**Indexes:** module_id, course_id, order_index

---

## 4. tests

**Purpose:** Assessments/quizzes for courses. Students must pass to earn certificate.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key, auto-increment |
| course_id | INTEGER | NO | FK to courses.id |
| title | VARCHAR(255) | NO | Test title |
| description | TEXT | YES | Test instructions |
| duration_minutes | INTEGER | NO | Time limit for test |
| passing_percentage | INTEGER | NO | Minimum score to pass (0-100) |
| questions | TEXT | NO | JSON array of question objects |
| max_attempts | INTEGER | YES | Null = unlimited attempts |
| shuffle_questions | BOOLEAN | NO | Randomize question order |
| show_correct_answers | BOOLEAN | NO | Show answers after submission |
| created_at | TIMESTAMP | NO | When test was created |

**Questions JSON Structure:**
```json
[
  {
    "id": 1,
    "question": "What is JavaScript?",
    "options": ["A programming language", "A markup language", "A database", "An OS"],
    "correctIndex": 0,
    "points": 10
  }
]
```

**Indexes:** course_id

---

## 5. projects

**Purpose:** Hands-on assignments students must complete and submit.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key, auto-increment |
| course_id | INTEGER | NO | FK to courses.id |
| title | VARCHAR(255) | NO | Project title |
| description | TEXT | NO | Project requirements and details |
| difficulty | VARCHAR(20) | NO | 'easy', 'medium', 'hard' |
| requirements | TEXT | YES | JSON array of requirements |
| resources | TEXT | YES | JSON array of helpful links |
| estimated_hours | INTEGER | YES | Time to complete |
| created_at | TIMESTAMP | NO | When project was created |

**Indexes:** course_id

---

## 6. labs

**Purpose:** Interactive coding exercises with browser-based code execution.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key, auto-increment |
| course_id | INTEGER | NO | FK to courses.id |
| lesson_id | INTEGER | YES | FK to lessons.id (optional link) |
| title | VARCHAR(255) | NO | Lab title |
| instructions | TEXT | NO | Step-by-step instructions (Markdown) |
| starter_code | TEXT | YES | Initial code template |
| expected_output | TEXT | YES | Expected console output for validation |
| solution_code | TEXT | YES | Reference solution (hidden from students) |
| language | VARCHAR(20) | NO | 'javascript', 'python', etc. |
| order_index | INTEGER | NO | Display order |
| created_at | TIMESTAMP | NO | When lab was created |

**Indexes:** course_id, lesson_id

---

# AUTHENTICATION TABLES (Shared)

These tables handle user identity and sessions for both Admin and SHISHYA.

---

## 7. users

**Purpose:** Master user table for all platform users (students, instructors, admins).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | VARCHAR(36) | NO | Primary key, UUID format |
| email | VARCHAR(255) | NO | User email (unique login) |
| password_hash | TEXT | NO | Bcrypt hashed password |
| email_verified | BOOLEAN | NO | True after OTP verification |
| created_at | TIMESTAMP | NO | Account creation time |

**Indexes:** email (unique)

---

## 8. sessions

**Purpose:** Active login sessions for authenticated users.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | VARCHAR(36) | NO | Primary key, session token |
| user_id | VARCHAR(36) | NO | FK to users.id |
| created_at | TIMESTAMP | NO | Session start time |
| expires_at | TIMESTAMP | NO | Session expiration time |

**Indexes:** user_id, expires_at

---

## 9. otp_logs

**Purpose:** Email OTP verification records with purpose tracking.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | YES | FK to users.id (null for signup) |
| contact_type | VARCHAR(10) | NO | 'email' or 'phone' |
| destination | VARCHAR(255) | NO | Email/phone receiving OTP |
| otp_hash | TEXT | NO | SHA256 hash of OTP |
| purpose | VARCHAR(20) | NO | 'signup', 'login', 'forgot_password', 'verify_email' |
| attempt_count | INTEGER | NO | Failed verification attempts |
| expires_at | TIMESTAMP | NO | OTP expiration time |
| consumed_at | TIMESTAMP | YES | When OTP was successfully used |
| created_at | TIMESTAMP | NO | When OTP was sent |

**Indexes:** user_id, destination, purpose

---

## 10. otp_codes (Legacy)

**Purpose:** Legacy OTP table, kept for backward compatibility.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| otp_hash | TEXT | NO | Hashed OTP code |
| expires_at | TIMESTAMP | NO | Expiration time |
| used | BOOLEAN | NO | True if already consumed |
| attempts | INTEGER | NO | Verification attempt count |
| created_at | TIMESTAMP | NO | Creation time |

---

# STUDENT PROFILE TABLES (SHISHYA)

---

## 11. user_profiles

**Purpose:** Extended student profile with portfolio information.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | VARCHAR(36) | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id (unique) |
| full_name | TEXT | NO | Student's display name |
| username | VARCHAR(30) | NO | Unique URL-friendly username |
| bio | TEXT | YES | Short biography |
| profile_photo | TEXT | YES | Base64 or URL of photo |
| headline | TEXT | YES | Professional headline |
| location | TEXT | YES | City/Country |
| github_url | TEXT | YES | GitHub profile link |
| linkedin_url | TEXT | YES | LinkedIn profile link |
| portfolio_visible | BOOLEAN | NO | True if portfolio is public |
| created_at | TIMESTAMP | NO | Profile creation time |
| updated_at | TIMESTAMP | NO | Last update time |

**Indexes:** user_id (unique), username (unique)

---

# LEARNING PROGRESS TABLES (SHISHYA)

---

## 12. course_enrollments

**Purpose:** Tracks which courses a student has enrolled in.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| course_id | INTEGER | NO | FK to courses.id |
| credits_paid | INTEGER | NO | Credits spent on enrollment |
| enrolled_at | TIMESTAMP | NO | Enrollment timestamp |

**Indexes:** user_id, course_id, (user_id, course_id) unique

---

## 13. user_progress

**Purpose:** Tracks completed lessons for each student.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| course_id | INTEGER | NO | FK to courses.id |
| lesson_id | INTEGER | NO | FK to lessons.id |
| completed_at | TIMESTAMP | NO | When lesson was marked complete |

**Indexes:** user_id, course_id, lesson_id

---

## 14. user_lab_progress

**Purpose:** Tracks lab completion and stores student code.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| course_id | INTEGER | NO | FK to courses.id |
| lab_id | INTEGER | NO | FK to labs.id |
| completed | BOOLEAN | NO | True if lab passed validation |
| user_code | TEXT | YES | Student's submitted code |
| completed_at | TIMESTAMP | YES | Completion timestamp |

**Indexes:** user_id, lab_id

---

## 15. user_test_attempts

**Purpose:** Records each test attempt with answers and score.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| test_id | INTEGER | NO | FK to tests.id |
| course_id | INTEGER | NO | FK to courses.id |
| answers | TEXT | NO | JSON of selected answers |
| score_percentage | INTEGER | NO | Score achieved (0-100) |
| passed | BOOLEAN | NO | True if score >= passing_percentage |
| attempted_at | TIMESTAMP | NO | When test was taken |

**Indexes:** user_id, test_id, course_id

---

## 16. user_project_submissions

**Purpose:** Stores student project submissions.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| project_id | INTEGER | NO | FK to projects.id |
| course_id | INTEGER | NO | FK to courses.id |
| github_url | TEXT | NO | GitHub repository URL |
| live_url | TEXT | YES | Deployed project URL |
| notes | TEXT | YES | Student notes/comments |
| submitted_at | TIMESTAMP | NO | Submission timestamp |

**Indexes:** user_id, project_id

---

# CREDITS & WALLET TABLES (SHISHYA)

---

## 17. user_credits

**Purpose:** Student's learning credit wallet balance.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id (unique) |
| balance | INTEGER | NO | Current credit balance |
| total_earned | INTEGER | NO | Lifetime credits earned |
| total_spent | INTEGER | NO | Lifetime credits spent |
| created_at | TIMESTAMP | NO | Wallet creation time |
| updated_at | TIMESTAMP | NO | Last transaction time |

**Indexes:** user_id (unique)

---

## 18. credit_transactions

**Purpose:** Complete history of credit movements.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| amount | INTEGER | NO | Credits added (+) or removed (-) |
| type | VARCHAR(20) | NO | 'BONUS', 'DEBIT', 'CREDIT', 'REFUND' |
| reason | VARCHAR(50) | NO | 'WELCOME_BONUS', 'COURSE_ENROLLMENT', 'VOUCHER_REDEEMED', etc. |
| description | TEXT | YES | Human-readable description |
| reference_id | INTEGER | YES | Course ID or other reference |
| balance_after | INTEGER | NO | Balance after transaction |
| created_at | TIMESTAMP | NO | Transaction timestamp |

**Indexes:** user_id, type, created_at

---

## 19. vouchers

**Purpose:** Redeemable voucher codes for credits.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| code | VARCHAR(50) | NO | Unique voucher code |
| points | INTEGER | NO | Base credits value |
| bonus_percent | INTEGER | YES | Extra bonus percentage |
| max_usage | INTEGER | YES | Max redemptions allowed |
| used_count | INTEGER | NO | Current redemption count |
| is_active | BOOLEAN | NO | True if voucher is valid |
| expiry_date | TIMESTAMP | YES | Expiration date |
| created_at | TIMESTAMP | NO | Creation time |

**Indexes:** code (unique), is_active

---

## 20. voucher_redemptions

**Purpose:** Records of voucher redemptions by users.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| voucher_code | VARCHAR(50) | NO | Redeemed voucher code |
| points_received | INTEGER | NO | Credits received |
| redeemed_at | TIMESTAMP | NO | Redemption timestamp |

**Indexes:** user_id, voucher_code

---

## 21. gift_boxes

**Purpose:** Credit gifts sent between users.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| sender_id | VARCHAR(36) | NO | FK to users.id (sender) |
| recipient_email | VARCHAR(255) | NO | Recipient's email |
| points | INTEGER | NO | Credits in gift |
| payment_id | VARCHAR(100) | YES | Razorpay payment ID |
| status | VARCHAR(20) | NO | 'CREATED', 'PAID', 'CLAIMED' |
| claimed_by | VARCHAR(36) | YES | FK to users.id (recipient) |
| created_at | TIMESTAMP | NO | Gift creation time |
| claimed_at | TIMESTAMP | YES | When gift was claimed |

**Indexes:** sender_id, recipient_email, status

---

# NOTIFICATION TABLES

---

## 22. notifications

**Purpose:** In-app notifications for students.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | YES | FK to users.id (null = global) |
| role | VARCHAR(20) | NO | 'guru', 'shishya', 'all' |
| title | VARCHAR(200) | NO | Notification title |
| message | TEXT | NO | Notification body |
| type | VARCHAR(30) | NO | 'product', 'offer', 'payment', 'course', 'certificate', 'system' |
| link | TEXT | YES | Action URL |
| is_read | BOOLEAN | NO | True if user has seen it |
| created_at | TIMESTAMP | NO | Creation time |

**Indexes:** user_id, is_read, created_at

---

# AI MOTIVATION ENGINE TABLES (SHISHYA)

---

## 23. motivation_rules

**Purpose:** Configurable rules that trigger motivational actions.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| name | VARCHAR(100) | NO | Rule name |
| description | TEXT | YES | Rule explanation |
| rule_type | VARCHAR(30) | NO | 'progress', 'time', 'performance', 'streak', 'milestone' |
| conditions | TEXT | NO | JSON: criteria for triggering |
| actions | TEXT | NO | JSON: what happens when triggered |
| priority | INTEGER | NO | Execution order |
| cooldown_hours | INTEGER | NO | Hours before re-trigger |
| max_trigger_count | INTEGER | YES | Limit triggers (null = unlimited) |
| is_active | BOOLEAN | NO | Rule enabled/disabled |
| is_global | BOOLEAN | NO | Applies to all courses |
| course_id | INTEGER | YES | Specific course (null = global) |
| created_at | TIMESTAMP | NO | Creation time |
| updated_at | TIMESTAMP | NO | Last update time |

---

## 24. rule_trigger_logs

**Purpose:** Records when motivation rules fire.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| rule_id | INTEGER | NO | FK to motivation_rules.id |
| user_id | VARCHAR(36) | NO | FK to users.id |
| course_id | INTEGER | YES | Related course |
| trigger_count | INTEGER | NO | Times rule fired for user |
| actions_executed | TEXT | NO | JSON: what actions ran |
| input_signals | TEXT | YES | JSON: data that triggered |
| triggered_at | TIMESTAMP | NO | Trigger timestamp |

---

## 25. motivation_cards

**Purpose:** Shareable achievement cards for students.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| card_id | VARCHAR(20) | NO | Unique public ID |
| user_id | VARCHAR(36) | NO | FK to users.id |
| course_id | INTEGER | YES | Related course |
| course_title | TEXT | YES | Course name |
| card_type | VARCHAR(30) | NO | 'streak', 'milestone', 'completion', 'performance' |
| title | TEXT | NO | Card headline |
| subtitle | TEXT | YES | Secondary text |
| badge | VARCHAR(50) | YES | Badge icon name |
| stats | TEXT | YES | JSON: display stats |
| message | TEXT | YES | Motivational message |
| percentile_rank | INTEGER | YES | Student's ranking |
| is_shareable | BOOLEAN | NO | Can be shared publicly |
| share_url | TEXT | YES | Public share link |
| view_count | INTEGER | NO | Times viewed |
| created_at | TIMESTAMP | NO | Creation time |

---

## 26. ai_nudge_logs

**Purpose:** AI-generated motivation messages sent to students.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| course_id | INTEGER | YES | Related course |
| nudge_type | VARCHAR(30) | NO | 'encouragement', 'reminder', 'celebration', 'comeback' |
| message | TEXT | NO | AI-generated message |
| channel | VARCHAR(20) | NO | 'app', 'email', 'push' |
| rule_id | INTEGER | YES | FK to motivation_rules.id |
| is_read | BOOLEAN | NO | User has seen it |
| sent_at | TIMESTAMP | NO | When sent |

---

## 27. student_streaks

**Purpose:** Tracks daily learning consistency.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id (unique) |
| current_streak | INTEGER | NO | Current consecutive days |
| longest_streak | INTEGER | NO | Best streak ever |
| last_activity_date | TIMESTAMP | YES | Last learning activity |
| streak_start_date | TIMESTAMP | YES | When current streak began |
| total_active_days | INTEGER | NO | Lifetime active days |
| updated_at | TIMESTAMP | NO | Last update time |

---

## 28. mystery_boxes

**Purpose:** Gamification rewards unlocked by rules.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| box_id | VARCHAR(20) | NO | Unique box ID |
| user_id | VARCHAR(36) | NO | FK to users.id |
| rule_id | INTEGER | YES | FK to motivation_rules.id |
| reward_type | VARCHAR(30) | YES | 'coins', 'scholarship', 'badge', 'coupon' |
| reward_value | TEXT | YES | JSON: reward details |
| is_opened | BOOLEAN | NO | User has claimed it |
| opened_at | TIMESTAMP | YES | Claim timestamp |
| expires_at | TIMESTAMP | YES | Expiration date |
| created_at | TIMESTAMP | NO | Creation time |

---

## 29. scholarships

**Purpose:** Rule-based discounts and free course access.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| scholarship_id | VARCHAR(20) | NO | Unique public ID |
| name | VARCHAR(100) | NO | Scholarship name |
| description | TEXT | YES | Details |
| discount_percent | INTEGER | NO | Discount (0-100) |
| course_id | INTEGER | YES | Specific course (null = any) |
| max_redemptions | INTEGER | YES | Usage limit |
| redemption_count | INTEGER | NO | Times used |
| valid_from | TIMESTAMP | YES | Start date |
| valid_until | TIMESTAMP | YES | End date |
| rule_id | INTEGER | YES | FK to motivation_rules.id |
| is_active | BOOLEAN | NO | Currently valid |
| created_at | TIMESTAMP | NO | Creation time |

---

## 30. user_scholarships

**Purpose:** Scholarships awarded to specific students.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| scholarship_id | INTEGER | NO | FK to scholarships.id |
| course_id | INTEGER | YES | Course to apply discount |
| is_used | BOOLEAN | NO | Scholarship consumed |
| used_at | TIMESTAMP | YES | Usage timestamp |
| awarded_at | TIMESTAMP | NO | Award timestamp |
| expires_at | TIMESTAMP | YES | Expiration date |

---

# ACADEMIC RECORDS TABLES (SHISHYA)

---

## 31. user_certificates

**Purpose:** Course completion certificates earned by students.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| certificate_id | VARCHAR(20) | NO | Unique public ID |
| course_id | INTEGER | NO | FK to courses.id |
| course_title | TEXT | NO | Course name |
| certificate_title | TEXT | NO | Certificate heading |
| certificate_type | VARCHAR(20) | NO | 'completion', 'excellence' |
| level | VARCHAR(20) | NO | Course difficulty level |
| skills | TEXT | NO | JSON array of skills |
| issued_at | TIMESTAMP | NO | Issue date |

**Indexes:** user_id, certificate_id (unique)

---

## 32. marksheets

**Purpose:** Official academic transcripts with all course grades.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| marksheet_id | VARCHAR(30) | NO | Unique ID: MS-YYYY-XXXXXXXX |
| user_id | VARCHAR(36) | NO | FK to users.id |
| student_name | TEXT | NO | Name on marksheet |
| student_email | VARCHAR(255) | NO | Email on marksheet |
| program_name | TEXT | NO | "Full Stack Development" etc. |
| academic_year | VARCHAR(10) | NO | "2024-25" |
| course_data | TEXT | NO | JSON: all course entries |
| total_marks | INTEGER | NO | Maximum possible marks |
| obtained_marks | INTEGER | NO | Marks achieved |
| percentage | INTEGER | NO | Score percentage |
| grade | VARCHAR(5) | NO | 'O', 'A+', 'A', 'B+', 'B', 'C', 'F' |
| cgpa | VARCHAR(5) | NO | GPA (0.00 - 10.00) |
| result | VARCHAR(20) | NO | 'Pass', 'Fail', 'Pending' |
| classification | VARCHAR(30) | NO | 'Distinction', 'First Class', 'Pass' |
| total_credits | INTEGER | NO | Credits earned |
| courses_completed | INTEGER | NO | Number of courses passed |
| reward_coins | INTEGER | NO | Bonus coins earned |
| scholarship_eligible | BOOLEAN | NO | Qualifies for scholarships |
| verification_code | VARCHAR(20) | NO | QR verification code |
| pdf_hash | TEXT | YES | SHA256 of PDF for tampering |
| signed_by | TEXT | YES | Signing authority |
| ai_verifier_name | TEXT | YES | AI verifier name |
| issued_at | TIMESTAMP | NO | Issue date |
| expires_at | TIMESTAMP | YES | Expiration (optional) |
| status | VARCHAR(20) | NO | 'active', 'revoked', 'expired' |

**Indexes:** marksheet_id (unique), user_id, verification_code (unique)

---

## 33. marksheet_verifications

**Purpose:** Audit log of marksheet verification attempts.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| marksheet_id | INTEGER | NO | FK to marksheets.id |
| verifier_ip | VARCHAR(45) | YES | IP address of verifier |
| verifier_user_agent | TEXT | YES | Browser/device info |
| verified_at | TIMESTAMP | NO | Verification timestamp |

---

# AI TUTOR TABLES

---

## 34. mithra_conversations

**Purpose:** AI tutor chat sessions per course/context.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| user_id | VARCHAR(36) | NO | FK to users.id |
| course_id | INTEGER | NO | FK to courses.id |
| page_type | VARCHAR(20) | NO | 'lesson', 'lab', 'project', 'test' |
| created_at | TIMESTAMP | NO | Session start time |

---

## 35. mithra_messages

**Purpose:** Individual messages in AI tutor conversations.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | NO | Primary key |
| conversation_id | INTEGER | NO | FK to mithra_conversations.id |
| role | VARCHAR(20) | NO | 'user', 'assistant', 'system' |
| content | TEXT | NO | Message text |
| response_type | VARCHAR(20) | YES | 'hint', 'explanation', 'question' |
| help_level | VARCHAR(20) | YES | Level of help provided |
| created_at | TIMESTAMP | NO | Message timestamp |

---

# SUMMARY

## Total Tables: 35

| Category | Count |
|----------|-------|
| Course Content (Admin) | 6 |
| Authentication (Shared) | 4 |
| Student Profiles | 1 |
| Learning Progress | 5 |
| Credits & Wallet | 5 |
| Notifications | 1 |
| AI Motivation Engine | 8 |
| Academic Records | 3 |
| AI Tutor | 2 |

## Tables to be CREATED (Missing from Admin):
1. courses
2. modules
3. lessons
4. tests
5. projects
6. labs

## Tables Already Existing:
All other 29 tables exist in the shared database.

---

# INTEGRATION NOTES

## Shared Database Strategy
- Single PostgreSQL database: `ourshiksha_db`
- Admin Portal: Creates and manages course content
- SHISHYA Portal: Reads course content, manages student data
- Both use same `users` table for authentication

## Environment Variables
- `DATABASE_URL` - SHISHYA's database connection
- `ADMIN_DATABASE_URL` - Admin database (same DB, for reference)

## Data Flow
```
Admin Portal                    SHISHYA Portal
     │                               │
     ├── Creates courses ────────────┼── Reads courses
     ├── Creates lessons ────────────┼── Tracks progress
     ├── Creates tests ──────────────┼── Records attempts
     ├── Creates projects ───────────┼── Stores submissions
     └── Creates labs ───────────────┼── Saves lab code
                                     │
                                     └── Manages enrollments,
                                         credits, certificates,
                                         marksheets
```
