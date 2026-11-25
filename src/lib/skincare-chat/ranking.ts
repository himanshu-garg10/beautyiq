/**
 * Deterministic filtering and relevance scoring of catalog products against a skin profile.
 *
 * Hard filters (never overridden by the LLM): allergens/avoided ingredients, budget, category,
 * skin-type incompatibility, and "no verifiable relevance". Everything else is a weighted score.
 * Ingredient *presence* is used, never concentration: stronger is not treated as better.
 */
import {
  containsTerm,
  findKnowledgeForIngredient,
  normalizeText,
  resolveIngredientMention,
  termsForAllergen,
  type IngredientKnowledge,
} from "./ingredient-knowledge";
import type {
  CatalogProduct,
  ChatResponseMeta,
  ChatSkinProfile,
  DetailedSkinConcern,
  IngredientHighlight,
  ProductRecommendation,
  ScoreBreakdown,
} from "./types";

const RELATED: Record<string, Partial<Record<string, number>>> = {
  Acne: { Pimples: 0.9, Blackheads: 0.5, Whiteheads: 0.5, "Excess oil": 0.4 },
  Pimples: { Acne: 0.9, Blackheads: 0.5, Whiteheads: 0.5, "Excess oil": 0.4 },
  Blackheads: { Whiteheads: 0.7, Acne: 0.5, "Visible pores": 0.6 },
  Whiteheads: { Blackheads: 0.7, Acne: 0.5, "Visible pores": 0.5 },
  "Dark spots": { Hyperpigmentation: 0.9, "Acne marks": 0.7, "Uneven skin tone": 0.6, Tanning: 0.4 },
  Hyperpigmentation: { "Dark spots": 0.9, "Uneven skin tone": 0.7, "Acne marks": 0.6, Tanning: 0.6 },
  "Acne marks": { "Dark spots": 0.7, Hyperpigmentation: 0.6, "Uneven skin tone": 0.5 },
  "Uneven skin tone": { "Dark spots": 0.6, Hyperpigmentation: 0.7, Dullness: 0.4 },
  Tanning: { Hyperpigmentation: 0.6, "Dark spots": 0.4 },
  Dryness: { Dehydration: 0.7, "Rough texture": 0.4 },
  Dehydration: { Dryness: 0.7 },
  "Excess oil": { "Visible pores": 0.4, Acne: 0.3 },
  "Visible pores": { "Excess oil": 0.4, Blackheads: 0.5 },
  "Rough texture": { "Uneven texture": 0.9, Dryness: 0.3 },
  "Uneven texture": { "Rough texture": 0.9 },
  "Dark circles": { "Under eye puffiness": 0.4 },
  "Under eye puffiness": { "Dark circles": 0.4 },
  Dullness: { "Uneven skin tone": 0.4 },
};

const CONCERN_CATEGORIES: Record<string, string[]> = {
  Acne: ["Acne Focused Products", "Face Wash", "Serum", "Exfoliator", "Cleanser", "Treatment Products"],
  Pimples: ["Acne Focused Products", "Face Wash", "Serum", "Exfoliator", "Cleanser"],
  Blackheads: ["Face Wash", "Exfoliator", "Face Masks", "Serum"],
  Whiteheads: ["Face Wash", "Exfoliator", "Serum"],
  "Dark spots": ["Serum", "Sunscreen", "Treatment Products"],
  Hyperpigmentation: ["Serum", "Sunscreen", "Treatment Products"],
  "Acne marks": ["Serum", "Acne Focused Products", "Treatment Products", "Sunscreen"],
  "Uneven skin tone": ["Serum", "Sunscreen", "Treatment Products"],
  Tanning: ["Sunscreen", "Serum", "Exfoliator"],
  Dryness: ["Moisturizer", "Serum", "Toner", "Cleanser"],
  Dehydration: ["Moisturizer", "Serum", "Toner"],
  "Excess oil": ["Face Wash", "Serum", "Face Masks", "Moisturizer", "Toner"],
  "Visible pores": ["Face Wash", "Serum", "Face Masks", "Exfoliator", "Toner"],
  Dullness: ["Serum", "Exfoliator", "Toner", "Moisturizer"],
  Redness: ["Moisturizer", "Serum", "Cleanser", "Toner"],
  "Fine lines": ["Treatment Products", "Serum", "Eye Care", "Moisturizer"],
  "Dark circles": ["Eye Care"],
  "Under eye puffiness": ["Eye Care"],
  "Rough texture": ["Exfoliator", "Serum", "Moisturizer"],
  "Uneven texture": ["Exfoliator", "Serum"],
};

