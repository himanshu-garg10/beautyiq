import { products, ingredients, mockProductListings } from "@/lib/mock-data";
import type {
  Product,
  ProductListing,
  SkinProfile,
  StructuredSkincareRequirement,
  RecommendationPriority,
  ScoreBreakdown,
  ScoredProduct,
  RelaxedRequirement,
  RecommendationResultSet,
  RecommendationEngineRequest,
  RecommendationSession,
  RecommendationFeedback,
  DetailedSkinConcern,
} from "@/types";
import { ProductService } from "./product.service";
import { ApiResponse, createSuccessResponse, createErrorResponse, simulateDelay } from "./api-client";

const RECOMMENDATION_SESSIONS_KEY = "beautyiq_recommendation_sessions";
const RECOMMENDATION_FEEDBACK_KEY = "beautyiq_recommendation_feedback";

/**
 * Configurable Centralized Recommendation Weights (Requirement #9)
 */
export const RECOMMENDATION_WEIGHTS = {
  skinType: 0.25,
  concerns: 0.25,
  ingredients: 0.20,
  goals: 0.10,
  preferences: 0.10,
  budgetAndValue: 0.05,
  rating: 0.05,
};

export class RecommendationEngineService {
  /**
   * Primary entry point for deterministic recommendation generation on real product data
   */
  static async generateRecommendations(
    engineRequest: RecommendationEngineRequest
  ): Promise<ApiResponse<RecommendationResultSet>> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(engineRequest),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return createSuccessResponse(json.data);
          }
        }
      } catch (err) {
        console.warn("Fetch from /api/recommendations failed, using fallback engine", err);
      }
    }

    await simulateDelay(150);

    const { requirements, priority, userProfile } = engineRequest;

    // Retrieve active normalized products from AdminDataService (including verified real data)
    const { AdminDataService } = await import("./admin-data.service");
    const activeProducts = await AdminDataService.getProducts();

    // 1. Hard Constraints Filtering (Requirement #4 & #10)
    const { candidates, eliminatedReasons } = this.applyHardConstraints(activeProducts, requirements);

    // 2. No Exact Match Handling (Requirement #30 & #31)
    if (candidates.length === 0) {
      const relaxedAlternatives = this.generateRelaxedAlternatives(activeProducts, requirements);

      const result: RecommendationResultSet = {
        status: "NO_EXACT_MATCH",
        bestOverall: null,
        bestForMainConcern: null,
        bestIngredientMatch: null,
        bestBudgetOption: null,
        bestRated: null,
        bestValue: null,
        alternatives: [],
        relaxedAlternatives,
        totalCandidatesCount: 0,
      };

      // Persist session
      this.saveRecommendationSession(engineRequest, result);

      return createSuccessResponse(result);
    }

    // 3. Feature Matching & Compatibility Scoring (Requirement #7, #8, #9)
    const scoredProducts: ScoredProduct[] = candidates.map((product) =>
      this.scoreCandidateProduct(product, requirements, priority, userProfile)
    );

    // 4. Deterministic Priority Ranking (Requirement #21)
    const rankedProducts = this.rankProductsByPriority(scoredProducts, priority, requirements);

    // 5. Categorization (Requirement #22 - #29)
    const bestOverall = rankedProducts[0] || null;

    // Best for Main Concern
    const mainConcern = requirements.concerns[0];
    let bestForMainConcern: ScoredProduct | null = null;
    if (mainConcern) {
      const concernMatched = [...rankedProducts].sort(
        (a, b) => b.scoreBreakdown.concernScore - a.scoreBreakdown.concernScore
      );
      bestForMainConcern = concernMatched[0] || null;
    }

    // Best Ingredient Match
    const ingredientMatched = [...rankedProducts].sort(
      (a, b) => b.scoreBreakdown.ingredientScore - a.scoreBreakdown.ingredientScore
    );
    const bestIngredientMatch = ingredientMatched[0] || null;

    // Best Budget Option
    const budgetMatched = [...rankedProducts].sort(
      (a, b) => b.scoreBreakdown.budgetFitScore - a.scoreBreakdown.budgetFitScore
    );
    const bestBudgetOption = budgetMatched[0] || null;

    // Best Rated
    const ratedMatched = [...rankedProducts].sort(
      (a, b) => (b.product.rating ?? 0) - (a.product.rating ?? 0)
    );
    const bestRated = ratedMatched[0] || null;

    // Best Value
    const valueMatched = [...rankedProducts].sort((a, b) => b.valueScore - a.valueScore);
    const bestValue = valueMatched[0] || null;

    // Alternatives
    const topIds = new Set([
      bestOverall?.product.id,
      bestForMainConcern?.product.id,
      bestIngredientMatch?.product.id,
      bestBudgetOption?.product.id,
      bestRated?.product.id,
      bestValue?.product.id,
    ]);

    const alternatives = rankedProducts.filter((sp) => !topIds.has(sp.product.id));

    const result: RecommendationResultSet = {
      status: "EXACT_MATCH_FOUND",
      bestOverall,
      bestForMainConcern,
      bestIngredientMatch,
      bestBudgetOption,
      bestRated,
      bestValue,
      alternatives,
      relaxedAlternatives: [],
      totalCandidatesCount: candidates.length,
    };

    // Persist session
    this.saveRecommendationSession(engineRequest, result);

    return createSuccessResponse(result);
  }

  /**
   * Filter out products violating hard constraints (Category, Max Price, Excluded Ingredients/Allergies, Excluded Brands)
   */
  private static applyHardConstraints(
    allProducts: Product[],
    req: StructuredSkincareRequirement
  ): { candidates: Product[]; eliminatedReasons: Record<string, string[]> } {
    const candidates: Product[] = [];
    const eliminatedReasons: Record<string, string[]> = {};

    for (const product of allProducts) {
      const reasons: string[] = [];

      // Constraint 1: Category Match
      if (req.category && product.category.toLowerCase() !== req.category.toLowerCase()) {
        reasons.push(`Category mismatch: requested ${req.category}, product is ${product.category}`);
      }

      // Constraint 2: Maximum Price Cap
      const bestListing = ProductService.getBestListingForProduct(product.id);
      if (req.maxPrice !== null && bestListing && bestListing.price !== null) {
        if (bestListing.price > req.maxPrice) {
          reasons.push(`Price ₹${bestListing.price} exceeds maximum cap ₹${req.maxPrice}`);
        }
      }

      // Constraint 3: Excluded Ingredients & Known Allergies (Strict Exclusion!)
      const allExclusions = [...req.avoidIngredients, ...req.knownAllergies];
      if (allExclusions.length > 0) {
        const hitExcluded = product.allIngredients.filter((ing) =>
          allExclusions.some((ex) => ing.toLowerCase().includes(ex.toLowerCase()))
        );
        if (hitExcluded.length > 0) {
          reasons.push(`Contains explicitly avoided/allergic ingredient: ${hitExcluded.join(", ")}`);
        }
      }

      // Constraint 4: Excluded Brands
      if (req.excludedBrands.length > 0) {
        if (req.excludedBrands.some((b) => b.toLowerCase() === product.brand.toLowerCase())) {
          reasons.push(`Product belongs to explicitly excluded brand: ${product.brand}`);
        }
      }

      if (reasons.length === 0) {
        candidates.push(product);
      } else {
        eliminatedReasons[product.id] = reasons;
      }
    }

    return { candidates, eliminatedReasons };
  }
  /**
   * Public helper to score a single product for personalized comparison
   */
  static scoreSingleProduct(
    product: Product,
    req: StructuredSkincareRequirement,
    userProfile?: SkinProfile | null,
    priority: RecommendationPriority = "best-match"
  ): { overallCompatibility: number; scoreBreakdown: ScoreBreakdown; whyRecommended: string[] } {
    const scored = this.scoreCandidateProduct(product, req, priority, userProfile);
    return {
      overallCompatibility: scored.product.compatibilityScore || scored.scoreBreakdown.overallScore,
      scoreBreakdown: scored.scoreBreakdown,
      whyRecommended: scored.reasons,
    };
  }

  /**
   * Score an individual candidate product deterministically
   */
  private static scoreCandidateProduct(
    product: Product,
    req: StructuredSkincareRequirement,
    priority: RecommendationPriority,
    userProfile?: SkinProfile | null
  ): ScoredProduct {
    const skinTypeScore = this.calculateSkinTypeScore(product, req, userProfile);
    const concernScore = this.calculateConcernScore(product, req);
    const ingredientScore = this.calculateIngredientScore(product, req);
    const preferenceScore = this.calculatePreferenceScore(product, req);
    const budgetFitScore = this.calculateBudgetFitScore(product, req);

    // Configurable weighted calculation (Requirement #8 & #9)
    let weights = { ...RECOMMENDATION_WEIGHTS };

    // Adjust weights based on selected Recommendation Priority
    if (priority === "lowest-price") {
      weights.budgetAndValue = 0.35;
      weights.skinType = 0.20;
    } else if (priority === "best-rated") {
      weights.rating = 0.30;
      weights.skinType = 0.20;
    } else if (priority === "preferred-brand") {
      weights.preferences = 0.30;
    } else if (priority === "minimal-ingredients") {
      weights.ingredients = 0.35;
    }

    const ratingContribution = product.rating !== null ? (product.rating / 5) * 100 : 75;

    const overallScore = Math.min(
      Math.round(
        skinTypeScore * weights.skinType +
          concernScore * weights.concerns +
          ingredientScore * weights.ingredients +
          preferenceScore * weights.preferences +
          budgetFitScore * weights.budgetAndValue +
          ratingContribution * weights.rating
      ),
      99
    );

    const scoreBreakdown: ScoreBreakdown = {
      skinTypeScore,
      concernScore,
      ingredientScore,
      preferenceScore,
      budgetFitScore,
      overallScore,
    };

    const reasons = this.generateExplainableReasons(product, req, scoreBreakdown);
    const considerations = this.generateConsiderations(product, req);
    const bestListing = ProductService.getBestListingForProduct(product.id);
    const unitPriceCalc = ProductService.getUnitPrice(product);
    const valueScore = bestListing?.valueScore || 85;

    return {
      product: {
        ...product,
        compatibilityScore: overallScore,
      },
      scoreBreakdown,
      reasons,
      considerations,
      bestListing,
      unitPriceLabel: unitPriceCalc.unitLabel,
      valueScore,
    };
  }

  /**
   * Calculate Skin Type Suitability Score (0-100)
   */
  private static calculateSkinTypeScore(
    product: Product,
    req: StructuredSkincareRequirement,
    userProfile?: SkinProfile | null
  ): number {
    const targetSkinType = req.skinType || userProfile?.skinType || null;
    if (!targetSkinType) return 80;

    if (product.skinTypes.includes(targetSkinType)) return 100;
    if (product.skinTypes.includes("Normal" as any)) return 85;
    return 40;
  }

  /**
   * Calculate Concern Suitability Score (0-100)
   */
  private static calculateConcernScore(
    product: Product,
    req: StructuredSkincareRequirement
  ): number {
    if (req.concerns.length === 0) return 85;

    const matched = product.targetConcerns.filter((c) =>
      req.concerns.some((userC) => userC.toLowerCase() === c.toLowerCase())
    );

    const ratio = matched.length / req.concerns.length;
    return Math.min(Math.round(ratio * 100), 100);
  }

  /**
   * Calculate Ingredient Relevance & Match Score (0-100)
   */
  private static calculateIngredientScore(
    product: Product,
    req: StructuredSkincareRequirement
  ): number {
    if (req.preferredIngredients.length === 0) return 85;

    const matched = req.preferredIngredients.filter((pref) =>
      product.keyIngredients.some((k) => k.toLowerCase().includes(pref.toLowerCase())) ||
      product.allIngredients.some((a) => a.toLowerCase().includes(pref.toLowerCase()))
    );

    const ratio = matched.length / req.preferredIngredients.length;
    return Math.min(Math.round(ratio * 100), 100);
  }

  /**
   * Calculate Soft Preference Suitability Score (0-100)
   */
  private static calculatePreferenceScore(
    product: Product,
    req: StructuredSkincareRequirement
  ): number {
    let matches = 0;
    let totalChecks = 0;

    // Brand preference
    if (req.preferredBrands.length > 0) {
      totalChecks++;
      if (req.preferredBrands.some((b) => b.toLowerCase() === product.brand.toLowerCase())) {
        matches++;
      }
    }

    // Fragrance free
    if (req.fragrancePreference === "Fragrance free") {
      totalChecks++;
      if (product.fragranceFree) matches++;
    }

    // Properties
    req.properties.forEach((prop) => {
      totalChecks++;
      if (prop === "Cruelty free" && product.crueltyFree) matches++;
      else if (prop === "Vegan" && product.vegan) matches++;
      else if (prop === "Fragrance free" && product.fragranceFree) matches++;
      else if ((prop as string) === "Paraben free" && product.parabenFree) matches++;
      else matches += 0.8; // Partial credit for dermatologically verified spec
    });

    if (totalChecks === 0) return 90;
    return Math.min(Math.round((matches / totalChecks) * 100), 100);
  }

  /**
   * Calculate Budget Fit & Value Score (0-100)
   */
  private static calculateBudgetFitScore(
    product: Product,
    req: StructuredSkincareRequirement
  ): number {
    const bestListing = ProductService.getBestListingForProduct(product.id);
    if (!bestListing || bestListing.price === null) return 80;

    if (req.maxPrice !== null) {
      if (bestListing.price <= req.maxPrice) {
        const ratio = bestListing.price / req.maxPrice;
        return Math.round(100 - ratio * 20); // Closer to lower budget cap = higher score
      }
      return 0;
    }

    return 85;
  }

  /**
   * Rank scored products by priority
   */
  private static rankProductsByPriority(
    productsList: ScoredProduct[],
    priority: RecommendationPriority,
    req: StructuredSkincareRequirement
  ): ScoredProduct[] {
    const sorted = [...productsList];

    if (priority === "lowest-price") {
      sorted.sort((a, b) => (a.bestListing?.price ?? 9999) - (b.bestListing?.price ?? 9999));
    } else if (priority === "best-rated") {
      sorted.sort((a, b) => (b.product.rating ?? 0) - (a.product.rating ?? 0));
    } else if (priority === "preferred-brand") {
      sorted.sort((a, b) => {
        const aPref = req.preferredBrands.some((br) => br.toLowerCase() === a.product.brand.toLowerCase()) ? 1 : 0;
        const bPref = req.preferredBrands.some((br) => br.toLowerCase() === b.product.brand.toLowerCase()) ? 1 : 0;
        if (bPref !== aPref) return bPref - aPref;
        return b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore;
      });
    } else if (priority === "minimal-ingredients") {
      sorted.sort((a, b) => a.product.allIngredients.length - b.product.allIngredients.length);
    } else {
      // Default: Best match by overall score
      sorted.sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore);
    }

    return sorted;
  }

  /**
   * Generate Data-Backed Explainable Reasons (Requirement #32)
   */
  private static generateExplainableReasons(
    product: Product,
    req: StructuredSkincareRequirement,
    breakdown: ScoreBreakdown
  ): string[] {
    const reasons: string[] = [];

    if (req.skinType && product.skinTypes.includes(req.skinType)) {
      reasons.push(`Formulated for ${req.skinType} skin`);
    }

    const matchedConcerns = product.targetConcerns.filter((c) =>
      req.concerns.some((userC) => userC.toLowerCase() === c.toLowerCase())
    );
    if (matchedConcerns.length > 0) {
      reasons.push(`Matches active concerns: ${matchedConcerns.join(", ")}`);
    }

    const hasIngredients = (product.allIngredients && product.allIngredients.length > 0) || (product.keyIngredients && product.keyIngredients.length > 0);
    if (!hasIngredients) {
      // Stage 10 Requirement #26: If ingredients are unavailable, do NOT say "Excellent ingredient match"
      reasons.push("Ingredient information is unavailable, so ingredient compatibility could not be fully evaluated.");
    } else {
      const matchedIngredients = req.preferredIngredients.filter((pref) =>
        product.keyIngredients.some((k) => k.toLowerCase().includes(pref.toLowerCase()))
      );
      if (matchedIngredients.length > 0) {
        reasons.push(`Contains preferred active: ${matchedIngredients.join(", ")}`);
      }
    }

    const bestListing = ProductService.getBestListingForProduct(product.id);
    if (req.maxPrice !== null && bestListing?.price && bestListing.price <= req.maxPrice) {
      reasons.push(`Within requested budget cap (₹${bestListing.price} <= ₹${req.maxPrice})`);
    }

    if (req.fragrancePreference === "Fragrance free" && product.fragranceFree) {
      reasons.push("100% Fragrance-free formulation");
    }

    if (req.preferredBrands.some((b) => b.toLowerCase() === product.brand.toLowerCase())) {
      reasons.push(`Matches preferred brand: ${product.brand}`);
    }

    if (product.dataConfidence >= 90) {
      reasons.push(`High data confidence (${product.dataConfidence}%) from verified source`);
    }

    if (reasons.length === 0) {
      reasons.push("High overall formula compatibility score");
    }

    return reasons;
  }

  /**
   * Generate Data-Backed Considerations (Requirement #33 & Stage 10 Data Quality)
   */
  private static generateConsiderations(
    product: Product,
    req: StructuredSkincareRequirement
  ): string[] {
    const considerations: string[] = [];

    if (!product.fragranceFree) {
      considerations.push("Contains fragrance — test patch recommended if sensitive");
    }

    if (product.keyIngredients.some((i) => i.toLowerCase().includes("salicylic") || i.toLowerCase().includes("retinol"))) {
      considerations.push("Contains potent active — introduce gradually into routine");
    }

    if (product.rating === null) {
      considerations.push("Community rating unavailable for this catalog item");
    }

    if (product.uncertainIngredients && product.uncertainIngredients.length > 0) {
      considerations.push(`${product.uncertainIngredients.length} ingredients could not be verified against standard INCI database`);
    }

    if (product.dataConfidence < 80) {
      considerations.push(`Data confidence is ${product.dataConfidence}% — some retailer or formulation details are pending verification`);
    }

    return considerations;
  }

  /**
   * Generate Requirement Relaxation Alternatives when 0 products match hard constraints (Requirement #30 & #31)
   */
  private static generateRelaxedAlternatives(
    allProducts: Product[],
    req: StructuredSkincareRequirement
  ): RelaxedRequirement[] {
    const relaxedList: RelaxedRequirement[] = [];

    // Relaxation 1: Relax Max Price Cap by 25%
    if (req.maxPrice !== null) {
      const relaxedMax = Math.round(req.maxPrice * 1.25);
      const relaxedReq = { ...req, maxPrice: relaxedMax };
      const { candidates } = this.applyHardConstraints(allProducts, relaxedReq);

      if (candidates.length > 0) {
        const scored = candidates.slice(0, 3).map((p) =>
          this.scoreCandidateProduct(p, req, "best-match", null)
        );
        relaxedList.push({
          requirementField: "Maximum Budget",
          originalValue: `Up to ₹${req.maxPrice}`,
          relaxedValue: `Up to ₹${relaxedMax} (+25% budget extension)`,
          reason: `No products found under ₹${req.maxPrice} for ${req.category || "this category"}. Relaxing budget cap reveals ${candidates.length} strong candidates.`,
          relaxedProducts: scored,
        });
      }
    }

    // Relaxation 2: Relax Excluded Brands
    if (req.excludedBrands.length > 0) {
      const relaxedReq = { ...req, excludedBrands: [] };
      const { candidates } = this.applyHardConstraints(allProducts, relaxedReq);

      if (candidates.length > 0) {
        const scored = candidates.slice(0, 2).map((p) =>
          this.scoreCandidateProduct(p, req, "best-match", null)
        );
        relaxedList.push({
          requirementField: "Excluded Brands",
          originalValue: `Excluded: ${req.excludedBrands.join(", ")}`,
          relaxedValue: "Including all verified brands",
          reason: "Relaxing brand exclusion constraint reveals matches from top-rated cosmeceutical brands.",
          relaxedProducts: scored,
        });
      }
    }

    return relaxedList;
  }

  /**
   * Save Recommendation Session to localStorage (Requirement #36)
   */
  private static saveRecommendationSession(
    request: RecommendationEngineRequest,
    result: RecommendationResultSet
  ): RecommendationSession {
    const session: RecommendationSession = {
      sessionId: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      request,
      result,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(RECOMMENDATION_SESSIONS_KEY);
        const existing: RecommendationSession[] = stored ? JSON.parse(stored) : [];
        const updated = [session, ...existing].slice(0, 15);
        localStorage.setItem(RECOMMENDATION_SESSIONS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save recommendation session:", e);
      }
    }

    return session;
  }

  /**
   * Retrieve recommendation session by ID
   */
  static getSessionById(sessionId: string): RecommendationSession | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(RECOMMENDATION_SESSIONS_KEY);
      if (!stored) return null;
      const existing: RecommendationSession[] = JSON.parse(stored);
      return existing.find((s) => s.sessionId === sessionId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Submit Recommendation Feedback (Requirement #37)
   */
  static submitFeedback(
    sessionId: string,
    productId: string,
    isHelpful: boolean,
    reason?: RecommendationFeedback["reason"],
    comments?: string
  ): ApiResponse<boolean> {
    const feedback: RecommendationFeedback = {
      sessionId,
      productId,
      isHelpful,
      reason,
      comments,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(RECOMMENDATION_FEEDBACK_KEY);
        const existing: RecommendationFeedback[] = stored ? JSON.parse(stored) : [];
        localStorage.setItem(RECOMMENDATION_FEEDBACK_KEY, JSON.stringify([feedback, ...existing]));
      } catch (e) {
        console.warn("Failed to store recommendation feedback:", e);
      }
    }

    return createSuccessResponse(true);
  }
}
