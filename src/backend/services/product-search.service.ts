import type {
  Product,
  ProductListing,
  RoutineStep,
  SkinType,
  DetailedSkinConcern,
  StructuredSkincareRequirement,
} from "@/types";
import { AdminDataService } from "./admin-data.service";
import { ProductMatchingService } from "./data-pipeline/product-matching.service";
import { INGREDIENT_SYNONYMS } from "./data-pipeline/normalization.service";

export interface RealSearchResult {
  products: Product[];
  totalMatches: number;
  query: string;
  matchedBy: {
    brand?: string;
    category?: string;
    ingredient?: string;
    concern?: string;
    fuzzyQuery?: string;
  };
  hasRelaxedFallbacks: boolean;
  relaxedExplanation?: string;
  relaxedProducts?: Product[];
}

export class ProductSearchService {
  /**
   * Search the real, normalized product database.
   * Typo-tolerant, synonym-expanding, fuzzy matching without ever hallucinating fictional products.
   */
  static async searchVerifiedProducts(
    queryText: string,
    filters?: {
      category?: RoutineStep | string;
      brand?: string;
      skinType?: SkinType;
      concern?: DetailedSkinConcern | string;
      maxPrice?: number;
      verifiedOnly?: boolean;
    }
  ): Promise<RealSearchResult> {
    const allProducts = await AdminDataService.getProducts();
    const allListings = await AdminDataService.getListings();

    const q = queryText.toLowerCase().trim();
    const matchedBy: RealSearchResult["matchedBy"] = {};

    // 1. Expand query synonyms (e.g., "b3" -> "niacinamide", "cica" -> "centella asiatica")
    const expandedTerms = this.expandSynonyms(q);

    // 2. Filter products through multi-field matching
    let matches = allProducts.filter((product) => {
      // Verified only filter if active
      if (filters?.verifiedOnly && product.isVerified === false) {
        return false;
      }

      // Hard Category filter
      if (filters?.category && filters.category !== "all") {
        if (product.category.toLowerCase() !== filters.category.toLowerCase()) {
          return false;
        }
      }

      // Hard Brand filter
      if (filters?.brand && filters.brand !== "all") {
        if (product.brand.toLowerCase() !== filters.brand.toLowerCase()) {
          return false;
        }
      }

      // Hard Skin Type filter
      if (filters?.skinType) {
        if (!product.skinTypes.includes(filters.skinType) && !product.skinTypes.includes("All Skin Types" as any)) {
          return false;
        }
      }

      // Hard Concern filter
      if (filters?.concern) {
        const cLower = filters.concern.toLowerCase();
        if (!product.targetConcerns.some((c) => c.toLowerCase() === cLower)) {
          return false;
        }
      }

      // Hard Max Price filter
      if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
        const listings = allListings.filter((l) => l.productId === product.id && l.price !== null);
        const minPrice = listings.length > 0 ? Math.min(...listings.map((l) => l.price!)) : null;
        if (minPrice !== null && minPrice > filters.maxPrice) {
          return false;
        }
      }

      // If no query string, product passed all filters
      if (!q) return true;

      // Text search: Product Name
      if (product.name.toLowerCase().includes(q)) return true;

      // Brand search
      if (product.brand.toLowerCase().includes(q)) {
        matchedBy.brand = product.brand;
        return true;
      }

      // Category search
      if (product.category.toLowerCase().includes(q)) {
        matchedBy.category = product.category;
        return true;
      }

      // Ingredients & Synonyms search
      const hasIngredientMatch = product.allIngredients.some((ing) => {
        const ingLower = ing.toLowerCase();
        return expandedTerms.some((term) => ingLower.includes(term) || term.includes(ingLower));
      });
      if (hasIngredientMatch) {
        matchedBy.ingredient = q;
        return true;
      }

      // Concerns search
      const hasConcernMatch = product.targetConcerns.some((c) => c.toLowerCase().includes(q));
      if (hasConcernMatch) {
        matchedBy.concern = q;
        return true;
      }

      // Fuzzy / Typo tolerance on name, brand, and ingredients (Levenshtein edit distance)
      if (q.length >= 4) {
        const nameWords = product.name.toLowerCase().split(/[^a-z0-9]+/);
        const brandWords = product.brand.toLowerCase().split(/[^a-z0-9]+/);
        const ingredientWords = product.allIngredients.flatMap((i) => i.toLowerCase().split(/[^a-z0-9]+/));
        const allWords = [...nameWords, ...brandWords, ...ingredientWords];
        const hasFuzzyWordMatch = allWords.some((w) => this.isWordFuzzyMatch(w, q));
        if (hasFuzzyWordMatch) {
          matchedBy.fuzzyQuery = q;
          return true;
        }
      }

      return false;
    });

