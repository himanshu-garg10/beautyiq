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
        { success: false, error: "Recipient Gmail address is required." },
        { status: 400 }
      );
    }

    const cleanTarget = target.trim();

    if (!cleanTarget.toLowerCase().endsWith("@gmail.com")) {
      return NextResponse.json(
        { success: false, error: "Email must be a valid @gmail.com address." },
        { status: 400 }
      );
    }

    const otpCode = generateOTP(cleanTarget);
    const emailResult = await sendOtpEmail(cleanTarget, otpCode);

    if (!emailResult.success && emailResult.error && !emailResult.error.includes("RESEND_API_KEY")) {
      return NextResponse.json(
        { success: false, error: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanTarget}.`,
      isSimulated: !process.env.RESEND_API_KEY,
      demoOtp: !process.env.RESEND_API_KEY ? otpCode : undefined,
    });
  } catch (error: any) {
    console.error("[send-otp error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to dispatch verification code." },
      { status: 500 }
    );
  }
}
