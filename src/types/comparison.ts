import type { ProductUnit, Product, ProductListing } from "./product";
import type { ScoreBreakdown } from "./recommendation";

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
