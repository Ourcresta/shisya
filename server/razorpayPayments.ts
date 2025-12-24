import { Router, Request, Response } from 'express';
import { createHmac } from 'crypto';
import { getRazorpayClient, getRazorpayKeyId } from './razorpayClient';
import { db } from './db';
import { userCredits, creditTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, type AuthenticatedRequest } from './auth';
import { NotificationTriggers } from './notifications';

export const razorpayRouter = Router();

interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceInPaise: number;
  priceDisplay: string;
  bonus?: string;
}

const CREDIT_PACKS: Record<string, CreditPack> = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    credits: 500,
    priceInPaise: 50000, // ₹500
    priceDisplay: '₹500',
  },
  pro: {
    id: 'pro',
    name: 'Pro Pack',
    credits: 1100,
    priceInPaise: 100000, // ₹1000
    priceDisplay: '₹1,000',
    bonus: '+10% bonus',
  },
  power: {
    id: 'power',
    name: 'Power Pack',
    credits: 2300,
    priceInPaise: 200000, // ₹2000
    priceDisplay: '₹2,000',
    bonus: '+15% bonus',
  },
};

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
    
    if (!packId || !CREDIT_PACKS[packId]) {
      return res.status(400).json({ error: 'Invalid pack selected' });
    }

    const pack = CREDIT_PACKS[packId];
    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: pack.priceInPaise,
      currency: 'INR',
      receipt: `order_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        packId: pack.id,
        credits: pack.credits.toString(),
        userEmail: req.user.email,
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      packName: pack.name,
      credits: pack.credits,
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

    if (!packId || !CREDIT_PACKS[packId]) {
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
    const pack = CREDIT_PACKS[packId];
    const userId = req.user.id;

    // Get current balance
    const currentCredits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    let newBalance: number;

    if (currentCredits.length === 0) {
      // Create new credits record
      newBalance = pack.credits;
      await db.insert(userCredits).values({
        userId,
        balance: newBalance,
        totalEarned: newBalance,
        totalSpent: 0,
      });
    } else {
      // Update existing balance
      newBalance = currentCredits[0].balance + pack.credits;
      await db
        .update(userCredits)
        .set({
          balance: newBalance,
          totalEarned: currentCredits[0].totalEarned + pack.credits,
        })
        .where(eq(userCredits.userId, userId));
    }

    // Record transaction
    await db.insert(creditTransactions).values({
      userId,
      amount: pack.credits,
      type: 'PURCHASE',
      reason: 'CREDIT_PURCHASE',
      description: `Purchased ${pack.name} - ${pack.credits} learning points (Payment: ${razorpay_payment_id})`,
      balanceAfter: newBalance,
    });

    console.log(`[Credits] User ${userId} purchased ${pack.credits} credits via Razorpay (${razorpay_payment_id})`);

    // Send payment success notification
    try {
      await NotificationTriggers.paymentSuccess(userId, pack.credits, pack.name);
    } catch (notifError) {
      console.error('Failed to send payment notification:', notifError);
    }

    res.json({
      success: true,
      credits: pack.credits,
      newBalance,
      message: `Successfully added ${pack.credits} learning points!`,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});
