# SHISHYA Database Schema - Complete Reference

## Database Overview

**Total Tables:** 35 | **Views:** 1 | **Database:** PostgreSQL (Shared with Admin)

The SHISHYA student portal shares a PostgreSQL database with OurShiksha Admin Course Factory.

**Naming Convention:**
- Course content tables: No prefix (managed by Admin)
- Student tables: `shishya_` prefix (managed by SHISHYA)

---

# COURSE CONTENT TABLES (6)

## 1. courses

**Purpose:** Master catalog of all courses available on the platform.

**SHISHYA Access:** Read-only, filtered by `status='published' AND is_active=true`

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key, unique course identifier |
| title | VARCHAR(255) | NO | - | Course display name |
| description | TEXT | YES | - | Full course description (HTML/Markdown) |
| short_description | VARCHAR(500) | YES | - | Brief summary for course cards |
| level | VARCHAR(20) | NO | 'beginner' | Difficulty: beginner/intermediate/advanced |
| language | VARCHAR(20) | NO | 'en' | Course language (en/hi/ta/te) |
| duration | VARCHAR(50) | YES | - | Estimated time to complete (e.g., "10 hours") |
| skills | TEXT | YES | - | Comma-separated skills taught |
| status | VARCHAR(20) | NO | 'draft' | Publishing state: draft/published/archived |
| is_active | BOOLEAN | NO | false | Quick visibility toggle |
| is_free | BOOLEAN | NO | false | Free course flag |
| credit_cost | INTEGER | NO | 0 | Credits required for enrollment |
| price | INTEGER | NO | 0 | Price in smallest currency unit |
| currency | VARCHAR(10) | NO | 'INR' | Currency code |
| test_required | BOOLEAN | NO | false | Must pass test for certificate |
| project_required | BOOLEAN | NO | false | Must submit project for certificate |
| thumbnail_url | TEXT | YES | - | Course cover image URL |
| instructor_id | VARCHAR(36) | YES | - | Creator's user ID (FK to admin users) |
| published_at | TIMESTAMP | YES | - | When course was made live |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |
| updated_at | TIMESTAMP | NO | NOW() | Last modification time |

**Connections:**
- Parent of: modules, lessons, tests, projects, labs
- Referenced by: shishya_course_enrollments, shishya_user_progress, shishya_user_certificates

**Functions Used In:**
- Course catalog display
- Course overview page
- Enrollment system
- Certificate generation
- Dashboard statistics

---

## 2. modules

**Purpose:** Sections/chapters that organize lessons within a course.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| course_id | INTEGER | NO | - | FK to courses.id |
| title | VARCHAR(255) | NO | - | Module title |
| description | TEXT | YES | - | Module overview |
| order_index | INTEGER | NO | 0 | Display sequence in course |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: courses (course_id)
- Parent of: lessons, labs

**Functions Used In:**
- Course structure/sidebar navigation
- Progress calculation per module
- Learning path display

---

## 3. lessons

**Purpose:** Individual learning units containing content (text, video).

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| module_id | INTEGER | NO | - | FK to modules.id |
| course_id | INTEGER | NO | - | FK to courses.id |
| title | VARCHAR(255) | NO | - | Lesson title |
| content | TEXT | YES | - | Lesson content (HTML/Markdown) |
| video_url | TEXT | YES | - | Video URL (YouTube/Vimeo) |
| duration | INTEGER | YES | - | Estimated duration in minutes |
| order_index | INTEGER | NO | 0 | Display sequence in module |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: modules (module_id), courses (course_id)
- Referenced by: shishya_user_progress, labs

**Functions Used In:**
- Lesson viewer page
- Progress tracking (mark as complete)
- "Continue Learning" feature
- Usha AI tutor context

---

## 4. tests

**Purpose:** Assessments with multiple-choice questions for courses.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| course_id | INTEGER | NO | - | FK to courses.id |
| title | VARCHAR(255) | NO | - | Test title |
| description | TEXT | YES | - | Test instructions |
| duration_minutes | INTEGER | NO | 30 | Time limit for test |
| passing_percentage | INTEGER | NO | 60 | Minimum score to pass (%) |
| questions | JSONB | NO | - | Array of question objects |
| is_active | BOOLEAN | NO | true | Test availability flag |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Questions JSONB Structure:**
```json
[
  {
    "id": 1,
    "question": "What is...?",
    "options": ["A", "B", "C", "D"],
    "correct_answer": 0
  }
]
```

