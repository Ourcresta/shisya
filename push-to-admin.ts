import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';

const ADMIN_DATABASE_URL = process.env.ADMIN_DATABASE_URL;

if (!ADMIN_DATABASE_URL) {
  console.error('ADMIN_DATABASE_URL is not set');
  process.exit(1);
}

console.log('Connecting to Admin database...');

// Generate SQL for all shishya tables
const shishyaTables = `
-- SHISHYA Student Tables (29 tables)
-- Run this SQL on Admin database to create shishya tables

-- Auth Tables
CREATE TABLE IF NOT EXISTS shishya_users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_otp_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_otp_logs (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Profiles
CREATE TABLE IF NOT EXISTS shishya_user_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  bio TEXT,
  profile_photo TEXT,
  headline VARCHAR(200),
  location VARCHAR(100),
  github_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  portfolio_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Progress Tables
CREATE TABLE IF NOT EXISTS shishya_user_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_user_lab_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  lab_id INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  user_code TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_user_test_attempts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  test_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB,
  time_taken INTEGER,
  attempted_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_user_project_submissions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  project_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  submission_url TEXT,
  github_url TEXT,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  feedback TEXT,
  submitted_at TIMESTAMP DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shishya_user_certificates (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id INTEGER NOT NULL,
  certificate_number VARCHAR(50) NOT NULL UNIQUE,
  issued_at TIMESTAMP DEFAULT NOW() NOT NULL,
  pdf_url TEXT
);

CREATE TABLE IF NOT EXISTS shishya_course_enrollments (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id INTEGER NOT NULL,
  enrolled_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
);

-- Credits Tables
CREATE TABLE IF NOT EXISTS shishya_user_credits (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL,
  description TEXT,
  reference_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_vouchers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  credits INTEGER NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_voucher_redemptions (
  id SERIAL PRIMARY KEY,
  voucher_id INTEGER NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  redeemed_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_gift_boxes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  credits INTEGER NOT NULL,
  message TEXT,
  opened BOOLEAN NOT NULL DEFAULT false,
  opened_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS shishya_notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- AI Motivation Tables
CREATE TABLE IF NOT EXISTS shishya_motivation_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_condition JSONB NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_data JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_rule_trigger_logs (
  id SERIAL PRIMARY KEY,
  rule_id INTEGER NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  triggered_at TIMESTAMP DEFAULT NOW() NOT NULL,
  action_taken JSONB
);

CREATE TABLE IF NOT EXISTS shishya_motivation_cards (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  card_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_ai_nudge_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  nudge_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_student_streaks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_mystery_boxes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  box_type VARCHAR(50) NOT NULL,
  reward_type VARCHAR(50),
  reward_value INTEGER,
  opened BOOLEAN NOT NULL DEFAULT false,
  opened_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_scholarships (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  eligibility_criteria JSONB,
  max_recipients INTEGER,
  current_recipients INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_user_scholarships (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  scholarship_id INTEGER NOT NULL,
  awarded_at TIMESTAMP DEFAULT NOW() NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
);

-- Academic Tables
CREATE TABLE IF NOT EXISTS shishya_marksheets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  marksheet_number VARCHAR(50) NOT NULL UNIQUE,
  courses_completed INTEGER NOT NULL DEFAULT 0,
  total_credits INTEGER NOT NULL DEFAULT 0,
  cgpa DECIMAL(3,2),
  classification VARCHAR(50),
  generated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_marksheet_verifications (
  id SERIAL PRIMARY KEY,
  marksheet_id VARCHAR(36) NOT NULL,
  verified_at TIMESTAMP DEFAULT NOW() NOT NULL,
  verifier_ip VARCHAR(45),
  verifier_agent TEXT
);

-- AI Tutor Tables
CREATE TABLE IF NOT EXISTS shishya_usha_conversations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id INTEGER NOT NULL,
  page_type VARCHAR(20) NOT NULL,
  context_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shishya_usha_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  response_type VARCHAR(50),
  help_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shishya_sessions_expire ON shishya_sessions(expire);
CREATE INDEX IF NOT EXISTS idx_shishya_user_progress_user ON shishya_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_shishya_user_progress_course ON shishya_user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_shishya_notifications_user ON shishya_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_shishya_credit_transactions_user ON shishya_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_shishya_course_enrollments_user ON shishya_course_enrollments(user_id);

COMMENT ON TABLE shishya_users IS 'SHISHYA student portal users';
COMMENT ON TABLE shishya_sessions IS 'SHISHYA session storage';
`;

console.log(shishyaTables);
console.log('\n-- SQL generated successfully. Run this on Admin database.');
