# SHISHYA Database Schema - Complete Reference

## Database Architecture Overview

**Total Tables:** 74 tables in shared PostgreSQL database  
**Database:** PostgreSQL (Neon-compatible)

**Access Pattern:**
- **Admin (Guru)** = Creates and manages course content
- **Shishya (Student)** = Reads published content, writes own progress/data

**Key Principle:** Shishya portal NEVER modifies course content tables. It only READS published courses and WRITES to shishya-prefixed tables.

---

## Critical ID Type Rule

**IMPORTANT:** `shishya_users.id` is `VARCHAR(36)` containing UUID v4 - NOT a serial integer.

All foreign keys referencing shishya users MUST use `VARCHAR(36)`:
```sql
user_id VARCHAR(36) REFERENCES shishya_users(id)
```

---

## Mandatory Visibility Filter

SHISHYA must ALWAYS filter courses with:
```sql
SELECT * FROM courses 
WHERE status = 'published' AND is_active = true
```

---

# SECTION 1: TABLES SHISHYA CAN READ (Admin-Managed)

These tables are created and managed by Admin. SHISHYA has READ-ONLY access to published content.

---

## 1. courses

**Purpose:** Master catalog of all courses available on the platform.  
**Access:** READ-ONLY (filter by `status='published' AND is_active=true`)

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| title | VARCHAR(255) | NO | - | Course display name |
| name | VARCHAR(255) | NO | - | Course internal name |
| description | TEXT | YES | - | Full course description |
| short_description | VARCHAR(500) | YES | - | Brief summary for cards |
| level | VARCHAR(20) | NO | 'beginner' | beginner/intermediate/advanced |
| language | VARCHAR(20) | NO | 'en' | Course language (en/hi/ta/te) |
| duration | VARCHAR(50) | YES | - | Estimated completion time |
| skills | TEXT | YES | - | Comma-separated skills taught |
| status | VARCHAR(20) | NO | 'draft' | draft/published/archived |
| is_active | BOOLEAN | NO | false | Quick visibility toggle |
| is_free | BOOLEAN | NO | false | Free course flag |
| credit_cost | INTEGER | NO | 0 | Credits required for enrollment |
| price | INTEGER | NO | 0 | Price in smallest currency unit |
| currency | VARCHAR(10) | NO | 'INR' | Currency code |
| test_required | BOOLEAN | NO | false | Must pass test for certificate |
| project_required | BOOLEAN | NO | false | Must submit project for certificate |
| thumbnail_url | TEXT | YES | - | Course cover image URL |
| instructor_id | VARCHAR(36) | YES | - | Creator's user ID |
| published_at | TIMESTAMP | YES | - | When course was made live |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |
| updated_at | TIMESTAMP | NO | NOW() | Last modification time |

**Connections:**
- Parent of: modules, lessons, tests, questions, projects, practice_labs
- Referenced by: shishya_course_enrollments, shishya_user_progress, shishya_user_certificates

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
- Parent of: lessons, practice_labs

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
- Referenced by: shishya_user_progress

---

## 4. tests

**Purpose:** Course assessments with configurable settings.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| course_id | INTEGER | NO | - | FK to courses.id |
| title | VARCHAR(255) | NO | - | Test title |
| description | TEXT | YES | - | Test instructions |
| duration_minutes | INTEGER | NO | 30 | Time limit for test |
| passing_percentage | INTEGER | NO | 60 | Minimum score to pass (%) |
| is_active | BOOLEAN | NO | true | Test availability flag |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: courses (course_id)
- Parent of: questions
- Referenced by: shishya_user_test_attempts

---

## 5. questions

**Purpose:** Individual test questions (MCQ, true/false, etc.).

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| test_id | INTEGER | NO | - | FK to tests.id |
| question_text | TEXT | NO | - | The question content |
| question_type | VARCHAR(20) | NO | 'mcq' | mcq/true_false/short_answer |
| options | JSONB | YES | - | Answer options array |
| correct_answer | INTEGER | NO | - | Index of correct option |
| explanation | TEXT | YES | - | Answer explanation |
| points | INTEGER | NO | 1 | Points for this question |
| order_index | INTEGER | NO | 0 | Display sequence |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Options JSONB Structure:**
```json
["Option A", "Option B", "Option C", "Option D"]
```

