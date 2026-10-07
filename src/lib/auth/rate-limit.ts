import { NextRequest, NextResponse } from "next/server";
import { RateLimiter, type RateLimitConfig } from "@/lib/security/rate-limiter";

export function getAuthRateLimitConfig(): RateLimitConfig {
  return {
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || RateLimiter.CONFIGS.auth.maxRequests,
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || RateLimiter.CONFIGS.auth.windowMs,
  };
}

export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function enforceAuthRateLimit(
  req: NextRequest,
  action: "login" | "signup" | "send-otp" | "verify-otp"
): NextResponse | null {
  if (process.env.RATE_LIMIT_ENABLED === "false") {
    return null;
  }

  const key = `auth_${action}_${getClientIp(req)}`;
  const result = RateLimiter.check(key, getAuthRateLimitConfig());

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too many attempts. Please wait ${result.retryAfterSeconds} seconds.`,
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(result.retryAfterSeconds || 60) },
      }
    );
  }

  return null;
}

export function isAuthRateLimited(ip: string, action: "login" | "signup"): boolean {
  if (process.env.RATE_LIMIT_ENABLED === "false") {
    return false;
  }
  const result = RateLimiter.check(`auth_${action}_${ip}`, getAuthRateLimitConfig());
  return !result.allowed;
}
