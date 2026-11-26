export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/lib/security/rate-limiter";
import { prisma } from "@/lib/prisma";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ProductCard {
  id: string;
  name: string;
  brand: string;
  category: string;
  rating: number | null;
  image: string;
  slug: string;
  price?: number | null;
}

const systemPrompt = `You are BeautyIQ AI, a friendly skincare and beauty assistant.

FORMAT every reply like this:
- One short friendly opening sentence (no asterisks, just plain text).
- Then 2–5 bullet points using "- " (a hyphen then space). Each bullet should have the key product type, ingredient name or step in **bold** (double asterisks), followed by a brief explanation.
- End with one short tip or closing line. Keep the whole reply under 180 words.

RULES:
- Reply in the same language the user used (English, Hindi, or Hinglish).
- Give cosmetic skincare guidance only. Never diagnose or treat medical conditions.
- For serious skin problems, suggest consulting a dermatologist.
- Politely decline topics unrelated to skincare, beauty, or cosmetic ingredients.
- When asked for product recommendations, give actionable category or ingredient suggestions and say you will search the catalog.
- When asked to scan face/skin, tell the user to use the Skin Scan feature at /skin-scan.
- Never invent product names, prices, or ingredients that do not exist.`;

const PRODUCT_KEYWORDS = [
  "product", "recommend", "suggest", "best", "which", "what serum",
  "moisturizer", "cleanser", "sunscreen", "acne", "dark spots", "oily",
  "dry skin", "serum", "toner", "face wash", "cream", "lotion", "spf",
];

const CONCERN_MAP: Record<string, string> = {
  acne: "acne",
  pimples: "acne",
  "dark spots": "dark spots",
  oily: "oily skin",
  "dry skin": "dry skin",
  dryness: "dry skin",
  blackheads: "blackheads",
  redness: "redness",
  sensitive: "sensitive skin",
  hyperpigmentation: "hyperpigmentation",
  wrinkles: "anti-aging",
  aging: "anti-aging",
  glow: "brightening",
  brightening: "brightening",
  hydration: "hydration",
  dull: "brightening",
  uneven: "uneven skin tone",
};

function extractConcerns(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const [keyword, concern] of Object.entries(CONCERN_MAP)) {
    if (lower.includes(keyword)) {
      found.add(concern);
      if (found.size >= 3) break;
    }
  }
  return Array.from(found);
}

function isProductFocused(text: string): boolean {
  const lower = text.toLowerCase();
  return PRODUCT_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateLimitKey = `gemini_chat_${ip}`;
  const rateLimit = RateLimiter.check(rateLimitKey, { maxRequests: 20, windowMs: 60 * 1000 });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please wait a moment." } },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Parse and validate body
  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.messages)) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "messages must be an array." } },
      { status: 400 }
    );
  }

  const rawMessages = body.messages as Array<{ role?: unknown; content?: unknown }>;
  const messages: ChatMessage[] = rawMessages
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: (m.content as string).slice(0, 800),
    }))
    .slice(-10);

  if (messages.length === 0) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "No valid messages provided." } },
      { status: 400 }
    );
  }

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: { code: "AI_UNAVAILABLE", message: "AI service is not configured." } },
      { status: 502 }
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  // Build Gemini request
  const geminiContents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let replyText = "";
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return NextResponse.json(
        { success: false, error: { code: "AI_UNAVAILABLE", message: "AI service temporarily unavailable." } },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    replyText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!replyText) {
      return NextResponse.json(
        { success: false, error: { code: "AI_PARSE_ERROR", message: "AI returned an empty response." } },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Gemini fetch error:", err);
    return NextResponse.json(
      { success: false, error: { code: "AI_UNAVAILABLE", message: "Could not reach AI service." } },
      { status: 502 }
    );
  }

  // Product search & skin scan intent
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const lastUserText = lastUserMessage?.content.toLowerCase() ?? "";
  const isSkinScanRequest =
    /\b(scan my face|face scan|skin scan|scan my skin|analyze my face|analyze my skin|check my face)\b/i.test(
      lastUserText
    );
  let products: ProductCard[] | undefined;

  if (lastUserMessage && isProductFocused(lastUserMessage.content)) {
    const concerns = extractConcerns(lastUserMessage.content);
    const searchTerms = concerns.length > 0
      ? concerns
      : PRODUCT_KEYWORDS.filter((kw) => lastUserText.includes(kw)).slice(0, 2);

    if (searchTerms.length > 0) {
      try {
        const dbProducts = await prisma.product.findMany({
          where: {
            OR: searchTerms.flatMap((term) => [
              { targetConcerns: { contains: term, mode: "insensitive" } },
              { category: { contains: term, mode: "insensitive" } },
              { name: { contains: term, mode: "insensitive" } },
              { skinTypes: { contains: term, mode: "insensitive" } },
            ]),
          },
          take: 4,
          orderBy: { rating: "desc" },
          select: {
            id: true,
            name: true,
            brand: true,
            category: true,
            rating: true,
            image: true,
            slug: true,
            prices: {
              where: { price: { not: null } },
              orderBy: { price: "asc" },
              take: 1,
              select: { price: true },
            },
          },
        });
        if (dbProducts.length > 0) {
          products = dbProducts.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            rating: p.rating,
            image: p.image,
            slug: p.slug,
            price: p.prices[0]?.price ?? null,
          }));
        }
      } catch (err) {
        console.error("Product search error:", err);
      }

      // Catalog fallback if database search yielded 0 products or timed out
      if (!products || products.length === 0) {
        try {
          const { products: catalogProducts } = await import("@/data/products");
          const matched = catalogProducts
            .filter((p) =>
              searchTerms.some(
                (term) =>
                  (p.name || "").toLowerCase().includes(term) ||
                  (p.category || "").toLowerCase().includes(term) ||
                  (p.targetConcerns || []).some((c: string) => c.toLowerCase().includes(term)) ||
                  (p.skinTypes || []).some((s: string) => s.toLowerCase().includes(term))
              )
            )
            .slice(0, 4);

          if (matched.length > 0) {
            products = matched.map((p) => ({
              id: p.id,
              name: p.name,
              brand: p.brand,
              category: p.category,
              rating: p.rating,
              image: p.image,
              slug: p.id,
              price: (p as any).price ?? null,
            }));
          }
        } catch {}
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      reply: replyText,
      ...(products ? { products } : {}),
      ...(isSkinScanRequest ? { action: "skin-scan" as const } : {}),
    },
  });
}
