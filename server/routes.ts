import type { Express } from "express";
import { createServer, type Server } from "http";

// AISiksha Admin Course Factory backend URL
const ADMIN_API_BASE = "https://course-factory.ourcresta1.repl.co";

// Helper function to fetch from admin backend
async function fetchFromAdmin(endpoint: string): Promise<Response> {
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
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  // GET /api/courses/:courseId - Fetch single course
  app.get("/api/courses/:courseId", async (req, res) => {
    try {
      const { courseId } = req.params;
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