**Connections:**
- Belongs to: tests (test_id)

---

## 6. projects

**Purpose:** Hands-on assignments for practical skill application.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| course_id | INTEGER | NO | - | FK to courses.id |
| title | VARCHAR(255) | NO | - | Project title |
| description | TEXT | YES | - | Project requirements |
| difficulty | VARCHAR(20) | NO | 'beginner' | Difficulty level |
| estimated_hours | INTEGER | YES | - | Expected completion time |
| requirements | JSONB | YES | - | Submission requirements |
| rubric | JSONB | YES | - | Grading criteria |
| is_active | BOOLEAN | NO | true | Project availability flag |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: courses (course_id)
- Referenced by: shishya_user_project_submissions

---

## 7. practice_labs

**Purpose:** Guided coding exercises with browser-based execution.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| course_id | INTEGER | NO | - | FK to courses.id |
| module_id | INTEGER | YES | - | FK to modules.id |
| lesson_id | INTEGER | YES | - | FK to lessons.id |
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

---

## 8. certificates

**Purpose:** Certificate templates with eligibility requirements.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| course_id | INTEGER | NO | - | FK to courses.id |
| name | VARCHAR(255) | NO | - | Certificate name |
| template_url | TEXT | YES | - | Certificate template design |
| requires_test_pass | BOOLEAN | NO | false | Must pass all tests |
| requires_project_completion | BOOLEAN | NO | false | Must submit all projects |
| requires_lab_completion | BOOLEAN | NO | false | Must complete all labs |
| passing_percentage | INTEGER | NO | 60 | Minimum score required |
| is_active | BOOLEAN | NO | true | Certificate availability |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: courses (course_id)

---

## 9. skills

**Purpose:** Master skills library for tagging courses.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| name | VARCHAR(100) | NO | - | Skill name |
| category | VARCHAR(50) | YES | - | Skill category |
| icon | TEXT | YES | - | Icon URL or class |
| description | TEXT | YES | - | Skill description |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

---

## 10. course_rewards

**Purpose:** Reward configuration per course (credits, badges).

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| course_id | INTEGER | NO | - | FK to courses.id |
| reward_type | VARCHAR(50) | NO | - | credits/badge/achievement |
| reward_value | INTEGER | YES | - | Amount for credits |
| trigger_event | VARCHAR(50) | NO | - | completion/test_pass/project_submit |
| is_active | BOOLEAN | NO | true | Reward enabled flag |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: courses (course_id)

---

## 11. achievement_cards

**Purpose:** Unlockable achievements for gamification.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| name | VARCHAR(255) | NO | - | Achievement name |
| description | TEXT | YES | - | Achievement description |
| icon_url | TEXT | YES | - | Achievement icon |
| category | VARCHAR(50) | YES | - | Category (streak/completion/mastery) |
| unlock_criteria | JSONB | YES | - | Criteria to unlock |
| points | INTEGER | NO | 0 | Points awarded |
| is_active | BOOLEAN | NO | true | Achievement enabled |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

---

## 12. motivational_cards

**Purpose:** Admin-managed motivational messages displayed to students.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| title | VARCHAR(255) | NO | - | Card title |
| message | TEXT | NO | - | Motivational message |
| card_type | VARCHAR(50) | NO | - | quote/tip/challenge |
| category | VARCHAR(50) | YES | - | Category for targeting |
| author | VARCHAR(255) | YES | - | Quote author |
| is_active | BOOLEAN | NO | true | Card enabled |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

---

## 13. credit_packages

**Purpose:** Purchasable credit bundles for wallet top-up.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| name | VARCHAR(255) | NO | - | Package name |
| credits | INTEGER | NO | - | Credits in package |
| price | INTEGER | NO | - | Price in smallest unit |
| currency | VARCHAR(10) | NO | 'INR' | Currency code |
| discount_percent | INTEGER | NO | 0 | Discount percentage |
| is_popular | BOOLEAN | NO | false | Featured flag |
| is_active | BOOLEAN | NO | true | Package available |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

