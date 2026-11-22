/**
 * Skin profile extraction and merging.
 *
 * Rule-based so it is deterministic, testable and works with no LLM configured. An LLM may add to
 * the result (see `engine.ts`) but its output goes through `sanitizeProfilePatch` first.
 */
import {
  EMPTY_PROFILE,
  type ChatSkinProfile,
  type DetailedSkinConcern,
  type RoutineStep,
  type SkinType,
} from "./types";
import { ALLERGEN_ALIASES, containsTerm, findIngredientsInText, normalizeText, resolveIngredientMention } from "./ingredient-knowledge";

export const SKIN_TYPES: SkinType[] = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];

export const CONCERNS: DetailedSkinConcern[] = [
  "Acne", "Pimples", "Blackheads", "Whiteheads", "Dark spots", "Acne marks", "Hyperpigmentation",
  "Uneven skin tone", "Dryness", "Dehydration", "Excess oil", "Dullness", "Redness", "Rough texture",
  "Visible pores", "Fine lines", "Tanning", "Dark circles", "Under eye puffiness", "Uneven texture",
];

export const CATEGORIES: RoutineStep[] = [
  "Face Wash", "Cleanser", "Serum", "Moisturizer", "Sunscreen", "Toner", "Exfoliator",
  "Acne Focused Products", "Face Masks", "Lip Care", "Eye Care", "Treatment Products",
];

const SKIN_TYPE_PATTERNS: { type: SkinType; re: RegExp }[] = [
  { type: "Combination", re: /\b(combination|combo|oily t[- ]?zone|dry cheeks and oily)\b|मिश्रित/i },
  { type: "Sensitive", re: /\b(sensitive|reactive|easily irritated|irritation[- ]prone|react(s)? to everything)\b|संवेदनशील/i },
  { type: "Oily", re: /\b(oily|oil[- ]prone|greasy|very oily|tel(i|ee)y?a?)\b|तैलीय/i },
  { type: "Dry", re: /\b(dry skin|dry[- ]skinned|very dry|flaky skin|sukh(i|ee)|rukh(i|ee))\b|शुष्क|रूखी/i },
  { type: "Normal", re: /\b(normal skin|normal[- ]skinned|balanced skin)\b/i },
];

const CONCERN_PATTERNS: { concerns: DetailedSkinConcern[]; re: RegExp }[] = [
  { concerns: ["Acne marks"], re: /\bacne (marks?|scars?|spots?)\b|\bpost[- ]?acne\b|\bpimple (marks?|scars?|spots?)\b|\bdaag\b|\bdaagh\b/i },
  { concerns: ["Acne", "Pimples"], re: /\bacne\b|\bbreakouts?\b|\bzits?\b|\bpimples?\b|\bphunsi(yan)?\b|\bmuhase\b|मुंहासे|\bacne[- ]prone\b/i },
  { concerns: ["Blackheads"], re: /\bblack ?heads?\b/i },
  { concerns: ["Whiteheads"], re: /\bwhite ?heads?\b|\bclogged pores?\b/i },
  { concerns: ["Dark spots"], re: /\bdark spots?\b|\bsun ?spots?\b|\bage spots?\b|\bspots\b|\bblemish marks?\b/i },
  { concerns: ["Hyperpigmentation"], re: /\bpigmentation\b|\bhyper-?pigmentation\b|\bmelasma\b|\bdark patch(es)?\b/i },
  { concerns: ["Uneven skin tone"], re: /\buneven (skin )?tone\b|\bpatchy\b|\buneven complexion\b/i },
  { concerns: ["Tanning"], re: /\btan(ning|ned)?\b|\bsun ?tan\b/i },
  { concerns: ["Dryness"], re: /\bdryness\b|\bdry patch(es)?\b|\bflak(y|ing)\b|\btight(ness)?\b|\brough and dry\b/i },
  { concerns: ["Dehydration"], re: /\bdehydrat(ed|ion)\b|\bthirsty skin\b/i },
  { concerns: ["Excess oil"], re: /\bexcess (oil|sebum)\b|\boiliness\b|\bshin(y|iness)\b|\bgreasy\b|\boily\b/i },
  { concerns: ["Dullness"], re: /\bdull(ness)?\b|\blifeless\b|\bno glow\b|\bglow\b|\bbrighten(ing)?\b|\bbright(er)? skin\b/i },
  { concerns: ["Redness"], re: /\bredness\b|\bred patch(es)?\b|\bflush(ed|ing)?\b|\birritat(ed|ion)\b|\binflam(ed|mation)\b/i },
  { concerns: ["Rough texture", "Uneven texture"], re: /\b(rough|bumpy|uneven) (skin )?texture\b|\brough skin\b|\bbumpy skin\b|\btexture\b/i },
  { concerns: ["Visible pores"], re: /\b(open|large|big|visible|enlarged) pores?\b|\bpores?\b/i },
  { concerns: ["Fine lines"], re: /\bageing\b|\baging\b|\banti[- ]?age?ing\b|\banti[- ]?aging\b|\bwrinkles?\b|\bfine lines?\b|\bfirmness\b|\bsagging\b/i },
  { concerns: ["Dark circles"], re: /\bdark circles?\b|\bunder[- ]?eye (darkness|circles)\b|\braccoon\b/i },
  { concerns: ["Under eye puffiness"], re: /\bpuff(y|iness)\b|\beye ?bags?\b|\bunder[- ]?eye puff(y|iness)?\b/i },
];

