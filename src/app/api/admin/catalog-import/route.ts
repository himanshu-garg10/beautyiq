import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { importOpenBeautyFacts } from "@/server/open-beauty-facts-importer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

export async function DELETE() {
  const user = await getSessionUser();
  if (!user || !isCatalogAdmin(user.email)) {
    return NextResponse.json({ success: false, error: "Administrator access is required to remove demo data." }, { status: 403 });
  }

  // Only products with the deliberately seeded p1...p13 identifiers are removed.
  // Imported Open Beauty Facts products use obf-* slugs and are never selected.
  const demoLegacyIds = Array.from({ length: 13 }, (_, index) => `p${index + 1}`);
  const demoProducts = await prisma.product.findMany({
    where: { legacyId: { in: demoLegacyIds } },
    select: { id: true, slug: true, legacyId: true },
  });
  const objectIds = demoProducts.map((product: any) => product.id);
  const savedKeys = demoProducts.flatMap((product: any) => [product.id, product.slug, product.legacyId].filter(Boolean));

  if (objectIds.length === 0) {
    return NextResponse.json({ success: true, data: { removed: 0 } });
  }

  await prisma.$transaction([
    prisma.savedProduct.deleteMany({ where: { productId: { in: savedKeys } } }),
    prisma.price.deleteMany({ where: { productId: { in: objectIds } } }),
    prisma.productIngredient.deleteMany({ where: { productId: { in: objectIds } } }),
    prisma.product.deleteMany({ where: { id: { in: objectIds } } }),
  ]);

  return NextResponse.json({ success: true, data: { removed: objectIds.length } });
}
