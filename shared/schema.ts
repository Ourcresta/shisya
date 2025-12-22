import { z } from "zod";

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

// Progress tracking (stored in localStorage)
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

// Test Attempt Schema (stored in localStorage)
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

// Student Profile Schema
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

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
