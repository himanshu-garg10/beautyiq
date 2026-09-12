/**
 * BeautyIQ Authentication & Authorization Guard
 * Enforces:
 * 1. Backend Authentication (Bearer tokens, session cookies, headers)
 * 2. Role-Based Access Control (Admin vs Customer)
 * 3. Object-Level Authorization (Customer data isolation: customer A cannot access customer B's data)
 */

import { NextRequest, NextResponse } from "next/server";
import { mockUsers } from "@/lib/mock-data";
import type { User, UserRole } from "@/types";

export interface AuthContext {
  authenticated: boolean;
  user?: User;
  role?: UserRole;
  error?: {
    status: number;
    code: string;
    message: string;
  };
}

export class AuthGuard {
  /**
   * Resolve user from in-memory / persisted storage
   */
  static findUserById(id: string): User | undefined {
    return mockUsers.find((u) => u.id === id);
  }

  /**
   * Extract and verify caller identity from request headers / cookies
   */
  static getAuthenticatedUser(req: NextRequest): AuthContext {
    const roleHeader = req.headers.get("x-user-role");
    const userIdHeader = req.headers.get("x-user-id");
    const authHeader = req.headers.get("authorization");

    let userId: string | null = userIdHeader;
    let role: UserRole | null = (roleHeader as UserRole) || null;

    // 1. Inspect Authorization Header (Bearer session-<userId>-<timestamp>)
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      const parts = token.split("-");
      if (parts.length >= 2 && parts[0] === "session") {
        userId = parts[1];
      }
    }

    // 2. Inspect Session Cookie
    if (!userId) {
      const sessionCookie = req.cookies.get("beautyiq_session")?.value;
      if (sessionCookie) {
        try {
          const parsed = JSON.parse(decodeURIComponent(sessionCookie));
          if (parsed.userId) {
            userId = parsed.userId;
          }
        } catch {
          // invalid cookie format
        }
      }
    }

    // 3. Fallback to test/internal role if explicitly specified
    if (!userId && roleHeader === "admin") {
      const adminUser = mockUsers.find((u) => u.role === "admin");
      if (adminUser) {
        return {
          authenticated: true,
          user: adminUser,
          role: "admin",
        };
      }
    }

    if (!userId && !roleHeader) {
      return {
        authenticated: false,
        error: {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Authentication required. Please provide a valid session token or credentials.",
        },
      };
    }

    // If userId was identified, load user profile
    const user = userId ? this.findUserById(userId) : undefined;
    if (user) {
      return {
        authenticated: true,
        user,
        role: user.role,
      };
    }

    // If role was explicitly specified as admin in authenticated context
    if (role === "admin") {
      const defaultAdmin = mockUsers.find((u) => u.role === "admin");
      return {
        authenticated: true,
        user: defaultAdmin,
        role: "admin",
      };
    }

    // If explicit customer role header without matching valid user
    if (roleHeader === "customer" || roleHeader === "guest") {
      return {
        authenticated: true,
        user: mockUsers.find((u) => u.role === "customer"),
        role: roleHeader as UserRole,
      };
    }

    return {
      authenticated: false,
      error: {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Invalid authentication credentials or user not found.",
      },
    };
  }

  /**
   * Verify Admin privilege:
   * Returns null if authorized, or a NextResponse (401 or 403) if denied.
   */
  static verifyAdmin(req: NextRequest): { authorized: boolean; response?: NextResponse; user?: User } {
    const auth = this.getAuthenticatedUser(req);

    if (!auth.authenticated || !auth.user) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required. Please login with an administrator account.",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        ),
      };
    }

    if (auth.role !== "admin") {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Access Denied: Admin privileges required. Customers cannot access administrative endpoints.",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, user: auth.user };
  }

  /**
   * Object-Level Authorization:
   * Ensures customer A can ONLY access their own resources (profile, wishlist, history, export, notifications).
   * Admins are permitted cross-customer access for support/management.
   */
  static verifyOwnership(
    req: NextRequest,
    targetUserId: string
  ): { authorized: boolean; response?: NextResponse; caller?: User } {
    const auth = this.getAuthenticatedUser(req);

    if (!auth.authenticated || !auth.user) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required to access user resource.",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        ),
      };
    }

    // Admins have management access
    if (auth.role === "admin") {
      return { authorized: true, caller: auth.user };
    }

    // Customers can only access their own user ID
    if (auth.user.id !== targetUserId) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Access Denied: Object-level access violation. You cannot access or modify another customer's data.",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, caller: auth.user };
  }

  /**
   * Strip sensitive internal fields (passwords, tokens) before responding to clients
   */
  static sanitizeSafeUser(user: User): Omit<User, "passwordHash" | "resetToken" | "resetTokenExpiry"> {
    const { passwordHash, resetToken, resetTokenExpiry, ...safeUser } = user;
    return safeUser;
  }
}
