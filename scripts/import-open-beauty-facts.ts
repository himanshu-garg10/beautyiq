import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function parseQuantity(value?: string): { quantity: number; unit: "ml" | "g" | "pcs" | "sheets" } | null {
  if (!value) return null;
  const match = value.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(ml|mL|g|gm|grams?|pcs?|pieces?|sheets?)/i);
  if (!match) return null;

  const quantity = Number(match[1]);
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  const rawUnit = match[2].toLowerCase();
  const unit = rawUnit.includes("ml")
    ? "ml"
    : rawUnit.startsWith("g")
      ? "g"
      : rawUnit.includes("sheet")
        ? "sheets"
        : "pcs";
  return { quantity, unit };
}

function inferCategory(...values: string[]): string {
  const text = values.join(" ").toLowerCase();
  if (/(face wash|facial wash|cleanser)/.test(text)) return "Cleanser";
  if (/(serum|ampoule|essence)/.test(text)) return "Serum";
  if (/(sunscreen|sun screen|sunblock|spf)/.test(text)) return "Sunscreen";
  if (/(toner|mist)/.test(text)) return "Toner";
  if (/(moisturi[sz]er|face cream|gel cream|lotion)/.test(text)) return "Moisturizer";
  if (/(exfoliat|scrub|peel)/.test(text)) return "Exfoliator";
  if (/(mask)/.test(text)) return "Face Masks";
  if (/(lip balm|lip care|lip mask)/.test(text)) return "Lip Care";
  if (/(eye cream|under eye|eye serum)/.test(text)) return "Eye Care";
  return "Treatment Products";
}

function ingredientNames(product: OpenBeautyProduct): string[] {
  const fromText = product.ingredients_text
    ?.split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (fromText?.length) return [...new Set(fromText)].slice(0, 80);

  return [
    ...new Set(
      (product.ingredients || [])
        .map((ingredient) => ingredient.text?.trim())
        .filter((value): value is string => Boolean(value))
    ),
  ].slice(0, 80);
}

async function importProduct(product: OpenBeautyProduct) {
  const name = product.product_name?.trim();
  const brand = product.brands?.split(",")[0]?.trim();
  const quantityInfo = parseQuantity(product.quantity);
  const barcode = product.code?.trim();
  const image = product.image_front_url || product.image_url;

  if (!name || !brand || !barcode || !quantityInfo || !image) return false;

  const sourceUrl = product.url || `https://world.openbeautyfacts.org/product/${barcode}`;
  const ingredients = ingredientNames(product);
  const productIngredients = await Promise.all(
    ingredients.map(async (ingredient, orderIndex) => {
      const slug = slugify(ingredient);
      if (!slug) return null;
      const stored = await prisma.ingredient.upsert({
        where: { slug },
        create: {
          slug,
          name: ingredient,
          description: "Ingredient name imported from a product label.",
          function: "Not assessed",
          category: "Unclassified",
          concernTags: "[]",
          safetyRating: "Not assessed",
          suitableSkinTypes: "[]",
          status: "imported_unclassified",
        },
        update: {},
        select: { id: true },
      });
      return { ingredientId: stored.id, orderIndex, isKey: orderIndex < 5 };
    })
  );

  const links = productIngredients.filter(
    (link): link is { ingredientId: string; orderIndex: number; isKey: boolean } => link !== null
  );
  const slug = `obf-${barcode}`;
  const now = new Date().toISOString();

  await prisma.product.upsert({
    where: { slug },
    create: {
      slug,
      legacyId: barcode,
      name,
      brand,
      category: inferCategory(name, product.categories || ""),
      description: `${name} by ${brand}. Product-label data imported from ${SOURCE_NAME}.`,
      images: JSON.stringify([image]),
      image,
      quantity: quantityInfo.quantity,
      unit: quantityInfo.unit,
      reviewCount: 0,
      productStatus: "Incomplete",
      dataConfidence: ingredients.length > 0 ? 70 : 45,
      source: `${SOURCE_NAME} | ${sourceUrl}`,
      lastUpdated: now,
      skinTypes: "[]",
      targetConcerns: "[]",
      crueltyFree: false,
      vegan: false,
      fragranceFree: false,
      parabenFree: false,
      siliconeFree: false,
      usageTime: "Both",
      summary: "Imported product-label data. Retail price and suitability require a verified source.",
      isVerified: false,
      productIngredients: { create: links },
    },
    update: {
      name,
      brand,
      category: inferCategory(name, product.categories || ""),
      images: JSON.stringify([image]),
      image,
      quantity: quantityInfo.quantity,
      unit: quantityInfo.unit,
      dataConfidence: ingredients.length > 0 ? 70 : 45,
      source: `${SOURCE_NAME} | ${sourceUrl}`,
      lastUpdated: now,
    },
  });
  return true;
}

async function main() {
  const query = process.argv.slice(2).join(" ").trim() || "skincare";
  const url = new URL(BASE_URL);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "50");

  const response = await fetch(url, {
    headers: { "User-Agent": "BeautyIQ product-catalog importer/1.0" },
  });
  if (!response.ok) throw new Error(`${SOURCE_NAME} returned ${response.status}.`);

  const payload = (await response.json()) as OpenBeautySearchResponse;
  let imported = 0;
  for (const product of payload.products || []) {
    if (await importProduct(product)) imported++;
  }
  console.log(`Imported or refreshed ${imported} products for query: ${query}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
