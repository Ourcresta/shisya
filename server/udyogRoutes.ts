import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { db } from "./db";
import {
  udyogInternships, udyogAssignments, udyogTasks, udyogSubtasks, udyogSubmissions,
  udyogCertificates, udyogSkillAssessments, udyogBatches, udyogBatchMembers,
  udyogHrUsers, udyogJobs, udyogApplications,
  insertUdyogInternshipSchema, insertUdyogJobSchema, insertUdyogSubtaskSchema,
  shishyaUsers, shishyaUserProfiles,
} from "@shared/schema";
import { eq, and, desc, sql, gte, lte, or, inArray, count } from "drizzle-orm";
import { randomUUID } from "crypto";
import { requireAuth, type AuthenticatedRequest } from "./auth";
import * as bcrypt from "bcrypt";

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

// Helper: fetch tasks with their subtasks for an internship
async function getTasksWithSubtasks(internshipId: number, batchId?: number | null) {
  let tasksQuery;
  if (batchId) {
    tasksQuery = await db.select().from(udyogTasks)
      .where(and(eq(udyogTasks.internshipId, internshipId), eq(udyogTasks.batchId, batchId)))
      .orderBy(udyogTasks.orderIndex);
    if (!tasksQuery.length) {
      tasksQuery = await db.select().from(udyogTasks)
        .where(and(eq(udyogTasks.internshipId, internshipId), sql`${udyogTasks.batchId} IS NULL`))
        .orderBy(udyogTasks.orderIndex);
    }
  } else {
    tasksQuery = await db.select().from(udyogTasks)
      .where(eq(udyogTasks.internshipId, internshipId))
      .orderBy(udyogTasks.orderIndex);
  }
  if (!tasksQuery.length) return [];
  const taskIds = tasksQuery.map((t) => t.id);
  const allSubtasks = await db.select().from(udyogSubtasks)
    .where(inArray(udyogSubtasks.taskId, taskIds))
    .orderBy(udyogSubtasks.orderIndex);
  return tasksQuery.map((task) => ({
    ...task,
    subtasks: allSubtasks.filter((s) => s.taskId === task.id),
  }));
}

// GET /internships/:id - Get internship details with tasks + subtasks (public)
udyogRouter.get("/internships/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [internship] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, id))
      .limit(1);
    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }
    const tasks = await getTasksWithSubtasks(id);
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

// POST /assign - Auto-assign internship based on skill assessment with batch formation (auth required)
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
    let internship: any = null;
    // 1. Try exact match: domain + skill level
    if (assessment.domain) {
      const [exact] = await db.select().from(udyogInternships)
        .where(and(
          eq(udyogInternships.domain, assessment.domain),
          eq(udyogInternships.skillLevel, assessment.level),
          eq(udyogInternships.isActive, true)
        ))
        .limit(1);
      internship = exact || null;
    }
    // 2. Fallback: domain only (any skill level)
    if (!internship && assessment.domain) {
      const [domainOnly] = await db.select().from(udyogInternships)
        .where(and(
          eq(udyogInternships.domain, assessment.domain),
          eq(udyogInternships.isActive, true)
        ))
        .limit(1);
      internship = domainOnly || null;
    }
    // 3. Fallback: skill level only (any domain)
    if (!internship) {
      const [levelOnly] = await db.select().from(udyogInternships)
        .where(and(
          eq(udyogInternships.skillLevel, assessment.level),
          eq(udyogInternships.isActive, true)
        ))
        .limit(1);
      internship = levelOnly || null;
    }
    if (!internship) {
      return res.status(404).json({ error: "No matching internship found for your domain and skill level" });
    }
    const roleMap: Record<string, string> = {
      beginner: "Junior Intern",
      intermediate: "Project Associate",
      advanced: "Lead Developer",
      mastery: "Principal Engineer",
    };
    const batchSize = internship.batchSize || 5;
    let [formingBatch] = await db.select().from(udyogBatches)
      .where(and(
        eq(udyogBatches.internshipId, internship.id),
        eq(udyogBatches.status, "forming")
      ))
      .limit(1);
    if (!formingBatch) {
      const existingBatches = await db.select({ cnt: count() }).from(udyogBatches)
        .where(eq(udyogBatches.internshipId, internship.id));
      const batchNumber = (existingBatches[0]?.cnt || 0) + 1;
      [formingBatch] = await db.insert(udyogBatches).values({
        internshipId: internship.id,
        batchNumber,
        status: "forming",
      }).returning();
    }
    await db.insert(udyogBatchMembers).values({
      batchId: formingBatch.id,
      userId: req.user!.id,
      role: "developer",
      skillScore: assessment.score,
    });
    const [assignment] = await db.insert(udyogAssignments).values({
      userId: req.user!.id,
      internshipId: internship.id,
      batchId: formingBatch.id,
      status: "active",
      progress: 0,
      skillScore: assessment.score,
      assignedRole: roleMap[assessment.level] || "Junior Intern",
    }).returning();
    // Immediately create tasks for this assignment by copying template tasks
    const existingBatchTasks = await db.select().from(udyogTasks)
      .where(and(
        eq(udyogTasks.internshipId, internship.id),
        eq(udyogTasks.batchId, formingBatch.id)
      ));
    if (existingBatchTasks.length === 0) {
      const templateTasks = await db.select().from(udyogTasks)
        .where(and(
          eq(udyogTasks.internshipId, internship.id),
          sql`${udyogTasks.batchId} IS NULL`
        ))
        .orderBy(udyogTasks.orderIndex);
      for (const tpl of templateTasks) {
        await db.insert(udyogTasks).values({
          internshipId: internship.id,
          batchId: formingBatch.id,
          title: tpl.title,
          description: tpl.description,
          status: "todo",
          orderIndex: tpl.orderIndex,
        });
      }
    }
    // Activate batch immediately so tasks are visible
    if (formingBatch.status === "forming") {
      const now = new Date();
      const durationWeeks = parseInt(internship.duration) || 4;
      const endDate = new Date(now.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);
      await db.update(udyogBatches).set({
        status: "active",
        startDate: now,
        endDate,
      }).where(eq(udyogBatches.id, formingBatch.id));
      formingBatch = { ...formingBatch, status: "active", startDate: now, endDate };
    }
    // Assign team roles if batch reaches full size
    const members = await db.select().from(udyogBatchMembers)
      .where(eq(udyogBatchMembers.batchId, formingBatch.id));
    if (members.length >= batchSize) {
      const sorted = [...members].sort((a, b) => b.skillScore - a.skillScore);
      const roleAssignments: Record<string, string> = {};
      sorted.forEach((m, i) => {
        if (i === 0) roleAssignments[m.userId] = "Team Lead";
        else if (i < sorted.length - 1) roleAssignments[m.userId] = "Developer";
        else roleAssignments[m.userId] = "QA/Tester";
      });
      for (const member of sorted) {
        const newRole = roleAssignments[member.userId];
        await db.update(udyogBatchMembers).set({ role: newRole }).where(eq(udyogBatchMembers.id, member.id));
        await db.update(udyogAssignments).set({ assignedRole: newRole })
          .where(and(
            eq(udyogAssignments.userId, member.userId),
            eq(udyogAssignments.batchId, formingBatch.id)
          ));
      }
    }
    res.json({ assignment, internship, batch: formingBatch });
  } catch (error) {
    console.error("[Udyog] Error assigning internship:", error);
    res.status(500).json({ error: "Failed to assign internship" });
  }
});

