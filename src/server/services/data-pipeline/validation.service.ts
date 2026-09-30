import type {
  AvailabilityStatus,
  PipelineValidationResult,
  ProductUnit,
} from "@/types";

export interface RawProductInput {
  name?: any;
  brand?: any;
  category?: any;
  description?: any;
  quantity?: any;
  unit?: any;
  ingredients?: any;
  allIngredients?: any;
  keyIngredients?: any;
  rating?: any;
  reviewCount?: any;
  images?: any;
  image?: any;
  source?: any;
  sourceUrl?: any;
  price?: any;
  originalPrice?: any;
  platform?: any;
  seller?: any;
  availability?: any;
  lastUpdated?: any;
  barcodeOrGtin?: any;
  skinTypes?: any;
  targetConcerns?: any;
  crueltyFree?: any;
  vegan?: any;
  fragranceFree?: any;
  parabenFree?: any;
  siliconeFree?: any;
  usageTime?: any;
}

export class ValidationService {
  /**
   * Validate incoming raw product record before normalization.
   * Reject clearly invalid records; ensure missing fields are NOT converted into fake defaults.
   */
  static validateProductRecord(raw: RawProductInput): PipelineValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldsValidated: string[] = [];

    // 1. Validate Product Name
    fieldsValidated.push("name");
    if (!raw.name || typeof raw.name !== "string" || raw.name.trim().length === 0) {
      errors.push("Product name is required and cannot be empty.");
    } else if (raw.name.trim().length < 2) {
      errors.push("Product name is too short to be a valid catalog item.");
    }

    // 2. Validate Brand
    fieldsValidated.push("brand");
    if (!raw.brand || typeof raw.brand !== "string" || raw.brand.trim().length === 0) {
      errors.push("Brand is required.");
    }

    // 3. Validate Category
    fieldsValidated.push("category");
    if (!raw.category || typeof raw.category !== "string" || raw.category.trim().length === 0) {
      errors.push("Category is required.");
    }

    // 4. Validate Quantity and Unit
    fieldsValidated.push("quantity", "unit");
    const parsedQty = parseFloat(raw.quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      errors.push("Quantity must be a positive number.");
    }

    // 5. Validate Source & Source URL
    fieldsValidated.push("source");
    if (!raw.source || typeof raw.source !== "string" || raw.source.trim().length === 0) {
      errors.push("Data source identifier is required.");
    }

    if (raw.sourceUrl) {
      fieldsValidated.push("sourceUrl");
      if (!this.isValidUrl(raw.sourceUrl)) {
        errors.push(`Invalid source URL format: "${raw.sourceUrl}". Must be a valid HTTP/HTTPS URL.`);
      }
    }

    // 6. Non-fatal completeness warnings (Do NOT fabricate fake defaults)
    if (!raw.ingredients && !raw.allIngredients && !raw.keyIngredients) {
      warnings.push("Missing ingredient composition list. Entity will be marked with reduced confidence.");
    }

    if (raw.rating !== undefined && raw.rating !== null) {
      const numRating = parseFloat(raw.rating);
      if (isNaN(numRating) || numRating < 0 || numRating > 5) {
        errors.push(`Invalid rating value: ${raw.rating}. Rating must be between 0 and 5 or null.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldsValidated,
    };
  }

  /**
   * Validate listing price information.
   * If price is missing: mark as null. Do NOT display ₹0. Do NOT invent a price.
   */
  static validatePrice(
    priceRaw: any,
    originalPriceRaw?: any
  ): {
    isValid: boolean;
    price: number | null;
    originalPrice?: number;
    discountPercent?: number;
    error?: string;
  } {
    // Missing or empty price
    if (priceRaw === undefined || priceRaw === null || priceRaw === "" || priceRaw === "N/A") {
      return {
        isValid: true,
        price: null, // Valid unavailable price state
      };
    }

    const price = typeof priceRaw === "number" ? priceRaw : parseFloat(String(priceRaw).replace(/[^0-9.]/g, ""));

    if (isNaN(price)) {
      return {
        isValid: false,
        price: null,
        error: `Price "${priceRaw}" is not a valid numeric value.`,
      };
    }

    if (price <= 0) {
      return {
        isValid: false,
        price: null,
        error: `Price must be greater than zero. Fake ₹0 prices are rejected.`,
      };
    }

    let originalPrice: number | undefined = undefined;
    let discountPercent: number | undefined = undefined;

    if (originalPriceRaw !== undefined && originalPriceRaw !== null && originalPriceRaw !== "") {
      const orig = typeof originalPriceRaw === "number" ? originalPriceRaw : parseFloat(String(originalPriceRaw).replace(/[^0-9.]/g, ""));
      if (!isNaN(orig) && orig >= price) {
        originalPrice = Math.round(orig * 100) / 100;
        discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
      }
    }

    return {
      isValid: true,
      price: Math.round(price * 100) / 100,
      originalPrice,
      discountPercent: discountPercent && discountPercent > 0 ? discountPercent : undefined,
    };
  }

  /**
   * Validate availability status.
   * Missing information should remain distinguishable from confirmed unavailability ("Unknown").
   */
  static validateAvailability(availabilityRaw: any): AvailabilityStatus {
    if (!availabilityRaw || typeof availabilityRaw !== "string") {
      return "Unknown" as AvailabilityStatus;
    }

    const normalized = availabilityRaw.toLowerCase().trim();
    if (
      normalized === "in stock" ||
      normalized === "available" ||
      normalized === "active" ||
      normalized === "in_stock"
    ) {
      return "Available";
    }

    if (
      normalized === "out of stock" ||
      normalized === "unavailable" ||
      normalized === "out_of_stock" ||
      normalized === "sold out"
    ) {
      return "Unavailable";
    }

    return "Unknown" as AvailabilityStatus;
  }

  /**
   * Safe URL format and SSRF verification
   */
  static isValidUrl(urlStr: string): boolean {
    const { UrlValidator } = require("@/lib/security/url-validator");
    return UrlValidator.isSafeExternalUrl(urlStr).isValid;
  }
}
