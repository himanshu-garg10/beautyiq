import crypto from "node:crypto";
import type {
  NotificationPreferences,
  PrivacySettings,
  SkinProfile,
  User,
  UserPersonalProfile,
  UserRole,
} from "@/types";
import { db } from "../database/connection";
import { hashPassword } from "../database/crypto";
import { sampleDefaultProfile } from "@/data";

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

export class UserRepository {
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
}
