"use client";

import * as React from "react";
import { Sparkles, Dna, Scale, Compass } from "lucide-react";
import { Container } from "@/components/layout/container";
import { StaggerReveal, StaggerItem } from "@/components/ui/scroll-reveal";

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
    <section className="border-b border-line/70 bg-background-elevated/50 py-7 sm:py-9">
      <Container>
        <StaggerReveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {valueProps.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.title}>
                <div className="group flex items-start gap-3.5 rounded-2xl border border-transparent p-3 -m-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-line/60 hover:bg-background-card/80 hover:shadow-card">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-champagne/35 bg-[image:var(--gradient-card)] text-champagne-deep shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:border-champagne/70">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h4 className="font-display text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-champagne-deep">
                      {item.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-foreground-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerReveal>
      </Container>
    </section>
  );
}
