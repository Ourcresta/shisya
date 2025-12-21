import type { Express } from "express";
import { createServer, type Server } from "http";
import { mockCourses, mockModules, mockLessons, mockAINotes, getAllLessons } from "./mockData";
import type { ModuleWithLessons } from "@shared/schema";

// AISiksha Admin Course Factory backend URL
// Set this environment variable when the admin backend is deployed
const ADMIN_API_BASE = process.env.ADMIN_API_BASE || "";

// Check if we should use mock data (when admin backend is not available)
const USE_MOCK_DATA = !ADMIN_API_BASE;

// Helper function to fetch from admin backend
async function fetchFromAdmin(endpoint: string): Promise<Response> {
  if (!ADMIN_API_BASE) {
    throw new Error("Admin API not configured");
  }
  const url = `${ADMIN_API_BASE}/api${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
  });
  return response;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // GET /api/courses - Fetch only published courses
  app.get("/api/courses", async (req, res) => {
    try {
      if (USE_MOCK_DATA) {
        // Return mock published courses
        const publishedCourses = mockCourses.filter(c => c.status === "published");
        return res.json(publishedCourses);
      }

      const response = await fetchFromAdmin("/courses");
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch courses" });
      }
      const courses = await response.json();
      // Filter to only show published courses
      const publishedCourses = Array.isArray(courses) 
        ? courses.filter((c: any) => c.status === "published")
        : [];
      res.json(publishedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (USE_MOCK_DATA) {
        const publishedCourses = mockCourses.filter(c => c.status === "published");
        return res.json(publishedCourses);
      }
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  // GET /api/courses/:courseId - Fetch single course
  app.get("/api/courses/:courseId", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      if (USE_MOCK_DATA) {
        const course = mockCourses.find(c => c.id === courseIdNum);
        if (!course || course.status !== "published") {
          return res.status(404).json({ error: "Course not found" });
        }
        return res.json(course);
      }

      const response = await fetchFromAdmin(`/courses/${courseId}`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Course not found" });
      }
      const course = await response.json();
      // Only return if published
      if (course.status !== "published") {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ error: "Failed to fetch course" });
    }
  });

  // GET /api/courses/:courseId/modules - Fetch modules for a course
  app.get("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      if (USE_MOCK_DATA) {
        const modules = mockModules[courseIdNum] || [];
        return res.json(modules);
      }

      const response = await fetchFromAdmin(`/courses/${courseId}/modules`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch modules" });
      }
      const modules = await response.json();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  // GET /api/courses/:courseId/modules-with-lessons - Fetch modules with their lessons
  app.get("/api/courses/:courseId/modules-with-lessons", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      if (USE_MOCK_DATA) {
        const modules = mockModules[courseIdNum] || [];
        const modulesWithLessons: ModuleWithLessons[] = modules.map(module => ({
          ...module,
          lessons: mockLessons[module.id] || [],
        }));
        return res.json(modulesWithLessons);
      }
      
      // First fetch modules
      const modulesResponse = await fetchFromAdmin(`/courses/${courseId}/modules`);
      if (!modulesResponse.ok) {
        return res.status(modulesResponse.status).json({ error: "Failed to fetch modules" });
      }
      const modules = await modulesResponse.json();
      
      // Then fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        (modules || []).map(async (module: any) => {
          try {
            const lessonsResponse = await fetchFromAdmin(`/modules/${module.id}/lessons`);
            const lessons = lessonsResponse.ok ? await lessonsResponse.json() : [];
            return { ...module, lessons: lessons || [] };
          } catch {
            return { ...module, lessons: [] };
          }
        })
      );
      
      res.json(modulesWithLessons);
    } catch (error) {
      console.error("Error fetching modules with lessons:", error);
      res.status(500).json({ error: "Failed to fetch modules with lessons" });
    }
  });

  // GET /api/modules/:moduleId/lessons - Fetch lessons for a module
  app.get("/api/modules/:moduleId/lessons", async (req, res) => {
    try {
      const { moduleId } = req.params;
      const moduleIdNum = parseInt(moduleId, 10);

      if (USE_MOCK_DATA) {
        const lessons = mockLessons[moduleIdNum] || [];
        return res.json(lessons);
      }

      const response = await fetchFromAdmin(`/modules/${moduleId}/lessons`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch lessons" });
      }
      const lessons = await response.json();
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  // GET /api/lessons/:lessonId - Fetch single lesson
  app.get("/api/lessons/:lessonId", async (req, res) => {
    try {
      const { lessonId } = req.params;
      const lessonIdNum = parseInt(lessonId, 10);

      if (USE_MOCK_DATA) {
        const allLessons = getAllLessons();
        const lesson = allLessons[lessonIdNum];
        if (!lesson) {
          return res.status(404).json({ error: "Lesson not found" });
        }
        return res.json(lesson);
      }

      const response = await fetchFromAdmin(`/lessons/${lessonId}`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Lesson not found" });
      }
      const lesson = await response.json();
      res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });

  // GET /api/lessons/:lessonId/notes - Fetch AI notes for a lesson
  app.get("/api/lessons/:lessonId/notes", async (req, res) => {
    try {
      const { lessonId } = req.params;
      const lessonIdNum = parseInt(lessonId, 10);

      if (USE_MOCK_DATA) {
        const notes = mockAINotes[lessonIdNum] || null;
        return res.json(notes);
      }

      const response = await fetchFromAdmin(`/lessons/${lessonId}/notes`);
      if (!response.ok) {
        // Notes might not exist, return null
        return res.json(null);
      }
      const notes = await response.json();
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.json(null);
    }
  });

  return httpServer;
}
