import { NextRequest, NextResponse } from "next/server";
import { WishlistService } from "@/services/wishlist.service";
import { AuthGuard } from "@/lib/security/auth-guard";
import { InputValidator } from "@/lib/security/input-validator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u1";

    // 1. Object-Level Authorization: customer cannot access another customer's wishlist
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    const res = await WishlistService.getWishlist(userId);
    return NextResponse.json(res, { status: 200 });
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to retrieve wishlist items.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { productId, userId = "u1" } = body;

    // 1. Object-Level Authorization
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    // 2. Input Validation
    if (!productId || !InputValidator.isValidId(productId)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Valid Product ID is required." },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const res = await WishlistService.addToWishlist(userId, productId);
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to add product to wishlist.");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u1";

    // 1. Object-Level Authorization
    const auth = AuthGuard.verifyOwnership(req, userId);
    if (!auth.authorized) {
      return auth.response!;
    }

    const res = await WishlistService.clearWishlist(userId);
    return NextResponse.json(res, { status: 200 });
  } catch (error: any) {
    return InputValidator.createSafeErrorResponse(error, "Failed to clear wishlist.");
  }
}

