import { NextRequest, NextResponse } from "next/server";
import { DataExportService } from "@/services/data-export.service";
import { AuthGuard } from "@/lib/security/auth-guard";
import { RateLimiter } from "@/lib/security/rate-limiter";
import { InputValidator } from "@/lib/security/input-validator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId = "u1" } = body;

    // 1. Object-Level Authorization: verify customer can only export their own data
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    // 2. Rate Limiting on data export (max 5 requests per minute)
    const rateLimit = RateLimiter.check(`export_${userId}`, { maxRequests: 5, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Data export rate limit reached. Please wait ${rateLimit.retryAfterSeconds} seconds before requesting another archive.`,
          },
        },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds || 60) } }
      );
    }

    const request = await DataExportService.requestExport(userId);
    return NextResponse.json({ success: true, data: request }, { status: 200 });
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to process data export request.");
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u1";
    const download = searchParams.get("download") === "true";

    // 1. Object-Level Authorization: verify customer can only download their own export
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    if (download) {
      const exportJson = DataExportService.generateExportData(userId);
      if (!exportJson) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "User account or export data not found." } },
          { status: 404 }
        );
      }

      return new Response(JSON.stringify(exportJson, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="beautyiq_data_export_${userId}.json"`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const status = DataExportService.getExportStatus(userId);
    return NextResponse.json({ success: true, data: status }, { status: 200 });
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to retrieve export status.");
  }
}

