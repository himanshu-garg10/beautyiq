import { NextRequest, NextResponse } from "next/server";
import { AdminDataService } from "@/services/admin-data.service";
import { checkAdminAuth } from "../auth-check";

export async function GET(req: NextRequest) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const entity = req.nextUrl.searchParams.get("entity") || undefined;
    const action = req.nextUrl.searchParams.get("action") || undefined;
    const search = req.nextUrl.searchParams.get("search") || undefined;

    const logs = await AdminDataService.getLogs({ entity, action, search });
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
