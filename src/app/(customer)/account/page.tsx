"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSkinProfile } from "@/context/skin-profile-context";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import type { SkinType } from "@/types";
import { Heart, Trash2, Save } from "lucide-react";

const skinTypes = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];

type SavedProductRow = {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    brand: string;
    image: string;
    category: string;
  } | null;
};

export default function AccountPage() {
  const router = useRouter();
  const { user, deleteAccount, logout, sessionStatus } = useAuth();
  const { profile, updateProfile } = useSkinProfile();
  const { addToast } = useToast();

  const [skinType, setSkinType] = React.useState<SkinType>(profile.skinType || "Combination");
  const [concerns, setConcerns] = React.useState((profile.concerns || []).join(", "));
  const [allergies, setAllergies] = React.useState((profile.knownAllergies || []).join(", "));
  const [budgetMin, setBudgetMin] = React.useState(String(profile.budget?.min ?? 0));
  const [budgetMax, setBudgetMax] = React.useState(String(profile.budget?.max ?? 2000));
  const [preferences, setPreferences] = React.useState(
    [profile.texturePreference, profile.finishPreference, profile.fragrancePreference]
      .filter(Boolean)
      .join(", ")
  );
  const [savedProducts, setSavedProducts] = React.useState<SavedProductRow[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState("");

  React.useEffect(() => {
    setSkinType((profile.skinType as SkinType) || "Combination");
    setConcerns((profile.concerns || []).join(", "));
    setAllergies((profile.knownAllergies || []).join(", "));
    setBudgetMin(String(profile.budget?.min ?? 0));
    setBudgetMax(String(profile.budget?.max ?? 2000));
  }, [profile]);

  React.useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    fetch("/api/saved-products")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((payload) => setSavedProducts(payload.data || []))
      .catch(() => setSavedProducts([]));
  }, [sessionStatus, user?.wishlistIds]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const concernList = concerns.split(",").map((item) => item.trim()).filter(Boolean);
      const allergyList = allergies.split(",").map((item) => item.trim()).filter(Boolean);
      await updateProfile({
        skinType: skinType as SkinType,
        concerns: concernList as SkinType[] as never,
        knownAllergies: allergyList as never,
        budget: {
          min: Number(budgetMin) || 0,
          max: Number(budgetMax) || 2000,
          label: "Mid-Range",
        },
      });
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skinType,
          concerns: concernList,
          allergies: allergyList,
          budgetMin: Number(budgetMin) || 0,
          budgetMax: Number(budgetMax) || 2000,
          preferences,
        }),
      });
      addToast({
        type: "success",
        title: "Skin profile saved",
        description: "Your account skin profile has been updated.",
      });
    } catch {
      addToast({
        type: "error",
        title: "Could not save profile",
        description: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    const response = await fetch(`/api/saved-products?productId=${encodeURIComponent(productId)}`, {
      method: "DELETE",
    });
    if (!response.ok) return;
    setSavedProducts((current) => current.filter((item) => item.productId !== productId));
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete.trim() !== "DELETE") {
      addToast({
        type: "error",
        title: "Confirmation required",
        description: "Type DELETE to permanently remove your account.",
      });
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount();
      addToast({
        type: "info",
        title: "Account deleted",
        description: "Your BeautyIQ account and saved data have been removed.",
      });
      router.push("/");
    } catch (error) {
      addToast({
        type: "error",
        title: "Could not delete account",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">My Account</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Signed in as {user?.email}. Your skin profile and saved products stay on this account.
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-background-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Skin profile</h2>
        <Select
          label="Skin type"
          options={skinTypes.map((type) => ({ value: type, label: type }))}
          value={skinType}
          onChange={(e) => setSkinType(e.target.value as SkinType)}
        />
        <Input
          label="Concerns (comma separated)"
          value={concerns}
          onChange={(e) => setConcerns(e.target.value)}
          placeholder="Acne, Dryness, Dark spots"
        />
        <Input
          label="Allergies (comma separated)"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="Fragrance, Specific ingredients"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Budget min (₹)"
            type="number"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
          />
          <Input
            label="Budget max (₹)"
            type="number"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
          />
        </div>
        <Input
          label="Preferences"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder="Gel texture, fragrance free"
        />
        <Button onClick={handleSaveProfile} isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
          Save skin profile
        </Button>
      </section>

      <section className="rounded-2xl border border-line bg-background-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" />
          <h2 className="font-semibold text-foreground">Saved products</h2>
        </div>
        {savedProducts.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            No saved products yet.{" "}
            <Link href="/products" className="text-sage-deep font-semibold hover:underline">
              Browse the catalog
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {savedProducts.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.product?.name || item.productId}
                  </p>
                  <p className="text-xs text-foreground-muted">{item.product?.brand}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleRemoveProduct(item.productId)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-status-error/30 bg-status-error-bg/20 p-6 space-y-4">
        <h2 className="font-semibold text-status-error flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Delete my account
        </h2>
        <Alert variant="error">
          This permanently removes your login, skin profile, saved products, and quiz results. This cannot be undone.
        </Alert>
        <Input
          label='Type DELETE to confirm'
          value={confirmDelete}
          onChange={(e) => setConfirmDelete(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="danger" isLoading={deleting} onClick={handleDeleteAccount}>
            Delete my account
          </Button>
          <Button variant="outline" onClick={() => logout().then(() => router.push("/"))}>
            Log out
          </Button>
        </div>
      </section>
    </div>
  );
}
