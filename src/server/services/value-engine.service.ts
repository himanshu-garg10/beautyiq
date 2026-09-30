import type { Product, ProductListing, ProductUnit, NormalizedValueMetric } from "@/types";

export class ValueEngineService {
  /**
   * Calculate normalized unit cost (₹/ml, ₹/g, ₹/pcs, ₹/sheet)
   */
  static calculateNormalizedUnitCost(
    price: number | null,
    quantity: number,
    unit: ProductUnit
  ): { unitPrice: number | null; unitLabel: string } {
    if (price === null || price === undefined || !quantity || quantity <= 0) {
      return {
        unitPrice: null,
        unitLabel: "Not Available",
      };
    }

    const unitPrice = Math.round((price / quantity) * 10) / 10;
    return {
      unitPrice,
      unitLabel: `₹${unitPrice}/${unit}`,
    };
  }

  /**
   * Determine Best Price listing (Lowest current available price)
   */
  static determineBestPriceListing(listings: ProductListing[]): ProductListing | null {
    const validListings = listings.filter(
      (l) => l.price !== null && l.availability !== "Not Available" && l.availability !== "Unavailable"
    );

    if (validListings.length === 0) return null;

    return validListings.reduce((best, cur) => {
      if (!best) return cur;
      if ((cur.price ?? Infinity) < (best.price ?? Infinity)) return cur;
      return best;
    }, validListings[0]);
  }

  /**
   * Determine Best Quantity Value listing (Lowest cost per ml/g)
   */
  static determineBestValueListing(
    listings: ProductListing[],
    productQuantity: number
  ): ProductListing | null {
    const validListings = listings.filter(
      (l) => l.price !== null && l.availability !== "Not Available" && l.availability !== "Unavailable"
    );

    if (validListings.length === 0 || !productQuantity || productQuantity <= 0) return null;

    return validListings.reduce((best, cur) => {
      if (!best) return cur;
      const unitCostCur = (cur.price ?? Infinity) / productQuantity;
      const unitCostBest = (best.price ?? Infinity) / productQuantity;
      return unitCostCur < unitCostBest ? cur : best;
    }, validListings[0]);
  }

  /**
   * Calculate overall normalized value metrics for a product
   */
  static getNormalizedValueMetrics(
    product: Product,
    listings: ProductListing[]
  ): NormalizedValueMetric {
    const bestPriceListing = this.determineBestPriceListing(listings);
    const bestValueListing = this.determineBestValueListing(listings, product.quantity);

    const priceToUse = bestPriceListing?.price ?? null;
    const { unitPrice, unitLabel } = this.calculateNormalizedUnitCost(
      priceToUse,
      product.quantity,
      product.unit
    );

    // Value score calculation (0 - 100) based on rating & unit cost
    let valueScore = 50;
    if (product.rating && unitPrice !== null) {
      const ratingBonus = product.rating * 12; // e.g. 4.5 * 12 = 54
      const costPenalty = Math.min(unitPrice * 1.2, 40); // higher cost/ml = lower VFM
      valueScore = Math.min(Math.max(Math.round(ratingBonus + (40 - costPenalty)), 25), 98);
    }

    return {
      productId: product.id,
      unitPrice,
      unitLabel,
      quantity: product.quantity,
      unit: product.unit,
      bestPrice: priceToUse,
      bestPricePlatform: bestPriceListing?.platform,
      bestValuePrice: bestValueListing?.price ?? null,
      bestValuePlatform: bestValueListing?.platform,
      valueScore,
    };
  }

  /**
   * Calculate Personalized Value Score combining compatibility (60%) + quantity/value (40%)
   */
  static calculatePersonalizedValueScore(
    product: Product,
    compatibilityScore: number | null,
    listings: ProductListing[]
  ): number | null {
    if (compatibilityScore === null || compatibilityScore === undefined) return null;

    const valueMetrics = this.getNormalizedValueMetrics(product, listings);
    const personalizedValue = Math.round(compatibilityScore * 0.6 + valueMetrics.valueScore * 0.4);
    return Math.min(Math.max(personalizedValue, 10), 99);
  }
}
