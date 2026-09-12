"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ingredients } from "@/lib/mock-data";

export function Ingredients() {
  return (
    <Section id="ingredients">
      <Container>
        <SectionHeading
          eyebrow="Ingredient index"
          title="Know what's actually in it"
          description="BeautyIQ tracks active ingredients across thousands of products, so you can search by what a formula contains, not just its marketing."
        />

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ingredient, i) => (
            <motion.div
              key={ingredient.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group bg-white p-6 transition-colors hover:bg-sage-tint/40"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg text-ink">{ingredient.name}</h3>
                <span className="font-mono text-xs text-sage-deep">
                  {ingredient.concentration}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {ingredient.function || ingredient.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                {ingredient.concernTags.map((tag) => (
                  <span key={tag} className="text-xs text-ink-faint">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
