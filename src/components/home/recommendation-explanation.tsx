"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { products } from "@/lib/mock-data";

const matchCriteria = [
  {
    label: "Matches your skin type",
    detail: "Formulated for oily and combination skin without heavy oils.",
  },
  {
    label: "Matches your concerns",
    detail: "Targets breakouts and enlarged pores directly.",
  },
  {
    label: "Matches your budget",
    detail: "Priced at ₹549 — within your ₹800 limit.",
  },
  {
    label: "Contains relevant ingredients",
    detail: "10% Niacinamide and Zinc PCA, both proven for oil control.",
  },
  {
    label: "Matches your preferences",
    detail: "Fragrance-free and not tested on animals.",
  },
];

export function RecommendationExplanation() {
  const featured = products[0];

  return (
    <Section>
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="Why this, not just what's popular"
            title="Every recommendation comes with a reason"
            description="BeautyIQ doesn't rank by popularity or paid placement. Each product is scored against your specific profile, and you can see exactly why it made the list."
          />

          <ul className="mt-10 flex flex-col gap-5">
            {matchCriteria.map((item, i) => (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-tint text-sage-deep">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{item.detail}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-md border border-line bg-white"
        >
          <div className="relative h-64 w-full">
            <Image
              src={featured.image}
              alt={`${featured.brand} ${featured.name}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-ink-faint">
                {featured.brand}
              </p>
              <div className="flex items-center gap-1.5 rounded-sm border border-sage/30 bg-sage-tint px-2 py-1 text-xs font-medium text-sage-deep">
                {featured.compatibilityScore}% compatibility
              </div>
            </div>
            <h3 className="mt-2 font-display text-xl text-ink">{featured.name}</h3>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ivory-deep">
              <motion.div
                className="h-full rounded-full bg-sage-deep"
                initial={{ width: 0 }}
                whileInView={{ width: `${featured.compatibilityScore}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
