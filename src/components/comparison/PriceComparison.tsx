"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, Scale, ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { priceComparison } from "@/lib/mock-data";

export function PriceComparison() {
  const { product, listings } = priceComparison;
  const lowest = Math.min(...listings.map((l) => l.price));

  return (
    <Section className="border-b border-line bg-background-elevated/30">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <div className="overflow-hidden rounded-2xl border border-line bg-background-card shadow-md">
            {/* Header with Product Info */}
            <div className="flex items-center gap-4 border-b border-line p-5 bg-background-elevated/40">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background border border-line">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[0.68rem] uppercase font-bold tracking-wider text-sage-deep">
                  {product.brand}
                </span>
                <p className="font-display text-base font-bold text-foreground truncate">{product.name}</p>
                <span className="text-xs text-foreground-muted">50 ml • Multi-Marketplace Tracking</span>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-sage-tint text-sage-deep shrink-0">
                Live Pricing
              </span>
            </div>

            {/* Marketplace Listings */}
            <div className="divide-y divide-line/60">
              {listings.map((listing, i) => (
                <motion.div
                  key={listing.platform}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className={`flex items-center justify-between px-5 py-3.5 transition-colors ${
                    listing.isBestValue ? "bg-sage-tint/30 dark:bg-sage-deep/15" : "hover:bg-background-elevated/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-foreground">
                      {listing.platform}
                    </span>
                    {listing.isBestValue && (
                      <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-sage-deep bg-sage-tint px-2 py-0.5 rounded-full dark:bg-sage-deep/20">
                        <BadgeCheck className="h-3 w-3" />
                        Best Value
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-foreground-faint hidden sm:inline">
                      {listing.deliveryEstimate}
                    </span>
                    <span
                      className={`font-display text-lg font-bold ${
                        listing.price === lowest ? "text-sage-deep" : "text-foreground"
                      }`}
                    >
                      ₹{listing.price}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-line bg-background-elevated/30 flex items-center justify-between">
              <span className="text-xs text-foreground-muted">
                Price normalized per ml automatically.
              </span>
              <Link href="/compare">
                <Button variant="outline" size="sm" className="font-semibold gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-sage-deep" />
                  Compare Any Products
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 space-y-4">
          <SectionHeading
            eyebrow="Marketplace Transparency"
            title="Stop Checking 7 Apps for 1 Serum"
            description="BeautyIQ continuously monitors and compares live prices across Amazon, Flipkart, Myntra, Nykaa, Brand Direct Stores (Minimalist, Dot & Key), Purplle, and Tira so you always get the lowest verified price."
          />
          <div className="space-y-3 pt-2 text-sm text-foreground-muted">
            <div className="flex items-start gap-2.5">
              <div className="h-5 w-5 rounded-full bg-sage-tint text-sage-deep flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <p>Calculates true cost per unit (₹/ml or ₹/g) to expose misleading packaging sizes.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="h-5 w-5 rounded-full bg-sage-tint text-sage-deep flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <p>Flags authorized sellers and verified marketplace listings to avoid counterfeits.</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
