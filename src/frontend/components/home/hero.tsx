"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { AiSearch } from "@/components/home/ai-search";

const specimens = [
  { label: "Niacinamide", value: "10%", note: "Sebum regulation & barrier care", rotate: -3, top: "6%", left: "6%" },
  { label: "Hyaluronic Acid", value: "2%", note: "Multi-depth epidermal hydration", rotate: 2, top: "34%", left: "46%" },
  { label: "Salicylic Acid", value: "2% BHA", note: "Pore decongestion & acne care", rotate: -2, top: "62%", left: "10%" },
  { label: "Ceramides Complex", value: "3%", note: "Lipid barrier reconstruction", rotate: 3, top: "14%", left: "56%" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-background to-background-elevated/30">
      <Container className="grid grid-cols-1 items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sage-deep/30 bg-sage-tint/60 text-xs font-semibold text-sage-deep dark:bg-sage-deep/15">
            <Sparkles className="h-3.5 w-3.5 text-sage-deep" />
            <span>AI Powered Skincare &amp; Ingredient Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-balance font-display text-[2.5rem] leading-[1.12] text-foreground sm:text-[3.2rem] lg:text-[3.75rem] font-bold tracking-tight">
            Skincare discovery
            <br />
            rooted in <span className="italic text-sage-deep font-normal">chemistry</span>,
            <br />
            not hype.
          </h1>

          {/* Subheading */}
          <p className="max-w-xl text-[1.05rem] leading-relaxed text-foreground-muted">
            Describe your skin in your own natural words. BeautyIQ parses every active concentration,
            checks contraindications, and matches dermatologically verified products at the lowest cross-platform price.
          </p>

          {/* AI Requirement Input Section */}
          <div className="pt-2 max-w-xl">
            <AiSearch />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/onboarding">
              <Button size="lg" variant="accent" className="font-semibold shadow-md gap-2">
                Build Skin Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="font-medium">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-foreground-faint font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-sage-deep" />
              <span>Zero Sponsored Rankings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-sage-deep" />
              <span>Dermatological Ingredient Checks</span>
            </div>
          </div>
        </motion.div>

        {/* Visual Floating Specimen Cards */}
        <motion.div
          className="relative mx-auto hidden h-[440px] w-full max-w-md lg:block"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <div className="absolute inset-x-8 inset-y-6 rounded-2xl border border-line bg-background-elevated/40 backdrop-blur-xs" />
          {specimens.map((s, i) => (
            <motion.div
              key={s.label}
              className="absolute w-[200px] rounded-xl border border-line bg-background-card p-4 shadow-md transition-shadow hover:shadow-lg"
              style={{
                top: s.top,
                left: s.left,
                rotate: `${s.rotate}deg`,
              }}
              initial={{ opacity: 0, y: 16, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: s.rotate }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: "easeOut" }}
              whileHover={{ rotate: 0, y: -4, scale: 1.03 }}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-xl font-bold text-foreground">{s.value}</span>
                <span className="font-mono text-[0.65rem] font-bold text-sage-deep bg-sage-tint px-1.5 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{s.label}</p>
              <p className="mt-1 text-xs text-foreground-muted leading-snug">{s.note}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