const CATEGORY_PATTERNS: { category: RoutineStep; re: RegExp }[] = [
  { category: "Sunscreen", re: /\bsun ?screens?\b|\bsun ?block\b|\bspf\b/i },
  { category: "Moisturizer", re: /\bmoisturi[sz]ers?\b|\bmoisturi[sz]ing cream\b|\bgel cream\b|\bface cream\b|\bhydrating cream\b|\bmoisturi[sz]ing\b/i },
  { category: "Serum", re: /\bserums?\b|\bessence\b|\bampoule\b/i },
  { category: "Face Wash", re: /\bface ?wash\b|\bfacial wash\b|\bfoaming wash\b/i },
  { category: "Cleanser", re: /\bcleansers?\b|\bcleansing\b/i },
  { category: "Toner", re: /\btoners?\b|\bface mist\b/i },
  { category: "Exfoliator", re: /\bexfoliat(or|ors|ing|e)\b|\bscrub\b|\bpeel(ing)?\b/i },
  { category: "Face Masks", re: /\b(face |clay |sheet )?masks?\b/i },
  { category: "Lip Care", re: /\blip (balm|care|mask|sleeping)\b|\blips\b/i },
  { category: "Eye Care", re: /\beye (cream|serum|gel|care)\b|\bunder[- ]?eye (cream|serum)\b/i },
  { category: "Acne Focused Products", re: /\bspot (treatment|gel|corrector)\b|\bacne (gel|patch|spot|treatment)\b/i },
  { category: "Treatment Products", re: /\btreatments?\b/i },
];

function isNegatedBefore(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 14), index);
  return /\b(not|no|n't|isn't|never|without|nahi|nahin)\s*(very |that |really )?$/i.test(before);
}

export function extractSkinType(text: string): SkinType | null {
  for (const { type, re } of SKIN_TYPE_PATTERNS) {
    const m = re.exec(text);
    if (m && !isNegatedBefore(text, m.index)) return type;
  }
  return null;
}

export function extractConcerns(text: string): DetailedSkinConcern[] {
  const found: DetailedSkinConcern[] = [];
  for (const { concerns, re } of CONCERN_PATTERNS) {
    const m = re.exec(text);
    if (!m || isNegatedBefore(text, m.index)) continue;
    // "oily skin" is a skin type here, not an "Excess oil" concern, unless oil/shine is described as a problem.
    if (concerns[0] === "Excess oil" && /^oily$/i.test(m[0]) && !/\b(oil control|shin|too oily|very oily|so oily)\b/i.test(text)) continue;
    // Bare "glow" is only a concern when the user asks for it.
    if (concerns[0] === "Dullness" && /^glow$/i.test(m[0]) && !/\b(want|need|get|for|more|add|give).{0,12}glow\b/i.test(text)) continue;
    for (const c of concerns) if (!found.includes(c)) found.push(c);
  }
  // "acne marks" should not also add plain Acne/Pimples unless acne is mentioned separately.
  if (found.includes("Acne marks") && !/\bacne\b(?! (marks?|scars?|spots?))|\bpimples?\b(?! (marks?|scars?|spots?))|\bbreakouts?\b/i.test(text)) {
    return found.filter((c) => c !== "Acne" && c !== "Pimples");
  }
  return found;
}