const SKIN_COMPAT: Record<string, Record<string, number>> = {
  Combination: { Oily: 0.6, Normal: 0.6, Dry: 0.5 },
  Oily: { Combination: 0.6 },
  Dry: { Normal: 0.5, Combination: 0.4 },
  Normal: { Combination: 0.6, Oily: 0.4, Dry: 0.4 },
  Sensitive: {},
};

const CLEANSING = new Set(["face wash", "cleanser"]);
export function sameCategory(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x === y || (CLEANSING.has(x) && CLEANSING.has(y));
}

export function skinTypeFit(userType: string | null, productTypes: string[]): number {
  if (!userType) return 0.5;
  if (!productTypes.length) return 0.4;
  const lower = productTypes.map((t) => t.toLowerCase());
  if (lower.includes(userType.toLowerCase())) return 1;
  if (lower.includes("all skin types") || lower.includes("all") || lower.length >= 5) return 0.8;
  let best = 0;
  for (const t of productTypes) best = Math.max(best, SKIN_COMPAT[userType]?.[t] ?? 0);
  return best;
}

interface IngredientMatch {
  ingredient: CatalogProduct["ingredients"][number];
  knowledge: IngredientKnowledge | null;
}

function knownIngredients(p: CatalogProduct): IngredientMatch[] {
  return p.ingredients.map((ingredient) => ({ ingredient, knowledge: findKnowledgeForIngredient(ingredient.name) }));
}

export function productHasIngredient(p: CatalogProduct, term: string): boolean {
  const terms = termsForAllergen(term);
  return p.ingredients.some((i) => terms.some((t) => containsTerm(i.name, t)));
}

export type AllergenVerdict = "clear" | "contains" | "unverifiable";

export function allergenVerdict(p: CatalogProduct, allergens: string[]): { verdict: AllergenVerdict; hit?: string } {
  for (const allergen of allergens) {
    const a = normalizeText(allergen);
    const isFragrance = /fragrance|parfum|perfume/.test(a) || termsForAllergen(a).includes("parfum") && /fragrance/.test(a);
    if (isFragrance && !p.fragranceFree) return { verdict: "contains", hit: allergen };
    if (productHasIngredient(p, a)) return { verdict: "contains", hit: allergen };
  }
  // Allergens given but we cannot read the ingredient list: do not claim it is safe.
  if (allergens.length && p.ingredients.length === 0) return { verdict: "unverifiable" };
  return { verdict: "clear" };
}

interface ConcernEvidence {
  concern: DetailedSkinConcern;
  weight: number;
  via: "product_listing" | "ingredient" | "related_concern";
  ingredient?: string;
}

function concernEvidence(p: CatalogProduct, concern: DetailedSkinConcern, matches: IngredientMatch[]): ConcernEvidence | null {
  const listed = p.targetConcerns.map((c) => c.toLowerCase());
  const best: ConcernEvidence[] = [];
  if (listed.includes(concern.toLowerCase())) best.push({ concern, weight: 1, via: "product_listing" });

  for (const { ingredient, knowledge } of matches) {
    const byKnowledge = knowledge?.helpsWith.includes(concern);
    const byCatalog = ingredient.concernTags?.some((t) => t.toLowerCase() === concern.toLowerCase());
    if (byKnowledge || byCatalog) {
      best.push({ concern, weight: ingredient.isKey ? 0.7 : 0.4, via: "ingredient", ingredient: ingredient.name });
    }
  }

  const rel = RELATED[concern] || {};
  for (const [other, w] of Object.entries(rel)) {
    if (listed.includes(other.toLowerCase())) best.push({ concern, weight: (w as number) * 0.7, via: "related_concern" });
  }
  if (!best.length) return null;
  return best.sort((a, b) => b.weight - a.weight)[0];
}

