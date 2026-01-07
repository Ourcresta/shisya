# Database Tables

Complete list of all 35 tables in the shared OurShiksha database.

---

## ai_nudge_logs

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('ai_nudge_logs_id_seq' |
| user_id | character varying | No | - |
| course_id | integer | Yes | - |
| nudge_type | character varying | No | - |
| message | text | No | - |
| channel | character varying | No | 'app'::character varying |
| rule_id | integer | Yes | - |
| is_read | boolean | No | false |
| sent_at | timestamp without time zone | No | now() |

## course_enrollments

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('course_enrollments_id |
| user_id | character varying | No | - |
| course_id | integer | No | - |
| credits_paid | integer | No | 0 |
| enrolled_at | timestamp without time zone | No | now() |

## courses

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('courses_id_seq'::regc |
| title | character varying | No | - |
| description | text | Yes | - |
| short_description | character varying | Yes | - |
| level | character varying | No | 'beginner'::character varying |
| duration | character varying | Yes | - |
| skills | text | Yes | - |
| status | character varying | No | 'draft'::character varying |
| is_free | boolean | No | false |
| credit_cost | integer | No | 0 |
| test_required | boolean | No | false |
| project_required | boolean | No | false |
| thumbnail_url | text | Yes | - |
| instructor_id | character varying | Yes | - |
| created_at | timestamp without time zone | No | now() |
| updated_at | timestamp without time zone | No | now() |

## credit_transactions

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('credit_transactions_i |
| user_id | character varying | No | - |
| amount | integer | No | - |
| type | character varying | No | - |
| reason | character varying | No | - |
| description | text | Yes | - |
| reference_id | integer | Yes | - |
| balance_after | integer | No | - |
| created_at | timestamp without time zone | No | now() |

## gift_boxes

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('gift_boxes_id_seq'::r |
| sender_id | character varying | No | - |
| recipient_email | character varying | No | - |
| points | integer | No | - |
| payment_id | character varying | Yes | - |
| status | character varying | No | 'CREATED'::character varying |
| claimed_by | character varying | Yes | - |
| created_at | timestamp without time zone | No | now() |
| claimed_at | timestamp without time zone | Yes | - |

## labs

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('labs_id_seq'::regclas |
| course_id | integer | No | - |
| lesson_id | integer | Yes | - |
| title | character varying | No | - |
| instructions | text | No | - |
| starter_code | text | Yes | - |
| expected_output | text | Yes | - |
| solution_code | text | Yes | - |
| language | character varying | No | 'javascript'::character varyin |
| order_index | integer | No | 0 |
| created_at | timestamp without time zone | No | now() |

## lessons

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('lessons_id_seq'::regc |
| module_id | integer | No | - |
| course_id | integer | No | - |
| title | character varying | No | - |
| content | text | Yes | - |
| video_url | text | Yes | - |
| duration_minutes | integer | Yes | - |
| order_index | integer | No | 0 |
| is_preview | boolean | No | false |
| created_at | timestamp without time zone | No | now() |

## marksheet_verifications

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('marksheet_verificatio |
| marksheet_id | integer | No | - |
| verifier_ip | character varying | Yes | - |
| verifier_user_agent | text | Yes | - |
| verified_at | timestamp without time zone | No | now() |

## marksheets

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('marksheets_id_seq'::r |
| marksheet_id | character varying | No | - |
| user_id | character varying | No | - |
| student_name | text | No | - |
| student_email | character varying | No | - |
| program_name | text | No | 'Full Stack Development'::text |
| academic_year | character varying | No | - |
| course_data | text | No | - |
| total_marks | integer | No | 0 |
| obtained_marks | integer | No | 0 |
| percentage | integer | No | 0 |
| grade | character varying | No | - |
| cgpa | character varying | No | - |
| result | character varying | No | - |
| classification | character varying | No | - |
| total_credits | integer | No | 0 |
| courses_completed | integer | No | 0 |
| reward_coins | integer | No | 0 |
| scholarship_eligible | boolean | No | false |
| verification_code | character varying | No | - |
| pdf_hash | text | Yes | - |
| signed_by | text | Yes | 'Controller of Examinations':: |
| ai_verifier_name | text | Yes | 'Acharya Usha'::text |
| issued_at | timestamp without time zone | No | now() |
| expires_at | timestamp without time zone | Yes | - |
| status | character varying | No | 'active'::character varying |

## mithra_conversations

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('mithra_conversations_ |
| user_id | character varying | No | - |
| course_id | integer | No | - |
| page_type | character varying | No | - |
| created_at | timestamp without time zone | No | now() |

## mithra_messages

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('mithra_messages_id_se |
| conversation_id | integer | No | - |
| role | character varying | No | - |
| content | text | No | - |
| response_type | character varying | Yes | - |
| created_at | timestamp without time zone | No | now() |
| help_level | character varying | Yes | - |

## modules

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('modules_id_seq'::regc |
| course_id | integer | No | - |
| title | character varying | No | - |
| description | text | Yes | - |
| order_index | integer | No | 0 |
| created_at | timestamp without time zone | No | now() |

## motivation_cards

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('motivation_cards_id_s |
| card_id | character varying | No | - |
| user_id | character varying | No | - |
| course_id | integer | Yes | - |
| course_title | text | Yes | - |
| card_type | character varying | No | - |
| title | text | No | - |
| subtitle | text | Yes | - |
| badge | character varying | Yes | - |
| stats | text | Yes | - |
| message | text | Yes | - |
| percentile_rank | integer | Yes | - |
| is_shareable | boolean | No | true |
| share_url | text | Yes | - |
| view_count | integer | No | 0 |
| created_at | timestamp without time zone | No | now() |

## motivation_rules

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('motivation_rules_id_s |
| name | character varying | No | - |
| description | text | Yes | - |
| rule_type | character varying | No | - |
| conditions | text | No | - |
| actions | text | No | - |
| priority | integer | No | 0 |
| cooldown_hours | integer | No | 24 |
| max_trigger_count | integer | Yes | - |
| is_active | boolean | No | true |
| is_global | boolean | No | true |
| course_id | integer | Yes | - |
| created_at | timestamp without time zone | No | now() |
| updated_at | timestamp without time zone | No | now() |

## mystery_boxes

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('mystery_boxes_id_seq' |
| box_id | character varying | No | - |
| user_id | character varying | No | - |
| rule_id | integer | Yes | - |
| reward_type | character varying | Yes | - |
| reward_value | text | Yes | - |
| is_opened | boolean | No | false |
| opened_at | timestamp without time zone | Yes | - |
| expires_at | timestamp without time zone | Yes | - |
| created_at | timestamp without time zone | No | now() |

## notifications

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('notifications_id_seq' |
| user_id | character varying | Yes | - |
| role | character varying | No | 'all'::character varying |
| title | character varying | No | - |
| message | text | No | - |
| type | character varying | No | - |
| link | text | Yes | - |
| is_read | boolean | No | false |
| created_at | timestamp without time zone | No | now() |

## otp_codes

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('otp_codes_id_seq'::re |
| user_id | character varying | No | - |
| otp_hash | text | No | - |
| expires_at | timestamp without time zone | No | - |
| used | boolean | No | false |
| created_at | timestamp without time zone | No | now() |
| attempts | integer | No | 0 |

## otp_logs

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('otp_logs_id_seq'::reg |
| user_id | character varying | Yes | - |
| contact_type | character varying | No | 'email'::character varying |
| destination | character varying | No | - |
| otp_hash | text | No | - |
| purpose | character varying | No | - |
| attempt_count | integer | No | 0 |
| expires_at | timestamp without time zone | No | - |
| consumed_at | timestamp without time zone | Yes | - |
| created_at | timestamp without time zone | No | now() |

## projects

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('projects_id_seq'::reg |
| course_id | integer | No | - |
| title | character varying | No | - |
| description | text | No | - |
| difficulty | character varying | No | 'medium'::character varying |
| requirements | text | Yes | - |
| resources | text | Yes | - |
| estimated_hours | integer | Yes | - |
| created_at | timestamp without time zone | No | now() |

## rule_trigger_logs

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('rule_trigger_logs_id_ |
| rule_id | integer | No | - |
| user_id | character varying | No | - |
| course_id | integer | Yes | - |
| trigger_count | integer | No | 1 |
| actions_executed | text | No | - |
| input_signals | text | Yes | - |
| triggered_at | timestamp without time zone | No | now() |

## scholarships

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('scholarships_id_seq': |
| scholarship_id | character varying | No | - |
| name | character varying | No | - |
| description | text | Yes | - |
| discount_percent | integer | No | - |
| course_id | integer | Yes | - |
| max_redemptions | integer | Yes | - |
| redemption_count | integer | No | 0 |
| valid_from | timestamp without time zone | Yes | - |
| valid_until | timestamp without time zone | Yes | - |
| rule_id | integer | Yes | - |
| is_active | boolean | No | true |
| created_at | timestamp without time zone | No | now() |

## sessions

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | character varying | No | - |
| user_id | character varying | No | - |
| created_at | timestamp without time zone | No | now() |
| expires_at | timestamp without time zone | No | - |

## student_streaks

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('student_streaks_id_se |
| user_id | character varying | No | - |
| current_streak | integer | No | 0 |
| longest_streak | integer | No | 0 |
| last_activity_date | timestamp without time zone | Yes | - |
| streak_start_date | timestamp without time zone | Yes | - |
| total_active_days | integer | No | 0 |
| updated_at | timestamp without time zone | No | now() |

## tests

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('tests_id_seq'::regcla |
| course_id | integer | No | - |
| title | character varying | No | - |
| description | text | Yes | - |
| duration_minutes | integer | No | 30 |
| passing_percentage | integer | No | 60 |
| questions | text | No | - |
| max_attempts | integer | Yes | - |
| shuffle_questions | boolean | No | false |
| show_correct_answers | boolean | No | false |
| created_at | timestamp without time zone | No | now() |

## user_certificates

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('user_certificates_id_ |
| user_id | character varying | No | - |
| certificate_id | character varying | No | - |
| course_id | integer | No | - |
| course_title | text | No | - |
| certificate_title | text | No | - |
| certificate_type | character varying | No | - |
| level | character varying | No | - |
| skills | text | No | - |
| issued_at | timestamp without time zone | No | now() |

## user_credits

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('user_credits_id_seq': |
| user_id | character varying | No | - |
| balance | integer | No | 0 |
| total_earned | integer | No | 0 |
| total_spent | integer | No | 0 |
| created_at | timestamp without time zone | No | now() |
| updated_at | timestamp without time zone | No | now() |

## user_lab_progress

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('user_lab_progress_id_ |
| user_id | character varying | No | - |
| course_id | integer | No | - |
| lab_id | integer | No | - |
| completed | boolean | No | false |
| user_code | text | Yes | - |
| completed_at | timestamp without time zone | Yes | - |

## user_profiles

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | character varying | No | - |
| user_id | character varying | No | - |
| full_name | text | No | - |
| username | character varying | No | - |
| bio | text | Yes | - |
| profile_photo | text | Yes | - |
| headline | text | Yes | - |
| location | text | Yes | - |
| github_url | text | Yes | - |
| linkedin_url | text | Yes | - |
| portfolio_visible | boolean | No | false |
| created_at | timestamp without time zone | No | now() |
| updated_at | timestamp without time zone | No | now() |

## user_progress

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('user_progress_id_seq' |
| user_id | character varying | No | - |
| course_id | integer | No | - |
| lesson_id | integer | No | - |
| completed_at | timestamp without time zone | No | now() |

## user_project_submissions

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('user_project_submissi |
| user_id | character varying | No | - |
| project_id | integer | No | - |
| course_id | integer | No | - |
| github_url | text | No | - |
| live_url | text | Yes | - |
| notes | text | Yes | - |
| submitted_at | timestamp without time zone | No | now() |

## user_scholarships

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('user_scholarships_id_ |
| user_id | character varying | No | - |
| scholarship_id | integer | No | - |
| course_id | integer | Yes | - |
| is_used | boolean | No | false |
| used_at | timestamp without time zone | Yes | - |
| awarded_at | timestamp without time zone | No | now() |
| expires_at | timestamp without time zone | Yes | - |

## user_test_attempts

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('user_test_attempts_id |
| user_id | character varying | No | - |
| test_id | integer | No | - |
| course_id | integer | No | - |
| answers | text | No | - |
| score_percentage | integer | No | - |
| passed | boolean | No | - |
| attempted_at | timestamp without time zone | No | now() |

## users

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | character varying | No | - |
| email | character varying | No | - |
| password_hash | text | No | - |
| email_verified | boolean | No | false |
| created_at | timestamp without time zone | No | now() |

## voucher_redemptions

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('voucher_redemptions_i |
| user_id | character varying | No | - |
| voucher_code | character varying | No | - |
| points_received | integer | No | - |
| redeemed_at | timestamp without time zone | No | now() |

## vouchers

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | integer | No | nextval('vouchers_id_seq'::reg |
| code | character varying | No | - |
| points | integer | No | - |
| bonus_percent | integer | Yes | 0 |
| max_usage | integer | Yes | 1 |
| used_count | integer | No | 0 |
| is_active | boolean | No | true |
| expiry_date | timestamp without time zone | Yes | - |
| created_at | timestamp without time zone | No | now() |
