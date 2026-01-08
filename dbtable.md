# Database Tables - OurShiksha Shared Database

Complete list of all tables in the shared PostgreSQL database.

---

## Course Content Tables (6) - Shared with Admin

| Table | Purpose |
|-------|---------|
| courses | Master course catalog |
| modules | Course sections/chapters |
| lessons | Individual learning units |
| tests | Assessments/quizzes |
| projects | Hands-on assignments |
| labs | Interactive coding exercises |

---

## Shishya Student Tables (29) - Student Portal Only

### Authentication (4)
| Table | Purpose |
|-------|---------|
| shishya_users | Student accounts |
| shishya_sessions | Login sessions |
| shishya_otp_codes | OTP verification codes |
| shishya_otp_logs | OTP attempt tracking |

### Profiles (1)
| Table | Purpose |
|-------|---------|
| shishya_user_profiles | Student profile data |

### Learning Progress (6)
| Table | Purpose |
|-------|---------|
| shishya_user_progress | Lesson completion tracking |
| shishya_user_lab_progress | Lab exercise progress |
| shishya_user_test_attempts | Test attempt history |
| shishya_user_project_submissions | Project submissions |
| shishya_user_certificates | Earned certificates |
| shishya_course_enrollments | Course enrollment records |

### Credits & Wallet (5)
| Table | Purpose |
|-------|---------|
| shishya_user_credits | Credit balance |
| shishya_credit_transactions | Transaction history |
| shishya_vouchers | Voucher codes |
| shishya_voucher_redemptions | Voucher usage |
| shishya_gift_boxes | Gift credit boxes |

### Notifications (1)
| Table | Purpose |
|-------|---------|
| shishya_notifications | System notifications |

### AI Motivation Engine (8)
| Table | Purpose |
|-------|---------|
| shishya_motivation_rules | Rule configurations |
| shishya_rule_trigger_logs | Rule execution logs |
| shishya_motivation_cards | Achievement cards |
| shishya_ai_nudge_logs | Motivation messages |
| shishya_student_streaks | Learning streaks |
| shishya_mystery_boxes | Gamification rewards |
| shishya_scholarships | Scholarship offers |
| shishya_user_scholarships | Awarded scholarships |

### Academic Records (2)
| Table | Purpose |
|-------|---------|
| shishya_marksheets | Academic transcripts |
| shishya_marksheet_verifications | Verification logs |

### AI Tutor (2)
| Table | Purpose |
|-------|---------|
| shishya_usha_conversations | AI tutor conversations |
| shishya_usha_messages | Conversation messages |

---

## Summary

| Category | Count |
|----------|-------|
| Course Content (Admin) | 6 |
| Shishya Student Tables | 29 |
| **Total** | **35** |
