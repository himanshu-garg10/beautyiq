"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/context/auth-context";

const COMPARE_STORAGE_KEY = "beautyiq_compare_selected_ids";
const MAX_COMPARISON_ITEMS = 5;
const MIN_COMPARISON_ITEMS = 1;

interface ComparisonContextType {
  selectedIds: string[];
  addToComparison: (productId: string) => boolean;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  canAddMore: boolean;
  maxItems: number;
  minItems: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();
  const storageKey = `${COMPARE_STORAGE_KEY}_${user?.id || "guest"}`;

  useEffect(() => {
    setLoadedFor(null);
    setSelectedIds([]);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedIds(parsed.slice(0, MAX_COMPARISON_ITEMS));
        }
      }
    } catch (e) {
      console.error("Failed to read comparison state:", e);
    }
    setLoadedFor(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (loadedFor !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(selectedIds));
    } catch (e) {
      console.error("Failed to save comparison state:", e);
    }
  }, [selectedIds, loadedFor, storageKey]);

  const addToComparison = (productId: string): boolean => {
    if (selectedIds.includes(productId)) {
      showToast("This product is already in your comparison matrix.", "info");
      return false;
    }

    if (selectedIds.length >= MAX_COMPARISON_ITEMS) {
      showToast("You can compare up to 5 products.", "warning");
      return false;
    }

    setSelectedIds((prev) => [...prev, productId]);
    showToast("Added to comparison", "success");
    return true;
  };

  const removeFromComparison = (productId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== productId));
    showToast("Removed from comparison", "info");
  };

  const clearComparison = () => {
    setSelectedIds([]);
    showToast("Cleared comparison matrix", "info");
  };

  const isInComparison = (productId: string) => selectedIds.includes(productId);
  const canAddMore = selectedIds.length < MAX_COMPARISON_ITEMS;

  return (
    <ComparisonContext.Provider
      value={{
        selectedIds,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        canAddMore,
        maxItems: MAX_COMPARISON_ITEMS,
        minItems: MIN_COMPARISON_ITEMS,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
};
