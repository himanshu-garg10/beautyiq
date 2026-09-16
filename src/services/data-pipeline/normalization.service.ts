import type {
  RoutineStep,
  ProductUnit,
  NormalizedQuantityResult,
  NormalizedBrandResult,
  NormalizedCategoryResult,
  NormalizedIngredientSummary,
} from "@/types";

// Canonical Brand Synonym Dictionary
const BRAND_SYNONYM_MAP: Record<string, string[]> = {
  Minimalist: ["beminimalist", "be minimalist", "minimalist india", "minimalist skincare"],
  Cetaphil: ["cetaphil india", "cetaphil dermatological", "galderma cetaphil"],
  "The Ordinary": ["the ordinary", "ordinary", "deciem the ordinary", "deciem"],
  "Paula's Choice": ["paula's choice", "paulas choice", "paula's choice india", "paula choice"],
  "Dot & Key": ["dot & key", "dot and key", "dot&key", "dot and key skincare"],
  CeraVe: ["cerave", "cerave india", "l'oreal cerave", "cerave dermatological"],
  "Re'equil": ["re'equil", "reequil", "re'equil india", "re equil"],
  "Dr. Sheth's": ["dr. sheth's", "dr sheths", "dr sheth", "dr. sheths for indian skin"],
  "The Derma Co": ["the derma co", "derma co", "the derma co.", "derma company"],
  Plum: ["plum", "plum goodness", "plum skincare"],
  Neutrogena: ["neutrogena", "neutrogena india", "johnson & johnson neutrogena"],
  Cosrx: ["cosrx", "cosrx korea", "cosrx beauty"],
  Biotique: ["biotique", "biotique advanced ayurveda", "biotique botanicals"],
  Sebamed: ["sebamed", "sebamed india", "sebapharma"],
  Laneige: ["laneige", "laneige korea", "amorepacific laneige"],
  Bioderma: ["bioderma", "bioderma laboratoiredermatologique", "bioderma india"],
};

// Canonical Category Keyword & Synonym Rules
const CATEGORY_MAP: Record<RoutineStep, string[]> = {
  "Face Wash": ["face wash", "facial wash", "foaming cleanser", "gel face wash", "foaming wash"],
  Cleanser: ["cleanser", "cleansing balm", "cleansing oil", "micellar water", "gentle cleanser", "cleansing lotion"],
  Serum: ["serum", "ampoule", "essence", "concentrate", "facial drops", "booster serum"],
  Moisturizer: ["moisturizer", "moisturiser", "cream", "day cream", "night cream", "gel cream", "lotion", "facial lotion", "barrier cream"],
  Sunscreen: ["sunscreen", "sunblock", "spf", "uv filter", "sun fluid", "sun gel", "solar shield"],
  Toner: ["toner", "astringent", "skin mist", "balancing toner", "clarifying toner"],
  Exfoliator: ["exfoliator", "scrub", "peeling solution", "peel", "aha bha peel", "resurfacing solution"],
  "Acne Focused Products": ["acne", "pimple patch", "spot treatment", "blemish gel", "anti acne", "acne gel"],
  "Face Masks": ["face mask", "sheet mask", "clay mask", "sleeping mask", "peel off mask"],
  "Lip Care": ["lip care", "lip balm", "lip mask", "lip butter", "lip treatment"],
  "Eye Care": ["eye care", "eye cream", "under eye gel", "eye serum", "under eye cream"],
  "Treatment Products": ["treatment", "retinol cream", "prescription formula", "intensive treatment"],
};

