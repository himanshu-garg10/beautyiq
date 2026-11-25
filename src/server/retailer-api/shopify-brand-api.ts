/**
 * Shopify Brand Store Live REST API Client
 * Fetches real, live product catalogs directly from official brand stores:
 * - BeMinimalist (beminimalist.co)
 * - Dot & Key (dotandkey.com)
 * - The Derma Co (thedermaco.com)
 * - Plum Goodness (plumgoodness.com)
 * - Dr. Sheth's (drsheths.com)
 */

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: {
    id: number;
    title: string;
    price: string;
    sku: string;
    position: number;
    compare_at_price: string | null;
    fulfillment_service: string;
    inventory_management: string | null;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    created_at: string;
    updated_at: string;
    taxable: boolean;
    barcode: string | null;
    grams: number;
    weight: number;
    weight_unit: string;
    inventory_quantity: number;
    requires_shipping: boolean;
  }[];
  images: {
    id: number;
    created_at: string;
    position: number;
    updated_at: string;
    alt: string | null;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
  }[];
  image?: {
    src: string;
  };
}

export interface BrandApiConfig {
  brandId: string;
  brandName: string;
  storeDomain: string;
  baseUrl: string;
  officialSeller: string;
  defaultDelivery: string;
}

export const BRAND_STORE_APIS: BrandApiConfig[] = [
  {
    brandId: "minimalist",
    brandName: "Minimalist",
    storeDomain: "beminimalist.co",
    baseUrl: "https://beminimalist.co",
    officialSeller: "Uprising Science (Official Fresh Batch)",
    defaultDelivery: "3–4 days (Free Samples Included)",
  },
  {
    brandId: "dotandkey",
    brandName: "Dot & Key",
    storeDomain: "dotandkey.com",
    baseUrl: "https://www.dotandkey.com",
    officialSeller: "Dot & Key Official Flagship",
    defaultDelivery: "3–4 days (Official Freebies)",
  },
  {
    brandId: "dermaco",
    brandName: "The Derma Co",
    storeDomain: "thedermaco.com",
    baseUrl: "https://thedermaco.com",
    officialSeller: "Honasa Consumer Flagship",
    defaultDelivery: "2–4 days (Official Derma Club)",
  },
  {
    brandId: "plum",
    brandName: "Plum",
    storeDomain: "plumgoodness.com",
    baseUrl: "https://plumgoodness.com",
    officialSeller: "Pureplay Skin Sciences Official",
    defaultDelivery: "3–4 days (Plum Rewards)",
  },
  {
    brandId: "drsheths",
    brandName: "Dr. Sheth's",
    storeDomain: "drsheths.com",
    baseUrl: "https://www.drsheths.com",
    officialSeller: "Dr. Sheth's Flagship",
    defaultDelivery: "3–4 days",
  },
];

export class ShopifyBrandApiClient {
  /**
   * Fetch live product catalog from a brand's public Shopify REST API endpoint
   */
  static async fetchBrandProducts(
    config: BrandApiConfig,
    limit: number = 25
  ): Promise<ShopifyProduct[]> {
    const url = `${config.baseUrl}/products.json?limit=${Math.min(limit, 250)}`;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "BeautyIQ-Retailer-Catalog-Aggregator/2.0 (Skincare Price Intelligence)",
          Accept: "application/json",
        },
        signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(15000) : undefined,
      });

      if (!response.ok) {
        console.warn(`[Shopify API] Failed to fetch from ${url}: Status ${response.status}`);
        return [];
      }

      const json = await response.json();
      return json.products || [];
    } catch (error) {
      console.warn(`[Shopify API] Error fetching from ${config.brandName} (${url}):`, error);
      return [];
    }
  }

  /**
   * Fetch products from all brand direct store APIs
   */
  static async fetchAllBrandStores(limitPerBrand: number = 15): Promise<{
    config: BrandApiConfig;
    products: ShopifyProduct[];
  }[]> {
    const results = await Promise.all(
      BRAND_STORE_APIS.map(async (config) => {
        const products = await this.fetchBrandProducts(config, limitPerBrand);
        return { config, products };
      })
    );
    return results;
  }
}
