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

// OTP codes table for email verification
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  otpHash: text("otp_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true });
export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({ id: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ createdAt: true });

// Types from database
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserLabProgress = typeof userLabProgress.$inferSelect;
export type UserTestAttempt = typeof userTestAttempts.$inferSelect;
export type UserProjectSubmission = typeof userProjectSubmissions.$inferSelect;
export type UserCertificate = typeof userCertificates.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;

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
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type Course = z.infer<typeof courseSchema>;

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
  profilePhoto: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  headline: z.string().max(100, "Headline must be less than 100 characters").optional(),
  location: z.string().optional(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
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
