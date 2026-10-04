"use client";

import * as React from "react";
import { Sparkles, Dna, Scale, Compass } from "lucide-react";
import { Container } from "@/components/layout/container";

const valueProps = [
  {
    icon: Sparkles,
    title: "AI-guided discovery",
    description: "Turn your skin goals and product needs into clear catalog filters.",
  },
  {
    icon: Dna,
    title: "Ingredient details",
    description: "Explore listed ingredients and cosmetic reference information.",
  },
  {
    icon: Scale,
    title: "Verified offer comparison",
    description: "Compare store offers when a verified source is available in the catalog.",
  },
  {
    icon: Compass,
    title: "Catalog search",
    description: "Search products, brands, product types, and ingredients in one place.",
  },
];

export function TrustStrip() {
  return (
    <section className="border-b border-line bg-background-elevated/40 py-6 sm:py-8">
      <Container>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {valueProps.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex items-start gap-3.5 transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne-tint text-champagne-deep border border-champagne/30 group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display text-sm font-bold text-foreground leading-tight group-hover:text-champagne-deep transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