// Canonical INCI & Common Ingredient Synonym Dictionary
export const INGREDIENT_SYNONYMS: Record<string, string[]> = {
  Niacinamide: ["nicotinamide", "vitamin b3", "3-pyridinecarboxamide", "nicotinic acid amide"],
  "Hyaluronic Acid": ["sodium hyaluronate", "hyaluronan", "hydrolyzed hyaluronic acid", "sodium acetylated hyaluronate", "potassium hyaluronate"],
  "Salicylic Acid": ["bha", "beta hydroxy acid", "2-hydroxybenzoic acid", "salicylate"],
  "Glycolic Acid": ["aha", "alpha hydroxy acid", "2-hydroxyethanoic acid", "hydroxyacetic acid"],
  "Vitamin C": ["l-ascorbic acid", "ascorbic acid", "ethyl ascorbic acid", "sodium ascorbyl phosphate", "ascorbyl glucoside", "magnesium ascorbyl phosphate"],
  Retinol: ["vitamin a", "retinyl palmitate", "all-trans retinol", "retinaldehyde", "hydroxypinacolone retinoate"],
  Ceramides: ["ceramide np", "ceramide ap", "ceramide eop", "phytosphingosine", "sphingolipids", "ceramide complex"],
  Squalane: ["plant squalane", "olive squalane", "spinacene", "phytosqualane", "sugar squalane"],
  "Centella Asiatica (Cica)": ["centella asiatica", "gotu kola", "madecassoside", "asiaticoside", "centella asiatica extract", "cica extract"],
  "Zinc Oxide": ["physical uv filter", "zinc powder", "ci 77947", "micronized zinc oxide"],
  "Zinc PCA": ["zinc salt of l-pca", "zinc pyrrolidone carboxylic acid"],
  Tocopherol: ["vitamin e", "tocopheryl acetate", "d-alpha-tocopherol", "mixed tocopherols"],
  Petrolatum: ["petroleum jelly", "white soft paraffin", "mineral wax"],
  "Coco-Glucoside": ["coconut glucoside", "alkyl polyglucoside"],
  "Tea Tree Oil": ["melaleuca alternifolia leaf oil", "tea tree leaf extract"],
  "Lactic Acid": ["2-hydroxypropanoic acid", "milk acid"],
  "Azelaic Acid": ["nonanedioic acid", "azelaic"],
  Bakuchiol: ["psoralea corylifolia extract", "babchi extract"],
  Glycerin: ["glycerol", "glycerine"],
  Panthenol: ["pro-vitamin b5", "dexpanthenol", "pantothenyl alcohol"],
  Allantoin: ["glyoxyldiureide", "5-ureidohydantoin"],
};

export class NormalizationService {
  /**
   * Brand Normalization:
   * Maps variations to canonical brands while preserving the raw source string.
   * If confidence is insufficient, preserves original brand without forcing a false match.
   */
  static normalizeBrand(rawBrand: string): NormalizedBrandResult {
    if (!rawBrand || typeof rawBrand !== "string") {
      return {
        canonicalBrand: "Unbranded / Independent",
        originalBrand: String(rawBrand || ""),
        confidence: 0,
        isRecognized: false,
      };
    }

    const trimmed = rawBrand.trim();
    const cleanLower = trimmed.toLowerCase();

    // 1. Direct canonical match (case-insensitive)
    for (const canonical of Object.keys(BRAND_SYNONYM_MAP)) {
      if (canonical.toLowerCase() === cleanLower) {
        return {
          canonicalBrand: canonical,
          originalBrand: trimmed,
          confidence: 100,
          isRecognized: true,
        };
      }
    }

    // 2. Synonym and alias lookup
    for (const [canonical, aliases] of Object.entries(BRAND_SYNONYM_MAP)) {
      for (const alias of aliases) {
        if (cleanLower === alias || cleanLower.includes(alias) || alias.includes(cleanLower)) {
          return {
            canonicalBrand: canonical,
            originalBrand: trimmed,
            confidence: 90,
            isRecognized: true,
          };
        }
      }
    }

    // 3. Unrecognized Brand: Keep raw value cleanly formatted, do NOT merge randomly
    const capitalized = trimmed
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    return {
      canonicalBrand: capitalized,
      originalBrand: trimmed,
      confidence: 60,
      isRecognized: false,
    };
  }

