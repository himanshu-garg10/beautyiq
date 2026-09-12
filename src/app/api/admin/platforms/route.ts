import { NextRequest, NextResponse } from "next/server";
import { AdminDataService } from "@/services/admin-data.service";
import { checkAdminAuth } from "../auth-check";

export async function GET(req: NextRequest) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const platforms = await AdminDataService.getPlatforms();
    return NextResponse.json({ success: true, data: platforms });
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
    if (!body.name || !body.baseUrl) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Platform name and base URL required" } },
        { status: 400 }
      );
    }
    const created = await AdminDataService.createPlatform(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
