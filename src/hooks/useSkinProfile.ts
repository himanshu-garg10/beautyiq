"use client";

import { useSkinProfile as useSkinProfileContext } from "@/context/skin-profile-context";

export function useSkinProfile() {
  return useSkinProfileContext();
}
