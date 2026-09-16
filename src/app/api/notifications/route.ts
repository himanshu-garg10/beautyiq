import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/services/notification.service";
import { AuthGuard } from "@/lib/security/auth-guard";
import { InputValidator } from "@/lib/security/input-validator";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u1";

    // 1. Object-Level Authorization: customer cannot read another customer's notifications
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    const notifications = NotificationService.getNotifications(userId);
    const unreadCount = NotificationService.getUnreadCount(userId);

    return NextResponse.json(
      {
        success: true,
        data: { notifications, unreadCount },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to fetch notifications.");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId = "u1", notificationId, action } = body;

    // 1. Object-Level Authorization
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    if (action === "markAll") {
      const updated = NotificationService.markAllAsRead(userId);
      return NextResponse.json({ success: true, data: updated }, { status: 200 });
    }

    if (notificationId) {
      const updated = NotificationService.markAsRead(userId, notificationId);
      return NextResponse.json({ success: true, data: updated }, { status: 200 });
    }

    return NextResponse.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "notificationId or action required." } },
      { status: 400 }
    );
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to update notification.");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u1";
    const notificationId = searchParams.get("id");

    // 1. Object-Level Authorization
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    if (notificationId) {
      const updated = NotificationService.deleteNotification(userId, notificationId);
      return NextResponse.json({ success: true, data: updated }, { status: 200 });
    } else {
      NotificationService.clearAll(userId);
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to delete notifications.");
  }
}