**Connections:**
- Belongs to: courses (course_id)
- Referenced by: shishya_user_test_attempts

**Functions Used In:**
- Test taking interface (timed)
- Server-side scoring (answers never sent to client)
- Certificate eligibility check
- Marksheet grade calculation

---

## 5. projects

**Purpose:** Hands-on assignments for practical skill application.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| course_id | INTEGER | NO | - | FK to courses.id |
| title | VARCHAR(255) | NO | - | Project title |
| description | TEXT | YES | - | Project requirements and instructions |
| difficulty | VARCHAR(20) | NO | 'beginner' | beginner/intermediate/advanced |
| estimated_hours | INTEGER | YES | - | Expected completion time |
| requirements | JSONB | YES | - | Submission requirements list |
| rubric | JSONB | YES | - | Grading criteria |
| is_active | BOOLEAN | NO | true | Project availability flag |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: courses (course_id)
- Referenced by: shishya_user_project_submissions

**Functions Used In:**
- Project details page
- Submission form
- Certificate eligibility check
- Portfolio display

---

## 6. labs

**Purpose:** Guided coding exercises with browser-based code execution.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| course_id | INTEGER | NO | - | FK to courses.id |
| module_id | INTEGER | YES | - | FK to modules.id |
| lesson_id | INTEGER | YES | - | FK to lessons.id (linked lesson) |
| title | VARCHAR(255) | NO | - | Lab title |
| description | TEXT | YES | - | Lab overview |
| difficulty | VARCHAR(20) | NO | 'beginner' | Difficulty level |
| instructions | JSONB | YES | - | Step-by-step guide |
| starter_code | TEXT | YES | - | Initial code template |
| expected_output | TEXT | YES | - | Expected result for validation |
| language | VARCHAR(20) | NO | 'javascript' | Programming language |
| estimated_time | INTEGER | YES | - | Minutes to complete |
| order_index | INTEGER | NO | 0 | Display sequence |
| is_active | BOOLEAN | NO | true | Lab availability flag |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: courses, modules, lessons
- Referenced by: shishya_user_lab_progress

**Functions Used In:**
- Interactive code editor
- Output matching validation
- Code persistence
- Usha AI tutor context

---

# SHISHYA STUDENT TABLES (29)

---

# AUTHENTICATION (4 Tables)

## 7. shishya_users

**Purpose:** Student account credentials and authentication.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | VARCHAR(36) | NO | UUID | Primary key (UUID v4) |
| email | VARCHAR(255) | NO | - | Unique login email |
| password_hash | TEXT | NO | - | Bcrypt hashed password (cost 10) |
| email_verified | BOOLEAN | NO | false | Email verification status |
| created_at | TIMESTAMP | NO | NOW() | Account creation time |
| updated_at | TIMESTAMP | NO | NOW() | Last update time |

**Connections:**
- Parent of: ALL shishya_ tables (via user_id)

**Functions Used In:**
- Signup/Login authentication
- Email verification flow
- Session creation
- Protected route access

---

## 8. shishya_sessions

**Purpose:** Server-side session storage for authenticated users.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| sid | VARCHAR(255) | NO | - | Session ID (Primary key) |
| sess | JSONB | NO | - | Session data (user info, passport) |
| expire | TIMESTAMP | NO | - | Session expiration time |

**Connections:**
- Links to: shishya_users (via sess.passport.user)

**Functions Used In:**
- HTTP-only cookie authentication
- Session persistence across requests
- Auto-cleanup of expired sessions

---

## 9. shishya_otp_codes

**Purpose:** One-time passwords for email verification.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| email | VARCHAR(255) | NO | - | Target email address |
| otp_hash | TEXT | NO | - | SHA256 hashed 6-digit OTP |
| expires_at | TIMESTAMP | NO | - | OTP expiration (10 minutes) |
| verified | BOOLEAN | NO | false | Whether OTP was successfully used |
| created_at | TIMESTAMP | NO | NOW() | OTP generation time |

