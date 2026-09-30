"use client";

import { useComparison as useComparisonContext } from "@/context/comparison-context";

export function useComparison() {
  return useComparisonContext();
}
