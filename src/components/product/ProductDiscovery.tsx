"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "all", label: "All Curations" },
  { id: "skincare", label: "Skincare" },
  { id: "makeup", label: "Makeup" },
  { id: "haircare", label: "Haircare" },
  { id: "fragrance", label: "Fragrance" },
  { id: "bodycare", label: "Body Care" },
];

export function ProductDiscovery() {
  const [activeTab, setActiveTab] = React.useState("all");

  const filteredProducts = React.useMemo(() => {
    if (activeTab === "all") {
      return products.slice(0, 8);
    }
    if (activeTab === "skincare") {
      return products.filter((p) =>
        ["Serum", "Moisturizer", "Cleanser", "Sunscreen", "Toner"].includes(p.category)
      ).slice(0, 8);
    }
    if (activeTab === "makeup") {
      const match = products.filter((p) =>
        p.category.toLowerCase().includes("makeup") || p.category.toLowerCase().includes("lip")
      );
      return match.length > 0 ? match : products.slice(2, 6);
    }
    if (activeTab === "haircare") {
      const match = products.filter((p) =>
        p.category.toLowerCase().includes("hair") || p.category.toLowerCase().includes("scalp")
      );
      return match.length > 0 ? match : products.slice(4, 8);
    }
    if (activeTab === "fragrance") {
      return products.slice(1, 5);
    }
    if (activeTab === "bodycare") {
      return products.slice(3, 7);
    }
    return products.slice(0, 8);
  }, [activeTab]);

  return (
    <section id="products" className="border-b border-line bg-background py-16 sm:py-20">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-champagne-deep">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Dermatologically Verified Directory</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Explore Beauty Products
            </h2>
            <p className="text-sm sm:text-base text-foreground-muted leading-relaxed">
              Formulations verified for chemical transparency, active concentrations, and real compatibility.
            </p>
          </div>

          <Link href="/products" className="shrink-0">
            <Button
              variant="outline"
              className="rounded-full px-5 py-2 font-semibold text-xs border-line hover:border-champagne/60 bg-background-card hover:bg-background-elevated gap-1.5 shadow-xs"
            >
              <span>View All {products.length} Products</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-line/60">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-foreground text-background shadow-xs dark:bg-champagne-deep dark:text-white"
                    : "text-foreground-muted hover:text-foreground hover:bg-background-elevated/70"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 4-Column Clean Grid */}
        <motion.div
          layout
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>
    </section>
  );
}
