import { NextRequest, NextResponse } from "next/server";
import { AdminDataService } from "@/services/admin-data.service";
import { checkAdminAuth } from "../auth-check";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const category = req.nextUrl.searchParams.get("category") || undefined;
    const brand = req.nextUrl.searchParams.get("brand") || undefined;
    const status = req.nextUrl.searchParams.get("status") || undefined;

    const products = await AdminDataService.getProducts({ search, category, brand, status });
    return NextResponse.json({ success: true, data: products });
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
    if (!body.name || !body.brand || !body.category) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name, brand, and category are required" } },
        { status: 400 }
      );
    }

    const created = await AdminDataService.createProduct(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
