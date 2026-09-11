import { products } from "@/lib/mock-data";
import type { Product, SkinProfile, NaturalLanguageQueryResult } from "@/types";
import { ProductService } from "./product.service";
import { ApiResponse, createSuccessResponse, simulateDelay } from "./api-client";

export class RecommendationService {
  /**
   * Calculate compatibility score (0-100) between a product and a user skin profile
   */
  static calculateCompatibility(product: Product, profile: SkinProfile): {
    score: number;
    reasons: string[];
    warnings: string[];
  } {
    let score = 50; // base score
    const reasons: string[] = [];
    const warnings: string[] = [];

    // 1. Skin Type Match (+20)
    if (product.skinTypes.includes(profile.skinType)) {
      score += 20;
      reasons.push(`Formulated specifically for ${profile.skinType} skin`);
    } else if (product.skinTypes.includes("All skin types" as any)) {
      score += 15;
      reasons.push("Suitable for all skin types");
    } else {
      warnings.push(`Not primarily targeted for ${profile.skinType} skin`);
    }

    // 2. Concerns Match (+20)
    const matchingConcerns = product.targetConcerns.filter((c) =>
      profile.concerns.includes(c)
    );
    if (matchingConcerns.length > 0) {
      score += Math.min(matchingConcerns.length * 10, 20);
      reasons.push(`Targets active concerns: ${matchingConcerns.join(", ")}`);
    }

    // 3. Avoid Ingredients Check (-30 per hit & warning)
    const hitAvoided = product.allIngredients.filter((ing) =>
      profile.avoidIngredients.some((avoid) =>
        ing.toLowerCase().includes(avoid.toLowerCase())
      )
    );

    if (hitAvoided.length > 0) {
      score -= 30;
      warnings.push(`Contains avoided ingredients: ${hitAvoided.join(", ")}`);
    }

    // 4. Preference Bonuses (+10)
    if (profile.fragrancePreference === "Fragrance free" && product.fragranceFree) {
      score += 5;
      reasons.push("100% Fragrance-free formulation");
    }
    if (profile.texturePreference && profile.texturePreference !== "No preference" && product.category.toLowerCase().includes(profile.texturePreference.toLowerCase())) {
      score += 5;
      reasons.push(`Matches preferred ${profile.texturePreference} texture`);
    }

    // Cap score between 0 and 100
    const finalScore = Math.min(Math.max(Math.round(score), 10), 99);

    return {
      score: finalScore,
      reasons,
      warnings,
    };
  }

  /**
   * Process natural language AI search prompt
   */
  static async processNaturalLanguageQuery(
    query: string,
    profile?: SkinProfile
  ): Promise<ApiResponse<NaturalLanguageQueryResult>> {
    await simulateDelay(350);

    const lower = query.toLowerCase();
    const extractedCriteria: NaturalLanguageQueryResult["extractedCriteria"] = {};

    // Basic AI entity extraction simulation
    if (lower.includes("cleanser") || lower.includes("wash")) {
      extractedCriteria.category = "Cleanser";
    } else if (lower.includes("serum")) {
      extractedCriteria.category = "Serum";
    } else if (lower.includes("moisturizer") || lower.includes("cream")) {
      extractedCriteria.category = "Moisturizer";
    } else if (lower.includes("sunscreen") || lower.includes("spf")) {
      extractedCriteria.category = "Sunscreen";
    }

    if (lower.includes("oily")) extractedCriteria.skinType = "Oily";
    if (lower.includes("dry")) extractedCriteria.skinType = "Dry";
    if (lower.includes("combination")) extractedCriteria.skinType = "Combination";
    if (lower.includes("sensitive")) extractedCriteria.skinType = "Sensitive";

    // Extract price cap if numbers present
    const priceMatch = lower.match(/(under|below|less than|budget)\s*₹?\s*(\d+)/);
    if (priceMatch && priceMatch[2]) {
      extractedCriteria.maxBudget = parseInt(priceMatch[2], 10);
    }

    // Filter products based on extracted parameters
    let matched = [...products];

    if (extractedCriteria.category) {
      matched = matched.filter((p) => p.category === extractedCriteria.category);
    }
    if (extractedCriteria.skinType) {
      matched = matched.filter((p) => p.skinTypes.includes(extractedCriteria.skinType!));
    }
    if (extractedCriteria.maxBudget) {
      matched = matched.filter((p) => {
        const best = ProductService.getBestListingForProduct(p.id);
        if (!best || best.price === null) return true;
        return best.price <= extractedCriteria.maxBudget!;
      });
    }

    // Attach scores if profile provided
    if (profile) {
      matched = matched.map((p) => {
        const calc = this.calculateCompatibility(p, profile);
        return {
          ...p,
          compatibilityScore: calc.score,
          whyRecommended: calc.reasons,
          warnings: calc.warnings,
        };
      });
      matched.sort((a, b) => (b.compatibilityScore ?? 0) - (a.compatibilityScore ?? 0));
    }

    return createSuccessResponse({
      query,
      extractedCriteria,
      confidence: 0.92,
      matchedProducts: matched,
      explanation: `Analyzed query "${query}". Identified ${
        extractedCriteria.category || "skincare"
      } request suitable for ${extractedCriteria.skinType || "targeted"} skin${
        extractedCriteria.maxBudget ? ` under ₹${extractedCriteria.maxBudget}` : ""
      }.`,
    });
  }
}
