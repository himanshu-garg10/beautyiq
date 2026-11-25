"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Check,
  Sliders,
  DollarSign,
  Dna,
  Droplets,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

interface PreferenceOption {
  id: string;
  label: string;
}

interface PreferenceCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  options: PreferenceOption[];
}

const preferenceCategories: PreferenceCategory[] = [
  {
    id: "goals",
    title: "Skin / Beauty Goals",
    icon: Droplets,
    description: "What primary concerns are you looking to target?",
    options: [
      { id: "g1", label: "Deep Hydration" },
      { id: "g2", label: "Barrier Repair" },
      { id: "g3", label: "Acne & Blemishes" },
      { id: "g4", label: "Fade Dark Spots" },
      { id: "g5", label: "Pore Minimizing" },
      { id: "g6", label: "Radiant Glow" },
    ],
  },
  {
    id: "type",
    title: "Product Type",
    icon: Sliders,
    description: "Which step in your skincare ritual are you seeking?",
    options: [
      { id: "t1", label: "Active Serums" },
      { id: "t2", label: "Gel Moisturizers" },
      { id: "t3", label: "Mineral Sunscreens" },
      { id: "t4", label: "Gentle Cleansers" },
      { id: "t5", label: "Chemical Peels" },
      { id: "t6", label: "Eye Treatments" },
    ],
  },
  {
    id: "ingredients",
    title: "Key Ingredients",
    icon: Dna,
    description: "Prioritize clinically verified active compounds.",
    options: [
      { id: "i1", label: "Niacinamide (B3)" },
      { id: "i2", label: "Hyaluronic Acid" },
      { id: "i3", label: "Salicylic Acid (BHA)" },
      { id: "i4", label: "Ceramides Complex" },
      { id: "i5", label: "Vitamin C (Ascorbic)" },
      { id: "i6", label: "Centella Asiatica" },
    ],
  },
  {
    id: "budget",
    title: "Budget Preference",
    icon: DollarSign,
    description: "Find high-efficacy formulas within your price comfort.",
    options: [
      { id: "b1", label: "Under ₹500" },
      { id: "b2", label: "₹500 – ₹1,000" },
      { id: "b3", label: "₹1,000 – ₹2,000" },
      { id: "b4", label: "Clinical & Premium" },
    ],
  },
];

export function PersonalizedDiscovery() {
  const [selected, setSelected] = React.useState<Record<string, string[]>>({
    goals: ["g2", "g3"],
    type: ["t1"],
    ingredients: ["i1", "i4"],
    budget: ["b2"],
  });

  const toggleOption = (categoryId: string, optionId: string) => {
    setSelected((prev) => {
      const current = prev[categoryId] || [];
      const exists = current.includes(optionId);
      const next = exists
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [categoryId]: next };
    });
  };

  const totalSelected = Object.values(selected).reduce(
    (acc, list) => acc + list.length,
    0
  );

  return (
    <section id="discovery" className="border-b border-line/70 bg-background py-16 sm:py-24">
      <Container>
        {/* Header */}
        <ScrollReveal className="mx-auto flex max-w-2xl flex-col items-center space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-champagne/40 bg-champagne-tint/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-champagne-deep">
            <Sparkles className="h-3.5 w-3.5 text-champagne-deep" />
            <span>Interactive Preference Matching</span>
          </div>

          <h2 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
            Beauty That Fits You
          </h2>

          <p className="max-w-xl text-base leading-relaxed text-foreground-muted">
            Tell BeautyIQ what you need. We&apos;ll help you discover products that match your preferences.
          </p>
        </ScrollReveal>

        {/* 4 Interactive Preference Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {preferenceCategories.map((cat, i) => {
            const Icon = cat.icon;
            const currentSelected = selected[cat.id] || [];

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col justify-between rounded-3xl border border-line/80 bg-[image:var(--gradient-card)] p-6 shadow-card transition-all duration-300 hover:border-champagne/60 hover:shadow-card-hover"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-line/60 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-champagne/35 bg-champagne-tint text-champagne-deep">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {cat.title}
                      </h3>
                    </div>
                    {currentSelected.length > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[image:var(--gradient-gold)] text-[11px] font-bold text-[#1A1510]">
                        {currentSelected.length}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-foreground-muted">
                    {cat.description}
                  </p>

                  {/* Interactive Chip Options */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cat.options.map((opt) => {
                      const isChecked = currentSelected.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleOption(cat.id, opt.id)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-xs font-medium transition-all duration-150",
                            isChecked
                              ? "border-champagne/80 bg-champagne-tint font-semibold text-foreground shadow-xs dark:bg-champagne-tint/70"
                              : "border-line/70 bg-background/70 text-foreground-muted hover:border-line-strong hover:bg-background-elevated hover:text-foreground"
                          )}
                        >
                          {isChecked && (
                            <Check className="h-3 w-3 shrink-0 stroke-[3] text-champagne-deep" />
                          )}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 border-t border-line/50 pt-3 font-mono text-[11px] text-foreground-faint">
                  {currentSelected.length} selected
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action CTA Bar */}
        <ScrollReveal delay={0.15} className="mt-10 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
          <Link href="/onboarding">
            <Button
              size="lg"
              variant="accent"
              className="rounded-full px-8"
              leftIcon={<Sparkles className="h-4 w-4" />}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Build My Beauty Profile
            </Button>
          </Link>

          <Link href="/recommendations">
            <Button size="lg" variant="outline" className="rounded-full px-6">
              View Recommendations ({totalSelected} preferences)
            </Button>
          </Link>
        </ScrollReveal>
      </Container>
    </section>
  );
}
