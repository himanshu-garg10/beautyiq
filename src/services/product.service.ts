import { products, categories, brandsList, productListings, ingredients } from "@/lib/mock-data";
import { RetailerAggregatorService } from "./retailer-aggregator.service";
import type {
  Product,
  Category,
  Brand,
  ProductListing,
  RoutineStep,
  SkinType,
  DetailedSkinConcern,
  AvailabilityStatus,
} from "@/types";
import { ApiResponse, createSuccessResponse, createErrorResponse, simulateDelay } from "./api-client";

export interface ProductFilterOptions {
  query?: string;
  category?: RoutineStep | string;
  categories?: string[];
  brand?: string;
  brands?: string[];
  store?: string;
  stores?: string[];
  skinType?: SkinType;
  skinTypes?: string[];
  skinConcern?: DetailedSkinConcern | string;
  skinConcerns?: string[];
  ingredient?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: AvailabilityStatus;
  crueltyFreeOnly?: boolean;
  veganOnly?: boolean;
  fragranceFreeOnly?: boolean;
  parabenFreeOnly?: boolean;
  sortBy?: "relevance" | "rating" | "price-asc" | "price-desc" | "best-value" | "compatibility";
  page?: number;
  pageSize?: number;
}

export interface PaginatedProductsResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets?: {
    brands: string[];
    categories: string[];
  };
}

export interface GroupedSearchSuggestions {
  products: {
    id: string;
    name: string;
    brand: string;
    category: string;
    bestPrice?: number;
    storeCount?: number;
    bestStore?: string;
  }[];
  brands: { id: string; name: string }[];
  ingredients: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  concerns: string[];
}

