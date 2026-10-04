import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { importOpenBeautyFacts } from "@/server/open-beauty-facts-importer";

function isCatalogAdmin(email: string) {
  const administrators = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return administrators.includes(email.trim().toLowerCase());
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isCatalogAdmin(user.email)) {
    return NextResponse.json({ success: false, error: "Administrator access is required to import catalog data." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim().slice(0, 80) : "skincare";
  if (!query) return NextResponse.json({ success: false, error: "A search term is required." }, { status: 400 });

  try {
    const result = await importOpenBeautyFacts(query);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Open Beauty Facts import failed", error);
    return NextResponse.json({ success: false, error: "Catalog import failed. Please try again." }, { status: 502 });
  }
}
