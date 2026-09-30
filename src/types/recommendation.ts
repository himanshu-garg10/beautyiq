import type {
  DetailedSkinConcern,
  DetailedSkinGoal,
  FinishPreference,
  FragrancePreference,
  ProductProperty,
  RoutineStep,
  SkinProfile,
  SkinType,
  TexturePreference,
} from "./user";
import type { Product, ProductListing } from "./product";

export interface NaturalLanguageQueryResult {
  query: string;
  extractedCriteria: {
    category?: RoutineStep;
    skinType?: SkinType;
    concerns?: DetailedSkinConcern[];
    maxBudget?: number;
    avoidIngredients?: string[];
    desiredBenefits?: string[];
  };
  confidence: number;
  matchedProducts: Product[];
  explanation: string;
}

export interface StructuredSkincareRequirement {
  id: string;
  rawQuery: string;
  skinType: SkinType | null;
  concerns: DetailedSkinConcern[];
  goals: DetailedSkinGoal[];
  category: RoutineStep | null;
  minPrice: number | null;
  maxPrice: number | null;
  preferredBrands: string[];
  excludedBrands: string[];
  preferredIngredients: string[];
  avoidIngredients: string[];
  knownAllergies: string[];
  texturePreference: TexturePreference | null;
  finishPreference: FinishPreference | null;
  fragrancePreference: FragrancePreference | null;
  properties: ProductProperty[];
  extractedAt: string;
  isConfirmed: boolean;
  confidenceScores: Record<string, "High" | "Medium" | "Low">;
}

export interface AmbiguityClarification {
  term: string;
  question: string;
  options: { label: string; field: keyof StructuredSkincareRequirement; value: any }[];
}

export interface ContradictionConflict {
  id: string;
  fieldA: string;
  valueA: string;
  fieldB: string;
  valueB: string;
  message: string;
  resolutionOptions: { label: string; action: "keepA" | "keepB" | "clearBoth" }[];
}

export interface ProfileConflictInfo {
  savedSkinType?: SkinType;
  querySkinType?: SkinType;
  savedConcerns?: DetailedSkinConcern[];
  message: string;
}

export interface AIRequirementParseResult {
  requirements: StructuredSkincareRequirement;
  ambiguities: AmbiguityClarification[];
  contradictions: ContradictionConflict[];
  profileConflict: ProfileConflictInfo | null;
  processingTimeMs: number;
  stepLogs: string[];
  medicalSafety?: {
    hasClinicalConditions: boolean;
    safetyDisclaimer: string;
    recommendedAction: string;
  };
}

export interface AIRequirementSession {
  sessionId: string;
  rawQuery: string;
  confirmedRequirements: StructuredSkincareRequirement;
  createdAt: string;
}

export type RecommendationPriority =
  | "best-match"
  | "lowest-price"
  | "best-rated"
  | "preferred-brand"
  | "minimal-ingredients"
  | "premium";

export interface ScoreBreakdown {
  skinTypeScore: number;
  concernScore: number;
  ingredientScore: number;
  preferenceScore: number;
  budgetFitScore: number;
  overallScore: number;
}

export interface ScoredProduct {
  product: Product;
  scoreBreakdown: ScoreBreakdown;
  reasons: string[];
  considerations: string[];
  bestListing?: ProductListing;
  unitPriceLabel: string;
  valueScore: number;
}

export interface RelaxedRequirement {
  requirementField: string;
  originalValue: string;
  relaxedValue: string;
  reason: string;
  relaxedProducts: ScoredProduct[];
}

export interface RecommendationResultSet {
  status: "EXACT_MATCH_FOUND" | "NO_EXACT_MATCH";
  bestOverall: ScoredProduct | null;
  bestForMainConcern: ScoredProduct | null;
  bestIngredientMatch: ScoredProduct | null;
  bestBudgetOption: ScoredProduct | null;
  bestRated: ScoredProduct | null;
  bestValue: ScoredProduct | null;
  alternatives: ScoredProduct[];
  relaxedAlternatives: RelaxedRequirement[];
  totalCandidatesCount: number;
}

export interface RecommendationEngineRequest {
  requirements: StructuredSkincareRequirement;
  priority: RecommendationPriority;
  userProfile?: SkinProfile | null;
}

export interface RecommendationSession {
  sessionId: string;
  request: RecommendationEngineRequest;
  result: RecommendationResultSet;
  createdAt: string;
}

export interface RecommendationFeedback {
  sessionId: string;
  productId: string;
  isHelpful: boolean;
  reason?: "too-expensive" | "not-suitable" | "not-interested" | "already-own" | "other";
  comments?: string;
  createdAt: string;
}

export interface RecommendationHistoryItem {
  id: string;
  userId: string;
  timestamp: string;
  querySummary: string;
  requirements: StructuredSkincareRequirement;
  totalRecommendations: number;
  topRecommendation?: {
    id: string;
    name: string;
    brand: string;
    score: number;
    image: string;
    category: string;
    price: number;
  };
  categories: string[];
  profileContextUsed?: {
    skinType?: string;
    concerns?: string[];
  };
  isRecalculated?: boolean;
}
