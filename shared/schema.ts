import { z } from "zod";
import { pgTable, text, serial, boolean, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ============ DATABASE TABLES (Drizzle ORM) ============

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// OTP logs table for email verification with purpose tracking
export const otpLogs = pgTable("otp_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  contactType: varchar("contact_type", { length: 10 }).notNull().default("email"),
  destination: varchar("destination", { length: 255 }).notNull(),
  otpHash: text("otp_hash").notNull(),
  purpose: varchar("purpose", { length: 20 }).notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Keep old otpCodes for backward compatibility during migration
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  otpHash: text("otp_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// User progress table (migrated from localStorage)
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  courseId: integer("course_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// User lab progress table
export const userLabProgress = pgTable("user_lab_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  courseId: integer("course_id").notNull(),
  labId: integer("lab_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  userCode: text("user_code"),
  completedAt: timestamp("completed_at"),
});

// User test attempts table
export const userTestAttempts = pgTable("user_test_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  testId: integer("test_id").notNull(),
  courseId: integer("course_id").notNull(),
  answers: text("answers").notNull(), // JSON string
  scorePercentage: integer("score_percentage").notNull(),
  passed: boolean("passed").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});

// User project submissions table
export const userProjectSubmissions = pgTable("user_project_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  projectId: integer("project_id").notNull(),
  courseId: integer("course_id").notNull(),
  githubUrl: text("github_url").notNull(),
  liveUrl: text("live_url"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// User certificates table
export const userCertificates = pgTable("user_certificates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  certificateId: varchar("certificate_id", { length: 20 }).notNull().unique(),
  courseId: integer("course_id").notNull(),
  courseTitle: text("course_title").notNull(),
  certificateTitle: text("certificate_title").notNull(),
  certificateType: varchar("certificate_type", { length: 20 }).notNull(),
  level: varchar("level", { length: 20 }).notNull(),
  skills: text("skills").notNull(), // JSON array string
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

// User profiles table
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id).unique(),
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

// User credits table - Learning Credits wallet
export const userCredits = pgTable("user_credits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id).unique(),
  balance: integer("balance").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  totalSpent: integer("total_spent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Credit transactions table - transaction history
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // BONUS, DEBIT, CREDIT
  reason: varchar("reason", { length: 50 }).notNull(), // WELCOME_BONUS, COURSE_ENROLLMENT, REFUND, etc.
  description: text("description"),
  referenceId: integer("reference_id"), // courseId or other reference
  balanceAfter: integer("balance_after").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course enrollments table
export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  courseId: integer("course_id").notNull(),
  creditsPaid: integer("credits_paid").notNull().default(0),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

// Vouchers table
export const vouchers = pgTable("vouchers", {
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

// Voucher redemptions table
export const voucherRedemptions = pgTable("voucher_redemptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  voucherCode: varchar("voucher_code", { length: 50 }).notNull(),
  pointsReceived: integer("points_received").notNull(),
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
});

// Gift boxes table
export const giftBoxes = pgTable("gift_boxes", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id", { length: 36 }).notNull().references(() => users.id),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  points: integer("points").notNull(),
  paymentId: varchar("payment_id", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("CREATED"),
  claimedBy: varchar("claimed_by", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  claimedAt: timestamp("claimed_at"),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id), // null for global notifications
  role: varchar("role", { length: 20 }).notNull().default("all"), // 'guru', 'shishya', 'all'
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 30 }).notNull(), // 'product', 'offer', 'payment', 'payment_failed', 'course', 'certificate', 'system'
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ AI MOTIVATION RULES ENGINE TABLES ============

// Motivation Rules - configurable rules with conditions and actions
export const motivationRules = pgTable("motivation_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  ruleType: varchar("rule_type", { length: 30 }).notNull(), // 'progress', 'time', 'performance', 'streak', 'milestone'
  conditions: text("conditions").notNull(), // JSON: {field, operator, value}[]
  actions: text("actions").notNull(), // JSON: {type, value, message}[]
  priority: integer("priority").notNull().default(0),
  cooldownHours: integer("cooldown_hours").notNull().default(24), // Hours before rule can trigger again
  maxTriggerCount: integer("max_trigger_count"), // null = unlimited
  isActive: boolean("is_active").notNull().default(true),
  isGlobal: boolean("is_global").notNull().default(true), // applies to all courses or specific
  courseId: integer("course_id"), // null for global rules
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Rule Trigger Logs - track rule executions for idempotency
export const ruleTriggerLogs = pgTable("rule_trigger_logs", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").notNull().references(() => motivationRules.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  courseId: integer("course_id"),
  triggerCount: integer("trigger_count").notNull().default(1),
  actionsExecuted: text("actions_executed").notNull(), // JSON: what actions were taken
  inputSignals: text("input_signals"), // JSON: snapshot of data that triggered rule
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
});

// Motivation Cards - shareable achievement cards
export const motivationCards = pgTable("motivation_cards", {
  id: serial("id").primaryKey(),
  cardId: varchar("card_id", { length: 20 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  courseId: integer("course_id"),
  courseTitle: text("course_title"),
  cardType: varchar("card_type", { length: 30 }).notNull(), // 'streak', 'milestone', 'completion', 'performance', 'speedster', 'comeback'
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  badge: varchar("badge", { length: 50 }), // badge name or icon
  stats: text("stats"), // JSON: {label, value}[] for display
  message: text("message"),
  percentileRank: integer("percentile_rank"), // e.g., "Top 13%"
  isShareable: boolean("is_shareable").notNull().default(true),
  shareUrl: text("share_url"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scholarships - rule-based discounts and free access
export const scholarships = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  scholarshipId: varchar("scholarship_id", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  discountPercent: integer("discount_percent").notNull(), // 0-100
  courseId: integer("course_id"), // null for any course
  maxRedemptions: integer("max_redemptions"), // null = unlimited
  redemptionCount: integer("redemption_count").notNull().default(0),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  ruleId: integer("rule_id").references(() => motivationRules.id), // link to triggering rule
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Scholarships - scholarships awarded to users
export const userScholarships = pgTable("user_scholarships", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  scholarshipId: integer("scholarship_id").notNull().references(() => scholarships.id),
  courseId: integer("course_id"), // null if applicable to any course
  isUsed: boolean("is_used").notNull().default(false),
  usedAt: timestamp("used_at"),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// AI Nudge Logs - track motivation messages sent
export const aiNudgeLogs = pgTable("ai_nudge_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  courseId: integer("course_id"),
  nudgeType: varchar("nudge_type", { length: 30 }).notNull(), // 'encouragement', 'reminder', 'celebration', 'comeback', 'streak'
  message: text("message").notNull(),
  channel: varchar("channel", { length: 20 }).notNull().default("app"), // 'app', 'email', 'push'
  ruleId: integer("rule_id").references(() => motivationRules.id),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// Mystery Reward Boxes - gamification rewards
export const mysteryBoxes = pgTable("mystery_boxes", {
  id: serial("id").primaryKey(),
  boxId: varchar("box_id", { length: 20 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  ruleId: integer("rule_id").references(() => motivationRules.id),
  rewardType: varchar("reward_type", { length: 30 }), // 'coins', 'scholarship', 'badge', 'coupon'
  rewardValue: text("reward_value"), // JSON with reward details
  isOpened: boolean("is_opened").notNull().default(false),
  openedAt: timestamp("opened_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Student Streaks - track learning consistency
export const studentStreaks = pgTable("student_streaks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: timestamp("last_activity_date"),
  streakStartDate: timestamp("streak_start_date"),
  totalActiveDays: integer("total_active_days").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ ACADEMIC MARKSHEET TABLES ============

// Marksheets - Official academic transcripts with verification
export const marksheets = pgTable("marksheets", {
  id: serial("id").primaryKey(),
  marksheetId: varchar("marksheet_id", { length: 30 }).notNull().unique(), // MS-2024-XXXXXXXX
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  studentName: text("student_name").notNull(),
  studentEmail: varchar("student_email", { length: 255 }).notNull(),
  programName: text("program_name").notNull().default("Full Stack Development"),
  academicYear: varchar("academic_year", { length: 10 }).notNull(), // 2024-25
  courseData: text("course_data").notNull(), // JSON array of course entries
  totalMarks: integer("total_marks").notNull().default(0),
  obtainedMarks: integer("obtained_marks").notNull().default(0),
  percentage: integer("percentage").notNull().default(0),
  grade: varchar("grade", { length: 5 }).notNull(), // O, A+, A, B+, B, C, F
  cgpa: varchar("cgpa", { length: 5 }).notNull(), // 0.00 - 10.00
  result: varchar("result", { length: 20 }).notNull(), // Pass, Fail, Pending
  classification: varchar("classification", { length: 30 }).notNull(), // Distinction, First Class, Pass
  totalCredits: integer("total_credits").notNull().default(0),
  coursesCompleted: integer("courses_completed").notNull().default(0),
  rewardCoins: integer("reward_coins").notNull().default(0),
  scholarshipEligible: boolean("scholarship_eligible").notNull().default(false),
  verificationCode: varchar("verification_code", { length: 20 }).notNull().unique(), // For QR verification
  pdfHash: text("pdf_hash"), // SHA256 hash of generated PDF for tampering detection
  signedBy: text("signed_by").default("Controller of Examinations"), // Digital signature authority
  aiVerifierName: text("ai_verifier_name").default("Acharya Usha"), // AI Verifier signature
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Optional expiry
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, revoked, expired
});

// Marksheet verification logs - Track who verified marksheets
export const marksheetVerifications = pgTable("marksheet_verifications", {
  id: serial("id").primaryKey(),
  marksheetId: integer("marksheet_id").notNull().references(() => marksheets.id),
  verifierIp: varchar("verifier_ip", { length: 45 }),
  verifierUserAgent: text("verifier_user_agent"),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true });
export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({ id: true, createdAt: true });
export const insertOtpLogSchema = createInsertSchema(otpLogs).omit({ id: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ createdAt: true });
export const insertUserCreditsSchema = createInsertSchema(userCredits).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({ id: true, createdAt: true });
export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments).omit({ id: true, enrolledAt: true });
export const insertVoucherSchema = createInsertSchema(vouchers).omit({ id: true, createdAt: true });
export const insertVoucherRedemptionSchema = createInsertSchema(voucherRedemptions).omit({ id: true, redeemedAt: true });
export const insertGiftBoxSchema = createInsertSchema(giftBoxes).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// AI Motivation Rules Engine insert schemas
export const insertMotivationRuleSchema = createInsertSchema(motivationRules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRuleTriggerLogSchema = createInsertSchema(ruleTriggerLogs).omit({ id: true, triggeredAt: true });
export const insertMotivationCardSchema = createInsertSchema(motivationCards).omit({ id: true, createdAt: true });
export const insertScholarshipSchema = createInsertSchema(scholarships).omit({ id: true, createdAt: true });
export const insertUserScholarshipSchema = createInsertSchema(userScholarships).omit({ id: true, awardedAt: true });
export const insertAiNudgeLogSchema = createInsertSchema(aiNudgeLogs).omit({ id: true, sentAt: true });
export const insertMysteryBoxSchema = createInsertSchema(mysteryBoxes).omit({ id: true, createdAt: true });
export const insertStudentStreakSchema = createInsertSchema(studentStreaks).omit({ id: true, updatedAt: true });

// Marksheet insert schemas
export const insertMarksheetSchema = createInsertSchema(marksheets).omit({ id: true, issuedAt: true });
export const insertMarksheetVerificationSchema = createInsertSchema(marksheetVerifications).omit({ id: true, verifiedAt: true });

// OTP Purpose enum
export const OTP_PURPOSES = ["signup", "login", "forgot_password", "verify_email"] as const;
export type OtpPurpose = typeof OTP_PURPOSES[number];

// Types from database
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;
export type OtpLog = typeof otpLogs.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserLabProgress = typeof userLabProgress.$inferSelect;
export type UserTestAttempt = typeof userTestAttempts.$inferSelect;
export type UserProjectSubmission = typeof userProjectSubmissions.$inferSelect;
export type UserCertificate = typeof userCertificates.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type UserCredits = typeof userCredits.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertUserCredits = z.infer<typeof insertUserCreditsSchema>;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;
export type Voucher = typeof vouchers.$inferSelect;
export type VoucherRedemption = typeof voucherRedemptions.$inferSelect;
export type GiftBox = typeof giftBoxes.$inferSelect;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type InsertVoucherRedemption = z.infer<typeof insertVoucherRedemptionSchema>;
export type InsertGiftBox = z.infer<typeof insertGiftBoxSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// AI Motivation Rules Engine types
export type MotivationRule = typeof motivationRules.$inferSelect;
export type RuleTriggerLog = typeof ruleTriggerLogs.$inferSelect;
export type MotivationCard = typeof motivationCards.$inferSelect;
export type Scholarship = typeof scholarships.$inferSelect;
export type UserScholarship = typeof userScholarships.$inferSelect;
export type AiNudgeLog = typeof aiNudgeLogs.$inferSelect;
export type MysteryBox = typeof mysteryBoxes.$inferSelect;
export type StudentStreak = typeof studentStreaks.$inferSelect;

export type InsertMotivationRule = z.infer<typeof insertMotivationRuleSchema>;
export type InsertRuleTriggerLog = z.infer<typeof insertRuleTriggerLogSchema>;
export type InsertMotivationCard = z.infer<typeof insertMotivationCardSchema>;
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type InsertUserScholarship = z.infer<typeof insertUserScholarshipSchema>;
export type InsertAiNudgeLog = z.infer<typeof insertAiNudgeLogSchema>;
export type InsertMysteryBox = z.infer<typeof insertMysteryBoxSchema>;
export type InsertStudentStreak = z.infer<typeof insertStudentStreakSchema>;

// Marksheet types
export type Marksheet = typeof marksheets.$inferSelect;
export type MarksheetVerification = typeof marksheetVerifications.$inferSelect;
export type InsertMarksheet = z.infer<typeof insertMarksheetSchema>;
export type InsertMarksheetVerification = z.infer<typeof insertMarksheetVerificationSchema>;

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
  value2: z.union([z.number(), z.string()]).optional(), // For 'between' operator
});
export type RuleCondition = z.infer<typeof ruleConditionSchema>;

// Rule action schema for validation
export const ruleActionSchema = z.object({
  type: z.enum(ACTION_TYPES),
  value: z.union([z.number(), z.string(), z.object({})]).optional(), // Coins amount, card type, etc.
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
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.string().nullable(),
  skills: z.array(z.string()).nullable(),
  status: z.enum(["draft", "published", "archived"]),
  testRequired: z.boolean().nullable(),
  projectRequired: z.boolean().nullable(),
  creditCost: z.number().nullable().default(0),
  isFree: z.boolean().nullable().default(true),
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
  objectives: z.array(z.string()).nullable(),
  keyConcepts: z.array(z.string()).nullable(),
  orderIndex: z.number(),
  estimatedTime: z.string().nullable(),
  videoUrl: z.string().nullable(),
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
  timeLimit: z.number().nullable(), // in minutes, null = no time limit
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
  estimatedTime: z.number(), // in minutes
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

// ============ USHA AI TUTOR SCHEMAS (v2) ============

// Usha conversations table (keeping db table name for compatibility)
export const ushaConversations = pgTable("mithra_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  courseId: integer("course_id").notNull(),
  pageType: varchar("page_type", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Usha messages table (keeping db table name for compatibility)
export const ushaMessages = pgTable("mithra_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => ushaConversations.id),
  role: varchar("role", { length: 10 }).notNull(),
  content: text("content").notNull(),
  responseType: varchar("response_type", { length: 20 }),
  helpLevel: varchar("help_level", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Usha allowed page types
export const USHA_ALLOWED_PAGES = ["lesson", "lab", "project", "test_prep"] as const;
export type UshaAllowedPage = typeof USHA_ALLOWED_PAGES[number];

// Usha help levels for adaptive tutoring
export const USHA_HELP_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type UshaHelpLevel = typeof USHA_HELP_LEVELS[number];

// Student progress summary for learning-aware responses
export const studentProgressSummarySchema = z.object({
  lessonsCompleted: z.number().default(0),
  totalLessons: z.number().default(0),
  labsCompleted: z.number().default(0),
  totalLabs: z.number().default(0),
  testsPassed: z.number().default(0),
  projectsSubmitted: z.number().default(0),
  recentFailures: z.number().default(0),
  timeOnCurrentPage: z.number().optional(),
});

export type StudentProgressSummary = z.infer<typeof studentProgressSummarySchema>;

// Previous Usha conversation turn for session memory
export const ushaTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export type UshaTurn = z.infer<typeof ushaTurnSchema>;

// Supported languages for Usha AI Tutor
export const SUPPORTED_LANGUAGES = ["english", "hindi", "tamil"] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Usha request context schema (v2 enhanced)
export const ushaContextSchema = z.object({
  studentId: z.string(),
  courseId: z.number(),
  moduleId: z.number().optional(),
  lessonId: z.number().optional(),
  labId: z.number().optional(),
  projectId: z.number().optional(),
  pageType: z.enum(["lesson", "lab", "project", "test_prep"]),
  courseTitle: z.string().optional(),
  courseLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  lessonTitle: z.string().optional(),
  labTitle: z.string().optional(),
  projectTitle: z.string().optional(),
  language: z.enum(SUPPORTED_LANGUAGES).optional().default("english"),
  studentProgressSummary: studentProgressSummarySchema.optional(),
  previousUshaTurns: z.array(ushaTurnSchema).optional(),
});

export type UshaContext = z.infer<typeof ushaContextSchema>;

// Usha request schema
export const ushaRequestSchema = z.object({
  context: ushaContextSchema,
  question: z.string().min(1, "Question is required").max(500, "Question too long"),
});

export type UshaRequest = z.infer<typeof ushaRequestSchema>;

// Usha response types
export const USHA_RESPONSE_TYPES = ["explanation", "hint", "guidance", "warning"] as const;
export type UshaResponseType = typeof USHA_RESPONSE_TYPES[number];

// Usha response interface (v2 with help level)
export interface UshaResponse {
  answer: string;
  type: UshaResponseType;
  helpLevel: UshaHelpLevel;
}

// Usha table types
export type UshaConversation = typeof ushaConversations.$inferSelect;
export type UshaMessage = typeof ushaMessages.$inferSelect;

