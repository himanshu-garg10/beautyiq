import type { Product, RecentlyViewedItem } from "@/types";
import { products } from "@/lib/mock-data";

const RECENTLY_VIEWED_KEY = "beautyiq_recently_viewed";

export class RecentlyViewedService {
  static getRecentlyViewedItems(userId?: string): RecentlyViewedItem[] {
    if (typeof window === "undefined" || !userId) return [];
    try {
      const stored = localStorage.getItem(`${RECENTLY_VIEWED_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  }

  static trackView(productId: string, userId?: string): void {
    if (typeof window === "undefined" || !productId || !userId) return;
    try {
      const current = this.getRecentlyViewedItems(userId);
      // Remove existing entry for same product
      const filtered = current.filter((item) => item.productId !== productId);
      // Prepend new timestamped entry
      const updated: RecentlyViewedItem[] = [
        { productId, viewedAt: new Date().toISOString().replace("T", " ").substring(0, 16) },
        ...filtered,
      ].slice(0, 15); // Keep max 15 items

      localStorage.setItem(`${RECENTLY_VIEWED_KEY}_${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save recently viewed product:", e);
    }
  }

  static getRecentlyViewedProducts(userId?: string): Product[] {
    const items = this.getRecentlyViewedItems(userId);
    return items
      .map((item) => products.find((p) => p.id === item.productId))
      .filter((p): p is Product => p !== undefined);
  }

  static getRecentlyViewedDetails(userId?: string): { product: Product; viewedAt: string }[] {
    const items = this.getRecentlyViewedItems(userId);
    return items
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return null;
        return { product: prod, viewedAt: item.viewedAt };
      })
      .filter((item): item is { product: Product; viewedAt: string } => item !== null);
  }

  static removeViewedItem(productId: string, userId?: string): RecentlyViewedItem[] {
    if (typeof window === "undefined" || !userId) return [];
    try {
      const current = this.getRecentlyViewedItems(userId);
      const updated = current.filter((item) => item.productId !== productId);
      localStorage.setItem(`${RECENTLY_VIEWED_KEY}_${userId}`, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  static clearHistory(userId?: string): void {
    if (typeof window === "undefined" || !userId) return;
    try {
      localStorage.removeItem(`${RECENTLY_VIEWED_KEY}_${userId}`);
    } catch (e) {
      console.warn("Failed to clear recently viewed history:", e);
    }
  }
}
