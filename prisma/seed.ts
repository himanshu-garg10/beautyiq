import { PrismaClient } from "@prisma/client";
import { products, mockProductListings } from "../src/data/products";
import { ingredients } from "../src/data/ingredients";
import { sampleDefaultProfile } from "../src/data/users";

const prisma = new PrismaClient();

// Additional ingredients found in products p1..p13 to enrich the knowledge graph
const additionalIngredients = [
  {
    id: "zinc-pca",
    name: "Zinc PCA",
    commonNames: ["Zinc Salt", "Zinc Pyrrolidone Carboxylate"],
    synonyms: ["Bis(5-oxo-L-prolinato-N1,O2)zinc"],
    description: "Synthetic skin-conditioning agent that regulates sebum production and inhibits bacterial proliferation in acne-prone skin.",
    function: "Sebum regulation and antimicrobial protection",
    category: "Active ingredient",
    concentration: "1–2%",
    concernTags: ["Acne", "Excess oil", "Pimples", "Visible pores"],
    safetyRating: "Low Hazard",
    comedogenicRating: 0,
    suitableSkinTypes: ["Oily", "Combination"],
    contraindications: [],
  },
  {
    id: "aloe-vera",
    name: "Aloe Vera",
    commonNames: ["Aloe Barbadensis Leaf Juice"],
    synonyms: ["Aloe Extract"],
    description: "Natural plant extract that delivers soothing hydration and cools irritated or sun-exposed skin.",
    function: "Soothing hydration and skin barrier calming",
    category: "Soothing agent",
    concentration: "5–95%",
    concernTags: ["Redness", "Dryness", "Dehydration"],
    safetyRating: "Low Hazard",
    comedogenicRating: 0,
    suitableSkinTypes: ["Sensitive", "Dry", "Normal", "Combination", "Oily"],
    contraindications: [],
  },
  {
    id: "tea-tree",
    name: "Tea Tree",
    commonNames: ["Melaleuca Alternifolia Leaf Oil", "Tea Tree Oil"],
    synonyms: ["Tea Tree Extract"],
    description: "Botanical essential oil with potent terpinen-4-ol delivering antibacterial action against Cutibacterium acnes.",
    function: "Antibacterial and anti-blemish purifier",
    category: "Active ingredient",
    concentration: "0.5–5%",
    concernTags: ["Acne", "Pimples", "Blackheads"],
    safetyRating: "Low Hazard",
    comedogenicRating: 1,
    suitableSkinTypes: ["Oily", "Combination"],
    contraindications: [],
  },
  {
    id: "caffeine",
    name: "Caffeine",
    commonNames: ["1,3,7-Trimethylxanthine"],
    synonyms: ["Guaranine", "Methyltheobromine"],
    description: "Potent methylxanthine alkaloid that constricts micro-capillaries to drain fluid retention and brighten periorbital circles.",
    function: "Vasoconstriction and periorbital depuffing",
    category: "Active ingredient",
    concentration: "1–5%",
    concernTags: ["Dark circles", "Under eye puffiness"],
    safetyRating: "Low Hazard",
    comedogenicRating: 0,
    suitableSkinTypes: ["Oily", "Dry", "Combination", "Normal"],
    contraindications: [],
  },
  {
    id: "lactic-acid",
    name: "Lactic Acid",
    commonNames: ["AHA", "2-Hydroxypropanoic acid"],
    synonyms: ["Milk Acid"],
    description: "Gentle alpha hydroxy acid that exfoliates surface dead skin while boosting natural moisture retention.",
    function: "Surface micro-exfoliation and gentle hydration",
    category: "Exfoliant",
    concentration: "5–10%",
    concernTags: ["Dullness", "Rough texture", "Visible pores"],
    safetyRating: "Low Hazard",
    comedogenicRating: 0,
    suitableSkinTypes: ["Dry", "Combination", "Normal", "Sensitive"],
    contraindications: ["Retinol"],
  },
];