export function extractCategory(text: string): RoutineStep | null {
  for (const { category, re } of CATEGORY_PATTERNS) {
    if (re.test(text)) return category;
  }
  return null;
}

export interface BudgetRange { min: number | null; max: number | null }

function toNumber(raw: string, k?: string): number | null {
  const n = parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  const value = k ? n * 1000 : n;
  return value >= 50 && value <= 200000 ? Math.round(value) : null;
}

export function extractBudget(text: string): BudgetRange {
  const t = text.replace(/₹/g, " rs ").replace(/\binr\b/gi, " rs ").replace(/rupees?/gi, " rs ");
  const num = String.raw`(\d[\d,]*(?:\.\d+)?)\s*(k)?`;
  const cur = String.raw`(?:rs\.?\s*)?`;

  // Range: "500-800", "between 500 and 800", "rs 500 to rs 800"
  const range = new RegExp(String.raw`(?:between\s+)?${cur}${num}\s*(?:-|–|to|and)\s*${cur}${num}`, "i").exec(t);
  if (range && /(?:rs|budget|between|under|within|price|₹|\bmax)/i.test(t)) {
    const a = toNumber(range[1], range[2]);
    const b = toNumber(range[3], range[4]);
    if (a !== null && b !== null && Math.max(a, b) >= 50) return { min: Math.min(a, b), max: Math.max(a, b) };
  }

  const maxRe = new RegExp(String.raw`(?:under|below|within|upto|up to|less than|lesser than|not more than|no more than|max(?:imum)?(?: of)?|budget(?: is| of)?|around|about|nahi? se kam|tak)\s*${cur}${num}`, "i").exec(t);
  if (maxRe) {
    const v = toNumber(maxRe[1], maxRe[2]);
    if (v !== null) return { min: null, max: v };
  }

  const trailing = new RegExp(String.raw`${cur}${num}\s*(?:rs\.?)?\s*(?:or less|or below|max|maximum|ke andar|tak|budget)`, "i").exec(t);
  if (trailing) {
    const v = toNumber(trailing[1], trailing[2]);
    if (v !== null) return { min: null, max: v };
  }

  const over = new RegExp(String.raw`(?:over|above|more than|at least|minimum)\s*${cur}${num}`, "i").exec(t);
  if (over) {
    const v = toNumber(over[1], over[2]);
    if (v !== null) return { min: v, max: null };
  }

  return { min: null, max: null };
}

const NEG_LEAD = String.raw`(?:i am|i'm|im|i)?\s*`;
/** `strict` patterns only accept terms that resolve to a known ingredient/group; free text is too noisy ("no glow"). */
const ALLERGY_PATTERNS: { re: RegExp; strict: boolean }[] = [
  { re: new RegExp(String.raw`${NEG_LEAD}(?:am |is |are )?allergic (?:to|with)\s+([^.;!?\n]+)`, "gi"), strict: false },
  { re: new RegExp(String.raw`allerg(?:y|ies) (?:to|with|from|is|are)\s+([^.;!?\n]+)`, "gi"), strict: false },
  { re: new RegExp(String.raw`(?:sensitive|intolerant|reactive) to\s+([^.;!?\n]+)`, "gi"), strict: false },
  { re: new RegExp(String.raw`(?:react|breaks? out|get (?:a )?(?:rash|irritat\w*|redness))(?:s|ing)? (?:to|from|with|when i use)\s+([^.;!?\n]+)`, "gi"), strict: false },
  { re: new RegExp(String.raw`(?:avoid|avoiding|skip|stay away from|can'?t use|cannot use|dont want|don't want|do not want|exclude|nothing with)\s+(?:any\s+)?(?:products? (?:with|containing)\s+)?([^.;!?\n]+)`, "gi"), strict: true },
  { re: new RegExp(String.raw`(?:without|no|free of|free from)\s+([a-z][a-z \-]{2,40})`, "gi"), strict: true },
  { re: new RegExp(String.raw`([a-z][a-z\-]{2,25})[- ]free`, "gi"), strict: true },
];

