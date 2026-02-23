import { Router, Request, Response } from "express";
import { db } from "./db";
import { udyogInternships, udyogAssignments, udyogTasks, udyogSubmissions, udyogCertificates, udyogSkillAssessments, insertUdyogInternshipSchema } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { requireAuth, type AuthenticatedRequest } from "./auth";

export const udyogRouter = Router();

// GET /internships - List all active internships (public)
udyogRouter.get("/internships", async (req: Request, res: Response) => {
  try {
    const internships = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.isActive, true))
      .orderBy(desc(udyogInternships.createdAt));
    res.json(internships);
  } catch (error) {
    console.error("[Udyog] Error fetching internships:", error);
    res.status(500).json({ error: "Failed to fetch internships" });
  }
});

// GET /internships/:id - Get internship details with tasks (public)
udyogRouter.get("/internships/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [internship] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, id))
      .limit(1);
    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }
    const tasks = await db.select().from(udyogTasks)
      .where(eq(udyogTasks.internshipId, id))
      .orderBy(udyogTasks.orderIndex);
    res.json({ ...internship, tasks });
  } catch (error) {
    console.error("[Udyog] Error fetching internship:", error);
    res.status(500).json({ error: "Failed to fetch internship" });
  }
});

// POST /assess - Submit skill assessment (auth required)
udyogRouter.post("/assess", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, answers } = req.body;
    if (!domain || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "domain and answers are required" });
    }
    const correctCount = answers.filter((a: any) => a.correct).length;
    const score = Math.round((correctCount / answers.length) * 100);
    let level: string;
    if (score < 40) {
      level = "beginner";
    } else if (score <= 75) {
      level = "intermediate";
    } else {
      level = "advanced";
    }
    const [assessment] = await db.insert(udyogSkillAssessments).values({
      userId: req.user!.id,
      domain,
      score,
      level,
    }).returning();
    res.json({ assessment, score, level });
  } catch (error) {
    console.error("[Udyog] Error submitting assessment:", error);
    res.status(500).json({ error: "Failed to submit assessment" });
  }
});

// POST /assign - Auto-assign internship based on skill assessment (auth required)
udyogRouter.post("/assign", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assessmentId } = req.body;
    if (!assessmentId) {
      return res.status(400).json({ error: "assessmentId is required" });
    }
    const [assessment] = await db.select().from(udyogSkillAssessments)
      .where(and(
        eq(udyogSkillAssessments.id, assessmentId),
        eq(udyogSkillAssessments.userId, req.user!.id)
      ))
      .limit(1);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    const [internship] = await db.select().from(udyogInternships)
      .where(and(
        eq(udyogInternships.skillLevel, assessment.level),
        eq(udyogInternships.isActive, true)
      ))
      .limit(1);
    if (!internship) {
      return res.status(404).json({ error: "No matching internship found for your skill level" });
    }
    const roleMap: Record<string, string> = {
      beginner: "Junior Intern",
      intermediate: "Project Associate",
      advanced: "Lead Developer",
    };
    const [assignment] = await db.insert(udyogAssignments).values({
      userId: req.user!.id,
      internshipId: internship.id,
      status: "active",
      progress: 0,
      skillScore: assessment.score,
      assignedRole: roleMap[assessment.level] || "Junior Intern",
    }).returning();
    res.json({ assignment, internship });
  } catch (error) {
    console.error("[Udyog] Error assigning internship:", error);
    res.status(500).json({ error: "Failed to assign internship" });
  }
});

// GET /my-assignment - Get current user's active assignment with internship details and tasks (auth required)
udyogRouter.get("/my-assignment", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [assignment] = await db.select().from(udyogAssignments)
      .where(and(
        eq(udyogAssignments.userId, req.user!.id),
        eq(udyogAssignments.status, "active")
      ))
      .orderBy(desc(udyogAssignments.createdAt))
      .limit(1);
    if (!assignment) {
      return res.status(404).json({ error: "No active assignment found" });
    }
    const [internship] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, assignment.internshipId))
      .limit(1);
    const tasks = await db.select().from(udyogTasks)
      .where(eq(udyogTasks.internshipId, assignment.internshipId))
      .orderBy(udyogTasks.orderIndex);
    res.json({ assignment, internship, tasks });
  } catch (error) {
    console.error("[Udyog] Error fetching assignment:", error);
    res.status(500).json({ error: "Failed to fetch assignment" });
  }
});