**Connections:**
- Links to: shishya_users (via email)

**Functions Used In:**
- Email verification during signup
- Password reset flow
- Secure verification without exposing OTP

---

## 10. shishya_otp_logs

**Purpose:** Audit trail for all OTP-related actions.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| email | VARCHAR(255) | NO | - | Target email |
| action | VARCHAR(50) | NO | - | Action: send/verify/fail/expire |
| ip_address | VARCHAR(45) | YES | - | Client IP (IPv4/IPv6) |
| user_agent | TEXT | YES | - | Browser user agent string |
| created_at | TIMESTAMP | NO | NOW() | Action timestamp |

**Connections:**
- Links to: shishya_users (via email)

**Functions Used In:**
- Security auditing
- Abuse detection (rate limiting)
- Compliance logging

---

# PROFILE (1 Table)

## 11. shishya_user_profiles

**Purpose:** Extended student profile information for display and portfolio.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | VARCHAR(36) | NO | UUID | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id (Unique) |
| full_name | VARCHAR(255) | YES | - | Display name |
| username | VARCHAR(50) | YES | - | Unique public URL slug |
| bio | TEXT | YES | - | About me (max 500 chars) |
| profile_photo | TEXT | YES | - | Base64 encoded image (max 2MB) |
| headline | VARCHAR(200) | YES | - | Professional headline |
| location | VARCHAR(100) | YES | - | City/Country |
| github_url | TEXT | YES | - | GitHub profile URL |
| linkedin_url | TEXT | YES | - | LinkedIn profile URL |
| website_url | TEXT | YES | - | Personal website URL |
| facebook_url | TEXT | YES | - | Facebook profile URL |
| instagram_url | TEXT | YES | - | Instagram profile URL |
| portfolio_visible | BOOLEAN | NO | false | Enable public portfolio |
| created_at | TIMESTAMP | NO | NOW() | Profile creation time |
| updated_at | TIMESTAMP | NO | NOW() | Last update time |

**Connections:**
- Belongs to: shishya_users (user_id) - One-to-One

**Functions Used In:**
- Profile page display/edit
- Public portfolio page (/portfolio/:username)
- Header avatar display
- Certificate personalization

---

# PROGRESS TRACKING (6 Tables)

## 12. shishya_user_progress

**Purpose:** Track lesson completion status per user.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| course_id | INTEGER | NO | - | FK to courses.id |
| lesson_id | INTEGER | NO | - | FK to lessons.id |
| completed | BOOLEAN | NO | false | Lesson completion status |
| completed_at | TIMESTAMP | YES | - | When marked complete |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: shishya_users (user_id)
- References: courses (course_id), lessons (lesson_id)

**Functions Used In:**
- Progress bar calculation
- "Continue Learning" button
- Course completion check
- Dashboard "In Progress" count

---

## 13. shishya_user_lab_progress

**Purpose:** Track lab completion and save student code.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| lab_id | INTEGER | NO | - | FK to labs.id |
| completed | BOOLEAN | NO | false | Lab completion status |
| user_code | TEXT | YES | - | Student's saved code |
| completed_at | TIMESTAMP | YES | - | Completion timestamp |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: shishya_users (user_id)
- References: labs (lab_id)

**Functions Used In:**
- Lab code persistence (auto-save)
- Lab completion tracking
- Skills demonstration

---

## 14. shishya_user_test_attempts

**Purpose:** Store all test attempts with scores and answers.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| test_id | INTEGER | NO | - | FK to tests.id |
| course_id | INTEGER | NO | - | FK to courses.id |
| score | INTEGER | NO | - | Points earned |
| total_questions | INTEGER | NO | - | Total questions in test |
| passed | BOOLEAN | NO | false | Met passing percentage |
| answers | JSONB | YES | - | Student's submitted answers |
| time_taken | INTEGER | YES | - | Seconds to complete |
| attempted_at | TIMESTAMP | NO | NOW() | Attempt timestamp |

**Connections:**
- Belongs to: shishya_users (user_id)
- References: tests (test_id), courses (course_id)