const STOP_WORDS = new Set(["the", "a", "an", "any", "my", "your", "of", "with", "in", "on", "for", "and", "or", "products", "product", "skin", "stuff", "things", "anything", "ingredients", "ingredient", "side effects", "problem", "problems", "issue", "issues", "worry", "worries", "budget", "pimples", "acne", "oil", "oily", "it", "this", "that", "them", "cost", "extra", "many", "much", "more", "less", "too", "heavy", "greasy", "sticky", "white cast", "residue"]);

function splitAllergenList(raw: string): string[] {
  return raw
    .split(/,|\band\b|\bor\b|&|\/|\bbut\b|\bplease\b|\bthough\b|\bsince\b|\bbecause\b|\bwhen\b|\bwhile\b/i)
    .map((s) => normalizeText(s).replace(/^(any|all|the|my|products? (with|containing)|anything (with|containing))\s+/g, "").replace(/\s+(products?|ingredients?|skincare|allergy|allergies)$/g, "").trim())
    .filter((s) => s.length >= 3 && s.length <= 40 && !STOP_WORDS.has(s) && s.split(" ").length <= 3);
}

function canonicalAllergen(term: string): string {
  const knowledge = resolveIngredientMention(term);
  if (knowledge) return knowledge.name.toLowerCase();
  // Only fold spelling variants into a group; specific names ("lavender") stay as the user said them.
  for (const group of Object.keys(ALLERGEN_ALIASES)) if (term === group || term === `${group}s`) return group;
  if (/parfum|perfume|fragranc/.test(term)) return "fragrance";
  if (/sulphate|sulfate/.test(term)) return "sulfates";
  if (/paraben/.test(term)) return "parabens";
  return term;
}

export function extractAllergens(text: string): string[] {
  const found: string[] = [];
  for (const { re, strict } of ALLERGY_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      for (const raw of splitAllergenList(m[1])) {
        const canon = canonicalAllergen(raw);
        const known = Boolean(resolveIngredientMention(canon) || ALLERGEN_ALIASES[canon] || Object.values(ALLERGEN_ALIASES).some((terms) => terms.includes(canon)));
        const looksLikeIngredient = /^[a-z][a-z \-]*$/.test(canon) && canon.split(" ").length <= 3;
        if ((known || (!strict && looksLikeIngredient)) && !STOP_WORDS.has(canon) && !found.includes(canon)) found.push(canon);
      }
    }
  }
  return found;
}

export function extractCurrentProducts(text: string): string[] {
  const re = /(?:i (?:currently |already )?(?:use|am using|'m using|used)|i'm on|my routine (?:has|includes|is)|currently using)\s+([^.;!?\n]{3,80})/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const item = m[1].trim().replace(/\s+/g, " ");
    if (item && !out.includes(item)) out.push(item);
  }
  return out.slice(0, 5);
}

export function extractPreferredIngredients(text: string): string[] {
  const m = /(?:with|containing|that has|which has|having|contains|looking for|want|need)\s+([a-z0-9%\-+ ,&]{3,80})/i.exec(text);
  if (!m) return [];
  return findIngredientsInText(m[1]).map((k) => k.name);
}

export interface ProfilePatch {
  skinType?: SkinType | null;
  concerns?: DetailedSkinConcern[];
  budgetMax?: number | null;
  budgetMin?: number | null;
  allergens?: string[];
  preferredIngredients?: string[];
  currentProducts?: string[];
  category?: RoutineStep | null;
}

/** Everything we can read from one user message with rules alone. */
export function extractProfileFromMessage(message: string): ProfilePatch {
  const budget = extractBudget(message);
  const allergens = extractAllergens(message);
  const patch: ProfilePatch = {};

  const skinType = extractSkinType(message);
  if (skinType) patch.skinType = skinType;

  const concerns = extractConcerns(message);
  if (concerns.length) patch.concerns = concerns;

  if (budget.max !== null) patch.budgetMax = budget.max;
  if (budget.min !== null) patch.budgetMin = budget.min;
  if (allergens.length) patch.allergens = allergens;

  const category = extractCategory(message);
  if (category) patch.category = category;

  // Ingredients named as allergens must not also become preferences.
  const preferred = extractPreferredIngredients(message).filter(
    (name) => !allergens.some((a) => normalizeText(name).includes(a) || a.includes(normalizeText(name)))
  );
  if (preferred.length) patch.preferredIngredients = preferred;

  const current = extractCurrentProducts(message);
  if (current.length) patch.currentProducts = current;
  return patch;
}

