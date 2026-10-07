import crypto from "crypto";

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

// Shared global OTP storage for Next.js API routes
const globalForOtp = globalThis as unknown as {
  otpStore: Map<string, OtpEntry> | undefined;
};

export const otpStore = globalForOtp.otpStore ?? new Map<string, OtpEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForOtp.otpStore = otpStore;
}

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export function generateOTP(identifier: string): string {
  const cleanId = identifier.trim().toLowerCase();
  
  // Generate a cryptographically secure 6-digit numerical code
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  otpStore.set(cleanId, {
    code,
    expiresAt,
    attempts: 0,
  });

  return code;
}

export function verifyOTP(identifier: string, enteredCode: string): { valid: boolean; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanCode = enteredCode.trim();

  // Allow standard demo OTP in development if needed
  if (process.env.NODE_ENV !== "production" && cleanCode === "123456") {
    return { valid: true };
  }

  const entry = otpStore.get(cleanId);
  if (!entry) {
    return { valid: false, error: "No verification code requested or code has expired. Please request a new code." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanId);
    return { valid: false, error: "Verification code has expired. Please request a new code." };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(cleanId);
    return { valid: false, error: "Too many failed attempts. Please request a new code." };
  }

  if (entry.code !== cleanCode) {
    entry.attempts += 1;
    return { valid: false, error: "Incorrect verification code. Please check and try again." };
  }

  // Code verified successfully, delete to ensure single-use
  otpStore.delete(cleanId);
  return { valid: true };
}
