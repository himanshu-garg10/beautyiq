import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/lib/security/rate-limiter";
import { handleChatTurn } from "@/lib/skincare-chat/engine";

export const dynamic = "force-dynamic";

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * POST /api/chat — one turn of the BeautyIQ skincare chat (AI Match).
 * Body: { message, history?, profile?, lastProductIds? }  →  structured ChatResponse.
 * The client keeps the conversation state and sends the profile back each turn.
 */
export async function POST(request: NextRequest) {
  const limit = RateLimiter.check(`skincare_chat_${clientIp(request)}`, { maxRequests: 20, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, code: "RATE_LIMITED", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || 60) } }
    );
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ success: false, code: "INVALID_MESSAGE" }, { status: 400 });
  }

  try {
    const result = await handleChatTurn({
      message,
      history: body.history,
      profile: body.profile,
      lastProductIds: body.lastProductIds,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json(
      { success: false, code: "CHAT_UNAVAILABLE", message: "The product catalog could not be reached right now. Please try again in a moment." },
      { status: 503 }
    );
  }
}
