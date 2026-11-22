import type { Product, ProductListing, RoutineStep } from "@/types";
import { products as catalogProducts } from "@/data/products";
import { RetailerAggregatorService } from "./retailer-aggregator.service";
import { ValueEngineService } from "./value-engine.service";

export interface SimilarProductMatch {
  product: Product;
  similarityScore: number;
  similarityReasons: string[];
  listings: ProductListing[];
  bestListing?: ProductListing;
  bestPrice: number | null;
  bestStore: string | null;
  unitCostLabel: string;
}

export interface SearchComparisonResult {
  searchQuery: string;
  targetProduct: Product;
  targetListings: ProductListing[];
  targetBestListing?: ProductListing;
  similarProducts: SimilarProductMatch[];
}

export class SimilarProductsService {
  /**
   * Calculate formulated ingredient and routine similarity between two products.
   * Returns a score from 0 to 100 with human-readable comparison reasons.
   */
  static calculateProductSimilarity(
    base: Product,
    candidate: Product
  ): { score: number; reasons: string[] } {
    if (base.id === candidate.id) {
      return { score: 0, reasons: [] };
    }

    let score = 0;
    const reasons: string[] = [];

    // 1. Routine Step / Category Match (35% weight)
    const baseCat = base.category.toLowerCase();
    const candCat = candidate.category.toLowerCase();

    const isCategoryExact = baseCat === candCat;
    const isCategoryRelated =
      (baseCat.includes("wash") || baseCat.includes("cleanser")) &&
      (candCat.includes("wash") || candCat.includes("cleanser"));

    if (isCategoryExact) {
      score += 35;
      reasons.push(`Same step in skincare routine: ${base.category}`);
    } else if (isCategoryRelated) {
      score += 25;
      reasons.push(`Related routine category: ${base.category} & ${candidate.category}`);
    } else {
      // Different category significantly penalizes similarity for direct product substitution
      return { score: 0, reasons: [] };
    }

    // 2. Key Active Ingredients Overlap (35% weight)
    const baseActives = (base.keyIngredients || []).map((i) => i.toLowerCase().trim());
    const candActives = (candidate.keyIngredients || []).map((i) => i.toLowerCase().trim());
    const baseAll = (base.allIngredients || []).map((i) => i.toLowerCase().trim());
    const candAll = (candidate.allIngredients || []).map((i) => i.toLowerCase().trim());

    const sharedKeyActives: string[] = [];
    for (const bActive of baseActives) {
      const match = candActives.find((c) => c.includes(bActive) || bActive.includes(c));
      if (match) {
        sharedKeyActives.push(bActive);
      } else {
        // Check in all ingredients
        const inAll = candAll.find((c) => c.includes(bActive) || bActive.includes(c));
        if (inAll) {
          sharedKeyActives.push(bActive);
        }
      }
    }

    if (sharedKeyActives.length > 0) {
      const uniqueShared = Array.from(new Set(sharedKeyActives));
      const points = Math.min(35, uniqueShared.length * 15);
      score += points;
      const formatted = uniqueShared
        .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
        .join(", ");
      reasons.push(`Shared active ingredients: ${formatted}`);
    }

    // 3. Target Skin Concerns Alignment (15% weight)
    const baseConcerns = (base.targetConcerns || []).map((c) => c.toLowerCase());
    const candConcerns = (candidate.targetConcerns || []).map((c) => c.toLowerCase());
    const sharedConcerns = baseConcerns.filter((bc) => candConcerns.some((cc) => cc.includes(bc) || bc.includes(cc)));

    if (sharedConcerns.length > 0) {
      score += Math.min(15, sharedConcerns.length * 6);
      const capConcerns = sharedConcerns
        .slice(0, 2)
        .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
        .join(" & ");
      reasons.push(`Targets same concerns: ${capConcerns}`);
    }

    // 4. Skin Type Compatibility (10% weight)
    const baseSkins = (base.skinTypes || []).map((s) => s.toLowerCase());
    const candSkins = (candidate.skinTypes || []).map((s) => s.toLowerCase());
    const hasUniversalMatch =
      baseSkins.includes("all skin types") || candSkins.includes("all skin types");
    const hasSkinOverlap =
      hasUniversalMatch || baseSkins.some((bs) => candSkins.includes(bs));

    if (hasSkinOverlap) {
      score += 10;
    }

    // 5. Formulation Safety Preference Overlap (Cruelty-free, Fragrance-free, Vegan)
    if (base.fragranceFree && candidate.fragranceFree) {
      score += 3;
      reasons.push("Both 100% Fragrance-Free");
    }
    if (base.crueltyFree && candidate.crueltyFree) {
      score += 2;
    }

    // 6. Brand Diversity Bonus (+10 points)
    // We intentionally prioritize competing alternatives from OTHER brands & websites
    if (base.brand.toLowerCase() !== candidate.brand.toLowerCase()) {
      score += 10;
      reasons.push(`Alternative brand option: ${candidate.brand} vs ${base.brand}`);
    }

    return {
      score: Math.min(100, Math.round(score)),
      reasons: reasons.slice(0, 3),
    };
  }

