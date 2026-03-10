import { Router, Request, Response } from 'express';
import { createHmac } from 'crypto';
import { getRazorpayClient, getRazorpayKeyId } from './razorpayClient';
import { db } from './db';
import { userCredits, creditTransactions, creditPacks } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, type AuthenticatedRequest } from './auth';
import { NotificationTriggers } from './notifications';

export const razorpayRouter = Router();

// GET /api/payments/razorpay-key - Get Razorpay key ID for frontend
razorpayRouter.get('/razorpay-key', (req: Request, res: Response) => {
  try {
    const keyId = getRazorpayKeyId();
    res.json({ keyId });
  } catch (error) {
    console.error('Error getting Razorpay key:', error);
    res.status(500).json({ error: 'Payment gateway not configured' });
  }
});

// POST /api/payments/create-order - Create Razorpay order
razorpayRouter.post('/create-order', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { packId } = req.body;

    if (!packId) {
      return res.status(400).json({ error: 'Pack ID is required' });
    }

    const [pack] = await db.select().from(creditPacks).where(eq(creditPacks.id, Number(packId))).limit(1);
    if (!pack || !pack.isActive) {
      return res.status(400).json({ error: 'Invalid or unavailable pack selected' });
    }

    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: pack.price * 100,
      currency: 'INR',
      receipt: `order_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        packId: pack.id.toString(),
        credits: pack.points.toString(),
        userEmail: req.user.email,
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      packName: pack.name,
      credits: pack.points,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// POST /api/payments/verify - Verify payment and credit user
razorpayRouter.post('/verify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    if (!packId) {
      return res.status(400).json({ error: 'Pack ID is required' });
    }

    const [pack] = await db.select().from(creditPacks).where(eq(creditPacks.id, Number(packId))).limit(1);
    if (!pack) {
      return res.status(400).json({ error: 'Invalid pack' });
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ error: 'Payment gateway not configured' });
    }

    const generatedSignature = createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed');
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Credit the user's account
    const userId = req.user.id;

    // Get current balance
    const currentCredits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    let newBalance: number;

    if (currentCredits.length === 0) {
      newBalance = pack.points;
      await db.insert(userCredits).values({
        userId,
        balance: newBalance,
        totalEarned: newBalance,
        totalSpent: 0,
      });
    } else {
      newBalance = currentCredits[0].balance + pack.points;
      await db
        .update(userCredits)
        .set({
          balance: newBalance,
          totalEarned: currentCredits[0].totalEarned + pack.points,
        })
        .where(eq(userCredits.userId, userId));
    }

    // Record transaction
    await db.insert(creditTransactions).values({
      userId,
      amount: pack.points,
      type: 'PURCHASE',
      reason: 'CREDIT_PURCHASE',
      description: `Purchased ${pack.name} - ${pack.points} learning points (Payment: ${razorpay_payment_id})`,
      balanceAfter: newBalance,
    });

    console.log(`[Credits] User ${userId} purchased ${pack.points} credits via Razorpay (${razorpay_payment_id})`);

    // Send payment success notification
    try {
      await NotificationTriggers.paymentSuccess(userId, pack.points, pack.name);
    } catch (notifError) {
      console.error('Failed to send payment notification:', notifError);
    }

    res.json({
      success: true,
      credits: pack.points,
      newBalance,
      message: `Successfully added ${pack.points} learning points!`,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});
