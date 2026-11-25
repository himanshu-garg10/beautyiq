export type SkinType =
  | "Oily"
  | "Dry"
  | "Combination"
  | "Normal"
  | "Sensitive"
  | "All Skin Types"
  | "Acne-prone";

export type DetailedSkinConcern =
  | "Acne"
  | "Pimples"
  | "Blackheads"
  | "Whiteheads"
  | "Dark spots"
  | "Acne marks"
  | "Blemishes"
  | "Hyperpigmentation"
  | "Pigmentation"
  | "Uneven skin tone"
  | "Uneven tone"
  | "Dryness"
  | "Dehydration"
  | "Excess oil"
  | "Oiliness"
  | "Dullness"
  | "Redness"
  | "Rough texture"
  | "Visible pores"
  | "Fine lines"
  | "Tanning"
  | "Dark circles"
  | "Under eye puffiness"
  | "Uneven texture"
  | "Sun protection"
  | "Barrier repair"
  | "Sensitivity"
  | "Irritation"
  | "Itching"
  | "Cleansing"
  | "Chapped lips";

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

export interface DataExportRequest {
  id: string;
  userId: string;
  requestedAt: string;
  status: "PENDING" | "PROCESSING" | "READY";
  downloadUrl?: string;
  fileSizeBytes?: number;
}

export interface RecentlyViewedItem {
  productId: string;
  viewedAt: string;
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
