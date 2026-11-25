/**
 * Product retrieval layer. Loads real catalog records and derives verified price fields.
 *
 * - PrismaCatalog: the live BeautyIQ database (MongoDB via Prisma), cached briefly in memory.
 * - SeedCatalog: the catalog seed files that `npm run db:seed` loads into the database. It is used
 *   by the tests, and by `getDefaultCatalog()` only when DATABASE_URL is not configured (local dev).
 */
import type { CatalogIngredient, CatalogPrice, CatalogProduct, CatalogProvider } from "./types";
import { products as seedProducts, mockProductListings } from "../../data/products";
import { ingredients as seedIngredients } from "../../data/ingredients";
import { findKnowledgeForIngredient } from "./ingredient-knowledge";

const UNAVAILABLE = new Set(["unavailable", "not available"]);

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export interface RawListing {
  platform: string;
  seller: string;
  price: number | null;
  availability: string;
  productUrl: string | null;
  lastUpdated?: string | null;
}

/** Lowest price among listings that carry a real, currently available price. */
export function deriveVerifiedPrice(listings: RawListing[]): CatalogPrice | null {
  const usable = listings.filter(
    (l) => typeof l.price === "number" && l.price > 0 && !UNAVAILABLE.has((l.availability || "").toLowerCase())
  );
  if (!usable.length) return null;
  const best = usable.reduce((a, b) => ((b.price as number) < (a.price as number) ? b : a));
  return {
    amount: best.price as number,
    currency: "INR",
    platform: best.platform,
    seller: best.seller,
    availability: best.availability,
    listingUrl: best.productUrl || null,
    lastUpdated: best.lastUpdated || null,
  };
}

export interface RawProductRow {
  slug?: string | null;
  legacyId?: string | null;
  id?: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  images?: unknown;
  summary?: string | null;
  description?: string | null;
  quantity: number;
  unit: string;
  rating?: number | null;
  reviewCount?: number | null;
  skinTypes?: unknown;
  targetConcerns?: unknown;
  warnings?: unknown;
  fragranceFree?: boolean | null;
  isVerified?: boolean | null;
  productStatus?: string | null;
  dataConfidence?: number | null;
  prices?: RawListing[];
  productIngredients?: {
    isKey: boolean;
    orderIndex?: number;
    ingredient?: { name: string; function?: string | null; concernTags?: unknown } | null;
  }[];
}

export function toCatalogProduct(row: RawProductRow): CatalogProduct {
  const ingredients: CatalogIngredient[] = (row.productIngredients || [])
    .slice()
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .filter((pi) => pi.ingredient?.name)
    .map((pi) => ({
      name: pi.ingredient!.name,
      isKey: Boolean(pi.isKey),
      function: pi.ingredient!.function ?? null,
      concernTags: parseJsonArray(pi.ingredient!.concernTags),
    }));

  return {
    id: row.slug || row.legacyId || row.id || row.name,
    name: row.name,
    brand: row.brand,
    category: row.category,
    image: row.image || parseJsonArray(row.images)[0] || "",
    summary: row.summary || "",
    description: row.description || "",
    quantity: row.quantity,
    unit: row.unit,
    rating: typeof row.rating === "number" ? row.rating : null,
    reviewCount: row.reviewCount ?? 0,
    skinTypes: parseJsonArray(row.skinTypes),
    targetConcerns: parseJsonArray(row.targetConcerns),
    ingredients,
    fragranceFree: Boolean(row.fragranceFree),
    isVerified: row.isVerified !== false,
    productStatus: row.productStatus || "Complete",
    dataConfidence: row.dataConfidence ?? 100,
    warnings: parseJsonArray(row.warnings),
    price: deriveVerifiedPrice(row.prices || []),
  };
}

/** The seed catalog: same records `prisma/seed.ts` writes into the database. */
export function buildSeedCatalog(): CatalogProduct[] {
  const metaFor = (name: string) => {
    const k = findKnowledgeForIngredient(name);
    const rec = seedIngredients.find((i) => i.name.toLowerCase() === name.toLowerCase() || (k && i.id === k.key));
    return rec ? { name, function: rec.function, concernTags: rec.concernTags as string[] } : { name };
  };
  return seedProducts.map((p) => {
    const keySet = new Set(p.keyIngredients.map((n) => n.toLowerCase()));
    const names = [...p.keyIngredients, ...p.allIngredients.filter((n) => !keySet.has(n.toLowerCase()))];
    return toCatalogProduct({
      slug: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      image: p.image,
      summary: p.summary,
      description: p.description,
      quantity: p.quantity,
      unit: p.unit,
      rating: p.rating,
      reviewCount: p.reviewCount,
      skinTypes: p.skinTypes,
      targetConcerns: p.targetConcerns,
      warnings: p.warnings || [],
      fragranceFree: p.fragranceFree,
      isVerified: p.isVerified ?? true,
      productStatus: p.productStatus,
      dataConfidence: p.dataConfidence,
      productIngredients: names.map((n, i) => ({
        isKey: keySet.has(n.toLowerCase()),
        orderIndex: i,
        ingredient: metaFor(n),
      })),
      prices: mockProductListings
        .filter((l) => l.productId === p.id)
        .map((l) => ({
          platform: l.platform,
          seller: l.seller,
          price: l.price,
          availability: l.availability,
          productUrl: l.productUrl,
          lastUpdated: l.lastUpdated,
        })),
    });
  });
}

export class StaticCatalog implements CatalogProvider {
  constructor(public readonly name: string, private readonly items: CatalogProduct[]) {}
  async getProducts() {
    return this.items;
  }
}

export function createSeedCatalog(): CatalogProvider {
  return new StaticCatalog("seed", buildSeedCatalog());
}

export class PrismaCatalog implements CatalogProvider {
  readonly name = "database";
  private cache: { at: number; items: CatalogProduct[] } | null = null;
  constructor(private readonly ttlMs = 60_000) {}

  async getProducts(): Promise<CatalogProduct[]> {
    if (this.cache && Date.now() - this.cache.at < this.ttlMs) return this.cache.items;
    const { prisma } = await import("../prisma");
    const rows = await prisma.product.findMany({
      include: {
        prices: true,
        productIngredients: { include: { ingredient: true }, orderBy: { orderIndex: "asc" } },
      },
    });
    const items = rows.map((r: any) => toCatalogProduct(r as RawProductRow));
    this.cache = { at: Date.now(), items };
    return items;
  }
}

let defaultCatalog: CatalogProvider | null = null;

/** Live DB when DATABASE_URL is set; otherwise the seed catalog (local development without a database). */
export function getDefaultCatalog(): CatalogProvider {
  if (!defaultCatalog) {
    defaultCatalog = process.env.DATABASE_URL ? new PrismaCatalog() : createSeedCatalog();
  }
  return defaultCatalog;
}

export function findProduct(products: CatalogProduct[], id: string): CatalogProduct | undefined {
  return products.find((p) => p.id === id);
}
