import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

const categories = new Set([
  "Face Wash", "Cleanser", "Serum", "Moisturizer", "Sunscreen", "Toner",
  "Exfoliator", "Acne Focused Products", "Face Masks", "Lip Care", "Eye Care", "Treatment Products",
]);

function isCatalogAdmin(email: string) {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.trim().toLowerCase());
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
}

function validHttpUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 2000) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isCatalogAdmin(user.email)) {
    return NextResponse.json({ success: false, error: "Administrator access is required to add products." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
  const brand = typeof body.brand === "string" ? body.brand.trim().slice(0, 100) : "";
  const category = typeof body.category === "string" && categories.has(body.category) ? body.category : "";
  const sourceUrl = validHttpUrl(body.sourceUrl);
  const image = validHttpUrl(body.image);
  const quantity = Number(body.quantity);
  const unit = ["ml", "g", "pcs", "sheets"].includes(body.unit) ? body.unit : "ml";

  if (!name || !brand || !category || !sourceUrl || !image || !Number.isFinite(quantity) || quantity <= 0 || quantity > 10000) {
    return NextResponse.json({ success: false, error: "Name, brand, category, source URL, image URL, and a valid quantity are required." }, { status: 400 });
  }

  const rawIngredients: string[] = typeof body.ingredients === "string"
    ? body.ingredients.split(/[,;\n]/).map((item: string) => item.trim()).filter((item: string) => Boolean(item))
    : [];
  const ingredients = Array.from(new Set<string>(rawIngredients)).slice(0, 80);
  const now = new Date().toISOString();
  const productSlug = `manual-${slugify(`${brand}-${name}`)}-${Date.now().toString(36)}`;

  try {
    const links = (await Promise.all(ingredients.map(async (ingredientName, orderIndex) => {
      const ingredientSlug = slugify(ingredientName);
      if (!ingredientSlug) return null;
      const ingredient = await prisma.ingredient.upsert({
        where: { slug: ingredientSlug },
        create: {
          slug: ingredientSlug, legacyId: `manual-ingredient-${ingredientSlug}`, name: ingredientName,
          description: "Ingredient name entered from a product label; suitability has not been independently assessed.",
          function: "Not assessed", category: "Unclassified", concernTags: "[]", safetyRating: "Not assessed",
          suitableSkinTypes: "[]", status: "imported_unclassified",
        },
        update: {}, select: { id: true },
      });
      return { ingredientId: ingredient.id, orderIndex, isKey: orderIndex < 5 };
    }))).filter((item): item is { ingredientId: string; orderIndex: number; isKey: boolean } => item !== null);

    const product = await prisma.product.create({
      data: {
        slug: productSlug, name, brand, category, description: `${name} by ${brand}. Added from a retailer or official brand source URL.`,
        images: JSON.stringify([image]), image, quantity, unit, reviewCount: 0,
        productStatus: ingredients.length ? "Complete" : "Incomplete", dataConfidence: ingredients.length ? 75 : 55,
        source: `Admin-added source | ${sourceUrl}`, lastUpdated: now, skinTypes: "[]", targetConcerns: "[]",
        crueltyFree: false, vegan: false, fragranceFree: false, parabenFree: false, siliconeFree: false,
        usageTime: "Both", summary: "Source-linked product. Ingredient suitability is based only on the provided label data.",
        isVerified: true, productIngredients: { create: links },
      },
    });

    const price = Number(body.price);
    const offerUrl = validHttpUrl(body.offerUrl) || sourceUrl;
    if (Number.isFinite(price) && price > 0) {
      await prisma.price.create({
        data: {
          productId: product.id, platform: typeof body.platform === "string" ? body.platform.slice(0, 60) || "Official Store" : "Official Store",
          seller: typeof body.seller === "string" ? body.seller.slice(0, 100) || brand : brand,
          price, quantity, unit, availability: "Available", productUrl: offerUrl, lastUpdated: now,
        },
      });
    }

    return NextResponse.json({ success: true, data: { id: product.id, name: product.name } }, { status: 201 });
  } catch (error) {
    console.error("Verified product creation failed", error);
    return NextResponse.json({ success: false, error: "Could not save this product. Check that this exact product was not already added." }, { status: 500 });
  }
}