// Fallback / realistic listings for products without entries in mockProductListings
const additionalProductListings = [
  {
    id: "l-p9-derma-brand",
    productId: "p9",
    platform: "Brand Store",
    seller: "The Derma Co Official",
    price: 425,
    originalPrice: 499,
    discountPercent: 15,
    quantity: 30,
    unit: "g",
    availability: "Available",
    productUrl: "https://thedermaco.com",
    lastUpdated: "2026-09-08",
    isBestPrice: true,
    isBestValue: true,
    unitPricePerMl: 14.16,
    valueScore: 92,
  },
  {
    id: "l-p9-nykaa",
    productId: "p9",
    platform: "Nykaa",
    seller: "Nykaa Retail",
    price: 449,
    originalPrice: 499,
    discountPercent: 10,
    quantity: 30,
    unit: "g",
    availability: "Available",
    productUrl: "https://nykaa.com",
    lastUpdated: "2026-09-08",
    unitPricePerMl: 14.96,
    valueScore: 89,
  },
  {
    id: "l-p10-nykaa",
    productId: "p10",
    platform: "Nykaa",
    seller: "Nykaa Global",
    price: 850,
    originalPrice: 950,
    discountPercent: 10,
    quantity: 100,
    unit: "g",
    availability: "Available",
    productUrl: "https://nykaa.com",
    lastUpdated: "2026-09-08",
    isBestPrice: true,
    isBestValue: true,
    unitPricePerMl: 8.5,
    valueScore: 94,
  },
  {
    id: "l-p10-amazon",
    productId: "p10",
    platform: "Amazon",
    seller: "Innisfree Official Store",
    price: 899,
    originalPrice: 950,
    discountPercent: 5,
    quantity: 100,
    unit: "g",
    availability: "Available",
    productUrl: "https://amazon.in",
    lastUpdated: "2026-09-07",
    unitPricePerMl: 8.99,
    valueScore: 88,
  },
  {
    id: "l-p11-nykaa",
    productId: "p11",
    platform: "Nykaa",
    seller: "Nykaa Retail",
    price: 570,
    originalPrice: 600,
    discountPercent: 5,
    quantity: 20,
    unit: "g",
    availability: "Available",
    productUrl: "https://nykaa.com",
    lastUpdated: "2026-09-08",
    isBestPrice: true,
    isBestValue: true,
    unitPricePerMl: 28.5,
    valueScore: 96,
  },
  {
    id: "l-p11-maccaron",
    productId: "p11",
    platform: "Maccaron",
    seller: "Maccaron Beauty",
    price: 590,
    originalPrice: 600,
    discountPercent: 2,
    quantity: 20,
    unit: "g",
    availability: "Available",
    productUrl: "https://maccaron.in",
    lastUpdated: "2026-09-06",
    unitPricePerMl: 29.5,
    valueScore: 90,
  },
  {
    id: "l-p12-brand",
    productId: "p12",
    platform: "Brand Store",
    seller: "BeMinimalist India",
    price: 575,
    originalPrice: 599,
    discountPercent: 4,
    quantity: 30,
    unit: "ml",
    availability: "Available",
    productUrl: "https://beminimalist.co",
    lastUpdated: "2026-09-08",
    isBestPrice: true,
    isBestValue: true,
    unitPricePerMl: 19.16,
    valueScore: 93,
  },
  {
    id: "l-p12-nykaa",
    productId: "p12",
    platform: "Nykaa",
    seller: "Nykaa Retail",
    price: 599,
    originalPrice: 599,
    discountPercent: 0,
    quantity: 30,
    unit: "ml",
    availability: "Available",
    productUrl: "https://nykaa.com",
    lastUpdated: "2026-09-08",
    unitPricePerMl: 19.96,
    valueScore: 90,
  },
];

