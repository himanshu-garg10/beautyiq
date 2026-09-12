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
import {
  CheckCircle2,
  X,
  Plus,
  Edit2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface EditableRequirementCardProps {
  requirement: StructuredSkincareRequirement;
  onChange: (updated: StructuredSkincareRequirement) => void;
  onConfirm: () => void;
  onReset: () => void;
  onSwitchToManual: () => void;
}

const skinTypeOptions = [
  { value: "", label: "Not Specified" },
  { value: "Oily", label: "Oily" },
  { value: "Dry", label: "Dry" },
  { value: "Combination", label: "Combination" },
  { value: "Sensitive", label: "Sensitive" },
  { value: "Normal", label: "Normal" },
];

const categoryOptions = [
  { value: "", label: "Not Specified" },
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

export function EditableRequirementCard({
  requirement,
  onChange,
  onConfirm,
  onReset,
  onSwitchToManual,
}: EditableRequirementCardProps) {
  const [newIngredient, setNewIngredient] = React.useState("");
  const [newAvoid, setNewAvoid] = React.useState("");
  const [showAddIngredientInput, setShowAddIngredientInput] = React.useState(false);
  const [showAddAvoidInput, setShowAddAvoidInput] = React.useState(false);

  const handleRemoveConcern = (concern: DetailedSkinConcern) => {
    onChange({
      ...requirement,
      concerns: requirement.concerns.filter((c) => c !== concern),
    });
  };

  const handleRemoveGoal = (goal: DetailedSkinGoal) => {
    onChange({
      ...requirement,
      goals: requirement.goals.filter((g) => g !== goal),
    });
  };

  const handleRemoveIngredient = (ing: string) => {
    onChange({
      ...requirement,
      preferredIngredients: requirement.preferredIngredients.filter((i) => i !== ing),
    });
  };

  const handleRemoveAvoid = (ing: string) => {
    onChange({
      ...requirement,
      avoidIngredients: requirement.avoidIngredients.filter((i) => i !== ing),
    });
  };

  const handleRemoveAllergy = (alg: string) => {
    onChange({
      ...requirement,
      knownAllergies: requirement.knownAllergies.filter((a) => a !== alg),
    });
  };

  const handleRemoveProperty = (prop: ProductProperty) => {
    onChange({
      ...requirement,
      properties: requirement.properties.filter((p) => p !== prop),
    });
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !requirement.preferredIngredients.includes(newIngredient.trim())) {
      onChange({
        ...requirement,
        preferredIngredients: [...requirement.preferredIngredients, newIngredient.trim()],
      });
      setNewIngredient("");
      setShowAddIngredientInput(false);
    }
  };

  const handleAddAvoid = () => {
    if (newAvoid.trim() && !requirement.avoidIngredients.includes(newAvoid.trim())) {
      onChange({
        ...requirement,
        avoidIngredients: [...requirement.avoidIngredients, newAvoid.trim()],
      });
      setNewAvoid("");
      setShowAddAvoidInput(false);
    }
  };

  return (
    <div className="rounded-lg border border-sage-deep/30 bg-background-card p-6 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <Badge variant="sage" className="mb-1 flex items-center gap-1 w-fit">
            <Sparkles className="h-3 w-3" /> BeautyIQ Requirement Extraction
          </Badge>
          <h2 className="font-display text-2xl font-bold text-foreground">
            BeautyIQ Understood Your Request
          </h2>
          <p className="text-xs text-foreground-muted">
            Review and edit what BeautyIQ structured from your text. Every chip is interactive.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Start Over
          </Button>
        </div>
      </div>

      {/* Structured Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Skin Type & Category Row */}
        <div className="space-y-4 rounded border border-line bg-background-elevated/40 p-4">
          <div>
            <span className="font-semibold uppercase tracking-wider text-foreground-faint block mb-1.5">
              Skin Type
            </span>
            <div className="w-full">
              <Select
                options={skinTypeOptions}
                value={requirement.skinType || ""}
                onChange={(e) =>
                  onChange({
                    ...requirement,
                    skinType: (e.target.value as SkinType) || null,
                  })
                }
              />
            </div>
          </div>

          <div>
            <span className="font-semibold uppercase tracking-wider text-foreground-faint block mb-1.5">
              Target Product Category
            </span>
            <div className="w-full">
              <Select
                options={categoryOptions}
                value={requirement.category || ""}
                onChange={(e) =>
                  onChange({
                    ...requirement,
                    category: (e.target.value as RoutineStep) || null,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Budget & Price Range Row */}
        <div className="space-y-4 rounded border border-line bg-background-elevated/40 p-4">
          <div>
            <span className="font-semibold uppercase tracking-wider text-foreground-faint block mb-1.5">
              Maximum Price Budget Cap (₹)
            </span>
            <Input
              type="number"
              placeholder="e.g. 1000"
              value={requirement.maxPrice ?? ""}
              onChange={(e) =>
                onChange({
                  ...requirement,
                  maxPrice: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
            />
          </div>

          <div>
            <span className="font-semibold uppercase tracking-wider text-foreground-faint block mb-1.5">
              Minimum Price (₹)
            </span>
            <Input
              type="number"
              placeholder="e.g. 300"
              value={requirement.minPrice ?? ""}
              onChange={(e) =>
                onChange({
                  ...requirement,
                  minPrice: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
            />
          </div>
        </div>

        {/* Concerns List */}
        <div className="rounded border border-line bg-background-elevated/40 p-4 space-y-2">
          <span className="font-semibold uppercase tracking-wider text-foreground-faint block">
            Target Skin Concerns ({requirement.concerns.length})
          </span>
          {requirement.concerns.length === 0 ? (
            <span className="text-foreground-faint italic block">None specified</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {requirement.concerns.map((concern) => (
                <Badge key={concern} variant="clay" className="gap-1 pr-1 text-xs">
                  {concern}
                  <button
                    onClick={() => handleRemoveConcern(concern)}
                    className="hover:text-status-error ml-1 p-0.5"
                    title="Remove concern"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Goals List */}
        <div className="rounded border border-line bg-background-elevated/40 p-4 space-y-2">
          <span className="font-semibold uppercase tracking-wider text-foreground-faint block">
            Desired Skincare Goals ({requirement.goals.length})
          </span>
          {requirement.goals.length === 0 ? (
            <span className="text-foreground-faint italic block">None specified</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {requirement.goals.map((goal) => (
                <Badge key={goal} variant="sage" className="gap-1 pr-1 text-xs">
                  {goal}
                  <button
                    onClick={() => handleRemoveGoal(goal)}
                    className="hover:text-status-error ml-1 p-0.5"
                    title="Remove goal"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Preferred Ingredients */}
        <div className="rounded border border-line bg-background-elevated/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold uppercase tracking-wider text-foreground-faint block">
              Preferred Ingredients
            </span>
            <button
              onClick={() => setShowAddIngredientInput(true)}
              className="text-[0.7rem] font-semibold text-sage-deep hover:underline flex items-center gap-0.5"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>

          {showAddIngredientInput && (
            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Ingredient name..."
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                className="h-8 text-xs"
              />
              <Button size="sm" variant="accent" onClick={handleAddIngredient}>
                Add
              </Button>
            </div>
          )}

          {requirement.preferredIngredients.length === 0 ? (
            <span className="text-foreground-faint italic block">None specified</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {requirement.preferredIngredients.map((ing) => (
                <Badge key={ing} variant="default" className="gap-1 pr-1 text-xs">
                  {ing}
                  <button
                    onClick={() => handleRemoveIngredient(ing)}
                    className="hover:text-status-error ml-1 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Avoid Ingredients & Known Allergies */}
        <div className="rounded border border-line bg-background-elevated/40 p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold uppercase tracking-wider text-foreground-faint block">
                Avoided Ingredients
              </span>
              <button
                onClick={() => setShowAddAvoidInput(true)}
                className="text-[0.7rem] font-semibold text-sage-deep hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>

            {showAddAvoidInput && (
              <div className="flex items-center gap-2 pb-2">
                <Input
                  placeholder="Ingredient to avoid..."
                  value={newAvoid}
                  onChange={(e) => setNewAvoid(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button size="sm" variant="accent" onClick={handleAddAvoid}>
                  Add
                </Button>
              </div>
            )}

            {requirement.avoidIngredients.length === 0 ? (
              <span className="text-foreground-faint italic block">None avoided</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {requirement.avoidIngredients.map((ing) => (
                  <Badge key={ing} variant="warning" className="gap-1 pr-1 text-xs">
                    Avoid: {ing}
                    <button
                      onClick={() => handleRemoveAvoid(ing)}
                      className="hover:text-status-error ml-1 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Known Allergies (Separated from simple preferences!) */}
          {requirement.knownAllergies.length > 0 && (
            <div className="pt-2 border-t border-line">
              <span className="font-semibold uppercase tracking-wider text-status-error block mb-1">
                Known Allergies &amp; Sensitivities (High Priority)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {requirement.knownAllergies.map((alg) => (
                  <Badge key={alg} variant="error" className="gap-1 pr-1 text-xs">
                    Allergy: {alg}
                    <button
                      onClick={() => handleRemoveAllergy(alg)}
                      className="hover:text-foreground ml-1 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brands & Texture */}
        <div className="rounded border border-line bg-background-elevated/40 p-4 space-y-2">
          <span className="font-semibold uppercase tracking-wider text-foreground-faint block">
            Brand Preferences &amp; Texture
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {requirement.preferredBrands.map((b) => (
              <Badge key={b} variant="sage">
                Brand: {b}
              </Badge>
            ))}
            {requirement.excludedBrands.map((b) => (
              <Badge key={b} variant="warning">
                Exclude Brand: {b}
              </Badge>
            ))}
            {requirement.texturePreference && (
              <Badge variant="default">Texture: {requirement.texturePreference}</Badge>
            )}
            {requirement.finishPreference && (
              <Badge variant="default">Finish: {requirement.finishPreference}</Badge>
            )}
            {requirement.fragrancePreference && (
              <Badge variant="default">Fragrance: {requirement.fragrancePreference}</Badge>
            )}
          </div>
        </div>

        {/* Product Properties */}
        <div className="rounded border border-line bg-background-elevated/40 p-4 space-y-2">
          <span className="font-semibold uppercase tracking-wider text-foreground-faint block">
            Formulation Characteristics
          </span>
          {requirement.properties.length === 0 ? (
            <span className="text-foreground-faint italic block">None specified</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {requirement.properties.map((prop) => (
                <Badge key={prop} variant="default" className="gap-1 pr-1 text-xs">
                  {prop}
                  <button
                    onClick={() => handleRemoveProperty(prop)}
                    className="hover:text-status-error ml-1 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Actions Bar (Requirement #16) */}
      <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button variant="outline" size="md" onClick={onSwitchToManual}>
          Switch to Manual Form Mode
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="accent"
            size="lg"
            className="w-full sm:w-auto"
            onClick={onConfirm}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Confirm &amp; Proceed to Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
}
