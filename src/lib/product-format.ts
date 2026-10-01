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
        .map((pi: any) => pi.ingredient?.name || pi.ingredientId)
    : p.keyIngredients || [];

  const allIngredients = p.productIngredients
    ? p.productIngredients.map((pi: any) => pi.ingredient?.name || pi.ingredientId)
    : p.allIngredients || [];

  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category as RoutineStep,
    description: p.description,
    images: images && images.length > 0 ? images : [p.image],
    image: p.image,
    quantity: p.quantity,
    unit: p.unit as ProductUnit,
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
    prices: p.prices || [],
  };
}
