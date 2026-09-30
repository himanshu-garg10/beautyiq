"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";

const reviews = [
  {
    id: "r1",
    name: "Dr. Meera Vasudevan",
    title: "Cosmetic Formulator & Dermatologist",
    skinProfile: "Sensitive Barrier • Oily T-Zone",
    avatarBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    initials: "MV",
    rating: 5,
    review:
      "BeautyIQ brings medical clarity to retail skincare. Being able to inspect active concentrations and contraindications before purchase prevents barrier damage and cuts through marketing claims.",
    productUsed: "Minimalist 10% Niacinamide Face Serum",
  },
  {
    id: "r2",
    name: "Aarav Singhania",
    title: "Verified Community Member",
    skinProfile: "Acne-Prone & Congested",
    avatarBg: "bg-champagne-tint text-champagne-deep dark:bg-champagne-tint/40 dark:text-champagne-deep",
    initials: "AS",
    rating: 5,
    review:
      "The cross-platform price comparison is incredible. I used to switch between 4 different retailer tabs checking for deals. BeautyIQ showed me the lowest price on Nykaa and saved me ₹150 instantly.",
    productUsed: "Dot & Key Watermelon Gel Moisturizer",
  },
  {
    id: "r3",
    name: "Tanvi Deshmukh",
    title: "Skincare Enthusiast",
    skinProfile: "Dry Complexion • Dehydration",
    avatarBg: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    initials: "TD",
    rating: 5,
    review:
      "Finally a platform with zero influencer bias! The AI recommendation gave me a scientific rationale for why a formula matched my dry barrier, rather than pushing what was currently trending.",
    productUsed: "The Ordinary Niacinamide + Zinc",
  },
];

export function ReviewsSection() {
  return (
    <section className="border-b border-line bg-gradient-to-b from-background to-background-elevated/30 py-16 sm:py-20">
      <Container>
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-champagne/40 bg-champagne-tint/70 text-xs font-semibold text-champagne-deep">
            <Quote className="h-3.5 w-3.5 text-champagne-deep" />
            <span>Community Experiences</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-foreground">
            Trusted by Mindful Shoppers
          </h2>

          <p className="text-base text-foreground-muted leading-relaxed">
            Real feedback from beauty enthusiasts and specialists who found their ideal routine through chemical objectivity.
          </p>
        </div>

        {/* 3 Luxury Review Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, i) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col justify-between rounded-3xl border border-line bg-background-card p-7 shadow-subtle hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Review Body */}
                <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed italic">
                  &ldquo;{rev.review}&rdquo;
                </p>

                {/* Product Used Tag */}
                <div className="rounded-xl border border-line/60 bg-background-elevated/40 p-2.5 text-[0.72rem]">
                  <span className="font-semibold uppercase tracking-wider text-[0.65rem] text-foreground-faint block">
                    Product Used:
                  </span>
                  <span className="font-medium text-foreground truncate block">
                    {rev.productUsed}
                  </span>
                </div>
              </div>

              {/* User Identity Footer */}
              <div className="mt-6 pt-4 border-t border-line/60 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-xs ${rev.avatarBg}`}
                >
                  {rev.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-display text-sm font-bold text-foreground truncate">
                      {rev.name}
                    </p>
                    <CheckCircle2 className="h-3.5 w-3.5 text-champagne-deep shrink-0" />
                  </div>
                  <p className="text-[0.68rem] text-foreground-faint truncate">
                    {rev.skinProfile}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
