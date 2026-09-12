import { NextRequest, NextResponse } from "next/server";
import { AdminDataService } from "@/services/admin-data.service";
import { checkAdminAuth } from "../auth-check";

export async function GET(req: NextRequest) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const productId = req.nextUrl.searchParams.get("productId") || undefined;
    const platform = req.nextUrl.searchParams.get("platform") || undefined;
    const availability = req.nextUrl.searchParams.get("availability") || undefined;
    const search = req.nextUrl.searchParams.get("search") || undefined;

    const listings = await AdminDataService.getListings({ productId, platform, availability, search });
    return NextResponse.json({ success: true, data: listings });
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
    if (!body.productId || !body.platform) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Product ID and platform are required" } },
        { status: 400 }
      );
    }
    const created = await AdminDataService.createListing(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
