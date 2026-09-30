"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/mock-data";

const matchCriteria = [
  {
    label: "Formulated for your exact skin type",
    detail: "Non-comedogenic gel texture tailored specifically for oily and combination skin.",
  },
  {
    label: "Targets your primary concerns",
    detail: "Clinical concentration of actives targeting active breakouts and enlarged pores.",
  },
  {
    label: "Respects your budget constraint",
    detail: "Normalized ₹549 listing falls directly within your ₹800 price cap.",
  },
  {
    label: "Evidence-backed active ingredients",
    detail: "10% Niacinamide + 1% Zinc PCA synergize to suppress sebum without stripping the barrier.",
  },
  {
    label: "Honors your clean formulation preferences",
    detail: "100% Fragrance-free, essential-oil free, and cruelty-free formulation.",
  },
];

export function RecommendationExplanation() {
  const featured = products[0];

  return (
    <Section className="border-b border-line">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Objective Suitability Match"
            title="Every Pick Comes with Scientific Rationale"
            description="BeautyIQ never sorts by commercial sponsor or sales hype. Every formula is scored on a multi-factor compatibility engine so you can see why it works for your skin."
          />

          <ul className="mt-8 flex flex-col gap-4">
            {matchCriteria.map((item, i) => (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="flex items-start gap-3.5 rounded-lg p-2.5 hover:bg-background-elevated/40 transition-colors"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-tint text-sage-deep dark:bg-sage-deep/20">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="mt-0.5 text-xs text-foreground-muted leading-relaxed">{item.detail}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="mt-8 pt-2">
            <Link href="/onboarding">
              <Button variant="accent" size="md" className="font-semibold gap-1.5 shadow-subtle">
                <span>Check Your Profile Match</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-2xl border border-line bg-background-card shadow-md"
        >
          <div className="relative h-64 w-full bg-background-elevated">
            <Image
              src={featured.image}
              alt={`${featured.brand} ${featured.name}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-sage-deep/30 bg-background-card/95 backdrop-blur-xs px-3 py-1 shadow-subtle">
              <Sparkles className="h-3.5 w-3.5 text-sage-deep" />
              <span className="text-xs font-bold text-sage-deep">
                {featured.compatibilityScore}% Compatibility
              </span>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-sage-deep">
                {featured.brand}
              </span>
              <span className="text-xs text-foreground-muted font-medium">Routine Step: {featured.category}</span>
            </div>

            <h3 className="font-display text-xl font-bold text-foreground">{featured.name}</h3>
            <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">
              {featured.description}
            </p>

            {/* Compatibility Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-foreground-muted">Algorithm Confidence</span>
                <span className="font-mono text-sage-deep font-bold">{featured.compatibilityScore}% Match</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-background-elevated border border-line">
                <motion.div
                  className="h-full rounded-full bg-sage-deep"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${featured.compatibilityScore}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