// GET /my-assignment - Get current user's active or most recent assignment with internship details and tasks (auth required)
udyogRouter.get("/my-assignment", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let [assignment] = await db.select().from(udyogAssignments)
      .where(and(
        eq(udyogAssignments.userId, req.user!.id),
        eq(udyogAssignments.status, "active")
      ))
      .orderBy(desc(udyogAssignments.createdAt))
      .limit(1);
    if (!assignment) {
      [assignment] = await db.select().from(udyogAssignments)
        .where(eq(udyogAssignments.userId, req.user!.id))
        .orderBy(desc(udyogAssignments.createdAt))
        .limit(1);
    }
    if (!assignment) {
      return res.status(404).json({ error: "No assignment found" });
    }
    const [internship] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, assignment.internshipId))
      .limit(1);
    const tasks = await getTasksWithSubtasks(assignment.internshipId, assignment.batchId);
    let certificate = null;
    if (assignment.status === "completed") {
      const [cert] = await db.select().from(udyogCertificates)
        .where(and(
          eq(udyogCertificates.userId, req.user!.id),
          eq(udyogCertificates.internshipId, assignment.internshipId)
        ))
        .limit(1);
      certificate = cert || null;
    }
    res.json({ assignment: { ...assignment, certificate }, internship, tasks });
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
    if (!assignmentId || !content) {
      return res.status(400).json({ error: "assignmentId and content are required" });
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
      taskId: taskId || null,
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
    let tasks;
    if (assignment.batchId) {
      tasks = await db.select().from(udyogTasks)
        .where(and(
          eq(udyogTasks.internshipId, assignment.internshipId),
          eq(udyogTasks.batchId, assignment.batchId)
        ));
    }
    if (!tasks || tasks.length === 0) {
      tasks = await db.select().from(udyogTasks)
        .where(and(
          eq(udyogTasks.internshipId, assignment.internshipId),
          sql`${udyogTasks.batchId} IS NULL`
        ));
    }
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
    await db.transaction(async (tx) => {
      const taskIds = (await tx.select({ id: udyogTasks.id }).from(udyogTasks).where(eq(udyogTasks.internshipId, id))).map(t => t.id);

      if (taskIds.length > 0) {
        await tx.delete(udyogSubtasks).where(inArray(udyogSubtasks.taskId, taskIds));
        await tx.delete(udyogSubmissions).where(inArray(udyogSubmissions.taskId, taskIds));
      }

      await tx.delete(udyogTasks).where(eq(udyogTasks.internshipId, id));

      const assignmentIds = (await tx.select({ id: udyogAssignments.id }).from(udyogAssignments).where(eq(udyogAssignments.internshipId, id))).map(a => a.id);

      if (assignmentIds.length > 0) {
        await tx.delete(udyogSubmissions).where(inArray(udyogSubmissions.assignmentId, assignmentIds));
      }

      await tx.delete(udyogAssignments).where(eq(udyogAssignments.internshipId, id));

      await tx.delete(udyogCertificates).where(eq(udyogCertificates.internshipId, id));

      const batchIds = (await tx.select({ id: udyogBatches.id }).from(udyogBatches).where(eq(udyogBatches.internshipId, id))).map(b => b.id);

      if (batchIds.length > 0) {
        await tx.delete(udyogBatchMembers).where(inArray(udyogBatchMembers.batchId, batchIds));
      }

      await tx.delete(udyogBatches).where(eq(udyogBatches.internshipId, id));
      await tx.delete(udyogInternships).where(eq(udyogInternships.id, id));
    });

    res.json({ message: "Internship deleted successfully" });
  } catch (error) {
    console.error("[Udyog Admin] Error deleting internship:", error);
    res.status(500).json({ error: "Failed to delete internship" });
  }
});

// POST /admin/internships/:id/tasks - Add task (with optional subtasks) to internship
udyogRouter.post("/admin/internships/:id/tasks", async (req: Request, res: Response) => {
  try {
    const internshipId = parseInt(req.params.id, 10);
    const [existing] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, internshipId))
      .limit(1);
    if (!existing) {
      return res.status(404).json({ error: "Internship not found" });
    }
    const { title, description, orderIndex, subtasks } = req.body;
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
    let savedSubtasks: any[] = [];
    if (subtasks && Array.isArray(subtasks) && subtasks.length > 0) {
      const subtaskValues = subtasks.map((s: any, idx: number) => ({
        taskId: task.id,
        title: s.title,
        description: s.description || null,
        orderIndex: s.orderIndex ?? idx,
        status: "todo" as const,
      }));
      savedSubtasks = await db.insert(udyogSubtasks).values(subtaskValues).returning();
    }
    res.json({ ...task, subtasks: savedSubtasks });
  } catch (error) {
    console.error("[Udyog Admin] Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
});

// POST /admin/tasks/:taskId/subtasks - Add subtask to a task
udyogRouter.post("/admin/tasks/:taskId/subtasks", async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    const [task] = await db.select().from(udyogTasks).where(eq(udyogTasks.id, taskId)).limit(1);
    if (!task) return res.status(404).json({ error: "Task not found" });
    const { title, description, orderIndex } = req.body;
    if (!title) return res.status(400).json({ error: "Subtask title is required" });
    const [subtask] = await db.insert(udyogSubtasks).values({
      taskId,
      title,
      description: description || null,
      orderIndex: orderIndex ?? 0,
      status: "todo",
    }).returning();
    res.json(subtask);
  } catch (error) {
    console.error("[Udyog Admin] Error adding subtask:", error);
    res.status(500).json({ error: "Failed to add subtask" });
  }
});