---

## 14. subscription_plans

**Purpose:** Subscription tiers for premium access.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | INTEGER | NO | auto-increment | Primary key |
| name | VARCHAR(255) | NO | - | Plan name |
| description | TEXT | YES | - | Plan description |
| price_monthly | INTEGER | NO | - | Monthly price |
| price_yearly | INTEGER | NO | - | Yearly price |
| currency | VARCHAR(10) | NO | 'INR' | Currency code |
| features | JSONB | YES | - | Features list |
| credits_per_month | INTEGER | NO | 0 | Monthly credits included |
| is_active | BOOLEAN | NO | true | Plan available |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

---

# SECTION 2: TABLES SHISHYA OWNS (Read + Write)

These tables are prefixed with `shishya_` and belong to the student portal.

---

# AUTHENTICATION (4 Tables)

## 15. shishya_users

**Purpose:** Student accounts and authentication.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | VARCHAR(36) | NO | UUID v4 | Primary key (UUID) |
| email | VARCHAR(255) | NO | - | Unique login email |
| password_hash | TEXT | NO | - | Bcrypt hashed password |
| name | VARCHAR(255) | YES | - | Student's full name |
| phone | VARCHAR(20) | YES | - | Phone number |
| status | VARCHAR(20) | NO | 'active' | active/suspended/deleted |
| email_verified | BOOLEAN | NO | false | Email verification status |
| phone_verified | BOOLEAN | NO | false | Phone verification status |
| last_login_at | TIMESTAMP | YES | - | Last login timestamp |
| last_active_at | TIMESTAMP | YES | - | Last activity timestamp |
| created_at | TIMESTAMP | NO | NOW() | Account creation time |
| updated_at | TIMESTAMP | NO | NOW() | Last update time |

**Connections:**
- Parent of: ALL shishya_ tables (via user_id)

**Functions Used In:**
- Signup/Login authentication
- Email/Phone verification
- Session management
- Account status control

---

## 16. shishya_sessions

**Purpose:** Server-side session storage (express-session).

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| sid | VARCHAR(255) | NO | - | Session ID (Primary key) |
| sess | JSONB | NO | - | Session data (passport info) |
| expire | TIMESTAMP | NO | - | Session expiration time |

**Connections:**
- Links to: shishya_users (via sess.passport.user)

**Functions Used In:**
- HTTP-only cookie authentication
- Session persistence
- Auto-cleanup of expired sessions

---

## 17. shishya_otp_codes

**Purpose:** One-time passwords for verification.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| email | VARCHAR(255) | NO | - | Target email |
| otp_hash | TEXT | NO | - | SHA256 hashed OTP |
| expires_at | TIMESTAMP | NO | - | OTP expiration (10 min) |
| verified | BOOLEAN | NO | false | OTP used flag |
| created_at | TIMESTAMP | NO | NOW() | OTP generation time |

**Connections:**
- Links to: shishya_users (via email)

---

## 18. shishya_otp_logs

**Purpose:** Audit trail for OTP actions.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| email | VARCHAR(255) | NO | - | Target email |
| action | VARCHAR(50) | NO | - | send/verify/fail/expire |
| ip_address | VARCHAR(45) | YES | - | Client IP address |
| user_agent | TEXT | YES | - | Browser user agent |
| created_at | TIMESTAMP | NO | NOW() | Action timestamp |

---

# PROFILE (1 Table)

## 19. shishya_user_profiles

**Purpose:** Extended student profile information.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | VARCHAR(36) | NO | UUID | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id (UNIQUE) |
| full_name | VARCHAR(255) | YES | - | Display name |
| username | VARCHAR(50) | YES | - | Unique public URL slug |
| bio | TEXT | YES | - | About me (max 500 chars) |
| profile_photo | TEXT | YES | - | Base64 encoded image |
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

---

# PROGRESS TRACKING (6 Tables)

## 20. shishya_course_enrollments

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

---

## 21. shishya_user_progress

