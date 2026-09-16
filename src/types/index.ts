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
export type AvailabilityStatus = "Available" | "Unavailable" | "Unknown" | "Limited Information" | "Not Available";

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
  status?: "active" | "inactive";
}

export interface Platform {
  id: string;
  name: string;
  logoUrl?: string;
  baseUrl: string;
  status?: "active" | "inactive";
  listingCount?: number;
}

export interface Seller {
  id: string;
  name: string;
  platformId: string;
  rating?: number;
  status?: "active" | "inactive";
  listingCount?: number;
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
  priceLastUpdated?: string;
  availabilityLastUpdated?: string;
  isVerifiedSource?: boolean;
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
  isVerified?: boolean;
  dataSourceId?: string;
  originalBrand?: string;
  barcodeOrGtin?: string;
  uncertainIngredients?: string[];
  dataQualityFlags?: string[];
  priceFreshnessTimestamp?: string;
  availabilityFreshnessTimestamp?: string;
  variantGroupId?: string;
  variantType?: string;
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

export interface NotificationPreferences {
  reminders: boolean;
  progressUpdates: boolean;
  newRecommendations: boolean;
  productAlerts: boolean;
  educationalContent: boolean;
}

export type NotificationType =
  | "PRODUCT_SAVED"
  | "RECOMMENDATION_GENERATED"
  | "PROFILE_UPDATED"
  | "PRICE_CHANGED"
  | "PRODUCT_UNAVAILABLE"
  | "SYSTEM_NOTIFICATION";

export interface InAppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  productId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: string;
  searchType: "keyword" | "ai-requirement" | "category" | "ingredient";
  extractedCriteria?: any;
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

export interface DataExportRequest {
  id: string;
  userId: string;
  requestedAt: string;
  status: "PENDING" | "PROCESSING" | "READY";
  downloadUrl?: string;
  fileSizeBytes?: number;
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
  notificationPreferences?: NotificationPreferences;
  wishlistIds: string[];
  searchHistory: string[];
  recentlyViewed?: RecentlyViewedItem[];
  createdAt: string;
  status?: "active" | "inactive" | "suspended";
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
  description?: string;
  status?: "active" | "inactive";
}

export interface Brand {
  id: string;
  name: string;
  country: string;
  philosophy: string;
  productCount: number;
  logoUrl?: string;
  status?: "active" | "inactive";
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

// ==========================================
// STAGE 9: ADMIN DASHBOARD & MANAGEMENT TYPES
// ==========================================

export type ReportType =
  | "wrong_price"
  | "wrong_info"
  | "wrong_ingredients"
  | "broken_link"
  | "availability_issue"
  | "duplicate"
  | "other";

export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";

export interface ProductReport {
  id: string;
  productId: string;
  productName: string;
  userId?: string;
  userEmail?: string;
  reportType: ReportType;
  description: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  adminNotes?: string;
}

export type SupportCategory = "general" | "routine" | "recommendation" | "account" | "bug";
export type SupportPriority = "low" | "medium" | "high" | "urgent";
export type SupportStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportRequest {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
}

export type AdminEntity =
  | "product"
  | "brand"
  | "category"
  | "ingredient"
  | "platform"
  | "seller"
  | "listing"
  | "customer"
  | "report"
  | "support"
  | "system";

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminName: string;
  action: string;
  entity: AdminEntity;
  entityId: string;
  entityName: string;
  details: string;
  status: "success" | "warning" | "error";
}

export type DataQualityIssueType =
  | "missing_ingredients"
  | "missing_image"
  | "missing_price"
  | "missing_quantity"
  | "missing_source"
  | "invalid_listing"
  | "outdated"
  | "duplicate_candidate";

export interface DataQualityIssue {
  id: string;
  entityType: "product" | "listing" | "ingredient";
  entityId: string;
  entityName: string;
  issueType: DataQualityIssueType;
  severity: "low" | "medium" | "high";
  detectedAt: string;
  status: "pending" | "resolved" | "ignored";
  description: string;
}

export interface DuplicateCandidate {
  id: string;
  entityType: "product" | "brand" | "ingredient" | "listing";
  item1: { id: string; name: string; details: string };
  item2: { id: string; name: string; details: string };
  similarityScore: number;
  reasons: string[];
  status: "pending" | "merged" | "dismissed";
  detectedAt: string;
}

export interface AdminDashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  activeProducts: number;
  totalBrands: number;
  totalCategories: number;
  totalIngredients: number;
  totalPlatforms: number;
  totalSellers: number;
  totalListings: number;
  availableListings: number;
  unavailableListings: number;
  incompleteProducts: number;
  reviewProducts: number;
  duplicateCandidatesCount: number;
  openReportsCount: number;
  openSupportCount: number;
  categoryDistribution: { category: string; count: number }[];
  brandDistribution: { brand: string; count: number }[];
  availabilityDistribution: { status: string; count: number }[];
  dataQualityHealthScore: number;
  recentActivity: AdminActivityLog[];
}

// ==========================================
// STAGE 10: REAL DATA PIPELINE & QUALITY TYPES
// ==========================================

export type DataSourceType = "api" | "feed" | "dataset" | "catalog";
export type DataSourceStatus = "active" | "inactive" | "pending";
export type PermissionStatus = "approved" | "pending" | "rejected";

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  status: DataSourceStatus;
  permissionStatus: PermissionStatus;
  lastSuccessfulUpdate: string | null;
  lastFailedUpdate: string | null;
  dataCoverage: string;
  reliabilityScore: number; // 0 - 100
  endpoint?: string;
  authType: "none" | "api_key" | "oauth" | "feed_url";
  config?: Record<string, any>;
}

export type RawRecordStatus = "pending" | "processed" | "failed" | "rejected";

export interface RawProductRecord {
  id: string;
  sourceId: string;
  sourceName: string;
  collectionTimestamp: string;
  externalRecordId: string;
  rawPayload: Record<string, any>;
  processingStatus: RawRecordStatus;
  failedStage?: string;
  failureReason?: string;
  targetProductId?: string;
}

export interface DataPipelineRunLog {
  id: string;
  sourceId: string;
  sourceName: string;
  startedAt: string;
  completedAt: string;
  status: "success" | "warning" | "failed";
  recordsReceived: number;
  recordsAccepted: number;
  recordsRejected: number;
  recordsUpdated: number;
  recordsCreated: number;
  duplicatesDetected: number;
  validationFailures: number;
  errors: string[];
}

export type DataQualityState = "Complete" | "Incomplete" | "Duplicate" | "Invalid" | "Outdated" | "Failed";

export interface PipelineValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldsValidated: string[];
}

export interface NormalizedQuantityResult {
  quantity: number;
  unit: ProductUnit;
}

export interface NormalizedBrandResult {
  canonicalBrand: string;
  originalBrand: string;
  confidence: number;
  isRecognized: boolean;
}

export interface NormalizedCategoryResult {
  canonicalCategory: RoutineStep;
  originalCategory: string;
  confidence: number;
  isUncertain: boolean;
}

export interface NormalizedIngredientSummary {
  normalized: string[];
  uncertain: string[];
  unidentifiedCount: number;
}