export interface ScoredProduct {
  product: CatalogProduct;
  score: ScoreBreakdown;
  evidence: ConcernEvidence[];
  coverage: number;
  fit: number;
  highlights: IngredientHighlight[];
  cautions: string[];
}

export interface RankOptions {
  limit?: number;
  /** Product must cost strictly less than this (used for "cheaper alternative"). */
  priceBelow?: number;
  excludeIds?: string[];
  /** When a category is requested, allow products with no listed focus on the concern (basics like a moisturizer). */
  relaxConcern?: boolean;
  /** Cap on products per category when no category was requested. */
  perCategoryCap?: number;
}

export interface RankResult {
  ranked: ScoredProduct[];
  excluded: ChatResponseMeta["excluded"];
  candidates: number;
}

export function scoreProduct(p: CatalogProduct, profile: ChatSkinProfile, relaxConcern = false): ScoredProduct | null {
  const matches = knownIngredients(p);
  const evidence = profile.concerns
    .map((c) => concernEvidence(p, c, matches))
    .filter((e): e is ConcernEvidence => e !== null);
  const coverage = profile.concerns.length
    ? profile.concerns.reduce((sum, c) => sum + (evidence.find((e) => e.concern === c)?.weight ?? 0), 0) / profile.concerns.length
    : 0.5;

  const hasPreferred = profile.preferredIngredients.some((pi) => {
    const k = resolveIngredientMention(pi);
    return p.ingredients.some((i) => (k ? findKnowledgeForIngredient(i.name)?.key === k.key : containsTerm(i.name, pi)));
  });

  if (profile.concerns.length && coverage === 0 && !relaxConcern && !hasPreferred) return null;

  const fit = skinTypeFit(profile.skinType, p.skinTypes);
  if (profile.skinType && p.skinTypes.length && fit === 0) return null;

  // Ingredient suitability for this skin type (presence-based; stronger actives are not rewarded).
  let ing = 8;
  const cautions: string[] = [];
  const helpful = new Set<string>();
  for (const { ingredient, knowledge } of matches) {
    if (!knowledge) continue;
    const helps = knowledge.helpsWith.some((c) => profile.concerns.includes(c));
    if (helps) helpful.add(knowledge.key);
    if (profile.skinType) {
      if (knowledge.suits.includes(profile.skinType) && helps) ing += 2;
      if (knowledge.caution.includes(profile.skinType) && (ingredient.isKey || knowledge.irritation >= 2)) {
        ing -= 4;
        cautions.push(`Contains ${knowledge.name}, which is a stronger active and can be too much for ${profile.skinType.toLowerCase()} skin. Introduce it slowly and patch-test first.`);
      } else if (profile.skinType === "Sensitive" && knowledge.irritation >= 2 && ingredient.isKey) {
        ing -= 2;
        cautions.push(`Contains ${knowledge.name}, a stronger active. Patch-test first if your skin is sensitive.`);
      }
    }
    if (profile.preferredIngredients.some((pi) => resolveIngredientMention(pi)?.key === knowledge.key)) ing += 3;
  }
  ing = Math.max(0, Math.min(15, ing));

  const priced = p.price !== null;
  const budget = profile.budgetMax ? (priced ? 10 : 0) : priced ? 6 : 0;

  let category = 5;
  if (profile.category) category = 10;
  else if (profile.concerns.length) {
    category = profile.concerns.some((c) => CONCERN_CATEGORIES[c]?.some((cat) => sameCategory(cat, p.category))) ? 10 : 3;
  }

  let dq = 0;
  if (p.isVerified) dq += 1.5;
  if (p.productStatus === "Complete") dq += 1;
  dq += (Math.min(100, Math.max(0, p.dataConfidence)) / 100) * 1.5;
  if (p.rating !== null) dq += (p.rating / 5) * 1;

  const score: ScoreBreakdown = {
    concern: round1(coverage * 40),
    skinType: round1(profile.skinType ? fit * 20 : 10),
    ingredients: round1(ing),
    budget,
    category,
    dataQuality: round1(dq),
    total: 0,
  };
  score.total = round1(score.concern + score.skinType + score.ingredients + score.budget + score.category + score.dataQuality);

  // Ingredients worth explaining: those on the label that are commonly used for the user's concerns first,
  // then the product's other key ingredients. One entry per ingredient ("Tea Tree" and "Tea Tree Leaf Oil" are one).
  const candidates = matches
    .filter((m) => m.knowledge && (m.ingredient.isKey || helpful.has(m.knowledge.key)))
    .map((m, order) => {
      const mine = profile.concerns.filter(
        (c) => m.knowledge!.helpsWith.includes(c) || m.ingredient.concernTags?.some((t) => t.toLowerCase() === c.toLowerCase())
      );
      // "acne" already covers "pimples" in wording; avoid listing both.
      return { m, mine: mine.includes("Acne") ? mine.filter((c) => c !== "Pimples") : mine, order };
    })
    .sort((a, b) => b.mine.length - a.mine.length || Number(b.m.ingredient.isKey) - Number(a.m.ingredient.isKey) || a.order - b.order);
  const highlights: IngredientHighlight[] = [];
  for (const { m, mine } of candidates) {
    if (highlights.length >= 4) break;
    if (highlights.some((h) => h.name === m.ingredient.name || (h.key && h.key === m.knowledge!.key))) continue;
    highlights.push({ name: m.ingredient.name, role: m.knowledge!.role, isKey: m.ingredient.isKey, key: m.knowledge!.key, helpsWith: mine, usage: m.knowledge!.usageNote });
  }

  if (!p.fragranceFree && profile.skinType === "Sensitive") cautions.push("Not listed as fragrance-free; fragrance can irritate sensitive skin.");
  if (p.ingredients.length > 0 && p.ingredients.length < 3) cautions.push("The catalog only has a partial ingredient list for this product; check the label.");
  if (!p.ingredients.length) cautions.push("No ingredient list is available in the catalog for this product.");
  if (!p.isVerified) cautions.push("Imported label data; suitability for your concern is not verified by BeautyIQ.");
  if (!priced) cautions.push("No verified price is available right now.");
  for (const w of p.warnings) cautions.push(w);

  return { product: p, score, evidence, coverage, fit, highlights, cautions: dedupe(cautions) };
}

