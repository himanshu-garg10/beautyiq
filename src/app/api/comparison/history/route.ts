import { NextRequest, NextResponse } from "next/server";
import { ComparisonService } from "@/services/comparison.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const history = ComparisonService.getComparisonHistory();
    return NextResponse.json(
      {
        success: true,
        data: history,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error?.message || "Failed to retrieve comparison history.",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const updated = ComparisonService.deleteComparisonSession(sessionId);
      return NextResponse.json({
        success: true,
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } else {
      ComparisonService.clearComparisonHistory();
      return NextResponse.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error?.message || "Failed to modify comparison history.",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
