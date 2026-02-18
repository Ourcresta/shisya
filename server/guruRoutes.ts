import { Router, Request, Response } from "express";
import { db } from "./db";
import { courses, modules, lessons, tests, projects, labs, shishyaUsers, shishyaCourseEnrollments, shishyaUserCredits } from "@shared/schema";
import { eq, count, sql, desc } from "drizzle-orm";
import { requireGuruAuth, GuruAuthenticatedRequest } from "./guruAuth";

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
