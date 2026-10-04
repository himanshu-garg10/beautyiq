"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Check,
  Sliders,
  DollarSign,
  Dna,
  Droplets,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
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
    <section id="discovery" className="border-b border-line bg-background py-16 sm:py-20">
      <Container>
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-champagne/40 bg-champagne-tint/70 text-xs font-semibold text-champagne-deep">
            <Sparkles className="h-3.5 w-3.5 text-champagne-deep" />
            <span>Interactive Preference Matching</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-foreground">
            Beauty That Fits You
          </h2>

          <p className="text-base text-foreground-muted leading-relaxed max-w-xl">
            Tell BeautyIQ what you need. We&apos;ll help you discover products that match your preferences.
          </p>
        </div>

        {/* 4 Interactive Preference Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {preferenceCategories.map((cat, i) => {
            const Icon = cat.icon;
            const currentSelected = selected[cat.id] || [];

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group flex flex-col justify-between rounded-2xl border border-line bg-background-card p-6 shadow-subtle hover:shadow-md transition-all duration-300 hover:border-champagne/50"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-line/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne-tint text-champagne-deep border border-champagne/30">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {cat.title}
                      </h3>
                    </div>
                    {currentSelected.length > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-champagne-deep text-[0.68rem] font-bold text-white">
                        {currentSelected.length}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-foreground-muted leading-relaxed">
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
                            "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 text-left",
                            isChecked
                              ? "border-champagne-deep bg-champagne-tint text-foreground font-semibold shadow-xs dark:bg-champagne-tint/40"
                              : "border-line bg-background hover:bg-background-elevated text-foreground-muted hover:text-foreground"
                          )}
                        >
                          {isChecked && (
                            <Check className="h-3 w-3 text-champagne-deep shrink-0 stroke-[3]" />
                          )}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-line/50 text-[0.7rem] text-foreground-faint font-mono">
                  {currentSelected.length} selected
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action CTA Bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Link href="/onboarding">
            <Button
              size="lg"
              variant="accent"
              className="rounded-full px-8 py-3.5 font-semibold text-sm shadow-md hover:shadow-lg transition-all gap-2 bg-foreground text-background hover:bg-foreground/90 dark:bg-champagne-deep dark:text-white"
            >
              <Sparkles className="h-4 w-4 text-champagne" />
              <span>Build My Beauty Profile</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/recommendations">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-6 py-3.5 font-medium text-sm border-line hover:border-champagne/60 bg-background-card hover:bg-background-elevated"
            >
              <span>View Recommendations ({totalSelected} preferences)</span>
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