  /**
   * Find the top similar products for a given target product.
   */
  static findSimilarProducts(
    targetProduct: Product,
    allProducts: Product[] = catalogProducts,
    limit: number = 3
  ): SimilarProductMatch[] {
    const scoredList: {
      product: Product;
      score: number;
      reasons: string[];
    }[] = [];

    for (const p of allProducts) {
      if (p.id === targetProduct.id) continue;
      const { score, reasons } = this.calculateProductSimilarity(targetProduct, p);
      if (score >= 35) {
        scoredList.push({ product: p, score, reasons });
      }
    }

    // Sort descending by similarity score
    scoredList.sort((a, b) => b.score - a.score);

    // Prefer diverse brands in top suggestions
    const finalMatches: typeof scoredList = [];
    const seenBrands = new Set<string>();

    for (const item of scoredList) {
      if (finalMatches.length >= limit) break;
      const bLower = item.product.brand.toLowerCase();
      if (!seenBrands.has(bLower)) {
        seenBrands.add(bLower);
        finalMatches.push(item);
      }
    }

    // If still have room, add remaining highest scoring
    if (finalMatches.length < limit) {
      for (const item of scoredList) {
        if (finalMatches.length >= limit) break;
        if (!finalMatches.some((m) => m.product.id === item.product.id)) {
          finalMatches.push(item);
        }
      }
    }

    return finalMatches.map((item) => {
      const listings = RetailerAggregatorService.generateRetailerListings(item.product);
      const validPrices = listings.filter((l) => l.price !== null && l.price > 0);
      const best = validPrices.length > 0
        ? [...validPrices].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0]
        : undefined;

      const unitPriceCalc = ValueEngineService.calculateNormalizedUnitCost(
        best?.price ?? null,
        item.product.quantity,
        item.product.unit
      );

      return {
        product: item.product,
        similarityScore: item.score,
        similarityReasons: item.reasons,
        listings,
        bestListing: best,
        bestPrice: best?.price ?? null,
        bestStore: best?.platform ?? null,
        unitCostLabel: unitPriceCalc.unitLabel,
      };
    });
  }

  /**
   * Build a comprehensive search comparison result:
   * Identifies the primary search target, its live multi-store listings,
   * and ranks competing similar products from other websites.
   */
  static getComparisonForSearch(
    queryText: string,
    allProducts: Product[] = catalogProducts,
    limit: number = 3
  ): SearchComparisonResult | null {
    const q = queryText.trim().toLowerCase();
    if (!q || allProducts.length === 0) return null;

    // 1. Find the primary matching product
    // Exact name match or brand match first
    let target = allProducts.find((p) => p.name.toLowerCase() === q);

    if (!target) {
      // Find product where name includes query
      target = allProducts.find((p) => p.name.toLowerCase().includes(q));
    }

    if (!target) {
      // Find product where brand and name match
      target = allProducts.find((p) => `${p.brand} ${p.name}`.toLowerCase().includes(q));
    }

    if (!target) {
      // Find product by ingredient match
      target = allProducts.find((p) =>
        p.keyIngredients.some((i) => i.toLowerCase().includes(q))
      );
    }

    if (!target) {
      // Find product by category match
      target = allProducts.find((p) => p.category.toLowerCase().includes(q));
    }

    if (!target) {
      return null;
    }

    // 2. Retrieve multi-retailer listings for target product
    const targetListings = RetailerAggregatorService.generateRetailerListings(target);
    const validTargetPrices = targetListings.filter((l) => l.price !== null && l.price > 0);
    const targetBestListing = validTargetPrices.length > 0
      ? [...validTargetPrices].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0]
      : undefined;

    // 3. Find top formulated similar products from other brands and websites
    const similarProducts = this.findSimilarProducts(target, allProducts, limit);

    return {
      searchQuery: queryText,
      targetProduct: target,
      targetListings,
      targetBestListing,
      similarProducts,
    };
  }
}
