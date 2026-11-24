/**
 * Orchestrates one chat turn:
 *   message → profile update → intent → catalog retrieval + ranking → structured response.
 *
 * Product data only ever flows catalog → response. The optional LLM can (1) help read the
 * message and (2) rewrite the reply text; its rewrite is discarded if it mentions prices,
 * products, ingredients or medical claims that the verified draft does not support.
 */
import { getDefaultCatalog } from "./catalog";
import {
  findIngredientsInText,
  normalizeText,
  pairAdvice,
  resolveIngredientMention,
} from "./ingredient-knowledge";
import { getLLMProvider, type LLMProvider } from "./llm";
import {
  allergenVerdict,
  rankProducts,
  sameCategory,
  scoreProduct,
  skinTypeFit,
  toRecommendation,
  type ScoredProduct,
} from "./ranking";
import {
  describeProfile,
  extractCategory,
  extractProfileFromMessage,
  extractSkinType,
  mergeProfile,
  profileIsEmpty,
  sanitizeProfile,
  sanitizeProfilePatch,
  type ProfilePatch,
} from "./skin-profile";
import type {
  CatalogProduct,
  CatalogProvider,
  ChatComparison,
  ChatIntent,
  ChatRequest,
  ChatResponse,
  ChatSkinProfile,
  ChatTurn,
  ProductRecommendation,
  RoutineSlot,
} from "./types";

export interface EngineDeps {
  catalog?: CatalogProvider;
  /** Pass null to force rule-based mode; undefined uses the configured provider. */
  llm?: LLMProvider | null;
}

const MAX_MESSAGE = 800;
const CLINICAL = /\b(eczema|dermatitis|psoriasis|rosacea|cystic|severe|bleeding|infect(ed|ion)|pus|painful|hives|fungal|melanoma|wound|burn|isotretinoin|accutane|tretinoin|hydroquinone|steroid)\b/i;

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const lower = (s: string) => s.toLowerCase();
const joinList = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

// ---------------------------------------------------------------- intent

