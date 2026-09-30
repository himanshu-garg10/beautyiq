"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dna, ArrowUpRight, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

const ingredientsData = [
  {
    id: "ing-1",
    name: "Niacinamide",
    type: "Vitamin B3 Active",
    concentration: "2% – 10%",
    explanation: "A water-soluble essential vitamin that strengthens skin barrier lipids and balances natural sebum flow.",
    benefits: ["Minimizes visible pores", "Regulates excess shine", "Calms appearance of redness"],
    compatibility: "High for Oily, Combination & Sensitive",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    id: "ing-2",
    name: "Hyaluronic Acid",
    type: "Multi-Depth Humectant",
    concentration: "1% – 2%",
    explanation: "A skin-identical moisture magnet capable of binding up to 1000 times its molecular weight in water.",
    benefits: ["Instant epidermal plumping", "Soothes dehydration lines", "Enhances suppleness"],
    compatibility: "Universal for All Skin Profiles",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  {
    id: "ing-3",
    name: "Vitamin C",
    type: "L-Ascorbic / Derivatives",
    concentration: "8% – 15%",
    explanation: "A gold-standard topical antioxidant that defends skin against oxidative stress and environmental dullness.",
    benefits: ["Boosts natural surface glow", "Evens visible skin tone", "Protects against environmental fatigue"],
    compatibility: "Normal, Combination & Dull skin",
    badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    id: "ing-4",
    name: "Salicylic Acid",
    type: "Beta Hydroxy Acid (BHA)",
    concentration: "0.5% – 2%",
    explanation: "A lipid-soluble exfoliating acid that penetrates directly into pore walls to dissolve oil build-up.",
    benefits: ["Unclogs congested pores", "Smooths rough surface bumps", "Diminishes blackheads"],
    compatibility: "Oily, Acne-Prone & Congested skin",
    badgeColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  },
  {
    id: "ing-5",
    name: "Ceramides Complex",
    type: "Intercellular Lipids",
    concentration: "1% – 3%",
    explanation: "Fundamental fatty compounds that make up more than 50% of healthy stratum corneum barrier structure.",
    benefits: ["Restores damaged moisture barrier", "Prevents transepidermal water loss", "Relieves dry tightness"],
    compatibility: "Dry, Sensitive & Impaired barriers",
    badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  },
  {
    id: "ing-6",
    name: "Centella Asiatica",
    type: "Botanical Cica Extract",
    concentration: "5% – 40%",
    explanation: "An ancient soothing botanical packed with madecassoside that cools reactive, flushing skin rapidly.",
    benefits: ["Comforts sensitive irritation", "Supports skin renewal", "Strengthens micro-circulation"],
    compatibility: "Sensitive, Redness-Prone & Post-Treatment",
    badgeColor: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  },
];

export function IngredientIntelligence() {
  return (
    <section id="ingredients" className="border-b border-line bg-background py-16 sm:py-20">
      <Container>
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-champagne-deep">
              <Dna className="h-3.5 w-3.5" />
              <span>Evidence-Based Formulation</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Know What&apos;s Inside
            </h2>
            <p className="text-sm sm:text-base text-foreground-muted leading-relaxed">
              Understand the science behind your skincare ritual. We break down active concentrations, proven benefits, and compatibility without cosmetic marketing hype.
            </p>
          </div>

          <Link href="/ingredients" className="shrink-0">
            <Button
              variant="outline"
              className="rounded-full px-5 py-2 font-semibold text-xs border-line hover:border-champagne/60 bg-background-card hover:bg-background-elevated gap-1.5 shadow-xs"
            >
              <span>Explore All Actives</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* 6 Ingredient Cards Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ingredientsData.map((ing, i) => (
            <motion.div
              key={ing.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Link
                href={`/ingredients/${ing.id}`}
                className="group flex flex-col justify-between h-full rounded-2xl border border-line bg-background-card p-6 shadow-subtle hover:shadow-md transition-all duration-300 hover:border-champagne/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-line/60">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-champagne-deep transition-colors">
                        {ing.name}
                      </h3>
                      <span className="text-[0.72rem] text-foreground-faint font-medium">
                        {ing.type}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-bold text-champagne-deep bg-champagne-tint px-2.5 py-0.5 rounded-full border border-champagne/30">
                      {ing.concentration}
                    </span>
                  </div>

                  <p className="mt-3.5 text-xs text-foreground-muted leading-relaxed">
                    {ing.explanation}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-foreground-faint block">
                      Proven Benefits:
                    </span>
                    <ul className="space-y-1 text-xs text-foreground font-medium">
                      {ing.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-1.5 text-foreground-muted">
                          <span className="h-1.5 w-1.5 rounded-full bg-champagne-deep" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-line/60 flex items-center justify-between">
                  <span className={`text-[0.68rem] font-semibold px-2 py-0.5 rounded-full ${ing.badgeColor}`}>
                    {ing.compatibility}
                  </span>
                  <span className="text-xs font-semibold text-champagne-deep group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
