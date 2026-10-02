import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "@/lib/product-format";

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
    const rawProduct = await prisma.product.findFirst({
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
