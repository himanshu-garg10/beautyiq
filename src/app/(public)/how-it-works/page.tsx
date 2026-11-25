import * as React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sliders, Brain, CheckCircle2, Scale, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "How BeautyIQ Works — Skincare Recommendation Methodology",
  description: "Step-by-step breakdown of how BeautyIQ analyzes skin profiles, evaluates ingredient compatibility, and compares cross-platform prices.",
};

const steps = [
  {
    num: "01",
    title: "Define Your Requirements",
    description: "Tell BeautyIQ your skin type (Oily, Dry, Combination, Sensitive), active concerns (Acne, Dullness, Pigmentation), budget limits, and ingredients to avoid.",
    icon: Sliders,
  },
  {
    num: "02",
    title: "AI & Ingredient Analysis",
    description: "BeautyIQ processes your input using natural language understanding and cross-references active ingredients, safety ratings, and pH suitability.",
    icon: Brain,
  },
  {
    num: "03",
    title: "Compatibility Calculation",
    description: "Products receive a personalized Compatibility Score (0–100%) along with an explicit breakdown of why it was matched or any potential warnings.",
    icon: CheckCircle2,
  },
  {
    num: "04",
    title: "Cross-Platform Price Compare",
    description: "See live pricing across platforms (Nykaa, Amazon, Flipkart, Brand Store) to instantly spot the Best Price and Best Value per ml.",
    icon: Scale,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-12 py-10">
      <Container>
        <div className="max-w-3xl space-y-4">
          <Badge variant="sage">Methodology & Workflow</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How BeautyIQ matches skincare to your exact skin profile.
          </h1>
          <p className="text-lg text-foreground-muted leading-relaxed">
            No algorithm black boxes or sponsored ratings. Here is the transparent step-by-step process BeautyIQ uses to discover, evaluate, and compare products.
          </p>
        </div>
      </Container>

      {/* 4 Steps Flow Grid */}
      <Section className="bg-background-elevated/40 border-y border-line">
        <Container>
          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[12%] right-[12%] top-11 hidden h-px bg-gradient-to-r from-champagne/20 via-champagne/55 to-champagne/20 lg:block"
            />
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <ScrollReveal key={step.num} delay={idx * 0.15} className="h-full">
                  <div
                    className="group relative flex h-full flex-col justify-between space-y-4 rounded-3xl border border-line/75 bg-background-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-champagne/60 hover:shadow-card-hover"
                  >
                    <div>
                      <div className="mb-5 flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/40 bg-champagne-tint font-mono text-sm font-bold text-champagne-deep shadow-xs">
                          {step.num}
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sage/30 bg-sage-tint text-sage-deep transition-transform duration-300 group-hover:scale-105">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </Section>

      <Container className="text-center py-6">
        <Link href="/onboarding">
          <Button variant="accent" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Start Your Skin Profile
          </Button>
        </Link>
      </Container>
    </div>
  );
}
