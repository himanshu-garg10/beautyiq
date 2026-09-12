import type { Product, RecentlyViewedItem } from "@/types";
import { products } from "@/lib/mock-data";

const RECENTLY_VIEWED_KEY = "beautyiq_recently_viewed";

export class RecentlyViewedService {
  static getRecentlyViewedItems(): RecentlyViewedItem[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initial fallback with seed products p1 and p3
      const initial: RecentlyViewedItem[] = [
        { productId: "p1", viewedAt: "2026-09-11 18:20" },
        { productId: "p3", viewedAt: "2026-09-11 15:10" },
        { productId: "p5", viewedAt: "2026-09-10 12:45" },
      ];
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(initial));
      return initial;
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
        { productId, viewedAt: new Date().toISOString().replace("T", " ").substring(0, 16) },
        ...filtered,
      ].slice(0, 15); // Keep max 15 items

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

  static getRecentlyViewedDetails(): { product: Product; viewedAt: string }[] {
    const items = this.getRecentlyViewedItems();
    return items
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return null;
        return { product: prod, viewedAt: item.viewedAt };
      })
      .filter((item): item is { product: Product; viewedAt: string } => item !== null);
  }

  static removeViewedItem(productId: string): RecentlyViewedItem[] {
    if (typeof window === "undefined") return [];
    try {
      const current = this.getRecentlyViewedItems();
      const updated = current.filter((item) => item.productId !== productId);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
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
