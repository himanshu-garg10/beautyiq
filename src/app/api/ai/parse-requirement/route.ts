import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

const skinTypes = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
const concerns = [
  "Acne", "Pimples", "Blackheads", "Whiteheads", "Dark spots", "Acne marks",
  "Hyperpigmentation", "Uneven skin tone", "Dryness", "Dehydration", "Excess oil",
  "Dullness", "Redness", "Rough texture", "Visible pores", "Fine lines", "Tanning",
  "Dark circles", "Under eye puffiness", "Uneven texture",
];
const goals = [
  "Clearer skin", "Glow", "Even skin tone", "Hydration", "Oil control",
  "Smoother texture", "Reduced appearance of pores", "Maintain healthy looking skin",
];
const categories = [
  "Face Wash", "Cleanser", "Serum", "Moisturizer", "Sunscreen", "Toner",
  "Exfoliator", "Acne Focused Products", "Face Masks", "Lip Care", "Eye Care",
  "Treatment Products",
];

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function cleanStringList(value: unknown, allowed?: string[]) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= 60)
    .filter((item, index, list) => list.indexOf(item) === index)
    .filter((item) => !allowed || allowed.includes(item))
    .slice(0, 8);
}

function cleanGuidance(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter((item) => item.length >= 12 && item.length <= 300)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 3);
}

function asAllowed(value: unknown, allowed: string[]) {
  return typeof value === "string" && allowed.includes(value) ? value : null;
}

function asPrice(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100000 ? Math.round(parsed) : null;
}

function parseModelJson(text: string) {
  const normalized = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(normalized) as Record<string, unknown>;
  return {
    skinType: asAllowed(parsed.skinType, skinTypes),
    concerns: cleanStringList(parsed.concerns, concerns),
    goals: cleanStringList(parsed.goals, goals),
    category: asAllowed(parsed.category, categories),
    minPrice: asPrice(parsed.minPrice),
    maxPrice: asPrice(parsed.maxPrice),
    preferredIngredients: cleanStringList(parsed.preferredIngredients),
    avoidIngredients: cleanStringList(parsed.avoidIngredients),
    guidance: cleanGuidance(parsed.guidance),
  };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, code: "AI_NOT_CONFIGURED" }, { status: 503 });
  }

  const limit = RateLimiter.check(`gemini_requirement_${clientIp(request)}`, {
    maxRequests: 10,
    windowMs: 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, code: "RATE_LIMITED", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || 60) } }
    );
  }

  const body = await request.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim().slice(0, 600) : "";
  if (!query) {
    return NextResponse.json({ success: false, code: "INVALID_QUERY" }, { status: 400 });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
  const prompt = `You are BeautyIQ, a cosmetic skincare shopping assistant. The request may be in Hindi, Hinglish, or English. Return ONLY valid JSON, with these exact keys:
{"skinType":null,"concerns":[],"goals":[],"category":null,"minPrice":null,"maxPrice":null,"preferredIngredients":[],"avoidIngredients":[],"guidance":[]}

Allowed skinType values: ${skinTypes.join(", ")}.
Allowed concern values: ${concerns.join(", ")}.
Allowed goal values: ${goals.join(", ")}.
Allowed category values: ${categories.join(", ")}.
Use null or [] if information is absent. Extract only what the user explicitly asks for; do not diagnose, prescribe treatment, invent product facts, or add medical advice. Convert Indian rupee budgets to whole numbers.

For guidance, return 2 or 3 concise, genuinely tailored cosmetic-care suggestions for this exact request. Mention appropriate routine steps, product textures, or cosmetic ingredients only when relevant. Each item must be understandable on its own and use cautious wording such as "consider" or "look for". Never claim results, mention prescription medicine, or call yourself a doctor. If the request suggests severe, painful, infected, or persistent symptoms, include one short suggestion to consult a dermatologist.

User request: ${JSON.stringify(query)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 500, responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini requirement parser failed", response.status);
      return NextResponse.json({ success: false, code: "AI_UNAVAILABLE" }, { status: 502 });
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") throw new Error("Missing Gemini response text");

    return NextResponse.json({ success: true, data: parseModelJson(text) });
  } catch (error) {
    console.error("Gemini requirement parser error", error);
    return NextResponse.json({ success: false, code: "AI_UNAVAILABLE" }, { status: 502 });
  }
}
