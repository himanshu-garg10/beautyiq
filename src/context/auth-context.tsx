"use client";

import * as React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import type { User, UserRole, UserPersonalProfile, PrivacySettings, SkinProfile } from "@/types";
import { AuthService } from "@/services/auth.service";
import { AuthModal } from "@/components/auth/auth-modal";
import { toAppSkinProfileFromPublic } from "@/lib/auth/profile-map";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  sessionStatus: "loading" | "authenticated" | "unauthenticated";
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

function mapSessionUser(
  sessionUser: { id: string; name?: string | null; email?: string | null; role?: "customer" | "admin" },
  extras?: { wishlistIds?: string[]; skinProfile?: SkinProfile }
): User {
  return {
    id: sessionUser.id,
    name: sessionUser.name || "BeautyIQ Member",
    email: sessionUser.email || "",
    role: sessionUser.role || "customer",
    wishlistIds: extras?.wishlistIds || [],
    searchHistory: [],
    createdAt: new Date().toISOString(),
    skinProfile: extras?.skinProfile,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authModalMode, setAuthModalMode] = React.useState<"login" | "register" | "forgot-password">("login");

  React.useEffect(() => {
    if (status === "unauthenticated") {
      setUser(null);
      return;
    }
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    const sessionUser = session.user;
    let cancelled = false;

    async function loadAccount() {
      try {
        const [profileRes, savedRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/saved-products"),
        ]);
        const profileJson = profileRes.ok ? await profileRes.json() : { data: null };
        const savedJson = savedRes.ok ? await savedRes.json() : { data: [] };
        if (cancelled) return;

        const wishlistIds = Array.isArray(savedJson.data)
          ? savedJson.data.map((item: { productId: string }) => item.productId)
          : [];
        const skinProfile = profileJson.data ? toAppSkinProfileFromPublic(profileJson.data) : undefined;

        setUser(mapSessionUser(sessionUser, { wishlistIds, skinProfile }));
      } catch {
        if (!cancelled) {
          setUser(mapSessionUser(sessionUser));
        }
      }
    }

    loadAccount();
    return () => {
      cancelled = true;
    };
  }, [session, status]);

  React.useEffect(() => {
    if (user || status === "loading" || status === "authenticated") return;
    if (typeof window === "undefined") return;

    const isDismissed = sessionStorage.getItem("beautyiq_auth_popup_dismissed");
    if (isDismissed === "true") return;

    const timer = setTimeout(() => {
      const dismissedNow = sessionStorage.getItem("beautyiq_auth_popup_dismissed");
      if (!dismissedNow) {
        setAuthModalMode("login");
        setIsAuthModalOpen(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, status]);

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
    const result = await signIn("credentials", {
      email,
      password: password || "",
      redirect: false,
    });
    if (!result?.ok) {
      throw new Error("Invalid email or password");
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("beautyiq_auth_popup_dismissed", "true");
    }
    setIsAuthModalOpen(false);
    return "/account";
  };

  const register = async (params: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> => {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.name,
        email: params.email,
        password: params.password,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Registration failed");
    }

    const result = await signIn("credentials", {
      email: params.email,
      password: params.password,
      redirect: false,
    });
    if (!result?.ok) {
      throw new Error("Account created. Please log in.");
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("beautyiq_auth_popup_dismissed", "true");
    }
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await signOut({ redirect: false });
    setUser(null);
  };

  const deleteAccount = async () => {
    const response = await fetch("/api/delete-account", { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error?.message || "Failed to delete account");
    }
    await signOut({ redirect: false });
    setUser(null);
  };

  const updatePersonalProfile = async (personal: UserPersonalProfile, privacy?: PrivacySettings) => {
    if (!user) return;
    const res = await AuthService.updatePersonalProfile(user.id, personal, privacy);
    if (res.success && res.data) {
      setUser({ ...user, personalProfile: res.data.personalProfile, privacySettings: res.data.privacySettings });
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === "guest") {
      setUser(null);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    const isSaved = user.wishlistIds.includes(productId);
    const response = isSaved
      ? await fetch(`/api/saved-products?productId=${encodeURIComponent(productId)}`, { method: "DELETE" })
      : await fetch("/api/saved-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
    if (!response.ok) return;
    const nextIds = isSaved
      ? user.wishlistIds.filter((id) => id !== productId)
      : [...user.wishlistIds, productId];
    setUser({ ...user, wishlistIds: nextIds });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        sessionStatus: status,
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
