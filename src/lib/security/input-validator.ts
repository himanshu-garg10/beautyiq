/**
 * BeautyIQ API Input Validator & Safe Error Handler
 * Sanitizes input values, validates boundaries, and provides leak-free production errors.
 */

import { NextResponse } from "next/server";
import { SecureLogger } from "./secure-logger";

export class InputValidator {
  /**
   * Sanitizes string to prevent HTML/script injection
   */
  static sanitizeString(input: string): string {
    if (!input || typeof input !== "string") return "";
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/javascript:[^"']*/gi, "");
  }

  /**
   * Validates standard email address format
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) && email.trim().length <= 254;
  }

  /**
   * Validates numeric price
   */
  static isValidPrice(price: any): boolean {
    if (price === undefined || price === null) return true; // optional/null allowed
    const num = Number(price);
    return !isNaN(num) && num > 0 && num < 1000000;
  }

  /**
   * Validates ID string format (alphanumeric, hyphens, underscores)
   */
  static isValidId(id: string): boolean {
    if (!id || typeof id !== "string") return false;
    return /^[a-zA-Z0-9_-]{2,64}$/.test(id.trim());
  }

  /**
   * Safe production error response generator
   * Never leaks stack traces, database schema info, or internal file paths in production
   */
  static createSafeErrorResponse(
    error: any,
    fallbackMessage: string = "An unexpected error occurred while processing your request.",
    status: number = 500,
    errorCode: string = "INTERNAL_SERVER_ERROR"
  ): NextResponse {
    const isProd = process.env.NODE_ENV === "production";

    SecureLogger.error(`API Error [${errorCode}]: ${error?.message || error}`, error);

    // In production, mask internal error messages for 500 errors
    const clientMessage = isProd && status >= 500 ? fallbackMessage : error?.message || fallbackMessage;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: clientMessage,
        },
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }
}