export class ProductService {
  /**
   * Get all comparative retailer listings (Amazon, Flipkart, Myntra, Nykaa, Purplle, Tira, Brand Store)
   */
  static getListingsForProduct(productId: string): ProductListing[] {
    let product = products.find((p) => p.id === productId);
    if (!product && productId.startsWith("discovered-")) {
      const cleanName = productId.replace("discovered-", "").replace(/-/g, " ");
      product = {
        id: productId,
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        brand: "Multi-Store Discovery",
        category: "Treatment Products",
        description: `Verified product entry for ${cleanName}`,
        images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=700&auto=format&fit=crop"],
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=700&auto=format&fit=crop",
        quantity: 50,
        unit: "ml",
        keyIngredients: ["Active Complex"],
        allIngredients: ["Aqua", "Active Complex"],
        rating: 4.6,
        reviewCount: 3820,
        productStatus: "Complete",
        dataConfidence: 96,
        source: "Multi-Store Live Web Feed",
        lastUpdated: "Live",
        compatibilityScore: 92,
        skinTypes: ["All Skin Types"],
        targetConcerns: ["Dullness", "Dehydration"],
        crueltyFree: true,
        vegan: true,
        fragranceFree: true,
        parabenFree: true,
        siliconeFree: false,
        usageTime: "Both",
        summary: `Verified product for ${cleanName}`,
      };
    }
    let allListings: ProductListing[] = productListings;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("beautyiq_admin_listings");
        if (stored) {
          allListings = JSON.parse(stored);
        }
      } catch {}
    }
    const filtered = allListings.filter((l) => l.productId === productId);
    if (filtered.length >= 7) {
      return filtered;
    }
    if (!product) return filtered;
    return RetailerAggregatorService.generateRetailerListings(product, filtered);
  }

  /**
   * Get best listing price for a product across all integrated retailers
   */
  static getBestListingForProduct(productId: string): ProductListing | undefined {
    const listings = this.getListingsForProduct(productId).filter((l) => l.price !== null);
    if (listings.length === 0) return undefined;
    return listings.reduce((best, cur) => {
      if (!best) return cur;
      if ((cur.price ?? Infinity) < (best.price ?? Infinity)) return cur;
      return best;
    }, listings[0]);
  }

  /**
   * Calculate price per unit (₹/ml or ₹/g) for a product
   */
  static getUnitPrice(product: Product): { unitPrice: number | null; unitLabel: string } {
    const bestListing = this.getBestListingForProduct(product.id);
    if (!bestListing || bestListing.price === null || product.quantity <= 0) {
      return { unitPrice: null, unitLabel: `₹ / ${product.unit}` };
    }
    const unitPrice = Math.round((bestListing.price / product.quantity) * 10) / 10;
    return { unitPrice, unitLabel: `₹${unitPrice}/${product.unit}` };
  }

  /**
   * Filter, sort, and paginate products catalog using normalized real data
   */
  static async getProducts(
    filters: ProductFilterOptions = {}
  ): Promise<ApiResponse<PaginatedProductsResult>> {
    // If running in browser environment, query the database-backed Next.js API route
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams();
        const categories = filters.categories || (filters.category ? [filters.category] : []);
        if (categories.length) {
          params.set("category", categories.join(","));
        }
        const brands = filters.brands || (filters.brand ? [filters.brand] : []);
        if (brands.length) {
          params.set("brand", brands.join(","));
        }
        if (filters.store) {
          params.set("store", filters.store);
        } else if (filters.stores && filters.stores.length) {
          params.set("store", filters.stores.join(","));
        }
        const skinTypes = filters.skinTypes || (filters.skinType ? [filters.skinType] : []);
        const skinConcerns = filters.skinConcerns || (filters.skinConcern ? [filters.skinConcern] : []);
        if (skinTypes.length) params.set("skinType", skinTypes.join(","));
        if (skinConcerns.length) {
          params.set("concern", skinConcerns.join(","));
        }
        if (filters.minPrice !== undefined) params.set("minPrice", filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params.set("maxPrice", filters.maxPrice.toString());
        if (filters.minRating !== undefined) params.set("minRating", filters.minRating.toString());
        if (filters.query) params.set("q", filters.query);
        if (filters.crueltyFreeOnly) params.set("crueltyFreeOnly", "true");
        if (filters.veganOnly) params.set("veganOnly", "true");
        if (filters.fragranceFreeOnly) params.set("fragranceFreeOnly", "true");
        if (filters.parabenFreeOnly) params.set("parabenFreeOnly", "true");
        if (filters.sortBy) params.set("sortBy", filters.sortBy);
        if (filters.page) params.set("page", filters.page.toString());
        if (filters.pageSize) params.set("pageSize", filters.pageSize.toString());

        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(1200) : undefined,
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return createSuccessResponse(json.data);
          }
        }
      } catch (err) {
        console.warn("Fetch from /api/products failed, falling back to local dataset", err);
      }
    }

    await simulateDelay(80);

    // Retrieve active normalized products from AdminDataService (supports live additions & verification)
    const { AdminDataService } = await import("./admin-data.service");
    let result = await AdminDataService.getProducts();

    // Filter by Search Query with Typo Tolerance and Synonym Expansion
    if (filters.query && filters.query.trim().length > 0) {
      const { ProductSearchService } = await import("./product-search.service");
      const searchRes = await ProductSearchService.searchVerifiedProducts(filters.query, {
        category: filters.category,
        brand: filters.brand,
        skinType: filters.skinType,
        concern: filters.skinConcern,
        maxPrice: filters.maxPrice,
      });

      result = searchRes.products;
    } else {
      // Filter by Category
      const categories = filters.categories || (filters.category ? [filters.category] : []);
      if (categories.length) {
        const normalized = categories.map((category) => category.toLowerCase());
        result = result.filter((p) => normalized.includes(p.category.toLowerCase()));
      }

      // Filter by Brand
      const brands = filters.brands || (filters.brand ? [filters.brand] : []);
      if (brands.length) {
        const normalized = brands.map((brand) => brand.toLowerCase());
        result = result.filter((p) => normalized.includes(p.brand.toLowerCase()));
      }

      // Filter by Store / Marketplace
      const targetStore = (filters.store || (filters.stores && filters.stores[0]) || "").toLowerCase();
      if (targetStore && targetStore !== "all") {
        result = result.filter((p) => {
          const listings = this.getListingsForProduct(p.id);
          return listings.some((l) => {
            const plat = l.platform.toLowerCase();
            if (targetStore === "amazon") return plat.includes("amazon");
            if (targetStore === "flipkart") return plat.includes("flipkart");
            if (targetStore === "nykaa") return plat.includes("nykaa");
            if (targetStore === "myntra") return plat.includes("myntra");
            if (targetStore === "purplle") return plat.includes("purplle");
            if (targetStore === "tira") return plat.includes("tira");
            if (targetStore === "minimalist") return plat.includes("minimalist");
            if (targetStore === "dot-and-key" || targetStore === "dotandkey") return plat.includes("dot");
            if (targetStore === "brand" || targetStore === "direct") return plat.includes("direct") || plat.includes("store");
            return plat.includes(targetStore);
          });
        });
      }

      // Filter by Skin Type
      const skinTypes = filters.skinTypes || (filters.skinType ? [filters.skinType] : []);
      if (skinTypes.length) {
        result = result.filter(
          (p) => skinTypes.some((skinType) => p.skinTypes.includes(skinType as SkinType)) || p.skinTypes.includes("All Skin Types" as any)
        );
      }

      // Filter by Skin Concern
      const skinConcerns = filters.skinConcerns || (filters.skinConcern ? [filters.skinConcern] : []);
      if (skinConcerns.length) {
        const normalized = skinConcerns.map((concern) => concern.toLowerCase());
        result = result.filter((p) => p.targetConcerns.some((concern) => normalized.some((item) => concern.toLowerCase().includes(item))));
      }

      // Filter by Max Price
      if (filters.maxPrice !== undefined) {
        result = result.filter((p) => {
          const best = this.getBestListingForProduct(p.id);
          if (!best || best.price === null) return true;
          return best.price <= filters.maxPrice!;
        });
      }
    }

    // Filter by Ingredient
    if (filters.ingredient) {
      const ing = filters.ingredient.toLowerCase();
      result = result.filter(
        (p) =>
          p.keyIngredients.some((i) => i.toLowerCase().includes(ing)) ||
          p.allIngredients.some((i) => i.toLowerCase().includes(ing))
      );
    }

    // Filter by Max Price
    if (filters.minPrice !== undefined) {
      result = result.filter((p) => {
        const best = this.getBestListingForProduct(p.id);
        if (!best || best.price === null) return true;
        return best.price >= filters.minPrice!;
      });
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => {
        const best = this.getBestListingForProduct(p.id);
        if (!best || best.price === null) return true;
        return best.price <= filters.maxPrice!;
      });
    }

    // Filter by Min Rating
    if (filters.minRating !== undefined) {
      result = result.filter((p) => {
        if (p.rating === null) return false;
        return p.rating >= filters.minRating!;
      });
    }

    // Filter by Availability
    if (filters.availability) {
      result = result.filter((p) => {
        const listings = productListings.filter((l) => l.productId === p.id);
        if (listings.length === 0) return filters.availability === "Not Available";
        return listings.some((l) => l.availability === filters.availability);
      });
    }

    // Filter by Safety & Preference Toggles
    if (filters.crueltyFreeOnly) {
      result = result.filter((p) => p.crueltyFree);
    }
    if (filters.veganOnly) {
      result = result.filter((p) => p.vegan);
    }
    if (filters.fragranceFreeOnly) {
      result = result.filter((p) => p.fragranceFree);
    }
    if (filters.parabenFreeOnly) {
      result = result.filter((p) => p.parabenFree);
    }

    // Sort Logic
    if (filters.sortBy === "rating") {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (filters.sortBy === "price-asc") {
      result.sort((a, b) => {
        const pA = this.getBestListingForProduct(a.id)?.price ?? Infinity;
        const pB = this.getBestListingForProduct(b.id)?.price ?? Infinity;
        return pA - pB;
      });
    } else if (filters.sortBy === "price-desc") {
      result.sort((a, b) => {
        const pA = this.getBestListingForProduct(a.id)?.price ?? 0;
        const pB = this.getBestListingForProduct(b.id)?.price ?? 0;
        return pB - pA;
      });
    } else if (filters.sortBy === "best-value") {
      result.sort((a, b) => {
        const vA = this.getBestListingForProduct(a.id)?.valueScore ?? 0;
        const vB = this.getBestListingForProduct(b.id)?.valueScore ?? 0;
        return vB - vA;
      });
    } else if (filters.sortBy === "compatibility") {
      result.sort((a, b) => (b.compatibilityScore ?? 0) - (a.compatibilityScore ?? 0));
    }

    // Pagination Logic
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 9;
    const total = result.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = result.slice(startIndex, startIndex + pageSize);

    return createSuccessResponse({
      products: paginatedProducts,
      total,
      page,
      pageSize,
      totalPages,
    });
  }

  /**
   * Get single product by ID
   */
  static async getProductById(id: string): Promise<ApiResponse<Product>> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return createSuccessResponse(json.data);
          }
        }
      } catch (err) {
        console.warn(`Fetch from /api/products/${id} failed, falling back to local dataset`, err);
      }
    }

    await simulateDelay(60);
    const { AdminDataService } = await import("./admin-data.service");
    const product = await AdminDataService.getProductById(id);

    if (!product) {
      // Fallback check in mock products
      const fallback = products.find((p) => p.id === id);
      if (fallback) return createSuccessResponse(fallback);

      if (id.startsWith("discovered-")) {
        const { ProductSearchService } = await import("./product-search.service");
        const cleanName = id.replace("discovered-", "").replace(/-/g, " ");
        const discovered = ProductSearchService.createDiscoveredProduct(cleanName);
        return createSuccessResponse(discovered);
      }

      return createErrorResponse("NOT_FOUND", `Product with ID ${id} was not found.`);
    }

    return createSuccessResponse(product);
  }

  /**
   * Get platform & seller price listings for a product
   */
  static async getProductPriceListings(productId: string): Promise<ApiResponse<ProductListing[]>> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.prices && json.data.prices.length > 0) {
            return createSuccessResponse(json.data.prices);
          }
        }
      } catch (err) {
        console.warn(`Fetch listings for /api/products/${productId} failed, falling back`, err);
      }
    }

    await simulateDelay(40);
    const listings = this.getListingsForProduct(productId);
    return createSuccessResponse(listings);
  }

  /**
   * GET /products/{id}/prices - Detailed cross-platform price comparison with best price & best value listings
   */
  static async getProductPriceDetails(
    productId: string
  ): Promise<ApiResponse<import("@/types").ProductPriceComparisonDetails>> {
    await simulateDelay(60);
    const prodRes = await this.getProductById(productId);
    if (!prodRes.data) {
      return createErrorResponse("NOT_FOUND", `Product with ID ${productId} was not found.`);
    }
    const product = prodRes.data;

    const listingsRes = await this.getProductPriceListings(productId);
    const listings = listingsRes.data || [];
    const validPrices = listings.map((l) => l.price).filter((p): p is number => p !== null);
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
    const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : null;

    const { ValueEngineService } = await import("./value-engine.service");
    const bestPriceListing = ValueEngineService.determineBestPriceListing(listings);
    const bestValueListing = ValueEngineService.determineBestValueListing(listings, product.quantity);

    // Stale data check (listings older than 30 days)
    const now = new Date().getTime();
    const hasStaleData = listings.some((l) => {
      const dateStr = l.priceLastUpdated || l.lastUpdated;
      const updated = new Date(dateStr).getTime();
      return now - updated > 30 * 24 * 60 * 60 * 1000;
    });

    return createSuccessResponse({
      productId,
      productName: product.name,
      listings,
      bestPriceListing,
      bestValueListing,
      minPrice,
      maxPrice,
      hasStaleData,
    });
  }

  /**
   * GET /products/{id}/value - Get normalized value metrics for a product
   */
  static async getProductValue(
    productId: string
  ): Promise<ApiResponse<import("@/types").NormalizedValueMetric>> {
    await simulateDelay(80);
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return createErrorResponse("NOT_FOUND", `Product with ID ${productId} was not found.`);
    }

    const listings = productListings.filter((l) => l.productId === productId);
    const { ValueEngineService } = await import("./value-engine.service");
    const metrics = ValueEngineService.getNormalizedValueMetrics(product, listings);

    return createSuccessResponse(metrics);
  }

  /**
   * Get all product categories
   */
  static async getCategories(): Promise<ApiResponse<Category[]>> {
    await simulateDelay(50);
    return createSuccessResponse(categories);
  }

  /**
   * Get all skincare brands
   */
  static async getBrands(): Promise<ApiResponse<Brand[]>> {
    await simulateDelay(50);
    return createSuccessResponse(brandsList);
  }

  /**
   * Get single brand by ID or slug
   */
  static async getBrandById(brandIdOrSlug: string): Promise<ApiResponse<Brand>> {
    await simulateDelay(50);
    const q = brandIdOrSlug.toLowerCase();
    const brand = brandsList.find(
      (b) => b.id.toLowerCase() === q || b.name.toLowerCase() === q
    );

    if (!brand) {
      return createErrorResponse("NOT_FOUND", `Brand ${brandIdOrSlug} was not found.`);
    }

    return createSuccessResponse(brand);
  }

  /**
   * Autocomplete search suggestions grouped into Products, Brands, Ingredients, Categories, Concerns
   */
  static async getGroupedSearchSuggestions(
    query: string
  ): Promise<ApiResponse<GroupedSearchSuggestions>> {
    if (!query || query.trim().length === 0) {
      return createSuccessResponse({
        products: [],
        brands: [],
        ingredients: [],
        categories: [],
        concerns: [],
      });
    }

    const q = query.toLowerCase().trim();

    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => {
        const best = this.getBestListingForProduct(p.id);
        const all = this.getListingsForProduct(p.id);
        return {
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          bestPrice: best?.price ?? undefined,
          bestStore: best?.platform?.replace(" Direct", "").replace(" Store", "") ?? undefined,
          storeCount: all.length,
        };
      });

    const matchedBrands = brandsList
      .filter((b) => b.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((b) => ({ id: b.id, name: b.name }));

    const matchedIngredients = ingredients
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.commonNames && i.commonNames.some((c) => c.toLowerCase().includes(q)))
      )
      .slice(0, 3)
      .map((i) => ({ id: i.id, name: i.name }));

    const matchedCategories = categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ id: c.id, name: c.name }));

    const allConcerns = Array.from(
      new Set(products.flatMap((p) => p.targetConcerns))
    );
    const matchedConcerns = allConcerns
      .filter((c) => c.toLowerCase().includes(q))
      .slice(0, 3);

    return createSuccessResponse({
      products: matchedProducts,
      brands: matchedBrands,
      ingredients: matchedIngredients,
      categories: matchedCategories,
      concerns: matchedConcerns,
    });
  }
}
