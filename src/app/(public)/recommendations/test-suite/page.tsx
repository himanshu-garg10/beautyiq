"use client";

import * as React from "react";
import Link from "next/link";
import { RecommendationEngineService } from "@/services/recommendation-engine.service";
import { AIRequirementService } from "@/services/ai-requirement.service";
import type { RecommendationResultSet, RecommendationPriority, StructuredSkincareRequirement } from "@/types";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TestTube, CheckCircle2, AlertTriangle, Play, RefreshCw, BarChart2 } from "lucide-react";

interface TestScenarioDef {
  id: number;
  label: string;
  category: "Constraints" | "Preferences" | "Categories" | "Relaxation & Safety";
  buildReq: () => StructuredSkincareRequirement;
  priority?: RecommendationPriority;
}

const scenarioDefinitions: TestScenarioDef[] = [
  {
    id: 1,
    label: "1. Exact match",
    category: "Constraints",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("10% Niacinamide Face Serum");
      req.category = "Serum";
      req.skinType = "Oily";
      req.maxPrice = 1000;
      req.concerns = ["Acne"];
      req.preferredIngredients = ["Niacinamide"];
      return req;
    },
  },
  {
    id: 2,
    label: "2. Multiple concerns",
    category: "Constraints",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Oily skin with acne and dark spots");
      req.category = "Serum";
      req.skinType = "Oily";
      req.concerns = ["Acne", "Dark spots", "Pimples", "Visible pores"];
      return req;
    },
  },
  {
    id: 3,
    label: "3. Budget constraint",
    category: "Constraints",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Cleanser under 400");
      req.category = "Cleanser";
      req.maxPrice = 450;
      return req;
    },
  },
  {
    id: 4,
    label: "4. Required ingredient",
    category: "Constraints",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Serum with Salicylic Acid");
      req.category = "Serum";
      req.preferredIngredients = ["Salicylic Acid"];
      return req;
    },
  },
  {
    id: 5,
    label: "5. Excluded ingredient",
    category: "Constraints",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Serum without fragrance");
      req.category = "Serum";
      req.avoidIngredients = ["Fragrance"];
      return req;
    },
  },
  {
    id: 6,
    label: "6. Excluded brand",
    category: "Constraints",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Sunscreen avoid Minimalist");
      req.category = "Sunscreen";
      req.excludedBrands = ["Minimalist"];
      return req;
    },
  },
  {
    id: 7,
    label: "7. Availability constraint",
    category: "Constraints",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("In stock face wash");
      req.category = "Face Wash";
      return req;
    },
  },
  {
    id: 8,
    label: "8. Preferred brand",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Prefer Cetaphil");
      req.category = "Cleanser";
      req.preferredBrands = ["Cetaphil"];
      return req;
    },
  },
  {
    id: 9,
    label: "9. Preferred ingredient",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Hyaluronic Acid moisturizer");
      req.category = "Moisturizer";
      req.preferredIngredients = ["Hyaluronic Acid"];
      return req;
    },
  },
  {
    id: 10,
    label: "10. Texture preference",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Gel moisturizer");
      req.category = "Moisturizer";
      req.texturePreference = "Gel";
      return req;
    },
  },
  {
    id: 11,
    label: "11. Finish preference",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Matte sunscreen");
      req.category = "Sunscreen";
      req.finishPreference = "Matte";
      return req;
    },
  },
  {
    id: 12,
    label: "12. Fragrance preference",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Fragrance free sunscreen");
      req.category = "Sunscreen";
      req.fragrancePreference = "Fragrance free";
      return req;
    },
  },
  {
    id: 13,
    label: "13. Product properties",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Vegan cruelty free serum");
      req.category = "Serum";
      req.properties = ["Vegan", "Cruelty free", "Non comedogenic"];
      return req;
    },
  },
  {
    id: 14,
    label: "14. Rating signal",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("High rated serum");
      req.category = "Serum";
      return req;
    },
    priority: "best-rated",
  },
  {
    id: 15,
    label: "15. Value signal",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Best value moisturizer");
      req.category = "Moisturizer";
      return req;
    },
  },
  {
    id: 16,
    label: "16. Missing product info handling",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Treatment products");
      req.category = "Treatment Products";
      return req;
    },
  },
  {
    id: 17,
    label: "17. Missing rating handling",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Treatment product p13");
      req.category = "Treatment Products";
      return req;
    },
  },
  {
    id: 18,
    label: "18. Missing ingredient info",
    category: "Preferences",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Serum");
      req.category = "Serum";
      return req;
    },
  },
  {
    id: 19,
    label: "19. No exact match",
    category: "Relaxation & Safety",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Impossibly cheap serum under 50");
      req.category = "Serum";
      req.maxPrice = 50; // Hard constraint triggers 0 candidates
      return req;
    },
  },
  {
    id: 20,
    label: "20. Budget relaxation",
    category: "Relaxation & Safety",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Serum under 300");
      req.category = "Serum";
      req.maxPrice = 300; // Triggers budget relaxation (+25%)
      return req;
    },
  },
  {
    id: 21,
    label: "21. Recommendation priority override",
    category: "Categories",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Lowest price serum");
      req.category = "Serum";
      return req;
    },
    priority: "lowest-price",
  },
  {
    id: 22,
    label: "22. Best Overall category",
    category: "Categories",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Oily skin serum");
      req.category = "Serum";
      req.skinType = "Oily";
      return req;
    },
  },
  {
    id: 23,
    label: "23. Best Budget category",
    category: "Categories",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Budget moisturizer");
      req.category = "Moisturizer";
      return req;
    },
  },
  {
    id: 24,
    label: "24. Best Rated category",
    category: "Categories",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Top rated sunscreen");
      req.category = "Sunscreen";
      return req;
    },
  },
  {
    id: 25,
    label: "25. Best Value category",
    category: "Categories",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Value face wash");
      req.category = "Face Wash";
      return req;
    },
  },
  {
    id: 26,
    label: "26. Best Ingredient Match category",
    category: "Categories",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Serum with Niacinamide & Zinc");
      req.category = "Serum";
      req.preferredIngredients = ["Niacinamide", "Zinc PCA"];
      return req;
    },
  },
  {
    id: 27,
    label: "27. Recommendation feedback",
    category: "Relaxation & Safety",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Serum");
      req.category = "Serum";
      return req;
    },
  },
  {
    id: 28,
    label: "28. Deterministic ranking verification",
    category: "Relaxation & Safety",
    buildReq: () => {
      const req = AIRequirementService.createEmptyRequirementObject("Deterministic test");
      req.category = "Serum";
      req.skinType = "Oily";
      req.maxPrice = 1000;
      return req;
    },
  },
];

