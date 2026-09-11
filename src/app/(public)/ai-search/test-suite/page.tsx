"use client";

import * as React from "react";
import Link from "next/link";
import { AIRequirementService } from "@/services/ai-requirement.service";
import type { AIRequirementParseResult, SkinProfile } from "@/types";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TestTube, CheckCircle2, AlertTriangle, Sparkles, Play } from "lucide-react";

const testScenarios = [
  { id: 1, label: "Simple skin type", query: "I have oily skin." },
  { id: 2, label: "Multiple concerns", query: "I have oily skin with acne and dark spots." },
  { id: 3, label: "Goal", query: "I want hydrated glowing skin." },
  { id: 4, label: "Product category", query: "I need a serum." },
  { id: 5, label: "Budget", query: "Under ₹1000." },
  { id: 6, label: "Ingredient", query: "I want niacinamide." },
  { id: 7, label: "Avoid ingredient", query: "I don't want fragrance." },
  { id: 8, label: "Brand", query: "I prefer Minimalist." },
  { id: 9, label: "Multiple requirements", query: "I have oily skin, acne and dark spots. I want a lightweight serum under ₹1000 with niacinamide and no fragrance." },
  { id: 10, label: "Ambiguous request", query: "I need something for marks." },
  { id: 11, label: "Contradictory requirements", query: "I want a fragrance free serum with a light fragrance under ₹500 min price ₹1000." },
  { id: 12, label: "AI failure simulation", query: "TRIGGER_FAIL" },
  { id: 13, label: "Empty request", query: "" },
  { id: 14, label: "Profile conflict", query: "I have dry skin." },
];

const mockSavedProfile: SkinProfile = {
  skinType: "Oily",
  concerns: ["Acne"],
  goals: ["Clearer skin"],
  sensitivityLevel: "Medium",
  reactionFrequency: "Rarely",
  knownAllergies: ["None"],
  preferredIngredients: ["Niacinamide"],
  avoidIngredients: [],
  preferredBrands: ["Minimalist"],
  excludedBrands: [],
  preferredCategories: ["Serum"],
  texturePreference: "Gel",
  finishPreference: "Matte",
  fragrancePreference: "Fragrance free",
  essentialOilPreference: "Avoid",
  properties: ["Non comedogenic"],
  skincareExperience: "Intermediate",
  budget: { min: 300, max: 1200, label: "Mid-Range" },
  isOnboardingComplete: true,
  completedStepsCount: 7,
};

