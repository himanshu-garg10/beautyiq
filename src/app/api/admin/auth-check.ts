import { NextRequest, NextResponse } from "next/server";
import { AuthGuard } from "@/lib/security/auth-guard";
import { RateLimiter } from "@/lib/security/rate-limiter";

export function checkAdminAuth(req: NextRequest): { authorized: boolean; response?: NextResponse } {
  // 1. Rate Limiting Check on Admin Endpoints
  const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "localhost";
  const rateLimitResult = RateLimiter.check(`admin_${clientIp}`, "sensitive_default");
  if (!rateLimitResult.allowed) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Too many administrative requests. Please retry in ${rateLimitResult.retryAfterSeconds} seconds.`,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds || 60),
          },
        }
      ),
    };
  }

  // 2. Role and Authentication Verification
  return AuthGuard.verifyAdmin(req);
}

