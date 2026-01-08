import type { Express } from "express";
import { createServer, type Server } from "http";
import { mockCourses, mockModules, mockLessons, mockAINotes, getAllLessons, mockProjects, getAllProjects, mockTests, getAllTests } from "./mockData";
import { mockLabs, getCourseLabs, getLab, getAllLabs } from "./mockLabs";
import { authRouter } from "./auth";
import { registerUshaRoutes } from "./usha";
import { creditsRouter } from "./credits";
import { razorpayRouter } from "./razorpayPayments";
import { notificationsRouter } from "./notifications";
import { registerMotivationRoutes } from "./motivationRoutes";
import { sendGenericEmail } from "./resend";
import { db } from "./db";
import { userProfiles, marksheets, marksheetVerifications } from "@shared/schema";
import { eq, like, or } from "drizzle-orm";
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
  
  // Credits and enrollments routes
  app.use("/api/user/credits", creditsRouter);
  app.use("/api", creditsRouter);
  
  // Razorpay payment routes
  app.use("/api/payments", razorpayRouter);
  
  // Notifications routes
  app.use("/api/notifications", notificationsRouter);

  // ============ PUBLIC CONFIG ROUTES ============

  // GET /api/config/public - Serve public configuration values
  app.get("/api/config/public", (req, res) => {
    res.json({
      supportEmail: process.env.SUPPORT_EMAIL || "support@ourshiksha.com",
      privacyEmail: process.env.PRIVACY_EMAIL || "privacy@ourshiksha.com",
      legalEmail: process.env.LEGAL_EMAIL || "legal@ourshiksha.com",
      companyLocation: process.env.COMPANY_LOCATION || "Chennai, Tamil Nadu, India",
      companyName: "OurShiksha",
    });
  });

  // POST /api/contact - Send contact form email
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      const supportEmail = process.env.SUPPORT_EMAIL || "support@ourshiksha.com";
      
      // Create email HTML
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This email was sent from the OurShiksha contact form.
          </p>
        </div>
      `;

      const emailSent = await sendGenericEmail(
        supportEmail,
        `[Contact Form] ${subject}`,
        html
      );

      if (emailSent) {
        res.json({ success: true, message: "Your message has been sent successfully!" });
      } else {
        res.status(500).json({ error: "Failed to send message. Please try again later." });
      }
    } catch (error) {
      console.error("Error sending contact form:", error);
      res.status(500).json({ error: "Failed to send message. Please try again later." });
    }
  });

  // ============ USERNAME CHECK ROUTE ============

  // GET /api/username/check/:username - Check username availability and get suggestions
  app.get("/api/username/check/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const currentUserId = req.query.currentUserId as string | undefined;

      // Validate username format
      const usernameRegex = /^[a-z0-9_-]+$/;
      if (!usernameRegex.test(username) || username.length < 3 || username.length > 30) {
        return res.json({
          available: false,
          valid: false,
          message: "Username must be 3-30 characters, lowercase letters, numbers, hyphens, and underscores only",
          suggestions: []
        });
      }

      // Check if username exists in database
      const existing = await db.select({ id: userProfiles.id, userId: userProfiles.userId })
        .from(userProfiles)
        .where(eq(userProfiles.username, username))
        .limit(1);

      // If current user owns this username, it's available for them
      if (existing.length > 0 && currentUserId && existing[0].userId === currentUserId) {
        return res.json({
          available: true,
          valid: true,
          message: "This is your current username",
          suggestions: []
        });
      }

      const isAvailable = existing.length === 0;

      if (isAvailable) {
        return res.json({
          available: true,
          valid: true,
          message: "Username is available",
          suggestions: []
        });
      }

      // Generate suggestions when username is taken
      const baseName = username.replace(/[0-9_-]+$/, ""); // Remove trailing numbers/special chars
      const suggestions: string[] = [];
      const candidateSuffixes = [
        Math.floor(Math.random() * 900) + 100,
        new Date().getFullYear() % 100,
        Math.floor(Math.random() * 90) + 10,
        "_dev",
        "_pro",
        Math.floor(Math.random() * 9000) + 1000,
      ];

      for (const suffix of candidateSuffixes) {
        const candidate = `${baseName}${suffix}`;
        if (candidate.length <= 30) {
          // Check if candidate is available
          const candidateExists = await db.select({ id: userProfiles.id })
            .from(userProfiles)
            .where(eq(userProfiles.username, candidate))
            .limit(1);
          
          if (candidateExists.length === 0) {
            suggestions.push(candidate);
            if (suggestions.length >= 4) break;
          }
        }
      }

      return res.json({
        available: false,
        valid: true,
        message: "Username is already taken",
        suggestions
      });
    } catch (error) {
      console.error("Error checking username:", error);
      res.status(500).json({ error: "Failed to check username availability" });
    }
  });
  
  // GET /api/courses - Fetch only published and active courses
  // SHISHYA RULE: WHERE status = 'published' AND is_active = true
  app.get("/api/courses", async (req, res) => {
    try {
      if (USE_MOCK_DATA) {
        // Return mock published courses (mock data doesn't have is_active, assume true)
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
      // Filter to only show published AND active courses
      const publishedCourses = Array.isArray(courses) 
        ? courses.filter((c: any) => c.status === "published" && c.isActive !== false)
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
  // SHISHYA RULE: WHERE status = 'published' AND is_active = true
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
      // Only return if published AND active
      if (course.status !== "published" || course.isActive === false) {
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
        console.log(`[AISiksha] Modules API failed, using mock data for course ${courseId}`);
        const modules = mockModules[courseIdNum] || [];
        return res.json(modules);
      }
      const data = await response.json();
      const modules = data.modules || data;
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      const courseIdNum = parseInt(req.params.courseId, 10);
      const modules = mockModules[courseIdNum] || [];
      return res.json(modules);
    }
  });

  // GET /api/courses/:courseId/modules-with-lessons - Fetch modules with their lessons
  app.get("/api/courses/:courseId/modules-with-lessons", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      // Helper to return mock data
      const getMockModulesWithLessons = () => {
        const modules = mockModules[courseIdNum] || [];
        return modules.map(module => ({
          ...module,
          lessons: mockLessons[module.id] || [],
        }));
      };

      if (USE_MOCK_DATA) {
        return res.json(getMockModulesWithLessons());
      }
      
      // First fetch modules
      const modulesResponse = await fetchFromAdmin(`/courses/${courseId}/modules`);
      if (!modulesResponse.ok) {
        console.log(`[AISiksha] Modules-with-lessons API failed, using mock data for course ${courseId}`);
        return res.json(getMockModulesWithLessons());
      }
      const modulesData = await modulesResponse.json();
      const modules = modulesData.modules || modulesData;
      
      // Then fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        (modules || []).map(async (module: any) => {
          try {
            const lessonsResponse = await fetchFromAdmin(`/modules/${module.id}/lessons`);
            if (!lessonsResponse.ok) {
              return { ...module, lessons: mockLessons[module.id] || [] };
            }
            const lessonsData = await lessonsResponse.json();
            const lessons = lessonsData.lessons || lessonsData;
            return { ...module, lessons: lessons || [] };
          } catch {
            return { ...module, lessons: mockLessons[module.id] || [] };
          }
        })
      );
      
      res.json(modulesWithLessons);
    } catch (error) {
      console.error("Error fetching modules with lessons:", error);
      const courseIdNum = parseInt(req.params.courseId, 10);
      const modules = mockModules[courseIdNum] || [];
      const modulesWithLessons = modules.map(module => ({
        ...module,
        lessons: mockLessons[module.id] || [],
      }));
      return res.json(modulesWithLessons);
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
        console.log(`[AISiksha] Lessons API failed, using mock data for module ${moduleId}`);
        const lessons = mockLessons[moduleIdNum] || [];
        return res.json(lessons);
      }
      const data = await response.json();
      const lessons = data.lessons || data;
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      const moduleIdNum = parseInt(req.params.moduleId, 10);
      const lessons = mockLessons[moduleIdNum] || [];
      return res.json(lessons);
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
        console.log(`[AISiksha] Lesson API failed, using mock data for lesson ${lessonId}`);
        const allLessons = getAllLessons();
        const lesson = allLessons[lessonIdNum];
        if (!lesson) {
          return res.status(404).json({ error: "Lesson not found" });
        }
        return res.json(lesson);
      }
      const data = await response.json();
      const lesson = data.lesson || data;
      res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      const lessonIdNum = parseInt(req.params.lessonId, 10);
      const allLessons = getAllLessons();
      const lesson = allLessons[lessonIdNum];
      if (lesson) {
        return res.json(lesson);
      }
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
        console.log(`[AISiksha] Projects API failed, using mock data for course ${courseId}`);
        const projects = mockProjects[courseIdNum] || [];
        return res.json(projects);
      }
      const data = await response.json();
      const projects = data.projects || data;
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      const courseIdNum = parseInt(req.params.courseId, 10);
      const projects = mockProjects[courseIdNum] || [];
      return res.json(projects);
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
        console.log(`[AISiksha] Project API failed, using mock data for project ${projectId}`);
        const allProjects = getAllProjects();
        const project = allProjects[projectIdNum];
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
        return res.json(project);
      }
      const data = await response.json();
      const project = data.project || data;
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      const projectIdNum = parseInt(req.params.projectId, 10);
      const allProjects = getAllProjects();
      const project = allProjects[projectIdNum];
      if (project) {
        return res.json(project);
      }
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

      // Helper to get mock tests summary
      const getMockTestsSummary = () => {
        const tests = mockTests[courseIdNum] || [];
        return tests.map(({ questions, ...rest }) => rest);
      };

      if (USE_MOCK_DATA) {
        return res.json(getMockTestsSummary());
      }

      const response = await fetchFromAdmin(`/courses/${courseId}/tests`);
      if (!response.ok) {
        console.log(`[AISiksha] Tests API failed, using mock data for course ${courseId}`);
        return res.json(getMockTestsSummary());
      }
      const data = await response.json();
      const tests = data.tests || data;
      res.json(tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      const courseIdNum = parseInt(req.params.courseId, 10);
      const tests = mockTests[courseIdNum] || [];
      const testsSummary = tests.map(({ questions, ...rest }) => rest);
      return res.json(testsSummary);
    }
  });

  // GET /api/tests/:testId - Fetch single test (without correct answers exposed)
  app.get("/api/tests/:testId", async (req, res) => {
    try {
      const { testId } = req.params;
      const testIdNum = parseInt(testId, 10);

      // Helper to get safe mock test
      const getSafeMockTest = () => {
        const allTests = getAllTests();
        const test = allTests[testIdNum];
        if (!test) return null;
        return {
          ...test,
          questions: test.questions.map(q => ({
            ...q,
            options: q.options.map(({ isCorrect, ...opt }) => opt)
          }))
        };
      };

      if (USE_MOCK_DATA) {
        const safeTest = getSafeMockTest();
        if (!safeTest) {
          return res.status(404).json({ error: "Test not found" });
        }
        return res.json(safeTest);
      }

      const response = await fetchFromAdmin(`/tests/${testId}`);
      if (!response.ok) {
        console.log(`[AISiksha] Test API failed, using mock data for test ${testId}`);
        const safeTest = getSafeMockTest();
        if (!safeTest) {
          return res.status(404).json({ error: "Test not found" });
        }
        return res.json(safeTest);
      }
      const data = await response.json();
      const test = data.test || data;
      res.json(test);
    } catch (error) {
      console.error("Error fetching test:", error);
      const testIdNum = parseInt(req.params.testId, 10);
      const allTests = getAllTests();
      const test = allTests[testIdNum];
      if (test) {
        const safeTest = {
          ...test,
          questions: test.questions.map(q => ({
            ...q,
            options: q.options.map(({ isCorrect, ...opt }) => opt)
          }))
        };
        return res.json(safeTest);
      }
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

  // ============ USHA AI TUTOR ROUTES ============
  registerUshaRoutes(app);

  // ============ AI MOTIVATION ENGINE ROUTES ============
  registerMotivationRoutes(app);

  // ============ MARKSHEET ROUTES ============
  
  // Import marksheet schema
  const { marksheets, marksheetVerifications } = await import("@shared/schema");
  const crypto = await import("crypto");

  // Helper functions for marksheet
  function generateMarksheetId(userId: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const hash = userId.substring(0, 8).toUpperCase();
    return `MS-${year}-${hash}`;
  }

  function generateVerificationCode(): string {
    const crypto = require("crypto");
    return crypto.randomBytes(8).toString("hex").toUpperCase();
  }

  function calculateGrade(score: number): string {
    if (score >= 90) return "O";
    if (score >= 80) return "A+";
    if (score >= 70) return "A";
    if (score >= 60) return "B+";
    if (score >= 50) return "B";
    if (score >= 40) return "C";
    return "F";
  }

  function calculateGradePoints(grade: string): number {
    const gradePointMap: Record<string, number> = {
      "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "F": 0
    };
    return gradePointMap[grade] || 0;
  }

  function getClassification(percentage: number): string {
    if (percentage >= 75) return "Distinction";
    if (percentage >= 60) return "First Class";
    if (percentage >= 50) return "Second Class";
    if (percentage >= 40) return "Pass";
    return "Below Pass";
  }

  function calculateRewardCoins(classification: string, cgpa: number): number {
    const baseCoins: Record<string, number> = {
      "Distinction": 500,
      "First Class": 300,
      "Second Class": 150,
      "Pass": 50,
      "Below Pass": 0
    };
    return Math.floor((baseCoins[classification] || 0) * (cgpa / 10));
  }

  // Import auth middleware
  const { requireAuth } = await import("./auth");

  // POST /api/marksheet/generate - Generate a marksheet for authenticated user
  app.post("/api/marksheet/generate", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { courseData, studentName, studentEmail } = req.body;
      
      if (!courseData || !Array.isArray(courseData)) {
        return res.status(400).json({ error: "Invalid course data" });
      }

      // Check if marksheet already exists for this user
      const existingMarksheet = await db.select().from(marksheets).where(eq(marksheets.userId, userId)).limit(1);
      
      if (existingMarksheet.length > 0) {
        // Return existing marksheet
        return res.json({
          success: true,
          marksheet: existingMarksheet[0],
          message: "Marksheet already exists"
        });
      }

      // Calculate statistics
      const completedCourses = courseData.filter((c: any) => c.status === "Pass");
      const totalCredits = completedCourses.reduce((sum: number, c: any) => sum + (c.credits || 0), 0);
      const totalMarks = courseData.length * 100;
      const obtainedMarks = courseData.reduce((sum: number, c: any) => sum + (c.testScore || 0), 0);
      const validScores = courseData.filter((c: any) => c.testScore !== null);
      const percentage = validScores.length > 0 
        ? Math.round(obtainedMarks / validScores.length)
        : 0;
      
      const totalGradePoints = completedCourses.reduce((sum: number, c: any) => 
        sum + calculateGradePoints(c.grade), 0);
      const cgpa = completedCourses.length > 0 
        ? (totalGradePoints / completedCourses.length).toFixed(2) 
        : "0.00";

      const overallGrade = calculateGrade(percentage);
      const classification = getClassification(percentage);
      const result = percentage >= 40 ? "Pass" : percentage > 0 ? "Fail" : "Pending";
      const rewardCoins = calculateRewardCoins(classification, parseFloat(cgpa));
      const scholarshipEligible = classification === "Distinction" || parseFloat(cgpa) >= 8.5;

      const marksheetId = generateMarksheetId(userId);
      const verificationCode = generateVerificationCode();

      // Get current academic year
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const academicYear = month >= 6 ? `${year}-${(year + 1) % 100}` : `${year - 1}-${year % 100}`;

      // Insert marksheet
      const [newMarksheet] = await db.insert(marksheets).values({
        marksheetId,
        userId,
        studentName: studentName || "Student",
        studentEmail: studentEmail || "",
        programName: "Full Stack Development",
        academicYear,
        courseData: JSON.stringify(courseData),
        totalMarks,
        obtainedMarks,
        percentage,
        grade: overallGrade,
        cgpa,
        result,
        classification,
        totalCredits,
        coursesCompleted: completedCourses.length,
        rewardCoins,
        scholarshipEligible,
        verificationCode,
        signedBy: "Controller of Examinations",
        aiVerifierName: "Acharya Usha",
        status: "active"
      }).returning();

      res.json({
        success: true,
        marksheet: newMarksheet,
        message: "Marksheet generated successfully"
      });

    } catch (error) {
      console.error("Error generating marksheet:", error);
      res.status(500).json({ error: "Failed to generate marksheet" });
    }
  });

  // GET /api/marksheet - Get current user's marksheet
  app.get("/api/marksheet", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const [marksheet] = await db.select().from(marksheets).where(eq(marksheets.userId, userId)).limit(1);
      
      if (!marksheet) {
        return res.status(404).json({ error: "Marksheet not found" });
      }

      res.json(marksheet);
    } catch (error) {
      console.error("Error fetching marksheet:", error);
      res.status(500).json({ error: "Failed to fetch marksheet" });
    }
  });

  // GET /api/marksheet/verify/:code - Public verification endpoint
  app.get("/api/marksheet/verify/:code", async (req, res) => {
    try {
      const { code } = req.params;
      
      const [marksheet] = await db.select().from(marksheets)
        .where(eq(marksheets.verificationCode, code))
        .limit(1);
      
      if (!marksheet) {
        return res.status(404).json({ 
          valid: false, 
          error: "Marksheet not found or invalid verification code" 
        });
      }

      // Check if marksheet is still valid
      if (marksheet.status === "revoked") {
        return res.status(400).json({ 
          valid: false, 
          error: "This marksheet has been revoked" 
        });
      }

      if (marksheet.expiresAt && new Date(marksheet.expiresAt) < new Date()) {
        return res.status(400).json({ 
          valid: false, 
          error: "This marksheet has expired" 
        });
      }

      // Log verification
      try {
        await db.insert(marksheetVerifications).values({
          marksheetId: marksheet.id,
          verifierIp: req.ip || null,
          verifierUserAgent: req.headers["user-agent"] || null,
        });
      } catch (logError) {
        console.error("Error logging verification:", logError);
      }

      // Return public marksheet data (excluding sensitive info)
      res.json({
        valid: true,
        marksheet: {
          marksheetId: marksheet.marksheetId,
          studentName: marksheet.studentName,
          programName: marksheet.programName,
          academicYear: marksheet.academicYear,
          totalCredits: marksheet.totalCredits,
          coursesCompleted: marksheet.coursesCompleted,
          percentage: marksheet.percentage,
          grade: marksheet.grade,
          cgpa: marksheet.cgpa,
          result: marksheet.result,
          classification: marksheet.classification,
          signedBy: marksheet.signedBy,
          aiVerifierName: marksheet.aiVerifierName,
          issuedAt: marksheet.issuedAt,
          status: marksheet.status
        }
      });
    } catch (error) {
      console.error("Error verifying marksheet:", error);
      res.status(500).json({ error: "Failed to verify marksheet" });
    }
  });

  // GET /api/marksheet/by-id/:marksheetId - Get marksheet by marksheet ID (public)
  app.get("/api/marksheet/by-id/:marksheetId", async (req, res) => {
    try {
      const { marksheetId: msId } = req.params;
      
      const [marksheet] = await db.select().from(marksheets)
        .where(eq(marksheets.marksheetId, msId))
        .limit(1);
      
      if (!marksheet) {
        return res.status(404).json({ error: "Marksheet not found" });
      }

      // Return public data only
      res.json({
        marksheetId: marksheet.marksheetId,
        studentName: marksheet.studentName,
        programName: marksheet.programName,
        academicYear: marksheet.academicYear,
        totalCredits: marksheet.totalCredits,
        coursesCompleted: marksheet.coursesCompleted,
        percentage: marksheet.percentage,
        grade: marksheet.grade,
        cgpa: marksheet.cgpa,
        result: marksheet.result,
        classification: marksheet.classification,
        courseData: JSON.parse(marksheet.courseData || "[]"),
        signedBy: marksheet.signedBy,
        aiVerifierName: marksheet.aiVerifierName,
        issuedAt: marksheet.issuedAt,
        status: marksheet.status,
        verificationCode: marksheet.verificationCode
      });
    } catch (error) {
      console.error("Error fetching marksheet by ID:", error);
      res.status(500).json({ error: "Failed to fetch marksheet" });
    }
  });

  return httpServer;
}
