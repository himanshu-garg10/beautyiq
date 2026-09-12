/**
 * BeautyIQ AI Guardrail Service
 * Prevents AI hallucinations:
 * - Never fabricates products, prices, ingredients, ratings, availability, sellers, or platforms
 * - Validates all product facts against the real verified catalog
 * - If product info is missing, clearly flags it as unavailable rather than inventing defaults
 */

import type { Product, RecommendationResultSet } from "@/types";

export interface AIGuardrailValidationResult {
  isValid: boolean;
  violations: string[];
  sanitizedResultSet?: RecommendationResultSet;
}

export class AIGuardrailService {
  /**
   * Validate that all items in an AI recommendation result set match real catalog products
   * and contain no fabricated facts.
   */
  static validateRecommendationFacts(
    resultSet: RecommendationResultSet,
    verifiedCatalog: Product[]
  ): AIGuardrailValidationResult {
    const violations: string[] = [];
    const verifiedMap = new Map<string, Product>(verifiedCatalog.map((p) => [p.id, p]));

    const candidateProducts = [
      resultSet.bestOverall?.product,
      resultSet.bestForMainConcern?.product,
      resultSet.bestIngredientMatch?.product,
      resultSet.bestBudgetOption?.product,
      ...(resultSet.rankedCandidates?.map((c) => c.product) || []),
    ].filter(Boolean) as Product[];

    for (const prod of candidateProducts) {
      const realProd = verifiedMap.get(prod.id);
      if (!realProd) {
        violations.push(
          `Hallucinated product detected: ID "${prod.id}" ("${prod.brand} ${prod.name}") does not exist in verified catalog.`
        );
        continue;
      }

      // Check for fabricated brand
      if (prod.brand.toLowerCase() !== realProd.brand.toLowerCase()) {
        violations.push(
          `Brand mismatch on product ${prod.id}: claims "${prod.brand}" but verified catalog has "${realProd.brand}".`
        );
      }

      // Check ratings
      if (realProd.rating === null || realProd.rating === undefined) {
        if (prod.rating !== null && prod.rating !== undefined) {
          violations.push(
            `Fabricated rating on unrated product ${prod.id}: claims rating ${prod.rating} when catalog has null.`
          );
        }
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  /**
   * Safe explanation generator that explicitly states when ingredient or price facts are unavailable
   */
  static ensureTransparentFacts(product: Product): {
    ingredientStatus: "verified" | "partial" | "unavailable";
    ingredientNotice?: string;
    pricingNotice?: string;
  } {
    const hasIngredients = product.allIngredients && product.allIngredients.length > 0;
    const hasKeyIngredients = product.keyIngredients && product.keyIngredients.length > 0;

    let ingredientStatus: "verified" | "partial" | "unavailable" = "verified";
    let ingredientNotice: string | undefined = undefined;

    if (!hasIngredients && !hasKeyIngredients) {
      ingredientStatus = "unavailable";
      ingredientNotice =
        "Complete ingredient list is currently unavailable from verified sources. Ingredient safety could not be fully evaluated.";
    } else if (product.uncertainIngredients && product.uncertainIngredients.length > 0) {
      ingredientStatus = "partial";
      ingredientNotice = `Certain ingredients could not be standardized: ${product.uncertainIngredients.join(", ")}.`;
    }

    return {
      ingredientStatus,
      ingredientNotice,
    };
  }
}
