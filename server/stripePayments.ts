// Stripe Payment Routes for Credit Purchases
import { Router, Response } from "express";
import { db } from "./db";
import { userCredits, creditTransactions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "./auth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

export const stripePaymentsRouter = Router();

const CREDIT_PACKS = {
  starter: { name: "Starter Pack", price: 50000, points: 500, bonus: 0 },
  pro: { name: "Pro Pack", price: 100000, points: 1100, bonus: 10 },
  power: { name: "Power Pack", price: 200000, points: 2300, bonus: 15 },
};

stripePaymentsRouter.get("/publishable-key", async (req, res: Response) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (error) {
    console.error("Error getting publishable key:", error);
    res.status(500).json({ error: "Failed to get Stripe configuration" });
  }
});

stripePaymentsRouter.post("/create-checkout", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { packId } = req.body;

    const pack = CREDIT_PACKS[packId as keyof typeof CREDIT_PACKS];
    if (!pack) {
      return res.status(400).json({ error: "Invalid pack selected" });
    }

    const stripe = await getUncachableStripeClient();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: pack.name,
              description: `${pack.points} Learning Points${pack.bonus > 0 ? ` (+${pack.bonus}% bonus)` : ''}`,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/shishya/wallet?payment=success&pack=${packId}`,
      cancel_url: `${req.protocol}://${req.get('host')}/shishya/wallet?payment=cancelled`,
      metadata: {
        userId,
        packId,
        points: pack.points.toString(),
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

stripePaymentsRouter.post("/verify-payment", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId, packId } = req.body;

    const pack = CREDIT_PACKS[packId as keyof typeof CREDIT_PACKS];
    if (!pack) {
      return res.status(400).json({ error: "Invalid pack" });
    }

    const stripe = await getUncachableStripeClient();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: "Payment not completed" });
    }

    if (session.metadata?.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const [credits] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    const currentBalance = credits?.balance || 0;
    const newBalance = currentBalance + pack.points;

    if (credits) {
      await db
        .update(userCredits)
        .set({
          balance: newBalance,
          totalEarned: credits.totalEarned + pack.points,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));
    } else {
      await db.insert(userCredits).values({
        userId,
        balance: pack.points,
        totalEarned: pack.points,
        totalSpent: 0,
      });
    }

    await db.insert(creditTransactions).values({
      userId,
      amount: pack.points,
      type: "CREDIT",
      reason: "PURCHASE",
      description: `Purchased ${pack.name}`,
      balanceAfter: newBalance,
    });

    res.json({
      success: true,
      points: pack.points,
      newBalance,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});
