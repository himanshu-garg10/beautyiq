import crypto from "node:crypto";
import type {
  User,
  UserRole,
  SkinProfile,
  UserPersonalProfile,
  PrivacySettings,
  NotificationPreferences,
  RecommendationHistoryItem,
} from "@/types";
import { db } from "./connection";
import { hashPassword } from "./crypto";
import { sampleDefaultProfile } from "./seeds";

export interface DbUserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  password_salt: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfileRow {
  user_id: string;
  skin_profile_json: string | null;
  personal_profile_json: string | null;
  privacy_settings_json: string | null;
  notification_preferences_json: string | null;
  updated_at: string;
}

export class DbService {
  /**
   * Create a new user with secure password hash and default profile
   */
  static createUser(params: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): User {
    const { name, email, password, role = "customer" } = params;
    const userId = `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const { salt, hash } = hashPassword(password);

    const initialSkinProfile: SkinProfile = {
      ...sampleDefaultProfile,
      isOnboardingComplete: false,
      completedStepsCount: 0,
    };

    const initialPersonalProfile: UserPersonalProfile = {
      ageGroup: "25 to 34",
      gender: "Prefer not to say",
      country: "India",
      currencyPreference: "₹ (INR)",
    };

    const initialPrivacySettings: PrivacySettings = {
      profileVisibility: "Private",
      imageStoragePreference: false,
    };

    const initialNotificationPreferences: NotificationPreferences = {
      reminders: true,
      progressUpdates: true,
      newRecommendations: true,
      productAlerts: true,
      educationalContent: false,
    };

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, password_salt, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `);

    const insertProfile = db.prepare(`
      INSERT INTO user_profiles (user_id, skin_profile_json, personal_profile_json, privacy_settings_json, notification_preferences_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const runTx = db.transaction(() => {
      insertUser.run(userId, name.trim(), email.trim().toLowerCase(), hash, salt, role, now, now);
      insertProfile.run(
        userId,
        JSON.stringify(initialSkinProfile),
        JSON.stringify(initialPersonalProfile),
        JSON.stringify(initialPrivacySettings),
        JSON.stringify(initialNotificationPreferences),
        now
      );
    });

    runTx();

    return {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status: "active",
      skinProfile: initialSkinProfile,
      personalProfile: initialPersonalProfile,
      privacySettings: initialPrivacySettings,
      notificationPreferences: initialNotificationPreferences,
      wishlistIds: [],
      searchHistory: [],
      createdAt: now.split("T")[0],
    };
  }

  /**
   * Find user by email (including password credentials for verification)
   */
  static findUserByEmailWithAuth(email: string): (DbUserRow & { profile?: DbProfileRow }) | null {
    const userRow = db
      .prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE")
      .get(email.trim().toLowerCase()) as DbUserRow | undefined;

    if (!userRow) return null;

    const profileRow = db
      .prepare("SELECT * FROM user_profiles WHERE user_id = ?")
      .get(userRow.id) as DbProfileRow | undefined;

    return { ...userRow, profile: profileRow };
  }

  /**
   * Find user by ID and return sanitized domain User model
   */
  static findUserById(id: string): User | null {
    const userRow = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as DbUserRow | undefined;

    if (!userRow) return null;

    const profileRow = db
      .prepare("SELECT * FROM user_profiles WHERE user_id = ?")
      .get(id) as DbProfileRow | undefined;

    const wishlistRows = db
      .prepare("SELECT product_id FROM wishlists WHERE user_id = ?")
      .all(id) as { product_id: string }[];

    let skinProfile: SkinProfile | undefined;
    let personalProfile: UserPersonalProfile | undefined;
    let privacySettings: PrivacySettings | undefined;
    let notificationPreferences: NotificationPreferences | undefined;

    if (profileRow) {
      if (profileRow.skin_profile_json) {
        try {
          skinProfile = JSON.parse(profileRow.skin_profile_json);
        } catch {}
      }
      if (profileRow.personal_profile_json) {
        try {
          personalProfile = JSON.parse(profileRow.personal_profile_json);
        } catch {}
      }
      if (profileRow.privacy_settings_json) {
        try {
          privacySettings = JSON.parse(profileRow.privacy_settings_json);
        } catch {}
      }
      if (profileRow.notification_preferences_json) {
        try {
          notificationPreferences = JSON.parse(profileRow.notification_preferences_json);
        } catch {}
      }
    }

    return {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
      status: userRow.status,
      avatarUrl: userRow.avatar_url || undefined,
      skinProfile,
      personalProfile,
      privacySettings,
      notificationPreferences,
      wishlistIds: wishlistRows.map((w) => w.product_id),
      searchHistory: [],
      createdAt: userRow.created_at.split("T")[0],
    };
  }

  /**
   * Session Management
   */
  static createSession(userId: string): { token: string; expiresAt: number } {
    const token = `sess_${crypto.randomBytes(24).toString("hex")}`;
    const expiresAt = Date.now() + 86400000 * 30; // 30 days
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, userId, expiresAt, now);

    return { token, expiresAt };
  }

  static getSession(token: string): { token: string; userId: string; expiresAt: number } | null {
    const row = db
      .prepare("SELECT token, user_id, expires_at FROM sessions WHERE token = ?")
      .get(token) as { token: string; user_id: string; expires_at: number } | undefined;

    if (!row) return null;
    if (Date.now() > row.expires_at) {
      this.deleteSession(token);
      return null;
    }
    return { token: row.token, userId: row.user_id, expiresAt: row.expires_at };
  }

  static deleteSession(token: string): void {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }

  static deleteUserSessions(userId: string): void {
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  }

  /**
   * User Profile Updates
   */
  static updateUserProfile(
    userId: string,
    data: {
      skinProfile?: Partial<SkinProfile>;
      personalProfile?: Partial<UserPersonalProfile>;
      privacySettings?: Partial<PrivacySettings>;
      notificationPreferences?: Partial<NotificationPreferences>;
      name?: string;
    }
  ): User | null {
    const user = this.findUserById(userId);
    if (!user) return null;

    const now = new Date().toISOString();

    if (data.name) {
      db.prepare("UPDATE users SET name = ?, updated_at = ? WHERE id = ?").run(
        data.name.trim(),
        now,
        userId
      );
    }

    const currentProfileRow = db
      .prepare("SELECT * FROM user_profiles WHERE user_id = ?")
      .get(userId) as DbProfileRow | undefined;

    const mergedSkin = {
      ...(user.skinProfile || sampleDefaultProfile),
      ...(data.skinProfile || {}),
    };

    const mergedPersonal = {
      ...(user.personalProfile || {}),
      ...(data.personalProfile || {}),
    };

    const mergedPrivacy = {
      ...(user.privacySettings || {}),
      ...(data.privacySettings || {}),
    };

    const mergedNotifications = {
      ...(user.notificationPreferences || {}),
      ...(data.notificationPreferences || {}),
    };

    if (currentProfileRow) {
      db.prepare(`
        UPDATE user_profiles
        SET skin_profile_json = ?, personal_profile_json = ?, privacy_settings_json = ?, notification_preferences_json = ?, updated_at = ?
        WHERE user_id = ?
      `).run(
        JSON.stringify(mergedSkin),
        JSON.stringify(mergedPersonal),
        JSON.stringify(mergedPrivacy),
        JSON.stringify(mergedNotifications),
        now,
        userId
      );
    } else {
      db.prepare(`
        INSERT INTO user_profiles (user_id, skin_profile_json, personal_profile_json, privacy_settings_json, notification_preferences_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        JSON.stringify(mergedSkin),
        JSON.stringify(mergedPersonal),
        JSON.stringify(mergedPrivacy),
        JSON.stringify(mergedNotifications),
        now
      );
    }

