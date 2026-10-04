import type { Metadata } from "next";
import { CategoriesBrowser } from "@/components/categories/categories-browser";

export const metadata: Metadata = {
  title: "Discover Beauty Categories — BeautyIQ",
  description: "Browse the BeautyIQ catalog by skincare category.",
};

export default function CategoriesPage() {
  return <CategoriesBrowser />;
}
