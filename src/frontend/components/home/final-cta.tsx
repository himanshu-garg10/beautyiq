"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

export function FinalCta() {
  return (
    <Section className="border-t border-line bg-gradient-to-b from-background-elevated/40 to-background-card">
      <Container className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="max-w-xl space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage-deep">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Smart Skincare Made Simple</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Your skin is unique. Your skincare routine should be too.
          </h2>
          <p className="text-sm md:text-base text-foreground-muted leading-relaxed">
            Stop wasting money on viral products that cause breakouts. Build your verified profile or describe your skin in natural language.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex flex-wrap items-center gap-3 shrink-0"
        >
          <Link href="/onboarding">
            <Button size="lg" variant="accent" className="font-semibold shadow-md gap-2">
              <span>Build Free Skin Profile</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/ai-search">
            <Button size="lg" variant="outline" className="font-semibold">
              Try AI Search
            </Button>
          </Link>
        </motion.div>
      </Container>
    </Section>
  );
}
