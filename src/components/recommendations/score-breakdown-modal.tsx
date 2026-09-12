"use client";

import * as React from "react";
import type { ScoredProduct } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

interface ScoreBreakdownModalProps {
  scoredProduct: ScoredProduct;
  onClose: () => void;
}

export function ScoreBreakdownModal({ scoredProduct, onClose }: ScoreBreakdownModalProps) {
  const { product, scoreBreakdown, reasons, considerations } = scoredProduct;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-lg border border-line bg-background-card p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-4">
          <div>
            <span className="text-xs uppercase font-bold text-sage-deep tracking-wider block">
              {product.brand} • {product.category}
            </span>
            <h3 className="font-display text-xl font-bold text-foreground mt-0.5">
              {product.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-foreground-faint hover:text-foreground rounded-full hover:bg-background-elevated"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Overall Score Banner */}
        <div className="rounded border border-sage-deep/30 bg-sage-tint/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-sage-deep block">Overall Compatibility Score</span>
            <span className="text-xs text-foreground-muted">Calculated via deterministic weighted criteria engine</span>
          </div>
          <span className="font-display text-3xl font-bold text-sage-deep font-mono">
            {scoreBreakdown.overallScore}%
          </span>
        </div>

        {/* Score Breakdown Progress Bars (Requirement #34) */}
        <div className="space-y-4 text-xs">
          <h4 className="font-display font-semibold text-foreground text-sm border-b border-line pb-2">
            Detailed Factor Sub-Scores
          </h4>

          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span>Skin Type Compatibility</span>
              <span className="font-mono font-bold">{scoreBreakdown.skinTypeScore}%</span>
            </div>
            <Progress value={scoreBreakdown.skinTypeScore} variant="sage" size="md" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span>Target Concerns Match</span>
              <span className="font-mono font-bold">{scoreBreakdown.concernScore}%</span>
            </div>
            <Progress value={scoreBreakdown.concernScore} variant="sage" size="md" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span>Active Ingredients Match</span>
              <span className="font-mono font-bold">{scoreBreakdown.ingredientScore}%</span>
            </div>
            <Progress value={scoreBreakdown.ingredientScore} variant="clay" size="md" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span>Preferences &amp; Safety Attributes</span>
              <span className="font-mono font-bold">{scoreBreakdown.preferenceScore}%</span>
            </div>
            <Progress value={scoreBreakdown.preferenceScore} variant="sage" size="md" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span>Budget Cap &amp; Value Score</span>
              <span className="font-mono font-bold">{scoreBreakdown.budgetFitScore}%</span>
            </div>
            <Progress value={scoreBreakdown.budgetFitScore} variant="sage" size="md" />
          </div>
        </div>

        {/* Explainable Reasons */}
        <div className="space-y-2 pt-2 border-t border-line text-xs">
          <span className="font-semibold text-foreground uppercase tracking-wider block">
            Why BeautyIQ Recommended This Product:
          </span>
          <ul className="space-y-1 text-foreground-muted">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-line flex justify-end">
          <Button variant="accent" onClick={onClose}>
            Close Score Breakdown
          </Button>
        </div>
      </div>
    </div>
  );
}
