import { Router, Response } from "express";
import { db } from "./db";
import { 
  userCredits, 
  creditTransactions, 
  courseEnrollments,
  vouchers,
  voucherRedemptions,
  giftBoxes,
  users,
  courses as coursesTable,
  WELCOME_BONUS_CREDITS 
} from "@shared/schema";
import { eq, and, desc, lt, gt, isNull, or } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "./auth";
import * as zohoService from "./zohoService";

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

    // Auto-enroll on TrainerCentral (non-blocking)
    try {
      const isConnected = await zohoService.isConnected();
      if (isConnected) {
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (course?.zohoId && user?.email) {
          const emailParts = user.email.split("@")[0];
          const firstName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
          zohoService.inviteLearnerToCourse(user.email, firstName, "Student", course.zohoId).catch((tcErr) => {
            console.error("[TC Sync] Failed to enroll student in TC course:", tcErr.message);
          });
          console.log(`[TC Sync] Initiated TrainerCentral course enrollment for ${user.email} in course ${course.zohoId}`);
        }
      }
    } catch (tcError) {
      console.error("[TC Sync] TrainerCentral enrollment check failed:", tcError);
    }

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

// POST /api/wallet/redeem-voucher - Redeem a voucher code
creditsRouter.post("/redeem-voucher", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Voucher code is required" });
    }

    const voucherCode = code.trim().toUpperCase();

    // Find the voucher
    const [voucher] = await db
      .select()
      .from(vouchers)
      .where(eq(vouchers.code, voucherCode))
      .limit(1);

    if (!voucher) {
      return res.status(400).json({ error: "Invalid voucher code" });
    }

    // Check if voucher is active
    if (!voucher.isActive) {
      return res.status(400).json({ error: "This voucher is no longer active" });
    }

    // Check expiry
    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return res.status(400).json({ error: "This voucher has expired" });
    }

    // Check usage limit
    if (voucher.maxUsage && voucher.usedCount >= voucher.maxUsage) {
      return res.status(400).json({ error: "This voucher has reached its usage limit" });
    }

    // Check if user already redeemed this voucher
    const existingRedemption = await db
      .select()
      .from(voucherRedemptions)
      .where(
        and(
          eq(voucherRedemptions.userId, userId),
          eq(voucherRedemptions.voucherCode, voucherCode)
        )
      )
      .limit(1);

    if (existingRedemption.length > 0) {
      return res.status(400).json({ error: "You have already redeemed this voucher" });
    }

    // Calculate points with bonus
    let pointsToAdd = voucher.points;
    if (voucher.bonusPercent && voucher.bonusPercent > 0) {
      pointsToAdd = Math.floor(voucher.points * (1 + voucher.bonusPercent / 100));
    }

    // Get current balance
    const [credits] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    const currentBalance = credits?.balance || 0;
    const newBalance = currentBalance + pointsToAdd;

    // Update user credits
    if (credits) {
      await db
        .update(userCredits)
        .set({
          balance: newBalance,
          totalEarned: credits.totalEarned + pointsToAdd,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));
    } else {
      await db.insert(userCredits).values({
        userId,
        balance: pointsToAdd,
        totalEarned: pointsToAdd,
        totalSpent: 0,
      });
    }

    // Record transaction
    await db.insert(creditTransactions).values({
      userId,
      amount: pointsToAdd,
      type: "CREDIT",
      reason: "VOUCHER",
      description: `Redeemed voucher: ${voucherCode}`,
      balanceAfter: newBalance,
    });

    // Record redemption
    await db.insert(voucherRedemptions).values({
      userId,
      voucherCode,
      pointsReceived: pointsToAdd,
    });

    // Update voucher usage count
    await db
      .update(vouchers)
      .set({ usedCount: voucher.usedCount + 1 })
      .where(eq(vouchers.id, voucher.id));

    res.json({
      success: true,
      points: pointsToAdd,
      newBalance,
      message: `${pointsToAdd} points have been added to your wallet!`,
    });
  } catch (error) {
    console.error("Error redeeming voucher:", error);
    res.status(500).json({ error: "Failed to redeem voucher" });
  }
});
