"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does BeautyIQ calculate Compatibility Scores?",
    a: "BeautyIQ evaluates active concentrations, comedogenic ratings, pH levels, and user skin profiles (skin type, concerns, sensitivities). Hard constraint rules filter out known irritants, while soft preference bonuses score overall suitability.",
  },
  {
    q: "Does BeautyIQ diagnose medical skin conditions?",
    a: "No. BeautyIQ is an educational product discovery and ingredient intelligence tool. It does not provide medical or dermatological diagnosis. Please consult a board-certified dermatologist for medical skin concerns.",
  },
  {
    q: "How often are prices updated across platforms?",
    a: "Our data pipeline tracks price listings across major marketplaces (Nykaa, Amazon, Flipkart, Brand Store) to present accurate price per ml and best value rankings.",
  },
  {
    q: "What is the difference between Best Price and Best Value?",
    a: "Best Price indicates the lowest absolute cart price available right now. Best Value factors in product volume (price per ml), active ingredient concentration, and platform shipping terms.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <Container className="py-10 space-y-8 max-w-3xl">
      <div className="space-y-3 text-center">
        <Badge variant="sage" className="mx-auto">
          Help & Frequently Asked Questions
        </Badge>
        <h1 className="font-display text-4xl font-bold text-foreground">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded border border-line bg-background-card overflow-hidden transition-all shadow-subtle"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-display text-lg font-semibold text-foreground"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-foreground-faint transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-sage-deep" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-sm text-foreground-muted leading-relaxed border-t border-line/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Container>
  );
}
