"use client";

import { useToast as useToastContext } from "@/context/toast-context";

export function useToast() {
  return useToastContext();
}
