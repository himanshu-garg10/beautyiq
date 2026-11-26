import { NextRequest, NextResponse } from "next/server";
import { AdminDataService } from "@/services/admin-data.service";
import { checkAdminAuth } from "../auth-check";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const issues = await AdminDataService.getDataQualityIssues();
    const duplicates = await AdminDataService.getDuplicateCandidates();
    return NextResponse.json({
      success: true,
      data: {
        issues,
        duplicates,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { type, id, action } = body;

    if (type === "issue") {
      await AdminDataService.resolveDataQualityIssue(id);
      return NextResponse.json({ success: true, data: { resolved: true } });
    } else if (type === "duplicate") {
      await AdminDataService.resolveDuplicateCandidate(id, action || "dismissed");
      return NextResponse.json({ success: true, data: { updated: true } });
    }

    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid type specified" } },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
