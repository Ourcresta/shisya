import { Router, Response } from "express";
import { db } from "./db";
import { 
  userCredits, 
  creditTransactions, 
  courseEnrollments,
  WELCOME_BONUS_CREDITS 
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "./auth";

export const creditsRouter = Router();

// GET /api/user/credits - Get user's credit balance and stats
creditsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get or create user credits record
    let credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (credits.length === 0) {
      // Initialize credits for user (without welcome bonus - that happens on signup)
      const [newCredits] = await db
        .insert(userCredits)
        .values({
          userId,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
        })
        .returning();
      credits = [newCredits];
    }

    res.json({
      balance: credits[0].balance,
      totalEarned: credits[0].totalEarned,
      totalSpent: credits[0].totalSpent,
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    res.status(500).json({ error: "Failed to fetch credits" });
  }
});

// GET /api/user/credits/transactions - Get credit transaction history
creditsRouter.get("/transactions", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(limit);

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// POST /api/user/credits/welcome-bonus - Apply welcome bonus (only once per user)
creditsRouter.post("/welcome-bonus", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Check if user already received welcome bonus
    const existingBonus = await db
      .select()
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.userId, userId),
          eq(creditTransactions.reason, "WELCOME_BONUS")
        )
      )
      .limit(1);

    if (existingBonus.length > 0) {
      return res.status(400).json({ error: "Welcome bonus already applied" });
    }

    // Get or create user credits
    let credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    let currentBalance = 0;
    if (credits.length === 0) {
      await db.insert(userCredits).values({
        userId,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
      });
    } else {
      currentBalance = credits[0].balance;
    }

    const newBalance = currentBalance + WELCOME_BONUS_CREDITS;

    // Update balance
    await db
      .update(userCredits)
      .set({
        balance: newBalance,
        totalEarned: (credits[0]?.totalEarned || 0) + WELCOME_BONUS_CREDITS,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId));

    // Record transaction
    await db.insert(creditTransactions).values({
      userId,
      amount: WELCOME_BONUS_CREDITS,
      type: "BONUS",
      reason: "WELCOME_BONUS",
      description: "Welcome bonus for new users",
      balanceAfter: newBalance,
    });

    res.json({
      success: true,
      creditsAdded: WELCOME_BONUS_CREDITS,
      newBalance,
    });
  } catch (error) {
    console.error("Error applying welcome bonus:", error);
    res.status(500).json({ error: "Failed to apply welcome bonus" });
  }
});

// GET /api/enrollments - Get user's course enrollments
creditsRouter.get("/enrollments", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const enrollments = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId))
      .orderBy(desc(courseEnrollments.enrolledAt));

    res.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

// POST /api/enrollments - Enroll in a course
creditsRouter.post("/enrollments", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId, creditCost } = req.body;

    if (!courseId || creditCost === undefined) {
      return res.status(400).json({ error: "courseId and creditCost are required" });
    }

    // Check if already enrolled
    const existingEnrollment = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.courseId, courseId)
        )
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    // Get user credits
    const credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (credits.length === 0) {
      return res.status(400).json({ error: "No credit account found" });
    }

    const currentBalance = credits[0].balance;

    // Check if user has enough credits (skip for free courses)
    if (creditCost > 0 && currentBalance < creditCost) {
      return res.status(400).json({ 
        error: "Insufficient credits",
        required: creditCost,
        available: currentBalance,
      });
    }

    // Deduct credits if not free
    if (creditCost > 0) {
      const newBalance = currentBalance - creditCost;

      await db
        .update(userCredits)
        .set({
          balance: newBalance,
          totalSpent: credits[0].totalSpent + creditCost,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));

      // Record transaction
      await db.insert(creditTransactions).values({
        userId,
        amount: -creditCost,
        type: "DEBIT",
        reason: "COURSE_ENROLLMENT",
        description: `Enrolled in course #${courseId}`,
        referenceId: courseId,
        balanceAfter: newBalance,
      });
    }

    // Create enrollment
    const [enrollment] = await db
      .insert(courseEnrollments)
      .values({
        userId,
        courseId,
        creditsPaid: creditCost,
      })
      .returning();

    // Get updated balance
    const updatedCredits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    res.json({
      success: true,
      enrollment,
      newBalance: updatedCredits[0]?.balance || 0,
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ error: "Failed to enroll in course" });
  }
});

// GET /api/enrollments/check/:courseId - Check if enrolled in a specific course
creditsRouter.get("/enrollments/check/:courseId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const courseId = parseInt(req.params.courseId, 10);

    const enrollment = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.courseId, courseId)
        )
      )
      .limit(1);

    res.json({
      enrolled: enrollment.length > 0,
      enrollment: enrollment[0] || null,
    });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    res.status(500).json({ error: "Failed to check enrollment" });
  }
});
