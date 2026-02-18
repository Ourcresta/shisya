import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { guruAdminUsers, guruAdminSessions } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

const SESSION_EXPIRY_DAYS = 7;
const COOKIE_NAME = "guru_session";

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
