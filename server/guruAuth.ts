import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { guruAdminUsers, guruAdminSessions } from "@shared/schema";
import type { OtpPurpose } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "./resend";
import { generateOTP, OTP_CONFIG } from "./lib/otp-utils";
import {
  createOTPRecord,
  verifyOTPRecord,
  invalidatePreviousOTPs,
  checkResendCooldown,
  updateResendCooldown,
} from "./lib/otp-db";

const SALT_ROUNDS = 12;
const SESSION_EXPIRY_DAYS = 7;
const COOKIE_NAME = "guru_session";
const GURU_ADMIN_EMAIL = "ourshiksha.guru@gmail.com";

export interface GuruAuthenticatedRequest extends Request {
  admin?: { id: number; email: string; name: string; role: string };
}

export const guruAuthRouter = Router();

guruAuthRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const adminResult = await db
      .select()
      .from(guruAdminUsers)
      .where(eq(guruAdminUsers.email, normalizedEmail))
      .limit(1);

    if (adminResult.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const admin = adminResult[0];

    if (!admin.isActive) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(guruAdminSessions).values({
      id: sessionId,
      adminId: admin.id,
      expiresAt,
    });

    await db
      .update(guruAdminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(guruAdminUsers.id, admin.id));

    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Guru login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

guruAuthRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();
    const purpose: OtpPurpose = "guru_signup";

    const existingAdmin = await db
      .select()
      .from(guruAdminUsers)
      .where(eq(guruAdminUsers.email, normalizedEmail))
      .limit(1);

    if (existingAdmin.length > 0) {
      if (existingAdmin[0].isActive) {
        return res.status(400).json({ error: "This email is already registered as a Guru admin" });
      }

      const cooldownCheck = checkResendCooldown(normalizedEmail + "_guru");
      if (!cooldownCheck.allowed) {
        return res.status(429).json({
          error: `Please wait ${cooldownCheck.remainingSeconds} seconds before requesting a new code.`,
          retryAfter: cooldownCheck.remainingSeconds,
        });
      }

      await invalidatePreviousOTPs(GURU_ADMIN_EMAIL + "_" + normalizedEmail, purpose);
      const otp = generateOTP();
      await createOTPRecord(null, "email", GURU_ADMIN_EMAIL + "_" + normalizedEmail, otp, purpose);

      const emailSent = await sendOtpEmail(GURU_ADMIN_EMAIL, otp, purpose, {
        applicantName: trimmedName,
        applicantEmail: normalizedEmail,
      });
      if (!emailSent) {
        console.error("Failed to send Guru approval OTP to admin email");
      }

      updateResendCooldown(normalizedEmail + "_guru");
      return res.json({ message: "Approval OTP sent to admin for verification" });
    }

    const cooldownCheck = checkResendCooldown(normalizedEmail + "_guru");
    if (!cooldownCheck.allowed) {
      return res.status(429).json({
        error: `Please wait ${cooldownCheck.remainingSeconds} seconds before requesting a new code.`,
        retryAfter: cooldownCheck.remainingSeconds,
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await db.insert(guruAdminUsers).values({
      email: normalizedEmail,
      passwordHash,
      name: trimmedName,
      role: "admin",
      isActive: false,
    });

    await invalidatePreviousOTPs(GURU_ADMIN_EMAIL + "_" + normalizedEmail, purpose);
    const otp = generateOTP();
    await createOTPRecord(null, "email", GURU_ADMIN_EMAIL + "_" + normalizedEmail, otp, purpose);

    const emailSent = await sendOtpEmail(GURU_ADMIN_EMAIL, otp, purpose, {
      applicantName: trimmedName,
      applicantEmail: normalizedEmail,
    });
    if (!emailSent) {
      console.error("Failed to send Guru approval OTP to admin email");
    }

    updateResendCooldown(normalizedEmail + "_guru");
    res.json({ message: "Approval OTP sent to admin for verification" });
  } catch (error) {
    console.error("Guru signup error:", error);
    res.status(500).json({ error: "Failed to create admin account" });
  }
});

guruAuthRouter.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const purpose: OtpPurpose = "guru_signup";

    const adminResult = await db
      .select()
      .from(guruAdminUsers)
      .where(eq(guruAdminUsers.email, normalizedEmail))
      .limit(1);

    if (adminResult.length === 0) {
      return res.status(400).json({ error: "No pending registration found for this email" });
    }

    const admin = adminResult[0];

    if (admin.isActive) {
      return res.status(400).json({ error: "This account is already active" });
    }

    const verifyResult = await verifyOTPRecord(
      GURU_ADMIN_EMAIL + "_" + normalizedEmail,
      otp,
      purpose
    );

    if (!verifyResult.valid) {
      return res.status(400).json({
        error: verifyResult.message,
        locked: verifyResult.locked,
      });
    }

    await db
      .update(guruAdminUsers)
      .set({ isActive: true })
      .where(eq(guruAdminUsers.id, admin.id));

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(guruAdminSessions).values({
      id: sessionId,
      adminId: admin.id,
      expiresAt,
    });

    await db
      .update(guruAdminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(guruAdminUsers.id, admin.id));

    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Guru account verified and activated",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Guru verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

guruAuthRouter.post("/resend-otp", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const purpose: OtpPurpose = "guru_signup";

    const cooldownCheck = checkResendCooldown(normalizedEmail + "_guru");
    if (!cooldownCheck.allowed) {
      return res.status(429).json({
        error: `Please wait ${cooldownCheck.remainingSeconds} seconds before requesting a new code.`,
        retryAfter: cooldownCheck.remainingSeconds,
      });
    }

    const adminResult = await db
      .select()
      .from(guruAdminUsers)
      .where(eq(guruAdminUsers.email, normalizedEmail))
      .limit(1);

    if (adminResult.length === 0) {
      return res.status(400).json({ error: "No pending registration found" });
    }

    const admin = adminResult[0];

    if (admin.isActive) {
      return res.status(400).json({ error: "Account is already active" });
    }

    await invalidatePreviousOTPs(GURU_ADMIN_EMAIL + "_" + normalizedEmail, purpose);
    const otp = generateOTP();
    await createOTPRecord(null, "email", GURU_ADMIN_EMAIL + "_" + normalizedEmail, otp, purpose);

    const emailSent = await sendOtpEmail(GURU_ADMIN_EMAIL, otp, purpose, {
      applicantName: admin.name,
      applicantEmail: normalizedEmail,
    });
    if (!emailSent) {
      console.error("Failed to resend Guru approval OTP");
    }

    updateResendCooldown(normalizedEmail + "_guru");
    res.json({ message: "Approval OTP resent to admin" });
  } catch (error) {
    console.error("Guru resend OTP error:", error);
    res.status(500).json({ error: "Failed to resend code" });
  }
});

