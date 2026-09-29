"use client";

import * as React from "react";
import type { SkinProfile } from "@/types";
import { sampleDefaultProfile } from "@/lib/mock-data";
import { useAuth } from "./auth-context";
import { AuthService } from "@/services/auth.service";
import { NotificationService } from "@/services/notification.service";

interface SkinProfileContextType {
  profile: SkinProfile;
  updateProfile: (updated: Partial<SkinProfile>) => Promise<void>;
  resetProfile: () => void;
}

const SkinProfileContext = React.createContext<SkinProfileContextType | undefined>(undefined);

export function SkinProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<SkinProfile>(
    user?.skinProfile || sampleDefaultProfile
  );

  React.useEffect(() => {
    if (user?.skinProfile) {
      setProfile(user.skinProfile);
    }
  }, [user]);

  const updateProfile = async (updated: Partial<SkinProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    if (user) {
      await AuthService.updateSkinProfile(user.id, newProfile);
      NotificationService.createNotification(user.id, {
        type: "PROFILE_UPDATED",
        title: "Skin Profile Updated",
        message: "Your diagnostic skin parameters were updated and saved.",
        link: "/profile",
      });
    }
  };

  const resetProfile = () => {
    setProfile(sampleDefaultProfile);
  };

  return (
    <SkinProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>
      {children}
    </SkinProfileContext.Provider>
  );
}

export function useSkinProfile() {
  const context = React.useContext(SkinProfileContext);
  if (!context) {
    throw new Error("useSkinProfile must be used within a SkinProfileProvider");
  }
  return context;
}
