"use client";

import * as React from "react";
import type { SkinProfile } from "@/types";
import { sampleDefaultProfile } from "@/lib/mock-data";
import { useAuth } from "./auth-context";
import { NotificationService } from "@/services/notification.service";

interface SkinProfileContextType {
  profile: SkinProfile;
  updateProfile: (updated: Partial<SkinProfile>) => Promise<void>;
  resetProfile: () => void;
}

const SkinProfileContext = React.createContext<SkinProfileContextType | undefined>(undefined);

function persistProfilePayload(profile: SkinProfile) {
  return {
    skinType: profile.skinType,
    concerns: profile.concerns,
    allergies: profile.knownAllergies,
    budgetMin: profile.budget?.min,
    budgetMax: profile.budget?.max,
    preferences: JSON.stringify({
      texturePreference: profile.texturePreference,
      finishPreference: profile.finishPreference,
      fragrancePreference: profile.fragrancePreference,
      essentialOilPreference: profile.essentialOilPreference,
      properties: profile.properties,
      skincareExperience: profile.skincareExperience,
      sunExposure: profile.sunExposure,
      climate: profile.climate,
      monthlyBudget: profile.budget?.monthlyBudget,
    }),
    goals: profile.goals,
    sensitivityLevel: profile.sensitivityLevel,
    reactionFrequency: profile.reactionFrequency,
    preferredIngredients: profile.preferredIngredients,
    avoidIngredients: profile.avoidIngredients,
    fragranceFree: profile.fragrancePreference === "Fragrance free",
    crueltyFree: profile.properties?.includes("Cruelty free"),
    vegan: profile.properties?.includes("Vegan"),
    isOnboardingComplete: profile.isOnboardingComplete,
  };
}

export function SkinProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
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
    if (isAuthenticated && user) {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(persistProfilePayload(newProfile)),
      });
      if (!response.ok) {
        throw new Error("Your profile could not be saved. Please try again.");
      }
      NotificationService.createNotification(user.id, {
        type: "PROFILE_UPDATED",
        title: "Skin Profile Updated",
        message: "Your diagnostic skin parameters were updated and saved.",
        link: "/account",
      });
    }
    setProfile(newProfile);
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