async function main() {
  console.log("🌱 Starting BeautyIQ Database Seed...");

  // 1. Clear existing records
  await prisma.price.deleteMany();
  await prisma.productIngredient.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.skinProfile.deleteMany();

  console.log("🧹 Cleaned existing tables.");

  // 2. Seed Ingredients
  const allIngredientsToSeed = [...ingredients, ...additionalIngredients];
  const seededIngredientsMap = new Map<string, string>(); // name/slug -> id

  for (const ing of allIngredientsToSeed) {
    const created = await prisma.ingredient.create({
      data: {
        id: ing.id,
        name: ing.name,
        commonNames: ing.commonNames ? JSON.stringify(ing.commonNames) : null,
        synonyms: ing.synonyms ? JSON.stringify(ing.synonyms) : null,
        description: ing.description,
        function: ing.function,
        category: ing.category,
        concentration: ing.concentration ?? null,
        concernTags: JSON.stringify(ing.concernTags),
        safetyRating: ing.safetyRating,
        comedogenicRating: ing.comedogenicRating,
        suitableSkinTypes: JSON.stringify(ing.suitableSkinTypes),
        contraindications: ing.contraindications ? JSON.stringify(ing.contraindications) : null,
        status: (ing as any).status ?? "active",
      },
    });

    seededIngredientsMap.set(ing.id.toLowerCase(), created.id);
    seededIngredientsMap.set(ing.name.toLowerCase(), created.id);
    if (ing.commonNames) {
      ing.commonNames.forEach((cn) => seededIngredientsMap.set(cn.toLowerCase(), created.id));
    }
  }

  console.log(`✅ Seeded ${allIngredientsToSeed.length} ingredients.`);

  // 3. Seed Products (p1 to p13)
  for (const p of products) {
    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        description: p.description,
        images: JSON.stringify(p.images),
        image: p.image,
        quantity: p.quantity,
        unit: p.unit,
        rating: p.rating,
        reviewCount: p.reviewCount,
        productStatus: p.productStatus,
        dataConfidence: p.dataConfidence,
        source: p.source,
        lastUpdated: p.lastUpdated,
        compatibilityScore: p.compatibilityScore ?? null,
        skinTypes: JSON.stringify(p.skinTypes),
        targetConcerns: JSON.stringify(p.targetConcerns),
        pHLevel: p.pHLevel ?? null,
        crueltyFree: p.crueltyFree,
        vegan: p.vegan,
        fragranceFree: p.fragranceFree,
        parabenFree: p.parabenFree,
        siliconeFree: p.siliconeFree,
        usageTime: p.usageTime,
        summary: p.summary,
        whyRecommended: p.whyRecommended ? JSON.stringify(p.whyRecommended) : null,
        warnings: p.warnings ? JSON.stringify(p.warnings) : null,
        isVerified: p.isVerified ?? true,
      },
    });

    // 4. Link ProductIngredients
    const linkedIngredientIds = new Set<string>();

    // Link key ingredients
    for (let i = 0; i < p.keyIngredients.length; i++) {
      const keyIngName = p.keyIngredients[i].trim();
      const matchedIngId = findIngredientId(keyIngName, seededIngredientsMap);

      if (matchedIngId && !linkedIngredientIds.has(matchedIngId)) {
        linkedIngredientIds.add(matchedIngId);
        await prisma.productIngredient.create({
          data: {
            productId: p.id,
            ingredientId: matchedIngId,
            isKey: true,
            orderIndex: i + 1,
          },
        });
      }
    }

    // Link remaining ingredients
    for (let j = 0; j < p.allIngredients.length; j++) {
      const allIngName = p.allIngredients[j].trim();
      const matchedIngId = findIngredientId(allIngName, seededIngredientsMap);

      if (matchedIngId && !linkedIngredientIds.has(matchedIngId)) {
        linkedIngredientIds.add(matchedIngId);
        await prisma.productIngredient.create({
          data: {
            productId: p.id,
            ingredientId: matchedIngId,
            isKey: false,
            orderIndex: p.keyIngredients.length + j + 1,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${products.length} products (p1 to p13) and relations.`);

  // 5. Seed Prices
  const combinedListings = [...mockProductListings, ...additionalProductListings];
  const uniqueListingIds = new Set<string>();

  for (const l of combinedListings) {
    if (uniqueListingIds.has(l.id)) continue;
    uniqueListingIds.add(l.id);

    await prisma.price.create({
      data: {
        id: l.id,
        productId: l.productId,
        platform: l.platform,
        seller: l.seller,
        price: l.price,
        originalPrice: l.originalPrice ?? null,
        discountPercent: l.discountPercent ?? null,
        quantity: l.quantity,
        unit: l.unit,
        availability: l.availability,
        productUrl: l.productUrl,
        isBestPrice: l.isBestPrice ?? false,
        isBestValue: l.isBestValue ?? false,
        unitPricePerMl: l.unitPricePerMl ?? null,
        valueScore: l.valueScore ?? null,
        lastUpdated: l.lastUpdated,
      },
    });
  }

  console.log(`✅ Seeded ${uniqueListingIds.size} price listings.`);

  // 6. Seed SkinProfile
  await prisma.skinProfile.create({
    data: {
      userId: "u1",
      skinType: sampleDefaultProfile.skinType,
      concerns: JSON.stringify(sampleDefaultProfile.concerns),
      goals: JSON.stringify(sampleDefaultProfile.goals),
      sensitivityLevel: sampleDefaultProfile.sensitivityLevel,
      reactionFrequency: sampleDefaultProfile.reactionFrequency,
      knownAllergies: JSON.stringify(sampleDefaultProfile.knownAllergies),
      preferredIngredients: JSON.stringify(sampleDefaultProfile.preferredIngredients),
      avoidIngredients: JSON.stringify(sampleDefaultProfile.avoidIngredients),
      preferredBrands: JSON.stringify(sampleDefaultProfile.preferredBrands),
      excludedBrands: JSON.stringify(sampleDefaultProfile.excludedBrands),
      preferredCategories: JSON.stringify(sampleDefaultProfile.preferredCategories),
      minBudget: sampleDefaultProfile.budget.min,
      maxBudget: sampleDefaultProfile.budget.max,
      fragranceFree: sampleDefaultProfile.fragrancePreference === "Fragrance free",
      crueltyFree: sampleDefaultProfile.properties.includes("Cruelty free"),
      vegan: sampleDefaultProfile.properties.includes("Vegan"),
      parabenFree: sampleDefaultProfile.properties.includes("Non comedogenic"),
      siliconeFree: false,
      isOnboardingComplete: sampleDefaultProfile.isOnboardingComplete,
    },
  });

  console.log("✅ Seeded default SkinProfile for user u1.");
  console.log("🎉 Database seeding completed successfully!");
}

function findIngredientId(name: string, map: Map<string, string>): string | undefined {
  const clean = name.toLowerCase().trim();
  if (map.has(clean)) return map.get(clean);

  // Common substring / alias matches
  if (clean.includes("niacinamide")) return "niacinamide";
  if (clean.includes("hyaluronic")) return "hyaluronic-acid";
  if (clean.includes("salicylic")) return "salicylic-acid";
  if (clean.includes("vitamin c") || clean.includes("ascorb")) return "vitamin-c";
  if (clean.includes("ceramide")) return "ceramides";
  if (clean.includes("retinol") || clean.includes("retinoid")) return "retinol";
  if (clean.includes("squalane")) return "squalane";
  if (clean.includes("centella") || clean.includes("cica") || clean.includes("madecassoside")) return "centella-asiatica";
  if (clean.includes("zinc oxide")) return "zinc-oxide";
  if (clean.includes("glycolic")) return "glycolic-acid";
  if (clean.includes("petrolatum") || clean.includes("paraffin")) return "petrolatum";
  if (clean.includes("coco-glucoside")) return "coco-glucoside";
  if (clean.includes("zinc pca")) return "zinc-pca";
  if (clean.includes("aloe")) return "aloe-vera";
  if (clean.includes("tea tree")) return "tea-tree";
  if (clean.includes("caffeine")) return "caffeine";
  if (clean.includes("lactic")) return "lactic-acid";

  return undefined;
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