export function rankProducts(products: CatalogProduct[], profile: ChatSkinProfile, opts: RankOptions = {}): RankResult {
  const excluded = { allergen: 0, budget: 0, unverifiedPrice: 0, irrelevant: 0, unverifiableIngredients: 0 };
  const exclude = new Set(opts.excludeIds || []);
  const scored: ScoredProduct[] = [];

  for (const p of products) {
    if (exclude.has(p.id)) continue;
    if (profile.category && !sameCategory(profile.category, p.category)) continue;

    const verdict = allergenVerdict(p, profile.allergens);
    if (verdict.verdict === "contains") { excluded.allergen++; continue; }
    if (verdict.verdict === "unverifiable") { excluded.unverifiableIngredients++; continue; }

    if (profile.budgetMax !== null || profile.budgetMin !== null || opts.priceBelow !== undefined) {
      if (!p.price) { excluded.unverifiedPrice++; continue; }
      if (profile.budgetMax !== null && p.price.amount > profile.budgetMax) { excluded.budget++; continue; }
      if (profile.budgetMin !== null && p.price.amount < profile.budgetMin) { excluded.budget++; continue; }
      if (opts.priceBelow !== undefined && p.price.amount >= opts.priceBelow) { excluded.budget++; continue; }
    }

    const s = scoreProduct(p, profile, opts.relaxConcern ?? Boolean(profile.category));
    if (!s) { excluded.irrelevant++; continue; }
    scored.push(s);
  }

  scored.sort(
    (a, b) =>
      b.score.total - a.score.total ||
      (b.product.rating ?? 0) - (a.product.rating ?? 0) ||
      (a.product.price?.amount ?? Infinity) - (b.product.price?.amount ?? Infinity) ||
      a.product.id.localeCompare(b.product.id)
  );

  const limit = opts.limit ?? 4;
  let ranked = scored;
  if (!profile.category) {
    const cap = opts.perCategoryCap ?? 2;
    const counts = new Map<string, number>();
    ranked = scored.filter((s) => {
      const key = s.product.category.toLowerCase();
      const n = counts.get(key) || 0;
      if (n >= cap) return false;
      counts.set(key, n + 1);
      return true;
    });
  }
  return { ranked: ranked.slice(0, limit), excluded, candidates: scored.length };
}

