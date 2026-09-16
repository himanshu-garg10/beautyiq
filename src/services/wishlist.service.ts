import { products, mockUsers } from "@/lib/mock-data";
import type { Product } from "@/types";
import { ApiResponse, createSuccessResponse, createErrorResponse, simulateDelay } from "./api-client";
import { NotificationService } from "./notification.service";

const WISHLIST_STORAGE_KEY = "beautyiq_wishlist_ids";

export class WishlistService {
  /**
   * Helper to retrieve wishlist product IDs from localStorage or user record
   */
  static getWishlistIds(userId?: string): string[] {
    if (typeof window === "undefined") {
      const defaultUser = mockUsers.find((u) => u.id === (userId || "u1"));
      return defaultUser?.wishlistIds || ["p1", "p4"];
    }
    try {
      const stored = localStorage.getItem(`${WISHLIST_STORAGE_KEY}_${userId || "u1"}`);
      if (stored) {
        return JSON.parse(stored);
      }
      const initial = ["p1", "p4"];
      localStorage.setItem(`${WISHLIST_STORAGE_KEY}_${userId || "u1"}`, JSON.stringify(initial));
      return initial;
    } catch {
      return ["p1", "p4"];
    }
  }

  /**
   * Helper to persist wishlist product IDs
   */
  private static saveWishlistIds(userId: string, ids: string[]): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${WISHLIST_STORAGE_KEY}_${userId}`, JSON.stringify(ids));
      } catch (e) {
        console.warn("Failed to persist wishlist to localStorage:", e);
      }
    }
  }

  /**
   * Get all populated product items saved in customer's wishlist
   */
  static async getWishlist(userId: string): Promise<ApiResponse<Product[]>> {
    await simulateDelay(80);
    const ids = this.getWishlistIds(userId);
    const savedProducts = ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    return createSuccessResponse(savedProducts);
  }

  /**
   * Add a product to the wishlist
   */
  static async addToWishlist(userId: string, productId: string): Promise<ApiResponse<string[]>> {
    await simulateDelay(100);
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return createErrorResponse("NOT_FOUND", "Product not found.");
    }

    const current = this.getWishlistIds(userId);
    if (!current.includes(productId)) {
      const updated = [...current, productId];
      this.saveWishlistIds(userId, updated);

      // Trigger in-app notification
      NotificationService.createNotification(userId, {
        type: "PRODUCT_SAVED",
        title: "Product Saved to Wishlist",
        message: `${product.brand} ${product.name} was added to your saved products.`,
        link: "/wishlist",
        productId,
      });

      return createSuccessResponse(updated);
    }

    return createSuccessResponse(current);
  }

  /**
   * Remove a product from the wishlist
   */
  static async removeFromWishlist(userId: string, productId: string): Promise<ApiResponse<string[]>> {
    await simulateDelay(80);
    const current = this.getWishlistIds(userId);
    const updated = current.filter((id) => id !== productId);
    this.saveWishlistIds(userId, updated);
    return createSuccessResponse(updated);
  }

  /**
   * Check if a product is in the customer's wishlist
   */
  static isInWishlist(userId: string, productId: string): boolean {
    const ids = this.getWishlistIds(userId);
    return ids.includes(productId);
  }

  /**
   * Clear all products from wishlist
   */
  static async clearWishlist(userId: string): Promise<ApiResponse<string[]>> {
    await simulateDelay(80);
    this.saveWishlistIds(userId, []);
    return createSuccessResponse([]);
  }
}
