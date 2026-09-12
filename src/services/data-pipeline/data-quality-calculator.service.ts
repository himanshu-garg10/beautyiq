import type {
  Product,
  ProductListing,
  ProductStatus,
  DataQualityState,
} from "@/types";

export interface DataConfidenceBreakdown {
  overallConfidence: number; // 0 to 100
  sourceReliabilityScore: number;
  fieldCompletenessScore: number;
  ingredientConfidenceScore: number;
  freshnessScore: number;
  qualityState: DataQualityState;
  qualityFlags: string[];
  freshnessLabel: string;
}

export class DataQualityCalculatorService {
  /**
   * Calculate independent Data Confidence Score (0 to 100) and Data Quality State.
   * NOTE: Data Confidence is strictly isolated from recommendation compatibility score.
   */
  static assessProductQuality(
    product: Partial<Product>,
    listings: ProductListing[] = [],
    sourceReliability = 90
  ): DataConfidenceBreakdown {
    const qualityFlags: string[] = [];

    // 1. Source Reliability (Weight: 25%)
    const sourceScore = Math.max(0, Math.min(100, sourceReliability));

    // 2. Field Completeness (Weight: 35%)
    let completenessPoints = 0;
    if (product.name && product.name.trim().length > 3) completenessPoints += 15;
    if (product.brand && product.brand.trim().length > 1) completenessPoints += 10;
    if (product.category) completenessPoints += 10;
    if (product.description && product.description.length > 20) completenessPoints += 10;
    if (product.quantity && product.quantity > 0) completenessPoints += 10;
    if (product.images && product.images.length > 0) {
      completenessPoints += 15;
    } else {
      qualityFlags.push("missing_images");
    }
    if (product.rating !== null && product.rating !== undefined) {
      completenessPoints += 10;
    } else {
      qualityFlags.push("unrated_product");
    }
    if (listings.some((l) => l.price !== null)) {
      completenessPoints += 20;
    } else {
      qualityFlags.push("missing_active_price");
    }
    const fieldCompletenessScore = Math.min(100, completenessPoints);

    // 3. Ingredient Confidence (Weight: 25%)
    let ingredientScore = 0;
    const totalIngredients = (product.allIngredients || []).length;
    const uncertainCount = (product.uncertainIngredients || []).length;

    if (totalIngredients > 0) {
      const normalizedRatio = (totalIngredients - uncertainCount) / totalIngredients;
      ingredientScore = Math.round(normalizedRatio * 100);
      if (uncertainCount > 0) {
        qualityFlags.push(`uncertain_ingredients_count_${uncertainCount}`);
      }
    } else if (product.keyIngredients && product.keyIngredients.length > 0) {
      ingredientScore = 65;
      qualityFlags.push("incomplete_inci_list");
    } else {
      ingredientScore = 15;
      qualityFlags.push("missing_ingredients");
    }

    // 4. Freshness Factor (Weight: 15%)
    const { freshnessScore, freshnessLabel, isOutdated } = this.calculateFreshness(
      product.lastUpdated,
      listings
    );

    if (isOutdated) {
      qualityFlags.push("outdated_record");
    }

    // Weighted Overall Data Confidence Calculation
    const overallConfidence = Math.round(
      sourceScore * 0.25 +
      fieldCompletenessScore * 0.35 +
      ingredientScore * 0.25 +
      freshnessScore * 0.15
    );

    // Determine Data Quality State
    let qualityState: DataQualityState = "Complete";

    if (product.productStatus === "Failed") {
      qualityState = "Failed";
    } else if (qualityFlags.includes("missing_active_price") || qualityFlags.includes("missing_ingredients") || qualityFlags.includes("missing_images")) {
      qualityState = "Incomplete";
    } else if (isOutdated) {
      qualityState = "Outdated";
    } else if (overallConfidence < 75) {
      qualityState = "Incomplete";
    }

    return {
      overallConfidence: Math.max(10, Math.min(100, overallConfidence)),
      sourceReliabilityScore: sourceScore,
      fieldCompletenessScore,
      ingredientConfidenceScore: ingredientScore,
      freshnessScore,
      qualityState,
      qualityFlags,
      freshnessLabel,
    };
  }

  /**
   * Freshness tracking using actual timestamps
   */
  static calculateFreshness(
    productLastUpdated?: string,
    listings: ProductListing[] = []
  ): { freshnessScore: number; freshnessLabel: string; isOutdated: boolean } {
    const now = Date.now();

    // Use most recent listing timestamp or product timestamp
    const timestamps = [
      productLastUpdated ? new Date(productLastUpdated).getTime() : 0,
      ...listings.map((l) => new Date(l.priceLastUpdated || l.lastUpdated).getTime()),
    ].filter((t) => !isNaN(t) && t > 0);

    const mostRecent = timestamps.length > 0 ? Math.max(...timestamps) : 0;

    if (!mostRecent) {
      return {
        freshnessScore: 50,
        freshnessLabel: "Update history unavailable",
        isOutdated: false,
      };
    }

    const diffDays = Math.floor((now - mostRecent) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return {
        freshnessScore: 100,
        freshnessLabel: "Price updated today",
        isOutdated: false,
      };
    } else if (diffDays <= 3) {
      return {
        freshnessScore: 95,
        freshnessLabel: `Price updated ${diffDays} days ago`,
        isOutdated: false,
      };
    } else if (diffDays <= 7) {
      return {
        freshnessScore: 85,
        freshnessLabel: "Updated this week",
        isOutdated: false,
      };
    } else if (diffDays <= 30) {
      return {
        freshnessScore: 70,
        freshnessLabel: `Updated ${diffDays} days ago`,
        isOutdated: false,
      };
    } else {
      return {
        freshnessScore: 40,
        freshnessLabel: "Price information may be outdated (>30d)",
        isOutdated: true,
      };
    }
  }
}
