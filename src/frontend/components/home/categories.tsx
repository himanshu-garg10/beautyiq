"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories } from "@/lib/mock-data";

export function Categories() {
  return (
    <Section id="categories" className="border-b border-line bg-background-elevated/40">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Routine Steps"
            title="Browse by Category"
            description="Explore formulations categorised by role in your morning and evening skincare ritual."
            className="max-w-md"
          />
          <Link
            href="/categories"
            className="text-xs font-semibold text-sage-deep hover:underline flex items-center gap-1"
          >
            All 12 Categories <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
            >
              <Link
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-background-card shadow-subtle hover:shadow-md transition-all duration-300 hover:border-line-strong h-full"
              >
                <div className="relative h-32 w-full overflow-hidden bg-background-elevated">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute bottom-2.5 right-3 text-[0.68rem] font-mono font-medium text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                    {category.productCount} products
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-background-card">
                  <div>
                    <p className="font-display text-base font-bold text-foreground group-hover:text-sage-deep transition-colors">
                      {category.name}
                    </p>
                    <p className="mt-0.5 text-xs text-foreground-muted">
                      Routine step
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-background-elevated text-foreground-muted group-hover:bg-sage-tint group-hover:text-sage-deep transition-colors">
                    <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