// GET /my-assignments - Get all of current user's assignments (auth required)
udyogRouter.get("/my-assignments", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignments = await db.select().from(udyogAssignments)
      .where(eq(udyogAssignments.userId, req.user!.id))
      .orderBy(desc(udyogAssignments.createdAt));
    res.json(assignments);
  } catch (error) {
    console.error("[Udyog] Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

// PATCH /tasks/:taskId/status - Update task status for user's assignment (auth required)
udyogRouter.patch("/tasks/:taskId/status", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    const { status } = req.body;
    const validStatuses = ["todo", "in_progress", "review", "completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be one of: todo, in_progress, review, completed" });
    }
    const [task] = await db.select().from(udyogTasks)
      .where(eq(udyogTasks.id, taskId))
      .limit(1);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    const [assignment] = await db.select().from(udyogAssignments)
      .where(and(
        eq(udyogAssignments.userId, req.user!.id),
        eq(udyogAssignments.internshipId, task.internshipId),
        eq(udyogAssignments.status, "active")
      ))
      .limit(1);
    if (!assignment) {
      return res.status(403).json({ error: "You don't have an active assignment for this internship" });
    }
    await db.update(udyogTasks).set({ status }).where(eq(udyogTasks.id, taskId));
    const allTasks = await db.select().from(udyogTasks)
      .where(eq(udyogTasks.internshipId, task.internshipId));
    const completedCount = allTasks.filter(t => t.id === taskId ? status === "completed" : t.status === "completed").length;
    const progress = Math.round((completedCount / allTasks.length) * 100);
    await db.update(udyogAssignments).set({ progress }).where(eq(udyogAssignments.id, assignment.id));
    res.json({ task: { ...task, status }, progress });
  } catch (error) {
    console.error("[Udyog] Error updating task status:", error);
    res.status(500).json({ error: "Failed to update task status" });
  }
});

// POST /submissions - Submit work for a task (auth required)
udyogRouter.post("/submissions", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assignmentId, taskId, content } = req.body;
    if (!assignmentId || !taskId || !content) {
      return res.status(400).json({ error: "assignmentId, taskId, and content are required" });
    }
    const [assignment] = await db.select().from(udyogAssignments)
      .where(and(
        eq(udyogAssignments.id, assignmentId),
        eq(udyogAssignments.userId, req.user!.id)
      ))
      .limit(1);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    const [submission] = await db.insert(udyogSubmissions).values({
      assignmentId,
      taskId,
      content,
      status: "pending",
    }).returning();
    res.json(submission);
  } catch (error) {
    console.error("[Udyog] Error submitting work:", error);
    res.status(500).json({ error: "Failed to submit work" });
  }
});

// GET /submissions/:assignmentId - Get all submissions for an assignment (auth required)
udyogRouter.get("/submissions/:assignmentId", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId, 10);
    const [assignment] = await db.select().from(udyogAssignments)
      .where(and(
        eq(udyogAssignments.id, assignmentId),
        eq(udyogAssignments.userId, req.user!.id)
      ))
      .limit(1);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    const submissions = await db.select().from(udyogSubmissions)
      .where(eq(udyogSubmissions.assignmentId, assignmentId))
      .orderBy(desc(udyogSubmissions.submittedAt));
    res.json(submissions);
  } catch (error) {
    console.error("[Udyog] Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// POST /certificate/generate - Generate certificate if all tasks completed (auth required)
udyogRouter.post("/certificate/generate", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assignmentId } = req.body;
    if (!assignmentId) {
      return res.status(400).json({ error: "assignmentId is required" });
    }
    const [assignment] = await db.select().from(udyogAssignments)
      .where(and(
        eq(udyogAssignments.id, assignmentId),
        eq(udyogAssignments.userId, req.user!.id)
      ))
      .limit(1);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    const tasks = await db.select().from(udyogTasks)
      .where(eq(udyogTasks.internshipId, assignment.internshipId));
    const allCompleted = tasks.length > 0 && tasks.every(t => t.status === "completed");
    if (!allCompleted) {
      return res.status(400).json({ error: "All tasks must be completed before generating a certificate" });
    }
    const existingCert = await db.select().from(udyogCertificates)
      .where(and(
        eq(udyogCertificates.userId, req.user!.id),
        eq(udyogCertificates.internshipId, assignment.internshipId)
      ))
      .limit(1);
    if (existingCert.length > 0) {
      return res.json({ certificate: existingCert[0], message: "Certificate already generated" });
    }
    const certificateId = `UDYOG-${randomUUID().slice(0, 8).toUpperCase()}`;
    const [certificate] = await db.insert(udyogCertificates).values({
      userId: req.user!.id,
      internshipId: assignment.internshipId,
      certificateId,
    }).returning();
    await db.update(udyogAssignments).set({
      status: "completed",
      completedAt: new Date(),
    }).where(eq(udyogAssignments.id, assignmentId));
    res.json({ certificate });
  } catch (error) {
    console.error("[Udyog] Error generating certificate:", error);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
});

