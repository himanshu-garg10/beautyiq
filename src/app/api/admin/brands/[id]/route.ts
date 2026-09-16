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
    if (body.name && AdminDataService.checkDuplicateBrand(body.name, params.id)) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE_ERROR", message: `Another brand named "${body.name}" already exists` } },
        { status: 409 }
      );
    }

    const updated = await AdminDataService.updateBrand(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Brand not found" } },
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