**Functions Used In:**
- Test results display
- Certificate eligibility (test_required)
- Marksheet grade calculation
- Dashboard "Tests Passed" count
- Centralized Tests page

---

## 15. shishya_user_project_submissions

**Purpose:** Track project submissions and review status.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| project_id | INTEGER | NO | - | FK to projects.id |
| course_id | INTEGER | NO | - | FK to courses.id |
| submission_url | TEXT | YES | - | Live demo URL |
| github_url | TEXT | YES | - | Repository URL |
| description | TEXT | YES | - | Submission notes |
| status | VARCHAR(20) | NO | 'pending' | pending/approved/rejected |
| feedback | TEXT | YES | - | Reviewer feedback |
| submitted_at | TIMESTAMP | NO | NOW() | Submission time |
| reviewed_at | TIMESTAMP | YES | - | Review timestamp |

**Connections:**
- Belongs to: shishya_users (user_id)
- References: projects (project_id), courses (course_id)

**Functions Used In:**
- Project submission form
- Certificate eligibility (project_required)
- Portfolio projects display
- Centralized Projects page
- Dashboard pending actions

---

## 16. shishya_user_certificates

**Purpose:** Store earned certificates with unique verification IDs.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | VARCHAR(36) | NO | UUID | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| course_id | INTEGER | NO | - | FK to courses.id |
| certificate_number | VARCHAR(50) | NO | - | Unique verification ID |
| issued_at | TIMESTAMP | NO | NOW() | Certificate issue date |
| pdf_url | TEXT | YES | - | Generated PDF storage URL |

**Connections:**
- Belongs to: shishya_users (user_id)
- References: courses (course_id)

**Functions Used In:**
- Certificate viewer page
- Public verification (/verify/certificate/:id)
- Portfolio certificates display
- Dashboard "Certificates" count
- PDF generation with QR code

---

## 17. shishya_course_enrollments

**Purpose:** Track which courses a student has enrolled in.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| course_id | INTEGER | NO | - | FK to courses.id |
| enrolled_at | TIMESTAMP | NO | NOW() | Enrollment timestamp |
| completed_at | TIMESTAMP | YES | - | Course completion time |
| status | VARCHAR(20) | NO | 'active' | active/completed/dropped |

**Connections:**
- Belongs to: shishya_users (user_id)
- References: courses (course_id)

**Functions Used In:**
- Course access control
- Dashboard "In Progress"/"Completed" counts
- Credit deduction on enrollment
- "Enroll Now" button state

---

# CREDITS & WALLET (5 Tables)

## 18. shishya_user_credits

**Purpose:** Track student's learning credit balance.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id (Unique) |
| balance | INTEGER | NO | 0 | Current credit balance |
| lifetime_earned | INTEGER | NO | 0 | Total credits ever received |
| lifetime_spent | INTEGER | NO | 0 | Total credits ever spent |
| updated_at | TIMESTAMP | NO | NOW() | Last balance change |

**Connections:**
- Belongs to: shishya_users (user_id) - One-to-One

**Functions Used In:**
- Wallet/Credits display
- Enrollment credit check
- Dashboard credit metric
- Welcome bonus (500 credits)

---

## 19. shishya_credit_transactions

**Purpose:** Complete transaction history for credits.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| amount | INTEGER | NO | - | Credits (+positive, -negative) |
| type | VARCHAR(20) | NO | - | welcome/purchase/spend/refund/voucher |
| description | TEXT | YES | - | Human-readable description |
| reference_id | VARCHAR(100) | YES | - | External reference (Razorpay order) |
| created_at | TIMESTAMP | NO | NOW() | Transaction timestamp |

**Connections:**
- Belongs to: shishya_users (user_id)

**Functions Used In:**
- Wallet transaction history
- Purchase tracking
- Refund processing
- Audit trail

---

## 20. shishya_vouchers

