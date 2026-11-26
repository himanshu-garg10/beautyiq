"use client";

import { usePathname } from "next/navigation";
import { Sparkles, Search, Scale, FlaskConical, Package, Layers } from "lucide-react";
import { Container } from "@/components/layout/container";

const pages: Record<string, { title: string; detail: string; icon: typeof Sparkles }> = {
  "/products": { title: "Product Discovery", detail: "Browse and filter the live BeautyIQ catalog", icon: Package },
  "/recommendations": { title: "AI Recommendations", detail: "Your personalised ingredient and product matches", icon: Sparkles },
  "/compare": { title: "Product Comparison", detail: "Compare ingredients, suitability and verified offers", icon: Scale },
  "/ingredients": { title: "Ingredient Intelligence", detail: "Understand the ingredients behind each formula", icon: FlaskConical },
  "/categories": { title: "Skincare Categories", detail: "Explore products by routine step", icon: Layers },
};

export function PublicPageBar() {
  const pathname = usePathname();
  const page = pages[pathname || ""];
  if (!page) return null;
  const Icon = page.icon;
  return (
    <div className="border-b border-line bg-background-card/80">
      <Container className="py-3">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-background px-4 py-2.5 shadow-xs">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-champagne-tint text-champagne-deep"><Icon className="h-4 w-4" /></span>
          <div className="min-w-0"><p className="text-sm font-semibold text-foreground">{page.title}</p><p className="truncate text-xs text-foreground-muted">{page.detail}</p></div>
        </div>
      </Container>
    </div>
  );
}
