import { NextRequest, NextResponse } from "next/server";
import { AdminDataService } from "@/services/admin-data.service";
import { checkAdminAuth } from "../auth-check";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const brands = await AdminDataService.getBrands({ search });
    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Brand name is required" } },
        { status: 400 }
      );
    }

    if (AdminDataService.checkDuplicateBrand(body.name)) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE_ERROR", message: `Brand "${body.name}" already exists` } },
        { status: 409 }
      );
    }

    const created = await AdminDataService.createBrand(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
