"use client";

import * as React from "react";
import type { User, UserRole, UserPersonalProfile, PrivacySettings } from "@/types";
import { AuthService } from "@/services/auth.service";
import { AuthModal } from "@/components/auth/auth-modal";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register" | "forgot-password";
  openAuthModal: (mode?: "login" | "register" | "forgot-password") => void;
  closeAuthModal: () => void;
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
  // Visitor starts in logged-out state unless an active session exists
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authModalMode, setAuthModalMode] = React.useState<"login" | "register" | "forgot-password">("login");

  // Restore authenticated session from storage on client mount
  React.useEffect(() => {
    const activeUser = AuthService.getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
    }
  }, []);

  // Automatic 5-second popup for logged-out visitors
  React.useEffect(() => {
    if (user) return;
    if (typeof window === "undefined") return;

    const isDismissed = sessionStorage.getItem("beautyiq_auth_popup_dismissed");
    if (isDismissed === "true") return;

    const timer = setTimeout(() => {
      const dismissedNow = sessionStorage.getItem("beautyiq_auth_popup_dismissed");
      const activeSession = AuthService.getCurrentSession();
      if (!dismissedNow && !activeSession) {
        setAuthModalMode("login");
        setIsAuthModalOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [user]);

  const openAuthModal = (mode: "login" | "register" | "forgot-password" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("beautyiq_auth_popup_dismissed", "true");
    }
    setIsAuthModalOpen(false);
  };

  const role: UserRole = user ? user.role : "guest";

  const login = async (email: string, password?: string): Promise<string> => {
    const res = await AuthService.login(email, password);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Invalid credentials");
    }
    setUser(res.data.user);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("beautyiq_auth_popup_dismissed", "true");
    }
    setIsAuthModalOpen(false);
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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("beautyiq_auth_popup_dismissed", "true");
    }
    setIsAuthModalOpen(false);
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
    }
  };

  React.useEffect(() => {
    const handleWishlistUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string; ids: string[] }>;
      if (user && customEvent.detail && customEvent.detail.userId === user.id) {
        setUser((prev) => (prev ? { ...prev, wishlistIds: customEvent.detail.ids } : null));
      }
    };
    window.addEventListener("beautyiq_wishlist_update", handleWishlistUpdate);
    return () => window.removeEventListener("beautyiq_wishlist_update", handleWishlistUpdate);
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      openAuthModal("login");
      return;
    }
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
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
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
      <AuthModal />
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

