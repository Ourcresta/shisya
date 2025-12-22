import { db } from "../db";
import { otpLogs, users } from "@shared/schema";
import type { OtpPurpose, OtpLog } from "@shared/schema";
import { eq, and, gt, isNull, desc, lt } from "drizzle-orm";
import { hashOTP, getOTPExpiry, verifyOTPHash, isOTPExpired, OTP_CONFIG } from "./otp-utils";

// In-memory rate limiting for OTP resend (destination -> last request timestamp)
const resendCooldowns = new Map<string, number>();

export interface OTPVerifyResult {
  valid: boolean;
  userId?: string;
  message?: string;
  remainingAttempts?: number;
  locked?: boolean;
}

export async function createOTPRecord(
  userId: string | null,
  contactType: "email" | "mobile",
  destination: string,
  otp: string,
  purpose: OtpPurpose
): Promise<void> {
  await db.insert(otpLogs).values({
    userId,
    contactType,
    destination: destination.toLowerCase().trim(),
    otpHash: hashOTP(otp),
    purpose,
    expiresAt: getOTPExpiry(),
    attemptCount: 0,
    consumedAt: null,
  });
}

export async function invalidatePreviousOTPs(
  destination: string,
  purpose: OtpPurpose
): Promise<void> {
  const normalizedDest = destination.toLowerCase().trim();
  const now = new Date();
  
  await db
    .update(otpLogs)
    .set({ consumedAt: now })
    .where(
      and(
        eq(otpLogs.destination, normalizedDest),
        eq(otpLogs.purpose, purpose),
        isNull(otpLogs.consumedAt)
      )
    );
}

export async function verifyOTPRecord(
  destination: string,
  otp: string,
  purpose: OtpPurpose
): Promise<OTPVerifyResult> {
  const normalizedDest = destination.toLowerCase().trim();
  const now = new Date();

  const records = await db
    .select()
    .from(otpLogs)
    .where(
      and(
        eq(otpLogs.destination, normalizedDest),
        eq(otpLogs.purpose, purpose),
        isNull(otpLogs.consumedAt),
        gt(otpLogs.expiresAt, now)
      )
    )
    .orderBy(desc(otpLogs.createdAt))
    .limit(1);

  if (records.length === 0) {
    return { 
      valid: false, 
      message: "No active verification code found. Please request a new one." 
    };
  }

  const record = records[0];

  if (isOTPExpired(record.expiresAt)) {
    return { 
      valid: false, 
      message: "Verification code has expired. Please request a new one." 
    };
  }

  if (record.attemptCount >= OTP_CONFIG.MAX_ATTEMPTS) {
    await db
      .update(otpLogs)
      .set({ consumedAt: now })
      .where(eq(otpLogs.id, record.id));
    
    return { 
      valid: false, 
      message: "Too many failed attempts. Please request a new verification code.",
      locked: true
    };
  }

  if (!verifyOTPHash(otp, record.otpHash)) {
    const newAttemptCount = record.attemptCount + 1;
    await db
      .update(otpLogs)
      .set({ attemptCount: newAttemptCount })
      .where(eq(otpLogs.id, record.id));
    
    const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - newAttemptCount;
    
    if (remainingAttempts <= 0) {
      await db
        .update(otpLogs)
        .set({ consumedAt: now })
        .where(eq(otpLogs.id, record.id));
      
      return { 
        valid: false, 
        message: "Too many failed attempts. Please request a new verification code.",
        locked: true
      };
    }
    
    return { 
      valid: false, 
      message: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
      remainingAttempts
    };
  }

  await db
    .update(otpLogs)
    .set({ consumedAt: now })
    .where(eq(otpLogs.id, record.id));

  return { 
    valid: true, 
    userId: record.userId || undefined 
  };
}

export function checkResendCooldown(destination: string): { allowed: boolean; remainingSeconds?: number } {
  const normalizedDest = destination.toLowerCase().trim();
  const lastResend = resendCooldowns.get(normalizedDest);
  const now = Date.now();
  
  if (lastResend) {
    const timeSinceLastResend = (now - lastResend) / 1000;
    if (timeSinceLastResend < OTP_CONFIG.RESEND_COOLDOWN_SECONDS) {
      const remainingSeconds = Math.ceil(OTP_CONFIG.RESEND_COOLDOWN_SECONDS - timeSinceLastResend);
      return { allowed: false, remainingSeconds };
    }
  }
  
  return { allowed: true };
}

export function updateResendCooldown(destination: string): void {
  const normalizedDest = destination.toLowerCase().trim();
  resendCooldowns.set(normalizedDest, Date.now());
}

export async function cleanExpiredOTPs(): Promise<number> {
  const now = new Date();
  const expiredCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const result = await db
    .delete(otpLogs)
    .where(lt(otpLogs.expiresAt, expiredCutoff));
  
  return 0;
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);
  
  return result[0] || null;
}
