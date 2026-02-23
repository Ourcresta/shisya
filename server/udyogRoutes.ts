import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { db } from "./db";
import {
  udyogInternships, udyogAssignments, udyogTasks, udyogSubmissions,
  udyogCertificates, udyogSkillAssessments, udyogBatches, udyogBatchMembers,
  udyogHrUsers, udyogJobs, udyogApplications,
  insertUdyogInternshipSchema, insertUdyogJobSchema,
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
      const now = new Date();
      const durationWeeks = parseInt(internship.duration) || 4;
      const endDate = new Date(now.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);
      await db.update(udyogBatches).set({
        status: "active",
        startDate: now,
        endDate,
      }).where(eq(udyogBatches.id, formingBatch.id));
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
    res.json({ assignment, internship, batch: formingBatch });
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

// GET /my-batch - Get current user's active batch (auth required)
udyogRouter.get("/my-batch", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [assignment] = await db.select().from(udyogAssignments)
      .where(and(
        eq(udyogAssignments.userId, req.user!.id),
        eq(udyogAssignments.status, "active")
      ))
      .orderBy(desc(udyogAssignments.createdAt))
      .limit(1);
    if (!assignment || !assignment.batchId) {
      return res.status(404).json({ error: "No active batch found" });
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
    res.json({ batch, internship, assignment, members, tasks, progress });
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
    const [job] = await db.insert(udyogJobs).values({
      hrId: hrId || 1,
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
    const { title, skillLevel } = req.body;
    if (!title || !skillLevel) {
      return res.status(400).json({ error: "Title and skill level are required" });
    }

    const levelGuide: Record<string, string> = {
      beginner: "Entry-level, no prior experience needed. Duration: 4 weeks. Focus on fundamentals and guided tasks.",
      intermediate: "Some experience expected. Duration: 6 weeks. Focus on practical application and independent work.",
      advanced: "Strong prior knowledge required. Duration: 8 weeks. Focus on complex projects, leadership, and architecture.",
    };

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert internship program designer for an AI-powered virtual internship platform called "Our Udyog". Design realistic, industry-relevant virtual internships that simulate real workplace environments. Students work in batches of 5 with roles (Team Lead, Developer, QA/Tester). Return ONLY valid JSON, no markdown.`
        },
        {
          role: "user",
          content: `Create a virtual internship program with the following details:
Title: "${title}"
Skill Level: ${skillLevel} - ${levelGuide[skillLevel] || levelGuide.beginner}

Return a JSON object with this exact structure:
{
  "title": "${title}",
  "description": "Detailed 2-3 paragraph description of the internship program, what students will learn, technologies used, and what they'll build",
  "shortDescription": "One-line summary (max 100 chars) for card display",
  "skillLevel": "${skillLevel}",
  "domain": "The primary domain (e.g., Web Development, Data Science, Mobile Development, DevOps, UI/UX Design, Machine Learning, Cybersecurity, Cloud Computing)",
  "duration": "X weeks",
  "requiredSkills": "Comma-separated list of 4-6 prerequisite skills",
  "milestones": "Comma-separated list of 4-6 key milestones students should achieve",
  "batchSize": 5,
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed task description with clear deliverables",
      "orderIndex": 1
    }
  ]
}

Generate 6-10 tasks that progressively build skills. Tasks should be specific, actionable, and relevant to the internship domain. Include a mix of individual and collaborative tasks.`
        }
      ],
      max_tokens: 3000,
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
    console.error("[Udyog AI] Error generating internship:", error);
    res.status(500).json({ error: "Failed to generate internship. Please try again." });
  }
});

// POST /admin/ai/generate-job - AI Job Builder
udyogRouter.post("/admin/ai/generate-job", async (req: Request, res: Response) => {
  try {
    const { title, jobType } = req.body;
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

Make the description professional, engaging, and realistic. Include specific technologies and responsibilities.`
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
