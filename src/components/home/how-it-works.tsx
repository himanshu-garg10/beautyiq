"use client";

import { motion } from "framer-motion";
import { MessageSquareText, ScanSearch, FlaskConical, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";

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
    <Section id="how-it-works" className="border-b border-line">
      <Container>
        <SectionHeading
          eyebrow="The process"
          title="From a sentence to a shortlist"
          description="No quizzes, no lengthy forms. BeautyIQ works the way you'd explain your skin to a knowledgeable friend."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative border-t border-line pt-6"
            >
              <span className="mb-6 block font-mono text-xs text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <step.icon className="mb-4 h-6 w-6 text-sage-deep" aria-hidden="true" />
              <h3 className="mb-2 font-display text-lg text-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