  /**
   * Category Normalization:
   * Maps source categories into the 12 standard BeautyIQ RoutineStep categories.
   * Flags uncertain mappings rather than guessing silently.
   */
  static normalizeCategory(rawCategory: string, productName = ""): NormalizedCategoryResult {
    if (!rawCategory || typeof rawCategory !== "string") {
      return {
        canonicalCategory: "Serum",
        originalCategory: String(rawCategory || ""),
        confidence: 20,
        isUncertain: true,
      };
    }

    const targetText = `${rawCategory} ${productName}`.toLowerCase();

    // 1. Direct match with standard categories
    for (const category of Object.keys(CATEGORY_MAP) as RoutineStep[]) {
      if (rawCategory.trim().toLowerCase() === category.toLowerCase()) {
        return {
          canonicalCategory: category,
          originalCategory: rawCategory.trim(),
          confidence: 100,
          isUncertain: false,
        };
      }
    }

    // 2. Keyword rule-based matching
    for (const [category, keywords] of Object.entries(CATEGORY_MAP) as [RoutineStep, string[]][]) {
      for (const kw of keywords) {
        if (targetText.includes(kw)) {
          return {
            canonicalCategory: category,
            originalCategory: rawCategory.trim(),
            confidence: 85,
            isUncertain: false,
          };
        }
      }
    }

    // 3. Fallback: flag as uncertain
    return {
      canonicalCategory: "Treatment Products",
      originalCategory: rawCategory.trim(),
      confidence: 40,
      isUncertain: true,
    };
  }

  /**
   * Quantity and Unit Normalization:
   * Handles "50 ml", "50ML", "50 mL", "100 g", "100GM", "1 pc", etc.
   */
  static normalizeQuantityAndUnit(rawQty: any, rawUnit?: any): NormalizedQuantityResult {
    // If quantity is already provided as numeric
    let qty = typeof rawQty === "number" ? rawQty : 50;
    let unit: ProductUnit = "ml";

    const combined = `${rawQty ?? ""} ${rawUnit ?? ""}`.trim().toLowerCase();

    // Regex extraction for patterns like "50ml", "100 g", "30 ml", "2 sheets"
    const match = combined.match(/([0-9]+(\.[0-9]+)?)\s*(ml|milliliter|g|gm|gram|pcs|sheets|pieces)?/i);

    if (match) {
      qty = parseFloat(match[1]);
      const rawUnitStr = (match[3] || rawUnit || "ml").toLowerCase();

      if (rawUnitStr.includes("g") || rawUnitStr.includes("gram")) {
        unit = "g";
      } else if (rawUnitStr.includes("sheet")) {
        unit = "sheets";
      } else if (rawUnitStr.includes("pc") || rawUnitStr.includes("piece")) {
        unit = "pcs";
      } else {
        unit = "ml";
      }
    }

    return {
      quantity: qty > 0 ? Math.round(qty * 10) / 10 : 50,
      unit,
    };
  }

  /**
   * Ingredient Normalization:
   * Maps common trade names and INCI variants into canonical ingredients.
   * If an ingredient cannot be reliably identified, marks it as uncertain without guessing.
   */
  static normalizeIngredients(rawIngredients: string | string[]): NormalizedIngredientSummary {
    let list: string[] = [];

    if (Array.isArray(rawIngredients)) {
      list = rawIngredients;
    } else if (typeof rawIngredients === "string") {
      list = rawIngredients
        .split(/[,;\n•]+/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0);
    }

    const normalizedSet = new Set<string>();
    const uncertainList: string[] = [];

    for (const rawItem of list) {
      const cleanItem = rawItem.replace(/[\(\)\[\]]/g, "").trim();
      const lower = cleanItem.toLowerCase();

      let matched = false;

      // Match against canonical or synonyms
      for (const [canonical, synonyms] of Object.entries(INGREDIENT_SYNONYMS)) {
        if (canonical.toLowerCase() === lower || synonyms.some((s) => s === lower || lower.includes(s))) {
          normalizedSet.add(canonical);
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Preserved as uncertain without guessing
        if (cleanItem.length > 2) {
          uncertainList.push(cleanItem);
        }
      }
    }

    return {
      normalized: Array.from(normalizedSet),
      uncertain: uncertainList,
      unidentifiedCount: uncertainList.length,
    };
  }
}
