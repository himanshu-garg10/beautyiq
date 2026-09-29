import crypto from "node:crypto";

// Secure Password Cryptographic Functions (scrypt + random salt)
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    const hashBuf = Buffer.from(hash, "hex");
    const expectedBuf = Buffer.from(expectedHash, "hex");
    if (hashBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, expectedBuf);
  } catch {
    return false;
  }
}
