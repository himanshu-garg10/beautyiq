import type { Product, RecentlyViewedItem } from "@/types";
import { products } from "@/lib/mock-data";

const RECENTLY_VIEWED_KEY = "beautyiq_recently_viewed";

export class RecentlyViewedService {
  static getRecentlyViewedItems(): RecentlyViewedItem[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static trackView(productId: string): void {
    if (typeof window === "undefined" || !productId) return;
    try {
      const current = this.getRecentlyViewedItems();
      // Remove existing entry for same product
      const filtered = current.filter((item) => item.productId !== productId);
      // Prepend new timestamped entry
      const updated: RecentlyViewedItem[] = [
        { productId, viewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, 10); // Keep max 10 items

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save recently viewed product:", e);
    }
  }

  static getRecentlyViewedProducts(): Product[] {
    const items = this.getRecentlyViewedItems();
    return items
      .map((item) => products.find((p) => p.id === item.productId))
      .filter((p): p is Product => p !== undefined);
  }

  static clearHistory(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch (e) {
      console.warn("Failed to clear recently viewed history:", e);
    }
  }
}