// PATCH /admin/subtasks/:subtaskId - Update a subtask
udyogRouter.patch("/admin/subtasks/:subtaskId", async (req: Request, res: Response) => {
  try {
    const subtaskId = parseInt(req.params.subtaskId, 10);
    const { title, description, orderIndex, status } = req.body;
    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;
    if (status !== undefined) updateData.status = status;
    const [updated] = await db.update(udyogSubtasks)
      .set(updateData)
      .where(eq(udyogSubtasks.id, subtaskId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Subtask not found" });
    res.json(updated);
  } catch (error) {
    console.error("[Udyog Admin] Error updating subtask:", error);
    res.status(500).json({ error: "Failed to update subtask" });
  }
});

// DELETE /admin/subtasks/:subtaskId - Delete a subtask
udyogRouter.delete("/admin/subtasks/:subtaskId", async (req: Request, res: Response) => {
  try {
    const subtaskId = parseInt(req.params.subtaskId, 10);
    await db.delete(udyogSubtasks).where(eq(udyogSubtasks.id, subtaskId));
    res.json({ success: true });
  } catch (error) {
    console.error("[Udyog Admin] Error deleting subtask:", error);
    res.status(500).json({ error: "Failed to delete subtask" });
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

// PATCH /admin/submissions/:id - Review submission (approve/reject with score)
udyogRouter.patch("/admin/submissions/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, feedback, score, approved } = req.body;
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
        score: score !== undefined ? score : existing.score,
        approved: approved !== undefined ? approved : existing.approved,
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

// ============ BATCH ENDPOINTS ============

// GET /batches - List all batches for an internship
udyogRouter.get("/batches/:internshipId", async (req: Request, res: Response) => {
  try {
    const internshipId = parseInt(req.params.internshipId, 10);
    const batches = await db.select().from(udyogBatches)
      .where(eq(udyogBatches.internshipId, internshipId))
      .orderBy(desc(udyogBatches.createdAt));
    res.json(batches);
  } catch (error) {
    console.error("[Udyog] Error fetching batches:", error);
    res.status(500).json({ error: "Failed to fetch batches" });
  }
});

// GET /batch/:batchId - Get batch details with members and tasks
udyogRouter.get("/batch/:batchId", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const batchId = parseInt(req.params.batchId, 10);
    const [batch] = await db.select().from(udyogBatches)
      .where(eq(udyogBatches.id, batchId))
      .limit(1);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    const [internship] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, batch.internshipId))
      .limit(1);
    const members = await db.select({
      member: udyogBatchMembers,
      profile: shishyaUserProfiles,
    }).from(udyogBatchMembers)
      .leftJoin(shishyaUserProfiles, eq(udyogBatchMembers.userId, shishyaUserProfiles.userId))
      .where(eq(udyogBatchMembers.batchId, batchId));
    const tasks = await db.select().from(udyogTasks)
      .where(eq(udyogTasks.batchId, batchId))
      .orderBy(udyogTasks.orderIndex);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    res.json({ batch, internship, members, tasks, progress });
  } catch (error) {
    console.error("[Udyog] Error fetching batch:", error);
    res.status(500).json({ error: "Failed to fetch batch" });
  }
});

// GET /my-batch - Get current user's batch (auth required)
udyogRouter.get("/my-batch", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let [assignment] = await db.select().from(udyogAssignments)
      .where(and(
        eq(udyogAssignments.userId, req.user!.id),
        eq(udyogAssignments.status, "active")
      ))
      .orderBy(desc(udyogAssignments.createdAt))
      .limit(1);
    if (!assignment) {
      [assignment] = await db.select().from(udyogAssignments)
        .where(eq(udyogAssignments.userId, req.user!.id))
        .orderBy(desc(udyogAssignments.createdAt))
        .limit(1);
    }
    if (!assignment || !assignment.batchId) {
      return res.status(404).json({ error: "No batch found" });
    }
    const [batch] = await db.select().from(udyogBatches)
      .where(eq(udyogBatches.id, assignment.batchId))
      .limit(1);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    const [internship] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, batch.internshipId))
      .limit(1);
    const members = await db.select({
      member: udyogBatchMembers,
      profile: shishyaUserProfiles,
    }).from(udyogBatchMembers)
      .leftJoin(shishyaUserProfiles, eq(udyogBatchMembers.userId, shishyaUserProfiles.userId))
      .where(eq(udyogBatchMembers.batchId, batch.id));
    const tasks = await db.select().from(udyogTasks)
      .where(eq(udyogTasks.batchId, batch.id))
      .orderBy(udyogTasks.orderIndex);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    let certificate = null;
    if (assignment.status === "completed") {
      const [cert] = await db.select().from(udyogCertificates)
        .where(and(
          eq(udyogCertificates.userId, req.user!.id),
          eq(udyogCertificates.internshipId, assignment.internshipId)
        ))
        .limit(1);
      certificate = cert || null;
    }
    res.json({ batch, internship, assignment: { ...assignment, certificate }, members, tasks, progress });
  } catch (error) {
    console.error("[Udyog] Error fetching batch:", error);
    res.status(500).json({ error: "Failed to fetch batch" });
  }
});

// PATCH /batch-member/:memberId/scores - Update batch member scores (admin)
udyogRouter.patch("/admin/batch-member/:memberId/scores", async (req: Request, res: Response) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const { qualityScore, collaborationScore } = req.body;
    const [existing] = await db.select().from(udyogBatchMembers)
      .where(eq(udyogBatchMembers.id, memberId))
      .limit(1);
    if (!existing) {
      return res.status(404).json({ error: "Batch member not found" });
    }
    const updates: any = {};
    if (qualityScore !== undefined) updates.qualityScore = qualityScore;
    if (collaborationScore !== undefined) updates.collaborationScore = collaborationScore;
    const taskCompletionRate = existing.taskCompletionRate || 0;
    const deadlineCompliance = existing.deadlineCompliance || 0;
    const qScore = qualityScore !== undefined ? qualityScore : (existing.qualityScore || 0);
    const cScore = collaborationScore !== undefined ? collaborationScore : (existing.collaborationScore || 0);
    updates.performanceScore = Math.round((taskCompletionRate + deadlineCompliance + qScore + cScore) / 4);
    const [updated] = await db.update(udyogBatchMembers)
      .set(updates)
      .where(eq(udyogBatchMembers.id, memberId))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("[Udyog Admin] Error updating batch member scores:", error);
    res.status(500).json({ error: "Failed to update scores" });
  }
});

// GET /admin/batches - List all batches across all internships
udyogRouter.get("/admin/batches", async (req: Request, res: Response) => {
  try {
    const batches = await db.select({
      batch: udyogBatches,
      internship: udyogInternships,
    }).from(udyogBatches)
      .leftJoin(udyogInternships, eq(udyogBatches.internshipId, udyogInternships.id))
      .orderBy(desc(udyogBatches.createdAt));
    res.json(batches);
  } catch (error) {
    console.error("[Udyog Admin] Error fetching batches:", error);
    res.status(500).json({ error: "Failed to fetch batches" });
  }
});

