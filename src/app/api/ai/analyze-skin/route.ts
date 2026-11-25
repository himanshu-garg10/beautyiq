import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import { RateLimiter } from "@/server/security/rate-limiter";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_CONCERN_NAMES = [
  "Acne",
  "Pimples",
  "Blackheads",
  "Whiteheads",
  "Dark spots",
  "Acne marks",
  "Hyperpigmentation",
  "Uneven skin tone",
  "Dryness",
  "Dehydration",
  "Excess oil",
  "Dullness",
  "Redness",
  "Rough texture",
  "Visible pores",
  "Fine lines",
  "Tanning",
  "Dark circles",
  "Under eye puffiness",
  "Uneven texture",
] as const;

const ALLOWED_SEVERITIES = ["mild", "moderate", "severe"] as const;
const ALLOWED_SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive"] as const;

type AllowedConcernName = (typeof ALLOWED_CONCERN_NAMES)[number];
type AllowedSeverity = (typeof ALLOWED_SEVERITIES)[number];
type AllowedSkinType = (typeof ALLOWED_SKIN_TYPES)[number];

export interface DetectedConcern {
  name: AllowedConcernName;
  severity: AllowedSeverity;
  region: string;
  /** Confidence kept internally for filtering (≥0.5); never sent to UI */
  confidence: number;
  /** 1-2 plain-English sentences describing what is visible */
  whatWeSee: string;
  /** 2-3 common cosmetic causes */
  possibleCauses: string[];
  /** 3 practical care tips */
  howToCare: string[];
  /** 2-4 key ingredient names */
  suggestedIngredients: string[];
}

interface RoutineStep {
  morning: string[];
  night: string[];
}

export interface GeminiAnalysisResult {
  detectedConcerns: DetectedConcern[];
  skinType: AllowedSkinType | null;
  skinTypeReason: string;
  overallSummary: string;
  routineTips: RoutineStep;
  seeDermatologist: boolean;
  seeDermatologistReason: string;
  photoQualityOk: boolean;
  photoQualityIssue: string | null;
}

// ─── Type guards ────────────────────────────────────────────────────────────

function isAllowedConcernName(v: unknown): v is AllowedConcernName {
  return typeof v === "string" && (ALLOWED_CONCERN_NAMES as readonly string[]).includes(v);
}
function isAllowedSeverity(v: unknown): v is AllowedSeverity {
  return typeof v === "string" && (ALLOWED_SEVERITIES as readonly string[]).includes(v);
}
function isAllowedSkinType(v: unknown): v is AllowedSkinType {
  return typeof v === "string" && (ALLOWED_SKIN_TYPES as readonly string[]).includes(v);
}
function safeStr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function safeStrArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

// ─── Parse & validate Gemini JSON response ──────────────────────────────────

function parseAndValidateGeminiResponse(raw: unknown): GeminiAnalysisResult {
  if (typeof raw !== "object" || raw === null) throw new Error("Response is not an object");
  const obj = raw as Record<string, unknown>;

  const photoQualityOk = typeof obj.photoQualityOk === "boolean" ? obj.photoQualityOk : true;
  const photoQualityIssue = typeof obj.photoQualityIssue === "string" ? obj.photoQualityIssue : null;

  if (!photoQualityOk) {
    return {
      detectedConcerns: [],
      skinType: null,
      skinTypeReason: "",
      overallSummary: safeStr(obj.overallSummary) || safeStr(obj.summary),
      routineTips: { morning: [], night: [] },
      seeDermatologist: false,
      seeDermatologistReason: "",
      photoQualityOk: false,
      photoQualityIssue,
    };
  }

  const rawConcerns = Array.isArray(obj.detectedConcerns) ? obj.detectedConcerns : [];
  const detectedConcerns: DetectedConcern[] = rawConcerns
    .filter((c: unknown): c is Record<string, unknown> => typeof c === "object" && c !== null)
    .filter((c) => isAllowedConcernName(c.name) && isAllowedSeverity(c.severity))
    .map((c) => ({
      name: c.name as AllowedConcernName,
      severity: c.severity as AllowedSeverity,
      region: safeStr(c.region, "face"),
      confidence: typeof c.confidence === "number" ? Math.max(0, Math.min(1, c.confidence)) : 0.75,
      whatWeSee: safeStr(c.whatWeSee),
      possibleCauses: safeStrArray(c.possibleCauses),
      howToCare: safeStrArray(c.howToCare),
      suggestedIngredients: safeStrArray(c.suggestedIngredients),
    }))
    // Filter weak detections; keep only confident signals
    .filter((c) => c.confidence >= 0.5)
    .slice(0, 6);

  const skinType = isAllowedSkinType(obj.skinType) ? obj.skinType : null;
  const skinTypeReason = safeStr(obj.skinTypeReason);

  const overallSummary = safeStr(obj.overallSummary) || safeStr(obj.summary);

  // Routine tips — backward-compatible (may be absent in old responses)
  const rt = obj.routineTips as Record<string, unknown> | undefined;
  const routineTips: RoutineStep = {
    morning: safeStrArray(rt?.morning),
    night: safeStrArray(rt?.night),
  };

  const seeDermatologist = typeof obj.seeDermatologist === "boolean" ? obj.seeDermatologist : false;
  const seeDermatologistReason = safeStr(obj.seeDermatologistReason);

  return {
    detectedConcerns,
    skinType,
    skinTypeReason,
    overallSummary,
    routineTips,
    seeDermatologist,
    seeDermatologistReason,
    photoQualityOk: true,
    photoQualityIssue: null,
  };
}

