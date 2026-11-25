import type {
  DetailedSkinConcern,
  RoutineStep,
  SkinType,
} from "./user";

export type ProductUnit = "ml" | "g" | "pcs" | "sheets";
export type ProductStatus = "Complete" | "Incomplete" | "Outdated" | "Failed";
export type AvailabilityStatus = "Available" | "Unavailable" | "Unknown" | "Limited Information" | "Not Available";
export type UsageTime = "Morning" | "Night" | "Both";

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
  deliveryEstimate?: string;
  priceLastUpdated?: string;
  availabilityLastUpdated?: string;
  isVerifiedSource?: boolean;
  isBestValue?: boolean;
  isBestPrice?: boolean;
  offerTag?: string; // e.g. "5% Prepaid Off Auto-Applied", "Prime Coupon Applied"
  couponCode?: string; // e.g. "PREPAID5", "BEAUTY10"
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
  price?: number; // Verified live base selling price from official store / primary source
  mrp?: number; // Verified Maximum Retail Price / compare-at price
  directBuyUrl?: string; // Direct canonical purchase URL
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
