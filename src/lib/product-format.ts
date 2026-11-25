import type { Product, SkinType, DetailedSkinConcern, RoutineStep, ProductStatus, UsageTime, ProductUnit } from "@/types";

export function formatProduct(p: any): Product & { prices?: any[] } {
  let images: string[] = [];
  let skinTypes: string[] = [];
  let targetConcerns: string[] = [];
  let whyRecommended: string[] = [];
  let warnings: string[] = [];

  try { images = typeof p.images === "string" ? JSON.parse(p.images) : p.images || []; } catch {}
  try { skinTypes = typeof p.skinTypes === "string" ? JSON.parse(p.skinTypes) : p.skinTypes || []; } catch {}
  try { targetConcerns = typeof p.targetConcerns === "string" ? JSON.parse(p.targetConcerns) : p.targetConcerns || []; } catch {}
  try { whyRecommended = typeof p.whyRecommended === "string" ? JSON.parse(p.whyRecommended) : p.whyRecommended || []; } catch {}
  try { warnings = typeof p.warnings === "string" ? JSON.parse(p.warnings) : p.warnings || []; } catch {}

  const keyIngredients = p.productIngredients
    ? p.productIngredients
        .filter((pi: any) => pi.isKey)
        .map((pi: any) => pi.ingredient?.name || pi.ingredient?.slug || pi.ingredientId)
    : p.keyIngredients || [];

  const allIngredients = p.productIngredients
    ? p.productIngredients.map((pi: any) => pi.ingredient?.name || pi.ingredient?.slug || pi.ingredientId)
    : p.allIngredients || [];

  const stableId = p.slug || p.legacyId || p.id;

  const formattedPrices = (p.prices || []).map((pr: any) => ({
    ...pr,
    productId: stableId,
  }));

  const bestPriceListing = formattedPrices.find((pr: any) => typeof pr.price === "number" && pr.price > 0);
  const bestMrpListing = formattedPrices.find((pr: any) => typeof pr.originalPrice === "number" && pr.originalPrice > 0);
  const directListing = formattedPrices.find((pr: any) => pr.id?.endsWith("-direct") || pr.platform?.toLowerCase().includes("direct"));

  const resolvedPrice =
    typeof p.price === "number" && p.price > 0
      ? p.price
      : bestPriceListing?.price ?? null;

  const resolvedMrp =
    typeof p.mrp === "number" && p.mrp > 0
      ? p.mrp
      : bestMrpListing?.originalPrice ?? resolvedPrice;

  const resolvedDirectUrl =
    p.directBuyUrl ||
    directListing?.productUrl ||
    (p.source && p.source.includes("http") ? p.source.split(" | ")[1] : null) ||
    formattedPrices[0]?.productUrl ||
    null;

  return {
    id: stableId,
    name: p.name,
    brand: p.brand,
    category: p.category as RoutineStep,
    description: p.description,
    images: images && images.length > 0 ? images : [p.image],
    image: p.image,
    quantity: p.quantity,
    unit: p.unit as ProductUnit,
    price: resolvedPrice,
    mrp: resolvedMrp,
    directBuyUrl: resolvedDirectUrl,
    rating: p.rating,
    reviewCount: p.reviewCount,
    productStatus: p.productStatus as ProductStatus,
    dataConfidence: p.dataConfidence,
    source: p.source,
    lastUpdated: p.lastUpdated,
    compatibilityScore: p.compatibilityScore,
    skinTypes: skinTypes as SkinType[],
    targetConcerns: targetConcerns as DetailedSkinConcern[],
    pHLevel: p.pHLevel,
    crueltyFree: p.crueltyFree,
    vegan: p.vegan,
    fragranceFree: p.fragranceFree,
    parabenFree: p.parabenFree,
    siliconeFree: p.siliconeFree,
    usageTime: p.usageTime as UsageTime,
    summary: p.summary,
    whyRecommended,
    warnings,
    isVerified: p.isVerified,
    keyIngredients,
    allIngredients,
    prices: formattedPrices,
  };
}
