"use client";

import * as React from "react";
import type {
  StructuredSkincareRequirement,
  SkinType,
  DetailedSkinConcern,
  DetailedSkinGoal,
  RoutineStep,
  TexturePreference,
  FinishPreference,
  FragrancePreference,
  ProductProperty,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pills } from "@/components/ui/pills";
import { Sliders, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { AIRequirementService } from "@/services/ai-requirement.service";

interface ManualRequirementFormProps {
  initialRequirement?: StructuredSkincareRequirement | null;
  onSubmit: (requirement: StructuredSkincareRequirement) => void;
  onCancel?: () => void;
}

const skinTypePills = [
  { id: "Oily", label: "Oily" },
  { id: "Dry", label: "Dry" },
  { id: "Combination", label: "Combination" },
  { id: "Sensitive", label: "Sensitive" },
  { id: "Normal", label: "Normal" },
];

const concernPills = [
  { id: "Acne", label: "Acne" },
  { id: "Pimples", label: "Pimples" },
  { id: "Blackheads", label: "Blackheads" },
  { id: "Whiteheads", label: "Whiteheads" },
  { id: "Dark spots", label: "Dark Spots" },
  { id: "Acne marks", label: "Acne Marks" },
  { id: "Hyperpigmentation", label: "Hyperpigmentation" },
  { id: "Uneven skin tone", label: "Uneven Tone" },
  { id: "Dryness", label: "Dryness" },
  { id: "Dehydration", label: "Dehydration" },
  { id: "Excess oil", label: "Excess Oil" },
  { id: "Dullness", label: "Dullness" },
  { id: "Redness", label: "Redness" },
  { id: "Rough texture", label: "Rough Texture" },
  { id: "Visible pores", label: "Visible Pores" },
  { id: "Fine lines", label: "Fine Lines" },
  { id: "Tanning", label: "Tanning" },
  { id: "Dark circles", label: "Dark Circles" },
  { id: "Under eye puffiness", label: "Under Eye Puffiness" },
  { id: "Uneven texture", label: "Uneven Texture" },
];

const goalPills = [
  { id: "Clearer skin", label: "Clearer Skin" },
  { id: "Glow", label: "Radiant Glow" },
  { id: "Even skin tone", label: "Even Tone" },
  { id: "Hydration", label: "Hydration" },
  { id: "Oil control", label: "Oil Control" },
  { id: "Smoother texture", label: "Smoother Texture" },
  { id: "Reduced appearance of pores", label: "Shrink Pores" },
  { id: "Maintain healthy looking skin", label: "Barrier Care" },
];

const categoryOptions = [
  { value: "", label: "All Categories / Any" },
  { value: "Face Wash", label: "Face Wash" },
  { value: "Cleanser", label: "Cleanser" },
  { value: "Serum", label: "Serum" },
  { value: "Moisturizer", label: "Moisturizer" },
  { value: "Sunscreen", label: "Sunscreen" },
  { value: "Toner", label: "Toner" },
  { value: "Exfoliator", label: "Exfoliator" },
  { value: "Acne Focused Products", label: "Acne Focused Products" },
  { value: "Face Masks", label: "Face Masks" },
  { value: "Lip Care", label: "Lip Care" },
  { value: "Eye Care", label: "Eye Care" },
  { value: "Treatment Products", label: "Treatment Products" },
];

const propertyPills = [
  { id: "Lightweight", label: "Lightweight" },
  { id: "Non sticky", label: "Non-Sticky" },
  { id: "Fast absorbing", label: "Fast Absorbing" },
  { id: "Fragrance free", label: "Fragrance-Free" },
  { id: "Alcohol free", label: "Alcohol-Free" },
  { id: "Non comedogenic", label: "Non-Comedogenic" },
  { id: "Vegan", label: "Vegan" },
  { id: "Cruelty free", label: "Cruelty-Free" },
  { id: "Dermatologically tested", label: "Dermatologically Tested" },
];

export function ManualRequirementForm({
  initialRequirement,
  onSubmit,
  onCancel,
}: ManualRequirementFormProps) {
  const [req, setReq] = React.useState<StructuredSkincareRequirement>(
    initialRequirement || AIRequirementService.createEmptyRequirementObject("Manual Requirements Entry")
  );

  const toggleSkinType = (id: string) => {
    setReq((prev) => ({
      ...prev,
      skinType: prev.skinType === id ? null : (id as SkinType),
    }));
  };

  const toggleConcern = (id: string) => {
    const c = id as DetailedSkinConcern;
    setReq((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(c)
        ? prev.concerns.filter((item) => item !== c)
        : [...prev.concerns, c],
    }));
  };

  const toggleGoal = (id: string) => {
    const g = id as DetailedSkinGoal;
    setReq((prev) => ({
      ...prev,
      goals: prev.goals.includes(g)
        ? prev.goals.filter((item) => item !== g)
        : [...prev.goals, g],
    }));
  };

  const toggleProperty = (id: string) => {
    const p = id as ProductProperty;
    setReq((prev) => ({
      ...prev,
      properties: prev.properties.includes(p)
        ? prev.properties.filter((item) => item !== p)
        : [...prev.properties, p],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(req);
  };

  const handleReset = () => {
    setReq(AIRequirementService.createEmptyRequirementObject("Manual Requirements Entry"));
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-background-card p-6 shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <Badge variant="sage" className="mb-1 flex items-center gap-1 w-fit">
            <Sliders className="h-3 w-3" /> Manual Requirement Entry
          </Badge>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Structure Your Skincare Requirements Manually
          </h2>
          <p className="text-xs text-foreground-muted">
            Configure your exact skin type, target concerns, goals, budget, and active ingredient preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-foreground-faint hover:text-sage-deep flex items-center gap-1 font-medium"
        >
          <RotateCcw className="h-3 w-3" /> Reset Form
        </button>
      </div>

      <div className="space-y-6 text-xs">
        {/* Skin Type */}
        <div className="space-y-2">
          <span className="font-semibold uppercase tracking-wider text-foreground-muted block">
            1. Select Your Primary Skin Type
          </span>
          <Pills
            options={skinTypePills}
            selectedIds={req.skinType ? [req.skinType] : []}
            onToggle={toggleSkinType}
            size="md"
          />
        </div>

        {/* Routine Category & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <span className="font-semibold uppercase tracking-wider text-foreground-muted block mb-1.5">
              2. Target Product Category
            </span>
            <Select
              options={categoryOptions}
              value={req.category || ""}
              onChange={(e) =>
                setReq({
                  ...req,
                  category: (e.target.value as RoutineStep) || null,
                })
              }
            />
          </div>

          <div>
            <span className="font-semibold uppercase tracking-wider text-foreground-muted block mb-1.5">
              3. Maximum Price Budget Cap (₹)
            </span>
            <Input
              type="number"
              placeholder="e.g. 1000"
              value={req.maxPrice ?? ""}
              onChange={(e) =>
                setReq({
                  ...req,
                  maxPrice: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
            />
          </div>
        </div>

        {/* Skin Concerns */}
        <div className="space-y-2 pt-2 border-t border-line">
          <span className="font-semibold uppercase tracking-wider text-foreground-muted block">
            4. Target Skin Concerns (Select all that apply)
          </span>
          <Pills
            options={concernPills}
            selectedIds={req.concerns}
            onToggle={toggleConcern}
            size="sm"
          />
        </div>

        {/* Skincare Goals */}
        <div className="space-y-2 pt-2 border-t border-line">
          <span className="font-semibold uppercase tracking-wider text-foreground-muted block">
            5. Primary Skincare Goals
          </span>
          <Pills
            options={goalPills}
            selectedIds={req.goals}
            onToggle={toggleGoal}
            size="sm"
          />
        </div>

        {/* Active Ingredients & Avoided Ingredients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-line">
          <div>
            <span className="font-semibold uppercase tracking-wider text-foreground-muted block mb-1.5">
              6. Preferred Active Ingredients
            </span>
            <Input
              placeholder="e.g. Niacinamide, Salicylic Acid (comma separated)..."
              value={req.preferredIngredients.join(", ")}
              onChange={(e) =>
                setReq({
                  ...req,
                  preferredIngredients: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>

          <div>
            <span className="font-semibold uppercase tracking-wider text-foreground-muted block mb-1.5">
              7. Ingredients to Avoid
            </span>
            <Input
              placeholder="e.g. Fragrance, Alcohol, Parabens..."
              value={req.avoidIngredients.join(", ")}
              onChange={(e) =>
                setReq({
                  ...req,
                  avoidIngredients: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>

        {/* Product Properties */}
        <div className="space-y-2 pt-2 border-t border-line">
          <span className="font-semibold uppercase tracking-wider text-foreground-muted block">
            8. Desired Product Characteristics &amp; Safety Tags
          </span>
          <Pills
            options={propertyPills}
            selectedIds={req.properties}
            onToggle={toggleProperty}
            size="sm"
          />
        </div>
      </div>

      {/* Submit Controls */}
      <div className="pt-4 border-t border-line flex items-center justify-between">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="ml-auto"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Confirm &amp; Generate Structured Requirements
        </Button>
      </div>
    </form>
  );
}
