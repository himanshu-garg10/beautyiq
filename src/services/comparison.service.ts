import { products, mockProductListings } from "@/lib/mock-data";
import type {
  Product,
  ProductComparisonItem,
  ProductListing,
  SkinProfile,
  ComparisonSession,
} from "@/types";
import { ProductService } from "./product.service";
import { ValueEngineService } from "./value-engine.service";
import { RecommendationEngineService } from "./recommendation-engine.service";
import { AIRequirementService } from "./ai-requirement.service";
import { ApiResponse, createSuccessResponse, createErrorResponse, simulateDelay } from "./api-client";

const HISTORY_STORAGE_KEY = "beautyiq_comparison_history";

export class ComparisonService {
  /**
   * Compare 2 to 5 products side-by-side with objective and optional personalized metrics
   */
  static async compareProducts(
    productIds: string[],
    userProfile?: SkinProfile | null
  ): Promise<ApiResponse<ProductComparisonItem[]>> {
    await simulateDelay(150);

    // Validate 2 to 5 products limit
    if (!productIds || productIds.length < 2 || productIds.length > 5) {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "Comparison requires between 2 and 5 products."
      );
    }

    // Ensure unique product IDs
    const uniqueIds = Array.from(new Set(productIds));
    if (uniqueIds.length < 2) {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "Select at least two different products to compare."
      );
    }

    // Build base requirements if userProfile exists
    const hasProfile = userProfile && userProfile.isOnboardingComplete && userProfile.skinType;
    const reqObj = hasProfile
      ? AIRequirementService.createEmptyRequirementObject("Comparison Request")
      : null;

    if (reqObj && userProfile) {
      reqObj.skinType = userProfile.skinType;
      reqObj.concerns = [...userProfile.concerns];
    }

    const items: ProductComparisonItem[] = [];

    for (const id of uniqueIds) {
      const product = products.find((p) => p.id === id);
      if (product) {
        const listings = mockProductListings.filter((l) => l.productId === id);
        const bestPriceListing = ValueEngineService.determineBestPriceListing(listings);
        const bestValueListing = ValueEngineService.determineBestValueListing(listings, product.quantity);

        const priceToUse = bestPriceListing?.price ?? null;
        const { unitPrice, unitLabel } = ValueEngineService.calculateNormalizedUnitCost(
          priceToUse,
          product.quantity,
          product.unit
        );

        let suitabilityMatch: number | null = null;
        let scoreBreakdown = null;
        let reasons: string[] = [];

        // Personalization calculation if profile exists
        if (hasProfile && reqObj && userProfile) {
          const scored = RecommendationEngineService.scoreSingleProduct(product, reqObj, userProfile);
          suitabilityMatch = scored.overallCompatibility;
          scoreBreakdown = scored.scoreBreakdown;
          reasons = scored.whyRecommended || [];
        }

        const valueMetrics = ValueEngineService.getNormalizedValueMetrics(product, listings);

        items.push({
          product,
          listings,
          vfmIndex: valueMetrics.valueScore,
          suitabilityMatch,
          scoreBreakdown,
          reasons,
          bestPriceListing,
          bestValueListing,
          unitPriceLabel: unitLabel,
          unitPriceValue: unitPrice,
        });
      }
    }

    if (items.length < 2) {
      return createErrorResponse("NOT_FOUND", "Products selected for comparison were not found.");
    }

    // Identify best overall highlights across the compared items
    let minUnitPrice = Infinity;
    let maxCompatibility = -1;
    let maxRating = -1;
    let maxValueScore = -1;

    items.forEach((item) => {
      if (item.unitPriceValue !== null && item.unitPriceValue !== undefined && item.unitPriceValue < minUnitPrice) {
        minUnitPrice = item.unitPriceValue;
      }
      if (item.suitabilityMatch !== null && item.suitabilityMatch !== undefined && item.suitabilityMatch > maxCompatibility) {
        maxCompatibility = item.suitabilityMatch;
      }
      if (item.product.rating !== null && item.product.rating !== undefined && item.product.rating > maxRating) {
        maxRating = item.product.rating;
      }
      if (item.vfmIndex > maxValueScore) {
        maxValueScore = item.vfmIndex;
      }
    });

    items.forEach((item) => {
      item.isBestPriceOverall = item.unitPriceValue !== null && item.unitPriceValue !== undefined && item.unitPriceValue === minUnitPrice;
      item.isBestCompatibilityOverall = item.suitabilityMatch !== null && item.suitabilityMatch !== undefined && item.suitabilityMatch === maxCompatibility;
      item.isBestRatedOverall = item.product.rating !== null && item.product.rating !== undefined && item.product.rating === maxRating;
      item.isBestValueOverall = item.vfmIndex === maxValueScore;

      // Add objective grounded comparison notes
      if (!item.reasons) item.reasons = [];
      if (item.isBestPriceOverall) item.reasons.push(`✓ Lowest price per unit (${item.unitPriceLabel})`);
      if (item.isBestRatedOverall) item.reasons.push(`✓ Highest customer rating (${item.product.rating}★)`);
      if (item.isBestCompatibilityOverall && item.suitabilityMatch !== null) {
        item.reasons.push(`✓ Best overall skin compatibility (${item.suitabilityMatch}%)`);
      }
    });

    // Save comparison session to history
    this.saveComparisonSession(uniqueIds);

    return createSuccessResponse(items);
  }

  /**
   * Get comparison history from localStorage
   */
  static getComparisonHistory(): ComparisonSession[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to read comparison history:", e);
      return [];
    }
  }

  /**
   * Save comparison session to localStorage
   */
  static saveComparisonSession(productIds: string[]): ComparisonSession {
    const history = this.getComparisonHistory();
    const productNames = productIds
      .map((id) => products.find((p) => p.id === id)?.brand || id)
      .filter(Boolean);

    const newSession: ComparisonSession = {
      id: `comp_${Date.now()}`,
      productIds,
      createdAt: new Date().toISOString(),
      criteria: `${productIds.length} Products Matrix`,
      productNames,
    };

    const updated = [newSession, ...history.filter((s) => s.productIds.join(",") !== productIds.join(","))].slice(0, 15);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save comparison session:", e);
      }
    }

    return newSession;
  }

  /**
   * Delete single session from comparison history
   */
  static deleteComparisonSession(sessionId: string): ComparisonSession[] {
    const history = this.getComparisonHistory();
    const updated = history.filter((s) => s.id !== sessionId);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to delete comparison session:", e);
      }
    }

    return updated;
  }

  /**
   * Clear all comparison history
   */
  static clearComparisonHistory(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      } catch (e) {
        console.error("Failed to clear comparison history:", e);
      }
    }
  }
}