/** Short hook for the "why" text; the full "what it does" lives in the ingredient list under it. */
export function ingredientSentence(h: IngredientHighlight): string {
  return `It contains ${h.name}, which is commonly used for ${concernList(h.helpsWith.map((c) => c.toLowerCase()))}.`;
}

function concernList(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Build the response card for a scored product. All facts come from the catalog record. */
export function toRecommendation(s: ScoredProduct, profile: ChatSkinProfile): ProductRecommendation {
  const p = s.product;
  const lowerConcern = (c: string) => c.toLowerCase();
  const listed = s.evidence.filter((e) => e.via === "product_listing").map((e) => lowerConcern(e.concern));
  const viaIngredient = s.evidence.filter((e) => e.via === "ingredient");
  const related = s.evidence.filter((e) => e.via === "related_concern").map((e) => lowerConcern(e.concern));

  const sentences: string[] = [];
  if (listed.length) sentences.push(`BeautyIQ lists it for ${concernList(listed)}.`);
  // Explain what the most relevant label ingredients are generally used for, tied to the user's concerns.
  for (const h of s.highlights.filter((x) => x.helpsWith.length).slice(0, 2)) sentences.push(ingredientSentence(h));
  if (related.length && !listed.length && !viaIngredient.length) sentences.push(`Its listed focus is close to your ${concernList(related)} concern.`);
  if (!s.evidence.length) {
    sentences.push(`It is a ${p.category.toLowerCase()} for${profile.skinType ? ` ${profile.skinType.toLowerCase()}` : " your"} skin; the catalog does not list a specific focus on ${concernList(profile.concerns.map(lowerConcern)) || "your concern"}, so treat it as a supporting basic.`);
  }
  if (profile.skinType && p.skinTypes.length) {
    const exact = p.skinTypes.some((t) => t.toLowerCase() === profile.skinType!.toLowerCase());
    sentences.push(exact ? `It is listed for ${concernList(p.skinTypes.map(lowerConcern))} skin, which includes your ${profile.skinType.toLowerCase()} skin.` : `It is listed for ${concernList(p.skinTypes.map(lowerConcern))} skin (not specifically ${profile.skinType.toLowerCase()}).`);
  } else if (p.skinTypes.length) {
    sentences.push(`Listed for ${concernList(p.skinTypes.map(lowerConcern))} skin.`);
  }
  if (p.price && profile.budgetMax) sentences.push(`At ₹${p.price.amount.toLocaleString("en-IN")} it is within your ₹${profile.budgetMax.toLocaleString("en-IN")} budget.`);

  return {
    productId: p.id,
    name: p.name,
    brand: p.brand,
    category: String(p.category),
    image: p.image,
    price: p.price ? { amount: p.price.amount, currency: "INR", platform: p.price.platform, lastUpdated: p.price.lastUpdated } : null,
    rating: p.rating !== null ? { value: p.rating, count: p.reviewCount } : null,
    quantity: p.quantity,
    unit: p.unit,
    link: `/products/${encodeURIComponent(p.id)}`,
    relevantIngredients: s.highlights,
    matchedConcerns: s.evidence.map((e) => ({ concern: e.concern, via: e.via })),
    skinTypes: p.skinTypes,
    fragranceFree: p.fragranceFree,
    why: sentences.join(" "),
    cautions: s.cautions,
    score: s.score,
    priceVerified: p.price !== null,
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const dedupe = <T,>(a: T[]) => a.filter((v, i) => a.indexOf(v) === i);
