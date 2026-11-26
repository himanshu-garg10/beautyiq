import { NextRequest, NextResponse } from "next/server";
import { WishlistService } from "@/services/wishlist.service";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u1";

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Product ID is required." },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const res = await WishlistService.removeFromWishlist(userId, productId);
    return NextResponse.json(res, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error?.message || "Failed to remove product from wishlist.",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
