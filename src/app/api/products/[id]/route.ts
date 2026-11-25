import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "@/lib/product-format";
import { RetailerAggregatorService } from "@/services/retailer-aggregator.service";

export const dynamic = "force-dynamic";

function isValidObjectId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params?.id?.trim();

    if (!rawId) {
      return NextResponse.json(
        { success: false, error: "Product identifier is required." },
        { status: 400 }
      );
    }

    // Lookup by stable slug, legacyId (e.g. "p1"), or MongoDB ObjectId
    const isLocalMockDb =
      !process.env.DATABASE_URL ||
      process.env.DATABASE_URL.includes("localhost") ||
      process.env.DATABASE_URL.includes("127.0.0.1") ||
      process.env.DATABASE_URL.includes("cluster0.xxxxx");

    let rawProduct: any = null;

    if (!isLocalMockDb) {
      try {
        const dbPromise = prisma.product.findFirst({
          where: {
            OR: [
              { slug: rawId },
              { legacyId: rawId },
              ...(isValidObjectId(rawId) ? [{ id: rawId }] : []),
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
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("DB_TIMEOUT")), 600)
        );
        rawProduct = await Promise.race([dbPromise, timeoutPromise]);
      } catch {
        rawProduct = null;
      }
    }

    if (!rawProduct) {
      const { products, productListings } = await import("@/data/products");
      const found = products.find(
        (p) => p.id === rawId || p.id.toLowerCase() === rawId.toLowerCase()
      );
      if (found) {
        const allSaved = Array.isArray(productListings) ? productListings : [];
        const existingForProduct = allSaved.filter((l) => l.productId === found.id);
        const listings =
          existingForProduct.length >= 7
            ? existingForProduct
            : RetailerAggregatorService.generateListingsForProduct(found, existingForProduct);
        rawProduct = {
          ...found,
          prices: listings,
        };
      }
    }

    if (!rawProduct) {
      return NextResponse.json(
        { success: false, error: `Product with identifier '${rawId}' was not found.` },
        { status: 404 }
      );
    }

    const formatted = formatProduct(rawProduct);

    return NextResponse.json({
      success: true,
      data: formatted,
      product: formatted,
    });
  } catch (error: any) {
    console.error(`GET /api/products/${params?.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error fetching product" },
      { status: 500 }
    );
  }
}
