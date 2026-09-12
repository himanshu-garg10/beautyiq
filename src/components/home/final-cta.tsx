"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

export function FinalCta() {
  return (
    <Section className="bg-ink">
      <Container className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-lg"
        >
          <h2 className="text-balance font-display text-3xl leading-[1.15] text-ivory md:text-[2.5rem]">
            Your skin has specific needs. Your skincare should too.
          </h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ivory/70">
            Describe what you&apos;re dealing with, and let BeautyIQ do the
            ingredient research for you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Button size="lg" variant="accent" className="bg-sage hover:bg-ivory hover:text-ink">
            Get My Recommendations
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
}
