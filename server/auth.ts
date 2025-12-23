import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users, sessions, userCredits, creditTransactions, WELCOME_BONUS_CREDITS } from "@shared/schema";
import { signupSchema, loginSchema, verifyOtpSchema } from "@shared/schema";
import type { OtpPurpose } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "./resend";
import { 
  generateOTP, 
  OTP_CONFIG 
} from "./lib/otp-utils";
import { 
  createOTPRecord, 
  verifyOTPRecord, 
  invalidatePreviousOTPs,
  checkResendCooldown,
  updateResendCooldown,
  getUserByEmail
} from "./lib/otp-db";

const SALT_ROUNDS = 12;
const SESSION_EXPIRY_DAYS = 7;
const COOKIE_NAME = "shishya_session";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; emailVerified: boolean };
}

export const authRouter = Router();

// POST /api/auth/signup
authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();
    const purpose: OtpPurpose = "signup";

    const existingUser = await getUserByEmail(normalizedEmail);
    
    if (existingUser) {
      if (!existingUser.emailVerified) {
        const cooldownCheck = checkResendCooldown(normalizedEmail);
        if (!cooldownCheck.allowed) {
          return res.status(429).json({ 
            error: `Please wait ${cooldownCheck.remainingSeconds} seconds before requesting a new code.`,
            retryAfter: cooldownCheck.remainingSeconds
          });
        }

        await invalidatePreviousOTPs(normalizedEmail, purpose);
        const otp = generateOTP();
        await createOTPRecord(existingUser.id, "email", normalizedEmail, otp, purpose);
        
        const emailSent = await sendOtpEmail(normalizedEmail, otp, purpose);
        if (!emailSent) {
          console.error("Failed to send OTP email to:", normalizedEmail);
        }
        
        updateResendCooldown(normalizedEmail);
        return res.json({ message: "Verification code sent to your email" });
      }
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = randomUUID();
    
    await db.insert(users).values({
      id: userId,
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
    });

    const otp = generateOTP();
    await createOTPRecord(userId, "email", normalizedEmail, otp, purpose);

    const emailSent = await sendOtpEmail(normalizedEmail, otp, purpose);
    if (!emailSent) {
      console.error("Failed to send OTP email to:", normalizedEmail);
    }

    updateResendCooldown(normalizedEmail);
    res.json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// POST /api/auth/verify-otp
authRouter.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const validation = verifyOtpSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { email, otp } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();
    const purpose: OtpPurpose = "signup";

    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ error: "Invalid email or verification code" });
    }

    const verifyResult = await verifyOTPRecord(normalizedEmail, otp, purpose);
    
    if (!verifyResult.valid) {
      return res.status(400).json({ 
        error: verifyResult.message,
        locked: verifyResult.locked
      });
    }

    await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));

    // Grant welcome bonus credits to new users
    try {
      // Check if user already has credits (shouldn't happen for new users)
      const existingCredits = await db
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, user.id))
        .limit(1);

      if (existingCredits.length === 0) {
        // Create credits wallet with welcome bonus
        await db.insert(userCredits).values({
          userId: user.id,
          balance: WELCOME_BONUS_CREDITS,
          totalEarned: WELCOME_BONUS_CREDITS,
          totalSpent: 0,
        });

        // Record the welcome bonus transaction
        await db.insert(creditTransactions).values({
          userId: user.id,
          amount: WELCOME_BONUS_CREDITS,
          type: "BONUS",
          reason: "WELCOME_BONUS",
          description: "Welcome bonus for new users",
          balanceAfter: WELCOME_BONUS_CREDITS,
        });

        console.log(`[Credits] Welcome bonus of ${WELCOME_BONUS_CREDITS} credits granted to user ${user.id}`);
      }
    } catch (creditsError) {
      console.error("Error granting welcome bonus:", creditsError);
      // Don't fail signup if credits fail - they can be applied later
    }

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        emailVerified: true,
      },
      welcomeBonus: WELCOME_BONUS_CREDITS,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res.status(400).json({ error: "Please verify your email first", needsVerification: true });
    }

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// POST /api/auth/logout
authRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.[COOKIE_NAME];
    if (sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    res.clearCookie(COOKIE_NAME);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
});

