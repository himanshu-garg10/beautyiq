/**
 * BeautyIQ Secure Logger
 * Automatically redacts sensitive fields (passwords, tokens, keys, authorization headers)
 * to prevent accidental exposure in console outputs, server logs, or monitoring streams.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "secret",
  "resettoken",
  "authorization",
  "apikey",
  "api_key",
  "cookie",
  "credentials",
  "creditcard",
  "privatekey",
]);

export class SecureLogger {
  /**
   * Deeply sanitize an object or value by replacing sensitive fields with "[REDACTED]"
   */
  static sanitize<T>(data: T): T {
    if (data === null || data === undefined) return data;
    if (typeof data !== "object") return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item)) as unknown as T;
    }

    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (SENSITIVE_KEYS.has(normalizedKey)) {
        sanitizedObj[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        sanitizedObj[key] = this.sanitize(value);
      } else {
        sanitizedObj[key] = value;
      }
    }

    return sanitizedObj as T;
  }

  static info(message: string, meta?: any): void {
    if (meta !== undefined) {
      console.log(`[INFO] ${message}`, this.sanitize(meta));
    } else {
      console.log(`[INFO] ${message}`);
    }
  }

  static warn(message: string, meta?: any): void {
    if (meta !== undefined) {
      console.warn(`[WARN] ${message}`, this.sanitize(meta));
    } else {
      console.warn(`[WARN] ${message}`);
    }
  }

  static error(message: string, error?: any): void {
    // In production, prevent leaking internal stack traces or database connection details
    const isProd = process.env.NODE_ENV === "production";
    if (isProd && error instanceof Error) {
      console.error(`[ERROR] ${message}: ${error.message}`);
    } else if (error !== undefined) {
      console.error(`[ERROR] ${message}`, this.sanitize(error));
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }
}