**Purpose:** Track lesson completion status.

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
- References: courses, lessons

---

## 22. shishya_user_lab_progress

**Purpose:** Track lab completion and saved code.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| lab_id | INTEGER | NO | - | FK to practice_labs.id |
| completed | BOOLEAN | NO | false | Lab completion status |
| user_code | TEXT | YES | - | Student's saved code |
| completed_at | TIMESTAMP | YES | - | Completion timestamp |
| created_at | TIMESTAMP | NO | NOW() | Record creation time |

**Connections:**
- Belongs to: shishya_users (user_id)
- References: practice_labs (lab_id)

---

## 23. shishya_user_test_attempts

**Purpose:** Store all test attempts with scores.

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

**Answers JSONB Structure:**
```json
[
  {"question_id": 1, "selected": 2},
  {"question_id": 2, "selected": 0}
]
```

**Connections:**
- Belongs to: shishya_users (user_id)
- References: tests, courses

---

## 24. shishya_user_project_submissions

**Purpose:** Track project submissions.

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
- References: projects, courses

---

## 25. shishya_user_certificates

**Purpose:** Store earned certificates.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | VARCHAR(36) | NO | UUID | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| course_id | INTEGER | NO | - | FK to courses.id |
| certificate_number | VARCHAR(50) | NO | - | Unique verification ID |
| issued_at | TIMESTAMP | NO | NOW() | Certificate issue date |
| pdf_url | TEXT | YES | - | Generated PDF URL |

**Connections:**
- Belongs to: shishya_users (user_id)
- References: courses

---

# CREDITS & WALLET (6 Tables)

## 26. shishya_user_credits

**Purpose:** Track student's credit balance.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id (UNIQUE) |
| balance | INTEGER | NO | 0 | Current credit balance |
| lifetime_earned | INTEGER | NO | 0 | Total credits ever received |
| lifetime_spent | INTEGER | NO | 0 | Total credits ever spent |
| updated_at | TIMESTAMP | NO | NOW() | Last balance change |

**Connections:**
- Belongs to: shishya_users (user_id) - One-to-One

---

## 27. shishya_credit_transactions

**Purpose:** Complete transaction history.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| amount | INTEGER | NO | - | Credits (+positive, -negative) |
| type | VARCHAR(20) | NO | - | welcome/purchase/spend/refund/reward |
| description | TEXT | YES | - | Human-readable description |
| reference_id | VARCHAR(100) | YES | - | External reference |
| created_at | TIMESTAMP | NO | NOW() | Transaction timestamp |

---

## 28. shishya_payments

**Purpose:** Payment records for Razorpay transactions.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| razorpay_order_id | VARCHAR(100) | NO | - | Razorpay order ID |
| razorpay_payment_id | VARCHAR(100) | YES | - | Razorpay payment ID |
| razorpay_signature | TEXT | YES | - | Payment signature |
| amount | INTEGER | NO | - | Amount in paise |
| currency | VARCHAR(10) | NO | 'INR' | Currency code |
| credits_purchased | INTEGER | NO | - | Credits to add |
| status | VARCHAR(20) | NO | 'pending' | pending/success/failed |
| package_id | INTEGER | YES | - | FK to credit_packages.id |
| created_at | TIMESTAMP | NO | NOW() | Order creation time |
| completed_at | TIMESTAMP | YES | - | Payment completion time |

**Connections:**
- Belongs to: shishya_users (user_id)
- References: credit_packages (package_id)

---

## 29. shishya_vouchers

**Purpose:** Redeemable voucher codes.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| code | VARCHAR(50) | NO | - | Unique voucher code |
| credits | INTEGER | NO | - | Credits awarded |
| max_uses | INTEGER | NO | 1 | Maximum redemptions |
| used_count | INTEGER | NO | 0 | Current count |
| expires_at | TIMESTAMP | YES | - | Expiration date |
| is_active | BOOLEAN | NO | true | Voucher enabled |
| created_at | TIMESTAMP | NO | NOW() | Creation time |

---

## 30. shishya_voucher_redemptions

