import { NextRequest, NextResponse } from "next/server";
import { AdminDataService } from "@/services/admin-data.service";
import { checkAdminAuth } from "../../auth-check";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    if (!body.status || !["open", "in_progress", "resolved", "closed"].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Valid status required" } },
        { status: 400 }
      );
    }

    const updated = await AdminDataService.updateSupportStatus(
      params.id,
      body.status,
      body.adminResponse
    );
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Support request not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
