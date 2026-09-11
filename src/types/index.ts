export type SkinType = "Oily" | "Dry" | "Combination" | "Normal" | "Sensitive";

export type DetailedSkinConcern =
  | "Acne"
  | "Pimples"
  | "Blackheads"
  | "Whiteheads"
  | "Dark spots"
  | "Acne marks"
  | "Hyperpigmentation"
  | "Uneven skin tone"
  | "Dryness"
  | "Dehydration"
  | "Excess oil"
  | "Dullness"
  | "Redness"
  | "Rough texture"
  | "Visible pores"
  | "Fine lines"
  | "Tanning"
  | "Dark circles"
  | "Under eye puffiness"
  | "Uneven texture";

export type SkinConcern = DetailedSkinConcern;

export type DetailedSkinGoal =
  | "Clearer skin"
  | "Glow"
  | "Even skin tone"
  | "Hydration"
  | "Oil control"
  | "Smoother texture"
  | "Reduced appearance of pores"
  | "Maintain healthy looking skin";

export type SkinGoal = DetailedSkinGoal;

export type SensitivityLevel = "Low" | "Medium" | "High" | "Not sure";
export type ReactionFrequency = "Never" | "Rarely" | "Sometimes" | "Frequently";
export type KnownAllergy = "Fragrance" | "Specific preservatives" | "Specific ingredients" | "Other" | "None" | "Not sure";

export type TexturePreference = "Gel" | "Cream" | "Lotion" | "Foam" | "Water based" | "Oil based" | "No preference";
export type FinishPreference = "Matte" | "Dewy" | "Natural" | "No preference";
export type FragrancePreference = "Fragrance free" | "Light fragrance" | "No preference";
export type EssentialOilPreference = "Avoid" | "Allowed" | "No preference";

export type ProductProperty =
  | "Lightweight"
  | "Non sticky"
  | "Fast absorbing"
  | "Fragrance free"
  | "Alcohol free"
  | "Non comedogenic"
  | "Vegan"
  | "Cruelty free"
  | "Dermatologically tested";

export type SkincareExperience = "Beginner" | "Intermediate" | "Experienced";

export type SunExposure = "High sun exposure" | "Low sun exposure";
export type ActivityType = "Outdoor activity" | "Mostly indoor";
export type ClimateType = "Hot climate" | "Humid climate" | "Dry climate" | "Air conditioned environment";

export type AgeGroup = "Under 18" | "18 to 24" | "25 to 34" | "35 to 44" | "45+";

export type BudgetRange = {
  min: number;
  max: number;
  monthlyBudget?: number;
  label: "Economy" | "Mid-Range" | "Premium" | "Luxury";
};

export type RoutineStep =
  | "Face Wash"
  | "Cleanser"
  | "Serum"
  | "Moisturizer"
  | "Sunscreen"
  | "Toner"
  | "Exfoliator"
  | "Acne Focused Products"
  | "Face Masks"
  | "Lip Care"
  | "Eye Care"
  | "Treatment Products";

export type ProductUnit = "ml" | "g" | "pcs" | "sheets";
export type ProductStatus = "Complete" | "Incomplete" | "Outdated" | "Failed";
export type AvailabilityStatus = "Available" | "Unavailable" | "Limited Information" | "Not Available";

export type IngredientCategory =
  | "Humectant"
  | "Emollient"
  | "Occlusive"
  | "Antioxidant"
  | "Exfoliant"
  | "Skin conditioning"
  | "Soothing agent"
  | "Surfactant"
  | "Preservative"
  | "Solvent"
  | "UV filter"
  | "Active ingredient";

export type UsageTime = "Morning" | "Night" | "Both";

export interface SkinProfile {
  skinType: SkinType;
  concerns: DetailedSkinConcern[];
  goals: DetailedSkinGoal[];
  
  sensitivityLevel: SensitivityLevel;
  reactionFrequency: ReactionFrequency;
  knownAllergies: KnownAllergy[];

  preferredIngredients: string[];
  avoidIngredients: string[];
  preferredBrands: string[];
  excludedBrands: string[];
  preferredCategories: RoutineStep[];
  texturePreference: TexturePreference;
  finishPreference: FinishPreference;
  fragrancePreference: FragrancePreference;
  essentialOilPreference: EssentialOilPreference;
  properties: ProductProperty[];

  skincareExperience: SkincareExperience;
  sunExposure?: SunExposure;
  activityType?: ActivityType;
  climate?: ClimateType;

  budget: BudgetRange;

  isOnboardingComplete: boolean;
  completedStepsCount: number;
}

export interface Ingredient {
  id: string;
  name: string;
  commonNames?: string[];
  synonyms?: string[];
  description: string;
  function: string;
  category: IngredientCategory;
  concentration: string;
  concernTags: DetailedSkinConcern[];
  safetyRating: "Low Hazard" | "Moderate Hazard" | "High Hazard";
  comedogenicRating: number; // 0 to 5
  suitableSkinTypes: SkinType[];
  contraindications: string[];
}