**Purpose:** Track voucher usage.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| voucher_id | INTEGER | NO | - | FK to shishya_vouchers.id |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| redeemed_at | TIMESTAMP | NO | NOW() | Redemption timestamp |

---

## 31. shishya_gift_boxes

**Purpose:** Surprise credit gifts.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| credits | INTEGER | NO | - | Gift credit amount |
| message | TEXT | YES | - | Gift message |
| opened | BOOLEAN | NO | false | Claimed status |
| opened_at | TIMESTAMP | YES | - | Claim timestamp |
| created_at | TIMESTAMP | NO | NOW() | Creation time |

---

# NOTIFICATIONS (1 Table)

## 32. shishya_notifications

**Purpose:** In-app notification system.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| title | VARCHAR(255) | NO | - | Notification headline |
| message | TEXT | NO | - | Full message |
| type | VARCHAR(50) | NO | 'info' | info/success/warning/achievement |
| read | BOOLEAN | NO | false | Read status |
| action_url | TEXT | YES | - | Click destination URL |
| created_at | TIMESTAMP | NO | NOW() | Notification timestamp |

---

# AI MOTIVATION ENGINE (8 Tables)

## 33. shishya_motivation_rules

**Purpose:** Configurable automated trigger rules.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| name | VARCHAR(255) | NO | - | Rule name |
| description | TEXT | YES | - | Rule documentation |
| trigger_type | VARCHAR(50) | NO | - | Event type |
| trigger_condition | JSONB | NO | - | Condition parameters |
| action_type | VARCHAR(50) | NO | - | Action type |
| action_data | JSONB | NO | - | Action parameters |
| is_active | BOOLEAN | NO | true | Rule enabled |
| priority | INTEGER | NO | 0 | Execution order |
| created_at | TIMESTAMP | NO | NOW() | Creation time |

---

## 34. shishya_rule_trigger_logs

**Purpose:** Audit log of rule executions.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| rule_id | INTEGER | NO | - | FK to shishya_motivation_rules.id |
| user_id | VARCHAR(36) | NO | - | User who triggered |
| triggered_at | TIMESTAMP | NO | NOW() | Execution timestamp |
| action_taken | JSONB | YES | - | What action performed |

---

## 35. shishya_motivation_cards

**Purpose:** Personalized motivation messages for students.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| card_type | VARCHAR(50) | NO | - | quote/tip/challenge/streak |
| title | VARCHAR(255) | NO | - | Card headline |
| message | TEXT | NO | - | Message content |
| action_url | TEXT | YES | - | Optional CTA link |
| dismissed | BOOLEAN | NO | false | User dismissed |
| expires_at | TIMESTAMP | YES | - | Auto-expire time |
| created_at | TIMESTAMP | NO | NOW() | Creation time |

---

## 36. shishya_ai_nudge_logs

**Purpose:** AI-generated personalized nudges.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| nudge_type | VARCHAR(50) | NO | - | Type of nudge |
| message | TEXT | NO | - | Nudge message |
| context | JSONB | YES | - | Context used |
| created_at | TIMESTAMP | NO | NOW() | Timestamp |

---

## 37. shishya_student_streaks

**Purpose:** Track consecutive learning days.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id (UNIQUE) |
| current_streak | INTEGER | NO | 0 | Current consecutive days |
| longest_streak | INTEGER | NO | 0 | All-time best streak |
| last_activity_date | DATE | YES | - | Last learning date |
| updated_at | TIMESTAMP | NO | NOW() | Last update |

---

## 38. shishya_mystery_boxes

**Purpose:** Gamified reward boxes.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| box_type | VARCHAR(50) | NO | - | daily/weekly/achievement |
| reward_type | VARCHAR(50) | YES | - | credits/badge/feature |
| reward_value | INTEGER | YES | - | Reward amount |
| opened | BOOLEAN | NO | false | Opened status |
| opened_at | TIMESTAMP | YES | - | Open timestamp |
| expires_at | TIMESTAMP | YES | - | Expiration time |
| created_at | TIMESTAMP | NO | NOW() | Creation time |

---

## 39. shishya_scholarships

