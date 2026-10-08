"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AIRequirementService } from "@/services/ai-requirement.service";
import { ProductService } from "@/services/product.service";
import { useSkinProfile } from "@/context/skin-profile-context";
import type {
  StructuredSkincareRequirement,
  AIRequirementParseResult,
  AmbiguityClarification,
  ContradictionConflict,
  SkinType,
  Product,
} from "@/types";
import { Container } from "@/components/layout/container";
import { EditableRequirementCard } from "@/components/ai-requirement/editable-requirement-card";
import { ManualRequirementForm } from "@/components/ai-requirement/manual-requirement-form";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  Info,
  Sliders,
  ShieldCheck,
} from "lucide-react";

const examplePrompts = [
  "I have oily skin and acne. I want a lightweight serum under ₹1000 with niacinamide and no fragrance.",
  "I have dry skin and want a hydrating moisturizer under ₹800.",
  "Find a fragrance free sunscreen for sensitive skin under ₹1200.",
];

const loadingSteps = [
  "Understanding your request...",
  "Checking skincare requirements & entities...",
  "Structuring your preferences & validating constraints...",
  "Preparing your requirement confirmation...",
];

const skinTypeGuidance: Record<SkinType, { routine: string; ingredients: string[] }> = {
  Oily: {
    routine: "Start with a gentle cleanser, a lightweight non-comedogenic moisturizer, and sunscreen every morning. Avoid over-cleansing or using too many strong actives at once.",
    ingredients: ["Niacinamide for oil balance", "Salicylic acid for clogged pores", "Lightweight gel moisturizers"],
  },
  Dry: {
    routine: "Focus on a gentle cleanser, a barrier-supporting moisturizer, and sunscreen every morning. Keep exfoliation gentle and infrequent if your skin feels tight or flaky.",
    ingredients: ["Ceramides for barrier support", "Hyaluronic acid for hydration", "Glycerin for moisture"],
  },
  Combination: {
    routine: "Use gentle, balanced products. You can use lightweight hydration overall and target oilier areas only where needed instead of drying the whole face.",
    ingredients: ["Niacinamide for balance", "Hyaluronic acid for hydration", "Gentle non-stripping cleansers"],
  },
  Sensitive: {
    routine: "Keep the routine simple: gentle cleanser, fragrance-free moisturizer, and sunscreen. Introduce only one new product at a time and patch-test it first.",
    ingredients: ["Ceramides for barrier support", "Glycerin for hydration", "Fragrance-free formulas"],
  },
  Normal: {
    routine: "Maintain a simple routine: gentle cleanser, moisturizer, and sunscreen. Add targeted products only for a specific cosmetic concern.",
    ingredients: ["Antioxidants such as vitamin C", "Niacinamide", "Daily broad-spectrum sunscreen"],
  },
};