**Purpose:** Redeemable voucher codes for free credits.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| code | VARCHAR(50) | NO | - | Unique voucher code |
| credits | INTEGER | NO | - | Credits awarded on redemption |
| max_uses | INTEGER | NO | 1 | Maximum total redemptions |
| used_count | INTEGER | NO | 0 | Current redemption count |
| expires_at | TIMESTAMP | YES | - | Voucher expiration date |
| is_active | BOOLEAN | NO | true | Voucher enabled flag |
| created_at | TIMESTAMP | NO | NOW() | Voucher creation time |

**Connections:**
- Referenced by: shishya_voucher_redemptions

**Functions Used In:**
- Voucher redemption form
- Marketing campaigns
- Partnership promotions

---

## 21. shishya_voucher_redemptions

**Purpose:** Track which users have redeemed which vouchers.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| voucher_id | INTEGER | NO | - | FK to shishya_vouchers.id |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| redeemed_at | TIMESTAMP | NO | NOW() | Redemption timestamp |

**Connections:**
- Belongs to: shishya_users (user_id), shishya_vouchers (voucher_id)

**Functions Used In:**
- Prevent duplicate redemptions
- Voucher usage analytics

---

## 22. shishya_gift_boxes

**Purpose:** Surprise credit gifts for student engagement.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| credits | INTEGER | NO | - | Gift credit amount |
| message | TEXT | YES | - | Gift message |
| opened | BOOLEAN | NO | false | Whether gift was claimed |
| opened_at | TIMESTAMP | YES | - | Claim timestamp |
| created_at | TIMESTAMP | NO | NOW() | Gift creation time |

**Connections:**
- Belongs to: shishya_users (user_id)

**Functions Used In:**
- Gamification rewards
- Engagement incentives
- Surprise mechanics

---

# NOTIFICATIONS (1 Table)

## 23. shishya_notifications

**Purpose:** In-app notification system for students.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| title | VARCHAR(255) | NO | - | Notification headline |
| message | TEXT | NO | - | Full notification message |
| type | VARCHAR(50) | NO | 'info' | info/success/warning/achievement |
| read | BOOLEAN | NO | false | Read status |
| action_url | TEXT | YES | - | Click destination URL |
| created_at | TIMESTAMP | NO | NOW() | Notification timestamp |

**Connections:**
- Belongs to: shishya_users (user_id)

**Functions Used In:**
- Notification bell/dropdown
- Unread count badge
- Achievement announcements
- System alerts

---

# AI MOTIVATION ENGINE (8 Tables)

## 24. shishya_motivation_rules

**Purpose:** Configurable rules for automated motivation triggers.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| name | VARCHAR(255) | NO | - | Rule name |
| description | TEXT | YES | - | Rule purpose/documentation |
| trigger_type | VARCHAR(50) | NO | - | Event type (lesson_complete, streak, etc.) |
| trigger_condition | JSONB | NO | - | Condition parameters |
| action_type | VARCHAR(50) | NO | - | Action type (notification, badge, credits) |
| action_data | JSONB | NO | - | Action parameters |
| is_active | BOOLEAN | NO | true | Rule enabled flag |
| priority | INTEGER | NO | 0 | Execution order (higher = first) |
| created_at | TIMESTAMP | NO | NOW() | Rule creation time |

**Example trigger_condition:**
```json
{"event": "lesson_complete", "count": 10}
```

**Example action_data:**
```json
{"type": "notification", "title": "Great Progress!", "message": "You completed 10 lessons!"}
```

**Connections:**
- Referenced by: shishya_rule_trigger_logs

**Functions Used In:**
- Automated engagement
- Gamification triggers
- Achievement system

---

## 25. shishya_rule_trigger_logs

**Purpose:** Audit log of all rule executions.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| rule_id | INTEGER | NO | - | FK to shishya_motivation_rules.id |
| user_id | VARCHAR(36) | NO | - | User who triggered the rule |
| triggered_at | TIMESTAMP | NO | NOW() | Execution timestamp |
| action_taken | JSONB | YES | - | What action was performed |

**Connections:**
- Belongs to: shishya_motivation_rules (rule_id), shishya_users (user_id)

**Functions Used In:**
- Rule effectiveness analytics
- Debugging rule behavior
- Prevent duplicate triggers

---

## 26. shishya_motivation_cards

