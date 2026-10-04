import { prisma } from "@/lib/prisma";

const BASE_URL = "https://world.openbeautyfacts.org/cgi/search.pl";
const SOURCE_NAME = "Open Beauty Facts";

type OpenBeautyIngredient = { text?: string };
type OpenBeautyProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  categories?: string;
  quantity?: string;
  ingredients_text?: string;
  ingredients?: OpenBeautyIngredient[];
  image_front_url?: string;
  image_url?: string;
  url?: string;
};
type OpenBeautySearchResponse = { products?: OpenBeautyProduct[] };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function parseQuantity(value?: string): { quantity: number; unit: "ml" | "g" | "pcs" | "sheets" } | null {
  const match = value?.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(ml|g|gm|grams?|pcs?|pieces?|sheets?)/i);
  if (!match) return null;
  const quantity = Number(match[1]);
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  const rawUnit = match[2].toLowerCase();
  return {
    quantity,
    unit: rawUnit === "ml" ? "ml" : rawUnit.startsWith("g") ? "g" : rawUnit.includes("sheet") ? "sheets" : "pcs",
  };
}

function inferCategory(...values: string[]): string {
  const text = values.join(" ").toLowerCase();
  if (/(face wash|facial wash|cleanser)/.test(text)) return "Cleanser";
  if (/(serum|ampoule|essence)/.test(text)) return "Serum";
  if (/(sunscreen|sun screen|sunblock|spf)/.test(text)) return "Sunscreen";
  if (/(toner|mist)/.test(text)) return "Toner";
  if (/(moisturi[sz]er|face cream|gel cream|lotion)/.test(text)) return "Moisturizer";
  if (/(exfoliat|scrub|peel)/.test(text)) return "Exfoliator";
  if (/mask/.test(text)) return "Face Masks";
  if (/(lip balm|lip care|lip mask)/.test(text)) return "Lip Care";
  if (/(eye cream|under eye|eye serum)/.test(text)) return "Eye Care";
  return "Treatment Products";
}

function ingredientNames(product: OpenBeautyProduct): string[] {
  const fromText = product.ingredients_text?.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
  if (fromText?.length) return [...new Set(fromText)].slice(0, 80);
  return [...new Set((product.ingredients || []).map((item) => item.text?.trim()).filter((item): item is string => Boolean(item)))].slice(0, 80);
}

async function importProduct(product: OpenBeautyProduct): Promise<boolean> {
  const name = product.product_name?.trim();
  const brand = product.brands?.split(",")[0]?.trim();
  const barcode = product.code?.trim();
  const quantityInfo = parseQuantity(product.quantity);
  const image = product.image_front_url || product.image_url;
  if (!name || !brand || !barcode || !quantityInfo || !image) return false;

  const ingredients = ingredientNames(product);
  const links = (await Promise.all(ingredients.map(async (name, orderIndex) => {
    const slug = slugify(name);
    if (!slug) return null;
    const ingredient = await prisma.ingredient.upsert({
      where: { slug },
      create: { slug, name, description: "Ingredient name imported from a product label.", function: "Not assessed", category: "Unclassified", concernTags: "[]", safetyRating: "Not assessed", suitableSkinTypes: "[]", status: "imported_unclassified" },
      update: {},
      select: { id: true },
    });
    return { ingredientId: ingredient.id, orderIndex, isKey: orderIndex < 5 };
  }))).filter((item): item is { ingredientId: string; orderIndex: number; isKey: boolean } => item !== null);

  const sourceUrl = product.url || `https://world.openbeautyfacts.org/product/${barcode}`;
  const now = new Date().toISOString();
  await prisma.product.upsert({
    where: { slug: `obf-${barcode}` },
    create: {
      slug: `obf-${barcode}`, legacyId: barcode, name, brand,
      category: inferCategory(name, product.categories || ""),
      description: `${name} by ${brand}. Product-label data imported from ${SOURCE_NAME}.`,
      images: JSON.stringify([image]), image, quantity: quantityInfo.quantity, unit: quantityInfo.unit,
      reviewCount: 0, productStatus: "Incomplete", dataConfidence: ingredients.length > 0 ? 70 : 45,
      source: `${SOURCE_NAME} | ${sourceUrl}`, lastUpdated: now, skinTypes: "[]", targetConcerns: "[]",
      crueltyFree: false, vegan: false, fragranceFree: false, parabenFree: false, siliconeFree: false,
      usageTime: "Both", summary: "Imported product-label data. Retail price and suitability require a verified source.",
      isVerified: false, productIngredients: { create: links },
    },
    update: {
      name, brand, category: inferCategory(name, product.categories || ""), images: JSON.stringify([image]), image,
      quantity: quantityInfo.quantity, unit: quantityInfo.unit, dataConfidence: ingredients.length > 0 ? 70 : 45,
      source: `${SOURCE_NAME} | ${sourceUrl}`, lastUpdated: now,
    },
  });
  return true;
}

export async function importOpenBeautyFacts(query: string, pageSize = 50) {
  const url = new URL(BASE_URL);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", String(Math.min(Math.max(pageSize, 1), 50)));
  const response = await fetch(url, { headers: { "User-Agent": "BeautyIQ product-catalog importer/1.0" } });
  if (!response.ok) throw new Error(`${SOURCE_NAME} returned ${response.status}.`);
  const payload = await response.json() as OpenBeautySearchResponse;
  let imported = 0;
  for (const product of payload.products || []) if (await importProduct(product)) imported++;
  return { received: payload.products?.length || 0, imported, query };
}