export interface Platform {
  id: string;
  name: string;
  logoUrl?: string;
  baseUrl: string;
}

export interface Seller {
  id: string;
  name: string;
  platformId: string;
  rating?: number;
}

export interface ProductListing {
  id: string;
  productId: string;
  platform: string;
  seller: string;
  price: number | null; // null if unavailable
  originalPrice?: number;
  discountPercent?: number;
  quantity: number;
  unit: ProductUnit;
  availability: AvailabilityStatus;
  productUrl: string;
  lastUpdated: string;
  isBestValue?: boolean;
  isBestPrice?: boolean;
  unitPricePerMl?: number;
  unitPricePerGram?: number;
  valueScore?: number; // 0 - 100
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: RoutineStep;
  description: string;
  images: string[];
  image: string; // primary cover image
  quantity: number;
  unit: ProductUnit;
  keyIngredients: string[];
  allIngredients: string[];
  rating: number | null; // null for Not Available
  reviewCount: number;
  productStatus: ProductStatus;
  dataConfidence: number; // 0 to 100 (separate from compatibility score)
  source: string;
  lastUpdated: string;
  compatibilityScore?: number; // Demo / placeholder until recommendation stage
  skinTypes: SkinType[];
  targetConcerns: DetailedSkinConcern[];
  pHLevel?: number;
  crueltyFree: boolean;
  vegan: boolean;
  fragranceFree: boolean;
  parabenFree: boolean;
  siliconeFree: boolean;
  usageTime: UsageTime;
  summary: string;
  whyRecommended?: string[];
  warnings?: string[];
}

export interface ProductComparisonItem {
  product: Product;
  listings: ProductListing[];
  vfmIndex: number;
  suitabilityMatch: number | null; // null if logged out / incomplete profile
  scoreBreakdown?: ScoreBreakdown | null;
  reasons?: string[];
  bestPriceListing?: ProductListing | null;
  bestValueListing?: ProductListing | null;
  unitPriceLabel?: string;
  unitPriceValue?: number | null;
  isBestPriceOverall?: boolean;
  isBestValueOverall?: boolean;
  isBestRatedOverall?: boolean;
  isBestCompatibilityOverall?: boolean;
}

export interface ComparisonSession {
  id: string;
  productIds: string[];
  createdAt: string;
  criteria?: string;
  productNames?: string[];
}

export interface NormalizedValueMetric {
  productId: string;
  unitPrice: number | null;
  unitLabel: string;
  quantity: number;
  unit: ProductUnit;
  bestPrice: number | null;
  bestPricePlatform?: string;
  bestValuePrice: number | null;
  bestValuePlatform?: string;
  valueScore: number; // 0 - 100
  personalizedValueScore?: number | null;
}

export interface ProductPriceComparisonDetails {
  productId: string;
  productName: string;
  listings: ProductListing[];
  bestPriceListing: ProductListing | null;
  bestValueListing: ProductListing | null;
  minPrice: number | null;
  maxPrice: number | null;
  hasStaleData?: boolean;
}

export interface PriceHistoryEntry {
  id: string;
  productId: string;
  listingId?: string;
  platform: string;
  seller?: string;
  price: number;
  originalPrice?: number;
  timestamp: string;
}


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

export interface RecentlyViewedItem {
  productId: string;
  viewedAt: string;
}

export type UserRole = "customer" | "admin" | "guest";

export interface UserPersonalProfile {
  ageGroup?: AgeGroup;
  gender?: string;
  country?: string;
  preferredLanguage?: string;
  currencyPreference?: string;
}

export interface PrivacySettings {
  profileVisibility: "Private" | "Public";
  imageStoragePreference: boolean;
  dataExportRequested?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
  avatarUrl?: string;
  skinProfile?: SkinProfile;
  personalProfile?: UserPersonalProfile;
  privacySettings?: PrivacySettings;
  wishlistIds: string[];
  searchHistory: string[];
  recentlyViewed?: RecentlyViewedItem[];
  createdAt: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

export interface AdminMetric {
  totalUsers: number;
  totalProducts: number;
  totalIngredients: number;
  totalSearches: number;
  systemHealth: "Optimal" | "Degraded" | "Critical";
  dataQualityScore: number;
  duplicateQueueCount: number;
  scrapesLast24h: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  target: string;
  status: "success" | "warning" | "error";
  details?: string;
}

export interface Category {
  id: string;
  name: RoutineStep;
  productCount: number;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
  country: string;
  philosophy: string;
  productCount: number;
  logoUrl?: string;
}

// ==========================================
// AI / NLP REQUIREMENT UNDERSTANDING TYPES
// ==========================================

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
}

export interface AIRequirementSession {
  sessionId: string;
  rawQuery: string;
  confirmedRequirements: StructuredSkincareRequirement;
  createdAt: string;
}

// ==========================================
// RECOMMENDATION ENGINE TYPES (STAGE 5)
// ==========================================

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