// GET /api/auth/me
authRouter.get("/me", async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.[COOKIE_NAME];
    if (!sessionId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const sessionResult = await db.select().from(sessions).where(
      and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date())
      )
    ).limit(1);

    if (sessionResult.length === 0) {
      res.clearCookie(COOKIE_NAME);
      return res.status(401).json({ error: "Session expired" });
    }

    const userResult = await db.select().from(users).where(eq(users.id, sessionResult[0].userId)).limit(1);
    if (userResult.length === 0) {
      res.clearCookie(COOKIE_NAME);
      return res.status(401).json({ error: "User not found" });
    }

    const user = userResult[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// POST /api/auth/resend-otp
authRouter.post("/resend-otp", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const purpose: OtpPurpose = "signup";

    const cooldownCheck = checkResendCooldown(normalizedEmail);
    if (!cooldownCheck.allowed) {
      return res.status(429).json({ 
        error: `Please wait ${cooldownCheck.remainingSeconds} seconds before requesting a new code.`,
        retryAfter: cooldownCheck.remainingSeconds
      });
    }

    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ error: "Email not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    await invalidatePreviousOTPs(normalizedEmail, purpose);

    const otp = generateOTP();
    await createOTPRecord(user.id, "email", normalizedEmail, otp, purpose);

    const emailSent = await sendOtpEmail(normalizedEmail, otp, purpose);
    if (!emailSent) {
      console.error("Failed to send OTP email to:", normalizedEmail);
    }

    updateResendCooldown(normalizedEmail);
    res.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Failed to resend code" });
  }
});

// POST /api/auth/send-otp (generic endpoint for any purpose)
authRouter.post("/send-otp", async (req: Request, res: Response) => {
  try {
    const { email, purpose } = req.body;
    
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const validPurposes: OtpPurpose[] = ["signup", "login", "forgot_password", "verify_email"];
    if (!purpose || !validPurposes.includes(purpose)) {
      return res.status(400).json({ error: "Invalid purpose" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpPurpose = purpose as OtpPurpose;

    const cooldownCheck = checkResendCooldown(normalizedEmail);
    if (!cooldownCheck.allowed) {
      return res.status(429).json({ 
        error: `Please wait ${cooldownCheck.remainingSeconds} seconds before requesting a new code.`,
        retryAfter: cooldownCheck.remainingSeconds
      });
    }

    const user = await getUserByEmail(normalizedEmail);

    if (otpPurpose === "signup" && user) {
      if (user.emailVerified) {
        return res.status(409).json({ error: "Email already registered" });
      }
    }

    if (["login", "forgot_password", "verify_email"].includes(otpPurpose) && !user) {
      return res.status(404).json({ error: "Email not found" });
    }

    await invalidatePreviousOTPs(normalizedEmail, otpPurpose);

    const otp = generateOTP();
    await createOTPRecord(user?.id || null, "email", normalizedEmail, otp, otpPurpose);

    const emailSent = await sendOtpEmail(normalizedEmail, otp, otpPurpose);
    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    updateResendCooldown(normalizedEmail);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Middleware to require authentication
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const sessionId = req.cookies?.[COOKIE_NAME];
    if (!sessionId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const sessionResult = await db.select().from(sessions).where(
      and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date())
      )
    ).limit(1);

    if (sessionResult.length === 0) {
      res.clearCookie(COOKIE_NAME);
      return res.status(401).json({ error: "Session expired" });
    }

    const userResult = await db.select().from(users).where(eq(users.id, sessionResult[0].userId)).limit(1);
    if (userResult.length === 0) {
      res.clearCookie(COOKIE_NAME);
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: userResult[0].id,
      email: userResult[0].email,
      emailVerified: userResult[0].emailVerified,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

// Optional auth middleware (sets user if authenticated, continues if not)
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const sessionId = req.cookies?.[COOKIE_NAME];
    if (!sessionId) {
      return next();
    }

    const sessionResult = await db.select().from(sessions).where(
      and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date())
      )
    ).limit(1);

    if (sessionResult.length === 0) {
      return next();
    }

    const userResult = await db.select().from(users).where(eq(users.id, sessionResult[0].userId)).limit(1);
    if (userResult.length === 0) {
      return next();
    }

    req.user = {
      id: userResult[0].id,
      email: userResult[0].email,
      emailVerified: userResult[0].emailVerified,
    };

    next();
  } catch (error) {
    next();
  }
}
