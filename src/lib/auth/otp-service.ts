import crypto from "crypto";

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  verifiedAt?: number;
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

  if (entry.verifiedAt) {
    return { valid: true };
  }

  const codeMatches =
    entry.code.length === cleanCode.length &&
    crypto.timingSafeEqual(Buffer.from(entry.code), Buffer.from(cleanCode));

  if (!codeMatches) {
    entry.attempts += 1;
    return { valid: false, error: "Incorrect verification code. Please check and try again." };
  }

  // Keep only a short-lived verified marker. It is consumed by signup so the
  // verification cannot be reused to create another account.
  entry.code = "";
  entry.verifiedAt = Date.now();
  entry.attempts = 0;
  return { valid: true };
}

export function consumeVerifiedOTP(identifier: string): { valid: boolean; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const entry = otpStore.get(cleanId);

  if (!entry || !entry.verifiedAt) {
    return { valid: false, error: "Verify the email code before creating an account." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanId);
    return { valid: false, error: "Email verification has expired. Please request a new code." };
  }

  otpStore.delete(cleanId);
  return { valid: true };
}