const uniq = <T,>(arr: T[]) => arr.filter((v, i) => arr.indexOf(v) === i);

/**
 * Merge new information into the stored profile. Scalars the user restates replace the old value;
 * lists accumulate so the user never has to repeat an allergy.
 */
export function mergeProfile(base: ChatSkinProfile, patch: ProfilePatch): ChatSkinProfile {
  return {
    skinType: patch.skinType !== undefined && patch.skinType !== null ? patch.skinType : base.skinType,
    concerns: uniq([...(base.concerns || []), ...(patch.concerns || [])]).slice(0, 8),
    budgetMax: patch.budgetMax !== undefined && patch.budgetMax !== null ? patch.budgetMax : base.budgetMax,
    budgetMin: patch.budgetMin !== undefined && patch.budgetMin !== null ? patch.budgetMin : base.budgetMin,
    allergens: uniq([...(base.allergens || []), ...(patch.allergens || [])]).slice(0, 12),
    preferredIngredients: uniq([...(base.preferredIngredients || []), ...(patch.preferredIngredients || [])]).slice(0, 6),
    currentProducts: uniq([...(base.currentProducts || []), ...(patch.currentProducts || [])]).slice(0, 5),
    category: patch.category !== undefined && patch.category !== null ? patch.category : base.category,
  };
}

/** Validate a profile that arrived from the client or an LLM: enums only, bounded lists. */
export function sanitizeProfile(input: unknown): ChatSkinProfile {
  const p = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const strList = (v: unknown, max: number, maxLen = 40) =>
    Array.isArray(v)
      ? uniq(v.filter((x): x is string => typeof x === "string").map((x) => x.trim().slice(0, maxLen)).filter(Boolean)).slice(0, max)
      : [];
  const money = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 && v <= 200000 ? Math.round(v) : null);
  return {
    ...EMPTY_PROFILE,
    skinType: SKIN_TYPES.includes(p.skinType as SkinType) ? (p.skinType as SkinType) : null,
    concerns: (Array.isArray(p.concerns) ? p.concerns : []).filter((c): c is DetailedSkinConcern => CONCERNS.includes(c as DetailedSkinConcern)).slice(0, 8),
    budgetMax: money(p.budgetMax),
    budgetMin: money(p.budgetMin),
    allergens: strList(p.allergens, 12).map((s) => normalizeText(s)),
    preferredIngredients: strList(p.preferredIngredients, 6),
    currentProducts: strList(p.currentProducts, 5, 80),
    category: CATEGORIES.includes(p.category as RoutineStep) ? (p.category as RoutineStep) : null,
  };
}

/** Same as sanitizeProfile but keeps only the keys that were present (for LLM-extracted patches). */
export function sanitizeProfilePatch(input: unknown): ProfilePatch {
  if (!input || typeof input !== "object") return {};
  const raw = input as Record<string, unknown>;
  const clean = sanitizeProfile(raw);
  const patch: ProfilePatch = {};
  if (clean.skinType) patch.skinType = clean.skinType;
  if (clean.concerns.length) patch.concerns = clean.concerns;
  if (clean.budgetMax !== null) patch.budgetMax = clean.budgetMax;
  if (clean.budgetMin !== null) patch.budgetMin = clean.budgetMin;
  if (clean.allergens.length) patch.allergens = clean.allergens;
  if (clean.preferredIngredients.length) patch.preferredIngredients = clean.preferredIngredients;
  if (clean.currentProducts.length) patch.currentProducts = clean.currentProducts;
  if (clean.category) patch.category = clean.category;
  return patch;
}

export function profileIsEmpty(p: ChatSkinProfile): boolean {
  return !p.skinType && p.concerns.length === 0 && !p.category && p.preferredIngredients.length === 0;
}

export function describeProfile(p: ChatSkinProfile): string {
  const parts: string[] = [];
  if (p.skinType) parts.push(`${p.skinType.toLowerCase()} skin`);
  const shown = p.concerns.filter((c) => !(c === "Pimples" && p.concerns.includes("Acne")));
  if (shown.length) parts.push(shown.map((c) => c.toLowerCase()).join(", "));
  if (p.budgetMax) parts.push(`under ₹${p.budgetMax.toLocaleString("en-IN")}`);
  if (p.allergens.length) parts.push(`avoiding ${p.allergens.join(", ")}`);
  return parts.join(" · ");
}

export { containsTerm };
