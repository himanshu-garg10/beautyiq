import type { SkinProfile as PrismaSkinProfile } from "@prisma/client";
import type { SkinProfile as AppSkinProfile } from "@/types";

function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function toPublicProfile(profile: PrismaSkinProfile) {
  return {
    skinType: profile.skinType,
    concerns: profile.concerns,
    budgetMin: profile.budgetMin ?? profile.minBudget ?? 0,
    budgetMax: profile.budgetMax ?? profile.maxBudget ?? 2000,
    allergies: profile.allergies,
    preferences: profile.preferences,
    goals: parseStringArray(profile.goals),
    sensitivityLevel: profile.sensitivityLevel,
    reactionFrequency: profile.reactionFrequency,
    preferredIngredients: parseStringArray(profile.preferredIngredients),
    avoidIngredients: parseStringArray(profile.avoidIngredients),
    fragranceFree: profile.fragranceFree,
    crueltyFree: profile.crueltyFree,
    vegan: profile.vegan,
    parabenFree: profile.parabenFree,
    siliconeFree: profile.siliconeFree,
    isOnboardingComplete: profile.isOnboardingComplete,
    updatedAt: profile.updatedAt,
  };
}

export function toAppSkinProfileFromPublic(
  publicProfile: ReturnType<typeof toPublicProfile>
): AppSkinProfile {
  return {
    skinType: (publicProfile.skinType as AppSkinProfile["skinType"]) || "Combination",
    concerns: publicProfile.concerns as AppSkinProfile["concerns"],
    goals: publicProfile.goals as AppSkinProfile["goals"],
    sensitivityLevel: (publicProfile.sensitivityLevel as AppSkinProfile["sensitivityLevel"]) || "Medium",
    reactionFrequency: (publicProfile.reactionFrequency as AppSkinProfile["reactionFrequency"]) || "Rarely",
    knownAllergies: publicProfile.allergies as AppSkinProfile["knownAllergies"],
    preferredIngredients: publicProfile.preferredIngredients,
    avoidIngredients: publicProfile.avoidIngredients,
    preferredBrands: [],
    excludedBrands: [],
    preferredCategories: [],
    texturePreference: "Gel",
    finishPreference: "Natural",
    fragrancePreference: publicProfile.fragranceFree ? "Fragrance free" : "No preference",
    essentialOilPreference: "No preference",
    properties: [
      ...(publicProfile.vegan ? (["Vegan"] as const) : []),
      ...(publicProfile.crueltyFree ? (["Cruelty free"] as const) : []),
    ],
    skincareExperience: "Intermediate",
    budget: {
      min: publicProfile.budgetMin,
      max: publicProfile.budgetMax,
      label: "Mid-Range",
    },
    isOnboardingComplete: publicProfile.isOnboardingComplete,
    completedStepsCount: publicProfile.isOnboardingComplete ? 7 : 0,
  };
}

export function toAppSkinProfile(profile: PrismaSkinProfile): AppSkinProfile {
  const publicProfile = toPublicProfile(profile);
  return {
    skinType: (publicProfile.skinType as AppSkinProfile["skinType"]) || "Combination",
    concerns: publicProfile.concerns as AppSkinProfile["concerns"],
    goals: publicProfile.goals as AppSkinProfile["goals"],
    sensitivityLevel: (publicProfile.sensitivityLevel as AppSkinProfile["sensitivityLevel"]) || "Medium",
    reactionFrequency: (publicProfile.reactionFrequency as AppSkinProfile["reactionFrequency"]) || "Rarely",
    knownAllergies: (publicProfile.allergies.length
      ? publicProfile.allergies
      : parseStringArray(profile.knownAllergies)) as AppSkinProfile["knownAllergies"],
    preferredIngredients: publicProfile.preferredIngredients,
    avoidIngredients: publicProfile.avoidIngredients,
    preferredBrands: parseStringArray(profile.preferredBrands),
    excludedBrands: parseStringArray(profile.excludedBrands),
    preferredCategories: parseStringArray(profile.preferredCategories) as AppSkinProfile["preferredCategories"],
    texturePreference: "Gel",
    finishPreference: "Natural",
    fragrancePreference: publicProfile.fragranceFree ? "Fragrance free" : "No preference",
    essentialOilPreference: "No preference",
    properties: [
      ...(publicProfile.vegan ? (["Vegan"] as const) : []),
      ...(publicProfile.crueltyFree ? (["Cruelty free"] as const) : []),
    ],
    skincareExperience: "Intermediate",
    budget: {
      min: publicProfile.budgetMin,
      max: publicProfile.budgetMax,
      label: "Mid-Range",
    },
    isOnboardingComplete: publicProfile.isOnboardingComplete,
    completedStepsCount: publicProfile.isOnboardingComplete ? 7 : 0,
  };
}
