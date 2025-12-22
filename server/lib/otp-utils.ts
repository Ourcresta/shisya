import { createHash } from "crypto";

// OTP Configuration
export const OTP_CONFIG = {
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 30,
  CODE_LENGTH: 6,
};

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOTP(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export function verifyOTPHash(otp: string, hash: string): boolean {
  return hashOTP(otp) === hash;
}

export function getOTPExpiry(): Date {
  return new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
}

export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
