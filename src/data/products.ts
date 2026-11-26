import type { Product, ProductListing } from "@/types";
import catalogProducts from "./products.json";
import { RetailerAggregatorService } from "@/services/retailer-aggregator.service";

export const products: Product[] = catalogProducts as unknown as Product[];

// Lazily generate and cache 3,080 retailer listings across all 7 stores
let _cachedListings: ProductListing[] | null = null;

function getCachedListings(): ProductListing[] {
  if (!_cachedListings) {
    _cachedListings = [];
    for (const p of products) {
      _cachedListings.push(...RetailerAggregatorService.generateRetailerListings(p));
    }
  }
  return _cachedListings;
}

export const productListings: ProductListing[] = getCachedListings();
export const mockProductListings = productListings;

export const priceComparison = {
  product: {
    brand: "Minimalist",
    name: "10% Niacinamide Face Serum",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=700&auto=format&fit=crop",
  },
  listings: [
    {
      platform: "Myntra",
      price: 519,
      originalPrice: 599,
      discountPercent: 13,
      offerTag: "13% OFF with Code BEAUTY10 (Save ₹80)",
      deliveryEstimate: "2–3 days (M-Express)",
      isBestPrice: true,
      productUrl: "https://www.myntra.com/minimalist-10-niacinamide-face-serum",
    },
    {
      platform: "Amazon India",
      price: 539,
      originalPrice: 599,
      discountPercent: 10,
      offerTag: "10% OFF Prime Deal (Save ₹60)",
      deliveryEstimate: "Tomorrow with Prime",
      productUrl: "https://www.amazon.in/s?k=Minimalist%2010%25%20Niacinamide%20Face%20Serum",
    },
    {
      platform: "Purplle",
      price: 539,
      originalPrice: 599,
      discountPercent: 10,
      offerTag: "10% OFF Purplle Elite (Save ₹60)",
      deliveryEstimate: "3–4 days delivery",
      productUrl: "https://www.purplle.com/search?q=Minimalist%2010%25%20Niacinamide%20Face%20Serum",
    },
    {
      platform: "Flipkart",
      price: 549,
      originalPrice: 599,
      discountPercent: 8,
      offerTag: "8% OFF (Flipkart Assured Deal)",
      deliveryEstimate: "2 days (F-Assured)",
      productUrl: "https://www.flipkart.com/search?q=Minimalist%2010%25%20Niacinamide%20Face%20Serum",
    },
    {
      platform: "Tira Beauty",
      price: 549,
      originalPrice: 599,
      discountPercent: 8,
      offerTag: "8% OFF Tira Red Deal (Save ₹50)",
      deliveryEstimate: "2 days (Tira Express)",
      productUrl: "https://www.tirabeauty.com/search?q=Minimalist%2010%25%20Niacinamide%20Face%20Serum",
    },
    {
      platform: "BeMinimalist Direct",
      price: 569,
      originalPrice: 599,
      discountPercent: 5,
      offerTag: "5% OFF Mentioned on Official Store (Save ₹30)",
      deliveryEstimate: "3–4 days (Free Samples & Loyalty Points)",
      isBestValue: true,
      productUrl: "https://beminimalist.co/products/niacinamide-10-with-matmarine",
    },
    {
      platform: "Nykaa",
      price: 569,
      originalPrice: 599,
      discountPercent: 5,
      offerTag: "5% OFF on Nykaa · 100% Authentic Luxe (Save ₹30)",
      deliveryEstimate: "2–3 days delivery",
      productUrl: "https://www.nykaa.com/search/result/?q=Minimalist%2010%25%20Niacinamide%20Face%20Serum",
    },
  ],
};
