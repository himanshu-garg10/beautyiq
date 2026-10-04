import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "@/lib/product-format";
import type { ProductComparisonItem, ProductListing } from "@/types";

export const dynamic = "force-dynamic";

function isValidObjectId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Accept ?ids=p1,p2,p3 or multiple ?ids=p1&ids=p2
    const idsParam = searchParams.getAll("ids");
    let requestedIds: string[] = [];

    if (idsParam.length === 1 && idsParam[0].includes(",")) {
      requestedIds = idsParam[0].split(",").map((s) => s.trim()).filter(Boolean);
    } else if (idsParam.length > 0) {
      requestedIds = idsParam.flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean);
    }

    // Input validation
    if (requestedIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide product IDs via ?ids=p1,p2 or multiple ?ids= query parameters.",
        },
        { status: 400 }
      );
    }

    if (requestedIds.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "A maximum of 10 products can be compared simultaneously.",
        },
        { status: 400 }
      );
    }

    const validObjectIds = requestedIds.filter(isValidObjectId);

    // Match by slug, legacyId (e.g. "p1"), or MongoDB ObjectId
    const rawProducts = await prisma.product.findMany({
      where: {
        OR: [
          { slug: { in: requestedIds } },
          { legacyId: { in: requestedIds } },
          ...(validObjectIds.length > 0 ? [{ id: { in: validObjectIds } }] : []),
        ],
      },
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

    if (rawProducts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No matching products were found for the provided identifiers.",
        },
        { status: 404 }
      );
    }

    // Preserve the order of requested IDs using map by id/slug/legacyId
    const productMap = new Map<string, any>();
    rawProducts.forEach((p: any) => {
      productMap.set(p.id, p);
      if (p.slug) productMap.set(p.slug, p);
      if (p.legacyId) productMap.set(p.legacyId, p);
    });

    const orderedProducts = requestedIds
      .map((id) => productMap.get(id))
      .filter((p, index, self): p is NonNullable<typeof p> => Boolean(p) && self.indexOf(p) === index);

    // Build comparison items
    const comparisonItems: ProductComparisonItem[] = orderedProducts.map((raw) => {
      const formatted = formatProduct(raw);
      const listings = (raw.prices || []) as any as ProductListing[];

      // Find best price listing
      const availableListings = listings.filter((l) => l.price !== null && (l.price ?? 0) > 0);
      const bestPriceListing =
        availableListings.length > 0
          ? availableListings.reduce((best, cur) =>
              (cur.price ?? Infinity) < (best.price ?? Infinity) ? cur : best
            )
          : null;

      // Find best value listing
      const bestValueListing =
        availableListings.length > 0
          ? availableListings.reduce((best, cur) =>
              (cur.valueScore ?? 0) > (best.valueScore ?? 0) ? cur : best
            )
          : null;

      const lowestPrice = bestPriceListing?.price ?? null;
      const unitPriceVal =
        lowestPrice && formatted.quantity > 0
          ? Math.round((lowestPrice / formatted.quantity) * 10) / 10
          : null;

      const unitPriceLabel = unitPriceVal
        ? `₹${unitPriceVal}/${formatted.unit}`
        : `₹ / ${formatted.unit}`;

      // Value For Money (VFM) score: based on rating, ingredients count, and price
      const vfmIndex = Math.min(
        100,
        Math.max(
          40,
          Math.round(
            ((formatted.rating ?? 4.0) / 5) * 50 +
              (unitPriceVal ? Math.max(10, 50 - unitPriceVal) : 25)
          )
        )
      );

      return {
        product: formatted,
        listings,
        vfmIndex,
        suitabilityMatch: formatted.compatibilityScore ?? null,
        bestPriceListing,
        bestValueListing,
        unitPriceLabel,
        unitPriceValue: unitPriceVal,
      };
    });

    // Mark relative bests
    const validPrices = comparisonItems
      .map((i) => i.unitPriceValue)
      .filter((v): v is number => v !== null);
    const minUnitPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

    const validRatings = comparisonItems
      .map((i) => i.product.rating)
      .filter((r): r is number => r !== null);
    const maxRating = validRatings.length > 0 ? Math.max(...validRatings) : null;

    const maxVfm = Math.max(...comparisonItems.map((i) => i.vfmIndex));

    comparisonItems.forEach((item) => {
      item.isBestPriceOverall = minUnitPrice !== null && item.unitPriceValue === minUnitPrice;
      item.isBestRatedOverall = maxRating !== null && item.product.rating === maxRating;
      item.isBestValueOverall = item.vfmIndex === maxVfm;
    });

    // Extract common ingredients
    const allIngredientsLists = comparisonItems.map((item) => item.product.allIngredients);
    const commonIngredients =
      allIngredientsLists.length > 0
        ? allIngredientsLists[0].filter((ing) =>
            allIngredientsLists.every((list) =>
              list.some((other) => other.toLowerCase() === ing.toLowerCase())
            )
          )
        : [];

    return NextResponse.json({
      success: true,
      data: comparisonItems,
      comparison: {
        items: comparisonItems,
        commonIngredients,
        totalCompared: comparisonItems.length,
      },
    });
  } catch (error: any) {
    console.error("GET /api/compare error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error comparing products." },
      { status: 500 }
    );
  }
}
