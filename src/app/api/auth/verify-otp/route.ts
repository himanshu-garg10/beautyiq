import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/auth/otp-service";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const limited = enforceAuthRateLimit(req, "verify-otp");
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    const { target, code } = body || {};

    if (!target || !code) {
      return NextResponse.json(
        { success: false, error: "Recipient and 6-digit code are required." },
        { status: 400 }
      );
    }

    const cleanTarget = typeof target === "string" ? target.trim() : "";
    const cleanCode = typeof code === "string" ? code.trim() : "";

    const result = verifyOTP(cleanTarget, cleanCode);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error || "Invalid verification code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code verified successfully.",
    });
  } catch (error: any) {
    console.error("[verify-otp error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to verify code." },
      { status: 500 }
    );
  }
}