// GET /certificate/:certificateId - Get certificate by ID (public, for verification)
udyogRouter.get("/certificate/:certificateId", async (req: Request, res: Response) => {
  try {
    const { certificateId } = req.params;
    const [certificate] = await db.select().from(udyogCertificates)
      .where(eq(udyogCertificates.certificateId, certificateId))
      .limit(1);
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    const [internship] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, certificate.internshipId))
      .limit(1);
    res.json({ certificate, internship });
  } catch (error) {
    console.error("[Udyog] Error fetching certificate:", error);
    res.status(500).json({ error: "Failed to fetch certificate" });
  }
});

// GET /assessments - Get current user's skill assessments (auth required)
udyogRouter.get("/assessments", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assessments = await db.select().from(udyogSkillAssessments)
      .where(eq(udyogSkillAssessments.userId, req.user!.id))
      .orderBy(desc(udyogSkillAssessments.assessedAt));
    res.json(assessments);
  } catch (error) {
    console.error("[Udyog] Error fetching assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// ============ ADMIN ENDPOINTS ============

// GET /admin/internships - List all internships
udyogRouter.get("/admin/internships", async (req: Request, res: Response) => {
  try {
    const internships = await db.select().from(udyogInternships)
      .orderBy(desc(udyogInternships.createdAt));
    res.json(internships);
  } catch (error) {
    console.error("[Udyog Admin] Error fetching internships:", error);
    res.status(500).json({ error: "Failed to fetch internships" });
  }
});

// POST /admin/internships - Create internship
udyogRouter.post("/admin/internships", async (req: Request, res: Response) => {
  try {
    const validation = insertUdyogInternshipSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }
    const [internship] = await db.insert(udyogInternships).values(validation.data).returning();
    res.json(internship);
  } catch (error) {
    console.error("[Udyog Admin] Error creating internship:", error);
    res.status(500).json({ error: "Failed to create internship" });
  }
});

// PUT /admin/internships/:id - Update internship
udyogRouter.put("/admin/internships/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [existing] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, id))
      .limit(1);
    if (!existing) {
      return res.status(404).json({ error: "Internship not found" });
    }
    const [updated] = await db.update(udyogInternships)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(udyogInternships.id, id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("[Udyog Admin] Error updating internship:", error);
    res.status(500).json({ error: "Failed to update internship" });
  }
});

// DELETE /admin/internships/:id - Delete internship
udyogRouter.delete("/admin/internships/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [existing] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, id))
      .limit(1);
    if (!existing) {
      return res.status(404).json({ error: "Internship not found" });
    }
    await db.delete(udyogInternships).where(eq(udyogInternships.id, id));
    res.json({ message: "Internship deleted successfully" });
  } catch (error) {
    console.error("[Udyog Admin] Error deleting internship:", error);
    res.status(500).json({ error: "Failed to delete internship" });
  }
});

// POST /admin/internships/:id/tasks - Add task to internship
udyogRouter.post("/admin/internships/:id/tasks", async (req: Request, res: Response) => {
  try {
    const internshipId = parseInt(req.params.id, 10);
    const [existing] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, internshipId))
      .limit(1);
    if (!existing) {
      return res.status(404).json({ error: "Internship not found" });
    }
    const { title, description, orderIndex } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }
    const [task] = await db.insert(udyogTasks).values({
      internshipId,
      title,
      description: description || null,
      orderIndex: orderIndex || 0,
      status: "todo",
    }).returning();
    res.json(task);
  } catch (error) {
    console.error("[Udyog Admin] Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
});

// GET /admin/submissions - List all submissions
udyogRouter.get("/admin/submissions", async (req: Request, res: Response) => {
  try {
    const submissions = await db.select().from(udyogSubmissions)
      .orderBy(desc(udyogSubmissions.submittedAt));
    res.json(submissions);
  } catch (error) {
    console.error("[Udyog Admin] Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// PATCH /admin/submissions/:id - Review submission (approve/reject)
udyogRouter.patch("/admin/submissions/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, feedback } = req.body;
    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }
    const [existing] = await db.select().from(udyogSubmissions)
      .where(eq(udyogSubmissions.id, id))
      .limit(1);
    if (!existing) {
      return res.status(404).json({ error: "Submission not found" });
    }
    const [updated] = await db.update(udyogSubmissions)
      .set({
        status,
        feedback: feedback || null,
        reviewedAt: new Date(),
      })
      .where(eq(udyogSubmissions.id, id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("[Udyog Admin] Error reviewing submission:", error);
    res.status(500).json({ error: "Failed to review submission" });
  }
});