**Purpose:** Available scholarship programs.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| name | VARCHAR(255) | NO | - | Scholarship name |
| description | TEXT | YES | - | Description |
| credits | INTEGER | NO | - | Credits awarded |
| eligibility_criteria | JSONB | YES | - | Requirements |
| max_recipients | INTEGER | YES | - | Maximum awardees |
| current_recipients | INTEGER | NO | 0 | Current count |
| is_active | BOOLEAN | NO | true | Open for applications |
| starts_at | TIMESTAMP | YES | - | Start date |
| ends_at | TIMESTAMP | YES | - | End date |
| created_at | TIMESTAMP | NO | NOW() | Creation time |

---

## 40. shishya_user_scholarships

**Purpose:** Track scholarship awards.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| scholarship_id | INTEGER | NO | - | FK to shishya_scholarships.id |
| awarded_at | TIMESTAMP | NO | NOW() | Award date |
| status | VARCHAR(20) | NO | 'active' | active/expired/revoked |

---

# ACADEMIC RECORDS (2 Tables)

## 41. shishya_marksheets

**Purpose:** Consolidated academic transcripts.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | VARCHAR(36) | NO | UUID | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| marksheet_number | VARCHAR(50) | NO | - | Unique verification ID |
| courses_completed | INTEGER | NO | 0 | Number of courses |
| total_credits | INTEGER | NO | 0 | Academic credits earned |
| cgpa | DECIMAL(3,2) | YES | - | Cumulative GPA (0-10) |
| classification | VARCHAR(50) | YES | - | Distinction/First Class/Pass |
| generated_at | TIMESTAMP | NO | NOW() | Generation timestamp |

**Grade Calculation:**
| Grade | Score Range | Points |
|-------|-------------|--------|
| O (Outstanding) | 90-100% | 10.0 |
| A+ (Excellent) | 80-89% | 9.0 |
| A (Very Good) | 70-79% | 8.0 |
| B+ (Good) | 60-69% | 7.0 |
| B (Above Average) | 50-59% | 6.0 |
| C (Average) | 40-49% | 5.0 |
| F (Fail) | Below 40% | 0.0 |

---

## 42. shishya_marksheet_verifications

**Purpose:** Verification attempt logs.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| marksheet_id | VARCHAR(36) | NO | - | FK to shishya_marksheets.id |
| verified_at | TIMESTAMP | NO | NOW() | Verification time |
| verifier_ip | VARCHAR(45) | YES | - | Verifier's IP |
| verifier_agent | TEXT | YES | - | Browser user agent |

---

# AI TUTOR - USHA (2 Tables)

## 43. shishya_usha_conversations

**Purpose:** Usha AI tutor chat sessions.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| user_id | VARCHAR(36) | NO | - | FK to shishya_users.id |
| course_id | INTEGER | NO | - | FK to courses.id |
| page_type | VARCHAR(20) | NO | - | lesson/lab/project/test |
| context_id | INTEGER | YES | - | Specific lesson/lab/project ID |
| created_at | TIMESTAMP | NO | NOW() | Session start |
| updated_at | TIMESTAMP | NO | NOW() | Last activity |

---

## 44. shishya_usha_messages

**Purpose:** Individual chat messages.

| Column | Type | Nullable | Default | Function |
|--------|------|----------|---------|----------|
| id | SERIAL | NO | auto | Primary key |
| conversation_id | INTEGER | NO | - | FK to shishya_usha_conversations.id |
| role | VARCHAR(20) | NO | - | user/assistant |
| content | TEXT | NO | - | Message content |
| response_type | VARCHAR(50) | YES | - | explanation/hint/guidance |
| help_level | VARCHAR(20) | YES | - | minimal/moderate/detailed |
| created_at | TIMESTAMP | NO | NOW() | Timestamp |

---

# DATABASE VIEW

## published_courses_view

**Purpose:** Optimized read-only view for SHISHYA.

```sql
CREATE VIEW published_courses_view AS
SELECT * FROM courses
WHERE status = 'published' AND is_active = true;
```

---

