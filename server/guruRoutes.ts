import { Router, Request, Response } from "express";
import { db } from "./db";
import {
  courses, modules, lessons, tests, projects, labs,
  shishyaUsers, shishyaCourseEnrollments, shishyaUserCredits,
  shishyaUserProfiles, shishyaUserProgress, shishyaUserTestAttempts,
  shishyaUserProjectSubmissions, shishyaUserCertificates, shishyaCreditTransactions,
} from "@shared/schema";
import { eq, count, sql, desc, and, ilike, asc } from "drizzle-orm";
import { requireGuruAuth, GuruAuthenticatedRequest } from "./guruAuth";
import * as zohoService from "./zohoService";

export const guruRouter = Router();

guruRouter.use(requireGuruAuth as any);

guruRouter.get("/dashboard/stats", async (req: Request, res: Response) => {
  try {
    const [courseCount] = await db.select({ count: count() }).from(courses);
    const [publishedCount] = await db.select({ count: count() }).from(courses).where(eq(courses.status, "published"));
    const [draftCount] = await db.select({ count: count() }).from(courses).where(eq(courses.status, "draft"));
    const [moduleCount] = await db.select({ count: count() }).from(modules);
    const [lessonCount] = await db.select({ count: count() }).from(lessons);
    const [testCount] = await db.select({ count: count() }).from(tests);
    const [projectCount] = await db.select({ count: count() }).from(projects);
    const [labCount] = await db.select({ count: count() }).from(labs);
    const [studentCount] = await db.select({ count: count() }).from(shishyaUsers);
    const [enrollmentCount] = await db.select({ count: count() }).from(shishyaCourseEnrollments);

    const [creditsResult] = await db.select({
      total: sql<number>`COALESCE(SUM(${shishyaUserCredits.totalEarned}), 0)`
    }).from(shishyaUserCredits);

    res.json({
      totalCourses: courseCount.count,
      publishedCourses: publishedCount.count,
      draftCourses: draftCount.count,
      totalModules: moduleCount.count,
      totalLessons: lessonCount.count,
      totalTests: testCount.count,
      totalProjects: projectCount.count,
      totalLabs: labCount.count,
      totalStudents: studentCount.count,
      activeEnrollments: enrollmentCount.count,
      totalCreditsDistributed: creditsResult.total || 0,
    });
  } catch (error) {
    console.error("[Guru] Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

guruRouter.get("/dashboard/recent-courses", async (req: Request, res: Response) => {
  try {
    const recentCourses = await db.select().from(courses).orderBy(desc(courses.createdAt)).limit(6);
    res.json(recentCourses);
  } catch (error) {
    console.error("[Guru] Recent courses error:", error);
    res.status(500).json({ error: "Failed to fetch recent courses" });
  }
});

// ============ COURSE CRUD ============

guruRouter.get("/courses", async (req: Request, res: Response) => {
  try {
    const allCourses = await db.select().from(courses).orderBy(desc(courses.createdAt));
    res.json(allCourses);
  } catch (error) {
    console.error("[Guru] List courses error:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

guruRouter.get("/courses/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    console.error("[Guru] Get course error:", error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

guruRouter.post("/courses", async (req: Request, res: Response) => {
  try {
    const { title, description, shortDescription, level, duration, skills, isFree, creditCost, price, testRequired, projectRequired } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    const [newCourse] = await db.insert(courses).values({
      title, description, shortDescription, level: level || "beginner", duration, skills, isFree: isFree || false,
      creditCost: creditCost || 0, price: price || 0, testRequired: testRequired || false, projectRequired: projectRequired || false,
      status: "draft", isActive: false
    }).returning();
    res.json(newCourse);
  } catch (error) {
    console.error("[Guru] Create course error:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
});

guruRouter.put("/courses/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    delete updates.id;
    delete updates.createdAt;
    updates.updatedAt = new Date();
    const [updated] = await db.update(courses).set(updates).where(eq(courses.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Course not found" });
    res.json(updated);
  } catch (error) {
    console.error("[Guru] Update course error:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
});

guruRouter.post("/courses/:id/publish", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(courses).set({ status: "published", isActive: true, publishedAt: new Date(), updatedAt: new Date() }).where(eq(courses.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Course not found" });
    res.json(updated);
  } catch (error) {
    console.error("[Guru] Publish course error:", error);
    res.status(500).json({ error: "Failed to publish course" });
  }
});

guruRouter.post("/courses/:id/unpublish", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(courses).set({ status: "draft", isActive: false, updatedAt: new Date() }).where(eq(courses.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Course not found" });
    res.json(updated);
  } catch (error) {
    console.error("[Guru] Unpublish course error:", error);
    res.status(500).json({ error: "Failed to unpublish course" });
  }
});

guruRouter.delete("/courses/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const courseModules = await db.select().from(modules).where(eq(modules.courseId, id));
    for (const mod of courseModules) {
      await db.delete(lessons).where(eq(lessons.moduleId, mod.id));
    }
    await db.delete(modules).where(eq(modules.courseId, id));
    await db.delete(labs).where(eq(labs.courseId, id));
    await db.delete(tests).where(eq(tests.courseId, id));
    await db.delete(projects).where(eq(projects.courseId, id));
    await db.delete(courses).where(eq(courses.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("[Guru] Delete course error:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
});

// ============ MODULE CRUD ============

guruRouter.get("/courses/:courseId/modules", async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const mods = await db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(modules.orderIndex);
    const result = await Promise.all(mods.map(async (mod) => {
      const modLessons = await db.select().from(lessons).where(eq(lessons.moduleId, mod.id)).orderBy(lessons.orderIndex);
      return { ...mod, lessons: modLessons };
    }));
    res.json(result);
  } catch (error) {
    console.error("[Guru] Get modules error:", error);
    res.status(500).json({ error: "Failed to fetch modules" });
  }
});

guruRouter.post("/modules", async (req: Request, res: Response) => {
  try {
    const { courseId, title, description, orderIndex } = req.body;
    if (!courseId || !title) return res.status(400).json({ error: "Course ID and title are required" });
    const [newModule] = await db.insert(modules).values({ courseId, title, description, orderIndex: orderIndex || 0 }).returning();
    res.json(newModule);
  } catch (error) {
    console.error("[Guru] Create module error:", error);
    res.status(500).json({ error: "Failed to create module" });
  }
});

guruRouter.put("/modules/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, orderIndex } = req.body;
    const [updated] = await db.update(modules).set({ title, description, orderIndex }).where(eq(modules.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Module not found" });
    res.json(updated);
  } catch (error) {
    console.error("[Guru] Update module error:", error);
    res.status(500).json({ error: "Failed to update module" });
  }
});

guruRouter.delete("/modules/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(lessons).where(eq(lessons.moduleId, id));
    await db.delete(modules).where(eq(modules.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("[Guru] Delete module error:", error);
    res.status(500).json({ error: "Failed to delete module" });
  }
});

// ============ LESSON CRUD ============

guruRouter.post("/lessons", async (req: Request, res: Response) => {
  try {
    const { moduleId, courseId, title, content, videoUrl, durationMinutes, orderIndex, isPreview } = req.body;
    if (!moduleId || !courseId || !title) return res.status(400).json({ error: "Module ID, Course ID, and title are required" });
    const [newLesson] = await db.insert(lessons).values({ moduleId, courseId, title, content, videoUrl, durationMinutes, orderIndex: orderIndex || 0, isPreview: isPreview || false }).returning();
    res.json(newLesson);
  } catch (error) {
    console.error("[Guru] Create lesson error:", error);
    res.status(500).json({ error: "Failed to create lesson" });
  }
});

guruRouter.put("/lessons/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, content, videoUrl, durationMinutes, orderIndex, isPreview } = req.body;
    const [updated] = await db.update(lessons).set({ title, content, videoUrl, durationMinutes, orderIndex, isPreview }).where(eq(lessons.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Lesson not found" });
    res.json(updated);
  } catch (error) {
    console.error("[Guru] Update lesson error:", error);
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

guruRouter.delete("/lessons/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(lessons).where(eq(lessons.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("[Guru] Delete lesson error:", error);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
});

// ============ STUDENT MANAGEMENT ============

guruRouter.get("/students", async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const allStudents = await db.select({
      id: shishyaUsers.id,
      email: shishyaUsers.email,
      emailVerified: shishyaUsers.emailVerified,
      createdAt: shishyaUsers.createdAt,
    }).from(shishyaUsers).orderBy(desc(shishyaUsers.createdAt));

    const profiles = await db.select().from(shishyaUserProfiles);
    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    const credits = await db.select().from(shishyaUserCredits);
    const creditMap = new Map(credits.map(c => [c.userId, c]));

    const enrollments = await db.select().from(shishyaCourseEnrollments);

    const result = allStudents.map(s => ({
      ...s,
      profile: profileMap.get(s.id) || null,
      credits: creditMap.get(s.id) || null,
      enrollmentCount: enrollments.filter(e => e.userId === s.id).length,
    }));

    if (search) {
      const lower = search.toLowerCase();
      return res.json(result.filter(s =>
        s.email.toLowerCase().includes(lower) ||
        s.profile?.fullName?.toLowerCase().includes(lower) ||
        s.profile?.username?.toLowerCase().includes(lower)
      ));
    }

    res.json(result);
  } catch (error) {
    console.error("[Guru] List students error:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

guruRouter.get("/students/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const [student] = await db.select().from(shishyaUsers).where(eq(shishyaUsers.id, userId));
    if (!student) return res.status(404).json({ error: "Student not found" });

    const [profile] = await db.select().from(shishyaUserProfiles).where(eq(shishyaUserProfiles.userId, userId));
    const [creditWallet] = await db.select().from(shishyaUserCredits).where(eq(shishyaUserCredits.userId, userId));
    const enrollments = await db.select().from(shishyaCourseEnrollments).where(eq(shishyaCourseEnrollments.userId, userId));
    const progress = await db.select().from(shishyaUserProgress).where(eq(shishyaUserProgress.userId, userId));
    const testAttempts = await db.select().from(shishyaUserTestAttempts).where(eq(shishyaUserTestAttempts.userId, userId));
    const projectSubs = await db.select().from(shishyaUserProjectSubmissions).where(eq(shishyaUserProjectSubmissions.userId, userId));
    const certs = await db.select().from(shishyaUserCertificates).where(eq(shishyaUserCertificates.userId, userId));

    res.json({
      ...student,
      profile: profile || null,
      credits: creditWallet || null,
      enrollments,
      progressCount: progress.length,
      testAttempts,
      projectSubmissions: projectSubs,
      certificates: certs,
    });
  } catch (error) {
    console.error("[Guru] Get student error:", error);
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// ============ CREDIT MANAGEMENT ============

guruRouter.get("/credits", async (req: Request, res: Response) => {
  try {
    const wallets = await db.select().from(shishyaUserCredits);
    const profiles = await db.select().from(shishyaUserProfiles);
    const profileMap = new Map(profiles.map(p => [p.userId, p]));
    const users = await db.select({ id: shishyaUsers.id, email: shishyaUsers.email }).from(shishyaUsers);
    const userMap = new Map(users.map(u => [u.id, u]));

    const result = wallets.map(w => ({
      ...w,
      profile: profileMap.get(w.userId) || null,
      email: userMap.get(w.userId)?.email || "",
    }));
    res.json(result);
  } catch (error) {
    console.error("[Guru] List credits error:", error);
    res.status(500).json({ error: "Failed to fetch credits" });
  }
});

guruRouter.get("/credits/transactions", async (req: Request, res: Response) => {
  try {
    const txns = await db.select().from(shishyaCreditTransactions).orderBy(desc(shishyaCreditTransactions.createdAt)).limit(100);
    res.json(txns);
  } catch (error) {
    console.error("[Guru] List credit transactions error:", error);
    res.status(500).json({ error: "Failed to fetch credit transactions" });
  }
});

guruRouter.post("/credits/grant", async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: "User ID and amount are required" });

    const [wallet] = await db.select().from(shishyaUserCredits).where(eq(shishyaUserCredits.userId, userId));
    if (!wallet) return res.status(404).json({ error: "User credit wallet not found" });

    const newBalance = wallet.balance + amount;
    await db.update(shishyaUserCredits).set({
      balance: newBalance,
      totalEarned: wallet.totalEarned + amount,
      updatedAt: new Date(),
    }).where(eq(shishyaUserCredits.userId, userId));

    await db.insert(shishyaCreditTransactions).values({
      userId, amount, type: "credit", reason: reason || "admin_grant",
      description: `Admin granted ${amount} credits`,
      balanceAfter: newBalance,
    });

    res.json({ success: true, newBalance });
  } catch (error) {
    console.error("[Guru] Grant credits error:", error);
    res.status(500).json({ error: "Failed to grant credits" });
  }
});

guruRouter.post("/credits/deduct", async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: "User ID and amount are required" });

    const [wallet] = await db.select().from(shishyaUserCredits).where(eq(shishyaUserCredits.userId, userId));
    if (!wallet) return res.status(404).json({ error: "User credit wallet not found" });

    const newBalance = Math.max(0, wallet.balance - amount);
    await db.update(shishyaUserCredits).set({
      balance: newBalance,
      totalSpent: wallet.totalSpent + amount,
      updatedAt: new Date(),
    }).where(eq(shishyaUserCredits.userId, userId));

    await db.insert(shishyaCreditTransactions).values({
      userId, amount: -amount, type: "debit", reason: reason || "admin_deduct",
      description: `Admin deducted ${amount} credits`,
      balanceAfter: newBalance,
    });

    res.json({ success: true, newBalance });
  } catch (error) {
    console.error("[Guru] Deduct credits error:", error);
    res.status(500).json({ error: "Failed to deduct credits" });
  }
});

// ============ TEST CRUD ============

guruRouter.get("/tests", async (req: Request, res: Response) => {
  try {
    const allTests = await db.select({
      id: tests.id, courseId: tests.courseId, title: tests.title, description: tests.description,
      durationMinutes: tests.durationMinutes, passingPercentage: tests.passingPercentage,
      maxAttempts: tests.maxAttempts, shuffleQuestions: tests.shuffleQuestions,
      showCorrectAnswers: tests.showCorrectAnswers, createdAt: tests.createdAt,
    }).from(tests).orderBy(desc(tests.createdAt));

    const allCourses = await db.select({ id: courses.id, title: courses.title }).from(courses);
    const courseMap = new Map(allCourses.map(c => [c.id, c.title]));

    const result = allTests.map(t => ({ ...t, courseTitle: courseMap.get(t.courseId) || "Unknown" }));
    res.json(result);
  } catch (error) {
    console.error("[Guru] List tests error:", error);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

guruRouter.get("/tests/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json(test);
  } catch (error) {
    console.error("[Guru] Get test error:", error);
    res.status(500).json({ error: "Failed to fetch test" });
  }
});

guruRouter.post("/tests", async (req: Request, res: Response) => {
  try {
    const { courseId, title, description, durationMinutes, passingPercentage, questions, maxAttempts, shuffleQuestions, showCorrectAnswers } = req.body;
    if (!courseId || !title || !questions) return res.status(400).json({ error: "Course ID, title, and questions are required" });
    const [newTest] = await db.insert(tests).values({
      courseId, title, description, durationMinutes: durationMinutes || 30,
      passingPercentage: passingPercentage || 60,
      questions: typeof questions === "string" ? questions : JSON.stringify(questions),
      maxAttempts, shuffleQuestions: shuffleQuestions || false, showCorrectAnswers: showCorrectAnswers || false,
    }).returning();
    res.json(newTest);
  } catch (error) {
    console.error("[Guru] Create test error:", error);
    res.status(500).json({ error: "Failed to create test" });
  }
});

guruRouter.put("/tests/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, durationMinutes, passingPercentage, questions, maxAttempts, shuffleQuestions, showCorrectAnswers } = req.body;
    const updateData: any = { title, description, durationMinutes, passingPercentage, maxAttempts, shuffleQuestions, showCorrectAnswers };
    if (questions) updateData.questions = typeof questions === "string" ? questions : JSON.stringify(questions);
    const [updated] = await db.update(tests).set(updateData).where(eq(tests.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Test not found" });
    res.json(updated);
  } catch (error) {
    console.error("[Guru] Update test error:", error);
    res.status(500).json({ error: "Failed to update test" });
  }
});

guruRouter.delete("/tests/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tests).where(eq(tests.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("[Guru] Delete test error:", error);
    res.status(500).json({ error: "Failed to delete test" });
  }
});

// ============ LAB CRUD ============

guruRouter.get("/labs", async (req: Request, res: Response) => {
  try {
    const allLabs = await db.select().from(labs).orderBy(desc(labs.createdAt));
    const allCourses = await db.select({ id: courses.id, title: courses.title }).from(courses);
    const courseMap = new Map(allCourses.map(c => [c.id, c.title]));
    const result = allLabs.map(l => ({ ...l, courseTitle: courseMap.get(l.courseId) || "Unknown" }));
    res.json(result);
  } catch (error) {
    console.error("[Guru] List labs error:", error);
    res.status(500).json({ error: "Failed to fetch labs" });
  }
});

guruRouter.post("/labs", async (req: Request, res: Response) => {
  try {
    const { courseId, lessonId, title, instructions, starterCode, expectedOutput, solutionCode, language, orderIndex } = req.body;
    if (!courseId || !title || !instructions) return res.status(400).json({ error: "Course ID, title, and instructions are required" });
    const [newLab] = await db.insert(labs).values({
      courseId, lessonId, title, instructions, starterCode, expectedOutput, solutionCode,
      language: language || "javascript", orderIndex: orderIndex || 0,
    }).returning();
    res.json(newLab);
  } catch (error) {
    console.error("[Guru] Create lab error:", error);
    res.status(500).json({ error: "Failed to create lab" });
  }
});

guruRouter.put("/labs/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, instructions, starterCode, expectedOutput, solutionCode, language, orderIndex } = req.body;
    const [updated] = await db.update(labs).set({ title, instructions, starterCode, expectedOutput, solutionCode, language, orderIndex }).where(eq(labs.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Lab not found" });
    res.json(updated);
  } catch (error) {
    console.error("[Guru] Update lab error:", error);
    res.status(500).json({ error: "Failed to update lab" });
  }
});

guruRouter.delete("/labs/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(labs).where(eq(labs.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("[Guru] Delete lab error:", error);
    res.status(500).json({ error: "Failed to delete lab" });
  }
});

// ============ PROJECT CRUD ============

guruRouter.get("/projects", async (req: Request, res: Response) => {
  try {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
    const allCourses = await db.select({ id: courses.id, title: courses.title }).from(courses);
    const courseMap = new Map(allCourses.map(c => [c.id, c.title]));
    const result = allProjects.map(p => ({ ...p, courseTitle: courseMap.get(p.courseId) || "Unknown" }));
    res.json(result);
  } catch (error) {
    console.error("[Guru] List projects error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

guruRouter.post("/projects", async (req: Request, res: Response) => {
  try {
    const { courseId, title, description, difficulty, requirements, resources, estimatedHours } = req.body;
    if (!courseId || !title || !description) return res.status(400).json({ error: "Course ID, title, and description are required" });
    const [newProject] = await db.insert(projects).values({
      courseId, title, description, difficulty: difficulty || "medium", requirements, resources, estimatedHours,
    }).returning();
    res.json(newProject);
  } catch (error) {
    console.error("[Guru] Create project error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

guruRouter.put("/projects/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, difficulty, requirements, resources, estimatedHours } = req.body;
    const [updated] = await db.update(projects).set({ title, description, difficulty, requirements, resources, estimatedHours }).where(eq(projects.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json(updated);
  } catch (error) {
    console.error("[Guru] Update project error:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

guruRouter.delete("/projects/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(projects).where(eq(projects.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("[Guru] Delete project error:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ============ ZOHO TRAINERCENTRAL INTEGRATION ============

guruRouter.get("/settings/integrations", async (req: Request, res: Response) => {
  try {
    const zohoCredsConfigured = !!(process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_SECRET && process.env.ZOHO_ORG_ID);
    const zohoConnected = await zohoService.isConnected();
    res.json({
      zoho: {
        configured: zohoCredsConfigured,
        connected: zohoConnected,
        status: zohoConnected ? "connected" : zohoCredsConfigured ? "credentials_ready" : "not_configured",
      },
      aisiksha: {
        configured: !!(process.env.AISIKSHA_ADMIN_URL && process.env.AISIKSHA_API_KEY),
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
      },
    });
  } catch (error) {
    console.error("[Guru] Integration status error:", error);
    res.status(500).json({ error: "Failed to check integration status" });
  }
});

guruRouter.get("/zoho/authorize", async (req: Request, res: Response) => {
  try {
    const authUrl = zohoService.getAuthorizationUrl();
    res.json({ url: authUrl });
  } catch (error: any) {
    console.error("[Guru] Zoho authorize error:", error);
    res.status(400).json({ error: error.message });
  }
});

guruRouter.post("/zoho/test-connection", async (req: Request, res: Response) => {
  try {
    const result = await zohoService.testConnection();
    res.json(result);
  } catch (error: any) {
    console.error("[Guru] Zoho test connection error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

guruRouter.post("/zoho/sync", async (req: Request, res: Response) => {
  try {
    const connected = await zohoService.isConnected();
    if (!connected) {
      return res.status(400).json({
        success: false,
        error: "Not connected to Zoho. Please connect first."
      });
    }

    const result = await zohoService.syncCoursesFromTrainerCentral();
    res.json({
      success: true,
      message: `Sync complete: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted.`,
      ...result,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Guru] Zoho sync error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

guruRouter.post("/zoho/disconnect", async (req: Request, res: Response) => {
  try {
    await zohoService.disconnect();
    res.json({ success: true, message: "Disconnected from Zoho TrainerCentral." });
  } catch (error: any) {
    console.error("[Guru] Zoho disconnect error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

guruRouter.get("/zoho/status", async (req: Request, res: Response) => {
  try {
    const connected = await zohoService.isConnected();
    res.json({ connected });
  } catch (error: any) {
    res.json({ connected: false });
  }
});
