"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { UserCheck, Sparkles, Eye, Scale, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: UserCheck,
    title: "Deeply Personalized",
    tagline: "Tailored to your biological skin profile",
    description:
      "No two complexions are alike. BeautyIQ analyzes your sebum production, climate humidity, barrier sensitivity, and routine history to ensure zero adverse reactions.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Chemistry",
    tagline: "Formulation analysis, not commercial hype",
    description:
      "Our algorithms calculate active molecule efficacy, pH balance, and ingredient synergy across 350+ compounds, verifying true dermatological potential.",
  },
  {
    icon: Eye,
    title: "100% Transparent",
    tagline: "Zero paid placement or brand bias",
    description:
      "Brands cannot purchase top rankings on BeautyIQ. Every recommendation reveals its full objective rationale, compatibility score, and active ingredient percentages.",
  },
  {
    icon: Scale,
    title: "Cross-Platform Intelligence",
    tagline: "Continuous multi-retailer index tracking",
    description:
      "We scan verified marketplaces like Nykaa, Amazon, Tira, and official brand outlets in real-time, calculating true unit cost per milliliter so you never overpay.",
  },
];

export function WhyBeautyIq() {
  return (
    <section className="border-b border-line bg-gradient-to-b from-background via-champagne-tint/25 to-background py-16 sm:py-20">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-champagne/40 bg-champagne-tint/70 text-xs font-semibold text-champagne-deep">
            <Sparkles className="h-3.5 w-3.5 text-champagne-deep" />
            <span>The BeautyIQ Distinction</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-foreground">
            Why BeautyIQ
          </h2>

          <p className="text-base text-foreground-muted leading-relaxed">
            Cosmetics retail is saturated with viral marketing and influencer bias. BeautyIQ brings computational clarity and ingredient honesty back to beauty discovery.
          </p>
        </div>

        {/* 4 Feature Blocks */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group flex flex-col justify-between rounded-3xl border border-line bg-background-card p-6 sm:p-7 shadow-subtle hover:shadow-md transition-all duration-300 hover:border-champagne/60"
              >
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-champagne-tint text-champagne-deep border border-champagne/30 group-hover:scale-105 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-champagne-deep transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs font-semibold text-champagne-deep tracking-tight">
                      {feat.tagline}
                    </p>
                  </div>

                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-foreground-faint font-mono">
                  <span>0{i + 1} / Pillar</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-champagne-deep/60" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
