import { NextRequest, NextResponse } from "next/server";
import { AdminDataService } from "@/services/admin-data.service";
import { checkAdminAuth } from "../auth-check";

export async function GET(req: NextRequest) {
  const auth = checkAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const reportType = req.nextUrl.searchParams.get("reportType") || undefined;

    const reports = await AdminDataService.getReports({ status, reportType });
    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
