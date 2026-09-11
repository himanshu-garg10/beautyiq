"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories } from "@/lib/mock-data";

export function Categories() {
  return (
    <Section id="categories" className="border-b border-line bg-ivory-deep/50">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Browse"
            title="Start from a category"
            className="max-w-md"
          />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, i) => (
            <motion.a
              href="#"
              key={category.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="group relative flex flex-col overflow-hidden rounded-md border border-line bg-white"
            >
              <div className="relative h-32 w-full overflow-hidden">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-display text-base text-ink">{category.name}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {category.productCount} products
                  </p>
                </div>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sage-deep"
                  aria-hidden="true"
                />
              </div>
            </motion.a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
