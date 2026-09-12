import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Product ID parameter is required.",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const res = await ProductService.getProductValue(id);

    if (!res.success) {
      return NextResponse.json(res, { status: 404 });
    }

    return NextResponse.json(res, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error?.message || "Failed to retrieve normalized product value.",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
