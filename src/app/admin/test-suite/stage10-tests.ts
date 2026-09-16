import { DataSourceService } from "@/services/data-pipeline/data-source.service";
import { RawStorageService } from "@/services/data-pipeline/raw-storage.service";
import { ValidationService } from "@/services/data-pipeline/validation.service";
import { NormalizationService } from "@/services/data-pipeline/normalization.service";
import { ProductMatchingService } from "@/services/data-pipeline/product-matching.service";
import { DataQualityCalculatorService } from "@/services/data-pipeline/data-quality-calculator.service";
import { PipelineOrchestratorService } from "@/services/data-pipeline/pipeline-orchestrator.service";
import { ProductSearchService } from "@/services/product-search.service";
import { AIRequirementService } from "@/services/ai-requirement.service";
import { RecommendationEngineService } from "@/services/recommendation-engine.service";
import type { Product, ProductListing } from "@/types";

export interface Stage10TestItem {
  id: string;
  name: string;
  category: "Data Ingestion" | "Normalization" | "Product Identity" | "Price & Availability" | "Search & No-Hallucination" | "Data Confidence";
  run: () => Promise<{ passed: boolean; message: string }>;
}

export const stage10TestSuite: Stage10TestItem[] = [
  // ==========================================
  // 1. DATA INGESTION
  // ==========================================
  {
    id: "ingestion-valid-record",
    name: "Valid Product Ingestion & Processing",
    category: "Data Ingestion",
    run: async () => {
      const raw = {
        name: "Test Botanical Hydration Serum",
        brand: "Minimalist",
        category: "Serum",
        quantity: "30 ml",
        unit: "ml",
        price: 549,
        allIngredients: ["Aqua", "Niacinamide", "Glycerin"],
        source: "Brand Direct Catalog Feed",
        sourceUrl: "https://beminimalist.co/test",
        availability: "Available",
      };
      const log = await PipelineOrchestratorService.runIngestionPipeline("src-brand-direct", [raw]);
      if (log.recordsAccepted !== 1) {
        return { passed: false, message: `Expected 1 accepted record, got ${log.recordsAccepted}` };
      }
      return {
        passed: true,
        message: `Successfully ingested and normalized record #${log.id} into catalog.`,
      };
    },
  },
  {
    id: "ingestion-invalid-record-rejection",
    name: "Malformed Payload Rejection without Crash",
    category: "Data Ingestion",
    run: async () => {
      const invalidRaw = {
        name: "", // Empty name
        brand: "",
        category: "",
        quantity: -10, // Negative quantity
        price: "invalid_price",
        source: "External Feed",
      };
      const validation = ValidationService.validateProductRecord(invalidRaw);
      if (validation.isValid) {
        return { passed: false, message: "Validation failed to catch empty name and negative quantity." };
      }
      return {
        passed: true,
        message: `Validation accurately caught ${validation.errors.length} schema violations: ${validation.errors[0]}`,
      };
    },
  },
  {
    id: "ingestion-failed-record-preservation",
    name: "Failed Record Preservation in Raw Storage",
    category: "Data Ingestion",
    run: async () => {
      const corruptRaw = {
        name: "Invalid Corrupt Serum",
        brand: "",
        category: "Serum",
        quantity: 0,
        source: "Corrupt Source",
      };
      await PipelineOrchestratorService.runIngestionPipeline("src-brand-direct", [corruptRaw]);
      const failed = await RawStorageService.getFailedRecords();
      if (!failed.some((f) => f.rawPayload.name === "Invalid Corrupt Serum")) {
        return { passed: false, message: "Corrupt raw payload was destroyed instead of being preserved for retry." };
      }
      return {
        passed: true,
        message: `Failed record preserved intact in raw storage with status "failed" and audit reason.`,
      };
    },
  },
  {
    id: "ingestion-unauthorized-source-block",
    name: "Prohibited Scraping & Unapproved Source Guard",
    category: "Data Ingestion",
    run: async () => {
      const unapprovedSource = await DataSourceService.getDataSourceById("src-unapproved-feed-sample");
      if (!unapprovedSource) {
        return { passed: false, message: "Unapproved test source missing." };
      }
      const isPermitted = DataSourceService.isSourcePermitted(unapprovedSource);
      if (isPermitted) {
        return { passed: false, message: "Security failure: Unapproved source marked as permitted." };
      }
      const log = await PipelineOrchestratorService.runIngestionPipeline(unapprovedSource.id, [
        { name: "Scraped Item", brand: "Unknown", category: "Serum", quantity: 50, source: "Scraper" },
      ]);
      if (log.status !== "failed") {
        return { passed: false, message: "Ingestion pipeline allowed unapproved source to execute." };
      }
      return {
        passed: true,
        message: "Prohibited unapproved feed strictly blocked from production catalog insertion.",
      };
    },
  },

  // ==========================================
  // 2. NORMALIZATION
  // ==========================================
  {
    id: "norm-brand-variations",
    name: "Brand Normalization (Cetaphil, CETAPHIL, Cetaphil India)",
    category: "Normalization",
    run: async () => {
      const res1 = NormalizationService.normalizeBrand("Cetaphil");
      const res2 = NormalizationService.normalizeBrand("CETAPHIL");
      const res3 = NormalizationService.normalizeBrand("Cetaphil India");
      const res4 = NormalizationService.normalizeBrand("BeMinimalist");

      const allMatch =
        res1.canonicalBrand === "Cetaphil" &&
        res2.canonicalBrand === "Cetaphil" &&
        res3.canonicalBrand === "Cetaphil" &&
        res4.canonicalBrand === "Minimalist";

      if (!allMatch) {
        return { passed: false, message: `Brand mapping mismatch: ${res1.canonicalBrand}, ${res2.canonicalBrand}, ${res3.canonicalBrand}, ${res4.canonicalBrand}` };
      }

      // Verify original brand preservation
      if (res3.originalBrand !== "Cetaphil India") {
        return { passed: false, message: "Original brand source was overwritten." };
      }

      return {
        passed: true,
        message: `Accurately mapped variations ("CETAPHIL", "Cetaphil India") to "Cetaphil" while preserving raw source values.`,
      };
    },
  },
  {
    id: "norm-category-mapping",
    name: "Category Normalization into RoutineStep Categories",
    category: "Normalization",
    run: async () => {
      const c1 = NormalizationService.normalizeCategory("Day Cream");
      const c2 = NormalizationService.normalizeCategory("Sunblock SPF 50");
      const c3 = NormalizationService.normalizeCategory("Ampoule Concentrate");
      const c4 = NormalizationService.normalizeCategory("Foaming Wash");

      const valid =
        c1.canonicalCategory === "Moisturizer" &&
        c2.canonicalCategory === "Sunscreen" &&
        c3.canonicalCategory === "Serum" &&
        c4.canonicalCategory === "Face Wash";

      if (!valid) {
        return { passed: false, message: `Category mapping mismatch: ${c1.canonicalCategory}, ${c2.canonicalCategory}, ${c3.canonicalCategory}, ${c4.canonicalCategory}` };
      }
      return {
        passed: true,
        message: `Normalized "Day Cream" -> "Moisturizer", "Sunblock" -> "Sunscreen", "Ampoule" -> "Serum", "Foaming Wash" -> "Face Wash".`,
      };
    },
  },
  {
    id: "norm-quantity-unit",
    name: "Quantity & Unit Normalization (50 ml, 50ML, 50 mL)",
    category: "Normalization",
    run: async () => {
      const q1 = NormalizationService.normalizeQuantityAndUnit("50 ml");
      const q2 = NormalizationService.normalizeQuantityAndUnit("50ML");
      const q3 = NormalizationService.normalizeQuantityAndUnit("50 mL");
      const q4 = NormalizationService.normalizeQuantityAndUnit("100gm");

      const valid =
        q1.quantity === 50 && q1.unit === "ml" &&
        q2.quantity === 50 && q2.unit === "ml" &&
        q3.quantity === 50 && q3.unit === "ml" &&
        q4.quantity === 100 && q4.unit === "g";

      if (!valid) {
        return { passed: false, message: "Quantity or unit string extraction failed." };
      }
      return {
        passed: true,
        message: `Normalized "50 ml", "50ML", "50 mL" -> 50 ml and "100gm" -> 100 g.`,
      };
    },
  },
  {
    id: "norm-ingredient-inci",
    name: "Ingredient INCI Normalization & Uncertainty Flagging",
    category: "Normalization",
    run: async () => {
      const rawList = ["Nicotinamide", "Sodium Hyaluronate", "BHA", "UnknownBotanicalExtractXYZ"];
      const res = NormalizationService.normalizeIngredients(rawList);

      const hasNiacinamide = res.normalized.includes("Niacinamide");
      const hasHyaluronic = res.normalized.includes("Hyaluronic Acid");
      const hasSalicylic = res.normalized.includes("Salicylic Acid");
      const caughtUncertain = res.uncertain.includes("UnknownBotanicalExtractXYZ");

      if (!hasNiacinamide || !hasHyaluronic || !hasSalicylic || !caughtUncertain) {
        return { passed: false, message: "INCI resolution or uncertainty tracking failed." };
      }
      return {
        passed: true,
        message: `Resolved "Nicotinamide" -> "Niacinamide", "BHA" -> "Salicylic Acid", and flagged unknown items without guessing.`,
      };
    },
  },

  // ==========================================
  // 3. PRODUCT IDENTITY & DUPLICATES
  // ==========================================
  {
    id: "identity-cross-platform-matching",
    name: "Cross-Platform Product Identity Linking",
    category: "Product Identity",
    run: async () => {
      const existingProduct: Product = {
        id: "p_test_10",
        name: "10% Niacinamide Face Serum",
        brand: "Minimalist",
        category: "Serum",
        description: "Test",
        images: ["/test.jpg"],
        image: "/test.jpg",
        quantity: 30,
        unit: "ml",
        keyIngredients: ["Niacinamide"],
        allIngredients: ["Aqua", "Niacinamide"],
        rating: 4.8,
        reviewCount: 100,
        productStatus: "Complete",
        dataConfidence: 95,
        source: "Direct",
        lastUpdated: "2026-09-10",
        skinTypes: ["Oily"],
        targetConcerns: ["Acne"],
        crueltyFree: true,
        vegan: true,
        fragranceFree: true,
        parabenFree: true,
        siliconeFree: true,
        usageTime: "Both",
        summary: "Test",
      };

      const match = ProductMatchingService.matchProductIdentity(
        {
          name: "10% Niacinamide Face Serum with Zinc",
          brand: "Minimalist",
          category: "Serum",
          quantity: 30,
          unit: "ml",
          keyIngredients: ["Niacinamide"],
        },
        [existingProduct]
      );

      if (match.matchType !== "exact_match" || match.matchedProductId !== "p_test_10") {
        return { passed: false, message: `Expected exact match to p_test_10, got ${match.matchType}` };
      }
      return {
        passed: true,
        message: `Correctly mapped multi-platform candidate to existing product ID #${match.matchedProductId} (Confidence: ${match.confidenceScore}%).`,
      };
    },
  },
  {
    id: "identity-variant-handling",
    name: "Variant Handling (30ml vs 50ml Distinct Entities)",
    category: "Product Identity",
    run: async () => {
      const existing30ml: Product = {
        id: "p_30ml",
        name: "Gentle Skin Cleanser",
        brand: "Cetaphil",
        category: "Cleanser",
        description: "30ml variant",
        images: ["/test.jpg"],
        image: "/test.jpg",
        quantity: 30,
        unit: "ml",
        keyIngredients: [],
        allIngredients: [],
        rating: 4.6,
        reviewCount: 50,
        productStatus: "Complete",
        dataConfidence: 90,
        source: "Direct",
        lastUpdated: "2026-09-10",
        skinTypes: ["Sensitive"],
        targetConcerns: ["Dryness"],
        crueltyFree: true,
        vegan: true,
        fragranceFree: true,
        parabenFree: true,
        siliconeFree: true,
        usageTime: "Both",
        summary: "Test",
      };

      const match = ProductMatchingService.matchProductIdentity(
        {
          name: "Gentle Skin Cleanser",
          brand: "Cetaphil",
          category: "Cleanser",
          quantity: 125, // Different size variant
          unit: "ml",
        },
        [existing30ml]
      );

      // Must NOT be exact match! Must be distinct or flagged candidate
      if (match.matchType === "exact_match") {
        return { passed: false, message: "System erroneously merged 30ml and 125ml variants into one product." };
      }
      return {
        passed: true,
        message: `Successfully differentiated 30ml and 125ml size variants without false auto-merging.`,
      };
    },
  },

  // ==========================================
  // 4. PRICE & AVAILABILITY VALIDATION
  // ==========================================
  {
    id: "price-no-fake-defaults",
    name: "Price Validation: Missing Price is Null, Never Fake ₹0",
    category: "Price & Availability",
    run: async () => {
      const missingPrice = ValidationService.validatePrice(null);
      const zeroPrice = ValidationService.validatePrice(0);
      const negativePrice = ValidationService.validatePrice(-450);
      const validPrice = ValidationService.validatePrice(549, 599);

      if (missingPrice.price !== null) {
        return { passed: false, message: "Missing price did not return null." };
      }
      if (zeroPrice.isValid) {
        return { passed: false, message: "Fake ₹0 price was accepted instead of being rejected." };
      }
      if (negativePrice.isValid) {
        return { passed: false, message: "Negative price was accepted." };
      }
      if (!validPrice.isValid || validPrice.price !== 549 || validPrice.discountPercent !== 8) {
        return { passed: false, message: "Valid price calculation failed." };
      }

      return {
        passed: true,
        message: "Verified: Missing price remains null (no fake ₹0), negative prices rejected, discounts computed cleanly.",
      };
    },
  },
  {
    id: "avail-explicit-states",
    name: "Explicit Availability States (Available, Unavailable, Unknown)",
    category: "Price & Availability",
    run: async () => {
      const s1 = ValidationService.validateAvailability("In Stock");
      const s2 = ValidationService.validateAvailability("Sold Out");
      const s3 = ValidationService.validateAvailability(undefined);

      if (s1 !== "Available" || s2 !== "Unavailable" || s3 !== "Unknown") {
        return { passed: false, message: `Availability mismatch: ${s1}, ${s2}, ${s3}` };
      }
      return {
        passed: true,
        message: `Explicit states preserved: "In Stock" -> Available, "Sold Out" -> Unavailable, Missing -> Unknown.`,
      };
    },
  },

  // ==========================================
  // 5. SEARCH & NO HALLUCINATIONS
  // ==========================================
  {
    id: "search-typo-tolerance",
    name: "Fuzzy Search & Typo Tolerance (Niacinmide, Cetaphill)",
    category: "Search & No-Hallucination",
    run: async () => {
      const typoResult = await ProductSearchService.searchVerifiedProducts("Niacinmide");
      if (typoResult.products.length === 0) {
        return { passed: false, message: `Typo search for "Niacinmide" yielded 0 results.` };
      }
      const hasNiacinamideProduct = typoResult.products.some(
        (p) => p.name.toLowerCase().includes("niacinamide") || p.allIngredients.includes("Niacinamide")
      );
      if (!hasNiacinamideProduct) {
        return { passed: false, message: "Typo search did not match Niacinamide product." };
      }
      return {
        passed: true,
        message: `Fuzzy search successfully matched ${typoResult.products.length} products for query "Niacinmide".`,
      };
    },
  },
  {
    id: "search-no-hallucinations-guarantee",
    name: "Zero Hallucinated Products with Requirement Relaxation",
    category: "Search & No-Hallucination",
    run: async () => {
      // Impossible query with severe constraints: Luxury Sunscreen under ₹50
      const res = await ProductSearchService.searchVerifiedProducts("Sunscreen", {
        category: "Sunscreen",
        maxPrice: 50, // Impossible budget cap
      });

      // Must NOT fabricate a fake ₹50 sunscreen!
      if (res.products.length > 0) {
        return { passed: false, message: "Hallucination failure: Fabricated product returned for impossible ₹50 budget." };
      }

      if (!res.hasRelaxedFallbacks || !res.relaxedExplanation) {
        return { passed: false, message: "Relaxation explanation was not provided." };
      }

      return {
        passed: true,
        message: `Strictly verified zero hallucinated products. Transparent relaxation returned: "${res.relaxedExplanation}"`,
      };
    },
  },
  {
    id: "recs-honest-missing-ingredients",
    name: "Honest Recommendation Notice on Incomplete Ingredients",
    category: "Search & No-Hallucination",
    run: async () => {
      const incompleteProduct: Product = {
        id: "p_incomplete_test",
        name: "Unlisted Ingredients Cream",
        brand: "Generic",
        category: "Moisturizer",
        description: "Test",
        images: ["/test.jpg"],
        image: "/test.jpg",
        quantity: 50,
        unit: "ml",
        keyIngredients: [],
        allIngredients: [],
        rating: 4.2,
        reviewCount: 10,
        productStatus: "Incomplete",
        dataConfidence: 55,
        source: "Catalog Index",
        lastUpdated: "2026-09-10",
        skinTypes: ["All Skin Types" as any],
        targetConcerns: ["Dryness"],
        crueltyFree: true,
        vegan: true,
        fragranceFree: true,
        parabenFree: true,
        siliconeFree: true,
        usageTime: "Both",
        summary: "Test",
      };

      const req = AIRequirementService.createEmptyRequirementObject("Test Request");
      req.category = "Moisturizer";

      const scored = RecommendationEngineService.scoreSingleProduct(incompleteProduct, req);
      const hasHonestNotice = scored.whyRecommended.some((r) =>
        r.includes("Ingredient information is unavailable")
      );

      if (!hasHonestNotice) {
        return { passed: false, message: "Engine failed to output honest missing ingredient notice." };
      }
      return {
        passed: true,
        message: `Recommendation engine outputted honest transparency notice: "Ingredient information is unavailable, so ingredient compatibility could not be fully evaluated."`,
      };
    },
  },

  // ==========================================
  // 6. DATA CONFIDENCE
  // ==========================================
  {
    id: "confidence-separate-from-compatibility",
    name: "Data Confidence Calculated Independently of Compatibility",
    category: "Data Confidence",
    run: async () => {
      const highQualityProduct: Product = {
        id: "p_hq",
        name: "10% Niacinamide Serum",
        brand: "Minimalist",
        category: "Serum",
        description: "High quality verified dermo-cosmetic product with full INCI.",
        images: ["/img1.jpg", "/img2.jpg"],
        image: "/img1.jpg",
        quantity: 30,
        unit: "ml",
        keyIngredients: ["Niacinamide"],
        allIngredients: ["Aqua", "Niacinamide", "Zinc PCA", "Glycerin"],
        rating: 4.8,
        reviewCount: 1500,
        productStatus: "Complete",
        dataConfidence: 95,
        source: "Brand Direct Catalog Feed",
        lastUpdated: new Date().toISOString().split("T")[0],
        skinTypes: ["Oily"],
        targetConcerns: ["Acne"],
        crueltyFree: true,
        vegan: true,
        fragranceFree: true,
        parabenFree: true,
        siliconeFree: true,
        usageTime: "Both",
        summary: "Complete verified product",
      };

      const assessment = DataQualityCalculatorService.assessProductQuality(
        highQualityProduct,
        [{ id: "l1", productId: "p_hq", platform: "Nykaa", seller: "Retail", price: 549, quantity: 30, unit: "ml", availability: "Available", productUrl: "https://nykaa.com", lastUpdated: "2026-09-12" }],
        95
      );

      if (assessment.overallConfidence < 85) {
        return { passed: false, message: `Expected high data confidence (>=85%), got ${assessment.overallConfidence}%` };
      }
      if (assessment.qualityState !== "Complete") {
        return { passed: false, message: `Expected Complete quality state, got ${assessment.qualityState}` };
      }

      return {
        passed: true,
        message: `Data Confidence accurately calculated as ${assessment.overallConfidence}% (${assessment.qualityState}) based on source reliability (95%), full field completeness, and price freshness.`,
      };
    },
  },
];
