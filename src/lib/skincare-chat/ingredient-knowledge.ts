/**
 * General skincare ingredient knowledge used to REASON about catalog products.
 *
 * This is general guidance (what an ingredient is commonly used for), not catalog data.
 * It never decides whether a product *contains* an ingredient: that is read from the
 * product's own ingredient list. Wording stays cosmetic ("commonly used to support…"),
 * never medical ("treats", "cures").
 */
import type { DetailedSkinConcern, SkinType } from "./types";

export interface IngredientKnowledge {
  key: string;
  name: string;
  /** Lower-case INCI / marketing names matched against product ingredient strings (word-boundary). */
  aliases: string[];
  /** Concerns this ingredient is commonly used for. */
  helpsWith: DetailedSkinConcern[];
  /** Skin types it generally suits. */
  suits: SkinType[];
  /** Skin types that should introduce it carefully. */
  caution: SkinType[];
  /** 0 = very gentle, 3 = strong active that can irritate. */
  irritation: 0 | 1 | 2 | 3;
  /** One-line general description. */
  role: string;
  /** Keys that are commonly advised to be used on different days / introduced separately. */
  separateFrom: string[];
  /** Short note on usage. */
  usageNote?: string;
}

export const INGREDIENTS: IngredientKnowledge[] = [
  {
    key: "niacinamide", name: "Niacinamide", aliases: ["niacinamide", "nicotinamide", "vitamin b3"],
    helpsWith: ["Excess oil", "Visible pores", "Dark spots", "Uneven skin tone", "Acne marks", "Dullness", "Acne", "Pimples"],
    suits: ["Oily", "Combination", "Normal", "Dry", "Sensitive"], caution: [], irritation: 1,
    role: "a vitamin B3 derivative commonly used to help balance oil, refine the look of pores and support a more even-looking tone",
    separateFrom: [],
    usageNote: "Generally well tolerated; higher percentages are not automatically better and can cause flushing for some people.",
  },
  {
    key: "salicylic-acid", name: "Salicylic Acid", aliases: ["salicylic acid", "bha", "beta hydroxy acid"],
    helpsWith: ["Acne", "Pimples", "Blackheads", "Whiteheads", "Excess oil", "Visible pores"],
    suits: ["Oily", "Combination"], caution: ["Dry", "Sensitive"], irritation: 2,
    role: "a beta-hydroxy acid (BHA) that is oil-soluble and commonly used to exfoliate inside pores for blemish-prone, oily skin",
    separateFrom: ["retinol", "glycolic-acid"],
    usageNote: "Start a few times a week and use sunscreen in the morning.",
  },
  {
    key: "hyaluronic-acid", name: "Hyaluronic Acid", aliases: ["hyaluronic acid", "sodium hyaluronate", "hyaluronate"],
    helpsWith: ["Dehydration", "Dryness", "Fine lines", "Dullness"],
    suits: ["Oily", "Dry", "Combination", "Normal", "Sensitive"], caution: [], irritation: 0,
    role: "a humectant that draws water into the surface of the skin to help it look and feel hydrated",
    separateFrom: [],
  },
  {
    key: "retinol", name: "Retinol", aliases: ["retinol", "retinal", "retinyl", "retinoid", "retinaldehyde", "bakuchiol"],
    helpsWith: ["Fine lines", "Rough texture", "Uneven texture", "Dullness", "Acne marks"],
    suits: ["Normal", "Oily", "Combination"], caution: ["Sensitive", "Dry"], irritation: 3,
    role: "a vitamin A derivative commonly used in night routines for the look of fine lines and texture",
    separateFrom: ["salicylic-acid", "glycolic-acid", "vitamin-c"],
    usageNote: "Introduce slowly, use at night and always pair with daytime sunscreen. Not for use in pregnancy without medical advice.",
  },
  {
    key: "vitamin-c", name: "Vitamin C", aliases: ["vitamin c", "ascorbic acid", "ascorbyl", "ascorbate", "l-ascorbic"],
    helpsWith: ["Dark spots", "Hyperpigmentation", "Uneven skin tone", "Dullness", "Tanning", "Acne marks"],
    suits: ["Normal", "Oily", "Combination", "Dry"], caution: ["Sensitive"], irritation: 2,
    role: "an antioxidant commonly used to support a brighter, more even-looking tone",
    separateFrom: ["retinol"],
    usageNote: "Usually used in the morning under sunscreen.",
  },
  {
    key: "ceramides", name: "Ceramides", aliases: ["ceramide", "ceramides", "ceramide np", "ceramide ap", "ceramide eop"],
    helpsWith: ["Dryness", "Dehydration", "Redness", "Rough texture"],
    suits: ["Dry", "Sensitive", "Normal", "Combination", "Oily"], caution: [], irritation: 0,
    role: "skin-identical lipids that help support the moisture barrier",
    separateFrom: [],
  },
  {
    key: "azelaic-acid", name: "Azelaic Acid", aliases: ["azelaic acid", "azeloglycine"],
    helpsWith: ["Acne", "Pimples", "Redness", "Dark spots", "Hyperpigmentation", "Acne marks", "Uneven skin tone"],
    suits: ["Oily", "Combination", "Normal", "Sensitive"], caution: [], irritation: 1,
    role: "a gentle acid commonly used for blemish-prone skin and uneven tone",
    separateFrom: [],
  },
  {
    key: "glycolic-acid", name: "Glycolic Acid", aliases: ["glycolic acid", "aha", "alpha hydroxy acid"],
    helpsWith: ["Dullness", "Rough texture", "Uneven texture", "Uneven skin tone", "Tanning", "Dark spots"],
    suits: ["Oily", "Combination", "Normal"], caution: ["Sensitive", "Dry"], irritation: 3,
    role: "an alpha-hydroxy acid (AHA) that exfoliates the skin surface to help smooth texture and brighten dull skin",
    separateFrom: ["retinol", "salicylic-acid"],
    usageNote: "Introduce gradually and use sunscreen daily.",
  },
  {
    key: "lactic-acid", name: "Lactic Acid", aliases: ["lactic acid"],
    helpsWith: ["Dullness", "Rough texture", "Visible pores", "Uneven texture"],
    suits: ["Normal", "Dry", "Combination", "Oily", "Sensitive"], caution: [], irritation: 1,
    role: "a milder AHA that gently exfoliates while supporting hydration",
    separateFrom: ["retinol"],
  },
  {
    key: "zinc-pca", name: "Zinc PCA", aliases: ["zinc pca"],
    helpsWith: ["Excess oil", "Acne", "Pimples", "Visible pores", "Blackheads"],
    suits: ["Oily", "Combination"], caution: [], irritation: 0,
    role: "a zinc salt commonly used to help manage the look of excess oil on blemish-prone skin",
    separateFrom: [],
  },
  {
    key: "zinc-oxide", name: "Zinc Oxide", aliases: ["zinc oxide"],
    helpsWith: ["Tanning", "Hyperpigmentation", "Dark spots", "Redness"],
    suits: ["Sensitive", "Oily", "Combination", "Dry", "Normal"], caution: [], irritation: 0,
    role: "a mineral UV filter used in sunscreens; sun protection helps keep dark spots and tanning from getting worse",
    separateFrom: [],
  },
  {
    key: "centella", name: "Centella Asiatica", aliases: ["centella", "cica", "madecassoside", "asiaticoside", "gotu kola"],
    helpsWith: ["Redness", "Acne", "Rough texture"],
    suits: ["Sensitive", "Oily", "Combination", "Dry", "Normal"], caution: [], irritation: 0,
    role: "a soothing plant extract commonly used for sensitive or easily reddened skin",
    separateFrom: [],
  },
  {
    key: "squalane", name: "Squalane", aliases: ["squalane", "squalene"],
    helpsWith: ["Dryness", "Rough texture"],
    suits: ["Dry", "Sensitive", "Normal", "Combination"], caution: [], irritation: 0,
    role: "a lightweight emollient that helps soften skin",
    separateFrom: [],
  },
  {
    key: "tea-tree", name: "Tea Tree", aliases: ["tea tree", "melaleuca"],
    helpsWith: ["Acne", "Pimples", "Blackheads"],
    suits: ["Oily", "Combination"], caution: ["Sensitive"], irritation: 2,
    role: "a botanical oil commonly used in products for blemish-prone skin; it can be irritating for sensitive skin",
    separateFrom: [],
  },
  {
    key: "caffeine", name: "Caffeine", aliases: ["caffeine"],
    helpsWith: ["Dark circles", "Under eye puffiness"],
    suits: ["Normal", "Oily", "Dry", "Combination"], caution: [], irritation: 0,
    role: "commonly used in eye products to help with the look of puffiness",
    separateFrom: [],
  },
  {
    key: "aloe", name: "Aloe Vera", aliases: ["aloe", "aloe barbadensis"],
    helpsWith: ["Redness", "Dehydration", "Dryness"],
    suits: ["Sensitive", "Dry", "Normal", "Combination", "Oily"], caution: [], irritation: 0,
    role: "a soothing, water-rich plant extract",
    separateFrom: [],
  },
  {
    key: "panthenol", name: "Panthenol", aliases: ["panthenol", "provitamin b5", "dexpanthenol"],
    helpsWith: ["Dryness", "Redness", "Dehydration"],
    suits: ["Sensitive", "Dry", "Normal", "Combination", "Oily"], caution: [], irritation: 0,
    role: "a soothing humectant that helps support the skin barrier",
    separateFrom: [],
  },
  {
    key: "glycerin", name: "Glycerin", aliases: ["glycerin", "glycerine"],
    helpsWith: ["Dryness", "Dehydration"],
    suits: ["Sensitive", "Dry", "Normal", "Combination", "Oily"], caution: [], irritation: 0,
    role: "a classic humectant that attracts water to the skin",
    separateFrom: [],
  },
  {
    key: "allantoin", name: "Allantoin", aliases: ["allantoin"],
    helpsWith: ["Redness", "Dryness", "Rough texture"],
    suits: ["Sensitive", "Dry", "Normal", "Combination", "Oily"], caution: [], irritation: 0,
    role: "a soothing, skin-softening ingredient",
    separateFrom: [],
  },
  {
    key: "alpha-arbutin", name: "Alpha Arbutin", aliases: ["alpha arbutin", "arbutin"],
    helpsWith: ["Dark spots", "Hyperpigmentation", "Uneven skin tone", "Acne marks"],
    suits: ["Normal", "Oily", "Combination", "Dry", "Sensitive"], caution: [], irritation: 1,
    role: "a brightening ingredient commonly used for the look of dark spots",
    separateFrom: [],
  },
  {
    key: "tranexamic-acid", name: "Tranexamic Acid", aliases: ["tranexamic acid"],
    helpsWith: ["Dark spots", "Hyperpigmentation", "Uneven skin tone", "Acne marks"],
    suits: ["Normal", "Oily", "Combination", "Dry", "Sensitive"], caution: [], irritation: 1,
    role: "a brightening ingredient commonly used for the look of dark spots and uneven tone",
    separateFrom: [],
  },
  {
    key: "kojic-acid", name: "Kojic Acid", aliases: ["kojic acid"],
    helpsWith: ["Dark spots", "Hyperpigmentation", "Uneven skin tone"],
    suits: ["Normal", "Oily", "Combination"], caution: ["Sensitive"], irritation: 2,
    role: "a brightening ingredient commonly used for the look of dark spots",
    separateFrom: [],
  },
  {
    key: "green-tea", name: "Green Tea", aliases: ["green tea", "camellia sinensis", "egcg"],
    helpsWith: ["Excess oil", "Redness", "Acne"],
    suits: ["Oily", "Combination", "Sensitive", "Normal"], caution: [], irritation: 0,
    role: "an antioxidant plant extract commonly used in oil-balancing and soothing formulas",
    separateFrom: [],
  },
  {
    key: "petrolatum", name: "Petrolatum", aliases: ["petrolatum", "petroleum jelly", "paraffin"],
    helpsWith: ["Dryness", "Dehydration"],
    suits: ["Dry", "Sensitive", "Normal"], caution: ["Oily"], irritation: 0,
    role: "an occlusive that seals in moisture",
    separateFrom: [],
  },
];

