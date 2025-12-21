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

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