    return this.findUserById(userId);
  }

  /**
   * Wishlist Database Operations
   */
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

  /**
   * Saved Products Database Operations
   */
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

  /**
   * Recommendation History Database Operations
   */
  static getRecommendationHistory(userId: string): RecommendationHistoryItem[] {
    const rows = db
      .prepare("SELECT * FROM recommendation_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 30")
      .all(userId) as {
      id: string;
      user_id: string;
      timestamp: string;
      query_summary: string;
      requirements_json: string;
      total_recommendations: number;
      top_product_json: string | null;
      categories_json: string | null;
      profile_context_json: string | null;
      is_recalculated: number;
    }[];

    return rows.map((r) => {
      let requirements: any = {};
      let topRecommendation: any = undefined;
      let categories: string[] = [];
      let profileContextUsed: any = undefined;

      try {
        requirements = JSON.parse(r.requirements_json);
      } catch {}
      if (r.top_product_json) {
        try {
          topRecommendation = JSON.parse(r.top_product_json);
        } catch {}
      }
      if (r.categories_json) {
        try {
          categories = JSON.parse(r.categories_json);
        } catch {}
      }
      if (r.profile_context_json) {
        try {
          profileContextUsed = JSON.parse(r.profile_context_json);
        } catch {}
      }

      return {
        id: r.id,
        userId: r.user_id,
        timestamp: r.timestamp,
        querySummary: r.query_summary,
        requirements,
        totalRecommendations: r.total_recommendations,
        topRecommendation,
        categories,
        profileContextUsed,
        isRecalculated: Boolean(r.is_recalculated),
      };
    });
  }

  static saveRecommendationSession(item: RecommendationHistoryItem): RecommendationHistoryItem {
    db.prepare(`
      INSERT OR REPLACE INTO recommendation_history (
        id, user_id, timestamp, query_summary, requirements_json,
        total_recommendations, top_product_json, categories_json,
        profile_context_json, is_recalculated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id,
      item.userId,
      item.timestamp,
      item.querySummary,
      JSON.stringify(item.requirements || {}),
      item.totalRecommendations,
      item.topRecommendation ? JSON.stringify(item.topRecommendation) : null,
      JSON.stringify(item.categories || []),
      item.profileContextUsed ? JSON.stringify(item.profileContextUsed) : null,
      item.isRecalculated ? 1 : 0
    );

    return item;
  }

  static deleteRecommendationSession(userId: string, id: string): void {
    db.prepare("DELETE FROM recommendation_history WHERE user_id = ? AND id = ?").run(
      userId,
      id
    );
  }

  static clearRecommendationHistory(userId: string): void {
    db.prepare("DELETE FROM recommendation_history WHERE user_id = ?").run(userId);
  }
}
