import type {
  Product,
  DuplicateCandidate,
} from "@/types";

export interface IdentityMatchResult {
  matchType: "exact_match" | "potential_duplicate" | "distinct_product";
  matchedProductId?: string;
  confidenceScore: number; // 0 to 100
  reasons: string[];
  duplicateCandidate?: DuplicateCandidate;
}

export class ProductMatchingService {
  /**
   * Evaluate whether incoming product data matches an existing catalog product,
   * is an ambiguous candidate requiring review, or is a brand-new distinct product.
   */
  static matchProductIdentity(
    candidate: {
      name: string;
      brand: string;
      category: string;
      quantity: number;
      unit: string;
      barcodeOrGtin?: string;
      keyIngredients?: string[];
    },
    existingProducts: Product[]
  ): IdentityMatchResult {
    const candidateName = candidate.name.toLowerCase().trim();
    const candidateBrand = candidate.brand.toLowerCase().trim();
    const candidateBarcode = candidate.barcodeOrGtin?.trim();

    // 1. Exact Barcode / GTIN Match (Highest Confidence = 100%)
    if (candidateBarcode) {
      const barcodeMatch = existingProducts.find(
        (p) => p.barcodeOrGtin && p.barcodeOrGtin.trim() === candidateBarcode
      );
      if (barcodeMatch) {
        return {
          matchType: "exact_match",
          matchedProductId: barcodeMatch.id,
          confidenceScore: 100,
          reasons: [`Identical Barcode/GTIN match: ${candidateBarcode}`],
        };
      }
    }

    let highestScore = 0;
    let bestMatchProduct: Product | null = null;
    const matchReasons: string[] = [];

    for (const existing of existingProducts) {
      let score = 0;
      const reasons: string[] = [];

      const existingBrand = existing.brand.toLowerCase().trim();
      const existingName = existing.name.toLowerCase().trim();

      // Brand must match for candidate comparison
      if (candidateBrand !== existingBrand) {
        continue;
      }
      score += 25;
      reasons.push("Matching Brand");

      // Category matching
      if (candidate.category.toLowerCase() === existing.category.toLowerCase()) {
        score += 15;
        reasons.push("Matching Category");
      }

      // Title Similarity
      const titleSim = this.computeStringSimilarity(candidateName, existingName);
      if (titleSim >= 0.9) {
        score += 35;
        reasons.push(`${Math.round(titleSim * 100)}% Title String Match`);
      } else if (titleSim >= 0.75) {
        score += 20;
        reasons.push(`${Math.round(titleSim * 100)}% Partial Title Match`);
      }

      // Quantity & Variant Check
      const sameQuantity =
        candidate.quantity === existing.quantity &&
        candidate.unit.toLowerCase() === existing.unit.toLowerCase();

      if (sameQuantity) {
        score += 15;
        reasons.push(`Identical Size Variant (${candidate.quantity}${candidate.unit})`);
      } else {
        // Different size variant: prevent automatic merging!
        score -= 15;
        reasons.push(`Different Size Variant (${candidate.quantity}${candidate.unit} vs ${existing.quantity}${existing.unit})`);
      }

      // Active Ingredients Overlap
      if (candidate.keyIngredients && candidate.keyIngredients.length > 0) {
        const overlap = candidate.keyIngredients.filter((ing) =>
          existing.keyIngredients.some((eIng) => eIng.toLowerCase() === ing.toLowerCase())
        );
        if (overlap.length > 0) {
          score += 10;
          reasons.push(`Active ingredient overlap: ${overlap.join(", ")}`);
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatchProduct = existing;
        matchReasons.length = 0;
        matchReasons.push(...reasons);
      }
    }

    // Evaluate Final Classification:
    // A) Confidence >= 90% and same quantity -> Confident Match (Cross-platform listing link)
    if (highestScore >= 90 && bestMatchProduct) {
      return {
        matchType: "exact_match",
        matchedProductId: bestMatchProduct.id,
        confidenceScore: highestScore,
        reasons: matchReasons,
      };
    }

    // B) Moderate Confidence (65% - 89%) -> Flag as DuplicateCandidate for Admin Review
    // CRITICAL: When confidence is insufficient, mark as potential duplicate, do NOT silently merge!
    if (highestScore >= 65 && bestMatchProduct) {
      const dupCandidate: DuplicateCandidate = {
        id: `dup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        entityType: "product",
        item1: {
          id: bestMatchProduct.id,
          name: `${bestMatchProduct.brand} ${bestMatchProduct.name}`,
          details: `${bestMatchProduct.quantity}${bestMatchProduct.unit} | ${bestMatchProduct.category}`,
        },
        item2: {
          id: `new-${Date.now()}`,
          name: `${candidate.brand} ${candidate.name}`,
          details: `${candidate.quantity}${candidate.unit} | ${candidate.category}`,
        },
        similarityScore: highestScore,
        reasons: matchReasons,
        status: "pending",
        detectedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      };

      return {
        matchType: "potential_duplicate",
        confidenceScore: highestScore,
        reasons: matchReasons,
        duplicateCandidate: dupCandidate,
      };
    }

    // C) Distinct New Product
    return {
      matchType: "distinct_product",
      confidenceScore: highestScore,
      reasons: ["Sufficiently distinct attributes from existing catalog items"],
    };
  }

  /**
   * Normalized Levenshtein / Token similarity between strings (0 to 1)
   */
  static computeStringSimilarity(s1: string, s2: string): number {
    const clean1 = s1.replace(/[^a-z0-9]/g, " ").trim();
    const clean2 = s2.replace(/[^a-z0-9]/g, " ").trim();

    if (clean1 === clean2) return 1.0;
    if (clean1.length === 0 || clean2.length === 0) return 0;

    const words1 = new Set(clean1.split(/\s+/));
    const words2 = new Set(clean2.split(/\s+/));

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    const jaccard = union.size > 0 ? intersection.size / union.size : 0;
    const smallerSize = Math.min(words1.size, words2.size);
    const containment = smallerSize > 0 ? intersection.size / smallerSize : 0;
    const combined = Math.max(jaccard, containment * 0.9);
    return Math.round(combined * 100) / 100;
  }
}