// ─── Gemini prompt ──────────────────────────────────────────────────────────

const ANALYSIS_PROMPT = `You are BeautyIQ, a cosmetic skincare analysis assistant. Look carefully at the entire face in this photo and describe what you see in simple, plain language.

Return ONLY valid JSON matching this exact structure (no markdown, no extra text):
{
  "detectedConcerns": [],
  "skinType": null,
  "skinTypeReason": "",
  "overallSummary": "",
  "routineTips": { "morning": [], "night": [] },
  "seeDermatologist": false,
  "seeDermatologistReason": "",
  "photoQualityOk": true,
  "photoQualityIssue": null
}

FIELD RULES:

detectedConcerns — array of concern objects. For EACH visible concern include:
  name        — MUST be one of exactly: Acne, Pimples, Blackheads, Whiteheads, Dark spots, Acne marks, Hyperpigmentation, Uneven skin tone, Dryness, Dehydration, Excess oil, Dullness, Redness, Rough texture, Visible pores, Fine lines, Tanning, Dark circles, Under eye puffiness, Uneven texture
  severity    — "mild", "moderate", or "severe"
  region      — where on the face, e.g. "T-zone", "left cheek", "forehead", "nose bridge", "under eyes", "chin"
  confidence  — how certain you are, 0.0 to 1.0 (only include concerns above 0.5)
  whatWeSee   — 1-2 plain sentences describing what is actually visible in the photo. Be specific, e.g. "A few small red spots on the left cheek." Not generic.
  possibleCauses — exactly 2-3 short common cosmetic causes, e.g. ["excess sebum production", "infrequent cleansing", "touching the face"]
  howToCare   — exactly 3 practical care tips (ingredients + habits), e.g. ["Use a salicylic acid cleanser twice daily", "Apply niacinamide serum to reduce redness", "Avoid picking or touching the affected area"]
  suggestedIngredients — 2-4 ingredient names that help with this concern, e.g. ["Salicylic Acid", "Niacinamide", "Tea Tree Oil"]

LOOK FOR ALL of these (only report what is visibly present):
  oiliness/shine, open/large pores, blackheads, whiteheads, pimples, acne spots, dark spots/pigmentation, uneven tone, redness/flushing, dryness/flakiness, dullness/lack of glow, fine lines, dark circles, under-eye puffiness, rough texture, tanning/sun damage.

skinType    — one of: Oily, Dry, Combination, Normal, Sensitive (or null if truly unclear from the photo)
skinTypeReason — 1 short sentence explaining why, e.g. "The T-zone appears shiny while the cheeks look normal."

overallSummary — 3-4 plain sentences giving a clear overall picture: main skin type, what looks healthy, what needs attention. No jargon.

routineTips:
  morning — exactly 3 simple steps for a morning routine, e.g. ["Gentle cleanser", "Vitamin C or niacinamide serum", "SPF 30+ sunscreen"]
  night   — exactly 3 simple steps for a night routine, e.g. ["Oil cleanser or micellar water", "BHA or AHA exfoliant (2-3x per week)", "Hydrating moisturiser"]

seeDermatologist — true ONLY if you notice severe, widespread, or unusual signs that go beyond routine cosmetic concern. Keep this false for mild or common everyday concerns.
seeDermatologistReason — 1 short sentence if seeDermatologist is true, else ""

photoQualityOk — false if photo is too dark, blurry, no face visible, or face is too far away
photoQualityIssue — brief note if false, else null

IMPORTANT:
- Use everyday cosmetic and beauty language. Never use clinical, medical, or diagnostic language.
- Do NOT invent concerns that are not clearly visible.
- Maximum 6 concerns total.
- Keep all text concise and easy to understand for a general audience.`;

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimitResult = RateLimiter.check(`gemini_scan_${ip}`, {
    maxRequests: 5,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: `Too many requests. Please wait ${rateLimitResult.retryAfterSeconds}s before retrying.`,
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimitResult.retryAfterSeconds ?? 60) },
      }
    );
  }

  // Parse multipart form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "NO_IMAGE", message: "No image provided." } },
      { status: 400 }
    );
  }

  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: { code: "NO_IMAGE", message: "No image provided." } },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_FILE_TYPE", message: "File must be a JPEG, PNG, or WebP image." },
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: { code: "FILE_TOO_LARGE", message: "Image must be under 5MB." } },
      { status: 400 }
    );
  }

  // Convert to base64 — never logged
  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: { code: "AI_UNAVAILABLE", message: "AI service is not configured." } },
      { status: 502 }
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

  let geminiRaw: unknown;
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { mimeType: file.type, data: base64String } },
                { text: ANALYSIS_PROMPT },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1800,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "");
      console.error("[analyze-skin] Gemini API error:", geminiRes.status, errText.slice(0, 200));
      return NextResponse.json(
        { success: false, error: { code: "AI_UNAVAILABLE", message: "AI service returned an error." } },
        { status: 502 }
      );
    }

    const geminiJson = await geminiRes.json();
    const textContent = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof textContent !== "string") throw new Error("No text in Gemini response");

    // Strip markdown code fences if present
    const cleaned = textContent.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    geminiRaw = JSON.parse(cleaned);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error("[analyze-skin] JSON parse error from Gemini");
      return NextResponse.json(
        { success: false, error: { code: "AI_PARSE_ERROR", message: "AI response could not be parsed." } },
        { status: 502 }
      );
    }
    console.error("[analyze-skin] Gemini fetch error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { success: false, error: { code: "AI_UNAVAILABLE", message: "AI service is unavailable." } },
      { status: 502 }
    );
  }

  let analysisResult: GeminiAnalysisResult;
  try {
    analysisResult = parseAndValidateGeminiResponse(geminiRaw);
  } catch (err) {
    console.error("[analyze-skin] Validation error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { success: false, error: { code: "AI_PARSE_ERROR", message: "AI response failed validation." } },
      { status: 502 }
    );
  }

  // Persist if signed in — non-fatal if fails
  let scanId: string | null = null;
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      // Strip confidence before storing (not needed in DB)
      const concernsToStore = analysisResult.detectedConcerns.map(
        ({ confidence: _c, ...rest }) => rest
      );

      const scan = await prisma.skinScan.create({
        data: {
          userId: sessionUser.id,
          skinType: analysisResult.skinType ?? "Unknown",
          concerns: concernsToStore as unknown as Prisma.InputJsonValue,
          summary: analysisResult.overallSummary,
        },
      });
      scanId = scan.id;

      // Merge detected concern names into SkinProfile
      if (analysisResult.detectedConcerns.length > 0) {
        const newConcernNames = analysisResult.detectedConcerns.map((c) => c.name);
        const existing = await prisma.skinProfile.findUnique({ where: { userId: sessionUser.id } });
        if (existing) {
          const merged = Array.from(new Set([...existing.concerns, ...newConcernNames]));
          await prisma.skinProfile.update({
            where: { userId: sessionUser.id },
            data: { concerns: merged },
          });
        }
      }
    }
  } catch (err) {
    console.error("[analyze-skin] DB save error:", err instanceof Error ? err.message : "unknown");
  }

  // Strip confidence from public response
  const publicConcerns = analysisResult.detectedConcerns.map(
    ({ confidence: _c, ...rest }) => rest
  );

  return NextResponse.json({
    success: true,
    data: {
      detectedConcerns: publicConcerns,
      skinType: analysisResult.skinType,
      skinTypeReason: analysisResult.skinTypeReason,
      overallSummary: analysisResult.overallSummary,
      routineTips: analysisResult.routineTips,
      seeDermatologist: analysisResult.seeDermatologist,
      seeDermatologistReason: analysisResult.seeDermatologistReason,
      photoQualityOk: analysisResult.photoQualityOk,
      photoQualityIssue: analysisResult.photoQualityIssue,
      scanId,
    },
  });
}
