import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Skincare Categories Index — BeautyIQ",
  description: "Browse skincare product categories: Cleansers, Serums, Moisturizers, Sunscreens, Toners, Exfoliators, and Masks.",
};

export default function CategoriesPage() {
  return (
    <Container className="py-10 space-y-8">
      <div className="max-w-3xl space-y-3">
        <Badge variant="sage">Product Categories</Badge>
        <h1 className="font-display text-4xl font-bold text-foreground">
          Browse by Routine Step & Category
        </h1>
        <p className="text-sm text-foreground-muted">
          Select a category to filter products tailored to your routine step.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="group relative overflow-hidden rounded-xl border border-line bg-background-card shadow-subtle transition-all hover:shadow-md hover:border-line-strong"
          >
            <div className="relative h-48 w-full bg-background-elevated overflow-hidden">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-display text-xl font-bold">{cat.name}</h3>
                <p className="text-xs text-white/80 font-mono mt-0.5">
                  {cat.productCount} Products
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