/** Non-ingredient things a user might want to avoid, mapped to substrings matched in ingredient lists. */
export const ALLERGEN_ALIASES: Record<string, string[]> = {
  fragrance: ["fragrance", "parfum", "perfume", "aroma", "linalool", "limonene", "geraniol", "citronellol", "eugenol", "coumarin"],
  alcohol: ["alcohol denat", "denatured alcohol", "sd alcohol", "isopropyl alcohol", "ethanol"], // bare "alcohol" omitted: fatty alcohols (cetyl/cetearyl) are different
  parabens: ["paraben"],
  sulfates: ["sulfate", "sulphate", "sls", "sles"],
  silicones: ["dimethicone", "cyclopentasiloxane", "siloxane", "silicone"],
  "essential oils": ["essential oil", "tea tree", "melaleuca", "lavender", "peppermint", "eucalyptus", "citrus", "orange oil", "lemon", "bergamot", "rose oil"],
  phenoxyethanol: ["phenoxyethanol"],
  coconut: ["coconut", "cocos nucifera", "coco-"],
  nuts: ["almond", "prunus amygdalus", "walnut", "hazelnut", "shea", "argan", "peanut", "arachis"],
  lanolin: ["lanolin"],
  soy: ["soy", "glycine soja"],
  "aloe vera": ["aloe"],
  oats: ["avena", "oat"],
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function normalizeText(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
}

/** Word-boundary-aware containment check. */
export function containsTerm(haystack: string, term: string): boolean {
  const h = normalizeText(haystack);
  const t = normalizeText(term);
  if (!t) return false;
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegex(t)}(?:$|[^a-z0-9])`, "i").test(h) ||
    // allow stems like "ceramide" → "ceramides", "paraben" → "parabens"
    new RegExp(`(?:^|[^a-z0-9])${escapeRegex(t)}[a-z]{0,2}(?:$|[^a-z0-9])`, "i").test(h);
}

export function findKnowledgeForIngredient(ingredientName: string): IngredientKnowledge | null {
  for (const k of INGREDIENTS) {
    if (k.aliases.some((a) => containsTerm(ingredientName, a))) return k;
  }
  return null;
}

/** Resolve free text (e.g. "vitamin c", "retinoids", "BHA") to a knowledge entry. */
export function resolveIngredientMention(text: string): IngredientKnowledge | null {
  const t = normalizeText(text);
  // Prefer longer aliases first so "zinc oxide" does not become "zinc pca".
  const candidates = INGREDIENTS.flatMap((k) => [...k.aliases, normalizeText(k.name)].map((a) => ({ k, a })))
    .sort((x, y) => y.a.length - x.a.length);
  for (const { k, a } of candidates) if (containsTerm(t, a)) return k;
  return null;
}

/** All knowledge entries mentioned anywhere in a piece of text. */
export function findIngredientsInText(text: string): IngredientKnowledge[] {
  const found = new Map<string, IngredientKnowledge>();
  for (const k of INGREDIENTS) {
    if ([...k.aliases, normalizeText(k.name)].some((a) => containsTerm(text, a))) found.set(k.key, k);
  }
  return [...found.values()];
}

/** Terms that identify `allergen` inside a product's ingredient list. */
export function termsForAllergen(allergen: string): string[] {
  const a = normalizeText(allergen);
  // Group terms are returned without the bare group word ("alcohol" would also match harmless "cetearyl alcohol").
  if (ALLERGEN_ALIASES[a]) return ALLERGEN_ALIASES[a];
  for (const [group, terms] of Object.entries(ALLERGEN_ALIASES)) {
    if (a === `${group}s` || terms.some((t) => t === a)) return terms;
  }
  const knowledge = resolveIngredientMention(a);
  if (knowledge) return [...knowledge.aliases, normalizeText(knowledge.name)];
  return [a];
}

export interface PairAdvice {
  verdict: "fine" | "caution" | "separate";
  text: string;
}

/** General guidance about using two ingredients together. */
export function pairAdvice(a: IngredientKnowledge, b: IngredientKnowledge): PairAdvice {
  if (a.key === b.key) return { verdict: "fine", text: `${a.name} is the same ingredient, so avoid stacking several ${a.name} products at once.` };
  const keys = new Set([a.key, b.key]);
  if (keys.has("niacinamide") && keys.has("vitamin-c")) {
    return { verdict: "fine", text: "Niacinamide and Vitamin C are commonly used together; the old advice to avoid the pair is largely outdated. If your skin gets flushed or irritated, use them at different times of day (Vitamin C in the morning, Niacinamide at night)." };
  }
  if (a.separateFrom.includes(b.key) || b.separateFrom.includes(a.key)) {
    return { verdict: "separate", text: `${a.name} and ${b.name} can be irritating together. A common approach is to use them on alternate nights or at different times of day, introduce one at a time, and patch-test first.` };
  }
  if (a.irritation >= 2 && b.irritation >= 2) {
    return { verdict: "caution", text: `${a.name} and ${b.name} are both stronger actives. Introduce one at a time and avoid layering them on the same night until your skin is comfortable with each.` };
  }
  return { verdict: "fine", text: `${a.name} and ${b.name} are generally compatible in the same routine. Introduce new products one at a time and patch-test.` };
}
