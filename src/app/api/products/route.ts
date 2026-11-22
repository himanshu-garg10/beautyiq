import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "@/lib/product-format";
import { RetailerAggregatorService } from "@/services/retailer-aggregator.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categories = (searchParams.get("category") || "").split(",").map((item) => item.trim()).filter(Boolean);
    const concerns = (searchParams.get("concern") || searchParams.get("skinConcern") || "").split(",").map((item) => item.trim()).filter(Boolean);
    const maxPriceStr = searchParams.get("maxPrice");
    const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;
    const minPriceStr = searchParams.get("minPrice");
    const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
    const skinTypes = (searchParams.get("skinType") || "").split(",").map((item) => item.trim()).filter(Boolean);
    const brands = (searchParams.get("brand") || "").split(",").map((item) => item.trim()).filter(Boolean);
    const store = (searchParams.get("store") || searchParams.get("platform") || "").toLowerCase().trim();
    const query = searchParams.get("q") || searchParams.get("query");
    const minRatingStr = searchParams.get("minRating");
    const minRating = minRatingStr ? parseFloat(minRatingStr) : undefined;
    const crueltyFree = searchParams.get("crueltyFreeOnly") === "true";
    const vegan = searchParams.get("veganOnly") === "true";
    const fragranceFree = searchParams.get("fragranceFreeOnly") === "true";
    const parabenFree = searchParams.get("parabenFreeOnly") === "true";
    const sortBy = searchParams.get("sortBy") || "relevance";

    // Input validation
    if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) {
      return NextResponse.json(
        { success: false, error: "maxPrice must be a valid positive number" },
        { status: 400 }
      );
    }
    if (minPrice !== undefined && (isNaN(minPrice) || minPrice < 0)) {
      return NextResponse.json({ success: false, error: "minPrice must be a valid positive number" }, { status: 400 });
    }

    if (minRating !== undefined && (isNaN(minRating) || minRating < 0 || minRating > 5)) {
      return NextResponse.json(
        { success: false, error: "minRating must be a number between 0 and 5" },
        { status: 400 }
      );
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    // Build Prisma where filter
    const where: any = {};

    if (categories.length) {
      where.category = { in: categories };
    }

    if (brands.length) {
      where.brand = { in: brands };
    }

    if (crueltyFree) where.crueltyFree = true;
    if (vegan) where.vegan = true;
    if (fragranceFree) where.fragranceFree = true;
    if (parabenFree) where.parabenFree = true;

    if (minRating !== undefined && !isNaN(minRating)) {
      where.rating = { gte: minRating };
    }

    // Query text search across name, brand, slug, description, and summary
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { slug: { contains: q } },
        { description: { contains: q } },
        { summary: { contains: q } },
      ];
    }

    // Check if real production database is configured (otherwise serve immediately from local catalog to avoid timeouts)
    const isLocalMockDb =
      !process.env.DATABASE_URL ||
      process.env.DATABASE_URL.includes("localhost") ||
      process.env.DATABASE_URL.includes("127.0.0.1") ||
      process.env.DATABASE_URL.includes("cluster0.xxxxx");

    let rawProducts: any[] = [];

    if (!isLocalMockDb) {
      try {
        const dbPromise = prisma.product.findMany({
          where,
          include: {
            prices: true,
            productIngredients: {
              include: {
                ingredient: true,
              },
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("DB_TIMEOUT")), 600)
        );
        rawProducts = (await Promise.race([dbPromise, timeoutPromise])) as any[];
      } catch {
        rawProducts = [];
      }
    }

    // Seamless fallback to the rich in-memory catalog
    if (!rawProducts || rawProducts.length === 0) {
      const { products } = await import("@/data/products");
      let filtered = [...products] as any[];

      if (categories.length) {
        filtered = filtered.filter((p) =>
          categories.some((c) => p.category.toLowerCase() === c.toLowerCase())
        );
      }
      if (brands.length) {
        filtered = filtered.filter((p) =>
          brands.some((b) => p.brand.toLowerCase() === b.toLowerCase())
        );
      }
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.allIngredients && p.allIngredients.some((i: string) => i.toLowerCase().includes(q)))
        );
      }
      if (crueltyFree) filtered = filtered.filter((p) => p.crueltyFree);
      if (vegan) filtered = filtered.filter((p) => p.vegan);
      if (fragranceFree) filtered = filtered.filter((p) => p.fragranceFree);
      if (parabenFree) filtered = filtered.filter((p) => p.parabenFree);
      if (minRating !== undefined && !isNaN(minRating)) {
        filtered = filtered.filter((p) => (p.rating ?? 0) >= minRating);
      }

      // Ensure every fallback product has live multi-retailer comparative prices attached
      rawProducts = filtered.map((p) => {
        const listings = RetailerAggregatorService.generateListingsForProduct(p);
        return {
          ...p,
          prices: listings.map((l) => ({
            id: l.id,
            productId: p.id,
            platformId: l.platform,
            platform: l.platform,
            price: l.price,
            originalPrice: l.originalPrice,
            discountPercent: l.discountPercent,
            productUrl: l.productUrl,
            availability: l.availability,
            deliveryEstimate: l.deliveryEstimate,
            seller: l.seller,
            isBestPrice: l.isBestPrice,
            isBestValue: l.isBestValue,
            lastUpdated: new Date().toISOString(),
          })),
        };
      });
    } else {
      // For products from DB, ensure prices array is present
      rawProducts = rawProducts.map((p) => {
        if (!p.prices || p.prices.length === 0) {
          const listings = RetailerAggregatorService.generateListingsForProduct(p);
          return {
            ...p,
            prices: listings.map((l) => ({
              id: l.id,
              productId: p.id,
              platformId: l.platform,
              platform: l.platform,
              price: l.price,
              originalPrice: l.originalPrice,
              discountPercent: l.discountPercent,
              productUrl: l.productUrl,
              availability: l.availability,
              deliveryEstimate: l.deliveryEstimate,
              seller: l.seller,
              isBestPrice: l.isBestPrice,
              isBestValue: l.isBestValue,
              lastUpdated: new Date().toISOString(),
            })),
          };
        }
        return p;
      });
    }

    // Safe helper to extract string array whether stored as JSON string or raw array
    const extractList = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          return [val];
        }
      }
      return [];
    };

    // Filter by store/platform if requested (Amazon, Flipkart, Myntra, Nykaa, Purplle, Tira, Brand Store)
    if (store && store !== "all" && store !== "") {
      rawProducts = rawProducts.filter((p: any) => {
        const prices = p.prices || [];
        return prices.some((pr: any) => {
          const plat = String(pr.platformId || pr.platform || "").toLowerCase();
          if (store === "amazon") return plat.includes("amazon");
          if (store === "flipkart") return plat.includes("flipkart");
          if (store === "myntra") return plat.includes("myntra");
          if (store === "nykaa") return plat.includes("nykaa");
          if (store === "purplle") return plat.includes("purplle");
          if (store === "tira") return plat.includes("tira");
          if (store === "minimalist") return plat.includes("minimalist");
          if (store === "dot-and-key" || store === "dotandkey") return plat.includes("dot");
          if (store === "brand" || store === "direct") return plat.includes("direct") || plat.includes("store");
          return plat.includes(store);
        });
      });
    }

    // Post-filter JSON fields (concern, skinType) and maxPrice
    if (concerns.length) {
      const normalizedConcerns = concerns.map((concern) => concern.toLowerCase());
      rawProducts = rawProducts.filter((p: any) => {
        const productConcerns = extractList(p.targetConcerns);
        return productConcerns.some((c) =>
          normalizedConcerns.some((concern) => c.toLowerCase().includes(concern))
        );
      });
    }

    if (skinTypes.length) {
      const normalizedSkins = skinTypes.map((skinType) => skinType.toLowerCase());
      rawProducts = rawProducts.filter((p: any) => {
        const productSkins = extractList(p.skinTypes);
        return (
          productSkins.some((s) => s.toLowerCase() === "all skin types") ||
          productSkins.some((s) => normalizedSkins.some((skinType) => s.toLowerCase().includes(skinType)))
        );
      });
    }

    const getMinProductPrice = (p: any): number => {
      const prices = (p.prices || [])
        .map((pr: any) => pr.price)
        .filter((val: unknown): val is number => typeof val === "number" && val > 0);
      return prices.length > 0 ? Math.min(...prices) : 99999;
    };

    const getMaxProductPrice = (p: any): number => {
      const prices = (p.prices || [])
        .map((pr: any) => pr.price)
        .filter((val: unknown): val is number => typeof val === "number" && val > 0);
      return prices.length > 0 ? Math.max(...prices) : 0;
    };

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      rawProducts = rawProducts.filter((p: any) => {
        const minP = getMinProductPrice(p);
        return minP <= maxPrice;
      });
    }
    if (minPrice !== undefined && !isNaN(minPrice)) {
      rawProducts = rawProducts.filter((p: any) => {
        const minP = getMinProductPrice(p);
        return minP >= minPrice;
      });
    }

    // Sort products
    if (sortBy === "rating") {
      rawProducts.sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "price-asc") {
      rawProducts.sort((a: any, b: any) => getMinProductPrice(a) - getMinProductPrice(b));
    } else if (sortBy === "price-desc") {
      rawProducts.sort((a: any, b: any) => getMaxProductPrice(b) - getMaxProductPrice(a));
    }

    const facets = {
      brands: Array.from(new Set<string>(rawProducts.map((product: any) => String(product.brand)))).sort((a, b) => a.localeCompare(b)),
      categories: Array.from(new Set<string>(rawProducts.map((product: any) => String(product.category)))).sort((a, b) => a.localeCompare(b)),
    };
    const total = rawProducts.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = rawProducts.slice((page - 1) * pageSize, page * pageSize);

    // Format products for frontend consumption
    const formatted = paginated.map(formatProduct);

    return NextResponse.json({
      success: true,
      data: {
        products: formatted,
        total,
        page,
        pageSize,
        totalPages,
        facets,
      },
      products: formatted,
      total,
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error fetching products" },
      { status: 500 }
    );
  }
}
