import { NextRequest, NextResponse } from "next/server";
import { ComparisonService } from "@/services/comparison.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productIds, userProfile } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "productIds must be an array of product ID strings.",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const res = await ComparisonService.compareProducts(productIds, userProfile || null);

    if (!res.success) {
      return NextResponse.json(res, { status: 400 });
    }

    return NextResponse.json(res, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error?.message || "An error occurred while comparing products.",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
