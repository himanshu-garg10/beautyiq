import { db } from "../database/connection";

export class WishlistRepository {
  static getWishlistProductIds(userId: string): string[] {
    const rows = db
      .prepare("SELECT product_id FROM wishlists WHERE user_id = ? ORDER BY added_at DESC")
      .all(userId) as { product_id: string }[];
    return rows.map((r) => r.product_id);
  }

  static addToWishlist(userId: string, productId: string): string[] {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT OR IGNORE INTO wishlists (user_id, product_id, added_at)
      VALUES (?, ?, ?)
    `).run(userId, productId, now);

    return this.getWishlistProductIds(userId);
  }

  static removeFromWishlist(userId: string, productId: string): string[] {
    db.prepare("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?").run(
      userId,
      productId
    );
    return this.getWishlistProductIds(userId);
  }

  static clearWishlist(userId: string): string[] {
    db.prepare("DELETE FROM wishlists WHERE user_id = ?").run(userId);
    return [];
  }

  static getSavedProducts(userId: string): { productId: string; note?: string; savedAt: string }[] {
    const rows = db
      .prepare("SELECT product_id, note, saved_at FROM saved_products WHERE user_id = ? ORDER BY saved_at DESC")
      .all(userId) as { product_id: string; note: string | null; saved_at: string }[];

    return rows.map((r) => ({
      productId: r.product_id,
      note: r.note || undefined,
      savedAt: r.saved_at,
    }));
  }

  static saveProduct(userId: string, productId: string, note?: string): void {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO saved_products (user_id, product_id, note, saved_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, product_id) DO UPDATE SET note = excluded.note, saved_at = excluded.saved_at
    `).run(userId, productId, note || null, now);
  }

  static removeSavedProduct(userId: string, productId: string): void {
    db.prepare("DELETE FROM saved_products WHERE user_id = ? AND product_id = ?").run(
      userId,
      productId
    );
  }
}
