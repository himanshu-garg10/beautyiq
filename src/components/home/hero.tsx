"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { AiSearch } from "@/components/home/ai-search";

const specimens = [
  { label: "Niacinamide", value: "10%", note: "Oil control", rotate: -3, top: "4%", left: "6%" },
  { label: "Hyaluronic Acid", value: "1.5%", note: "Hydration", rotate: 2, top: "34%", left: "46%" },
  { label: "Salicylic Acid", value: "2%", note: "Acne care", rotate: -2, top: "62%", left: "10%" },
  { label: "Ceramides", value: "3%", note: "Barrier repair", rotate: 3, top: "16%", left: "58%" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <Container className="grid grid-cols-1 items-center gap-16 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-6 flex items-center gap-2 text-sm text-sage-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-sage-deep" />
            Skincare intelligence, not guesswork
          </div>

          <h1 className="text-balance font-display text-[2.6rem] leading-[1.08] text-ink sm:text-[3.2rem] lg:text-[3.6rem]">
            Skincare that
            <br />
            understands your skin.
          </h1>

          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
            Describe your skin in plain words. BeautyIQ reads the ingredient
            list on every product, compares it against your needs, and tells
            you exactly what will work — and why.
          </p>

          <div className="mt-9 max-w-xl">
            <AiSearch />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" variant="accent">
              Get My Recommendations
            </Button>
            <Button size="lg" variant="ghost">
              See how it works
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto hidden h-[420px] w-full max-w-md md:block"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        >
          <div className="absolute inset-x-10 inset-y-8 rounded-lg border border-line-strong bg-ivory-deep/60" />
          {specimens.map((s, i) => (
            <motion.div
              key={s.label}
              className="absolute w-[188px] rounded-md border border-line-strong bg-white p-4 shadow-[0_10px_30px_rgba(38,36,32,0.07)]"
              style={{
                top: s.top,
                left: s.left,
                rotate: `${s.rotate}deg`,
              }}
              initial={{ opacity: 0, y: 16, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: s.rotate }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.12, ease: "easeOut" }}
              whileHover={{ rotate: 0, y: -4 }}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg text-ink">{s.value}</span>
                <span className="font-mono text-[0.65rem] text-ink-faint">
                  ACTIVE
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-ink">{s.label}</p>
              <p className="mt-1 text-xs text-ink-soft">{s.note}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
