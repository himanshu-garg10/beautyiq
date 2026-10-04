"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AIRequirementService } from "@/services/ai-requirement.service";
import { useSkinProfile } from "@/context/skin-profile-context";
import type {
  StructuredSkincareRequirement,
  AIRequirementParseResult,
  AmbiguityClarification,
  ContradictionConflict,
  SkinType,
} from "@/types";
import { Container } from "@/components/layout/container";
import { EditableRequirementCard } from "@/components/ai-requirement/editable-requirement-card";
import { ManualRequirementForm } from "@/components/ai-requirement/manual-requirement-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Info,
  Sliders,
  ShieldCheck,
  FlaskConical,
  TestTube,
} from "lucide-react";

const examplePrompts = [
  "I have oily skin and acne. I want a lightweight serum under ₹1000 with niacinamide and no fragrance.",
  "I have dry skin and want a hydrating moisturizer under ₹800.",
  "I have oily skin with acne and want a lightweight serum.",
  "Find a fragrance free sunscreen for sensitive skin under ₹1200.",
  "I need something for marks.", // Ambiguity test
  "I want a fragrance free serum with a light fragrance.", // Contradiction test
];

const testScenarios = [
  { label: "1. Simple skin type", query: "I have oily skin." },
  { label: "2. Multiple concerns", query: "I have oily skin with acne and dark spots." },
  { label: "3. Goal", query: "I want hydrated glowing skin." },
  { label: "4. Product category", query: "I need a serum." },
  { label: "5. Budget", query: "Under ₹1000." },
  { label: "6. Ingredient", query: "I want niacinamide." },
  { label: "7. Avoid ingredient", query: "I don't want fragrance." },
  { label: "8. Brand", query: "I prefer Minimalist." },
  { label: "9. Complex multi-requirement", query: "I have oily skin, acne and dark spots. I want a lightweight serum under ₹1000 with niacinamide and no fragrance." },
  { label: "10. Ambiguous request", query: "I need something for marks." },
  { label: "11. Contradictory requirements", query: "I want a fragrance free serum with a light fragrance under ₹500 min price ₹1000." },
  { label: "12. AI Failure simulation", query: "TRIGGER_FAIL" },
  { label: "13. Empty request", query: "" },
  { label: "14. Profile Conflict test", query: "I have dry skin." },
];

const loadingSteps = [
  "Understanding your request...",
  "Checking skincare requirements & entities...",
  "Structuring your preferences & validating constraints...",
  "Preparing your requirement confirmation...",
];

function AISearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useSkinProfile();

  const [queryText, setQueryText] = React.useState(searchParams?.get("q") || "");
  const [mode, setMode] = React.useState<"input" | "processing" | "result" | "manual" | "error">("input");
  const [loadingStepIndex, setLoadingStepIndex] = React.useState(0);

  const [parseResult, setParseResult] = React.useState<AIRequirementParseResult | null>(null);
  const [requirement, setRequirement] = React.useState<StructuredSkincareRequirement | null>(null);
  const [resolvedAmbiguities, setResolvedAmbiguities] = React.useState<Record<string, boolean>>({});
  const [resolvedContradictions, setResolvedContradictions] = React.useState<Record<string, boolean>>({});
  const [resolvedProfileConflict, setResolvedProfileConflict] = React.useState<boolean>(false);
  const [showTestSuite, setShowTestSuite] = React.useState(false);

  const handleAnalyze = React.useCallback(async (textToParse: string) => {
    if (textToParse === "TRIGGER_FAIL") {
      setMode("processing");
      setLoadingStepIndex(0);
      setTimeout(() => {
        setMode("error");
      }, 800);
      return;
    }

    setMode("processing");
    setLoadingStepIndex(0);

    // Multi-step loading experience simulation
    for (let i = 0; i < loadingSteps.length; i++) {
      setLoadingStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    const res = await AIRequirementService.parseNaturalLanguageRequest(textToParse, profile);
    setParseResult(res);
    setRequirement(res.requirements);
    setResolvedAmbiguities({});
    setResolvedContradictions({});
    setResolvedProfileConflict(false);
    setMode("result");
  }, [profile]);

  const handleSelectAmbiguityOption = (
    ambiguity: AmbiguityClarification,
    option: { label: string; field: string; value: any }
  ) => {
    if (!requirement) return;

    if (option.field === "concerns") {
      const updatedConcerns = Array.from(new Set([...requirement.concerns, option.value]));
      setRequirement({ ...requirement, concerns: updatedConcerns });
    } else if (option.field === "category") {
      setRequirement({ ...requirement, category: option.value });
    }

    setResolvedAmbiguities((prev) => ({ ...prev, [ambiguity.term]: true }));
  };

  const handleResolveContradiction = (
    contradiction: ContradictionConflict,
    action: "keepA" | "keepB" | "clearBoth"
  ) => {
    if (!requirement) return;

    if (contradiction.id === "c_fragrance") {
      if (action === "keepA") {
        setRequirement({
          ...requirement,
          avoidIngredients: Array.from(new Set([...requirement.avoidIngredients, "Fragrance"])),
          fragrancePreference: "Fragrance free",
        });
      } else if (action === "keepB") {
        setRequirement({
          ...requirement,
          avoidIngredients: requirement.avoidIngredients.filter((i) => i !== "Fragrance"),
          fragrancePreference: "Light fragrance",
        });
      } else {
        setRequirement({
          ...requirement,
          avoidIngredients: requirement.avoidIngredients.filter((i) => i !== "Fragrance"),
          fragrancePreference: null,
        });
      }
    } else if (contradiction.id === "c_budget") {
      if (action === "keepA") {
        setRequirement({ ...requirement, maxPrice: null });
      } else if (action === "keepB") {
        setRequirement({ ...requirement, minPrice: null });
      } else {
        setRequirement({ ...requirement, minPrice: null, maxPrice: null });
      }
    }

    setResolvedContradictions((prev) => ({ ...prev, [contradiction.id]: true }));
  };

  const handleResolveProfileConflict = (useSaved: boolean) => {
    if (!requirement || !profile) return;
    if (useSaved) {
      setRequirement({ ...requirement, skinType: profile.skinType });
    }
    setResolvedProfileConflict(true);
  };

  const hasAutoTriggered = React.useRef(false);
  React.useEffect(() => {
    const qParam = searchParams?.get("q");
    if (qParam && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;
      setQueryText(qParam);
      handleAnalyze(qParam);
    }
  }, [searchParams, handleAnalyze]);

  const handleConfirmAndProceed = () => {
    if (!requirement) return;
    // Persist confirmed requirement session
    AIRequirementService.saveConfirmedSession(requirement);
    // Navigate to products catalog or search with requirement state
    const params = new URLSearchParams();
    if (requirement.category) params.set("category", requirement.category);
    if (requirement.skinType) params.set("skinType", requirement.skinType);
    if (requirement.maxPrice) params.set("maxPrice", requirement.maxPrice.toString());
    if (requirement.concerns.length > 0) params.set("q", requirement.concerns[0]);

    router.push(`/products?${params.toString()}`);
  };

  const handleGoToRecommendations = () => {
    if (!requirement) return;
    AIRequirementService.saveConfirmedSession(requirement);
    router.push("/recommendations");
  };

  const handleStartOver = () => {
    setQueryText("");
    setParseResult(null);
    setRequirement(null);
    setMode("input");
  };

  return (
    <Container className="py-10 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <Badge variant="sage" className="mb-2 flex items-center gap-1.5 w-fit">
            <Sparkles className="h-3.5 w-3.5" /> BeautyIQ AI Requirement Assistant
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Skincare Natural Language Requirements
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Describe what your skin needs in your own words. BeautyIQ structures your requirements before matching products.
          </p>
          <p className="mt-2 text-xs text-foreground-faint">
            AI helps understand your request; verified catalog and ingredient data determine the final ranking. Do not enter medical records or sensitive personal information.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<TestTube className="h-4 w-4 text-sage-deep" />}
            onClick={() => setShowTestSuite(!showTestSuite)}
          >
            {showTestSuite ? "Hide Test Suite" : "Run Test Suite (14 Scenarios)"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Sliders className="h-4 w-4" />}
            onClick={() => setMode("manual")}
          >
            Manual Form
          </Button>
        </div>
      </div>

      {/* Non-Medical Disclaimer (Requirement #23) */}
      <div className="rounded border border-line bg-background-card p-3.5 text-xs text-foreground-muted flex items-start gap-2.5 shadow-subtle">
        <ShieldCheck className="h-4 w-4 text-sage-deep shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground font-semibold">Skincare Product Matching Disclaimer:</strong> BeautyIQ extracts product parameters for cosmetic suitability matching. It does not provide medical diagnosis, prescribe drugs, or claim to cure skin conditions.
        </div>
      </div>

      {/* Interactive Test Suite Panel (Requirement #30) */}
      {showTestSuite && (
        <div className="rounded-lg border border-sage-deep/40 bg-sage-tint/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-sage-deep flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Requirement Extraction Test Suite (Requirement #30)
            </span>
            <span className="text-xs font-mono text-foreground-faint">14 Test Cases</span>
          </div>
          <p className="text-xs text-foreground-muted">
            Click any test scenario below to verify natural language parsing, entity extraction, ambiguity resolution, and error handling.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {testScenarios.map((ts, index) => (
              <button
                key={index}
                onClick={() => {
                  setQueryText(ts.query);
                  handleAnalyze(ts.query);
                }}
                className="px-3 py-1.5 rounded bg-background-card border border-line hover:border-sage-deep hover:text-sage-deep text-xs font-medium text-foreground transition-all shadow-2xs"
              >
                {ts.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input State */}
      {mode === "input" && (
        <div className="rounded-lg border border-line bg-background-card p-6 shadow-md space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-display font-semibold text-foreground">
              Describe Your Skincare Needs
            </label>
            <Textarea
              rows={4}
              placeholder="Tell BeautyIQ what you're looking for... (e.g., 'I have oily skin and acne. I want a lightweight serum under ₹1000 with niacinamide and no fragrance.')"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="text-sm leading-relaxed"
            />
          </div>

          {/* Example Prompts (Requirement #2) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-faint block">
              Try Example Skincare Prompts:
            </span>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQueryText(prompt);
                    handleAnalyze(prompt);
                  }}
                  className="text-xs text-foreground-muted bg-background-elevated hover:bg-sage-tint hover:text-sage-deep px-3 py-1.5 rounded border border-line/60 transition-all text-left"
                >
                  &quot;{prompt}&quot;
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setMode("manual")}
              className="text-xs font-semibold text-sage-deep hover:underline"
            >
              Prefer entering requirements manually?
            </button>

            <Button
              variant="accent"
              size="lg"
              disabled={!queryText.trim()}
              onClick={() => handleAnalyze(queryText)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Analyze &amp; Structure Requirements
            </Button>
          </div>
        </div>
      )}

      {/* Loading & Processing Animation (Requirement #20) */}
      {mode === "processing" && (
        <div className="rounded-lg border border-line bg-background-card p-12 text-center space-y-6 shadow-md">
          <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-sage-tint border-t-sage-deep animate-spin" />
            <Sparkles className="h-6 w-6 text-sage-deep" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-foreground">
              {loadingSteps[loadingStepIndex]}
            </h3>
            <p className="text-xs text-foreground-muted font-mono">
              Running BeautyIQ NLP Normalization &amp; Constraint Validation...
            </p>
          </div>

          <div className="max-w-md mx-auto h-2 bg-background-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-deep transition-all duration-300"
              style={{ width: `${((loadingStepIndex + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* AI Failure Handling Fallback (Requirement #19) */}
      {mode === "error" && (
        <div className="rounded-lg border border-status-warning/40 bg-status-warning-bg/40 p-8 text-center space-y-4 shadow-subtle">
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold text-foreground">
              BeautyIQ couldn&apos;t process your request right now
            </h3>
            <p className="text-xs text-foreground-muted max-w-md mx-auto">
              Our automated natural language processing engine encountered an unexpected formatting issue. You can continue seamlessly using our manual requirement form.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="outline" onClick={handleStartOver}>
              Try Different Query
            </Button>
            <Button variant="accent" onClick={() => setMode("manual")}>
              Continue with Manual Requirements
            </Button>
          </div>
        </div>
      )}

      {/* Manual Requirements Form (Requirement #18) */}
      {mode === "manual" && (
        <ManualRequirementForm
          initialRequirement={requirement}
          onSubmit={(manualReq) => {
            setRequirement(manualReq);
            setMode("result");
          }}
          onCancel={() => setMode("input")}
        />
      )}

      {/* Structured Result & Customer Confirmation Interface (Requirement #13, #15, #16, #24) */}
      {mode === "result" && requirement && (
        <div className="space-y-6">
          {/* Medical Safety Notice (when clinical conditions like eczema/cystic acne detected) */}
          {parseResult?.medicalSafety?.hasClinicalConditions && (
            <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 space-y-2 shadow-subtle">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Dermatological &amp; Medical Safety Notice
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                {parseResult.medicalSafety.safetyDisclaimer}
              </p>
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                Recommended Action: {parseResult.medicalSafety.recommendedAction}
              </p>
            </div>
          )}

          {/* Ambiguity Clarification Modal/Card (Requirement #13) */}
          {parseResult?.ambiguities.map((amb) => (
            !resolvedAmbiguities[amb.term] ? (
              <div
                key={amb.term}
                className="rounded-lg border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-5 space-y-3"
              >
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
                  <HelpCircle className="h-4 w-4" /> Ambiguity Clarification Needed
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {amb.question}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {amb.options.map((opt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAmbiguityOption(amb, opt)}
                    >
                      ○ {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null
          ))}

          {/* Contradiction Resolution Modal/Card (Requirement #15) */}
          {parseResult?.contradictions.map((c) => (
            !resolvedContradictions[c.id] ? (
              <div
                key={c.id}
                className="rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-5 space-y-3"
              >
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-sm">
                  <AlertTriangle className="h-4 w-4" /> Contradiction Detected
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {c.message}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {c.resolutionOptions.map((opt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveContradiction(c, opt.action)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null
          ))}

          {/* Profile Conflict Card (Requirement #24) */}
          {parseResult?.profileConflict && !resolvedProfileConflict && (
            <div className="rounded-lg border border-sky-300 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/30 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-semibold text-sm">
                <Info className="h-4 w-4" /> Profile Context Distinction
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                {parseResult.profileConflict.message}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResolveProfileConflict(false)}
                >
                  Use Current Search Request ({parseResult.profileConflict.querySkinType})
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => handleResolveProfileConflict(true)}
                >
                  Use Saved Profile ({parseResult.profileConflict.savedSkinType})
                </Button>
              </div>
            </div>
          )}

          {/* Main Interactive Confirmation Card (Requirement #16 & #17) */}
          <EditableRequirementCard
            requirement={requirement}
            onChange={(updated) => setRequirement(updated)}
            onConfirm={handleConfirmAndProceed}
            onViewRecommendations={handleGoToRecommendations}
            onReset={handleStartOver}
            onSwitchToManual={() => setMode("manual")}
          />

          {/* Step Log Inspection (Dev/Audit info) */}
          {parseResult?.stepLogs && (
            <div className="rounded border border-line bg-background-elevated/40 p-4 text-[0.7rem] font-mono text-foreground-faint space-y-1">
              <span className="font-bold text-foreground block uppercase mb-1">NLP Extraction Trace</span>
              {parseResult.stepLogs.map((log, i) => (
                <div key={i}>• {log}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </Container>
  );
}

export default function AISearchPage() {
  return (
    <React.Suspense
      fallback={
        <Container className="py-16 text-center text-sm text-foreground-muted">
          <div className="h-48 rounded border border-line bg-background-card animate-pulse max-w-xl mx-auto flex items-center justify-center">
            Initializing AI Requirement Assistant...
          </div>
        </Container>
      }
    >
      <AISearchContent />
    </React.Suspense>
  );
}
