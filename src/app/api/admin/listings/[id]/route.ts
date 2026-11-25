import { NextRequest, NextResponse } from "next/server";
import { AdminDataService } from "@/services/admin-data.service";
import { checkAdminAuth } from "../../auth-check";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const listing = await AdminDataService.getListingById(params.id);
    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: listing });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();

    // If updating price/availability specifically
    if (body.price !== undefined || body.availability !== undefined) {
      const updated = await AdminDataService.updatePriceAvailability(
        params.id,
        body.price,
        body.availability
      );
      return NextResponse.json({ success: true, data: updated });
    }

    const updated = await AdminDataService.updateListing(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const deleted = await AdminDataService.deleteListing(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
