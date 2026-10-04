import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "@/lib/product-format";

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

    // Fetch products with prices and ingredients
    let rawProducts = await prisma.product.findMany({
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

    // Post-filter JSON fields (concern, skinType) and maxPrice
    if (concerns.length) {
      const normalizedConcerns = concerns.map((concern) => concern.toLowerCase());
      rawProducts = rawProducts.filter((p: any) => {
        try {
          const concerns: string[] = JSON.parse(p.targetConcerns);
          return concerns.some((c) => normalizedConcerns.some((concern) => c.toLowerCase().includes(concern)));
        } catch {
          return false;
        }
      });
    }

    if (skinTypes.length) {
      const normalizedSkins = skinTypes.map((skinType) => skinType.toLowerCase());
      rawProducts = rawProducts.filter((p: any) => {
        try {
          const skinTypes: string[] = JSON.parse(p.skinTypes);
          return skinTypes.some((s) => normalizedSkins.some((skinType) => s.toLowerCase().includes(skinType)));
        } catch {
          return false;
        }
      });
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      rawProducts = rawProducts.filter((p: any) => {
        const availablePrices = p.prices
          .map((pr: any) => pr.price)
          .filter((val: unknown): val is number => typeof val === "number" && val > 0);
        if (availablePrices.length === 0) return true; // keep if no price listed yet
        const minPrice = Math.min(...availablePrices);
        return minPrice <= maxPrice;
      });
    }
    if (minPrice !== undefined && !isNaN(minPrice)) {
      rawProducts = rawProducts.filter((p: any) => {
        const availablePrices = p.prices.map((pr: any) => pr.price).filter((val: unknown): val is number => typeof val === "number" && val > 0);
        if (availablePrices.length === 0) return true;
        return Math.min(...availablePrices) >= minPrice;
      });
    }

    // Sort products
    if (sortBy === "rating") {
      rawProducts.sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "price-asc") {
      rawProducts.sort((a: any, b: any) => {
        const aMin = Math.min(...(a.prices.map((p: any) => p.price ?? 99999)));
        const bMin = Math.min(...(b.prices.map((p: any) => p.price ?? 99999)));
        return aMin - bMin;
      });
    } else if (sortBy === "price-desc") {
      rawProducts.sort((a: any, b: any) => {
        const aMin = Math.max(...(a.prices.map((p: any) => p.price ?? 0)));
        const bMin = Math.max(...(b.prices.map((p: any) => p.price ?? 0)));
        return bMin - aMin;
      });
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
