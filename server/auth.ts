import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users, otpCodes, sessions } from "@shared/schema";
import { signupSchema, loginSchema, verifyOtpSchema } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomUUID, createHash, randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "./resend";

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;
const SESSION_EXPIRY_DAYS = 7;
const COOKIE_NAME = "shishya_session";

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existingUser.length > 0) {
      // If user exists but not verified, allow re-signup (resend OTP)
      if (!existingUser[0].emailVerified) {
        const otp = generateOtp();
        const otpHash = hashOtp(otp);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Mark old OTPs as used
        await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.userId, existingUser[0].id));

        // Create new OTP
        await db.insert(otpCodes).values({
          userId: existingUser[0].id,
          otpHash,
          expiresAt,
          used: false,
        });

        // Send OTP email
        await sendOtpEmail(normalizedEmail, otp);

        return res.json({ message: "Verification code sent to your email" });
      }
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const userId = randomUUID();
    await db.insert(users).values({
      id: userId,
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
    });

    // Generate and store OTP
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await db.insert(otpCodes).values({
      userId,
      otpHash,
      expiresAt,
      used: false,
    });

    // Send OTP email
    const emailSent = await sendOtpEmail(normalizedEmail, otp);
    if (!emailSent) {
      console.error("Failed to send OTP email to:", normalizedEmail);
    }

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

    // Find user
    const userResult = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (userResult.length === 0) {
      return res.status(400).json({ error: "Invalid email or verification code" });
    }

    const user = userResult[0];
    const otpHash = hashOtp(otp);

    // Find valid OTP
    const otpResult = await db.select().from(otpCodes).where(
      and(
        eq(otpCodes.userId, user.id),
        eq(otpCodes.otpHash, otpHash),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date())
      )
    ).limit(1);

    if (otpResult.length === 0) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    // Mark OTP as used
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otpResult[0].id));

    // Mark email as verified
    await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));

    // Create session
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    // Set session cookie
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

    // Find user
    const userResult = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (userResult.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = userResult[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(400).json({ error: "Please verify your email first", needsVerification: true });
    }

    // Create session
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    // Set session cookie
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

    // Find session
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

    // Find user
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

    // Find user
    const userResult = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (userResult.length === 0) {
      return res.status(400).json({ error: "Email not found" });
    }

    const user = userResult[0];
    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Mark old OTPs as used
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.userId, user.id));

    // Generate new OTP
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await db.insert(otpCodes).values({
      userId: user.id,
      otpHash,
      expiresAt,
      used: false,
    });

    // Send OTP email
    await sendOtpEmail(normalizedEmail, otp);

    res.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Failed to resend code" });
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
