import type {
  SkinType,
  DetailedSkinConcern,
  DetailedSkinGoal,
  RoutineStep,
  TexturePreference,
  FinishPreference,
  FragrancePreference,
  ProductProperty,
  SkinProfile,
  StructuredSkincareRequirement,
  AmbiguityClarification,
  ContradictionConflict,
  ProfileConflictInfo,
  AIRequirementParseResult,
  AIRequirementSession,
} from "@/types";
import { simulateDelay } from "./api-client";

const REQUIREMENT_SESSIONS_KEY = "beautyiq_ai_requirement_sessions";

export class AIRequirementService {
  /**
   * Main entry point to clean, parse, extract, normalize, and validate natural language skincare queries.
   */
  static async parseNaturalLanguageRequest(
    rawText: string,
    userProfile?: SkinProfile | null
  ): Promise<AIRequirementParseResult> {
    const startTime = Date.now();
    const stepLogs: string[] = [];

    // Step 1: Preprocessing & Text Cleaning
    stepLogs.push("Step 1: Preprocessing raw input text...");
    const cleanedText = this.cleanInputText(rawText);

    if (!cleanedText.trim()) {
      return {
        requirements: this.createEmptyRequirementObject(rawText),
        ambiguities: [],
        contradictions: [],
        profileConflict: null,
        processingTimeMs: Date.now() - startTime,
        stepLogs: ["Empty or whitespace request provided."],
      };
    }

    // Step 2: Intent Detection
    stepLogs.push("Step 2: Intent detection — Skincare product & preference discovery.");

    // Step 3: Entity Extraction & Synonym Normalization
    stepLogs.push("Step 3: Extracting skin types, concerns, goals, categories, budget & ingredients...");
    const extracted = this.extractEntitiesFromText(cleanedText);

    // Step 4: Ambiguity Detection
    stepLogs.push("Step 4: Checking entity ambiguities...");
    const ambiguities = this.detectAmbiguitiesInText(cleanedText, extracted);

    // Step 5: Contradiction Validation
    stepLogs.push("Step 5: Validating contradiction constraints...");
    const contradictions = this.validateContradictions(extracted);

    // Step 6: Customer Profile Contextualization
    stepLogs.push("Step 6: Contextualizing against customer profile...");
    let profileConflict: ProfileConflictInfo | null = null;
    if (userProfile && userProfile.isOnboardingComplete) {
      if (extracted.skinType && extracted.skinType !== userProfile.skinType) {
        profileConflict = {
          savedSkinType: userProfile.skinType,
          querySkinType: extracted.skinType,
          message: `Your saved profile specifies "${userProfile.skinType}" skin, but this current search explicitly requested "${extracted.skinType}" skin.`,
        };
      }
    }

    const processingTimeMs = Date.now() - startTime;
    stepLogs.push(`Processing completed in ${processingTimeMs}ms.`);

    const reqObject: StructuredSkincareRequirement = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rawQuery: rawText,
      skinType: extracted.skinType,
      concerns: extracted.concerns,
      goals: extracted.goals,
      category: extracted.category,
      minPrice: extracted.minPrice,
      maxPrice: extracted.maxPrice,
      preferredBrands: extracted.preferredBrands,
      excludedBrands: extracted.excludedBrands,
      preferredIngredients: extracted.preferredIngredients,
      avoidIngredients: extracted.avoidIngredients,
      knownAllergies: extracted.knownAllergies,
      texturePreference: extracted.texturePreference,
      finishPreference: extracted.finishPreference,
      fragrancePreference: extracted.fragrancePreference,
      properties: extracted.properties,
      extractedAt: new Date().toISOString(),
      isConfirmed: false,
      confidenceScores: extracted.confidenceScores,
    };

