import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "@/lib/product-format";
import type { ScoredProduct, ScoreBreakdown, RecommendationResultSet } from "@/types";

export const dynamic = "force-dynamic";

// High-efficacy active ingredients mapped to common skin concerns
const CONCERN_INGREDIENT_MAP: Record<string, string[]> = {
  acne: ["salicylic acid", "niacinamide", "zinc pca", "tea tree", "zinc oxide"],
  pimples: ["salicylic acid", "tea tree", "zinc pca", "niacinamide"],
  blackheads: ["salicylic acid", "glycolic acid", "lactic acid"],
  "visible pores": ["niacinamide", "zinc pca", "salicylic acid"],
  "excess oil": ["niacinamide", "zinc pca", "salicylic acid"],
  dryness: ["hyaluronic acid", "ceramides", "squalane", "petrolatum", "aloe vera"],
  dehydration: ["hyaluronic acid", "ceramides", "squalane", "aloe vera"],
  dullness: ["vitamin c", "glycolic acid", "lactic acid", "niacinamide"],
  "dark spots": ["vitamin c", "niacinamide", "glycolic acid"],
  hyperpigmentation: ["vitamin c", "niacinamide", "glycolic acid"],
  "uneven skin tone": ["vitamin c", "niacinamide", "glycolic acid"],
  redness: ["centella asiatica", "ceramides", "aloe vera", "zinc oxide"],
  "rough texture": ["glycolic acid", "lactic acid", "salicylic acid", "retinol"],
  "fine lines": ["retinol", "ceramides", "hyaluronic acid", "vitamin c"],
  "dark circles": ["caffeine", "vitamin c", "hyaluronic acid"],
  "under eye puffiness": ["caffeine", "aloe vera"],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Extract parameters supporting both structured payload and flat input
    const requirements = body.requirements || body;
    const userProfile = body.userProfile || null;

    const requestedCategory: string | undefined =
      requirements.category || body.category || undefined;
    const requestedSkinType: string =
      requirements.skinType ||
      body.skinType ||
      userProfile?.skinType ||
      "Combination";
    const requestedConcerns: string[] =
      requirements.concerns ||
      body.concerns ||
      userProfile?.concerns ||
      [];
    const maxBudget: number =
      requirements.maxPrice ||
      body.maxPrice ||
      body.budget?.max ||
      userProfile?.budget?.max ||
      1500;
    const minBudget: number =
      requirements.minPrice ||
      body.minPrice ||
      body.budget?.min ||
      userProfile?.budget?.min ||
      0;

    if (isNaN(maxBudget) || maxBudget < 0) {
      return NextResponse.json(
        { success: false, error: "maxPrice/maxBudget must be a positive number." },
        { status: 400 }
      );
    }

    if (isNaN(minBudget) || minBudget < 0) {
      return NextResponse.json(
        { success: false, error: "minPrice/minBudget must be a non-negative number." },
        { status: 400 }
      );
    }

    const preferredIngredients: string[] =
      requirements.preferredIngredients ||
      body.preferredIngredients ||
      userProfile?.preferredIngredients ||
      [];
    const avoidIngredients: string[] =
      requirements.avoidIngredients ||
      body.avoidIngredients ||
      userProfile?.avoidIngredients ||
      [];

    // Free-from preferences
    const wantFragranceFree = Boolean(
      body.fragranceFree ||
      requirements.fragranceFree ||
      userProfile?.fragrancePreference === "Fragrance free" ||
      userProfile?.fragranceFree
    );
    const wantParabenFree = Boolean(
      body.parabenFree ||
      requirements.parabenFree ||
      userProfile?.parabenFree
    );
    const wantCrueltyFree = Boolean(
      body.crueltyFree ||
      requirements.crueltyFree ||
      userProfile?.crueltyFree ||
      userProfile?.properties?.includes("Cruelty free")
    );
    const wantVegan = Boolean(
      body.vegan ||
      requirements.vegan ||
      userProfile?.vegan ||
      userProfile?.properties?.includes("Vegan")
    );
    const wantSiliconeFree = Boolean(
      body.siliconeFree ||
      requirements.siliconeFree ||
      userProfile?.siliconeFree
    );

    // Fetch products from database
    const where: any = {};
    if (requestedCategory && requestedCategory !== "All" && requestedCategory !== "") {
      where.category = { equals: requestedCategory };
    }

    const rawProducts = await prisma.product.findMany({
      where,
      include: {
        prices: true,
        productIngredients: {
          include: {
            ingredient: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (rawProducts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          status: "NO_EXACT_MATCH",
          bestOverall: null,
          bestForMainConcern: null,
          bestIngredientMatch: null,
          bestBudgetOption: null,
          bestRated: null,
          bestValue: null,
          alternatives: [],
          relaxedAlternatives: [],
          totalCandidatesCount: 0,
        },
      });
    }

    // Evaluate and score each product using the 5 weighted dimensions:
    // 1. Ingredient match: 40%
    // 2. Skin-type fit: 25%
    // 3. Budget fit: 15%
    // 4. Rating: 10%
    // 5. Free-from preferences: 10%
    const scoredProducts: ScoredProduct[] = rawProducts.map((raw) => {
      const formatted = formatProduct(raw);
      const productIngredientsLower = formatted.allIngredients.map((i) => i.toLowerCase());
      const keyIngredientsLower = formatted.keyIngredients.map((i) => i.toLowerCase());

      const reasons: string[] = [];
      const considerations: string[] = [];

      // --- 1. INGREDIENT MATCH SCORE (40% Weight) ---
      let matchedIngredientsCount = 0;
      let totalIngredientSignals = 0;

      // (a) Explicit preferred ingredients
      if (preferredIngredients.length > 0) {
        preferredIngredients.forEach((pref) => {
          totalIngredientSignals++;
          const pLower = pref.toLowerCase();
          if (productIngredientsLower.some((ing) => ing.includes(pLower))) {
            matchedIngredientsCount++;
            reasons.push(`Contains preferred ingredient: ${pref}`);
          }
        });
      }

      // (b) Active ingredients matching target concerns
      const beneficialActivesForConcerns = new Set<string>();
      requestedConcerns.forEach((concern) => {
        const cLower = concern.toLowerCase();
        for (const [key, actives] of Object.entries(CONCERN_INGREDIENT_MAP)) {
          if (cLower.includes(key)) {
            actives.forEach((a) => beneficialActivesForConcerns.add(a));
          }
        }
      });

      if (beneficialActivesForConcerns.size > 0) {
        let activeMatches = 0;
        beneficialActivesForConcerns.forEach((active) => {
          totalIngredientSignals++;
          if (productIngredientsLower.some((ing) => ing.includes(active))) {
            activeMatches++;
            matchedIngredientsCount++;
            if (activeMatches <= 2) {
              reasons.push(`Features ${active.charAt(0).toUpperCase() + active.slice(1)} to target your concerns`);
            }
          }
        });
      }

      let ingredientScore = 75; // default baseline
      if (totalIngredientSignals > 0) {
        const ratio = matchedIngredientsCount / totalIngredientSignals;
        ingredientScore = Math.min(100, Math.round(50 + ratio * 50));
      }

      // Penalize avoidIngredients or contraindications
      let hasAvoidPenalty = false;
      if (avoidIngredients.length > 0) {
        avoidIngredients.forEach((avoid) => {
          const aLower = avoid.toLowerCase();
          if (productIngredientsLower.some((ing) => ing.includes(aLower))) {
            hasAvoidPenalty = true;
            ingredientScore = Math.max(10, ingredientScore - 40);
            considerations.push(`Contains ${avoid} which you requested to avoid`);
          }
        });
      }

      // --- 2. SKIN-TYPE FIT SCORE (25% Weight) ---
      let skinTypeScore = 60;
      const productSkinTypes = formatted.skinTypes.map((s) => s.toLowerCase());
      const reqSkinLower = requestedSkinType.toLowerCase();

      if (productSkinTypes.includes(reqSkinLower)) {
        skinTypeScore = 100;
        reasons.push(`Direct formulation match for ${requestedSkinType} skin`);
      } else if (
        productSkinTypes.includes("all") ||
        productSkinTypes.includes("normal") ||
        productSkinTypes.length >= 4
      ) {
        skinTypeScore = 80;
        reasons.push(`Gentle formulation suitable for multiple skin types including ${requestedSkinType}`);
      } else {
        skinTypeScore = 40;
        considerations.push(`Primarily optimized for ${formatted.skinTypes.join(", ")} skin`);
      }

      // Concern overlap
      let concernScore = 70;
      if (requestedConcerns.length > 0) {
        const productConcernsLower = formatted.targetConcerns.map((c) => c.toLowerCase());
        const matchedConcerns = requestedConcerns.filter((c) =>
          productConcernsLower.some((pc) => pc.includes(c.toLowerCase()) || c.toLowerCase().includes(pc))
        );
        concernScore = Math.min(100, Math.round((matchedConcerns.length / requestedConcerns.length) * 100));
        if (matchedConcerns.length > 0) {
          reasons.push(`Directly targets ${matchedConcerns.join(", ")}`);
        }
      }

      // --- 3. BUDGET FIT SCORE (15% Weight) ---
      const availablePrices = (formatted.prices || [])
        .map((p) => p.price)
        .filter((val): val is number => val !== null && val > 0);
      const lowestPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : null;

      let budgetFitScore = 85;
      if (lowestPrice !== null) {
        if (lowestPrice <= maxBudget) {
          budgetFitScore = 100;
          reasons.push(`Within your budget: best price ₹${lowestPrice} (cap: ₹${maxBudget})`);
        } else if (lowestPrice <= maxBudget * 1.2) {
          budgetFitScore = 75;
          considerations.push(`Slightly above target budget at ₹${lowestPrice}`);
        } else {
          budgetFitScore = Math.max(30, Math.round(100 - ((lowestPrice - maxBudget) / maxBudget) * 50));
          considerations.push(`Price of ₹${lowestPrice} exceeds your ₹${maxBudget} budget`);
        }
      }

      // --- 4. RATING SCORE (10% Weight) ---
      const ratingVal = formatted.rating ?? 4.0;
      const ratingScore = Math.min(100, Math.round((ratingVal / 5.0) * 100));
      if (ratingVal >= 4.5) {
        reasons.push(`High consumer satisfaction: ${ratingVal}★ rating (${formatted.reviewCount.toLocaleString()} reviews)`);
      }

      // --- 5. FREE-FROM PREFERENCES SCORE (10% Weight) ---
      const freeFromChecks = [
        { wanted: wantFragranceFree, has: formatted.fragranceFree, label: "Fragrance-free" },
        { wanted: wantParabenFree, has: formatted.parabenFree, label: "Paraben-free" },
        { wanted: wantCrueltyFree, has: formatted.crueltyFree, label: "Cruelty-free" },
        { wanted: wantVegan, has: formatted.vegan, label: "100% Vegan" },
        { wanted: wantSiliconeFree, has: formatted.siliconeFree, label: "Silicone-free" },
      ];

      const activePreferenceChecks = freeFromChecks.filter((c) => c.wanted);
      let preferenceScore = 85;

      if (activePreferenceChecks.length > 0) {
        const satisfied = activePreferenceChecks.filter((c) => c.has);
        preferenceScore = Math.round((satisfied.length / activePreferenceChecks.length) * 100);
        satisfied.forEach((s) => reasons.push(`Meets preference: ${s.label}`));
        const missing = activePreferenceChecks.filter((c) => !c.has);
        missing.forEach((m) => considerations.push(`Not marked as ${m.label}`));
      } else {
        // Formulation purity score if no explicit free-from requested
        const cleanCount = freeFromChecks.filter((c) => c.has).length;
        preferenceScore = Math.round((cleanCount / freeFromChecks.length) * 100);
      }

      // --- OVERALL WEIGHTED CALCULATION ---
      // Concern fit is deliberately part of the final score. Earlier versions
      // displayed concern results but did not let that score affect ranking.
      const overallScore = Math.min(
        100,
        Math.max(
          10,
          Math.round(
            ingredientScore * 0.30 +
            skinTypeScore * 0.25 +
            concernScore * 0.20 +
            budgetFitScore * 0.15 +
            ratingScore * 0.05 +
            preferenceScore * 0.05
          )
        )
      );

      const scoreBreakdown: ScoreBreakdown & {
        budgetScore: number;
        ratingScore: number;
        weights: Record<string, string>;
      } = {
        ingredientScore,
        skinTypeScore,
        concernScore,
        preferenceScore,
        budgetFitScore,
        budgetScore: budgetFitScore,
        ratingScore,
        overallScore,
        weights: {
          ingredientMatch: "30%",
          skinTypeFit: "25%",
          concernFit: "20%",
          budgetFit: "15%",
          customerRating: "5%",
          freeFromPreferences: "5%",
        },
      };

      // Best listing
      const availableListings = (formatted.prices || []).filter(
        (l) => l.price !== null && (l.price ?? 0) > 0
      );
      const bestListing =
        availableListings.length > 0
          ? availableListings.reduce((best, cur) =>
              (cur.price ?? Infinity) < (best.price ?? Infinity) ? cur : best
            )
          : undefined;

      const unitPriceVal =
        lowestPrice && formatted.quantity > 0
          ? Math.round((lowestPrice / formatted.quantity) * 10) / 10
          : 0;

      return {
        product: formatted,
        scoreBreakdown,
        reasons: reasons.slice(0, 4),
        considerations: considerations.slice(0, 3),
        bestListing: bestListing as any,
        unitPriceLabel: unitPriceVal ? `₹${unitPriceVal}/${formatted.unit}` : `₹ / ${formatted.unit}`,
        valueScore: Math.round(overallScore * 0.95),
      };
    });

    // Sort descending by overallScore
    scoredProducts.sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore);

    // Pick categorized champions
    const bestOverall = scoredProducts[0] || null;

    const bestForMainConcern =
      [...scoredProducts].sort((a, b) => b.scoreBreakdown.concernScore - a.scoreBreakdown.concernScore)[0] || null;

    const bestIngredientMatch =
      [...scoredProducts].sort((a, b) => b.scoreBreakdown.ingredientScore - a.scoreBreakdown.ingredientScore)[0] || null;

    const bestBudgetOption =
      [...scoredProducts]
        .filter((sp) => sp.bestListing?.price !== null && (sp.bestListing?.price ?? 0) > 0)
        .sort((a, b) => (a.bestListing?.price ?? Infinity) - (b.bestListing?.price ?? Infinity))[0] || null;

    const bestRated =
      [...scoredProducts].sort((a, b) => (b.product.rating ?? 0) - (a.product.rating ?? 0))[0] || null;

    const bestValue =
      [...scoredProducts].sort((a, b) => b.valueScore - a.valueScore)[0] || null;

    const alternatives = scoredProducts.slice(1, 7);

    const resultSet: RecommendationResultSet = {
      status: "EXACT_MATCH_FOUND",
      bestOverall,
      bestForMainConcern,
      bestIngredientMatch,
      bestBudgetOption,
      bestRated,
      bestValue,
      alternatives,
      relaxedAlternatives: [],
      totalCandidatesCount: scoredProducts.length,
    };

    return NextResponse.json({
      success: true,
      data: resultSet,
      recommendations: scoredProducts,
      breakdownExplanation: {
        weights: {
          ingredientMatch: "30%",
          skinTypeFit: "25%",
          concernFit: "20%",
          budgetFit: "15%",
          customerRating: "5%",
          freeFromPreferences: "5%",
        },
        criteriaApplied: {
          skinType: requestedSkinType,
          concerns: requestedConcerns,
          maxBudget,
          preferredIngredients,
          avoidIngredients,
          freeFrom: {
            fragranceFree: wantFragranceFree,
            parabenFree: wantParabenFree,
            crueltyFree: wantCrueltyFree,
            vegan: wantVegan,
            siliconeFree: wantSiliconeFree,
          },
        },
      },
    });
  } catch (error: any) {
    console.error("POST /api/recommendations error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
