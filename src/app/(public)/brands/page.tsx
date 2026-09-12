"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { brandsList } from "@/lib/mock-data";
import { Search, ArrowRight, Globe } from "lucide-react";

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredBrands = brandsList.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.philosophy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container className="py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="max-w-2xl space-y-2">
          <Badge variant="sage">Verified Brands Index</Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Skincare Brands Directory
          </h1>
          <p className="text-sm text-foreground-muted">
            Explore ingredient-first skincare brands indexed and tracked for price intelligence on BeautyIQ.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search brands by name or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-sage-deep" />}
          />
        </div>
      </div>

      {/* Brands Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((b) => (
          <Link
            key={b.id}
            href={`/brands/${b.id}`}
            className="group rounded border border-line bg-background-card p-6 space-y-4 shadow-subtle hover:border-line-strong hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-sage-deep transition-colors">
                  {b.name}
                </h3>
                <Badge variant="outline" className="gap-1 text-[0.7rem]">
                  <Globe className="h-3 w-3 text-sage-deep" /> {b.country}
                </Badge>
              </div>
              <p className="text-xs text-foreground-muted leading-relaxed line-clamp-3">
                {b.philosophy}
              </p>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-between text-xs font-mono text-foreground-faint">
              <span>{b.productCount} Indexed Products</span>
              <span className="text-sage-deep font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Browse Brand Catalog <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
