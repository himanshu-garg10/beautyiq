import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "@/lib/product-format";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const concern = searchParams.get("concern") || searchParams.get("skinConcern");
    const maxPriceStr = searchParams.get("maxPrice");
    const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;
    const skinType = searchParams.get("skinType");
    const brand = searchParams.get("brand");
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

    if (category && category !== "All" && category !== "all" && category !== "") {
      where.category = { equals: category };
    }

    if (brand && brand !== "All" && brand !== "all" && brand !== "") {
      where.brand = { equals: brand };
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
    if (concern) {
      const normalizedConcern = concern.toLowerCase();
      rawProducts = rawProducts.filter((p) => {
        try {
          const concerns: string[] = JSON.parse(p.targetConcerns);
          return concerns.some((c) => c.toLowerCase().includes(normalizedConcern));
        } catch {
          return false;
        }
      });
    }

    if (skinType) {
      const normalizedSkin = skinType.toLowerCase();
      rawProducts = rawProducts.filter((p) => {
        try {
          const skinTypes: string[] = JSON.parse(p.skinTypes);
          return skinTypes.some((s) => s.toLowerCase().includes(normalizedSkin));
        } catch {
          return false;
        }
      });
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      rawProducts = rawProducts.filter((p) => {
        const availablePrices = p.prices
          .map((pr) => pr.price)
          .filter((val): val is number => val !== null && val > 0);
        if (availablePrices.length === 0) return true; // keep if no price listed yet
        const minPrice = Math.min(...availablePrices);
        return minPrice <= maxPrice;
      });
    }

    // Sort products
    if (sortBy === "rating") {
      rawProducts.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "price-asc") {
      rawProducts.sort((a, b) => {
        const aMin = Math.min(...(a.prices.map((p) => p.price ?? 99999)));
        const bMin = Math.min(...(b.prices.map((p) => p.price ?? 99999)));
        return aMin - bMin;
      });
    } else if (sortBy === "price-desc") {
      rawProducts.sort((a, b) => {
        const aMin = Math.max(...(a.prices.map((p) => p.price ?? 0)));
        const bMin = Math.max(...(b.prices.map((p) => p.price ?? 0)));
        return bMin - aMin;
      });
    }

    const facets = {
      brands: [...new Set(rawProducts.map((product) => product.brand))].sort((a, b) => a.localeCompare(b)),
      categories: [...new Set(rawProducts.map((product) => product.category))].sort((a, b) => a.localeCompare(b)),
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