    return {
      requirements: reqObject,
      ambiguities,
      contradictions,
      profileConflict,
      processingTimeMs,
      stepLogs,
    };
  }

  /**
   * Preprocessing & Text Cleaning
   */
  private static cleanInputText(text: string): string {
    if (!text) return "";
    return text
      .trim()
      .replace(/[\r\n\t]+/g, " ")
      .replace(/₹|rs\.?|rupees|inr/gi, "₹")
      .replace(/(\d+)\s*k\b/gi, "$1000"); // e.g. "1k" -> "1000"
  }

  /**
   * Entity Extraction Core Pipeline
   */
  private static extractEntitiesFromText(text: string) {
    const lower = text.toLowerCase();
    const confidenceScores: Record<string, "High" | "Medium" | "Low"> = {};

    // 1. Skin Type Extraction
    let skinType: SkinType | null = null;
    if (/\b(oily|greasy|sebum-heavy)\b/i.test(lower)) {
      skinType = "Oily";
      confidenceScores["skinType"] = "High";
    } else if (/\b(dry|flaky|parched|tight skin)\b/i.test(lower)) {
      skinType = "Dry";
      confidenceScores["skinType"] = "High";
    } else if (/\b(combination|combo|oily t-zone)\b/i.test(lower)) {
      skinType = "Combination";
      confidenceScores["skinType"] = "High";
    } else if (/\b(sensitive|reactive|easily irritated|red skin)\b/i.test(lower)) {
      skinType = "Sensitive";
      confidenceScores["skinType"] = "High";
    } else if (/\b(normal skin|balanced skin)\b/i.test(lower)) {
      skinType = "Normal";
      confidenceScores["skinType"] = "High";
    }

    // 2. Concerns Extraction
    const concerns: DetailedSkinConcern[] = [];
    const addConcern = (c: DetailedSkinConcern) => {
      if (!concerns.includes(c)) concerns.push(c);
    };

    if (/\b(acne|breakout|breakouts|zits|papule|pustule)\b/i.test(lower)) addConcern("Acne");
    if (/\b(pimple|pimples)\b/i.test(lower)) addConcern("Pimples");
    if (/\b(blackhead|blackheads)\b/i.test(lower)) addConcern("Blackheads");
    if (/\b(whitehead|whiteheads)\b/i.test(lower)) addConcern("Whiteheads");
    if (/\b(dark spot|dark spots|age spots|brown spots)\b/i.test(lower)) addConcern("Dark spots");
    if (/\b(acne marks|pimple marks|post acne|post-inflammatory)\b/i.test(lower)) addConcern("Acne marks");
    if (/\b(hyperpigmentation|pigmentation|uneven tone)\b/i.test(lower)) addConcern("Hyperpigmentation");
    if (/\b(uneven skin tone|discoloration)\b/i.test(lower)) addConcern("Uneven skin tone");
    if (/\b(dryness|flakiness)\b/i.test(lower)) addConcern("Dryness");
    if (/\b(dehydration|dehydrated)\b/i.test(lower)) addConcern("Dehydration");
    if (/\b(excess oil|oily shine|greasiness|sebum)\b/i.test(lower)) addConcern("Excess oil");
    if (/\b(dullness|dull skin|lack of glow)\b/i.test(lower)) addConcern("Dullness");
    if (/\b(redness|inflamed skin|rosacea)\b/i.test(lower)) addConcern("Redness");
    if (/\b(rough texture|bumpy skin)\b/i.test(lower)) addConcern("Rough texture");
    if (/\b(visible pores|enlarged pores|large pores|open pores)\b/i.test(lower)) addConcern("Visible pores");
    if (/\b(fine lines|wrinkles|crow's feet)\b/i.test(lower)) addConcern("Fine lines");
    if (/\b(tanning|sun tan|tanned)\b/i.test(lower)) addConcern("Tanning");
    if (/\b(dark circles|under eye circles)\b/i.test(lower)) addConcern("Dark circles");
    if (/\b(under eye puffiness|puffy eyes)\b/i.test(lower)) addConcern("Under eye puffiness");
    if (/\b(uneven texture)\b/i.test(lower)) addConcern("Uneven texture");

    if (concerns.length > 0) confidenceScores["concerns"] = "High";

    // 3. Goal Extraction (Kept separate from concerns!)
    const goals: DetailedSkinGoal[] = [];
    const addGoal = (g: DetailedSkinGoal) => {
      if (!goals.includes(g)) goals.push(g);
    };

    if (/\b(clearer skin|clear skin)\b/i.test(lower)) addGoal("Clearer skin");
    if (/\b(glow|glowing|radiance|radiant)\b/i.test(lower)) addGoal("Glow");
    if (/\b(even skin tone|even tone)\b/i.test(lower)) addGoal("Even skin tone");
    if (/\b(hydration|hydrating|moisture boost|plump skin)\b/i.test(lower)) addGoal("Hydration");
    if (/\b(oil control|shine control|matte finish)\b/i.test(lower)) addGoal("Oil control");
    if (/\b(smoother texture|smooth skin)\b/i.test(lower)) addGoal("Smoother texture");
    if (/\b(reduced appearance of pores|shrink pores)\b/i.test(lower)) addGoal("Reduced appearance of pores");
    if (/\b(maintain healthy looking skin|healthy barrier)\b/i.test(lower)) addGoal("Maintain healthy looking skin");

    if (goals.length > 0) confidenceScores["goals"] = "High";

    // 4. Category Extraction
    let category: RoutineStep | null = null;
    if (/\b(face wash|facial wash)\b/i.test(lower)) {
      category = "Face Wash";
    } else if (/\b(cleanser|cleansing gel|cleansing lotion|cleansing balm|foaming cleanser)\b/i.test(lower)) {
      category = "Cleanser";
    } else if (/\b(serum|essence serum|ampoule)\b/i.test(lower)) {
      category = "Serum";
    } else if (/\b(moisturizer|moisturiser|face cream|night cream|day cream|gel cream)\b/i.test(lower)) {
      category = "Moisturizer";
    } else if (/\b(sunscreen|sunblock|spf|sun protection|uv gel)\b/i.test(lower)) {
      category = "Sunscreen";
    } else if (/\b(toner|facial mist|toning lotion)\b/i.test(lower)) {
      category = "Toner";
    } else if (/\b(exfoliator|peel|peeling solution|scrub|bha liquid|aha liquid)\b/i.test(lower)) {
      category = "Exfoliator";
    } else if (/\b(acne gel|spot treatment|acne patch|pimple gel)\b/i.test(lower)) {
      category = "Acne Focused Products";
    } else if (/\b(face mask|clay mask|sheet mask|sleeping mask)\b/i.test(lower)) {
      category = "Face Masks";
    } else if (/\b(lip care|lip balm|lip mask|lip sleeping mask)\b/i.test(lower)) {
      category = "Lip Care";
    } else if (/\b(eye care|eye cream|eye serum)\b/i.test(lower)) {
      category = "Eye Care";
    } else if (/\b(treatment|retinol cream|peeling treatment)\b/i.test(lower)) {
      category = "Treatment Products";
    }

    if (category) confidenceScores["category"] = "High";

    // 5. Budget Extraction
    let minPrice: number | null = null;
    let maxPrice: number | null = null;

    const underMatch = lower.match(/(under|below|less than|max|maximum|budget of|budget)\s*₹?\s*(\d+)/i);
    if (underMatch && underMatch[2]) {
      maxPrice = parseInt(underMatch[2], 10);
      confidenceScores["budget"] = "High";
    }

    const betweenMatch = lower.match(/(between|from)\s*₹?\s*(\d+)\s*(and|to|-)\s*₹?\s*(\d+)/i);
    if (betweenMatch && betweenMatch[2] && betweenMatch[4]) {
      minPrice = parseInt(betweenMatch[2], 10);
      maxPrice = parseInt(betweenMatch[4], 10);
      confidenceScores["budget"] = "High";
    }

    const aroundMatch = lower.match(/(around|approx|approximately)\s*₹?\s*(\d+)/i);
    if (aroundMatch && aroundMatch[2] && !maxPrice) {
      maxPrice = parseInt(aroundMatch[2], 10);
      confidenceScores["budget"] = "Medium";
    }

    // 6. Ingredient Extraction (Preferred vs Avoid vs Allergy)
    const preferredIngredients: string[] = [];
    const avoidIngredients: string[] = [];
    const knownAllergies: string[] = [];

    // Allergy check (Requirement #9: allergic to X must be allergy, not preference!)
    const allergyMatch = lower.match(/allergic to\s+([a-z0-9\s,]+)(?=\.|$|and|but)/i);
    if (allergyMatch && allergyMatch[1]) {
      const ingStr = allergyMatch[1].trim();
      if (ingStr.includes("fragrance")) knownAllergies.push("Fragrance");
      if (ingStr.includes("paraben")) knownAllergies.push("Specific preservatives");
      if (!knownAllergies.includes(ingStr)) knownAllergies.push(ingStr);
    }

    // Avoid ingredient check
    if (/\b(no fragrance|fragrance free|without fragrance|don't want fragrance|avoid fragrance)\b/i.test(lower)) {
      avoidIngredients.push("Fragrance");
    }
    if (/\b(no parabens|paraben free|without parabens)\b/i.test(lower)) {
      avoidIngredients.push("Parabens");
    }
    if (/\b(no alcohol|alcohol free|without alcohol)\b/i.test(lower)) {
      avoidIngredients.push("Alcohol");
    }
    if (/\b(no essential oils|avoid essential oils)\b/i.test(lower)) {
      avoidIngredients.push("Essential Oils");
    }

    // Preferred ingredient check
    if (/\b(niacinamide|vitamin b3)\b/i.test(lower) && !avoidIngredients.includes("Niacinamide")) {
      preferredIngredients.push("Niacinamide");
    }
    if (/\b(salicylic acid|bha)\b/i.test(lower) && !avoidIngredients.includes("Salicylic Acid")) {
      preferredIngredients.push("Salicylic Acid");
    }
    if (/\b(hyaluronic acid|ha)\b/i.test(lower) && !avoidIngredients.includes("Hyaluronic Acid")) {
      preferredIngredients.push("Hyaluronic Acid");
    }
    if (/\b(vitamin c|ascorbic acid)\b/i.test(lower) && !avoidIngredients.includes("Vitamin C")) {
      preferredIngredients.push("Vitamin C");
    }
    if (/\b(ceramide|ceramides)\b/i.test(lower)) {
      preferredIngredients.push("Ceramides");
    }
    if (/\b(retinol|retinoid)\b/i.test(lower)) {
      preferredIngredients.push("Retinol");
    }
    if (/\b(cica|centella|madecassoside)\b/i.test(lower)) {
      preferredIngredients.push("Centella Asiatica");
    }
    if (/\b(squalane)\b/i.test(lower)) {
      preferredIngredients.push("Squalane");
    }
    if (/\b(zinc|zinc pca)\b/i.test(lower)) {
      preferredIngredients.push("Zinc PCA");
    }

    // 7. Brand Extraction (Preferred vs Excluded)
    const preferredBrands: string[] = [];
    const excludedBrands: string[] = [];

    const knownBrandList = [
      "Minimalist",
      "Dot & Key",
      "The Derma Co",
      "Re'equil",
      "Cetaphil",
      "Plum",
      "COSRX",
      "Paula's Choice",
      "Innisfree",
      "Laneige",
    ];

    knownBrandList.forEach((b) => {
      const bLower = b.toLowerCase();
      if (lower.includes(`don't want ${bLower}`) || lower.includes(`no ${bLower}`) || lower.includes(`avoid ${bLower}`)) {
        excludedBrands.push(b);
      } else if (lower.includes(bLower)) {
        preferredBrands.push(b);
      }
    });

    // 8. Product Characteristics Extraction
    let texturePreference: TexturePreference | null = null;
    if (/\bgel\b/i.test(lower)) texturePreference = "Gel";
    else if (/\bcream\b/i.test(lower)) texturePreference = "Cream";
    else if (/\blotion\b/i.test(lower)) texturePreference = "Lotion";
    else if (/\bfoam|foaming\b/i.test(lower)) texturePreference = "Foam";
    else if (/\bwater based|water-based\b/i.test(lower)) texturePreference = "Water based";

    let finishPreference: FinishPreference | null = null;
    if (/\bmatte\b/i.test(lower)) finishPreference = "Matte";
    else if (/\bdewy\b/i.test(lower)) finishPreference = "Dewy";
    else if (/\bnatural finish\b/i.test(lower)) finishPreference = "Natural";

    let fragrancePreference: FragrancePreference | null = null;
    if (/\b(fragrance free|no fragrance|unscented)\b/i.test(lower)) {
      fragrancePreference = "Fragrance free";
    } else if (/\b(light fragrance|mild scent)\b/i.test(lower)) {
      fragrancePreference = "Light fragrance";
    }

    const properties: ProductProperty[] = [];
    if (/\blightweight\b/i.test(lower)) properties.push("Lightweight");
    if (/\bnon sticky|non-sticky\b/i.test(lower)) properties.push("Non sticky");
    if (/\bfast absorbing|quick absorbing\b/i.test(lower)) properties.push("Fast absorbing");
    if (/\bfragrance free|no fragrance\b/i.test(lower)) properties.push("Fragrance free");
    if (/\balcohol free|no alcohol\b/i.test(lower)) properties.push("Alcohol free");
    if (/\bnon comedogenic|non-comedogenic|won't clog pores\b/i.test(lower)) properties.push("Non comedogenic");
    if (/\bvegan\b/i.test(lower)) properties.push("Vegan");
    if (/\bcruelty free|cruelty-free\b/i.test(lower)) properties.push("Cruelty free");
    if (/\bdermatologically tested|dermatologist tested\b/i.test(lower)) properties.push("Dermatologically tested");

    return {
      skinType,
      concerns,
      goals,
      category,
      minPrice,
      maxPrice,
      preferredBrands,
      excludedBrands,
      preferredIngredients,
      avoidIngredients,
      knownAllergies,
      texturePreference,
      finishPreference,
      fragrancePreference,
      properties,
      confidenceScores,
    };
  }

  /**
   * Ambiguity Detection (Requirement #13)
   */
  private static detectAmbiguitiesInText(
    text: string,
    extracted: ReturnType<typeof AIRequirementService.extractEntitiesFromText>
  ): AmbiguityClarification[] {
    const lower = text.toLowerCase();
    const ambiguities: AmbiguityClarification[] = [];

    // Ambiguity Example 1: "marks"
    if (/\bmarks\b/i.test(lower) && !/\b(acne marks|dark spots|hyperpigmentation)\b/i.test(lower)) {
      ambiguities.push({
        term: "marks",
        question: "BeautyIQ isn't completely sure what you mean by 'marks'. Did you mean?",
        options: [
          { label: "Dark spots", field: "concerns", value: "Dark spots" },
          { label: "Acne marks", field: "concerns", value: "Acne marks" },
          { label: "Hyperpigmentation", field: "concerns", value: "Hyperpigmentation" },
        ],
      });
    }

    // Ambiguity Example 2: "glow" without category
    if (/\bglow\b/i.test(lower) && !extracted.category) {
      ambiguities.push({
        term: "glow product category",
        question: "Which product routine step would you prefer for achieving your glow goal?",
        options: [
          { label: "Serum (Concentrated active)", field: "category", value: "Serum" },
          { label: "Moisturizer (Hydrating cream)", field: "category", value: "Moisturizer" },
          { label: "Exfoliator (Surface renewal)", field: "category", value: "Exfoliator" },
        ],
      });
    }

    return ambiguities;
  }

  /**
   * Contradiction Validation (Requirement #15)
   */
  private static validateContradictions(
    extracted: ReturnType<typeof AIRequirementService.extractEntitiesFromText>
  ): ContradictionConflict[] {
    const contradictions: ContradictionConflict[] = [];

    // Contradiction 1: Fragrance Free vs Light Fragrance
    if (
      extracted.avoidIngredients.includes("Fragrance") &&
      extracted.fragrancePreference === "Light fragrance"
    ) {
      contradictions.push({
        id: "c_fragrance",
        fieldA: "Avoid Ingredient",
        valueA: "Fragrance",
        fieldB: "Fragrance Preference",
        valueB: "Light Fragrance",
        message: "You requested both 'Fragrance-free' and 'Light fragrance preferred'. Which constraint should take precedence?",
        resolutionOptions: [
          { label: "Enforce Fragrance Free", action: "keepA" },
          { label: "Allow Light Fragrance", action: "keepB" },
          { label: "Clear Fragrance Preferences", action: "clearBoth" },
        ],
      });
    }

    // Contradiction 2: Max Price < Min Price
    if (
      extracted.minPrice !== null &&
      extracted.maxPrice !== null &&
      extracted.maxPrice < extracted.minPrice
    ) {
      contradictions.push({
        id: "c_budget",
        fieldA: "Minimum Price",
        valueA: `₹${extracted.minPrice}`,
        fieldB: "Maximum Price",
        valueB: `₹${extracted.maxPrice}`,
        message: `Your requested maximum budget (₹${extracted.maxPrice}) is lower than your minimum budget (₹${extracted.minPrice}).`,
        resolutionOptions: [
          { label: `Keep Max Budget (₹${extracted.maxPrice})`, action: "keepB" },
          { label: `Keep Min Budget (₹${extracted.minPrice})`, action: "keepA" },
          { label: "Clear Budget Restrictions", action: "clearBoth" },
        ],
      });
    }

    return contradictions;
  }

  /**
   * Create Empty Requirement Object for reset / fallback
   */
  public static createEmptyRequirementObject(rawQuery: string = ""): StructuredSkincareRequirement {
    return {
      id: `req_${Date.now()}`,
      rawQuery,
      skinType: null,
      concerns: [],
      goals: [],
      category: null,
      minPrice: null,
      maxPrice: null,
      preferredBrands: [],
      excludedBrands: [],
      preferredIngredients: [],
      avoidIngredients: [],
      knownAllergies: [],
      texturePreference: null,
      finishPreference: null,
      fragrancePreference: null,
      properties: [],
      extractedAt: new Date().toISOString(),
      isConfirmed: false,
      confidenceScores: {},
    };
  }

  /**
   * Session Storage & History Persistence Foundation (Requirement #25)
   */
  public static saveConfirmedSession(req: StructuredSkincareRequirement): AIRequirementSession {
    const session: AIRequirementSession = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      rawQuery: req.rawQuery,
      confirmedRequirements: { ...req, isConfirmed: true },
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(REQUIREMENT_SESSIONS_KEY);
        const existing: AIRequirementSession[] = stored ? JSON.parse(stored) : [];
        const updated = [session, ...existing].slice(0, 20); // Keep max 20 sessions
        localStorage.setItem(REQUIREMENT_SESSIONS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist AI requirement session:", e);
      }
    }

    return session;
  }

  public static getRequirementHistory(): AIRequirementSession[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(REQUIREMENT_SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public static clearRequirementHistory(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(REQUIREMENT_SESSIONS_KEY);
    } catch {
      // ignore
    }
  }
}
