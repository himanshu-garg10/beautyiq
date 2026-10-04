import { NextRequest, NextResponse } from "next/server";
import { InputValidator } from "@/lib/security/input-validator";
import { RateLimiter } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const limit = RateLimiter.check(`contact_${clientIp(request)}`, { maxRequests: 4, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: { message: "Please wait a few minutes before sending another message." } }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || 600) } });
  }

  const body = await request.json().catch(() => ({}));
  const name = InputValidator.sanitizeString(typeof body.name === "string" ? body.name : "").slice(0, 100);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const message = InputValidator.sanitizeString(typeof body.message === "string" ? body.message : "").slice(0, 3000);
  if (!name || !InputValidator.isValidEmail(email) || message.length < 10) {
    return NextResponse.json({ success: false, error: { message: "Enter a valid name, email, and message of at least 10 characters." } }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SUPPORT_FROM_EMAIL;
  const to = process.env.SUPPORT_TO_EMAIL;
  if (!apiKey || !from || !to) {
    return NextResponse.json({ success: false, error: { message: "Customer care email is not configured yet. Please try again later." } }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[BeautyIQ support] ${name}`,
        text: `New BeautyIQ support inquiry\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    });
    if (!response.ok) {
      console.error("Contact email provider rejected the request", response.status);
      return NextResponse.json({ success: false, error: { message: "Customer care is temporarily unavailable. Please try again later." } }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact email provider request failed", error);
    return NextResponse.json({ success: false, error: { message: "Customer care is temporarily unavailable. Please try again later." } }, { status: 502 });
  }
}
