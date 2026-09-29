"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ingredients } from "@/lib/mock-data";

export function Ingredients() {
  return (
    <Section id="ingredients" className="border-b border-line bg-background-elevated/20">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Ingredient Database"
            title="Know What's Actually in the Formula"
            description="BeautyIQ tracks scientifically proven active ingredients, so you can filter products by proven efficacy rather than cosmetic marketing."
            className="max-w-xl"
          />
          <Link
            href="/ingredients"
            className="text-xs font-semibold text-sage-deep hover:underline flex items-center gap-1"
          >
            All Ingredients <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ingredients.slice(0, 8).map((ingredient, i) => (
            <motion.div
              key={ingredient.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
            >
              <Link
                href={`/ingredients/${ingredient.id}`}
                className="group flex flex-col justify-between h-full rounded-xl border border-line bg-background-card p-5 transition-all duration-300 hover:shadow-md hover:border-line-strong shadow-subtle"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-foreground group-hover:text-sage-deep transition-colors">
                      {ingredient.name}
                    </h3>
                    <span className="font-mono text-[0.7rem] font-bold text-sage-deep bg-sage-tint/80 px-2 py-0.5 rounded shrink-0 dark:bg-sage-deep/20">
                      {ingredient.concentration}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-foreground-muted line-clamp-2">
                    {ingredient.function || ingredient.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {ingredient.concernTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[0.65rem] font-medium text-foreground-faint bg-background-elevated px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-foreground-faint group-hover:text-sage-deep group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