**Purpose:** Personalized motivation messages displayed to students.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| card_type | VARCHAR(50) | NO | - | quote/tip/challenge/streak/achievement |
| title | VARCHAR(255) | NO | - | Card headline |
| message | TEXT | NO | - | Full message content |
| action_url | TEXT | YES | - | Optional CTA link |
| dismissed | BOOLEAN | NO | false | User dismissed flag |
| expires_at | TIMESTAMP | YES | - | Auto-expire timestamp |
| created_at | TIMESTAMP | NO | NOW() | Card creation time |

**Connections:**
- Belongs to: shishya_users (user_id)

**Functions Used In:**
- Dashboard motivation section
- Daily motivational quotes
- Challenge cards
- Streak celebrations

---

## 27. shishya_ai_nudge_logs

**Purpose:** Log of AI-generated personalized nudges.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| nudge_type | VARCHAR(50) | NO | - | Type of nudge |
| message | TEXT | NO | - | Generated nudge message |
| context | JSONB | YES | - | Context used for generation |
| created_at | TIMESTAMP | NO | NOW() | Nudge timestamp |

**Connections:**
- Belongs to: shishya_users (user_id)

**Functions Used In:**
- AI-powered engagement
- Personalized reminders
- Re-engagement campaigns

---

## 28. shishya_student_streaks

**Purpose:** Track consecutive learning days for gamification.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id (Unique) |
| current_streak | INTEGER | NO | 0 | Current consecutive days |
| longest_streak | INTEGER | NO | 0 | All-time best streak |
| last_activity_date | DATE | YES | - | Last learning activity date |
| updated_at | TIMESTAMP | NO | NOW() | Last update timestamp |

**Connections:**
- Belongs to: shishya_users (user_id) - One-to-One

**Functions Used In:**
- Streak display on dashboard
- Streak badges/achievements
- Retention mechanics
- Motivation rule triggers

---

## 29. shishya_mystery_boxes

**Purpose:** Gamified reward boxes with random prizes.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| box_type | VARCHAR(50) | NO | - | daily/weekly/achievement/special |
| reward_type | VARCHAR(50) | YES | - | credits/badge/feature/discount |
| reward_value | INTEGER | YES | - | Reward amount (for credits) |
| opened | BOOLEAN | NO | false | Whether box was opened |
| opened_at | TIMESTAMP | YES | - | Open timestamp |
| expires_at | TIMESTAMP | YES | - | Expiration time |
| created_at | TIMESTAMP | NO | NOW() | Box creation time |

**Connections:**
- Belongs to: shishya_users (user_id)

**Functions Used In:**
- Daily rewards system
- Achievement rewards
- Surprise engagement mechanics

---

## 30. shishya_scholarships

**Purpose:** Scholarship programs offering free credits.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| name | VARCHAR(255) | NO | - | Scholarship name |
| description | TEXT | YES | - | Full description |
| credits | INTEGER | NO | - | Credits awarded |
| eligibility_criteria | JSONB | YES | - | Requirements to qualify |
| max_recipients | INTEGER | YES | - | Maximum awardees |
| current_recipients | INTEGER | NO | 0 | Current count |
| is_active | BOOLEAN | NO | true | Open for applications |
| starts_at | TIMESTAMP | YES | - | Application start date |
| ends_at | TIMESTAMP | YES | - | Application end date |
| created_at | TIMESTAMP | NO | NOW() | Creation time |

**Connections:**
- Referenced by: shishya_user_scholarships

**Functions Used In:**
- Scholarship listing page
- Eligibility checking
- Financial aid system

---

## 31. shishya_user_scholarships

**Purpose:** Track scholarship awards to students.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| scholarship_id | INTEGER | NO | - | FK to shishya_scholarships.id |
| awarded_at | TIMESTAMP | NO | NOW() | Award date |
| status | VARCHAR(20) | NO | 'active' | active/expired/revoked |

**Connections:**
- Belongs to: shishya_users (user_id), shishya_scholarships (scholarship_id)

**Functions Used In:**
- Scholarship award tracking
- Student financial aid history
- Credit disbursement

---

# ACADEMIC RECORDS (2 Tables)

## 32. shishya_marksheets