guruAuthRouter.get("/me", async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.[COOKIE_NAME];
    if (!sessionId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const sessionResult = await db
      .select()
      .from(guruAdminSessions)
      .where(
        and(
          eq(guruAdminSessions.id, sessionId),
          gt(guruAdminSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (sessionResult.length === 0) {
      res.clearCookie(COOKIE_NAME);
      return res.status(401).json({ error: "Session expired" });
    }

    const adminResult = await db
      .select()
      .from(guruAdminUsers)
      .where(eq(guruAdminUsers.id, sessionResult[0].adminId))
      .limit(1);

    if (adminResult.length === 0) {
      res.clearCookie(COOKIE_NAME);
      return res.status(401).json({ error: "Admin not found" });
    }

    const admin = adminResult[0];
    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Guru get me error:", error);
    res.status(500).json({ error: "Failed to get admin" });
  }
});

guruAuthRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.[COOKIE_NAME];
    if (sessionId) {
      await db.delete(guruAdminSessions).where(eq(guruAdminSessions.id, sessionId));
    }

    res.clearCookie(COOKIE_NAME);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Guru logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
});

export async function requireGuruAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.cookies?.[COOKIE_NAME];
    if (!sessionId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const sessionResult = await db
      .select()
      .from(guruAdminSessions)
      .where(
        and(
          eq(guruAdminSessions.id, sessionId),
          gt(guruAdminSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (sessionResult.length === 0) {
      res.clearCookie(COOKIE_NAME);
      return res.status(401).json({ error: "Session expired" });
    }

    const adminResult = await db
      .select()
      .from(guruAdminUsers)
      .where(eq(guruAdminUsers.id, sessionResult[0].adminId))
      .limit(1);

    if (adminResult.length === 0) {
      res.clearCookie(COOKIE_NAME);
      return res.status(401).json({ error: "Admin not found" });
    }

    const admin = adminResult[0];
    (req as GuruAuthenticatedRequest).admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    next();
  } catch (error) {
    console.error("Guru auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}
