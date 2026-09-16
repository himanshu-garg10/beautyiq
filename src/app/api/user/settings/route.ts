import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { AuthGuard } from "@/lib/security/auth-guard";
import { RateLimiter } from "@/lib/security/rate-limiter";
import { InputValidator } from "@/lib/security/input-validator";
import { mockUsers } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u1";

    // 1. Object-Level Authorization: verify customer can only access their own settings
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User account not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          notificationPreferences: user.notificationPreferences,
          privacySettings: user.privacySettings,
          personalProfile: user.personalProfile,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to load account settings.");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId = "u1", action, payload } = body;

    // 1. Object-Level Authorization
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    // 2. Rate Limiting on sensitive customer mutations
    const rateLimit = RateLimiter.check(`settings_patch_${userId}`, "customer_mutation");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Too many profile update requests. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
          },
        },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds || 60) } }
      );
    }

    if (action === "changePassword") {
      const { currentPassword, newPassword } = payload || {};
      const res = await AuthService.changePassword(userId, currentPassword, newPassword);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === "updateAccount") {
      const { name, email } = payload || {};
      if (email && !InputValidator.isValidEmail(email)) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email format provided." } },
          { status: 400 }
        );
      }
      const sanitizedName = InputValidator.sanitizeString(name);
      const res = await AuthService.updateAccountDetails(userId, sanitizedName, email);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === "updateNotifications") {
      const res = await AuthService.updateNotificationPreferences(userId, payload);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === "updatePrivacy") {
      const res = await AuthService.updatePersonalProfile(userId, payload?.personal || {}, payload?.privacy);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    return NextResponse.json(
      { success: false, error: { code: "INVALID_ACTION", message: `Unknown action: ${action}` } },
      { status: 400 }
    );
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to update settings.");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, confirmation } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "User ID is required for account deletion." } },
        { status: 400 }
      );
    }

    // 1. Object-Level Authorization: verify customer can only delete their own account
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    // 2. Explicit Confirmation Guard
    if (confirmation !== "DELETE_ACCOUNT" && confirmation !== true) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFIRMATION_REQUIRED",
            message: "Explicit confirmation is required to permanently delete account.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Actually perform deletion on backend
    const deleteResult = await AuthService.deleteAccount(userId);
    if (!deleteResult.success) {
      return NextResponse.json(deleteResult, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account and associated customer profile have been permanently deleted.",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to complete account deletion.");
  }
}