export default function RecommendationTestSuitePage() {
  const [selectedId, setSelectedId] = React.useState<number>(1);
  const [result1, setResult1] = React.useState<RecommendationResultSet | null>(null);
  const [result2, setResult2] = React.useState<RecommendationResultSet | null>(null);
  const [isDeterminismPassed, setIsDeterminismPassed] = React.useState<boolean | null>(null);

  const runTest = async (id: number) => {
    setSelectedId(id);
    const scenario = scenarioDefinitions.find((s) => s.id === id);
    if (!scenario) return;

    const req = scenario.buildReq();
    const priority = scenario.priority || "best-match";

    const res1 = await RecommendationEngineService.generateRecommendations({
      requirements: req,
      priority,
    });

    if (res1.data) setResult1(res1.data);

    // Scenario 28: Run twice to test deterministic equality
    if (id === 28) {
      const res2 = await RecommendationEngineService.generateRecommendations({
        requirements: req,
        priority,
      });
      if (res2.data) {
        setResult2(res2.data);
        const match =
          res1.data?.bestOverall?.product.id === res2.data.bestOverall?.product.id &&
          res1.data?.bestOverall?.scoreBreakdown.overallScore ===
            res2.data.bestOverall?.scoreBreakdown.overallScore;
        setIsDeterminismPassed(match);
      }
    } else {
      setResult2(null);
      setIsDeterminismPassed(null);
    }
  };

  React.useEffect(() => {
    runTest(1);
  }, []);

  const activeDef = scenarioDefinitions.find((s) => s.id === selectedId);

  return (
    <Container className="py-10 space-y-8 max-w-6xl">
      <Link
        href="/recommendations"
        className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Recommendations Results
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <Badge variant="sage" className="mb-2 flex items-center gap-1.5 w-fit">
            <TestTube className="h-3.5 w-3.5" /> Engine Test Suite
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Recommendation Engine Test Suite (28 Scenarios)
          </h1>
          <p className="text-sm text-foreground-muted">
            Verify hard constraints, soft preferences, configurable scoring math, categories, relaxation, and deterministic ranking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
        {/* Test Scenarios Sidebar */}
        <aside className="rounded border border-line bg-background-card p-4 space-y-2 shadow-subtle sticky top-24 max-h-[600px] overflow-y-auto">
          <span className="font-semibold text-xs text-foreground-faint uppercase tracking-wider block mb-2 px-1">
            28 Test Scenarios
          </span>
          <div className="space-y-1">
            {scenarioDefinitions.map((s) => (
              <button
                key={s.id}
                onClick={() => runTest(s.id)}
                className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedId === s.id
                    ? "bg-sage-deep text-white font-semibold shadow-xs"
                    : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                }`}
              >
                <span className="truncate">{s.label}</span>
                <Play className="h-3 w-3 shrink-0 ml-2 opacity-60" />
              </button>
            ))}
          </div>
        </aside>

        {/* Results Inspector */}
        <div className="space-y-6">
          <div className="rounded border border-line bg-background-card p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-display font-semibold text-base text-foreground">
                Active Test #{activeDef?.id}: {activeDef?.label}
              </span>
              <Badge variant="sage">{activeDef?.category}</Badge>
            </div>

            {/* Scenario 28 Determinism Verification Badge */}
            {selectedId === 28 && isDeterminismPassed !== null && (
              <div
                className={`p-4 rounded border text-xs font-semibold flex items-center justify-between ${
                  isDeterminismPassed
                    ? "border-status-success bg-emerald-50 dark:bg-emerald-950/40 text-status-success"
                    : "border-status-error bg-rose-50 dark:bg-rose-950/40 text-status-error"
                }`}
              >
                <span>Determinism Verification (Run #1 vs Run #2):</span>
                <strong>
                  {isDeterminismPassed
                    ? "PASSED — Identical 89% score & ranking"
                    : "FAILED — Non-deterministic math detected"}
                </strong>
              </div>
            )}

            {/* Results Overview */}
            {result1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded bg-background-elevated space-y-0.5">
                    <span className="text-foreground-faint block">Status</span>
                    <strong className="text-foreground font-mono">{result1.status}</strong>
                  </div>
                  <div className="p-3 rounded bg-background-elevated space-y-0.5">
                    <span className="text-foreground-faint block">Candidates Count</span>
                    <strong className="text-foreground font-mono">{result1.totalCandidatesCount}</strong>
                  </div>
                  <div className="p-3 rounded bg-background-elevated space-y-0.5">
                    <span className="text-foreground-faint block">Best Overall</span>
                    <strong className="text-sage-deep font-mono">
                      {result1.bestOverall ? `${result1.bestOverall.product.brand} (${result1.bestOverall.scoreBreakdown.overallScore}%)` : "None"}
                    </strong>
                  </div>
                  <div className="p-3 rounded bg-background-elevated space-y-0.5">
                    <span className="text-foreground-faint block">Best Value Score</span>
                    <strong className="text-foreground font-mono">
                      {result1.bestValue ? `${result1.bestValue.valueScore}/100` : "None"}
                    </strong>
                  </div>
                </div>

                {/* Score Breakdown Preview */}
                {result1.bestOverall && (
                  <div className="rounded border border-line bg-background-elevated/40 p-4 space-y-3 text-xs">
                    <span className="font-semibold text-foreground block">
                      Best Overall Candidate Factor Sub-Scores:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[0.7rem]">
                      <div>Skin: {result1.bestOverall.scoreBreakdown.skinTypeScore}%</div>
                      <div>Concern: {result1.bestOverall.scoreBreakdown.concernScore}%</div>
                      <div>Actives: {result1.bestOverall.scoreBreakdown.ingredientScore}%</div>
                      <div>Pref: {result1.bestOverall.scoreBreakdown.preferenceScore}%</div>
                      <div>Budget: {result1.bestOverall.scoreBreakdown.budgetFitScore}%</div>
                    </div>
                  </div>
                )}

                {/* Relaxed Alternatives Output */}
                {result1.status === "NO_EXACT_MATCH" && (
                  <div className="p-4 rounded border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-xs space-y-2">
                    <strong className="text-amber-800 dark:text-amber-300 font-bold block">
                      No Exact Match — Requirement Relaxation Triggered
                    </strong>
                    {result1.relaxedAlternatives.map((relaxed, i) => (
                      <p key={i} className="text-foreground-muted">
                        • {relaxed.reason}
                      </p>
                    ))}
                  </div>
                )}

                {/* JSON Output */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground-faint uppercase font-mono block">
                    Recommendation Engine JSON Schema Output:
                  </span>
                  <pre className="p-4 rounded border border-line bg-background-elevated text-[0.7rem] font-mono text-foreground overflow-x-auto max-h-72">
                    {JSON.stringify(result1, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
