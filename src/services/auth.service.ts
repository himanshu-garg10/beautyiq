import { mockUsers, sampleDefaultProfile } from "@/lib/mock-data";
import type { User, UserRole, SkinProfile, UserPersonalProfile, PrivacySettings } from "@/types";
import { ApiResponse, createSuccessResponse, createErrorResponse, simulateDelay } from "./api-client";

// Web Crypto SHA-256 password hashing helper
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export class AuthService {
  private static USERS_STORAGE_KEY = "beautyiq_users_db";
  private static SESSION_KEY = "beautyiq_session";

  // In-memory or persisted users store helper
  private static getUsers(): User[] {
    if (typeof window === "undefined") return mockUsers;
    const stored = localStorage.getItem(this.USERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(mockUsers));
      return mockUsers;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return mockUsers;
    }
  }

  private static saveUsers(users: User[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }

  /**
   * Register a new Customer Account
   */
  static async register(params: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    await simulateDelay(300);

    const { name, email, password, confirmPassword } = params;

    // 1. Validations
    if (!name || name.trim().length < 2) {
      return createErrorResponse("VALIDATION_ERROR", "Full name must be at least 2 characters long.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return createErrorResponse("VALIDATION_ERROR", "Please provide a valid email address.");
    }
    if (!password || password.length < 8) {
      return createErrorResponse("VALIDATION_ERROR", "Password must be at least 8 characters long.");
    }
    if (password !== confirmPassword) {
      return createErrorResponse("VALIDATION_ERROR", "Password and confirm password do not match.");
    }

    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return createErrorResponse("DUPLICATE_DATA", "An account with this email address already exists.");
    }

    // 2. Hash Password
    const passwordHash = await hashPassword(password);

    // 3. Create User record with incomplete onboarding flag
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: "customer",
      passwordHash,
      skinProfile: {
        ...sampleDefaultProfile,
        isOnboardingComplete: false,
        completedStepsCount: 0,
      },
      personalProfile: {
        ageGroup: "25 to 34",
        gender: "Prefer not to say",
        country: "India",
        currencyPreference: "₹ (INR)",
      },
      privacySettings: {
        profileVisibility: "Private",
        imageStoragePreference: false,
      },
      wishlistIds: [],
      searchHistory: [],
      createdAt: new Date().toISOString().split("T")[0],
    };

    users.push(newUser);
    this.saveUsers(users);

    const token = `session-${newUser.id}-${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify({ userId: newUser.id, token, expiresAt: Date.now() + 86400000 }));
    }

    return createSuccessResponse({ user: newUser, token });
  }

  /**
   * Login with email and password
   */
  static async login(
    email: string,
    password?: string
  ): Promise<ApiResponse<{ user: User; token: string; redirectRoute: string }>> {
    await simulateDelay(300);

    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return createErrorResponse("AUTHENTICATION_ERROR", "Invalid email or password.");
    }

    // If password provided, verify hash
    if (password) {
      const inputHash = await hashPassword(password);
      if (user.passwordHash && user.passwordHash !== inputHash) {
        return createErrorResponse("AUTHENTICATION_ERROR", "Invalid email or password.");
      }
    }

    const token = `session-${user.id}-${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify({ userId: user.id, token, expiresAt: Date.now() + 86400000 }));
    }

    // Determine redirect route based on onboarding completion & role
    let redirectRoute = "/profile";
    if (user.role === "admin") {
      redirectRoute = "/admin/dashboard";
    } else if (user.skinProfile && !user.skinProfile.isOnboardingComplete) {
      redirectRoute = "/onboarding";
    }

    return createSuccessResponse({ user, token, redirectRoute });
  }

  /**
   * Logout session
   */
  static async logout(): Promise<ApiResponse<boolean>> {
    await simulateDelay(100);
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.SESSION_KEY);
    }
    return createSuccessResponse(true);
  }

  /**
   * Request password reset token without email enumeration leak
   */
  static async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    await simulateDelay(250);

    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (user) {
      user.resetToken = `reset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
      this.saveUsers(users);
    }

    // Always return neutral success message to prevent account enumeration
    return createSuccessResponse({
      message: "If an account exists with this email address, a password reset link has been dispatched.",
    });
  }

  /**
   * Reset Password using token
   */
  static async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiResponse<boolean>> {
    await simulateDelay(300);

    if (!newPassword || newPassword.length < 8) {
      return createErrorResponse("VALIDATION_ERROR", "Password must be at least 8 characters long.");
    }
    if (newPassword !== confirmPassword) {
      return createErrorResponse("VALIDATION_ERROR", "New password and confirm password do not match.");
    }

    const users = this.getUsers();
    const user = users.find((u) => u.resetToken === token && (u.resetTokenExpiry || 0) > Date.now());

    if (!user) {
      return createErrorResponse("AUTHENTICATION_ERROR", "Invalid or expired password reset token.");
    }

    user.passwordHash = await hashPassword(newPassword);
    delete user.resetToken;
    delete user.resetTokenExpiry;
    this.saveUsers(users);

    return createSuccessResponse(true);
  }

  /**
   * Update Skin Profile
   */
  static async updateSkinProfile(
    userId: string,
    profile: Partial<SkinProfile>
  ): Promise<ApiResponse<User>> {
    await simulateDelay(200);

    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return createErrorResponse("NOT_FOUND", "User not found.");
    }

    user.skinProfile = {
      ...(user.skinProfile || sampleDefaultProfile),
      ...profile,
    };
    this.saveUsers(users);

    return createSuccessResponse(user);
  }

  /**
   * Update Personal Profile (Age group, Gender, Country)
   */
  static async updatePersonalProfile(
    userId: string,
    personal: UserPersonalProfile,
    privacy?: PrivacySettings
  ): Promise<ApiResponse<User>> {
    await simulateDelay(200);

    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return createErrorResponse("NOT_FOUND", "User not found.");
    }

    user.personalProfile = { ...user.personalProfile, ...personal };
    if (privacy) {
      user.privacySettings = { ...user.privacySettings, ...privacy };
    }
    this.saveUsers(users);

    return createSuccessResponse(user);
  }

  /**
   * Delete Account safely with confirmation
   */
  static async deleteAccount(userId: string): Promise<ApiResponse<boolean>> {
    await simulateDelay(300);

    let users = this.getUsers();
    users = users.filter((u) => u.id !== userId);
    this.saveUsers(users);

    if (typeof window !== "undefined") {
      localStorage.removeItem(this.SESSION_KEY);
    }

    return createSuccessResponse(true);
  }

  /**
   * Toggle Wishlist
   */
  static async toggleWishlist(userId: string, productId: string): Promise<ApiResponse<string[]>> {
    await simulateDelay(150);
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return createErrorResponse("NOT_FOUND", "User not found.");

    if (user.wishlistIds.includes(productId)) {
      user.wishlistIds = user.wishlistIds.filter((id) => id !== productId);
    } else {
      user.wishlistIds.push(productId);
    }

    this.saveUsers(users);
    return createSuccessResponse(user.wishlistIds);
  }
}
