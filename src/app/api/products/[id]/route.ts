import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "@/lib/product-format";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const rawProduct = await prisma.product.findUnique({
      where: { id },
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
        { success: false, error: `Product with ID '${id}' not found` },
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
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
