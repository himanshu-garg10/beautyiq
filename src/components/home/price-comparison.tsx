"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { priceComparison } from "@/lib/mock-data";

export function PriceComparison() {
  const { product, listings } = priceComparison;
  const lowest = Math.min(...listings.map((l) => l.price));

  return (
    <Section className="border-b border-line bg-ivory-deep/50">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1">
          <div className="overflow-hidden rounded-md border border-line bg-white">
            <div className="flex items-center gap-4 border-b border-line p-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-ivory-deep">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-faint">
                  {product.brand}
                </p>
                <p className="font-display text-base text-ink">{product.name}</p>
              </div>
            </div>

            <div className="flex flex-col">
              {listings.map((listing, i) => (
                <motion.div
                  key={listing.platform}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i !== listings.length - 1 ? "border-b border-line" : ""
                  } ${listing.isBestValue ? "bg-sage-tint/40" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-medium text-ink">
                      {listing.platform}
                    </span>
                    {listing.isBestValue && (
                      <span className="flex items-center gap-1 text-xs font-medium text-sage-deep">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Best value
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-ink-faint">
                      {listing.deliveryEstimate}
                    </span>
                    <span
                      className={`font-display text-lg ${
                        listing.price === lowest ? "text-sage-deep" : "text-ink"
                      }`}
                    >
                      ₹{listing.price}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="One product, every price"
            title="Stop checking five tabs for one product"
            description="BeautyIQ tracks live pricing for the same product across major platforms, so you always know where it costs the least — before you buy."
          />
        </div>
      </Container>
    </Section>
  );
}
