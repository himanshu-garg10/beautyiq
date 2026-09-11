"use client";

import * as React from "react";
import { useSkinProfile } from "@/context/skin-profile-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import type { AgeGroup, SkinType, SensitivityLevel, ReactionFrequency, TexturePreference, FinishPreference, FragrancePreference } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { User, Sliders, ShieldCheck, Heart, Lock, Trash2, CheckCircle2, AlertTriangle, ShieldAlert, Key } from "lucide-react";
import Link from "next/link";

export default function CustomerProfilePage() {
  const { profile, updateProfile } = useSkinProfile();
  const { user, updatePersonalProfile, deleteAccount, logout } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = React.useState("skin");

  // Tab 1: Skin Profile State
  const [skinType, setSkinType] = React.useState<SkinType>(profile.skinType || "Combination");
  const [sensitivityLevel, setSensitivityLevel] = React.useState<SensitivityLevel>(profile.sensitivityLevel || "Medium");
  const [avoidInput, setAvoidInput] = React.useState((profile.avoidIngredients || []).join(", "));
  const [prefInput, setPrefInput] = React.useState((profile.preferredIngredients || []).join(", "));

  // Tab 2: Personal Info State
  const [ageGroup, setAgeGroup] = React.useState<AgeGroup>(user?.personalProfile?.ageGroup || "25 to 34");
  const [gender, setGender] = React.useState(user?.personalProfile?.gender || "Female");
  const [country, setCountry] = React.useState(user?.personalProfile?.country || "India");

  // Tab 3: Privacy & Account Deletion Modal
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Save Handlers
  const handleSaveSkin = async () => {
    const avoid = avoidInput.split(",").map((s) => s.trim()).filter(Boolean);
    const pref = prefInput.split(",").map((s) => s.trim()).filter(Boolean);

    await updateProfile({
      skinType,
      sensitivityLevel,
      avoidIngredients: avoid,
      preferredIngredients: pref,
    });

    addToast({
      type: "success",
      title: "Skin Profile Updated",
      description: "Your skincare parameters have been saved.",
    });
  };

  const handleSavePersonal = async () => {
    await updatePersonalProfile({
      ageGroup,
      gender,
      country,
    });

    addToast({
      type: "success",
      title: "Personal Info Updated",
      description: "Demographics and profile preferences saved.",
    });
  };

  const handleDeleteAccountConfirm = async () => {
    if (deleteConfirmText.trim() !== "DELETE") {
      addToast({
        type: "error",
        title: "Confirmation Error",
        description: "Please type DELETE to confirm account removal.",
      });
      return;
    }

    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    setShowDeleteModal(false);

    addToast({
      type: "info",
      title: "Account Permanently Deleted",
      description: "Your BeautyIQ user data and skin profile have been purged.",
    });

    window.location.href = "/";
  };

  const tabsList = [
    { id: "skin", label: "Skin Parameters & Concerns", icon: <User className="h-4 w-4" /> },
    { id: "preferences", label: "Product & Texture Preferences", icon: <Sliders className="h-4 w-4" /> },
    { id: "personal", label: "Personal & Demographics", icon: <ShieldCheck className="h-4 w-4" /> },
    { id: "security", label: "Security & Privacy", icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-tint text-sage-deep font-display text-2xl font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {user?.name || "Customer Profile"}
              </h1>
              <Badge variant="sage">{user?.role || "Customer"}</Badge>
            </div>
            <p className="text-xs text-foreground-muted">
              {user?.email} • Member since {user?.createdAt || "2026"}
            </p>
          </div>
        </div>

        <Link href="/onboarding">
          <Button variant="accent" size="sm" leftIcon={<Sliders className="h-4 w-4" />}>
            Re-run Questionnaire
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Skin Parameters */}
      {activeTab === "skin" && (
        <div className="space-y-6 rounded border border-line bg-background-card p-6 shadow-subtle">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Skin Characteristics & Sensitivities
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Skin Type"
              options={[
                { value: "Oily", label: "Oily Skin" },
                { value: "Dry", label: "Dry Skin" },
                { value: "Combination", label: "Combination Skin" },
                { value: "Sensitive", label: "Sensitive Skin" },
                { value: "Normal", label: "Normal Skin" },
              ]}
              value={skinType}
              onChange={(e) => setSkinType(e.target.value as SkinType)}
            />

            <Select
              label="Sensitivity Level"
              options={[
                { value: "Low", label: "Low Sensitivity" },
                { value: "Medium", label: "Medium Sensitivity" },
                { value: "High", label: "High Sensitivity" },
                { value: "Not sure", label: "Not sure" },
              ]}
              value={sensitivityLevel}
              onChange={(e) => setSensitivityLevel(e.target.value as SensitivityLevel)}
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted block">
              Active Skin Concerns
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.concerns.map((c) => (
                <Badge key={c} variant="sage">{c}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-status-warning block flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" /> Known Allergies / High Reaction Triggers (Separated)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(profile.knownAllergies || ["None"]).map((a) => (
                <Badge key={a} variant="warning">{a}</Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Ingredients to Avoid"
              value={avoidInput}
              onChange={(e) => setAvoidInput(e.target.value)}
            />
            <Input
              label="Preferred Active Ingredients"
              value={prefInput}
              onChange={(e) => setPrefInput(e.target.value)}
            />
          </div>

          <Button variant="accent" onClick={handleSaveSkin} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
            Save Skin Parameters
          </Button>
        </div>
      )}

      {/* Tab 2: Preferences */}
      {activeTab === "preferences" && (
        <div className="space-y-6 rounded border border-line bg-background-card p-6 shadow-subtle">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Formulation & Product Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded border border-line bg-background-elevated space-y-1">
              <span className="text-foreground-faint block">Texture Preference</span>
              <strong className="text-foreground text-sm font-mono">{profile.texturePreference}</strong>
            </div>
            <div className="p-4 rounded border border-line bg-background-elevated space-y-1">
              <span className="text-foreground-faint block">Finish Preference</span>
              <strong className="text-foreground text-sm font-mono">{profile.finishPreference}</strong>
            </div>
            <div className="p-4 rounded border border-line bg-background-elevated space-y-1">
              <span className="text-foreground-faint block">Fragrance Preference</span>
              <strong className="text-foreground text-sm font-mono">{profile.fragrancePreference}</strong>
            </div>
            <div className="p-4 rounded border border-line bg-background-elevated space-y-1">
              <span className="text-foreground-faint block">Essential Oils</span>
              <strong className="text-foreground text-sm font-mono">{profile.essentialOilPreference}</strong>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted block">
              Desired Product Properties
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(profile.properties || ["Fragrance free"]).map((p) => (
                <Badge key={p} variant="clay">{p}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Personal & Demographics */}
      {activeTab === "personal" && (
        <div className="space-y-6 rounded border border-line bg-background-card p-6 shadow-subtle">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Personal Profile & Demographics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Age Group"
              options={[
                { value: "Under 18", label: "Under 18" },
                { value: "18 to 24", label: "18 to 24" },
                { value: "25 to 34", label: "25 to 34" },
                { value: "35 to 44", label: "35 to 44" },
                { value: "45+", label: "45+" },
              ]}
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
            />

            <Input
              label="Gender (Optional)"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />

            <Input
              label="Country / Region"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <Button variant="accent" onClick={handleSavePersonal} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
            Save Personal Demographics
          </Button>
        </div>
      )}

      {/* Tab 4: Security & Privacy */}
      {activeTab === "security" && (
        <div className="space-y-6 rounded border border-line bg-background-card p-6 shadow-subtle">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Account Security & Privacy Controls
          </h3>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded border border-line bg-background-elevated">
              <div>
                <strong className="text-foreground text-sm block">Session Security</strong>
                <span className="text-xs text-foreground-muted">Password hashing via Web Crypto SHA-256</span>
              </div>
              <Badge variant="sage">Active Session</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded border border-status-error/30 bg-status-error-bg/30">
              <div>
                <strong className="text-status-error text-sm block">Danger Zone: Delete Account</strong>
                <span className="text-xs text-foreground-muted">Permanently purge your account, skin profile, and saved wishlist.</span>
              </div>
              <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)} leftIcon={<Trash2 className="h-4 w-4" />}>
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Account Deletion Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Account Deletion">
        <div className="space-y-4">
          <Alert variant="error" title="Warning: Destructive Action">
            Account deletion is permanent. Your skin profile, saved wishlist, and search history will be erased.
          </Alert>

          <p className="text-sm text-foreground-muted">
            To prevent accidental deletion, please type <strong>DELETE</strong> into the field below:
          </p>

          <Input
            placeholder="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              disabled={deleteConfirmText.trim() !== "DELETE"}
              onClick={handleDeleteAccountConfirm}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