**Purpose:** Consolidated academic transcripts for students.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | VARCHAR(36) | NO | UUID | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| marksheet_number | VARCHAR(50) | NO | - | Unique verification ID |
| courses_completed | INTEGER | NO | 0 | Number of courses |
| total_credits | INTEGER | NO | 0 | Academic credits earned |
| cgpa | DECIMAL(3,2) | YES | - | Cumulative GPA (0.00-10.00) |
| classification | VARCHAR(50) | YES | - | Distinction/First Class/Second Class/Pass |
| generated_at | TIMESTAMP | NO | NOW() | Generation timestamp |

**Grade Calculation:**
- O (Outstanding): 90-100% = 10.0
- A+ (Excellent): 80-89% = 9.0
- A (Very Good): 70-79% = 8.0
- B+ (Good): 60-69% = 7.0
- B (Above Average): 50-59% = 6.0
- C (Average): 40-49% = 5.0
- F (Fail): Below 40% = 0.0

**Connections:**
- Belongs to: shishya_users (user_id)
- Referenced by: shishya_marksheet_verifications

**Functions Used In:**
- Marksheet page (/shishya/marksheet)
- Public verification (/verify/marksheet/:id)
- PDF generation
- QR code verification

---

## 33. shishya_marksheet_verifications

**Purpose:** Audit log of marksheet verification attempts.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| marksheet_id | VARCHAR(36) | NO | - | FK to shishya_marksheets.id |
| verified_at | TIMESTAMP | NO | NOW() | Verification timestamp |
| verifier_ip | VARCHAR(45) | YES | - | Verifier's IP address |
| verifier_agent | TEXT | YES | - | Browser user agent |

**Connections:**
- Belongs to: shishya_marksheets (marksheet_id)

**Functions Used In:**
- Verification analytics
- Authenticity tracking
- Employer verification logging

---

# AI TUTOR (2 Tables)

## 34. shishya_usha_conversations

**Purpose:** Usha AI tutor conversation sessions.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| course_id | INTEGER | NO | - | FK to courses.id |
| page_type | VARCHAR(20) | NO | - | lesson/lab/project/test |
| context_id | INTEGER | YES | - | Specific lesson/lab/project ID |
| created_at | TIMESTAMP | NO | NOW() | Session start time |
| updated_at | TIMESTAMP | NO | NOW() | Last activity time |

**Connections:**
- Belongs to: shishya_users (user_id)
- References: courses (course_id)
- Parent of: shishya_usha_messages

**Functions Used In:**
- Conversation context management
- Session persistence
- Multi-context support (lesson, lab, project)

---

## 35. shishya_usha_messages

**Purpose:** Individual messages in Usha AI conversations.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| conversation_id | INTEGER | NO | - | FK to shishya_usha_conversations.id |
| role | VARCHAR(20) | NO | - | user/assistant |
| content | TEXT | NO | - | Message content |
| response_type | VARCHAR(50) | YES | - | explanation/hint/guidance/clarification |
| help_level | VARCHAR(20) | YES | - | minimal/moderate/detailed |
| created_at | TIMESTAMP | NO | NOW() | Message timestamp |

**Connections:**
- Belongs to: shishya_usha_conversations (conversation_id)

**Functions Used In:**
- Chat history display
- Context for AI responses
- Conversation continuity
- Multi-language support

---

# DATABASE VIEWS

## published_courses_view

**Purpose:** Optimized read-only view for SHISHYA to access only published courses.

```sql
CREATE VIEW published_courses_view AS
SELECT * FROM courses
WHERE status = 'published' AND is_active = true;
```

**Usage:** SHISHYA API uses this view instead of filtering at application level, improving query performance and ensuring consistency.

---