// GET /admin/batch/:batchId/members - Get batch members with details
udyogRouter.get("/admin/batch/:batchId/members", async (req: Request, res: Response) => {
  try {
    const batchId = parseInt(req.params.batchId, 10);
    const members = await db.select({
      member: udyogBatchMembers,
      profile: shishyaUserProfiles,
    }).from(udyogBatchMembers)
      .leftJoin(shishyaUserProfiles, eq(udyogBatchMembers.userId, shishyaUserProfiles.userId))
      .where(eq(udyogBatchMembers.batchId, batchId));
    res.json(members);
  } catch (error) {
    console.error("[Udyog Admin] Error fetching batch members:", error);
    res.status(500).json({ error: "Failed to fetch batch members" });
  }
});

// PATCH /admin/batch-member/:memberId/role - Override role assignment
udyogRouter.patch("/admin/batch-member/:memberId/role", async (req: Request, res: Response) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "role is required" });
    }
    const [updated] = await db.update(udyogBatchMembers)
      .set({ role })
      .where(eq(udyogBatchMembers.id, memberId))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Batch member not found" });
    }
    await db.update(udyogAssignments).set({ assignedRole: role })
      .where(and(
        eq(udyogAssignments.userId, updated.userId),
        eq(udyogAssignments.batchId, updated.batchId)
      ));
    res.json(updated);
  } catch (error) {
    console.error("[Udyog Admin] Error updating role:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// PATCH /admin/tasks/:taskId - Update task (assign, set due date, score)
udyogRouter.patch("/admin/tasks/:taskId", async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    const { assignedTo, dueDate, score, status, title, description } = req.body;
    const updates: any = {};
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;
    if (score !== undefined) updates.score = score;
    if (status !== undefined) updates.status = status;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    const [updated] = await db.update(udyogTasks)
      .set(updates)
      .where(eq(udyogTasks.id, taskId))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("[Udyog Admin] Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// POST /admin/batches/:batchId/tasks - Add task to a specific batch
udyogRouter.post("/admin/batches/:batchId/tasks", async (req: Request, res: Response) => {
  try {
    const batchId = parseInt(req.params.batchId, 10);
    const [batch] = await db.select().from(udyogBatches)
      .where(eq(udyogBatches.id, batchId))
      .limit(1);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    const { title, description, assignedTo, dueDate, orderIndex } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }
    const [task] = await db.insert(udyogTasks).values({
      internshipId: batch.internshipId,
      batchId,
      assignedTo: assignedTo || null,
      title,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      orderIndex: orderIndex || 0,
      status: "todo",
    }).returning();
    res.json(task);
  } catch (error) {
    console.error("[Udyog Admin] Error adding batch task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
});

// POST /admin/certificate/generate - Generate certificate for a batch member (admin approval)
udyogRouter.post("/admin/certificate/generate", async (req: Request, res: Response) => {
  try {
    const { userId, batchId } = req.body;
    if (!userId || !batchId) {
      return res.status(400).json({ error: "userId and batchId are required" });
    }
    const [member] = await db.select().from(udyogBatchMembers)
      .where(and(
        eq(udyogBatchMembers.batchId, batchId),
        eq(udyogBatchMembers.userId, userId)
      ))
      .limit(1);
    if (!member) {
      return res.status(404).json({ error: "Batch member not found" });
    }
    const [batch] = await db.select().from(udyogBatches)
      .where(eq(udyogBatches.id, batchId))
      .limit(1);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    const [internship] = await db.select().from(udyogInternships)
      .where(eq(udyogInternships.id, batch.internshipId))
      .limit(1);
    const existingCert = await db.select().from(udyogCertificates)
      .where(and(
        eq(udyogCertificates.userId, userId),
        eq(udyogCertificates.batchId, batchId)
      ))
      .limit(1);
    if (existingCert.length > 0) {
      return res.json({ certificate: existingCert[0], message: "Certificate already generated" });
    }
    const certificateId = `UDYOG-${randomUUID().slice(0, 8).toUpperCase()}`;
    const [certificate] = await db.insert(udyogCertificates).values({
      userId,
      internshipId: batch.internshipId,
      batchId,
      certificateId,
      role: member.role,
      performanceScore: member.performanceScore || 0,
      duration: internship?.duration || "4 weeks",
    }).returning();
    await db.update(udyogAssignments).set({
      status: "completed",
      completedAt: new Date(),
    }).where(and(
      eq(udyogAssignments.userId, userId),
      eq(udyogAssignments.batchId, batchId)
    ));
    res.json({ certificate });
  } catch (error) {
    console.error("[Udyog Admin] Error generating certificate:", error);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
});

// ============ HR HIRING SYSTEM ENDPOINTS ============

// POST /hr/register - HR user registration
udyogRouter.post("/hr/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, companyName, companyWebsite, designation, phone } = req.body;
    if (!email || !password || !name || !companyName) {
      return res.status(400).json({ error: "email, password, name, and companyName are required" });
    }
    const existing = await db.select().from(udyogHrUsers)
      .where(eq(udyogHrUsers.email, email))
      .limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [hrUser] = await db.insert(udyogHrUsers).values({
      email,
      passwordHash,
      name,
      companyName,
      companyWebsite: companyWebsite || null,
      designation: designation || null,
      phone: phone || null,
    }).returning();
    const { passwordHash: _, ...safeUser } = hrUser;
    res.json({ user: safeUser, message: "Registration successful. Awaiting admin approval." });
  } catch (error) {
    console.error("[Udyog HR] Error registering:", error);
    res.status(500).json({ error: "Failed to register" });
  }
});

// POST /hr/login - HR user login
udyogRouter.post("/hr/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const [hrUser] = await db.select().from(udyogHrUsers)
      .where(eq(udyogHrUsers.email, email))
      .limit(1);
    if (!hrUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const validPassword = await bcrypt.compare(password, hrUser.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!hrUser.isApproved) {
      return res.status(403).json({ error: "Account pending admin approval" });
    }
    if (!hrUser.isActive) {
      return res.status(403).json({ error: "Account is deactivated" });
    }
    const { passwordHash: _, ...safeUser } = hrUser;
    res.json({ user: safeUser });
  } catch (error) {
    console.error("[Udyog HR] Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// POST /hr/jobs - Post a new job
udyogRouter.post("/hr/jobs", async (req: Request, res: Response) => {
  try {
    const validation = insertUdyogJobSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }
    const [job] = await db.insert(udyogJobs).values(validation.data).returning();
    res.json(job);
  } catch (error) {
    console.error("[Udyog HR] Error posting job:", error);
    res.status(500).json({ error: "Failed to post job" });
  }
});

// GET /hr/jobs/:hrId - Get all jobs by HR user
udyogRouter.get("/hr/jobs/:hrId", async (req: Request, res: Response) => {
  try {
    const hrId = parseInt(req.params.hrId, 10);
    const jobs = await db.select().from(udyogJobs)
      .where(eq(udyogJobs.hrId, hrId))
      .orderBy(desc(udyogJobs.createdAt));
    res.json(jobs);
  } catch (error) {
    console.error("[Udyog HR] Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// PUT /hr/jobs/:id - Update a job posting
udyogRouter.put("/hr/jobs/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await db.update(udyogJobs)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(udyogJobs.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("[Udyog HR] Error updating job:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// DELETE /hr/jobs/:id - Delete a job posting
udyogRouter.delete("/hr/jobs/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(udyogJobs).where(eq(udyogJobs.id, id));
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("[Udyog HR] Error deleting job:", error);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// GET /hr/candidates/:jobId - Get matching candidates for a job with AI matching score
udyogRouter.get("/hr/candidates/:jobId", async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const [job] = await db.select().from(udyogJobs)
      .where(eq(udyogJobs.id, jobId))
      .limit(1);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    const jobSkills = job.requiredSkills ? job.requiredSkills.split(",").map(s => s.trim().toLowerCase()) : [];
    const assessments = await db.select().from(udyogSkillAssessments);
    const completedAssignments = await db.select().from(udyogAssignments)
      .where(eq(udyogAssignments.status, "completed"));
    const certificates = await db.select().from(udyogCertificates);
    const batchMembers = await db.select().from(udyogBatchMembers);
    const studentScores: Record<string, { skillMatch: number; internshipPerformance: number; certificationBonus: number; total: number; details: any }> = {};
    for (const a of assessments) {
      if (!studentScores[a.userId]) {
        studentScores[a.userId] = { skillMatch: 0, internshipPerformance: 0, certificationBonus: 0, total: 0, details: {} };
      }
      if (jobSkills.includes(a.domain.toLowerCase())) {
        studentScores[a.userId].skillMatch = Math.max(studentScores[a.userId].skillMatch, a.score);
      }
    }
    for (const ca of completedAssignments) {
      if (studentScores[ca.userId]) {
        studentScores[ca.userId].internshipPerformance = Math.max(studentScores[ca.userId].internshipPerformance, ca.skillScore);
      }
    }
    for (const bm of batchMembers) {
      if (studentScores[bm.userId] && bm.performanceScore) {
        studentScores[bm.userId].internshipPerformance = Math.max(studentScores[bm.userId].internshipPerformance, bm.performanceScore);
      }
    }
    for (const cert of certificates) {
      if (studentScores[cert.userId]) {
        studentScores[cert.userId].certificationBonus = Math.min(100, (studentScores[cert.userId].certificationBonus || 0) + 25);
      }
    }
    const candidates = Object.entries(studentScores)
      .map(([userId, scores]) => {
        scores.total = Math.round((scores.skillMatch + scores.internshipPerformance + scores.certificationBonus) / 3);
        return { userId, matchingScore: scores.total, ...scores };
      })
      .filter(c => c.matchingScore >= (job.minSkillScore || 0))
      .sort((a, b) => b.matchingScore - a.matchingScore)
      .slice(0, 10);
    const candidateProfiles = [];
    for (const c of candidates) {
      const [profile] = await db.select().from(shishyaUserProfiles)
        .where(eq(shishyaUserProfiles.userId, c.userId))
        .limit(1);
      candidateProfiles.push({ ...c, profile: profile || null });
    }
    res.json(candidateProfiles);
  } catch (error) {
    console.error("[Udyog HR] Error fetching candidates:", error);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// POST /hr/applications - Apply for a job (student)
udyogRouter.post("/hr/applications", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }
    const existing = await db.select().from(udyogApplications)
      .where(and(
        eq(udyogApplications.jobId, jobId),
        eq(udyogApplications.studentId, req.user!.id)
      ))
      .limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Already applied for this job" });
    }
    const [application] = await db.insert(udyogApplications).values({
      jobId,
      studentId: req.user!.id,
      status: "applied",
    }).returning();
    res.json(application);
  } catch (error) {
    console.error("[Udyog HR] Error applying:", error);
    res.status(500).json({ error: "Failed to apply" });
  }
});

// GET /hr/applications/:jobId - Get all applications for a job
udyogRouter.get("/hr/applications/:jobId", async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const applications = await db.select({
      application: udyogApplications,
      profile: shishyaUserProfiles,
    }).from(udyogApplications)
      .leftJoin(shishyaUserProfiles, eq(udyogApplications.studentId, shishyaUserProfiles.userId))
      .where(eq(udyogApplications.jobId, jobId))
      .orderBy(desc(udyogApplications.appliedAt));
    res.json(applications);
  } catch (error) {
    console.error("[Udyog HR] Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// PATCH /hr/applications/:id/status - Update application status
udyogRouter.patch("/hr/applications/:id/status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const validStatuses = ["applied", "shortlisted", "rejected", "hired"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const [updated] = await db.update(udyogApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(udyogApplications.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("[Udyog HR] Error updating application:", error);
    res.status(500).json({ error: "Failed to update application" });
  }
});

// GET /jobs - List all active jobs (public, for students)
udyogRouter.get("/jobs", async (req: Request, res: Response) => {
  try {
    const jobs = await db.select({
      job: udyogJobs,
      hr: {
        name: udyogHrUsers.name,
        companyName: udyogHrUsers.companyName,
      },
    }).from(udyogJobs)
      .leftJoin(udyogHrUsers, eq(udyogJobs.hrId, udyogHrUsers.id))
      .where(eq(udyogJobs.status, "active"))
      .orderBy(desc(udyogJobs.createdAt));
    res.json(jobs);
  } catch (error) {
    console.error("[Udyog] Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// GET /my-applications - Get current student's job applications
udyogRouter.get("/my-applications", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applications = await db.select({
      application: udyogApplications,
      job: udyogJobs,
    }).from(udyogApplications)
      .leftJoin(udyogJobs, eq(udyogApplications.jobId, udyogJobs.id))
      .where(eq(udyogApplications.studentId, req.user!.id))
      .orderBy(desc(udyogApplications.appliedAt));
    res.json(applications);
  } catch (error) {
    console.error("[Udyog] Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// ============ ADMIN JOB MANAGEMENT ============

// GET /admin/jobs - List all job postings (admin view)
udyogRouter.get("/admin/jobs", async (req: Request, res: Response) => {
  try {
    const jobs = await db.select({
      job: udyogJobs,
      hr: {
        name: udyogHrUsers.name,
        companyName: udyogHrUsers.companyName,
      },
    }).from(udyogJobs)
      .leftJoin(udyogHrUsers, eq(udyogJobs.hrId, udyogHrUsers.id))
      .orderBy(desc(udyogJobs.createdAt));
    res.json(jobs);
  } catch (error) {
    console.error("[Udyog Admin] Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// POST /admin/jobs - Create a job posting (admin)
udyogRouter.post("/admin/jobs", async (req: Request, res: Response) => {
  try {
    const { title, description, requiredSkills, internshipRequired, minSkillScore, location, salaryRange, jobType, status, deadline, hrId } = req.body;

    // Resolve hrId — ensure a default system HR user exists
    let resolvedHrId: number;
    if (hrId) {
      resolvedHrId = hrId;
    } else {
      const existingHr = await db.select().from(udyogHrUsers).limit(1);
      if (existingHr.length > 0) {
        resolvedHrId = existingHr[0].id;
      } else {
        const [defaultHr] = await db.insert(udyogHrUsers).values({
          email: "platform@ourshiksha.com",
          passwordHash: "system",
          name: "OurShiksha Platform",
          companyName: "OurShiksha",
          designation: "Platform Admin",
          isApproved: true,
          isActive: true,
        }).returning();
        resolvedHrId = defaultHr.id;
      }
    }

    const [job] = await db.insert(udyogJobs).values({
      hrId: resolvedHrId,
      title,
      description,
      requiredSkills: requiredSkills || null,
      internshipRequired: internshipRequired || false,
      minSkillScore: minSkillScore || 0,
      location: location || null,
      salaryRange: salaryRange || null,
      jobType: jobType || "full-time",
      status: status || "active",
      deadline: deadline ? new Date(deadline) : null,
    }).returning();
    res.json(job);
  } catch (error) {
    console.error("[Udyog Admin] Error creating job:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
});

// PUT /admin/jobs/:id - Update a job posting (admin)
udyogRouter.put("/admin/jobs/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await db.update(udyogJobs)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(udyogJobs.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("[Udyog Admin] Error updating job:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// DELETE /admin/jobs/:id - Delete a job posting (admin)
udyogRouter.delete("/admin/jobs/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(udyogJobs).where(eq(udyogJobs.id, id));
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("[Udyog Admin] Error deleting job:", error);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// GET /admin/jobs/:jobId/applications - Get all applications for a job (admin)
udyogRouter.get("/admin/jobs/:jobId/applications", async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const applications = await db.select({
      application: udyogApplications,
    }).from(udyogApplications)
      .where(eq(udyogApplications.jobId, jobId))
      .orderBy(desc(udyogApplications.appliedAt));
    res.json(applications.map(a => a.application));
  } catch (error) {
    console.error("[Udyog Admin] Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// PATCH /admin/applications/:id/status - Update application status (admin)
udyogRouter.patch("/admin/applications/:id/status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const [updated] = await db.update(udyogApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(udyogApplications.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("[Udyog Admin] Error updating application:", error);
    res.status(500).json({ error: "Failed to update application" });
  }
});

// ============ ADMIN HR MANAGEMENT ============

// GET /admin/hr-users - List all HR user registrations
udyogRouter.get("/admin/hr-users", async (req: Request, res: Response) => {
  try {
    const hrUsers = await db.select({
      id: udyogHrUsers.id,
      email: udyogHrUsers.email,
      name: udyogHrUsers.name,
      companyName: udyogHrUsers.companyName,
      companyWebsite: udyogHrUsers.companyWebsite,
      designation: udyogHrUsers.designation,
      phone: udyogHrUsers.phone,
      isApproved: udyogHrUsers.isApproved,
      isActive: udyogHrUsers.isActive,
      approvedAt: udyogHrUsers.approvedAt,
      createdAt: udyogHrUsers.createdAt,
    }).from(udyogHrUsers)
      .orderBy(desc(udyogHrUsers.createdAt));
    res.json(hrUsers);
  } catch (error) {
    console.error("[Udyog Admin] Error fetching HR users:", error);
    res.status(500).json({ error: "Failed to fetch HR users" });
  }
});

// PATCH /admin/hr-users/:id/approve - Approve or reject HR user
udyogRouter.patch("/admin/hr-users/:id/approve", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { approved } = req.body;
    const [updated] = await db.update(udyogHrUsers)
      .set({
        isApproved: approved,
        approvedAt: approved ? new Date() : null,
      })
      .where(eq(udyogHrUsers.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: "HR user not found" });
    }
    const { passwordHash: _, ...safeUser } = updated;
    res.json(safeUser);
  } catch (error) {
    console.error("[Udyog Admin] Error approving HR user:", error);
    res.status(500).json({ error: "Failed to approve HR user" });
  }
});

// ============ AI BUILDERS ============

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /admin/ai/generate-internship - AI Internship Builder
udyogRouter.post("/admin/ai/generate-internship", async (req: Request, res: Response) => {
  try {
    const { title, skillLevel, extraInstructions } = req.body;
    if (!title || !skillLevel) {
      return res.status(400).json({ error: "Title and skill level are required" });
    }

    const levelGuide: Record<string, string> = {
      beginner: "Entry-level, no prior experience needed. Duration: 4 weeks. Focus on fundamentals and guided tasks.",
      intermediate: "Some experience expected. Duration: 6 weeks. Focus on practical application and independent work.",
      advanced: "Strong prior knowledge required. Duration: 8 weeks. Focus on complex projects, leadership, and architecture.",
      mastery: "Expert/Principal level. Duration: 12 weeks. Production-grade project with full architecture, team leadership, and live deployment.",
    };

    const freeToolsGuide = `Free tools students MUST use (always recommend these over paid alternatives):
- Frontend hosting: Vercel (vercel.com) — free tier, deploy with \`npx vercel\`
- Backend hosting: Railway (railway.app) or Render (render.com) — free tier
- Database: Neon (neon.tech) — free PostgreSQL, or Supabase (supabase.com) — free PostgreSQL + auth
- Auth: Clerk (clerk.com) free tier, or NextAuth.js (free, self-hosted)
- Email: Resend (resend.com) free 3000 emails/month, or Nodemailer with Gmail SMTP
- File uploads: Cloudinary (cloudinary.com) free 25GB, or Uploadthing (uploadthing.com) free
- Version control: GitHub (github.com) — free repos, GitHub Actions for CI/CD
- AI/ML: Groq (groq.com) free API, or Hugging Face (huggingface.co) free inference
- Monitoring: Vercel Analytics (free), or LogSnag free tier`;

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a senior software engineering mentor for "Our Udyog", an AI-powered virtual internship platform for students. You create complete, practical project guides that students can follow from zero to a deployed live product using only FREE tools. Every step must include exact terminal commands, real file paths, real expected output, and free tool names with their URLs. Never use paid services. Never be vague — always write exactly what to type, click, or run. Output ONLY a valid JSON object, no markdown fences, no extra text.`
        },
        {
          role: "user",
          content: `Create a complete virtual internship project guide for students:
Title: "${title}"
Skill Level: ${skillLevel} — ${levelGuide[skillLevel] || levelGuide.beginner}
${extraInstructions ? `Admin requirements: ${extraInstructions}\n` : ""}

${freeToolsGuide}

Return EXACTLY this JSON structure (no extra fields, no markdown):

{
  "title": "${title}",
  "description": "2 paragraphs: (1) what real-world problem this project solves and why it matters for companies today. (2) the complete tech stack using only free tools — framework, database, hosting, and why each was chosen for this project.",
  "shortDescription": "compelling one-liner under 80 chars",
  "skillLevel": "${skillLevel}",
  "domain": "specific domain e.g. Web Development, Data Engineering, AI/ML",
  "duration": "X weeks",
  "requiredSkills": "comma-separated list of skills students need before starting",
  "milestones": "Week 1: milestone, Week 2: milestone, Week 3: milestone",
  "batchSize": 5,

  "introduction": "2 paragraphs: (1) The real-world problem this project solves with specific industry context — which companies face this problem, why it matters, and what a working solution enables. (2) The full technology stack with exact versions: framework, database (Neon/Supabase), hosting (Vercel/Railway/Render), auth (Clerk/NextAuth), email (Resend), and any domain-specific tools — explain why each free tool was chosen.",

  "goal": "2 sentences: (1) exactly what the student will have built and deployed live by the end — name the specific features and the live URL format. (2) the specific technical skills mastered and how this project helps them land a junior developer role.",

  "features": [
    {
      "title": "Feature 1: [specific feature name]",
      "description": "1-2 sentences describing exactly what this feature does and what problem it solves for users",
      "tasks": [
        {
          "title": "Task 1: [action verb + specific outcome]",
          "description": "1-2 sentences: what this task produces and the concrete done criteria",
          "tools": ["ToolName1 (url)", "ToolName2 (url)"],
          "process": "3-4 sentence step-by-step overview: what to do first, what files to create, what commands to run in sequence, and how to know it worked",
          "steps": [
            "Step 1: [exact terminal command or action] — expected output: [what appears in terminal/browser]",
            "Step 2: [exact file path and what to write or edit] — example: [show real value or code snippet]",
            "Step 3: [next exact command or browser action] — confirm by: [specific thing to check]",
            "Step 4: [verification step] — run: [command] — result: [expected output]",
            "Step 5: [git commit or deploy step] — run: git add . && git commit -m 'feat: [description]' — result: [expected output]"
          ],
          "checklist": [
            "[ ] [specific file exists at exact path]",
            "[ ] [command output or API response matches expected value]",
            "[ ] [feature visible and working in browser at localhost:PORT]",
            "[ ] [code committed to GitHub with meaningful commit message]"
          ],
          "practice": "Build [specific thing] independently using [specific free tools]. Expected output: [what it should look like or return]. Submit: [exact file or screenshot to submit]."
        },
        {
          "title": "Task 2: [action + outcome]",
          "description": "1-2 sentences",
          "tools": ["ToolName (url)"],
          "process": "3-4 sentence overview",
          "steps": [
            "Step 1: [exact command] — expected output: [result]",
            "Step 2: [exact action] — example: [value]",
            "Step 3: [next action] — confirm by: [check]",
            "Step 4: [verify] — run: [command] — result: [output]",
            "Step 5: [commit] — run: git add . && git commit -m 'feat: [msg]'"
          ],
          "checklist": ["[ ] item 1", "[ ] item 2", "[ ] item 3", "[ ] item 4"],
          "practice": "Build [thing] independently. Submit: [deliverable]."
        },
        {
          "title": "Task 3: [action + outcome]",
          "description": "1-2 sentences",
          "tools": ["ToolName (url)"],
          "process": "3-4 sentence overview",
          "steps": [
            "Step 1: [command] — expected: [result]",
            "Step 2: [action] — example: [value]",
            "Step 3: [next] — confirm by: [check]",
            "Step 4: [verify] — run: [cmd]",
            "Step 5: [commit]"
          ],
          "checklist": ["[ ] item 1", "[ ] item 2", "[ ] item 3", "[ ] item 4"],
          "practice": "Build [thing] independently. Submit: [deliverable]."
        }
      ]
    },
    {
      "title": "Feature 2: [feature name]",
      "description": "1-2 sentences",
      "tasks": [
        {
          "title": "Task 1: [action + outcome]",
          "description": "1-2 sentences",
          "tools": ["ToolName (url)"],
          "process": "3-4 sentence overview",
          "steps": ["Step 1: [cmd] — expected: [result]", "Step 2: [action] — example: [value]", "Step 3: [next] — confirm by: [check]", "Step 4: [verify] — run: [cmd]", "Step 5: [commit]"],
          "checklist": ["[ ] item 1", "[ ] item 2", "[ ] item 3", "[ ] item 4"],
          "practice": "Build [thing]. Submit: [deliverable]."
        },
        {
          "title": "Task 2: [action + outcome]",
          "description": "1-2 sentences",
          "tools": ["ToolName (url)"],
          "process": "3-4 sentence overview",
          "steps": ["Step 1: [cmd] — expected: [result]", "Step 2: [action] — example: [value]", "Step 3: [next] — confirm by: [check]", "Step 4: [verify]", "Step 5: [commit]"],
          "checklist": ["[ ] item 1", "[ ] item 2", "[ ] item 3", "[ ] item 4"],
          "practice": "Build [thing]. Submit: [deliverable]."
        },
        {
          "title": "Task 3: [action + outcome]",
          "description": "1-2 sentences",
          "tools": ["ToolName (url)"],
          "process": "3-4 sentence overview",
          "steps": ["Step 1: [cmd] — expected: [result]", "Step 2: [action]", "Step 3: [next]", "Step 4: [verify]", "Step 5: [commit]"],
          "checklist": ["[ ] item 1", "[ ] item 2", "[ ] item 3", "[ ] item 4"],
          "practice": "Build [thing]. Submit: [deliverable]."
        }
      ]
    },
    {
      "title": "Feature 3: [feature name]",
      "description": "1-2 sentences",
      "tasks": [
        {
          "title": "Task 1: [action + outcome]",
          "description": "1-2 sentences",
          "tools": ["ToolName (url)"],
          "process": "3-4 sentence overview",
          "steps": ["Step 1: [cmd] — expected: [result]", "Step 2: [action]", "Step 3: [next]", "Step 4: [verify]", "Step 5: [commit]"],
          "checklist": ["[ ] item 1", "[ ] item 2", "[ ] item 3", "[ ] item 4"],
          "practice": "Build [thing]. Submit: [deliverable]."
        },
        {
          "title": "Task 2: [action + outcome]",
          "description": "1-2 sentences",
          "tools": ["ToolName (url)"],
          "process": "3-4 sentence overview",
          "steps": ["Step 1: [cmd]", "Step 2: [action]", "Step 3: [next]", "Step 4: [verify]", "Step 5: [commit]"],
          "checklist": ["[ ] item 1", "[ ] item 2", "[ ] item 3", "[ ] item 4"],
          "practice": "Build [thing]. Submit: [deliverable]."
        },
        {
          "title": "Task 3: [action + outcome]",
          "description": "1-2 sentences",
          "tools": ["ToolName (url)"],
          "process": "3-4 sentence overview",
          "steps": ["Step 1: [cmd]", "Step 2: [action]", "Step 3: [next]", "Step 4: [verify]", "Step 5: [commit]"],
          "checklist": ["[ ] item 1", "[ ] item 2", "[ ] item 3", "[ ] item 4"],
          "practice": "Build [thing]. Submit: [deliverable]."
        }
      ]
    }
  ],

  "finalIntegration": "3 paragraphs: (1) How all 3 features connect — describe the data flow from user action through each feature to the database and back. (2) Exact steps to wire everything together: environment variables to set, how frontend calls backend, how backend connects to Neon/Supabase database — include example .env keys. (3) Run the full project locally: the exact commands to start frontend and backend, the 5 specific user journeys to test end-to-end before deploying.",

  "testing": "2 paragraphs: (1) Manual testing checklist — list 8 specific user journeys to test in the browser with exact expected outcomes (what to click, what should appear). (2) How to test API endpoints using curl or Thunder Client (VS Code extension, free) — give 3 specific curl commands with expected JSON responses.",

  "deployment": "3 paragraphs: (1) Deploy frontend to Vercel: run 'npm run build' then 'npx vercel --prod', set environment variables in Vercel dashboard (list exact variable names), confirm live URL format. (2) Deploy backend to Railway or Render: push to GitHub, connect repo, set environment variables (list each one), confirm deployment URL. (3) Post-deployment checklist: 5 specific things to test on the live URL to confirm everything works.",

  "liveProjectOutput": "2 paragraphs: (1) What the live app does — list every feature a user can interact with, the live URL format (e.g. https://project-name.vercel.app), and any admin features. (2) Portfolio entry template: 'Built [project name] — a [description] using [tech stack]. Deployed at [url]. Implemented [feature 1], [feature 2], [feature 3]. Solved [specific challenge]. Tech: [list all tools used].'"
}

Generate exactly 3 features. Each feature has exactly 3 tasks. Each task must have exactly 5 steps and 4 checklist items. Always use free tools (Vercel, Neon, Railway, Render, Clerk, Resend, Cloudinary, GitHub). Make steps technically specific to "${title}" — use real command names, real file paths, real expected outputs for this exact project domain.`
        }
      ],
      max_tokens: 12000,
      temperature: 0.65,
    });

    const choice = response.choices[0];
    if (choice?.finish_reason === "length") {
      console.error("[Udyog AI] Response truncated by token limit");
      return res.status(500).json({ error: "AI response was too long. Please use a shorter title or reduce requirements." });
    }
    const content = choice?.message?.content || "";
    let parsed: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return res.status(500).json({ error: "Failed to parse AI response" });
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr: any) {
      console.error("[Udyog AI] JSON parse error:", parseErr?.message);
      return res.status(500).json({ error: "AI generated invalid JSON. Please try again." });
    }
    res.json(parsed);
  } catch (error) {
    console.error("[Udyog AI] Error generating internship:", error);
    res.status(500).json({ error: "Failed to generate internship. Please try again." });
  }
});

// POST /admin/ai/generate-job - AI Job Builder
udyogRouter.post("/admin/ai/generate-job", async (req: Request, res: Response) => {
  try {
    const { title, jobType, extraInstructions } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Job title is required" });
    }

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert HR recruiter and job description writer. Create compelling, detailed job postings for tech roles. The jobs are posted on "Our Udyog" platform which connects graduates of virtual internship programs with employers. Return ONLY valid JSON, no markdown.`
        },
        {
          role: "user",
          content: `Create a job posting with the following title:
Title: "${title}"
Job Type: ${jobType || "full-time"}

Return a JSON object with this exact structure:
{
  "title": "${title}",
  "description": "Detailed 2-3 paragraph job description covering role overview, responsibilities, what the candidate will work on, team culture, and growth opportunities",
  "requiredSkills": "Comma-separated list of 5-8 required technical skills",
  "internshipRequired": true or false (whether completing an Our Udyog internship is required),
  "minSkillScore": a number 0-100 (minimum skill assessment score required, 0 for no requirement),
  "location": "City, Country or Remote",
  "salaryRange": "₹X - ₹Y LPA or ₹X - ₹Y per month",
  "jobType": "${jobType || "full-time"}"
}

Make the description professional, engaging, and realistic. Include specific technologies and responsibilities.${extraInstructions ? `\n\nAdditional Instructions from admin: ${extraInstructions}` : ""}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (error) {
    console.error("[Udyog AI] Error generating job:", error);
    res.status(500).json({ error: "Failed to generate job posting. Please try again." });
  }
});

// GET /admin/analytics - Platform analytics overview
udyogRouter.get("/admin/analytics", async (req: Request, res: Response) => {
  try {
    const [internshipCount] = await db.select({ cnt: count() }).from(udyogInternships);
    const [batchCount] = await db.select({ cnt: count() }).from(udyogBatches);
    const [activeBatchCount] = await db.select({ cnt: count() }).from(udyogBatches)
      .where(eq(udyogBatches.status, "active"));
    const [studentCount] = await db.select({ cnt: count() }).from(udyogAssignments);
    const [completedCount] = await db.select({ cnt: count() }).from(udyogAssignments)
      .where(eq(udyogAssignments.status, "completed"));
    const [certCount] = await db.select({ cnt: count() }).from(udyogCertificates);
    const [hrCount] = await db.select({ cnt: count() }).from(udyogHrUsers);
    const [approvedHrCount] = await db.select({ cnt: count() }).from(udyogHrUsers)
      .where(eq(udyogHrUsers.isApproved, true));
    const [jobCount] = await db.select({ cnt: count() }).from(udyogJobs);
    const [applicationCount] = await db.select({ cnt: count() }).from(udyogApplications);
    const [hiredCount] = await db.select({ cnt: count() }).from(udyogApplications)
      .where(eq(udyogApplications.status, "hired"));
    res.json({
      internships: internshipCount.cnt,
      batches: { total: batchCount.cnt, active: activeBatchCount.cnt },
      students: { enrolled: studentCount.cnt, completed: completedCount.cnt },
      certificates: certCount.cnt,
      hr: { total: hrCount.cnt, approved: approvedHrCount.cnt },
      jobs: jobCount.cnt,
      applications: { total: applicationCount.cnt, hired: hiredCount.cnt },
    });
  } catch (error) {
    console.error("[Udyog Admin] Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