# TABLE RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN-MANAGED TABLES (Read-Only for SHISHYA)             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   courses ──┬──> modules ──> lessons                                        │
│             │                                                               │
│             ├──> tests ──> questions                                        │
│             │                                                               │
│             ├──> projects                                                   │
│             │                                                               │
│             ├──> practice_labs                                              │
│             │                                                               │
│             ├──> certificates                                               │
│             │                                                               │
│             └──> course_rewards                                             │
│                                                                             │
│   Standalone Admin Tables:                                                  │
│   - skills, achievement_cards, motivational_cards                           │
│   - credit_packages, subscription_plans                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ (Read-only access with visibility filter)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHISHYA STUDENT PORTAL                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   shishya_users (Central Entity - VARCHAR(36) UUID)                         │
│        │                                                                    │
│        ├──> shishya_user_profiles (1:1)                                     │
│        ├──> shishya_sessions (1:N)                                          │
│        ├──> shishya_otp_codes (1:N)                                         │
│        ├──> shishya_otp_logs (1:N)                                          │
│        │                                                                    │
│        ├──> shishya_user_credits (1:1)                                      │
│        │         └──> shishya_credit_transactions (1:N)                     │
│        │         └──> shishya_payments (1:N)                                │
│        │                                                                    │
│        ├──> shishya_course_enrollments (1:N) ──> courses                    │
│        ├──> shishya_user_progress (1:N) ──> lessons                         │
│        ├──> shishya_user_lab_progress (1:N) ──> practice_labs               │
│        ├──> shishya_user_test_attempts (1:N) ──> tests                      │
│        ├──> shishya_user_project_submissions (1:N) ──> projects             │
│        ├──> shishya_user_certificates (1:N) ──> courses                     │
│        │                                                                    │
│        ├──> shishya_notifications (1:N)                                     │
│        ├──> shishya_student_streaks (1:1)                                   │
│        ├──> shishya_motivation_cards (1:N)                                  │
│        ├──> shishya_mystery_boxes (1:N)                                     │
│        ├──> shishya_gift_boxes (1:N)                                        │
│        │                                                                    │
│        ├──> shishya_usha_conversations (1:N)                                │
│        │         └──> shishya_usha_messages (1:N)                           │
│        │                                                                    │
│        ├──> shishya_marksheets (1:N)                                        │
│        │         └──> shishya_marksheet_verifications (1:N)                 │
│        │                                                                    │
│        └──> shishya_user_scholarships (1:N)                                 │
│                                                                             │
│   Standalone SHISHYA Tables:                                                │
│   - shishya_vouchers ──> shishya_voucher_redemptions                        │
│   - shishya_scholarships ──> shishya_user_scholarships                      │
│   - shishya_motivation_rules ──> shishya_rule_trigger_logs                  │
│   - shishya_ai_nudge_logs                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# API ENDPOINTS PATTERN

## Public API (No Auth Required)
```
GET /api/public/courses                    -- Published courses
GET /api/public/courses/:id                -- Course details
GET /api/public/courses/:id/modules        -- Course modules
GET /api/public/courses/:id/tests          -- Course tests
GET /api/public/courses/:id/projects       -- Course projects
GET /api/public/courses/:id/labs           -- Course labs
GET /api/public/verify/certificate/:number -- Certificate verification
GET /api/public/verify/marksheet/:number   -- Marksheet verification
```

## Protected API (Auth Required)
```
GET/POST /api/shishya/auth/*               -- Auth endpoints
GET/PATCH /api/shishya/profile             -- User profile
GET/POST /api/shishya/enrollments          -- Course enrollments
GET/POST /api/shishya/progress/*           -- Learning progress
GET/POST /api/shishya/credits/*            -- Wallet & transactions
GET /api/shishya/notifications             -- Notifications
GET/POST /api/shishya/usha/*               -- AI tutor chat
```

---

# CREDIT SYSTEM RULES

| Event | Credits |
|-------|---------|
| Welcome Bonus | 50 credits on signup |
| Course Enrollment | Deduct `courses.credit_cost` |
| Free Courses | 0 credits (is_free = true) |
| Voucher Redemption | Add voucher credits |
| Purchase | Add purchased credits |

