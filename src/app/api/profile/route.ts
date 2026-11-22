import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth/session";
import { profileUpdateSchema } from "@/lib/auth/validation";
import { toPublicProfile } from "@/lib/auth/profile-map";
import { InputValidator } from "@/lib/security/input-validator";

// Session lookup reads request headers/cookies; this must never be prerendered.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, response } = await requireSessionUser();
    if (!user) return response!;

    const objectIdPattern = /^[a-f\d]{24}$/i;
    if (!objectIdPattern.test(user.id)) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const profile = await prisma.skinProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      data: profile ? toPublicProfile(profile) : null,
    });
  } catch (error: unknown) {
    return InputValidator.createSafeErrorResponse(error, "Failed to load skin profile.");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, response } = await requireSessionUser();
    if (!user) return response!;

    const body = await req.json().catch(() => null);
    const { userId: _ignoredUserId, ...profileBody } = body && typeof body === "object" ? body : {};
    void _ignoredUserId;
    const parsed = profileUpdateSchema.safeParse(profileBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Invalid profile data.",
          },
        },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const skinType = input.skinType || "Combination";
    const concerns = input.concerns || [];
    const allergies = input.allergies || [];
    const budgetMin = input.budgetMin ?? 0;
    const budgetMax = input.budgetMax ?? 2000;

    const data = {
      skinType,
      concerns,
      allergies,
      budgetMin,
      budgetMax,
      minBudget: budgetMin,
      maxBudget: budgetMax,
      preferences: input.preferences ?? null,
      goals: input.goals ? JSON.stringify(input.goals) : undefined,
      sensitivityLevel: input.sensitivityLevel ?? undefined,
      reactionFrequency: input.reactionFrequency ?? undefined,
      preferredIngredients: input.preferredIngredients
        ? JSON.stringify(input.preferredIngredients)
        : undefined,
      avoidIngredients: input.avoidIngredients ? JSON.stringify(input.avoidIngredients) : undefined,
      fragranceFree: input.fragranceFree,
      crueltyFree: input.crueltyFree,
      vegan: input.vegan,
      parabenFree: input.parabenFree,
      siliconeFree: input.siliconeFree,
      isOnboardingComplete: input.isOnboardingComplete ?? true,
    };

    const objectIdPattern = /^[a-f\d]{24}$/i;
    if (!objectIdPattern.test(user.id)) {
      return NextResponse.json({
        success: true,
        data: { id: "profile-local", userId: user.id, ...data },
      });
    }

    const profile = await prisma.skinProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...data,
        goals: data.goals ?? JSON.stringify(input.goals || []),
        preferredIngredients: data.preferredIngredients ?? JSON.stringify(input.preferredIngredients || []),
        avoidIngredients: data.avoidIngredients ?? JSON.stringify(input.avoidIngredients || []),
      },
      update: data,
    });

    return NextResponse.json({ success: true, data: toPublicProfile(profile) });
  } catch (error: unknown) {
    return InputValidator.createSafeErrorResponse(error, "Failed to update skin profile.");
  }
}
