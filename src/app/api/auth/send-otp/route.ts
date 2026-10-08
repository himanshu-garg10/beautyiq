import { NextRequest, NextResponse } from "next/server";
import { generateOTP } from "@/lib/auth/otp-service";
import { sendOtpEmail } from "@/lib/email/email-service";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const limited = enforceAuthRateLimit(req, "send-otp");
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    const { target } = body || {};

    if (!target || typeof target !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const cleanTarget = target.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanTarget)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const otpCode = generateOTP(cleanTarget);
    const emailResult = await sendOtpEmail(cleanTarget, otpCode);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: "We could not send the verification email. Please try again shortly." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanTarget}.`,
    });
  } catch (error: any) {
    console.error("[send-otp error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to dispatch verification code." },
      { status: 500 }
    );
  }
}
