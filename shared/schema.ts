import { z } from "zod";
import { pgTable, text, serial, boolean, timestamp, varchar, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ============ DATABASE TABLES (Drizzle ORM) ============
// All SHISHYA (student) tables use the shishya_ prefix
// Course content tables remain unprefixed (shared with Admin)

// ============ COURSE CONTENT TABLES (Admin manages, SHISHYA reads) ============

// Courses table - master catalog of all courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 500 }),
  level: varchar("level", { length: 20 }).notNull().default("beginner"),
  language: varchar("language", { length: 20 }).notNull().default("en"),
  duration: varchar("duration", { length: 50 }),
  skills: text("skills"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  isActive: boolean("is_active").notNull().default(false),
  isFree: boolean("is_free").notNull().default(false),
  creditCost: integer("credit_cost").notNull().default(0),
  price: integer("price").notNull().default(0),
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  testRequired: boolean("test_required").notNull().default(false),
  projectRequired: boolean("project_required").notNull().default(false),
  thumbnailUrl: text("thumbnail_url"),
  groupTitle: varchar("group_title", { length: 255 }),
  trainerCentralCourseUrl: text("trainer_central_course_url"),
  instructorId: varchar("instructor_id", { length: 36 }),
  zohoId: varchar("zoho_id", { length: 100 }),
  category: varchar("category", { length: 100 }),
  rating: real("rating"),
  totalStudents: integer("total_students").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Modules table - sections/chapters within a course
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lessons table - individual learning units
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  trainerCentralUrl: text("trainer_central_url"),
  durationMinutes: integer("duration_minutes"),
  orderIndex: integer("order_index").notNull().default(0),
  isPreview: boolean("is_preview").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tests table - assessments/quizzes for courses
export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  passingPercentage: integer("passing_percentage").notNull().default(60),
  questions: text("questions").notNull(),
  maxAttempts: integer("max_attempts"),
  shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
  showCorrectAnswers: boolean("show_correct_answers").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Projects table - hands-on assignments
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("medium"),
  requirements: text("requirements"),
  resources: text("resources"),
  estimatedHours: integer("estimated_hours"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Labs table - interactive coding exercises
export const labs = pgTable("labs", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  lessonId: integer("lesson_id").references(() => lessons.id),
  title: varchar("title", { length: 255 }).notNull(),
  instructions: text("instructions").notNull(),
  starterCode: text("starter_code"),
  expectedOutput: text("expected_output"),
  solutionCode: text("solution_code"),
  language: varchar("language", { length: 20 }).notNull().default("javascript"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ SHISHYA AUTHENTICATION TABLES ============

// Shishya Users table for authentication
export const shishyaUsers = pgTable("shishya_users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  authProvider: varchar("auth_provider", { length: 20 }).default("email"),
  authProviderId: varchar("auth_provider_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shishya OTP logs table for email verification with purpose tracking
export const shishyaOtpLogs = pgTable("shishya_otp_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => shishyaUsers.id),
  contactType: varchar("contact_type", { length: 10 }).notNull().default("email"),
  destination: varchar("destination", { length: 255 }).notNull(),
  otpHash: text("otp_hash").notNull(),
  purpose: varchar("purpose", { length: 20 }).notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shishya OTP codes (backward compatibility)
export const shishyaOtpCodes = pgTable("shishya_otp_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  otpHash: text("otp_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shishya Sessions table for authentication
export const shishyaSessions = pgTable("shishya_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// ============ SHISHYA PROFILE TABLES ============

// Shishya User profiles table
export const shishyaUserProfiles = pgTable("shishya_user_profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id).unique(),
  fullName: text("full_name").notNull(),
  username: varchar("username", { length: 30 }).notNull().unique(),
  bio: text("bio"),
  profilePhoto: text("profile_photo"),
  headline: text("headline"),
  location: text("location"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  portfolioVisible: boolean("portfolio_visible").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ SHISHYA LEARNING PROGRESS TABLES ============

// Shishya User progress table
export const shishyaUserProgress = pgTable("shishya_user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  courseId: integer("course_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Shishya User lab progress table
export const shishyaUserLabProgress = pgTable("shishya_user_lab_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  courseId: integer("course_id").notNull(),
  labId: integer("lab_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  userCode: text("user_code"),
  completedAt: timestamp("completed_at"),
});

// Shishya User test attempts table
export const shishyaUserTestAttempts = pgTable("shishya_user_test_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  testId: integer("test_id").notNull(),
  courseId: integer("course_id").notNull(),
  answers: text("answers").notNull(),
  scorePercentage: integer("score_percentage").notNull(),
  passed: boolean("passed").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});

// Shishya User project submissions table
export const shishyaUserProjectSubmissions = pgTable("shishya_user_project_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  projectId: integer("project_id").notNull(),
  courseId: integer("course_id").notNull(),
  githubUrl: text("github_url").notNull(),
  liveUrl: text("live_url"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Shishya User certificates table
export const shishyaUserCertificates = pgTable("shishya_user_certificates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  certificateId: varchar("certificate_id", { length: 20 }).notNull().unique(),
  courseId: integer("course_id").notNull(),
  courseTitle: text("course_title").notNull(),
  certificateTitle: text("certificate_title").notNull(),
  certificateType: varchar("certificate_type", { length: 20 }).notNull(),
  level: varchar("level", { length: 20 }).notNull(),
  skills: text("skills").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

// Shishya Course enrollments table
export const shishyaCourseEnrollments = pgTable("shishya_course_enrollments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  courseId: integer("course_id").notNull(),
  creditsPaid: integer("credits_paid").notNull().default(0),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

// ============ SHISHYA CREDITS & WALLET TABLES ============

// Shishya User credits table - Learning Credits wallet
export const shishyaUserCredits = pgTable("shishya_user_credits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id).unique(),
  balance: integer("balance").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  totalSpent: integer("total_spent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shishya Credit transactions table - transaction history
export const shishyaCreditTransactions = pgTable("shishya_credit_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  amount: integer("amount").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  reason: varchar("reason", { length: 50 }).notNull(),
  description: text("description"),
  referenceId: integer("reference_id"),
  balanceAfter: integer("balance_after").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shishya Vouchers table
export const shishyaVouchers = pgTable("shishya_vouchers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  points: integer("points").notNull(),
  bonusPercent: integer("bonus_percent").default(0),
  maxUsage: integer("max_usage").default(1),
  usedCount: integer("used_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shishya Voucher redemptions table
export const shishyaVoucherRedemptions = pgTable("shishya_voucher_redemptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  voucherCode: varchar("voucher_code", { length: 50 }).notNull(),
  pointsReceived: integer("points_received").notNull(),
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
});

// Shishya Gift boxes table
export const shishyaGiftBoxes = pgTable("shishya_gift_boxes", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  points: integer("points").notNull(),
  paymentId: varchar("payment_id", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("CREATED"),
  claimedBy: varchar("claimed_by", { length: 36 }).references(() => shishyaUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  claimedAt: timestamp("claimed_at"),
});

// ============ SHISHYA NOTIFICATIONS TABLE ============

// Shishya Notifications table
export const shishyaNotifications = pgTable("shishya_notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => shishyaUsers.id),
  role: varchar("role", { length: 20 }).notNull().default("all"),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ SHISHYA AI MOTIVATION RULES ENGINE TABLES ============

// Shishya Motivation Rules - configurable rules with conditions and actions
export const shishyaMotivationRules = pgTable("shishya_motivation_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  ruleType: varchar("rule_type", { length: 30 }).notNull(),
  conditions: text("conditions").notNull(),
  actions: text("actions").notNull(),
  priority: integer("priority").notNull().default(0),
  cooldownHours: integer("cooldown_hours").notNull().default(24),
  maxTriggerCount: integer("max_trigger_count"),
  isActive: boolean("is_active").notNull().default(true),
  isGlobal: boolean("is_global").notNull().default(true),
  courseId: integer("course_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shishya Rule Trigger Logs - track rule executions for idempotency
export const shishyaRuleTriggerLogs = pgTable("shishya_rule_trigger_logs", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").notNull().references(() => shishyaMotivationRules.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  courseId: integer("course_id"),
  triggerCount: integer("trigger_count").notNull().default(1),
  actionsExecuted: text("actions_executed").notNull(),
  inputSignals: text("input_signals"),
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
});

// Shishya Motivation Cards - shareable achievement cards
export const shishyaMotivationCards = pgTable("shishya_motivation_cards", {
  id: serial("id").primaryKey(),
  cardId: varchar("card_id", { length: 20 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  courseId: integer("course_id"),
  courseTitle: text("course_title"),
  cardType: varchar("card_type", { length: 30 }).notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  badge: varchar("badge", { length: 50 }),
  stats: text("stats"),
  message: text("message"),
  percentileRank: integer("percentile_rank"),
  isShareable: boolean("is_shareable").notNull().default(true),
  shareUrl: text("share_url"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shishya Scholarships - rule-based discounts and free access
export const shishyaScholarships = pgTable("shishya_scholarships", {
  id: serial("id").primaryKey(),
  scholarshipId: varchar("scholarship_id", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  discountPercent: integer("discount_percent").notNull(),
  courseId: integer("course_id"),
  maxRedemptions: integer("max_redemptions"),
  redemptionCount: integer("redemption_count").notNull().default(0),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  ruleId: integer("rule_id").references(() => shishyaMotivationRules.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shishya User Scholarships - scholarships awarded to users
export const shishyaUserScholarships = pgTable("shishya_user_scholarships", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  scholarshipId: integer("scholarship_id").notNull().references(() => shishyaScholarships.id),
  courseId: integer("course_id"),
  isUsed: boolean("is_used").notNull().default(false),
  usedAt: timestamp("used_at"),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Shishya AI Nudge Logs - track motivation messages sent
export const shishyaAiNudgeLogs = pgTable("shishya_ai_nudge_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  courseId: integer("course_id"),
  nudgeType: varchar("nudge_type", { length: 30 }).notNull(),
  message: text("message").notNull(),
  channel: varchar("channel", { length: 20 }).notNull().default("app"),
  ruleId: integer("rule_id").references(() => shishyaMotivationRules.id),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// Shishya Mystery Reward Boxes - gamification rewards
export const shishyaMysteryBoxes = pgTable("shishya_mystery_boxes", {
  id: serial("id").primaryKey(),
  boxId: varchar("box_id", { length: 20 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  ruleId: integer("rule_id").references(() => shishyaMotivationRules.id),
  rewardType: varchar("reward_type", { length: 30 }),
  rewardValue: text("reward_value"),
  isOpened: boolean("is_opened").notNull().default(false),
  openedAt: timestamp("opened_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shishya Student Streaks - track learning consistency
export const shishyaStudentStreaks = pgTable("shishya_student_streaks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: timestamp("last_activity_date"),
  streakStartDate: timestamp("streak_start_date"),
  totalActiveDays: integer("total_active_days").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ SHISHYA ACADEMIC MARKSHEET TABLES ============

// Shishya Marksheets - Official academic transcripts with verification
export const shishyaMarksheets = pgTable("shishya_marksheets", {
  id: serial("id").primaryKey(),
  marksheetId: varchar("marksheet_id", { length: 30 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  studentName: text("student_name").notNull(),
  studentEmail: varchar("student_email", { length: 255 }).notNull(),
  programName: text("program_name").notNull().default("Full Stack Development"),
  academicYear: varchar("academic_year", { length: 10 }).notNull(),
  courseData: text("course_data").notNull(),
  totalMarks: integer("total_marks").notNull().default(0),
  obtainedMarks: integer("obtained_marks").notNull().default(0),
  percentage: integer("percentage").notNull().default(0),
  grade: varchar("grade", { length: 5 }).notNull(),
  cgpa: varchar("cgpa", { length: 5 }).notNull(),
  result: varchar("result", { length: 20 }).notNull(),
  classification: varchar("classification", { length: 30 }).notNull(),
  totalCredits: integer("total_credits").notNull().default(0),
  coursesCompleted: integer("courses_completed").notNull().default(0),
  rewardCoins: integer("reward_coins").notNull().default(0),
  scholarshipEligible: boolean("scholarship_eligible").notNull().default(false),
  verificationCode: varchar("verification_code", { length: 20 }).notNull().unique(),
  pdfHash: text("pdf_hash"),
  signedBy: text("signed_by").default("Controller of Examinations"),
  aiVerifierName: text("ai_verifier_name").default("Acharya Usha"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
});

// Shishya Marksheet verification logs - Track who verified marksheets
export const shishyaMarksheetVerifications = pgTable("shishya_marksheet_verifications", {
  id: serial("id").primaryKey(),
  marksheetId: integer("marksheet_id").notNull().references(() => shishyaMarksheets.id),
  verifierIp: varchar("verifier_ip", { length: 45 }),
  verifierUserAgent: text("verifier_user_agent"),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
});

// ============ SHISHYA AI TUTOR TABLES ============

// Shishya Usha conversations table
export const shishyaUshaConversations = pgTable("shishya_usha_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  courseId: integer("course_id").notNull(),
  pageType: varchar("page_type", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shishya Usha messages table
export const shishyaUshaMessages = pgTable("shishya_usha_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => shishyaUshaConversations.id),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  responseType: varchar("response_type", { length: 30 }),
  helpLevel: varchar("help_level", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ UDYOG VIRTUAL INTERNSHIP TABLES ============

export const udyogInternships = pgTable("udyog_internships", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 500 }),
  skillLevel: varchar("skill_level", { length: 20 }).notNull().default("beginner"),
  domain: varchar("domain", { length: 100 }),
  duration: varchar("duration", { length: 50 }).notNull().default("4 weeks"),
  maxParticipants: integer("max_participants").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const udyogAssignments = pgTable("udyog_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  internshipId: integer("internship_id").notNull().references(() => udyogInternships.id),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  progress: integer("progress").notNull().default(0),
  skillScore: integer("skill_score").notNull().default(0),
  assignedRole: varchar("assigned_role", { length: 50 }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const udyogTasks = pgTable("udyog_tasks", {
  id: serial("id").primaryKey(),
  internshipId: integer("internship_id").notNull().references(() => udyogInternships.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("todo"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const udyogSubmissions = pgTable("udyog_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => udyogAssignments.id),
  taskId: integer("task_id").references(() => udyogTasks.id),
  content: text("content"),
  fileUrl: text("file_url"),
  feedback: text("feedback"),
  aiFeedback: text("ai_feedback"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const udyogCertificates = pgTable("udyog_certificates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  internshipId: integer("internship_id").notNull().references(() => udyogInternships.id),
  certificateId: varchar("certificate_id", { length: 50 }).notNull().unique(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const udyogSkillAssessments = pgTable("udyog_skill_assessments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => shishyaUsers.id),
  domain: varchar("domain", { length: 100 }).notNull(),
  score: integer("score").notNull(),
  level: varchar("level", { length: 20 }).notNull(),
  assessedAt: timestamp("assessed_at").defaultNow().notNull(),
});

export const insertUdyogInternshipSchema = createInsertSchema(udyogInternships).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUdyogInternship = z.infer<typeof insertUdyogInternshipSchema>;
export type UdyogInternship = typeof udyogInternships.$inferSelect;

export const insertUdyogAssignmentSchema = createInsertSchema(udyogAssignments).omit({ id: true, createdAt: true });
export type InsertUdyogAssignment = z.infer<typeof insertUdyogAssignmentSchema>;
export type UdyogAssignment = typeof udyogAssignments.$inferSelect;

export const insertUdyogTaskSchema = createInsertSchema(udyogTasks).omit({ id: true, createdAt: true });
export type InsertUdyogTask = z.infer<typeof insertUdyogTaskSchema>;
export type UdyogTask = typeof udyogTasks.$inferSelect;

export const insertUdyogSubmissionSchema = createInsertSchema(udyogSubmissions).omit({ id: true, submittedAt: true });
export type InsertUdyogSubmission = z.infer<typeof insertUdyogSubmissionSchema>;
export type UdyogSubmission = typeof udyogSubmissions.$inferSelect;

export type UdyogCertificate = typeof udyogCertificates.$inferSelect;
export type UdyogSkillAssessment = typeof udyogSkillAssessments.$inferSelect;

// ============ GURU ADMIN TABLES ============

export const guruAdminUsers = pgTable("guru_admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const guruAdminSessions = pgTable("guru_admin_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  adminId: integer("admin_id").notNull().references(() => guruAdminUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const zohoTokens = pgTable("zoho_tokens", {
  id: serial("id").primaryKey(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  scope: text("scope"),
  apiDomain: varchar("api_domain", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ PRICING PLANS TABLE (Admin manages, public reads) ============

export const pricingPlans = pgTable("pricing_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  subtitle: varchar("subtitle", { length: 100 }),
  price: varchar("price", { length: 50 }).notNull(),
  period: varchar("period", { length: 50 }),
  coins: varchar("coins", { length: 50 }),
  coinsLabel: varchar("coins_label", { length: 50 }),
  iconName: varchar("icon_name", { length: 50 }).notNull().default("Gift"),
  features: text("features").notNull().default("[]"),
  notIncluded: text("not_included").notNull().default("[]"),
  cta: varchar("cta", { length: 100 }).notNull().default("Get Started"),
  href: varchar("href", { length: 255 }).notNull().default("/signup"),
  buttonVariant: varchar("button_variant", { length: 20 }).notNull().default("outline"),
  popular: boolean("popular").notNull().default(false),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPricingPlanSchema = createInsertSchema(pricingPlans).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPricingPlan = z.infer<typeof insertPricingPlanSchema>;
export type PricingPlan = typeof pricingPlans.$inferSelect;

// ============ BACKWARD COMPATIBILITY ALIASES ============
// These aliases allow existing code to work with new table names

export const users = shishyaUsers;
export const otpLogs = shishyaOtpLogs;
export const otpCodes = shishyaOtpCodes;
export const sessions = shishyaSessions;
export const userProfiles = shishyaUserProfiles;
export const userProgress = shishyaUserProgress;
export const userLabProgress = shishyaUserLabProgress;
export const userTestAttempts = shishyaUserTestAttempts;
export const userProjectSubmissions = shishyaUserProjectSubmissions;
export const userCertificates = shishyaUserCertificates;
export const courseEnrollments = shishyaCourseEnrollments;
export const userCredits = shishyaUserCredits;
export const creditTransactions = shishyaCreditTransactions;
export const vouchers = shishyaVouchers;
export const voucherRedemptions = shishyaVoucherRedemptions;
export const giftBoxes = shishyaGiftBoxes;
export const notifications = shishyaNotifications;
export const motivationRules = shishyaMotivationRules;
export const ruleTriggerLogs = shishyaRuleTriggerLogs;
export const motivationCards = shishyaMotivationCards;
export const scholarships = shishyaScholarships;
export const userScholarships = shishyaUserScholarships;
export const aiNudgeLogs = shishyaAiNudgeLogs;
export const mysteryBoxes = shishyaMysteryBoxes;
export const studentStreaks = shishyaStudentStreaks;
export const marksheets = shishyaMarksheets;
export const marksheetVerifications = shishyaMarksheetVerifications;
export const ushaConversations = shishyaUshaConversations;
export const ushaMessages = shishyaUshaMessages;

// ============ INSERT SCHEMAS ============

// Course Content insert schemas
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertModuleSchema = createInsertSchema(modules).omit({ id: true, createdAt: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true, createdAt: true });
export const insertTestSchema = createInsertSchema(tests).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertLabSchema = createInsertSchema(labs).omit({ id: true, createdAt: true });

// Shishya insert schemas
export const insertUserSchema = createInsertSchema(shishyaUsers).omit({ createdAt: true });
export const insertOtpCodeSchema = createInsertSchema(shishyaOtpCodes).omit({ id: true, createdAt: true });
export const insertOtpLogSchema = createInsertSchema(shishyaOtpLogs).omit({ id: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(shishyaSessions).omit({ createdAt: true });
export const insertUserProfileSchema = createInsertSchema(shishyaUserProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserProgressSchema = createInsertSchema(shishyaUserProgress).omit({ id: true, completedAt: true });
export const insertUserLabProgressSchema = createInsertSchema(shishyaUserLabProgress).omit({ id: true });
export const insertUserTestAttemptSchema = createInsertSchema(shishyaUserTestAttempts).omit({ id: true, attemptedAt: true });
export const insertUserProjectSubmissionSchema = createInsertSchema(shishyaUserProjectSubmissions).omit({ id: true, submittedAt: true });
export const insertUserCertificateSchema = createInsertSchema(shishyaUserCertificates).omit({ id: true, issuedAt: true });
export const insertCourseEnrollmentSchema = createInsertSchema(shishyaCourseEnrollments).omit({ id: true, enrolledAt: true });
export const insertUserCreditsSchema = createInsertSchema(shishyaUserCredits).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCreditTransactionSchema = createInsertSchema(shishyaCreditTransactions).omit({ id: true, createdAt: true });
export const insertVoucherSchema = createInsertSchema(shishyaVouchers).omit({ id: true, createdAt: true });
export const insertVoucherRedemptionSchema = createInsertSchema(shishyaVoucherRedemptions).omit({ id: true, redeemedAt: true });
export const insertGiftBoxSchema = createInsertSchema(shishyaGiftBoxes).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(shishyaNotifications).omit({ id: true, createdAt: true });

// AI Motivation Rules Engine insert schemas
export const insertMotivationRuleSchema = createInsertSchema(shishyaMotivationRules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRuleTriggerLogSchema = createInsertSchema(shishyaRuleTriggerLogs).omit({ id: true, triggeredAt: true });
export const insertMotivationCardSchema = createInsertSchema(shishyaMotivationCards).omit({ id: true, createdAt: true });
export const insertScholarshipSchema = createInsertSchema(shishyaScholarships).omit({ id: true, createdAt: true });
export const insertUserScholarshipSchema = createInsertSchema(shishyaUserScholarships).omit({ id: true, awardedAt: true });
export const insertAiNudgeLogSchema = createInsertSchema(shishyaAiNudgeLogs).omit({ id: true, sentAt: true });
export const insertMysteryBoxSchema = createInsertSchema(shishyaMysteryBoxes).omit({ id: true, createdAt: true });
export const insertStudentStreakSchema = createInsertSchema(shishyaStudentStreaks).omit({ id: true, updatedAt: true });

// Marksheet insert schemas
export const insertMarksheetSchema = createInsertSchema(shishyaMarksheets).omit({ id: true, issuedAt: true });
export const insertMarksheetVerificationSchema = createInsertSchema(shishyaMarksheetVerifications).omit({ id: true, verifiedAt: true });

// Usha AI Tutor insert schemas
export const insertUshaConversationSchema = createInsertSchema(shishyaUshaConversations).omit({ id: true, createdAt: true });
export const insertUshaMessageSchema = createInsertSchema(shishyaUshaMessages).omit({ id: true, createdAt: true });

// Guru Admin insert schemas
export const insertGuruAdminSchema = createInsertSchema(guruAdminUsers).omit({ id: true, createdAt: true, lastLoginAt: true });
export const insertGuruAdminSessionSchema = createInsertSchema(guruAdminSessions).omit({ createdAt: true });

// ============ TYPE DEFINITIONS ============

// OTP Purpose enum
export const OTP_PURPOSES = ["signup", "login", "forgot_password", "verify_email"] as const;
export type OtpPurpose = typeof OTP_PURPOSES[number];

// Course Content DB types (for database operations)
export type DbCourse = typeof courses.$inferSelect;
export type DbModule = typeof modules.$inferSelect;
export type DbLesson = typeof lessons.$inferSelect;
export type DbTest = typeof tests.$inferSelect;
export type DbProject = typeof projects.$inferSelect;
export type DbLab = typeof labs.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertLab = z.infer<typeof insertLabSchema>;

// Types from database
export type User = typeof shishyaUsers.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type OtpCode = typeof shishyaOtpCodes.$inferSelect;
export type OtpLog = typeof shishyaOtpLogs.$inferSelect;
export type Session = typeof shishyaSessions.$inferSelect;
export type UserProgress = typeof shishyaUserProgress.$inferSelect;
export type UserLabProgress = typeof shishyaUserLabProgress.$inferSelect;
export type UserTestAttempt = typeof shishyaUserTestAttempts.$inferSelect;
export type UserProjectSubmission = typeof shishyaUserProjectSubmissions.$inferSelect;
export type UserCertificate = typeof shishyaUserCertificates.$inferSelect;
export type UserProfile = typeof shishyaUserProfiles.$inferSelect;
export type UserCredits = typeof shishyaUserCredits.$inferSelect;
export type CreditTransaction = typeof shishyaCreditTransactions.$inferSelect;
export type CourseEnrollment = typeof shishyaCourseEnrollments.$inferSelect;
export type InsertUserCredits = z.infer<typeof insertUserCreditsSchema>;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;
export type Voucher = typeof shishyaVouchers.$inferSelect;
export type VoucherRedemption = typeof shishyaVoucherRedemptions.$inferSelect;
export type GiftBox = typeof shishyaGiftBoxes.$inferSelect;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type InsertVoucherRedemption = z.infer<typeof insertVoucherRedemptionSchema>;
export type InsertGiftBox = z.infer<typeof insertGiftBoxSchema>;
export type Notification = typeof shishyaNotifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// AI Motivation Rules Engine types
export type MotivationRule = typeof shishyaMotivationRules.$inferSelect;
export type RuleTriggerLog = typeof shishyaRuleTriggerLogs.$inferSelect;
export type MotivationCard = typeof shishyaMotivationCards.$inferSelect;
export type Scholarship = typeof shishyaScholarships.$inferSelect;
export type UserScholarship = typeof shishyaUserScholarships.$inferSelect;
export type AiNudgeLog = typeof shishyaAiNudgeLogs.$inferSelect;
export type MysteryBox = typeof shishyaMysteryBoxes.$inferSelect;
export type StudentStreak = typeof shishyaStudentStreaks.$inferSelect;

export type InsertMotivationRule = z.infer<typeof insertMotivationRuleSchema>;
export type InsertRuleTriggerLog = z.infer<typeof insertRuleTriggerLogSchema>;
export type InsertMotivationCard = z.infer<typeof insertMotivationCardSchema>;
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type InsertUserScholarship = z.infer<typeof insertUserScholarshipSchema>;
export type InsertAiNudgeLog = z.infer<typeof insertAiNudgeLogSchema>;
export type InsertMysteryBox = z.infer<typeof insertMysteryBoxSchema>;
export type InsertStudentStreak = z.infer<typeof insertStudentStreakSchema>;

// Marksheet types
export type Marksheet = typeof shishyaMarksheets.$inferSelect;
export type MarksheetVerification = typeof shishyaMarksheetVerifications.$inferSelect;
export type InsertMarksheet = z.infer<typeof insertMarksheetSchema>;
export type InsertMarksheetVerification = z.infer<typeof insertMarksheetVerificationSchema>;

// Usha AI Tutor types
export type UshaConversation = typeof shishyaUshaConversations.$inferSelect;
export type UshaMessage = typeof shishyaUshaMessages.$inferSelect;
export type InsertUshaConversation = z.infer<typeof insertUshaConversationSchema>;
export type InsertUshaMessage = z.infer<typeof insertUshaMessageSchema>;

// Guru Admin types
export type GuruAdmin = typeof guruAdminUsers.$inferSelect;
export type InsertGuruAdmin = z.infer<typeof insertGuruAdminSchema>;

// ============ CONSTANTS ============

// Marksheet grades
export const MARKSHEET_GRADES = ["O", "A+", "A", "B+", "B", "C", "F"] as const;
export type MarksheetGrade = typeof MARKSHEET_GRADES[number];

// Marksheet result statuses
export const MARKSHEET_RESULTS = ["Pass", "Fail", "Pending"] as const;
export type MarksheetResult = typeof MARKSHEET_RESULTS[number];

// Marksheet classifications
export const MARKSHEET_CLASSIFICATIONS = ["Distinction", "First Class", "Second Class", "Pass", "Below Pass"] as const;
export type MarksheetClassification = typeof MARKSHEET_CLASSIFICATIONS[number];

// Marksheet course entry interface (stored as JSON in courseData)
export interface MarksheetCourseEntry {
  sno: number;
  courseCode: string;
  courseId: number;
  courseName: string;
  credits: number;
  maxMarks: number;
  obtainedMarks: number;
  testScore: number | null;
  grade: MarksheetGrade;
  projectStatus: "Submitted" | "Pending" | "N/A";
  labStatus: "Completed" | "Pending" | "N/A";
  status: MarksheetResult;
}

// Notification types
export const NOTIFICATION_TYPES = ["product", "offer", "payment", "payment_failed", "course", "certificate", "system", "motivation"] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];

export const NOTIFICATION_ROLES = ["guru", "shishya", "all"] as const;
export type NotificationRole = typeof NOTIFICATION_ROLES[number];

// ============ AI MOTIVATION RULES ENGINE CONSTANTS ============

// Rule types
export const MOTIVATION_RULE_TYPES = ["progress", "time", "performance", "streak", "milestone", "comeback", "speed"] as const;
export type MotivationRuleType = typeof MOTIVATION_RULE_TYPES[number];

// Condition operators
export const CONDITION_OPERATORS = ["eq", "neq", "gt", "gte", "lt", "lte", "between", "in", "not_in"] as const;
export type ConditionOperator = typeof CONDITION_OPERATORS[number];

// Condition fields (input signals)
export const CONDITION_FIELDS = [
  "lessonsCompleted",
  "testsCompleted",
  "projectsSubmitted",
  "courseProgressPercent",
  "testScore",
  "avgTestScore",
  "daysSinceLastActivity",
  "streakCount",
  "totalActiveDays",
  "coursesEnrolled",
  "coursesCompleted",
  "certificatesEarned",
  "daysTaken",
  "targetDays",
  "percentileRank",
] as const;
export type ConditionField = typeof CONDITION_FIELDS[number];

// Action types
export const ACTION_TYPES = [
  "add_coins",
  "generate_card",
  "award_scholarship",
  "create_mystery_box",
  "send_nudge",
  "send_notification",
  "award_badge",
  "unlock_reward",
] as const;
export type ActionType = typeof ACTION_TYPES[number];

// Motivation card types
export const MOTIVATION_CARD_TYPES = ["streak", "milestone", "completion", "performance", "speedster", "comeback", "top_performer", "dedication"] as const;
export type MotivationCardType = typeof MOTIVATION_CARD_TYPES[number];

// Nudge types
export const NUDGE_TYPES = ["encouragement", "reminder", "celebration", "comeback", "streak", "progress", "challenge"] as const;
export type NudgeType = typeof NUDGE_TYPES[number];

// Mystery box reward types
export const MYSTERY_BOX_REWARD_TYPES = ["coins", "scholarship", "badge", "coupon", "free_course"] as const;
export type MysteryBoxRewardType = typeof MYSTERY_BOX_REWARD_TYPES[number];

// Rule condition schema for validation
export const ruleConditionSchema = z.object({
  field: z.enum(CONDITION_FIELDS),
  operator: z.enum(CONDITION_OPERATORS),
  value: z.union([z.number(), z.string(), z.array(z.number()), z.array(z.string())]),
  value2: z.union([z.number(), z.string()]).optional(),
});
export type RuleCondition = z.infer<typeof ruleConditionSchema>;

// Rule action schema for validation
export const ruleActionSchema = z.object({
  type: z.enum(ACTION_TYPES),
  value: z.union([z.number(), z.string(), z.object({})]).optional(),
  message: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type RuleAction = z.infer<typeof ruleActionSchema>;

// Student input signals - data used to evaluate rules
export const studentSignalsSchema = z.object({
  userId: z.string(),
  courseId: z.number().optional(),
  lessonsCompleted: z.number().default(0),
  testsCompleted: z.number().default(0),
  projectsSubmitted: z.number().default(0),
  courseProgressPercent: z.number().default(0),
  testScore: z.number().optional(),
  avgTestScore: z.number().default(0),
  daysSinceLastActivity: z.number().default(0),
  streakCount: z.number().default(0),
  totalActiveDays: z.number().default(0),
  coursesEnrolled: z.number().default(0),
  coursesCompleted: z.number().default(0),
  certificatesEarned: z.number().default(0),
  daysTaken: z.number().optional(),
  targetDays: z.number().optional(),
  percentileRank: z.number().optional(),
});
export type StudentSignals = z.infer<typeof studentSignalsSchema>;

// ============ ZOD SCHEMAS (for mock data and API validation) ============

// Course Schema - matches AISiksha Admin backend
export const courseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  level: z.enum(["beginner", "intermediate", "advanced", "masters"]),
  duration: z.string().nullable(),
  skills: z.union([z.array(z.string()), z.string()]).nullable(),
  status: z.enum(["draft", "published", "archived"]),
  testRequired: z.boolean().nullable(),
  projectRequired: z.boolean().nullable(),
  creditCost: z.number().nullable().default(0),
  isFree: z.boolean().nullable().default(true),
  language: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  groupTitle: z.string().nullable().optional(),
  trainerCentralCourseUrl: z.string().nullable().optional(),
  zohoId: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
  totalStudents: z.number().nullable().optional(),
  projectCount: z.number().nullable().optional(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type Course = z.infer<typeof courseSchema>;

// Credit transaction types
export const CREDIT_TRANSACTION_TYPES = ["BONUS", "DEBIT", "CREDIT"] as const;
export type CreditTransactionType = typeof CREDIT_TRANSACTION_TYPES[number];

export const CREDIT_REASONS = [
  "WELCOME_BONUS",
  "COURSE_ENROLLMENT",
  "REFUND",
  "PURCHASE",
  "REWARD",
  "REFERRAL",
] as const;
export type CreditReason = typeof CREDIT_REASONS[number];

// Welcome bonus amount
export const WELCOME_BONUS_CREDITS = 500;

// Module Schema
export const moduleSchema = z.object({
  id: z.number(),
  courseId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  orderIndex: z.number(),
  estimatedTime: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type Module = z.infer<typeof moduleSchema>;

// Lesson Schema
export const lessonSchema = z.object({
  id: z.number(),
  moduleId: z.number(),
  title: z.string(),
  content: z.string().nullable().optional(),
  objectives: z.array(z.string()).nullable(),
  keyConcepts: z.array(z.string()).nullable(),
  orderIndex: z.number(),
  estimatedTime: z.string().nullable(),
  videoUrl: z.string().nullable(),
  trainerCentralUrl: z.string().nullable().optional(),
  externalResources: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })).nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type Lesson = z.infer<typeof lessonSchema>;

// AI Notes Schema
export const aiNotesSchema = z.object({
  id: z.number(),
  lessonId: z.number(),
  content: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type AINotes = z.infer<typeof aiNotesSchema>;

// Module with Lessons (for Learn View)
export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

// Course with full details
export interface CourseWithModules extends Course {
  modules: ModuleWithLessons[];
}

// Progress tracking (stored in localStorage for guests)
export interface LessonProgress {
  lessonId: number;
  completedAt: string;
}

export interface CourseProgress {
  courseId: number;
  completedLessons: LessonProgress[];
}

// Project Schema
export const projectSchema = z.object({
  id: z.number(),
  courseId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedHours: z.number().nullable(),
  skills: z.array(z.string()).nullable(),
  learningOutcomes: z.array(z.string()).nullable(),
  requirements: z.object({
    githubRequired: z.boolean(),
    liveUrlRequired: z.boolean(),
    documentationRequired: z.boolean(),
  }).nullable(),
  evaluationCriteria: z.array(z.string()).nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type Project = z.infer<typeof projectSchema>;

// Project Submission Schema
export const projectSubmissionSchema = z.object({
  projectId: z.number(),
  courseId: z.number(),
  githubUrl: z.string(),
  liveUrl: z.string().nullable(),
  notes: z.string().nullable(),
  submitted: z.boolean(),
  submittedAt: z.string().nullable(),
});

export type ProjectSubmission = z.infer<typeof projectSubmissionSchema>;

// Insert schema for project submission (student action)
export const insertProjectSubmissionSchema = z.object({
  githubUrl: z.string().url("Please enter a valid GitHub URL"),
  liveUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type InsertProjectSubmission = z.infer<typeof insertProjectSubmissionSchema>;

// Test Option Schema (for internal use only - isCorrect never exposed to UI)
export const testOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export type TestOption = z.infer<typeof testOptionSchema>;

// Test Option for UI (without isCorrect)
export const testOptionUISchema = z.object({
  id: z.string(),
  text: z.string(),
});

export type TestOptionUI = z.infer<typeof testOptionUISchema>;

// Test Question Schema
export const testQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["mcq", "scenario"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionText: z.string(),
  options: z.array(testOptionSchema),
});

export type TestQuestion = z.infer<typeof testQuestionSchema>;

// Test Question for UI (options without isCorrect)
export interface TestQuestionUI {
  id: string;
  type: "mcq" | "scenario";
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  options: TestOptionUI[];
}

// Test Schema
export const testSchema = z.object({
  id: z.number(),
  courseId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  instructions: z.string().nullable(),
  passingPercentage: z.number(),
  timeLimit: z.number().nullable(),
  questionCount: z.number(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type Test = z.infer<typeof testSchema>;

// Test with Questions (for backend use only)
export interface TestWithQuestions extends Test {
  questions: TestQuestion[];
}

// Test with Questions for UI (questions without isCorrect in options)
export interface TestWithQuestionsUI extends Test {
  questions: TestQuestionUI[];
}

// Test Attempt Answer Schema
export const testAttemptAnswerSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string(),
});

export type TestAttemptAnswer = z.infer<typeof testAttemptAnswerSchema>;

// Test Attempt Schema (stored in localStorage for guests)
export const testAttemptSchema = z.object({
  testId: z.number(),
  courseId: z.number(),
  answers: z.array(testAttemptAnswerSchema),
  scorePercentage: z.number(),
  passed: z.boolean(),
  attemptedAt: z.string(),
});

export type TestAttempt = z.infer<typeof testAttemptSchema>;

// Certificate Schema
export const certificateSchema = z.object({
  certificateId: z.string(),
  studentName: z.string(),
  courseId: z.number(),
  courseTitle: z.string(),
  certificateTitle: z.string(),
  certificateType: z.enum(["completion", "achievement"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  skills: z.array(z.string()),
  issuedAt: z.string(),
  verificationUrl: z.string(),
});

export type Certificate = z.infer<typeof certificateSchema>;

// Student Profile Schema (for form validation)
export const studentProfileSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-z0-9_-]+$/, "Username must be lowercase with no spaces"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  profilePhoto: z.string().optional().or(z.literal("")),
  headline: z.string().max(100, "Headline must be less than 100 characters").optional(),
  location: z.string().optional(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  facebookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolioVisible: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type StudentProfile = z.infer<typeof studentProfileSchema>;

// Insert schema for creating/updating profile
export const insertProfileSchema = studentProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;

// Lab Schema (Guided Labs Module)
export const labSchema = z.object({
  id: z.number(),
  courseId: z.number(),
  moduleId: z.number().nullable(),
  lessonId: z.number().nullable(),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  instructions: z.array(z.string()),
  starterCode: z.string(),
  expectedOutput: z.string(),
  language: z.literal("javascript"),
  status: z.enum(["locked", "available"]),
  estimatedTime: z.number(),
  orderIndex: z.number(),
});

export type Lab = z.infer<typeof labSchema>;

// Lab Progress (stored in localStorage for guests)
export interface LabProgress {
  labId: number;
  completed: boolean;
  completedAt: string | null;
  userCode: string | null;
}

export interface CourseLabProgress {
  [labId: number]: LabProgress;
}

// Auth validation schemas
export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Auth user response (safe to send to client)
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

// Usha AI Tutor constants
export const USHA_RESPONSE_TYPES = ["explanation", "hint", "guidance", "clarification", "encouragement", "warning"] as const;
export type UshaResponseType = typeof USHA_RESPONSE_TYPES[number];

export const USHA_HELP_LEVELS = ["minimal", "moderate", "detailed"] as const;
export type UshaHelpLevel = typeof USHA_HELP_LEVELS[number];

export const USHA_PAGE_TYPES = ["lesson", "lab", "project", "test", "general"] as const;
export type UshaPageType = typeof USHA_PAGE_TYPES[number];

// Supported languages for Usha AI Tutor
export const SUPPORTED_LANGUAGES = ["en", "hi", "ta", "te", "kn", "ml", "bn", "mr", "gu", "pa"] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Usha request schema
export const ushaRequestSchema = z.object({
  courseId: z.number().optional(),
  pageType: z.enum(USHA_PAGE_TYPES),
  message: z.string().min(1).max(1000),
  context: z.object({
    lessonId: z.number().optional(),
    labId: z.number().optional(),
    projectId: z.number().optional(),
    testId: z.number().optional(),
    currentCode: z.string().optional(),
    errorMessage: z.string().optional(),
    questionId: z.string().optional(),
    lessonTitle: z.string().optional(),
    labTitle: z.string().optional(),
    labObjective: z.string().optional(),
    labInstructions: z.array(z.string()).optional(),
    labLanguage: z.string().optional(),
    labDifficulty: z.string().optional(),
    labExpectedOutput: z.string().optional(),
    projectTitle: z.string().optional(),
    courseTitle: z.string().optional(),
    courseLevel: z.string().optional(),
    isVideoPlaying: z.boolean().optional(),
    hasInteractedWithContent: z.boolean().optional(),
    lessonCompleted: z.boolean().optional(),
  }).optional(),
  helpLevel: z.enum(USHA_HELP_LEVELS).optional(),
  language: z.enum(SUPPORTED_LANGUAGES).optional().default("en"),
});

export type UshaRequest = z.infer<typeof ushaRequestSchema>;

// Usha response interface
export interface UshaResponse {
  message: string;
  responseType: UshaResponseType;
  helpLevel: UshaHelpLevel;
  suggestions?: string[];
  remainingRequests?: number;
  nearRateLimit?: boolean;
  answer?: string;
  type?: string;
}

// Usha context interface
export interface UshaContext {
  lessonId?: number;
  labId?: number;
  projectId?: number;
  testId?: number;
  currentCode?: string;
  errorMessage?: string;
  questionId?: string;
  courseId?: number;
  courseTitle?: string;
  courseLevel?: string;
  lessonTitle?: string;
  labTitle?: string;
  labObjective?: string;
  labInstructions?: string[];
  labLanguage?: string;
  labDifficulty?: string;
  labExpectedOutput?: string;
  projectTitle?: string;
  pageType?: UshaPageType;
  studentId?: string;
  language?: SupportedLanguage;
  studentProgressSummary?: StudentProgressSummary;
  previousUshaTurns?: UshaTurn[];
  isVideoPlaying?: boolean;
  hasInteractedWithContent?: boolean;
  lessonCompleted?: boolean;
}

// Student progress summary for Usha
export interface StudentProgressSummary {
  lessonsCompleted: number;
  totalLessons: number;
  labsCompleted: number;
  totalLabs: number;
  testsPassed: number;
  projectsSubmitted: number;
}

// Usha conversation turn
export interface UshaTurn {
  role: "user" | "assistant";
  content: string;
}
