import type { SkinProfile as AppSkinProfile } from "@/types";

type PersistedSkinProfile = {
  skinType: string;
  concerns: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  minBudget: number | null;
  maxBudget: number | null;
  allergies: string[];
  preferences: string | null;
  goals: string | null;
  sensitivityLevel: string | null;
  reactionFrequency: string | null;
  knownAllergies: string | null;
  preferredIngredients: string | null;
  avoidIngredients: string | null;
  preferredBrands: string | null;
  excludedBrands: string | null;
  preferredCategories: string | null;
  fragranceFree: boolean;
  crueltyFree: boolean;
  vegan: boolean;
  parabenFree: boolean;
  siliconeFree: boolean;
  isOnboardingComplete: boolean;
  updatedAt: Date;
};

function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function parsePreferences(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function toAppProfile(publicProfile: ReturnType<typeof toPublicProfile>): AppSkinProfile {
  const preferences = parsePreferences(publicProfile.preferences);
  const stringPreference = (key: string, fallback: string) =>
    typeof preferences[key] === "string" ? preferences[key] : fallback;
  const arrayPreference = (key: string): string[] =>
    Array.isArray(preferences[key]) ? preferences[key].map(String) : [];

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
    texturePreference: stringPreference("texturePreference", "Gel") as AppSkinProfile["texturePreference"],
    finishPreference: stringPreference("finishPreference", "Natural") as AppSkinProfile["finishPreference"],
    fragrancePreference: stringPreference(
      "fragrancePreference",
      publicProfile.fragranceFree ? "Fragrance free" : "No preference"
    ) as AppSkinProfile["fragrancePreference"],
    essentialOilPreference: stringPreference("essentialOilPreference", "No preference") as AppSkinProfile["essentialOilPreference"],
    properties: arrayPreference("properties") as AppSkinProfile["properties"],
    skincareExperience: stringPreference("skincareExperience", "Intermediate") as AppSkinProfile["skincareExperience"],
    sunExposure: stringPreference("sunExposure", "Low sun exposure") as AppSkinProfile["sunExposure"],
    climate: stringPreference("climate", "Humid climate") as AppSkinProfile["climate"],
    budget: {
      min: publicProfile.budgetMin,
      max: publicProfile.budgetMax,
      monthlyBudget: typeof preferences.monthlyBudget === "number" ? preferences.monthlyBudget : undefined,
      label: "Mid-Range",
    },
    isOnboardingComplete: publicProfile.isOnboardingComplete,
    completedStepsCount: publicProfile.isOnboardingComplete ? 7 : 0,
  };
}

export function toPublicProfile(profile: PersistedSkinProfile) {
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
  return toAppProfile(publicProfile);
}

export function toAppSkinProfile(profile: PersistedSkinProfile): AppSkinProfile {
  const publicProfile = toPublicProfile(profile);
  return toAppProfile({
    ...publicProfile,
    allergies: publicProfile.allergies.length
      ? publicProfile.allergies
      : parseStringArray(profile.knownAllergies),
  });
}
