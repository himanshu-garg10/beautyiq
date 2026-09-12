import type {
  Product,
  ProductListing,
  DataPipelineRunLog,
  RawProductRecord,
  DuplicateCandidate,
  DataQualityIssue,
} from "@/types";
import { DataSourceService } from "./data-source.service";
import { RawStorageService } from "./raw-storage.service";
import { ValidationService, type RawProductInput } from "./validation.service";
import { NormalizationService } from "./normalization.service";
import { ProductMatchingService } from "./product-matching.service";
import { DataQualityCalculatorService } from "./data-quality-calculator.service";
import { AdminDataService } from "../admin-data.service";

const PIPELINE_LOGS_KEY = "beautyiq_pipeline_logs";
const VERIFIED_PRODUCTS_KEY = "beautyiq_verified_products";
const VERIFIED_LISTINGS_KEY = "beautyiq_verified_listings";

export class PipelineOrchestratorService {
  private static getStoredLogs(): DataPipelineRunLog[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(PIPELINE_LOGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static saveStoredLogs(logs: DataPipelineRunLog[]): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PIPELINE_LOGS_KEY, JSON.stringify(logs));
      } catch (e) {
        console.warn("Failed to persist pipeline logs:", e);
      }
    }
  }

  static async getPipelineLogs(): Promise<DataPipelineRunLog[]> {
    return this.getStoredLogs();
  }

  /**
   * Main Pipeline Ingestion Entry Point
   * Ingests, validates, cleans, normalizes, links, and persists a batch of raw records from an approved source.
   */
  static async runIngestionPipeline(
    sourceId: string,
    rawRecords: RawProductInput[]
  ): Promise<DataPipelineRunLog> {
    const startedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
    const source = await DataSourceService.getDataSourceById(sourceId);

    const log: DataPipelineRunLog = {
      id: `pipe-run-${Date.now()}`,
      sourceId,
      sourceName: source?.name || "Unknown Source",
      startedAt,
      completedAt: "",
      status: "success",
      recordsReceived: rawRecords.length,
      recordsAccepted: 0,
      recordsRejected: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      duplicatesDetected: 0,
      validationFailures: 0,
      errors: [],
    };

    // 0. Permission Guard (Do NOT allow unauthorized or unverified sources into production)
    if (source && !DataSourceService.isSourcePermitted(source)) {
      log.status = "failed";
      log.errors.push(`Data source "${source.name}" is not approved or active. Ingestion blocked.`);
      log.completedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
      this.recordLog(log);
      return log;
    }

    // Retrieve active catalog for duplicate & identity matching
    const existingProducts = await AdminDataService.getProducts();
    const existingListings = await AdminDataService.getListings();

    const createdProducts: Product[] = [];
    const updatedProducts: Product[] = [];
    const createdListings: ProductListing[] = [];

    for (let i = 0; i < rawRecords.length; i++) {
      const raw = rawRecords[i];
      const extId = raw.barcodeOrGtin || `item-${i + 1}`;

      // 1. Raw Storage Layer: Preserve raw incoming payload before any mutation
      const storedRaw = await RawStorageService.storeRawRecord(
        sourceId,
        source?.name || "External Source",
        extId,
        raw
      );

      // 2. Data Validation Layer
      const validation = ValidationService.validateProductRecord(raw);
      if (!validation.isValid) {
        log.recordsRejected++;
        log.validationFailures++;
        const failureReason = validation.errors.join("; ");
        await RawStorageService.markRecordFailed(storedRaw.id, "validation", failureReason);
        log.errors.push(`Record #${i + 1} (${raw.name || "Untitled"}): ${failureReason}`);
        continue;
      }

      // Validate Price and Availability
      const priceValidation = ValidationService.validatePrice(raw.price, raw.originalPrice);
      if (!priceValidation.isValid && priceValidation.error) {
        log.recordsRejected++;
        log.validationFailures++;
        await RawStorageService.markRecordFailed(storedRaw.id, "price_validation", priceValidation.error);
        log.errors.push(`Record #${i + 1}: ${priceValidation.error}`);
        continue;
      }
      const availability = ValidationService.validateAvailability(raw.availability);

      // 3. Normalization Layer (Brand, Category, Quantity/Unit)
      const brandNorm = NormalizationService.normalizeBrand(raw.brand);
      const catNorm = NormalizationService.normalizeCategory(raw.category, raw.name);
      const qtyNorm = NormalizationService.normalizeQuantityAndUnit(raw.quantity, raw.unit);

      // 4. Ingredient Normalization Layer
      const ingredientNorm = NormalizationService.normalizeIngredients(
        raw.allIngredients || raw.ingredients || raw.keyIngredients || []
      );

      // 5. Product Identity & Duplicate Matching Layer
      const identityMatch = ProductMatchingService.matchProductIdentity(
        {
          name: raw.name,
          brand: brandNorm.canonicalBrand,
          category: catNorm.canonicalCategory,
          quantity: qtyNorm.quantity,
          unit: qtyNorm.unit,
          barcodeOrGtin: raw.barcodeOrGtin,
          keyIngredients: ingredientNorm.normalized.slice(0, 3),
        },
        [...existingProducts, ...createdProducts]
      );

      let targetProductId = "";

      if (identityMatch.matchType === "exact_match" && identityMatch.matchedProductId) {
        // MATCH FOUND: Map new platform listing to existing canonical product
        targetProductId = identityMatch.matchedProductId;
        log.recordsUpdated++;
      } else {
        // DUPLICATE CANDIDATE CHECK:
        if (identityMatch.matchType === "potential_duplicate" && identityMatch.duplicateCandidate) {
          log.duplicatesDetected++;
          // Queue for administrative review in Data Quality console
          this.queueDuplicateCandidate(identityMatch.duplicateCandidate);
        }

        // CREATE NEW PRODUCT ENTITY
        const newProdId = `prod-verified-${Date.now()}-${i}`;
        targetProductId = newProdId;

        // 6. Quality & Confidence Assessment Layer
        const qualityAssessment = DataQualityCalculatorService.assessProductQuality(
          {
            name: raw.name,
            brand: brandNorm.canonicalBrand,
            category: catNorm.canonicalCategory,
            quantity: qtyNorm.quantity,
            allIngredients: ingredientNorm.normalized,
            uncertainIngredients: ingredientNorm.uncertain,
            rating: raw.rating !== undefined && raw.rating !== null ? parseFloat(raw.rating) : null,
            images: raw.images || (raw.image ? [raw.image] : []),
            lastUpdated: raw.lastUpdated || new Date().toISOString().split("T")[0],
          },
          [],
          source?.reliabilityScore ?? 90
        );

        const newProduct: Product = {
          id: newProdId,
          name: raw.name.trim(),
          brand: brandNorm.canonicalBrand,
          originalBrand: brandNorm.originalBrand,
          category: catNorm.canonicalCategory,
          description: raw.description || `${brandNorm.canonicalBrand} ${raw.name}. Verified dermatological product entity.`,
          images: raw.images && raw.images.length > 0
            ? raw.images
            : raw.image ? [raw.image] : ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=700&auto=format&fit=crop"],
          image: raw.image || raw.images?.[0] || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=700&auto=format&fit=crop",
          quantity: qtyNorm.quantity,
          unit: qtyNorm.unit,
          keyIngredients: ingredientNorm.normalized.slice(0, 4),
          allIngredients: ingredientNorm.normalized,
          uncertainIngredients: ingredientNorm.uncertain,
          rating: raw.rating !== undefined && raw.rating !== null ? Math.round(parseFloat(raw.rating) * 10) / 10 : null,
          reviewCount: raw.reviewCount ? parseInt(raw.reviewCount, 10) : 1,
          productStatus: qualityAssessment.qualityState === "Complete" ? "Complete" : "Incomplete",
          dataConfidence: qualityAssessment.overallConfidence,
          source: source?.name || "Verified Ingestion Feed",
          dataSourceId: sourceId,
          barcodeOrGtin: raw.barcodeOrGtin,
          isVerified: true,
          lastUpdated: raw.lastUpdated || new Date().toISOString().split("T")[0],
          skinTypes: raw.skinTypes || ["All Skin Types" as any],
          targetConcerns: raw.targetConcerns || [],
          crueltyFree: raw.crueltyFree ?? true,
          vegan: raw.vegan ?? true,
          fragranceFree: raw.fragranceFree ?? true,
          parabenFree: raw.parabenFree ?? true,
          siliconeFree: raw.siliconeFree ?? false,
          usageTime: raw.usageTime || "Both",
          summary: raw.description?.slice(0, 140) || `${brandNorm.canonicalBrand} ${raw.name}`,
          dataQualityFlags: qualityAssessment.qualityFlags,
        };

        createdProducts.push(newProduct);
        log.recordsCreated++;
      }

      // 7. Create Listing Entity linked to Product
      const newListingId = `list-${targetProductId}-${Date.now()}-${i}`;
      const unitPriceCalc = priceValidation.price !== null && qtyNorm.quantity > 0
        ? Math.round((priceValidation.price / qtyNorm.quantity) * 100) / 100
        : undefined;

      const newListing: ProductListing = {
        id: newListingId,
        productId: targetProductId,
        platform: raw.platform || source?.name || "Partner Store",
        seller: raw.seller || `${brandNorm.canonicalBrand} Official Store`,
        price: priceValidation.price,
        originalPrice: priceValidation.originalPrice,
        discountPercent: priceValidation.discountPercent,
        quantity: qtyNorm.quantity,
        unit: qtyNorm.unit,
        availability,
        productUrl: raw.sourceUrl || "https://beminimalist.co",
        lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 16),
        priceLastUpdated: new Date().toISOString().replace("T", " ").substring(0, 16),
        availabilityLastUpdated: new Date().toISOString().replace("T", " ").substring(0, 16),
        unitPricePerMl: qtyNorm.unit === "ml" ? unitPriceCalc : undefined,
        unitPricePerGram: qtyNorm.unit === "g" ? unitPriceCalc : undefined,
        isVerifiedSource: true,
        valueScore: 85,
      };

      createdListings.push(newListing);
      log.recordsAccepted++;

      // Mark raw storage item as processed
      await RawStorageService.markRecordProcessed(storedRaw.id, targetProductId);
    }

    // 8. Commit to Production Admin Catalog
    for (const p of createdProducts) {
      await AdminDataService.createProduct(p);
    }
    for (const l of createdListings) {
      await AdminDataService.createListing(l);
    }

    // Record DataSource sync success
    if (sourceId) {
      await DataSourceService.recordSyncSuccess(sourceId);
    }

    log.completedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
    if (log.errors.length > 0 && log.recordsAccepted > 0) {
      log.status = "warning";
    } else if (log.recordsAccepted === 0 && log.recordsReceived > 0) {
      log.status = "failed";
    }

    this.recordLog(log);

    // Record Admin Activity Log
    AdminDataService.logAction(
      "RUN_DATA_PIPELINE",
      "system",
      log.id,
      log.sourceName,
      `Ingestion completed: ${log.recordsAccepted} accepted (${log.recordsCreated} created, ${log.recordsUpdated} updated), ${log.recordsRejected} rejected.`
    );

    return log;
  }

  private static recordLog(log: DataPipelineRunLog): void {
    const logs = this.getStoredLogs();
    const updated = [log, ...logs].slice(0, 100);
    this.saveStoredLogs(updated);
  }

  private static queueDuplicateCandidate(candidate: DuplicateCandidate): void {
    try {
      if (typeof window !== "undefined") {
        const key = "beautyiq_admin_duplicates";
        const existing: DuplicateCandidate[] = JSON.parse(localStorage.getItem(key) || "[]");
        localStorage.setItem(key, JSON.stringify([candidate, ...existing]));
      }
    } catch (e) {
      console.warn("Failed to queue duplicate candidate:", e);
    }
  }
}
