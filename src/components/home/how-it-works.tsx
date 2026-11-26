"use client";

import { MessageSquareText, ScanSearch, FlaskConical, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const steps = [
  {
    icon: MessageSquareText,
    title: "Tell us about your skin",
    description:
      "Skin type, concerns, budget — described in your own words, not a form.",
  },
  {
    icon: ScanSearch,
    title: "BeautyIQ reads your requirements",
    description:
      "Your input is parsed into skin type, concerns, ingredients to seek or avoid, and price range.",
  },
  {
    icon: FlaskConical,
    title: "Products are analyzed",
    description:
      "Every candidate product's ingredient list is checked against your specific profile.",
  },
  {
    icon: Sparkles,
    title: "Get matched recommendations",
    description:
      "See ranked products with a plain-language explanation of why each one fits.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="border-b border-line bg-background-elevated/30">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow="The process"
            title="From a sentence to a shortlist"
            description="No quizzes, no lengthy forms. BeautyIQ works the way you'd explain your skin to a knowledgeable friend."
          />
        </ScrollReveal>

        <div className="relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[12%] right-[12%] top-11 hidden h-px bg-gradient-to-r from-champagne/20 via-champagne/55 to-champagne/20 lg:block"
          />
          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 0.15} className="h-full">
              <div className="group relative flex h-full flex-col rounded-3xl border border-line/75 bg-background-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-champagne/60 hover:shadow-card-hover">
                <div className="mb-6 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/40 bg-champagne-tint font-mono text-xs font-bold text-champagne-deep shadow-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-sage/30 bg-sage-tint text-sage-deep transition-transform duration-300 group-hover:scale-105">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
