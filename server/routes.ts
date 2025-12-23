import type { Express } from "express";
import { createServer, type Server } from "http";
import { mockCourses, mockModules, mockLessons, mockAINotes, getAllLessons, mockProjects, getAllProjects, mockTests, getAllTests } from "./mockData";
import { mockLabs, getCourseLabs, getLab, getAllLabs } from "./mockLabs";
import { authRouter } from "./auth";
import { registerMithraRoutes } from "./mithra";
import type { ModuleWithLessons } from "@shared/schema";

// AISiksha Admin Course Factory configuration
const AISIKSHA_ADMIN_URL = process.env.AISIKSHA_ADMIN_URL || "";
const AISIKSHA_API_KEY = process.env.AISIKSHA_API_KEY || "";

// Check if we should use mock data (when admin backend is not available)
const USE_MOCK_DATA = !AISIKSHA_ADMIN_URL || !AISIKSHA_API_KEY;

// Helper function to fetch from AISiksha Admin API
async function fetchFromAdmin(endpoint: string): Promise<Response> {
  if (!AISIKSHA_ADMIN_URL || !AISIKSHA_API_KEY) {
    throw new Error("AISiksha Admin API not configured");
  }
  const url = `${AISIKSHA_ADMIN_URL}/api/public${endpoint}`;
  console.log(`[AISiksha] Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "X-API-Key": AISIKSHA_API_KEY,
    },
  });
  return response;
}

// Log configuration status on startup
console.log(`[AISiksha] Admin URL configured: ${!!AISIKSHA_ADMIN_URL}`);
console.log(`[AISiksha] API Key configured: ${!!AISIKSHA_API_KEY}`);
console.log(`[AISiksha] Using mock data: ${USE_MOCK_DATA}`);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth routes
  app.use("/api/auth", authRouter);
  
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
        console.error(`[AISiksha] Failed to fetch courses: ${response.status}`);
        // Fallback to mock data
        const publishedCourses = mockCourses.filter(c => c.status === "published");
        return res.json(publishedCourses);
      }
      const data = await response.json();
      // API returns { success: true, courses: [...] }
      const courses = data.courses || data;
      // Filter to only show published courses
      const publishedCourses = Array.isArray(courses) 
        ? courses.filter((c: any) => c.status === "published")
        : [];
      console.log(`[AISiksha] Fetched ${publishedCourses.length} published courses`);
      res.json(publishedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Fallback to mock data
      const publishedCourses = mockCourses.filter(c => c.status === "published");
      return res.json(publishedCourses);
    }
  });

  // GET /api/courses/:courseId - Fetch single course with full content
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
        console.error(`[AISiksha] Failed to fetch course ${courseId}: ${response.status}`);
        // Fallback to mock data
        const course = mockCourses.find(c => c.id === courseIdNum);
        if (!course || course.status !== "published") {
          return res.status(404).json({ error: "Course not found" });
        }
        return res.json(course);
      }
      const data = await response.json();
      // API returns { success: true, course: {...} }
      const course = data.course || data;
      // Only return if published
      if (course.status !== "published") {
        return res.status(404).json({ error: "Course not found" });
      }
      console.log(`[AISiksha] Fetched course: ${course.title}`);
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      // Fallback to mock data
      const courseIdNum = parseInt(req.params.courseId, 10);
      const course = mockCourses.find(c => c.id === courseIdNum);
      if (course && course.status === "published") {
        return res.json(course);
      }
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

  // ============================================
  // PROJECT ROUTES
  // ============================================

  // GET /api/courses/:courseId/projects - Fetch projects for a course
  app.get("/api/courses/:courseId/projects", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      if (USE_MOCK_DATA) {
        const projects = mockProjects[courseIdNum] || [];
        return res.json(projects);
      }

      const response = await fetchFromAdmin(`/courses/${courseId}/projects`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch projects" });
      }
      const projects = await response.json();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      if (USE_MOCK_DATA) {
        const courseIdNum = parseInt(req.params.courseId, 10);
        const projects = mockProjects[courseIdNum] || [];
        return res.json(projects);
      }
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // GET /api/projects/:projectId - Fetch single project
  app.get("/api/projects/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const projectIdNum = parseInt(projectId, 10);

      if (USE_MOCK_DATA) {
        const allProjects = getAllProjects();
        const project = allProjects[projectIdNum];
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
        return res.json(project);
      }

      const response = await fetchFromAdmin(`/projects/${projectId}`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Project not found" });
      }
      const project = await response.json();
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // POST /api/projects/:projectId/submissions - Submit a project
  // Note: In production, this would save to admin backend
  // For now, we just acknowledge the submission (actual storage is in localStorage on client)
  app.post("/api/projects/:projectId/submissions", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { githubUrl, liveUrl, notes } = req.body;

      // Validate required fields
      if (!githubUrl) {
        return res.status(400).json({ error: "GitHub URL is required" });
      }

      // In a real implementation, this would save to the database
      // For now, we acknowledge the submission
      const submission = {
        projectId: parseInt(projectId, 10),
        githubUrl,
        liveUrl: liveUrl || null,
        notes: notes || null,
        submitted: true,
        submittedAt: new Date().toISOString(),
      };

      res.json({ success: true, submission });
    } catch (error) {
      console.error("Error submitting project:", error);
      res.status(500).json({ error: "Failed to submit project" });
    }
  });

  // ============================================
  // TEST ROUTES
  // ============================================

  // GET /api/courses/:courseId/tests - Fetch tests for a course
  app.get("/api/courses/:courseId/tests", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      if (USE_MOCK_DATA) {
        const tests = mockTests[courseIdNum] || [];
        // Return tests without questions (summary only)
        const testsSummary = tests.map(({ questions, ...rest }) => rest);
        return res.json(testsSummary);
      }

      const response = await fetchFromAdmin(`/courses/${courseId}/tests`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch tests" });
      }
      const tests = await response.json();
      res.json(tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      if (USE_MOCK_DATA) {
        const courseIdNum = parseInt(req.params.courseId, 10);
        const tests = mockTests[courseIdNum] || [];
        const testsSummary = tests.map(({ questions, ...rest }) => rest);
        return res.json(testsSummary);
      }
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  });

  // GET /api/tests/:testId - Fetch single test (without correct answers exposed)
  app.get("/api/tests/:testId", async (req, res) => {
    try {
      const { testId } = req.params;
      const testIdNum = parseInt(testId, 10);

      if (USE_MOCK_DATA) {
        const allTests = getAllTests();
        const test = allTests[testIdNum];
        if (!test) {
          return res.status(404).json({ error: "Test not found" });
        }
        // Strip isCorrect from options before sending to client
        const safeTest = {
          ...test,
          questions: test.questions.map(q => ({
            ...q,
            options: q.options.map(({ isCorrect, ...opt }) => opt)
          }))
        };
        return res.json(safeTest);
      }

      const response = await fetchFromAdmin(`/tests/${testId}`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Test not found" });
      }
      const test = await response.json();
      res.json(test);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });

  // POST /api/tests/:testId/submit - Submit test answers and calculate score
  app.post("/api/tests/:testId/submit", async (req, res) => {
    try {
      const { testId } = req.params;
      const testIdNum = parseInt(testId, 10);
      const { answers, courseId } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Answers are required" });
      }

      if (USE_MOCK_DATA) {
        const allTests = getAllTests();
        const test = allTests[testIdNum];
        if (!test) {
          return res.status(404).json({ error: "Test not found" });
        }

        // Calculate score
        let correctCount = 0;
        const totalQuestions = test.questions.length;

        for (const answer of answers) {
          const question = test.questions.find(q => q.id === answer.questionId);
          if (question) {
            const correctOption = question.options.find(o => o.isCorrect);
            if (correctOption && correctOption.id === answer.selectedOptionId) {
              correctCount++;
            }
          }
        }

        const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
        const passed = scorePercentage >= test.passingPercentage;

        return res.json({
          success: true,
          result: {
            testId: testIdNum,
            courseId: courseId || test.courseId,
            totalQuestions,
            correctAnswers: correctCount,
            scorePercentage,
            passingPercentage: test.passingPercentage,
            passed,
            attemptedAt: new Date().toISOString()
          }
        });
      }

      // For real backend, forward the submission
      const response = await fetchFromAdmin(`/tests/${testId}/submit`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to submit test" });
      }
      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error("Error submitting test:", error);
      res.status(500).json({ error: "Failed to submit test" });
    }
  });

  // ============ LAB ROUTES ============

  // GET /api/courses/:courseId/labs - Fetch labs for a course
  app.get("/api/courses/:courseId/labs", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      // Labs are currently only in mock data
      const labs = getCourseLabs(courseIdNum);
      res.json(labs);
    } catch (error) {
      console.error("Error fetching labs:", error);
      res.status(500).json({ error: "Failed to fetch labs" });
    }
  });

  // GET /api/labs/:labId - Fetch single lab
  app.get("/api/labs/:labId", async (req, res) => {
    try {
      const { labId } = req.params;
      const labIdNum = parseInt(labId, 10);

      const lab = getLab(labIdNum);
      if (!lab) {
        return res.status(404).json({ error: "Lab not found" });
      }
      res.json(lab);
    } catch (error) {
      console.error("Error fetching lab:", error);
      res.status(500).json({ error: "Failed to fetch lab" });
    }
  });

  // GET /api/lessons/all - Fetch all lessons as a map by ID
  app.get("/api/lessons/all", async (req, res) => {
    try {
      const allLessons = getAllLessons();
      res.json(allLessons);
    } catch (error) {
      console.error("Error fetching all lessons:", error);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  // ============ MITHRA AI TUTOR ROUTES ============
  registerMithraRoutes(app);

  return httpServer;
}
