"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SearchHistoryPage() {
  const { user } = useAuth();
  const searches = user?.searchHistory || [];

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-line pb-6">
        <Badge variant="sage" className="mb-2">
          Activity History
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Recent Search &amp; Discovery History
        </h1>
      </div>

      <div className="space-y-3">
        {searches.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 rounded border border-line bg-background-card shadow-subtle hover:border-line-strong transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-sage-tint flex items-center justify-center text-sage-deep">
                <Search className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">&quot;{s}&quot;</span>
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(s)}`}
              className="text-xs font-semibold text-sage-deep hover:underline flex items-center gap-1"
            >
              Re-run AI Search <Sparkles className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