    // 3. NO HALLUCINATIONS GUARANTEE:
    // If 0 verified products match, DO NOT fabricate results.
    // Instead, evaluate requirement relaxation (e.g., relaxing price or brand filter)
    if (matches.length === 0 && filters && (filters.maxPrice || filters.brand || filters.category)) {
      const relaxedResult = this.generateRelaxedSearchResults(allProducts, allListings, q, filters);
      return {
        products: [],
        totalMatches: 0,
        query: queryText,
        matchedBy,
        hasRelaxedFallbacks: true,
        relaxedExplanation: relaxedResult.explanation,
        relaxedProducts: relaxedResult.products,
      };
    }

    return {
      products: matches,
      totalMatches: matches.length,
      query: queryText,
      matchedBy,
      hasRelaxedFallbacks: false,
    };
  }

  /**
   * Expand common consumer abbreviations and trade synonyms
   */
  private static expandSynonyms(q: string): string[] {
    const terms = [q];

    if (q === "b3" || q === "vitamin b3") {
      terms.push("niacinamide", "nicotinamide");
    } else if (q === "bha") {
      terms.push("salicylic acid");
    } else if (q === "aha") {
      terms.push("glycolic acid", "lactic acid");
    } else if (q === "cica" || q === "gotu kola") {
      terms.push("centella asiatica", "madecassoside");
    } else if (q === "sunblock" || q === "spf") {
      terms.push("sunscreen");
    } else if (q === "vitamin c") {
      terms.push("ascorbic acid", "ethyl ascorbic acid");
    }

    // Check INCI Synonyms dictionary
    for (const [canonical, synonyms] of Object.entries(INGREDIENT_SYNONYMS)) {
      if (canonical.toLowerCase().includes(q)) {
        terms.push(canonical.toLowerCase(), ...synonyms);
      } else if (synonyms.some((s) => s.includes(q))) {
        terms.push(canonical.toLowerCase());
      }
    }

    return Array.from(new Set(terms));
  }

  static levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] =
          a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  static isWordFuzzyMatch(target: string, queryWord: string): boolean {
    if (!target || !queryWord) return false;
    const t = target.toLowerCase().trim();
    const q = queryWord.toLowerCase().trim();
    if (t === q || t.includes(q) || q.includes(t)) return true;
    if (q.length >= 4) {
      const dist = this.levenshteinDistance(t, q);
      const maxAllowed = q.length >= 8 ? 2 : 1;
      return dist <= maxAllowed;
    }
    return false;
  }

  /**
   * Generates relaxed candidates when zero exact matches are found
   */
  private static generateRelaxedSearchResults(
    allProducts: Product[],
    allListings: ProductListing[],
    q: string,
    filters: any
  ): { explanation: string; products: Product[] } {
    // 1. Try relaxing budget constraint (+30% price headroom)
    if (filters.maxPrice) {
      const relaxedMax = Math.round(filters.maxPrice * 1.35);
      const relaxedMatches = allProducts.filter((p) => {
        if (filters.category && p.category.toLowerCase() !== filters.category.toLowerCase()) return false;
        const listings = allListings.filter((l) => l.productId === p.id && l.price !== null);
        const minPrice = listings.length > 0 ? Math.min(...listings.map((l) => l.price!)) : null;
        return minPrice !== null && minPrice <= relaxedMax;
      });

      if (relaxedMatches.length > 0) {
        return {
          explanation: `No verified products found strictly under ₹${filters.maxPrice}. Relaxing your budget requirement up to ₹${relaxedMax} gives you ${relaxedMatches.length} verified products.`,
          products: relaxedMatches.slice(0, 3),
        };
      }
    }

    // 2. Try relaxing category constraint (All categories matching query)
    const categoryRelaxed = allProducts.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.allIngredients.some((i) => i.toLowerCase().includes(q))
      );
    });

    if (categoryRelaxed.length > 0) {
      return {
        explanation: `No verified products found in "${filters.category}". Relaxing the category constraint yields ${categoryRelaxed.length} verified matches across other skincare categories.`,
        products: categoryRelaxed.slice(0, 3),
      };
    }

    return {
      explanation: "No verified product currently matches all your requirements.",
      products: [],
    };
  }
}
