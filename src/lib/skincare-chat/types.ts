/**
 * Shared types for the BeautyIQ skincare chat (AI Match assistant).
 *
 * Design rule: every product fact in a response (name, brand, price, image,
 * ingredients, rating, link) is copied from a catalog record. The language model
 * never produces these fields; it can only write prose that is validated against them.
 */
import type { DetailedSkinConcern, RoutineStep, SkinType } from "../../types/user";

export type { DetailedSkinConcern, RoutineStep, SkinType };

/** What the assistant currently knows about the user. Persisted client-side between turns. */
export interface ChatSkinProfile {
  skinType: SkinType | null;
  concerns: DetailedSkinConcern[];
  budgetMax: number | null;
  budgetMin: number | null;
  /** Ingredients the user has said they are allergic/sensitive to or want to avoid. Hard exclusion. */
  allergens: string[];
  /** Ingredients the user explicitly asked for (soft preference). */
  preferredIngredients: string[];
  /** Products the user says they already use (free text, used only for conflict notes). */
  currentProducts: string[];
  /** Product category the user is currently shopping for. */
  category: RoutineStep | null;
}

export const EMPTY_PROFILE: ChatSkinProfile = {
  skinType: null,
  concerns: [],
  budgetMax: null,
  budgetMin: null,
  allergens: [],
  preferredIngredients: [],
  currentProducts: [],
  category: null,
};

export type ChatIntent =
  | "greeting"
  | "recommend"
  | "category_switch"
  | "cheaper_alternative"
  | "explain"
  | "suitability"
  | "ingredient_compat"
  | "ingredient_info"
  | "compare"
  | "routine"
  | "need_info"
  | "other";

export interface CatalogPrice {
  amount: number;
  currency: "INR";
  platform: string;
  seller: string;
  availability: string;
  /** Retailer listing URL exactly as stored in the catalog. */
  listingUrl: string | null;
  lastUpdated: string | null;
}

export interface CatalogIngredient {
  name: string;
  isKey: boolean;
  /** Metadata from the catalog's ingredient record, when one exists. */
  function?: string | null;
  concernTags?: string[];
}

/** A product exactly as stored in the catalog, plus derived (never invented) price fields. */
export interface CatalogProduct {
  /** Stable catalog id (slug). Product page is `/products/${id}`. */
  id: string;
  name: string;
  brand: string;
  category: RoutineStep | string;
  image: string;
  summary: string;
  description: string;
  quantity: number;
  unit: string;
  rating: number | null;
  reviewCount: number;
  skinTypes: string[];
  targetConcerns: string[];
  ingredients: CatalogIngredient[];
  fragranceFree: boolean;
  isVerified: boolean;
  productStatus: string;
  dataConfidence: number;
  warnings: string[];
  /** Lowest currently-available verified price, or null when no verified price exists. */
  price: CatalogPrice | null;
}

export interface CatalogProvider {
  readonly name: string;
  getProducts(): Promise<CatalogProduct[]>;
}

export interface IngredientHighlight {
  /** Ingredient as listed on the product (verified). */
  name: string;
  /** General-guidance label for the ingredient (not product-specific). */
  role: string;
  isKey: boolean;
  /** Knowledge-base key, used to avoid listing the same ingredient twice. */
  key?: string;
  /** The user's own concerns this ingredient is commonly used for (general guidance). */
  helpsWith: string[];
  /** General usage tip for the ingredient, when one exists. */
  usage?: string;
}

export interface ScoreBreakdown {
  concern: number;
  skinType: number;
  ingredients: number;
  budget: number;
  category: number;
  dataQuality: number;
  total: number;
}

export interface ProductRecommendation {
  productId: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: { amount: number; currency: "INR"; platform: string; lastUpdated: string | null } | null;
  /** Rating is only present when the catalog has one. */
  rating: { value: number; count: number } | null;
  quantity: number;
  unit: string;
  /** Relative product page, e.g. /products/p1 */
  link: string;
  /** Ingredients listed on the product that are relevant to this user. */
  relevantIngredients: IngredientHighlight[];
  /** Concerns this product may help address, with how we know. */
  matchedConcerns: { concern: string; via: "product_listing" | "ingredient" | "related_concern" }[];
  skinTypes: string[];
  fragranceFree: boolean;
  /** Short explanation. Built from verified facts (optionally rephrased by the LLM and re-validated). */
  why: string;
  cautions: string[];
  score: ScoreBreakdown;
  priceVerified: boolean;
}

export interface ComparisonRow {
  label: string;
  values: (string | null)[];
}

export interface ChatComparison {
  productIds: string[];
  rows: ComparisonRow[];
  summary: string;
}

export interface RoutineSlot {
  step: string;
  guidance: string;
  recommendation: ProductRecommendation | null;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatTurn[];
  profile?: Partial<ChatSkinProfile> | null;
  /** Product ids shown in the previous assistant message (for "this serum", "compare these two"...). */
  lastProductIds?: string[];
}

export interface ChatResponseMeta {
  provider: string;
  llmUsed: boolean;
  catalog: string;
  catalogSize: number;
  candidates: number;
  excluded: { allergen: number; budget: number; unverifiedPrice: number; irrelevant: number; unverifiableIngredients: number };
}

export interface ChatResponse {
  success: true;
  reply: string;
  intent: ChatIntent;
  profile: ChatSkinProfile;
  recommendations: ProductRecommendation[];
  comparison: ChatComparison | null;
  routine: RoutineSlot[] | null;
  /** Set when nothing in the catalog verifiably matches; the UI shows this instead of cards. */
  noMatch: { reason: string; suggestions: string[] } | null;
  followUps: string[];
  notices: string[];
  meta: ChatResponseMeta;
}
