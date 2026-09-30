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
    const targetUser = userId || "u1";
    if (typeof window === "undefined") {
      const defaultUser = mockUsers.find((u) => u.id === targetUser);
      return defaultUser?.wishlistIds || ["p1", "p4"];
    }
    try {
      const storedUsers = localStorage.getItem("beautyiq_users_db") || localStorage.getItem("beautyiq_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const u = users.find((item: any) => item.id === targetUser);
        if (u && Array.isArray(u.wishlistIds)) {
          return u.wishlistIds;
        }
      }
      const stored = localStorage.getItem(`${WISHLIST_STORAGE_KEY}_${targetUser}`);
      if (stored) {
        return JSON.parse(stored);
      }
      const defaultUser = mockUsers.find((u) => u.id === targetUser);
      const initial = defaultUser?.wishlistIds || ["p1", "p4"];
      localStorage.setItem(`${WISHLIST_STORAGE_KEY}_${targetUser}`, JSON.stringify(initial));
      return initial;
    } catch {
      return ["p1", "p4"];
    }
  }

  /**
   * Helper to persist wishlist product IDs and sync across user state
   */
  private static saveWishlistIds(userId: string, ids: string[]): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${WISHLIST_STORAGE_KEY}_${userId}`, JSON.stringify(ids));
        const syncUserKey = (key: string) => {
          const stored = localStorage.getItem(key);
          if (stored) {
            const users = JSON.parse(stored);
            const uIdx = users.findIndex((u: any) => u.id === userId);
            if (uIdx !== -1) {
              users[uIdx].wishlistIds = ids;
              localStorage.setItem(key, JSON.stringify(users));
            }
          }
        };
        syncUserKey("beautyiq_users_db");
        syncUserKey("beautyiq_users");
        window.dispatchEvent(new CustomEvent("beautyiq_wishlist_update", { detail: { userId, ids } }));
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

      // Trigger real in-app notification
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
