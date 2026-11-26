import { NextRequest, NextResponse } from "next/server";
import { AdminDataService } from "@/services/admin-data.service";
import { checkAdminAuth } from "../../auth-check";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    if (body.name && AdminDataService.checkDuplicateIngredient(body.name, params.id)) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE_ERROR", message: `Another ingredient named "${body.name}" exists` } },
        { status: 409 }
      );
    }

    const updated = await AdminDataService.updateIngredient(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Ingredient not found" } },
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
