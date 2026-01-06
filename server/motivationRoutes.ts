import { Express } from "express";
import { db } from "./db";
import {
  motivationRules,
  motivationCards,
  mysteryBoxes,
  aiNudgeLogs,
  studentStreaks,
  userScholarships,
  scholarships,
  userCredits,
  creditTransactions,
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  evaluateRulesForStudent,
  updateStudentStreak,
  getActiveRules,
  createRule,
  collectStudentSignals,
} from "./ai";
import { seedDefaultRules } from "./ai/seedRules";

export function registerMotivationRoutes(app: Express) {
  seedDefaultRules().catch(console.error);

  app.get("/api/motivation/rules", async (req, res) => {
    try {
      const rules = await getActiveRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching motivation rules:", error);
      res.status(500).json({ error: "Failed to fetch rules" });
    }
  });

  app.post("/api/motivation/rules", async (req, res) => {
    try {
      const rule = await createRule(req.body);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating motivation rule:", error);
      res.status(500).json({ error: "Failed to create rule" });
    }
  });

  app.put("/api/motivation/rules/:ruleId", async (req, res) => {
    try {
      const { ruleId } = req.params;
      const ruleIdNum = parseInt(ruleId, 10);

      const { name, description, ruleType, conditions, actions, priority, cooldownHours, maxTriggerCount, isActive, isGlobal, courseId } = req.body;

      await db.update(motivationRules)
        .set({
          name,
          description,
          ruleType,
          conditions,
          actions,
          priority,
          cooldownHours,
          maxTriggerCount,
          isActive,
          isGlobal,
          courseId,
          updatedAt: new Date(),
        })
        .where(eq(motivationRules.id, ruleIdNum));

      const updated = await db.select().from(motivationRules).where(eq(motivationRules.id, ruleIdNum)).limit(1);
      res.json(updated[0]);
    } catch (error) {
      console.error("Error updating motivation rule:", error);
      res.status(500).json({ error: "Failed to update rule" });
    }
  });

  app.delete("/api/motivation/rules/:ruleId", async (req, res) => {
    try {
      const { ruleId } = req.params;
      const ruleIdNum = parseInt(ruleId, 10);

      await db.update(motivationRules)
        .set({ isActive: false })
        .where(eq(motivationRules.id, ruleIdNum));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting motivation rule:", error);
      res.status(500).json({ error: "Failed to delete rule" });
    }
  });

  app.post("/api/motivation/evaluate", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { courseId } = req.body;
      
      await updateStudentStreak(user.id);
      
      const results = await evaluateRulesForStudent(user.id, courseId);
      
      res.json({
        triggered: results.filter(r => r.triggered).length,
        skipped: results.filter(r => !r.triggered).length,
        results,
      });
    } catch (error) {
      console.error("Error evaluating motivation rules:", error);
      res.status(500).json({ error: "Failed to evaluate rules" });
    }
  });

  app.get("/api/motivation/signals", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const courseId = req.query.courseId ? parseInt(req.query.courseId as string, 10) : undefined;
      const signals = await collectStudentSignals(user.id, courseId);
      
      res.json(signals);
    } catch (error) {
      console.error("Error fetching student signals:", error);
      res.status(500).json({ error: "Failed to fetch signals" });
    }
  });

  app.get("/api/motivation/streak", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const streak = await db.select()
        .from(studentStreaks)
        .where(eq(studentStreaks.userId, user.id))
        .limit(1);

      res.json(streak[0] || {
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
      });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ error: "Failed to fetch streak" });
    }
  });

  app.get("/api/motivation/cards", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const cards = await db.select()
        .from(motivationCards)
        .where(eq(motivationCards.userId, user.id))
        .orderBy(desc(motivationCards.createdAt));

      res.json(cards);
    } catch (error) {
      console.error("Error fetching motivation cards:", error);
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });

  app.get("/api/cards/:cardId", async (req, res) => {
    try {
      const { cardId } = req.params;

      const card = await db.select()
        .from(motivationCards)
        .where(eq(motivationCards.cardId, cardId))
        .limit(1);

      if (card.length === 0) {
        return res.status(404).json({ error: "Card not found" });
      }

      await db.update(motivationCards)
        .set({ viewCount: sql`${motivationCards.viewCount} + 1` })
        .where(eq(motivationCards.cardId, cardId));

      res.json(card[0]);
    } catch (error) {
      console.error("Error fetching card:", error);
      res.status(500).json({ error: "Failed to fetch card" });
    }
  });

  app.get("/api/motivation/mystery-boxes", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const boxes = await db.select()
        .from(mysteryBoxes)
        .where(and(eq(mysteryBoxes.userId, user.id), eq(mysteryBoxes.isOpened, false)))
        .orderBy(desc(mysteryBoxes.createdAt));

      res.json(boxes);
    } catch (error) {
      console.error("Error fetching mystery boxes:", error);
      res.status(500).json({ error: "Failed to fetch mystery boxes" });
    }
  });

  app.post("/api/motivation/mystery-boxes/:boxId/open", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { boxId } = req.params;

      const box = await db.select()
        .from(mysteryBoxes)
        .where(and(eq(mysteryBoxes.boxId, boxId), eq(mysteryBoxes.userId, user.id)))
        .limit(1);

      if (box.length === 0) {
        return res.status(404).json({ error: "Mystery box not found" });
      }

      if (box[0].isOpened) {
        return res.status(400).json({ error: "Box already opened" });
      }

      if (box[0].expiresAt && new Date(box[0].expiresAt) < new Date()) {
        return res.status(400).json({ error: "Box has expired" });
      }

      await db.update(mysteryBoxes)
        .set({ isOpened: true, openedAt: new Date() })
        .where(eq(mysteryBoxes.boxId, boxId));

      const rewardValue = box[0].rewardValue ? JSON.parse(box[0].rewardValue) : {};
      
      if (box[0].rewardType === "coins" && rewardValue.amount) {
        const existingCredits = await db.select().from(userCredits).where(eq(userCredits.userId, user.id)).limit(1);
        
        if (existingCredits.length === 0) {
          await db.insert(userCredits).values({
            userId: user.id,
            balance: rewardValue.amount,
            totalEarned: rewardValue.amount,
            totalSpent: 0,
          });
        } else {
          await db.update(userCredits)
            .set({
              balance: sql`${userCredits.balance} + ${rewardValue.amount}`,
              totalEarned: sql`${userCredits.totalEarned} + ${rewardValue.amount}`,
              updatedAt: new Date(),
            })
            .where(eq(userCredits.userId, user.id));
        }

        const updatedCredits = await db.select().from(userCredits).where(eq(userCredits.userId, user.id)).limit(1);
        
        await db.insert(creditTransactions).values({
          userId: user.id,
          amount: rewardValue.amount,
          type: "BONUS",
          reason: "REWARD",
          description: `Mystery Box reward`,
          balanceAfter: updatedCredits[0]?.balance || rewardValue.amount,
        });
      }

      res.json({
        success: true,
        rewardType: box[0].rewardType,
        rewardValue,
      });
    } catch (error) {
      console.error("Error opening mystery box:", error);
      res.status(500).json({ error: "Failed to open mystery box" });
    }
  });

  app.get("/api/motivation/nudges", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const nudges = await db.select()
        .from(aiNudgeLogs)
        .where(and(eq(aiNudgeLogs.userId, user.id), eq(aiNudgeLogs.isRead, false)))
        .orderBy(desc(aiNudgeLogs.sentAt))
        .limit(10);

      res.json(nudges);
    } catch (error) {
      console.error("Error fetching nudges:", error);
      res.status(500).json({ error: "Failed to fetch nudges" });
    }
  });

  app.post("/api/motivation/nudges/:nudgeId/read", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { nudgeId } = req.params;
      const nudgeIdNum = parseInt(nudgeId, 10);

      await db.update(aiNudgeLogs)
        .set({ isRead: true })
        .where(and(eq(aiNudgeLogs.id, nudgeIdNum), eq(aiNudgeLogs.userId, user.id)));

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking nudge as read:", error);
      res.status(500).json({ error: "Failed to mark nudge as read" });
    }
  });

  app.get("/api/motivation/scholarships", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userScholarshipsList = await db.select({
        userScholarship: userScholarships,
        scholarship: scholarships,
      })
        .from(userScholarships)
        .innerJoin(scholarships, eq(userScholarships.scholarshipId, scholarships.id))
        .where(and(eq(userScholarships.userId, user.id), eq(userScholarships.isUsed, false)));

      res.json(userScholarshipsList);
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      res.status(500).json({ error: "Failed to fetch scholarships" });
    }
  });

  console.log("[MotivationRoutes] Registered motivation engine routes");
}