**Transaction Types:** welcome, purchase, spend, refund, reward

---

# CERTIFICATE ELIGIBILITY

Check `certificates` table for requirements:
- `requires_test_pass` = true → Must pass all tests
- `requires_project_completion` = true → Must submit all projects
- `requires_lab_completion` = true → Must complete all labs
- `passing_percentage` = Minimum test score required

---

# QUICK REFERENCE QUERIES

## Get user's enrolled courses with progress
```sql
SELECT 
  c.id, c.name, c.level,
  e.enrolled_at, e.status,
  COUNT(CASE WHEN p.completed THEN 1 END) as lessons_completed,
  COUNT(p.id) as total_tracked
FROM shishya_course_enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN shishya_user_progress p ON p.user_id = e.user_id AND p.course_id = c.id
WHERE e.user_id = :userId
  AND c.status = 'published' AND c.is_active = true
GROUP BY c.id, e.enrolled_at, e.status
```

## Get user's credit balance and transactions
```sql
SELECT 
  uc.balance, uc.lifetime_earned, uc.lifetime_spent,
  (SELECT json_agg(t) FROM (
    SELECT amount, type, description, created_at 
    FROM shishya_credit_transactions 
    WHERE user_id = :userId 
    ORDER BY created_at DESC LIMIT 10
  ) t) as recent_transactions
FROM shishya_user_credits uc
WHERE uc.user_id = :userId
```

## Course completion percentage
```sql
SELECT 
  (COUNT(CASE WHEN completed = true THEN 1 END) * 100.0 / 
   (SELECT COUNT(*) FROM lessons WHERE module_id IN 
     (SELECT id FROM modules WHERE course_id = :courseId)))
  AS completion_percentage
FROM shishya_user_progress
WHERE user_id = :userId AND course_id = :courseId
```

---

# DO NOT DO THESE

1. **Never modify course content tables** (courses, modules, lessons, etc.)
2. **Never use legacy tables** (coin_wallets, coin_transactions)
3. **Never query courses without** `status='published' AND is_active=true`
4. **Never use INTEGER for shishya_users.id** - It's VARCHAR(36) UUID
5. **Never expose unpublished content** to students

---

# SUMMARY TABLE

| Category | Table Count | Tables |
|----------|-------------|--------|
| **Course Content (Admin)** | 14 | courses, modules, lessons, tests, questions, projects, practice_labs, certificates, skills, course_rewards, achievement_cards, motivational_cards, credit_packages, subscription_plans |
| **Auth** | 4 | shishya_users, shishya_sessions, shishya_otp_codes, shishya_otp_logs |
| **Profile** | 1 | shishya_user_profiles |
| **Progress** | 6 | shishya_course_enrollments, shishya_user_progress, shishya_user_lab_progress, shishya_user_test_attempts, shishya_user_project_submissions, shishya_user_certificates |
| **Credits** | 6 | shishya_user_credits, shishya_credit_transactions, shishya_payments, shishya_vouchers, shishya_voucher_redemptions, shishya_gift_boxes |
| **Notifications** | 1 | shishya_notifications |
| **AI Motivation** | 8 | shishya_motivation_rules, shishya_rule_trigger_logs, shishya_motivation_cards, shishya_ai_nudge_logs, shishya_student_streaks, shishya_mystery_boxes, shishya_scholarships, shishya_user_scholarships |
| **Academic** | 2 | shishya_marksheets, shishya_marksheet_verifications |
| **AI Tutor** | 2 | shishya_usha_conversations, shishya_usha_messages |

**Total: 44 Tables (14 Admin-Read + 30 SHISHYA-Owned) + 1 View**

---

# TECHNOLOGY STACK

- **Database:** PostgreSQL (Neon-compatible)
- **ORM:** Drizzle ORM
- **Auth:** Express sessions + bcrypt + JWT
- **Payments:** Razorpay integration
- **Email:** Resend API for OTPs
- **AI:** OpenAI GPT-4o for Usha tutor

---

*Last Updated: January 2026*