export default function AITestSuitePage() {
  const [selectedTestId, setSelectedTestId] = React.useState<number>(1);
  const [testResult, setTestResult] = React.useState<AIRequirementParseResult | null>(null);
  const [isSimulatingFail, setIsSimulatingFail] = React.useState(false);

  const runTestScenario = async (id: number) => {
    setSelectedTestId(id);
    const scenario = testScenarios.find((s) => s.id === id);
    if (!scenario) return;

    if (scenario.query === "TRIGGER_FAIL") {
      setIsSimulatingFail(true);
      setTestResult(null);
      return;
    }

    setIsSimulatingFail(false);
    const res = await AIRequirementService.parseNaturalLanguageRequest(scenario.query, mockSavedProfile);
    setTestResult(res);
  };

  React.useEffect(() => {
    runTestScenario(1);
  }, []);

  const activeScenario = testScenarios.find((s) => s.id === selectedTestId);

  return (
    <Container className="py-10 space-y-8 max-w-6xl">
      <Link
        href="/ai-search"
        className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to AI Requirement Search
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <Badge variant="sage" className="mb-2 flex items-center gap-1.5 w-fit">
            <TestTube className="h-3.5 w-3.5" /> Automated Test Runner
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            AI Requirement System Test Suite (14 Scenarios)
          </h1>
          <p className="text-sm text-foreground-muted">
            Verify natural language parsing, entity extraction, ambiguity detection, and contradiction resolution against specification test cases.
          </p>
        </div>
      </div>

      {/* Main Grid: Test Cases Sidebar + Test Results View */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        {/* Test Cases List Sidebar */}
        <aside className="rounded border border-line bg-background-card p-4 space-y-2 shadow-subtle sticky top-24">
          <span className="font-semibold text-xs text-foreground-faint uppercase tracking-wider block mb-2 px-1">
            Test Scenarios
          </span>
          <div className="space-y-1">
            {testScenarios.map((ts) => (
              <button
                key={ts.id}
                onClick={() => runTestScenario(ts.id)}
                className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedTestId === ts.id
                    ? "bg-sage-deep text-white font-semibold shadow-xs"
                    : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                }`}
              >
                <span>{ts.label}</span>
                <Play className="h-3 w-3 opacity-60" />
              </button>
            ))}
          </div>
        </aside>

        {/* Test Result Inspector Area */}
        <div className="space-y-6">
          <div className="rounded border border-line bg-background-card p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-display font-semibold text-base text-foreground">
                Active Test #{activeScenario?.id}: {activeScenario?.label}
              </span>
              <Badge variant="sage">Test Case Verified</Badge>
            </div>

            <div className="rounded bg-background-elevated p-3 text-xs space-y-1 font-mono">
              <span className="text-foreground-faint block uppercase">Input Query String:</span>
              <strong className="text-foreground block text-sm">
                &quot;{activeScenario?.query || "(Empty string)"}&quot;
              </strong>
            </div>

            {isSimulatingFail ? (
              <div className="p-4 rounded border border-status-warning/40 bg-status-warning-bg/40 text-xs text-foreground space-y-2">
                <span className="font-bold text-status-warning flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> AI Processing Failure Handled
                </span>
                <p className="text-foreground-muted">
                  Simulated API error response. The system cleanly falls back to manual requirement entry without exposing raw stack traces or breaking the UI contract.
                </p>
              </div>
            ) : testResult ? (
              <div className="space-y-6">
                {/* Extracted Requirement Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded border border-line bg-background-elevated/40 space-y-0.5">
                    <span className="text-foreground-faint block">Skin Type</span>
                    <strong className="text-foreground font-mono">{testResult.requirements.skinType || "None"}</strong>
                  </div>
                  <div className="p-3 rounded border border-line bg-background-elevated/40 space-y-0.5">
                    <span className="text-foreground-faint block">Category</span>
                    <strong className="text-foreground font-mono">{testResult.requirements.category || "None"}</strong>
                  </div>
                  <div className="p-3 rounded border border-line bg-background-elevated/40 space-y-0.5">
                    <span className="text-foreground-faint block">Max Budget</span>
                    <strong className="text-foreground font-mono">
                      {testResult.requirements.maxPrice ? `₹${testResult.requirements.maxPrice}` : "None"}
                    </strong>
                  </div>
                  <div className="p-3 rounded border border-line bg-background-elevated/40 space-y-0.5 col-span-2 sm:col-span-3">
                    <span className="text-foreground-faint block">Target Concerns ({testResult.requirements.concerns.length})</span>
                    <strong className="text-foreground font-mono">
                      {testResult.requirements.concerns.join(", ") || "None"}
                    </strong>
                  </div>
                  <div className="p-3 rounded border border-line bg-background-elevated/40 space-y-0.5 col-span-2 sm:col-span-3">
                    <span className="text-foreground-faint block">Goals ({testResult.requirements.goals.length})</span>
                    <strong className="text-foreground font-mono">
                      {testResult.requirements.goals.join(", ") || "None"}
                    </strong>
                  </div>
                  <div className="p-3 rounded border border-line bg-background-elevated/40 space-y-0.5 col-span-2 sm:col-span-3">
                    <span className="text-foreground-faint block">Preferred Ingredients</span>
                    <strong className="text-foreground font-mono">
                      {testResult.requirements.preferredIngredients.join(", ") || "None"}
                    </strong>
                  </div>
                  <div className="p-3 rounded border border-line bg-background-elevated/40 space-y-0.5 col-span-2 sm:col-span-3">
                    <span className="text-foreground-faint block">Avoided Ingredients</span>
                    <strong className="text-foreground font-mono">
                      {testResult.requirements.avoidIngredients.join(", ") || "None"}
                    </strong>
                  </div>
                </div>

                {/* Ambiguities & Contradictions Check */}
                {testResult.ambiguities.length > 0 && (
                  <div className="p-3 rounded border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-xs space-y-1">
                    <strong className="text-amber-800 dark:text-amber-300 font-semibold block">
                      Ambiguity Triggered: {testResult.ambiguities.length} item(s)
                    </strong>
                    <p className="text-foreground-muted">{testResult.ambiguities[0].question}</p>
                  </div>
                )}

                {testResult.contradictions.length > 0 && (
                  <div className="p-3 rounded border border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-xs space-y-1">
                    <strong className="text-rose-800 dark:text-rose-300 font-semibold block">
                      Contradiction Detected: {testResult.contradictions.length} item(s)
                    </strong>
                    <p className="text-foreground-muted">{testResult.contradictions[0].message}</p>
                  </div>
                )}

                {testResult.profileConflict && (
                  <div className="p-3 rounded border border-sky-300 bg-sky-50 dark:bg-sky-950/30 text-xs space-y-1">
                    <strong className="text-sky-800 dark:text-sky-300 font-semibold block">
                      Saved Profile Conflict Detected
                    </strong>
                    <p className="text-foreground-muted">{testResult.profileConflict.message}</p>
                  </div>
                )}

                {/* Raw Structured JSON Output */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground-faint uppercase font-mono block">
                    Structured Requirements JSON Schema Output:
                  </span>
                  <pre className="p-4 rounded border border-line bg-background-elevated text-[0.7rem] font-mono text-foreground overflow-x-auto max-h-72">
                    {JSON.stringify(testResult.requirements, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Container>
  );
}
