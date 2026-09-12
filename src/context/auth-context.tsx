"use client";

import * as React from "react";
import type { User, UserRole, UserPersonalProfile, PrivacySettings } from "@/types";
import { mockUsers } from "@/lib/mock-data";
import { AuthService } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<string>;
  register: (params: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updatePersonalProfile: (personal: UserPersonalProfile, privacy?: PrivacySettings) => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  toggleWishlist: (productId: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(mockUsers[0]);

  const role: UserRole = user ? user.role : "guest";

  const login = async (email: string, password?: string): Promise<string> => {
    const res = await AuthService.login(email, password);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Invalid credentials");
    }
    setUser(res.data.user);
    return res.data.redirectRoute;
  };

  const register = async (params: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> => {
    const res = await AuthService.register(params);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Registration failed");
    }
    setUser(res.data.user);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const deleteAccount = async () => {
    if (!user) return;
    await AuthService.deleteAccount(user.id);
    setUser(null);
  };

  const updatePersonalProfile = async (personal: UserPersonalProfile, privacy?: PrivacySettings) => {
    if (!user) return;
    const res = await AuthService.updatePersonalProfile(user.id, personal, privacy);
    if (res.success && res.data) {
      setUser(res.data);
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === "guest") {
      setUser(null);
    } else if (newRole === "admin") {
      setUser(mockUsers[1]);
    } else {
      setUser(mockUsers[0]);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) return;
    const res = await AuthService.toggleWishlist(user.id, productId);
    if (res.success && res.data) {
      setUser({ ...user, wishlistIds: res.data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        deleteAccount,
        updatePersonalProfile,
        switchRole,
        toggleWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