# TABLE RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COURSE CONTENT (Admin)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   courses ──┬──> modules ──> lessons                                        │
│             │                                                               │
│             ├──> tests                                                      │
│             │                                                               │
│             ├──> projects                                                   │
│             │                                                               │
│             └──> labs                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ (Read-only for SHISHYA)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHISHYA STUDENT PORTAL                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   shishya_users (Central Entity)                                            │
│        │                                                                    │
│        ├──> shishya_user_profiles (1:1)                                     │
│        │                                                                    │
│        ├──> shishya_sessions (1:N)                                          │
│        │                                                                    │
│        ├──> shishya_user_credits (1:1)                                      │
│        │         └──> shishya_credit_transactions (1:N)                     │
│        │                                                                    │
│        ├──> shishya_course_enrollments (1:N) ──> courses                    │
│        │                                                                    │
│        ├──> shishya_user_progress (1:N) ──> lessons                         │
│        │                                                                    │
│        ├──> shishya_user_lab_progress (1:N) ──> labs                        │
│        │                                                                    │
│        ├──> shishya_user_test_attempts (1:N) ──> tests                      │
│        │                                                                    │
│        ├──> shishya_user_project_submissions (1:N) ──> projects             │
│        │                                                                    │
│        ├──> shishya_user_certificates (1:N) ──> courses                     │
│        │                                                                    │
│        ├──> shishya_notifications (1:N)                                     │
│        │                                                                    │
│        ├──> shishya_student_streaks (1:1)                                   │
│        │                                                                    │
│        ├──> shishya_motivation_cards (1:N)                                  │
│        │                                                                    │
│        ├──> shishya_usha_conversations (1:N)                                │
│        │         └──> shishya_usha_messages (1:N)                           │
│        │                                                                    │
│        ├──> shishya_marksheets (1:N)                                        │
│        │         └──> shishya_marksheet_verifications (1:N)                 │
│        │                                                                    │
│        └──> shishya_mystery_boxes (1:N)                                     │
│                                                                             │
│   Standalone Tables:                                                        │
│   - shishya_vouchers ──> shishya_voucher_redemptions                        │
│   - shishya_scholarships ──> shishya_user_scholarships                      │
│   - shishya_motivation_rules ──> shishya_rule_trigger_logs                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# SUMMARY TABLE

| Category | Table Name | Columns | Primary Function |
|----------|------------|---------|------------------|
| **Course Content** | courses | 21 | Master course catalog |
| | modules | 6 | Course sections |
| | lessons | 9 | Learning content |
| | tests | 9 | Assessments |
| | projects | 10 | Assignments |
| | labs | 15 | Coding exercises |
| **Auth** | shishya_users | 6 | Student accounts |
| | shishya_sessions | 3 | Login sessions |
| | shishya_otp_codes | 6 | Email verification |
| | shishya_otp_logs | 6 | Security audit |
| **Profile** | shishya_user_profiles | 16 | Student profiles |
| **Progress** | shishya_user_progress | 7 | Lesson completion |
| | shishya_user_lab_progress | 7 | Lab completion |
| | shishya_user_test_attempts | 10 | Test scores |
| | shishya_user_project_submissions | 12 | Project submissions |
| | shishya_user_certificates | 6 | Certificates |
| | shishya_course_enrollments | 6 | Enrollments |
| **Credits** | shishya_user_credits | 6 | Credit balance |
| | shishya_credit_transactions | 7 | Transaction history |
| | shishya_vouchers | 8 | Voucher codes |
| | shishya_voucher_redemptions | 4 | Voucher usage |
| | shishya_gift_boxes | 7 | Gift credits |
| **Notifications** | shishya_notifications | 8 | In-app alerts |
| **AI Motivation** | shishya_motivation_rules | 10 | Rule engine |
| | shishya_rule_trigger_logs | 5 | Rule audit |
| | shishya_motivation_cards | 9 | Motivation messages |
| | shishya_ai_nudge_logs | 6 | AI nudges |
| | shishya_student_streaks | 6 | Learning streaks |
| | shishya_mystery_boxes | 9 | Reward boxes |
| | shishya_scholarships | 11 | Scholarship programs |
| | shishya_user_scholarships | 5 | Scholarship awards |
| **Academic** | shishya_marksheets | 8 | Academic transcripts |
| | shishya_marksheet_verifications | 5 | Verification logs |
| **AI Tutor** | shishya_usha_conversations | 7 | AI chat sessions |
| | shishya_usha_messages | 7 | Chat messages |

**Total: 35 Tables + 1 View**

---

*Last Updated: January 2026*