function getAssistantReply(requirement: StructuredSkincareRequirement) {
  const guide = requirement.skinType ? skinTypeGuidance[requirement.skinType] : null;
  const concerns = requirement.concerns.length ? ` For ${requirement.concerns.join(", ").toLowerCase()}, choose one targeted product and introduce it gradually.` : "";
  return {
    summary: guide?.routine || "A simple starting routine is a gentle cleanser, a moisturizer that suits your skin, and sunscreen every morning. Add one targeted product only after the basics feel comfortable.",
    ingredients: requirement.preferredIngredients.length ? requirement.preferredIngredients : guide?.ingredients || ["Choose products suited to your skin type", "Use daily sunscreen", "Patch-test new products"],
    concernNote: concerns,
  };
}

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
  const [matchedProducts, setMatchedProducts] = React.useState<Product[]>([]);

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
    const filters = {
      ...(res.requirements.skinType ? { skinTypes: [res.requirements.skinType] } : {}),
      ...(res.requirements.concerns.length ? { skinConcerns: res.requirements.concerns } : {}),
      ...(res.requirements.category ? { category: res.requirements.category } : {}),
      ...(res.requirements.maxPrice !== null ? { maxPrice: res.requirements.maxPrice } : {}),
      pageSize: 6,
      sortBy: "compatibility" as const,
    };
    let productResponse = await ProductService.getProducts(filters);
    // A broad skin-type search is more helpful than an empty result when the
    // catalog does not yet contain every specific concern/category combination.
    if (!productResponse.data?.products.length && res.requirements.skinType) {
      productResponse = await ProductService.getProducts({ skinTypes: [res.requirements.skinType], pageSize: 6, sortBy: "compatibility" });
    }
    setMatchedProducts(productResponse.data?.products || []);
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
    setMatchedProducts([]);
    setMode("input");
  };

  return (
    <Container className="py-6 md:py-8 space-y-6 max-w-5xl">
      <section className="overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(circle_at_top_right,rgba(215,188,141,0.28),transparent_32%),linear-gradient(135deg,rgba(250,244,234,0.96),rgba(255,255,255,0.96),rgba(230,240,229,0.72))] p-6 shadow-subtle dark:bg-[radial-gradient(circle_at_top_right,rgba(161,124,68,0.2),transparent_35%),linear-gradient(135deg,rgba(32,35,34,0.98),rgba(29,31,30,0.98),rgba(38,48,41,0.92))] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full border border-champagne-deep/20 bg-background-card/75 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-champagne-deep shadow-sm"><Sparkles className="h-4 w-4" /> AI Match</div><h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Tell us what your skin needs.</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground-muted sm:text-base">Ask a real question in English, Hindi, or Hinglish. Describe your skin, concern, budget or product type—and BeautyIQ will turn it into a clear product search.</p></div><Button variant="outline" size="sm" leftIcon={<Sliders className="h-4 w-4" />} onClick={() => setMode("manual")}>Manual form</Button></div>
        <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full border border-line bg-background-card/80 px-3 py-1.5 text-xs font-medium text-foreground-muted">Ask naturally</span><span className="rounded-full border border-line bg-background-card/80 px-3 py-1.5 text-xs font-medium text-foreground-muted">English · Hindi · Hinglish</span><span className="rounded-full border border-line bg-background-card/80 px-3 py-1.5 text-xs font-medium text-foreground-muted">Catalog-based matches</span></div>
      </section>

      {/* Non-Medical Disclaimer (Requirement #23) */}
      <div className="rounded border border-line bg-background-card p-3.5 text-xs text-foreground-muted flex items-start gap-2.5 shadow-subtle">
        <ShieldCheck className="h-4 w-4 text-sage-deep shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground font-semibold">Skincare Product Matching Disclaimer:</strong> BeautyIQ extracts product parameters for cosmetic suitability matching. It does not provide medical diagnosis, prescribe drugs, or claim to cure skin conditions.
        </div>
      </div>

      {/* Main Input State */}
      {mode === "input" && (
        <div className="rounded-3xl border border-line bg-background-card p-4 shadow-lg sm:p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm"><Sparkles className="h-4 w-4 text-champagne" /></div>
            <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-background-elevated px-4 py-3 text-sm leading-relaxed text-foreground-muted">Hi, I&apos;m BeautyIQ. Tell me what you want help with—your concern, skin type, budget or the type of product you need.</div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-display font-semibold text-foreground">
              Your message
            </label>
            <Textarea
              rows={4}
              placeholder="Tell BeautyIQ what you're looking for... (e.g., 'I have oily skin and acne. I want a lightweight serum under ₹1000 with niacinamide and no fragrance.')"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="text-sm leading-relaxed"
            />
          </div>

          {/* Suggested prompts */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-faint block">
              Suggested questions
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
              Understand my request
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
          {(() => {
            const reply = getAssistantReply(requirement);
            const guidance = parseResult?.aiGuidance?.length
              ? parseResult.aiGuidance
              : [reply.summary + reply.concernNote, ...reply.ingredients];
            return (
              <section className="rounded-3xl border border-line bg-background-card p-5 shadow-subtle sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background"><Sparkles className="h-4 w-4 text-champagne" /></div>
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed text-foreground"><strong>Based on what you asked, here&apos;s a tailored cosmetic-care direction.</strong></p>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-champagne-deep">BeautyIQ&apos;s suggestions</p>
                      <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-foreground-muted sm:grid-cols-3">
                        {guidance.slice(0, 3).map((item) => <li key={item} className="rounded-xl bg-background-elevated px-3 py-2.5">{item}</li>)}
                      </ul>
                    </div>
                    <p className="text-xs text-foreground-faint">This is cosmetic product guidance, not a diagnosis. For persistent, painful, or severe skin symptoms, consult a dermatologist.</p>
                  </div>
                </div>
              </section>
            );
          })()}

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-champagne-deep">Matching products</p><h2 className="mt-1 font-display text-2xl font-bold text-foreground">Products from the BeautyIQ catalog</h2></div><span className="text-xs text-foreground-muted">Retailer buttons open the available listing directly.</span></div>
            {matchedProducts.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{matchedProducts.map((product) => <ProductCard key={product.id} product={product} returnTo="/ai-search" />)}</div> : <div className="rounded-2xl border border-line bg-background-card p-5 text-sm text-foreground-muted">No catalog product matches every filter yet. Try removing a budget, category, or ingredient condition.</div>}
          </section>

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