export function detectIntent(message: string, patch: ProfilePatch, hasLast: boolean, profile: ChatSkinProfile): ChatIntent {
  const m = message.toLowerCase().trim();
  const mentionsIngredient = findIngredientsInText(m).length > 0;
  if (/^(hi+|hello+|hey+|namaste|hola|good (morning|evening|afternoon))\b[\s!.,]*$/.test(m)) return "greeting";
  if (/\broutine\b|\bregimen\b|\bstep[- ]by[- ]step\b|\bmorning (skincare|skin care|steps)\b|\bnight (skincare|skin care|steps)\b/.test(m)) return "routine";
  if (/\bcompare\b|\bversus\b|\bvs\.?\b|\bdifference between\b|\bwhich (one )?is better\b|\bwhich should i (pick|choose|buy)\b/.test(m)) return "compare";
  if (/\bcheaper\b|\bless expensive\b|\blower price\b|\bmore affordable\b|\bbudget[- ]friendly (option|alternative)\b|\bcheap(er)? (option|alternative)\b|\balternative\b/.test(m)) return "cheaper_alternative";
  // "What will the ingredients in it do?" / "what is in this?" about a product that was just shown.
  if (hasLast && (/\b(ingredients?|components?)\b.{0,40}\b(do|does|work|works|help|helps|benefit|benefits|used for)\b|\bwhat (will|does|do|is|are)\b.{0,25}\b(ingredients?|components?)\b|\bwhat(?:'s| is) in (it|this|that|these|them)\b/.test(m))) return "explain";
  if (/\bwhy\b.*\b(recommend|suggest|pick|choose|chose|show)/.test(m) || /\bhow does (it|this|that)\b.*\bhelp\b|\bwhy (this|that|is this)\b/.test(m)) return "explain";
  if (/\b(can|could|should|may)\s+i\s+(use|layer|mix|combine|apply|pair)\b|\b(use|layer|mix|combine)\b.*\b(with|together|alongside|along with)\b/.test(m) && mentionsIngredient) return "ingredient_compat";
  if (/\b(suitable|safe|okay|ok|good|fine|right|work)\b.*\bfor\b|\bis (this|it|that)\b.*\b(suitable|safe)\b/.test(m) && (hasLast || extractSkinType(m)) && /\b(this|it|that|these|serum|moisturi[sz]er|cleanser|face ?wash|sunscreen|toner|product)\b/.test(m)) return "suitability";
  if (/\b(what is|what's|what are|tell me about|explain|benefits of|what does)\b/.test(m) && mentionsIngredient && !/\brecommend|suggest|show me\b/.test(m)) return "ingredient_info";
  if (hasLast && patch.category && /\binstead\b|\brather\b|\bswitch\b|\bhow about\b|\bwhat about\b|\bnow\b|\balso\b/.test(m)) return "category_switch";
  const hasInfo = Boolean(patch.skinType || patch.concerns?.length || patch.category || patch.preferredIngredients?.length || patch.budgetMax || patch.budgetMin);
  if (hasInfo || /\brecommend|\bsuggest|\bshow me\b|\bfind\b|\bneed\b|\blooking for\b|\bwant\b|\bbest\b|\bproducts?\b/.test(m)) {
    return profileIsEmpty(profile) && !hasInfo ? "need_info" : "recommend";
  }
  if (patch.allergens?.length && !profileIsEmpty(profile)) return "recommend";
  return profileIsEmpty(profile) ? "need_info" : "other";
}

// ---------------------------------------------------------------- product references

const GENERIC = new Set(["the", "and", "for", "with", "face", "skin", "gel", "cream", "daily", "new", "pro"]);
const tokens = (s: string) => normalizeText(s).replace(/[^a-z0-9% ]/g, " ").split(" ").filter((t) => t.length > 2 && !GENERIC.has(t));

export function resolveReferences(message: string, products: CatalogProduct[], lastIds: string[]): CatalogProduct[] {
  const m = normalizeText(message);
  const msgTokens = new Set(tokens(m));
  const named: { p: CatalogProduct; at: number }[] = [];
  for (const p of products) {
    const nameTokens = tokens(p.name);
    const hit = nameTokens.filter((t) => msgTokens.has(t)).length;
    const full = m.includes(normalizeText(p.name));
    const brandAndType = m.includes(normalizeText(p.brand)) && (extractCategory(m) ? sameCategory(extractCategory(m)!, p.category) : false);
    if (full || (nameTokens.length >= 2 && hit / nameTokens.length >= 0.6 && hit >= 2) || brandAndType) {
      named.push({ p, at: full ? m.indexOf(normalizeText(p.name)) : 1000 });
    }
  }
  if (named.length) return named.sort((a, b) => a.at - b.at).map((n) => n.p).slice(0, 3);

  const last = lastIds.map((id) => products.find((p) => p.id === id)).filter((p): p is CatalogProduct => Boolean(p));
  if (!last.length) return [];
  if (/\b(both|these two|the two|two of them)\b/.test(m)) return last.slice(0, 2);
  const ordinal: [RegExp, number][] = [[/\b(first|1st|top|number one|#1)\b/, 0], [/\b(second|2nd)\b/, 1], [/\b(third|3rd)\b/, 2], [/\b(fourth|4th)\b/, 3]];
  for (const [re, i] of ordinal) if (re.test(m) && last[i]) return [last[i]];
  const cat = extractCategory(m);
  if (cat) {
    const byCat = last.filter((p) => sameCategory(cat, p.category));
    if (byCat.length) return [byCat[0]];
  }
  return [last[0]];
}

// ---------------------------------------------------------------- helpers

function profileForCard(profile: ChatSkinProfile, overrides: Partial<ChatSkinProfile> = {}): ChatSkinProfile {
  return { ...profile, ...overrides };
}

function cardsFor(scored: ScoredProduct[], profile: ChatSkinProfile): ProductRecommendation[] {
  return scored.map((s) => toRecommendation(s, profile));
}

/** Score an arbitrary product for display even when it would not pass the hard filters (e.g. user asked about it by name). */
function scoreForDisplay(p: CatalogProduct, profile: ChatSkinProfile): ProductRecommendation {
  const s = scoreProduct(p, { ...profile, category: null }, true) || scoreProduct(p, { ...profile, skinType: null, category: null }, true)!;
  return toRecommendation(s, profile);
}

function notices(profile: ChatSkinProfile, userText: string, recs: ProductRecommendation[]): string[] {
  const out: string[] = [];
  if (recs.length) {
    out.push("Names, prices, ingredients and ratings shown come from the BeautyIQ catalog. What an ingredient is generally used for is general skincare guidance, not a claim about a specific product.");
  }
  if (profile.allergens.length) out.push("Ingredient lists in the catalog may not be complete, so always check the product label against your allergies.");
  if (CLINICAL.test(userText) || profile.concerns.some((c) => c === "Acne" || c === "Pimples")) {
    out.push(CLINICAL.test(userText)
      ? "What you describe may need a professional opinion. Please see a dermatologist; cosmetic products are not a treatment for medical skin conditions."
      : "If acne is persistent, painful, scarring or getting worse, please consult a dermatologist. Cosmetic products support skin care; they do not treat medical conditions.");
  }
  return out;
}

function followUpsFor(intent: ChatIntent, profile: ChatSkinProfile, recs: ProductRecommendation[]): string[] {
  if (intent === "need_info" || intent === "greeting") {
    return ["I have oily skin with acne and dark spots", "Dry, sensitive skin — I need hydration", "Sunscreen for oily skin under ₹800"];
  }
  const out: string[] = [];
  if (recs.length) {
    out.push(`Why did you recommend the ${lower(recs[0].category)}?`);
    if (recs.length > 1) out.push("Compare the top two");
    out.push("Suggest a cheaper alternative");
  }
  out.push("Give me a basic morning routine");
  const other = ["Moisturizer", "Sunscreen", "Serum"].find((c) => !profile.category || !sameCategory(c, profile.category));
  if (other) out.push(`Can you recommend a ${lower(other)} instead?`);
  if (!profile.skinType) out.push("My skin type is combination");
  return out.slice(0, 5);
}

const emptyExcluded = () => ({ allergen: 0, budget: 0, unverifiedPrice: 0, irrelevant: 0, unverifiableIngredients: 0 });

// ---------------------------------------------------------------- no-match explanation

function explainNoMatch(products: CatalogProduct[], profile: ChatSkinProfile, excluded: ReturnType<typeof emptyExcluded>, extra?: { priceBelow?: number }) {
  const reasons: string[] = [];
  if (excluded.allergen) reasons.push(`${excluded.allergen} product${excluded.allergen > 1 ? "s were" : " was"} excluded because ${excluded.allergen > 1 ? "they contain" : "it contains"} or may contain ${joinList(profile.allergens)}`);
  if (excluded.unverifiableIngredients) reasons.push(`${excluded.unverifiableIngredients} had no ingredient list, so I could not confirm they avoid ${joinList(profile.allergens)}`);
  if (excluded.budget) reasons.push(`${excluded.budget} ${profile.budgetMax ? `cost more than ${inr(profile.budgetMax)}` : "were outside your price range"}`);
  if (excluded.unverifiedPrice) reasons.push(`${excluded.unverifiedPrice} have no verified price`);
  const suggestions: string[] = [];
  // Relax the budget only to tell the user what exists; we never put an over-budget product forward as a match.
  if (profile.budgetMax !== null) {
    const relaxed = rankProducts(products, { ...profile, budgetMax: null, budgetMin: null }, { limit: 1 });
    const top = relaxed.ranked[0]?.product;
    if (top?.price) suggestions.push(`The closest verified match above your budget starts at ${inr(top.price.amount)}. Tell me if you can stretch the budget and I will show it.`);
  }
  if (profile.category) suggestions.push("Try a different product type (for example a serum or a moisturizer).");
  if (profile.concerns.length > 1) suggestions.push("Tell me which concern matters most and I will focus on that one.");
  if (profile.allergens.length) suggestions.push("I will keep your avoided ingredients excluded; tell me if any of them are only a preference.");
  const why = reasons.length ? ` (${reasons.join("; ")})` : "";
  const target = describeProfile(profile) || "that request";
  return {
    reason: `I could not find a verified match in the BeautyIQ catalog for ${target}${why}${extra?.priceBelow ? "" : ""}. I would rather say so than suggest something that is not a real, suitable product.`,
    suggestions,
  };
}

// ---------------------------------------------------------------- reply composition (deterministic)

function recommendReply(profile: ChatSkinProfile, recs: ProductRecommendation[], intent: ChatIntent): string {
  const who = describeProfile({ ...profile, allergens: [], budgetMax: null });
  const lead = who ? `For ${who}` : "Based on what you told me";
  const budget = profile.budgetMax ? ` within ${inr(profile.budgetMax)}` : "";
  const lines = recs.map((r, i) => `${i + 1}. ${r.brand} ${r.name}${r.price ? ` (${inr(r.price.amount)})` : ""}: ${shortWhy(r)}`);
  const tail: string[] = [];
  if (profile.allergens.length) tail.push(`I excluded anything listing ${joinList(profile.allergens)}.`);
  if (!profile.skinType) tail.push("Tell me your skin type (oily, dry, combination, normal or sensitive) and I can refine this.");
  else if (intent !== "category_switch" && !profile.budgetMax) tail.push("If you have a budget in mind, tell me and I will filter by it.");
  tail.push('Ask "what will the ingredients do?" for a closer look at any of them.');
  return `${lead}, I found ${recs.length} real product${recs.length > 1 ? "s" : ""} in the BeautyIQ catalog${budget}, ranked by how well they fit:\n${lines.join("\n")}\n${tail.join(" ")}`;
}

/** One-sentence reason for the chat bubble: concern fit plus what the top ingredient does. */
function shortWhy(r: ProductRecommendation): string {
  const listed = r.matchedConcerns.filter((c) => c.via === "product_listing").map((c) => c.concern.toLowerCase());
  const parts: string[] = [];
  if (listed.length) parts.push(`listed for ${joinList(listed)}`);
  const h = r.relevantIngredients[0];
  if (h) parts.push(`contains ${h.name}, ${h.role}${h.helpsWith.length ? `, relevant to your ${joinList(h.helpsWith.map((c) => c.toLowerCase()))}` : ""}`);
  if (!parts.length) parts.push(r.why.split(". ")[0].replace(/\.$/, ""));
  return parts.join("; ") + ".";
}

function ingredientInfoReply(keys: ReturnType<typeof findIngredientsInText>): string {
  return keys.slice(0, 3).map((k) => `${k.name} is ${k.role}.${k.usageNote ? ` ${k.usageNote}` : ""}`).join(" ") + " This is general skincare guidance, not a claim about a specific product.";
}

// ---------------------------------------------------------------- LLM guard

const BANNED_CLAIMS = /\b(cures?|cured|heals?|treats?|treatment for|guarantee[ds]?|diagnos\w*|clinically proven|permanent(ly)?)\b/i;

export function validateLLMReply(text: unknown, ctx: { draft: string; userMessage: string; featured: ProductRecommendation[]; profile: ChatSkinProfile; catalog: CatalogProduct[] }): string | null {
  if (typeof text !== "string") return null;
  const reply = text.trim();
  if (reply.length < 20 || reply.length > 1400) return null;
  if (BANNED_CLAIMS.test(reply) && !BANNED_CLAIMS.test(ctx.draft)) return null;

  // Prices: every rupee amount must be a verified price or the user's own budget.
  const allowed = new Set<number>();
  for (const r of ctx.featured) if (r.price) allowed.add(Math.round(r.price.amount));
  for (const n of [ctx.profile.budgetMax, ctx.profile.budgetMin]) if (n) allowed.add(n);
  for (const m of (ctx.draft + " " + ctx.userMessage).matchAll(/(?:₹|rs\.?\s*)\s*([\d,]+)/gi)) allowed.add(Number(m[1].replace(/,/g, "")));
  for (const m of reply.matchAll(/(?:₹|rs\.?\s*|inr\s*)\s*([\d,]+(?:\.\d+)?)/gi)) {
    if (!allowed.has(Math.round(Number(m[1].replace(/,/g, ""))))) return null;
  }

  // Products: do not name any catalog product that is not being shown.
  const shown = new Set(ctx.featured.map((r) => r.productId));
  const replyNorm = normalizeText(reply);
  for (const p of ctx.catalog) {
    if (shown.has(p.id)) continue;
    const n = normalizeText(p.name);
    if (n.length > 8 && replyNorm.includes(n)) return null;
  }

  // Ingredients: do not introduce ingredients absent from the verified draft or the user's own message.
  const known = new Set([...findIngredientsInText(ctx.draft), ...findIngredientsInText(ctx.userMessage)].map((k) => k.key));
  for (const k of findIngredientsInText(reply)) if (!known.has(k.key)) return null;
  return reply;
}

async function polishWithLLM(llm: LLMProvider, args: { draft: string; intent: ChatIntent; userMessage: string; history: ChatTurn[]; featured: ProductRecommendation[]; profile: ChatSkinProfile; catalog: CatalogProduct[] }): Promise<string | null> {
  const facts = args.featured.map((r) => ({
    name: `${r.brand} ${r.name}`,
    price: r.price ? inr(r.price.amount) : "price not verified",
    category: r.category,
    ingredients_on_label: r.relevantIngredients.map((i) => i.name),
    reason: r.why,
  }));
  const out = (await llm.generateJson({
    system:
      "You are BeautyIQ's skincare shopping assistant. Rewrite the DRAFT reply so it sounds warm and natural. Keep EVERY product's explanation and every ingredient explanation from the draft, and keep the line breaks and numbered list (max 220 words). " +
      "Rules: use ONLY the facts in the draft and the product list; do not add products, prices, ingredients, ratings, links or benefits; " +
      "keep every product name and ₹ price exactly as given; never say a product cures, treats or heals anything; " +
      "never diagnose; cosmetic wording only (\"may help\", \"commonly used for\"). Reply as JSON: {\"reply\": \"...\"}.",
    user: JSON.stringify({ intent: args.intent, user_message: args.userMessage, recent_conversation: args.history.slice(-4), draft: args.draft, products: facts }),
    maxTokens: 500,
  })) as { reply?: unknown } | null;
  return validateLLMReply(out?.reply, { draft: args.draft, userMessage: args.userMessage, featured: args.featured, profile: args.profile, catalog: args.catalog });
}

async function llmUnderstand(llm: LLMProvider, message: string, profile: ChatSkinProfile): Promise<ProfilePatch> {
  const out = await llm.generateJson({
    system:
      "Extract skincare shopping details from the user's message (English, Hindi or Hinglish). Return JSON with keys: " +
      "skinType (Oily|Dry|Combination|Normal|Sensitive|null), concerns (array from: Acne, Pimples, Blackheads, Whiteheads, Dark spots, Acne marks, Hyperpigmentation, Uneven skin tone, Dryness, Dehydration, Excess oil, Dullness, Redness, Rough texture, Visible pores, Fine lines, Tanning, Dark circles, Under eye puffiness, Uneven texture), " +
      "budgetMax (rupees as a number or null), allergens (ingredients the user says they are allergic/sensitive to or want to avoid), " +
      "category (Face Wash|Cleanser|Serum|Moisturizer|Sunscreen|Toner|Exfoliator|Acne Focused Products|Face Masks|Lip Care|Eye Care|Treatment Products|null), preferredIngredients (array). " +
      "Only include what the user explicitly states. Do not guess or diagnose.",
    user: JSON.stringify({ message, already_known: profile }),
    maxTokens: 300,
  });
  const patch = sanitizeProfilePatch(out);
  // The LLM may only report a budget that actually appears in the message.
  if (patch.budgetMax && !message.replace(/,/g, "").includes(String(patch.budgetMax)) && !/\d\s*k\b/i.test(message)) delete patch.budgetMax;
  delete patch.budgetMin;
  delete patch.currentProducts;
  return patch;
}

// ---------------------------------------------------------------- main entry

function cleanHistory(history: unknown): ChatTurn[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter((t): t is ChatTurn => !!t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
    .slice(-8)
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_MESSAGE) }));
}

export async function handleChatTurn(req: ChatRequest, deps: EngineDeps = {}): Promise<ChatResponse> {
  const catalogProvider = deps.catalog ?? getDefaultCatalog();
  const llm = deps.llm === undefined ? getLLMProvider() : deps.llm;
  const products = await catalogProvider.getProducts();

  const message = String(req.message ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE);
  const history = cleanHistory(req.history);
  const knownIds = new Set(products.map((p) => p.id));
  const lastIds = (Array.isArray(req.lastProductIds) ? req.lastProductIds : []).filter((id): id is string => typeof id === "string" && knownIds.has(id)).slice(0, 8);

  const base = sanitizeProfile(req.profile);
  let patch = extractProfileFromMessage(message);
  const nonLatin = /[^\u0000-ɏ]/.test(message);
  let llmUsed = false;
  if (llm && message && ((Object.keys(patch).length === 0 && message.split(" ").length >= 3) || nonLatin)) {
    const extra = await llmUnderstand(llm, message, base);
    if (Object.keys(extra).length) {
      llmUsed = true;
      patch = {
        ...extra,
        ...patch,
        concerns: [...(patch.concerns || []), ...(extra.concerns || [])],
        allergens: [...(patch.allergens || []), ...(extra.allergens || [])],
        preferredIngredients: [...(patch.preferredIngredients || []), ...(extra.preferredIngredients || [])],
      };
    }
  }

  const intent = detectIntent(message, patch, lastIds.length > 0, base);
  // Questions about an existing product should not change what the user is shopping for.
  const shoppingIntents: ChatIntent[] = ["recommend", "category_switch", "need_info", "greeting", "other", "routine"];
  const profile = shoppingIntents.includes(intent)
    ? mergeProfile(base, patch)
    : mergeProfile(base, { allergens: patch.allergens }); // hypothetical skin types/concerns in a question must not overwrite the saved profile

  const meta = { provider: llm?.name ?? "rule-based", llmUsed: false, catalog: catalogProvider.name, catalogSize: products.length, candidates: 0, excluded: emptyExcluded() };
  const out: ChatResponse = {
    success: true, reply: "", intent, profile, recommendations: [], comparison: null, routine: null, noMatch: null, followUps: [], notices: [], meta,
  };

  switch (intent) {
    case "greeting":
      out.reply = "Hi, I'm BeautyIQ. Tell me your skin type and what you'd like to improve (acne, dark spots, dryness...), plus a budget if you have one, and I'll find real products from our catalog that fit.";
      break;

    case "need_info":
    case "other":
      out.reply = intent === "need_info"
        ? "I can help with that. What's your skin type (oily, dry, combination, normal or sensitive), and what's your main concern? A budget helps too, but isn't required."
        : "I can recommend products, explain why I picked them, compare two, suggest a cheaper alternative, or put together a basic routine. What would you like?";
      break;

    case "ingredient_info": {
      const keys = findIngredientsInText(message);
      out.reply = ingredientInfoReply(keys);
      const withIt = products.filter((p) => keys.some((k) => p.ingredients.some((i) => resolveIngredientMention(i.name)?.key === k.key)));
      const r = rankProducts(withIt, { ...profile, category: null }, { limit: 3, relaxConcern: true });
      meta.excluded = r.excluded;
      meta.candidates = r.candidates;
      if (r.ranked.length) {
        out.recommendations = cardsFor(r.ranked, profile);
        out.reply += ` Catalog products that list ${joinList(keys.map((k) => k.name))}:`;
      }
      break;
    }

    case "routine": {
      const night = /\bnight|\bpm\b|\bevening|\bbedtime/.test(lower(message)) && !/\bmorning|\bam\b/.test(lower(message));
      const slots: { step: string; categories: string[]; guidance: string }[] = night
        ? [
            { step: "Cleanse", categories: ["Face Wash", "Cleanser"], guidance: "Remove sunscreen, oil and dirt with a gentle cleanser." },
            { step: "Treat", categories: ["Serum", "Treatment Products"], guidance: "One targeted product for your main concern. Add strong actives slowly." },
            { step: "Moisturize", categories: ["Moisturizer"], guidance: "A moisturizer suited to your skin type to finish." },
          ]
        : [
            { step: "Cleanse", categories: ["Face Wash", "Cleanser"], guidance: "A gentle cleanser; avoid over-washing." },
            { step: "Treat", categories: ["Serum"], guidance: "A serum aimed at your main concern (optional at first)." },
            { step: "Moisturize", categories: ["Moisturizer"], guidance: "Lightweight hydration, even for oily skin." },
            { step: "Protect", categories: ["Sunscreen"], guidance: "Sunscreen every morning; it is the most important step for dark spots and tanning." },
          ];
      const routine: RoutineSlot[] = [];
      const used: string[] = [];
      for (const slot of slots) {
        let pick: ScoredProduct | undefined;
        for (const cat of slot.categories) {
          const r = rankProducts(products, { ...profile, category: cat as ChatSkinProfile["category"] }, { limit: 1, excludeIds: used, relaxConcern: true });
          meta.excluded = { allergen: meta.excluded.allergen + r.excluded.allergen, budget: meta.excluded.budget + r.excluded.budget, unverifiedPrice: meta.excluded.unverifiedPrice + r.excluded.unverifiedPrice, irrelevant: meta.excluded.irrelevant + r.excluded.irrelevant, unverifiableIngredients: meta.excluded.unverifiableIngredients + r.excluded.unverifiableIngredients };
          if (r.ranked[0] && (!pick || r.ranked[0].score.total > pick.score.total)) pick = r.ranked[0];
        }
        if (pick) used.push(pick.product.id);
        routine.push({ step: slot.step, guidance: slot.guidance, recommendation: pick ? toRecommendation(pick, profile) : null });
      }
      out.routine = routine;
      out.recommendations = routine.map((s) => s.recommendation).filter((r): r is ProductRecommendation => r !== null);
      const missing = routine.filter((s) => !s.recommendation).map((s) => lower(s.step));
      out.reply = `Here is a basic ${night ? "night" : "morning"} routine${profile.skinType ? ` for ${lower(profile.skinType)} skin` : ""}, built only from products in the BeautyIQ catalog. Introduce one new product at a time and patch-test.` +
        (missing.length ? ` I could not find a verified match for: ${joinList(missing)}.` : "") +
        (profile.skinType ? "" : " Tell me your skin type and I can tailor it.");
      break;
    }

    case "compare": {
      const refs = resolveReferences(message, products, lastIds);
      if (refs.length < 2) {
        out.reply = "Tell me which two products to compare (or ask for recommendations first and then say \"compare the top two\").";
        break;
      }
      const [a, b] = refs;
      const cards = [a, b].map((p) => scoreForDisplay(p, profile));
      out.recommendations = cards;
      const show = (p: CatalogProduct, f: (p: CatalogProduct) => string | null) => f(p);
      const unitPrice = (p: CatalogProduct) => (p.price && p.quantity > 0 ? `${inr(p.price.amount / p.quantity)}/${p.unit}` : null);
      const hasProfile = !profileIsEmpty(profile);
      const rows = [
        { label: "Brand", values: [a, b].map((p) => show(p, (x) => x.brand)) },
        { label: "Category", values: [a, b].map((p) => show(p, (x) => String(x.category))) },
        { label: "Verified price", values: [a, b].map((p) => show(p, (x) => (x.price ? inr(x.price.amount) : "Not verified"))) },
        { label: "Size", values: [a, b].map((p) => show(p, (x) => `${x.quantity} ${x.unit}`)) },
        { label: "Price per unit", values: [a, b].map((p) => show(p, unitPrice)) },
        { label: "Rating", values: [a, b].map((p) => show(p, (x) => (x.rating !== null ? `${x.rating} (${x.reviewCount.toLocaleString("en-IN")} reviews)` : "Not rated"))) },
        { label: "Key ingredients", values: [a, b].map((p) => show(p, (x) => x.ingredients.filter((i) => i.isKey).map((i) => i.name).join(", ") || "Not listed")) },
        { label: "Listed for skin types", values: [a, b].map((p) => show(p, (x) => x.skinTypes.join(", ") || "Not listed")) },
        { label: "Listed for concerns", values: [a, b].map((p) => show(p, (x) => x.targetConcerns.join(", ") || "Not listed")) },
        { label: "Fragrance-free", values: [a, b].map((p) => show(p, (x) => (x.fragranceFree ? "Yes" : "Not listed as fragrance-free"))) },
        ...(hasProfile ? [{ label: "Match for your profile", values: cards.map((c) => `${Math.round(c.score.total)}/100`) }] : []),
      ];
      const bits: string[] = [];
      if (hasProfile && cards[0].score.total !== cards[1].score.total) {
        const w = cards[0].score.total > cards[1].score.total ? a : b;
        bits.push(`For your profile, ${w.brand} ${w.name} scores higher.`);
      }
      if (a.price && b.price && a.price.amount !== b.price.amount) {
        const c = a.price.amount < b.price.amount ? a : b;
        bits.push(`${c.brand} ${c.name} is cheaper at ${inr(c.price!.amount)}.`);
      }
      if (a.category !== b.category) bits.push("They are different product types, so they can work together rather than compete.");
      const comparison: ChatComparison = { productIds: [a.id, b.id], rows, summary: bits.join(" ") };
      out.comparison = comparison;
      out.reply = `Here is a side-by-side of ${a.brand} ${a.name} and ${b.brand} ${b.name}, using catalog data. ${comparison.summary}`.trim();
      break;
    }

    case "explain": {
      const all = /\b(these|them|each|all|every|those|they)\b/i.test(message) && lastIds.length > 1;
      const targets = all
        ? lastIds.map((id) => products.find((p) => p.id === id)).filter((p): p is CatalogProduct => !!p).slice(0, 4)
        : resolveReferences(message, products, lastIds).slice(0, 1);
      if (!targets.length) { out.reply = "Which product would you like me to explain? Ask for recommendations first, then ask \"why did you recommend this?\" or \"what will the ingredients do?\""; break; }
      const cards = targets.map((p) => scoreForDisplay(p, profile));
      out.recommendations = cards;
      out.reply = cards.map((card) => {
        const block = [`${card.brand} ${card.name} — why I recommended it: ${card.why}`];
        if (card.relevantIngredients.length) {
          block.push("What its key ingredients do (general guidance; the ingredients themselves come from its label):");
          for (const h of card.relevantIngredients) {
            block.push(`• ${h.name}: ${h.role}.${h.helpsWith.length ? ` Relevant to your ${joinList(h.helpsWith.map((c) => c.toLowerCase()))}.` : ""}${h.usage ? ` ${h.usage}` : ""}`);
          }
        } else {
          block.push("The catalog has no ingredient I can explain for this product, so I can't say what it would do.");
        }
        if (card.cautions.length) block.push(`Worth knowing: ${card.cautions[0]}`);
        return block.join("\n");
      }).join("\n\n") + "\n\nHigher ingredient percentages are not automatically better, so I rank on fit rather than strength. Cosmetic products support skin care and don't treat medical conditions.";
      break;
    }

    case "suitability": {
      const [p] = resolveReferences(message, products, lastIds);
      if (!p) { out.reply = "Which product do you mean? Ask for recommendations first, then ask about suitability."; break; }
      const asked = extractSkinType(message) || profile.skinType;
      const card = scoreForDisplay(p, { ...profile, skinType: asked });
      out.recommendations = [card];
      const fit = skinTypeFit(asked, p.skinTypes);
      const allergy = allergenVerdict(p, profile.allergens);
      const bits: string[] = [];
      if (!asked) bits.push("I don't know your skin type yet, so I can only describe the product itself.");
      else if (!p.skinTypes.length) bits.push(`The catalog does not list skin types for ${p.name}, so I can't confirm it suits ${lower(asked)} skin.`);
      else if (fit === 1) bits.push(`Yes, ${p.name} is listed for ${lower(asked)} skin (listed for ${joinList(p.skinTypes)}).`);
      else if (fit > 0) bits.push(`${p.name} is listed for ${joinList(p.skinTypes)} skin, not specifically ${lower(asked)}. It may work, but it isn't a confirmed fit.`);
      else bits.push(`${p.name} is listed for ${joinList(p.skinTypes)} skin, so it is not a good fit for ${lower(asked)} skin.`);
      if (allergy.verdict === "contains") bits.push(`It lists or may contain ${allergy.hit}, which you said to avoid, so I would skip it.`);
      if (card.cautions.length) bits.push(card.cautions[0]);
      bits.push("Patch-test any new product first.");
      out.reply = bits.join(" ");
      break;
    }

    case "ingredient_compat": {
      const mentioned = findIngredientsInText(message);
      const [p] = resolveReferences(message, products, lastIds);
      const productKeys = p ? p.ingredients.map((i) => resolveIngredientMention(i.name)).filter((k): k is NonNullable<typeof k> => !!k) : [];
      const lines: string[] = [];
      if (p) out.recommendations = [scoreForDisplay(p, profile)];
      for (const m of mentioned) {
        const other = productKeys.filter((k) => k.key !== m.key && (k.irritation >= 1 || m.separateFrom.includes(k.key)));
        if (productKeys.some((k) => k.key === m.key)) lines.push(`${p!.name} already contains ${m.name}, so adding another ${m.name} product is usually unnecessary.`);
        for (const k of other.slice(0, 2)) lines.push(pairAdvice(m, k).text);
        if (!p && mentioned.length > 1) for (const n of mentioned) if (n.key !== m.key) lines.push(pairAdvice(m, n).text);
      }
      out.reply = (lines.length ? [...new Set(lines)].slice(0, 3).join(" ") : "These are generally fine to use in the same routine; introduce one at a time and patch-test.") + " This is general skincare guidance rather than a statement about a specific formula.";
      break;
    }

    case "cheaper_alternative": {
      const refs = resolveReferences(message, products, lastIds);
      const ref = refs[0];
      if (!ref || !ref.price) { out.reply = ref ? `${ref.name} has no verified price, so I can't tell what would be cheaper. Tell me a budget and I'll filter by it.` : "Ask for recommendations first, then I can suggest cheaper alternatives to one of them."; break; }
      const scope = profileForCard(profile, { category: ref.category as ChatSkinProfile["category"] });
      const r = rankProducts(products, scope, { limit: 3, priceBelow: ref.price.amount, excludeIds: [ref.id], relaxConcern: true });
      meta.excluded = r.excluded; meta.candidates = r.candidates;
      if (!r.ranked.length) {
        out.noMatch = { reason: `I could not find a verified ${lower(String(ref.category))} cheaper than ${inr(ref.price.amount)} that also fits your profile. ${ref.brand} ${ref.name} is the best verified option I have in that range.`, suggestions: ["Try a different product type, or tell me a different budget."] };
        out.reply = out.noMatch.reason;
        out.recommendations = [];
      } else {
        out.recommendations = cardsFor(r.ranked, profile);
        out.reply = `Cheaper ${lower(String(ref.category))} options than ${ref.brand} ${ref.name} (${inr(ref.price.amount)}) that still fit your profile:`;
      }
      break;
    }

    default: { // recommend | category_switch
      const r = rankProducts(products, profile, { limit: 4 });
      meta.excluded = r.excluded; meta.candidates = r.candidates;
      if (!r.ranked.length) {
        out.noMatch = explainNoMatch(products, profile, r.excluded);
        out.reply = out.noMatch.reason + (out.noMatch.suggestions.length ? ` ${out.noMatch.suggestions[0]}` : "");
      } else {
        out.recommendations = cardsFor(r.ranked, profile);
        out.reply = recommendReply(profile, out.recommendations, intent);
      }
    }
  }

  out.notices = notices(profile, message, out.recommendations);
  if (CLINICAL.test(message) && !out.notices.some((n) => /dermatologist/.test(n))) out.notices.push("Please consult a dermatologist about this concern.");
  out.followUps = followUpsFor(intent, profile, out.recommendations);

  if (llm && out.reply && !["greeting", "need_info"].includes(intent) && !out.noMatch) {
    const polished = await polishWithLLM(llm, { draft: out.reply, intent, userMessage: message, history, featured: out.recommendations, profile, catalog: products });
    if (polished) { out.reply = polished; llmUsed = true; }
  }
  meta.llmUsed = llmUsed;
  return out;
}
