"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSkinProfile } from "@/context/skin-profile-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import type {
  SkinType,
  DetailedSkinConcern,
  DetailedSkinGoal,
  SensitivityLevel,
  ReactionFrequency,
  KnownAllergy,
  TexturePreference,
  FinishPreference,
  FragrancePreference,
  EssentialOilPreference,
  ProductProperty,
  SkincareExperience,
  SunExposure,
  ActivityType,
  ClimateType,
  RoutineStep,
} from "@/types";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, ShieldAlert, Heart, SlidersHorizontal } from "lucide-react";

const skinTypesList = [
  { value: "Oily", label: "Oily Skin", description: "Excess shine, enlarged pores, frequent sebum buildup" },
  { value: "Dry", label: "Dry Skin", description: "Tight feeling, flaking, dullness, needs rich barrier hydration" },
  { value: "Combination", label: "Combination Skin", description: "Oily T-zone (forehead, nose) with dry or normal cheeks" },
  { value: "Sensitive", label: "Sensitive Skin", description: "Easily irritated, turns red, experiences stinging or reaction" },
  { value: "Normal", label: "Normal Skin", description: "Balanced moisture, rarely breaks out or feels tight" },
];

const concernsList: DetailedSkinConcern[] = [
  "Acne", "Pimples", "Blackheads", "Whiteheads",
  "Dark spots", "Acne marks", "Hyperpigmentation", "Uneven skin tone",
  "Dryness", "Dehydration", "Excess oil", "Dullness",
  "Redness", "Rough texture", "Visible pores", "Fine lines",
  "Tanning", "Dark circles", "Under eye puffiness", "Uneven texture",
];

const goalsList: DetailedSkinGoal[] = [
  "Clearer skin", "Glow", "Even skin tone", "Hydration",
  "Oil control", "Smoother texture", "Reduced appearance of pores", "Maintain healthy looking skin",
];

const allergiesList: KnownAllergy[] = [
  "Fragrance", "Specific preservatives", "Specific ingredients", "Other", "None", "Not sure",
];

const propertiesList: ProductProperty[] = [
  "Lightweight", "Non sticky", "Fast absorbing", "Fragrance free",
  "Alcohol free", "Non comedogenic", "Vegan", "Cruelty free", "Dermatologically tested",
];

export default function CustomerOnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile } = useSkinProfile();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = React.useState(1);

  // State
  const [skinType, setSkinType] = React.useState<SkinType>(profile.skinType || "Combination");
  const [selectedConcerns, setSelectedConcerns] = React.useState<DetailedSkinConcern[]>(profile.concerns || ["Acne"]);
  const [sensitivityLevel, setSensitivityLevel] = React.useState<SensitivityLevel>(profile.sensitivityLevel || "Medium");
  const [reactionFrequency, setReactionFrequency] = React.useState<ReactionFrequency>(profile.reactionFrequency || "Rarely");
  const [knownAllergies, setKnownAllergies] = React.useState<KnownAllergy[]>(profile.knownAllergies || ["None"]);
  
  const [selectedGoals, setSelectedGoals] = React.useState<DetailedSkinGoal[]>(profile.goals || ["Clearer skin"]);
  
  const [avoidIngredientsInput, setAvoidIngredientsInput] = React.useState((profile.avoidIngredients || []).join(", "));
  const [preferredIngredientsInput, setPreferredIngredientsInput] = React.useState((profile.preferredIngredients || []).join(", "));
  const [texturePreference, setTexturePreference] = React.useState<TexturePreference>(profile.texturePreference || "Gel");
  const [finishPreference, setFinishPreference] = React.useState<FinishPreference>(profile.finishPreference || "Matte");
  const [fragrancePreference, setFragrancePreference] = React.useState<FragrancePreference>(profile.fragrancePreference || "Fragrance free");
  const [essentialOilPreference, setEssentialOilPreference] = React.useState<EssentialOilPreference>(profile.essentialOilPreference || "Avoid");
  const [selectedProperties, setSelectedProperties] = React.useState<ProductProperty[]>(profile.properties || ["Non comedogenic"]);

  const [experience, setExperience] = React.useState<SkincareExperience>(profile.skincareExperience || "Intermediate");
  const [sunExposure, setSunExposure] = React.useState<SunExposure>(profile.sunExposure || "Low sun exposure");
  const [climate, setClimate] = React.useState<ClimateType>(profile.climate || "Humid climate");

  const [maxBudget, setMaxBudget] = React.useState<number>(profile.budget?.max || 1200);
  const [monthlyBudget, setMonthlyBudget] = React.useState<number>(profile.budget?.monthlyBudget || 2500);

  const toggleConcern = (c: DetailedSkinConcern) => {
    setSelectedConcerns((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const toggleGoal = (g: DetailedSkinGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const toggleAllergy = (a: KnownAllergy) => {
    if (a === "None") {
      setKnownAllergies(["None"]);
      return;
    }
    setKnownAllergies((prev) => {
      const filtered = prev.filter((item) => item !== "None");
      return filtered.includes(a) ? filtered.filter((item) => item !== a) : [...filtered, a];
    });
  };

  const toggleProperty = (p: ProductProperty) => {
    setSelectedProperties((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleFinishOnboarding = async () => {
    const avoid = avoidIngredientsInput.split(",").map((s) => s.trim()).filter(Boolean);
    const pref = preferredIngredientsInput.split(",").map((s) => s.trim()).filter(Boolean);

    await updateProfile({
      skinType,
      concerns: selectedConcerns,
      goals: selectedGoals,
      sensitivityLevel,
      reactionFrequency,
      knownAllergies,
      preferredIngredients: pref,
      avoidIngredients: avoid,
      texturePreference,
      finishPreference,
      fragrancePreference,
      essentialOilPreference,
      properties: selectedProperties,
      skincareExperience: experience,
      sunExposure,
      climate,
      budget: { min: 200, max: maxBudget, monthlyBudget, label: "Mid-Range" },
      isOnboardingComplete: true,
      completedStepsCount: 7,
    });

    addToast({
      type: "success",
      title: "Onboarding Completed!",
      description: "Your personalized BeautyIQ profile is now active.",
    });

    router.push("/profile");
  };

  const totalSteps = 7;

  return (
    <Container className="py-10 space-y-8 max-w-3xl">
      {/* Step Header */}
      <div className="space-y-4 text-center">
        <div className="flex justify-between items-center text-xs font-semibold uppercase text-foreground-muted">
          <Badge variant="sage">
            Step {step} of {totalSteps}
          </Badge>
          <button onClick={handleFinishOnboarding} className="hover:text-sage-deep underline font-mono">
            Skip for now
          </button>
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {step === 1 && "Welcome! Select Your Skin Type"}
          {step === 2 && "Skin Concerns & Sensitivities"}
          {step === 3 && "Your Skincare Goals"}
          {step === 4 && "Formulation & Texture Preferences"}
          {step === 5 && "Skincare Experience & Environment"}
          {step === 6 && "Budget & Price Boundaries"}
          {step === 7 && "Skin Profile Complete!"}
        </h1>

        <Progress value={(step / totalSteps) * 100} size="sm" showValueLabel={false} />
      </div>

      {/* Main Questionnaire Box */}
      <div className="rounded border border-line bg-background-card p-6 sm:p-8 shadow-subtle min-h-[380px] flex flex-col justify-between">
        {/* Step 1: Skin Type */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-foreground-muted">
              Choose the option that best describes your baseline skin behavior without heavy products.
            </p>
            <RadioGroup
              name="skinType"
              options={skinTypesList}
              value={skinType}
              onChange={(val) => setSkinType(val as SkinType)}
            />
          </div>
        )}

        {/* Step 2: Concerns & Sensitivities */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">
                Active Skin Concerns (Select all that apply)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 border border-line rounded bg-background-elevated/30">
                {concernsList.map((c) => (
                  <Checkbox
                    key={c}
                    label={c}
                    checked={selectedConcerns.includes(c)}
                    onChange={() => toggleConcern(c)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-line">
              <Select
                label="Sensitivity Level"
                options={[
                  { value: "Low", label: "Low Sensitivity" },
                  { value: "Medium", label: "Medium Sensitivity" },
                  { value: "High", label: "High Sensitivity" },
                  { value: "Not sure", label: "Not sure" },
                ]}
                value={sensitivityLevel}
                onChange={(e) => setSensitivityLevel(e.target.value as SensitivityLevel)}
              />

              <Select
                label="Reaction Frequency"
                options={[
                  { value: "Never", label: "Never" },
                  { value: "Rarely", label: "Rarely" },
                  { value: "Sometimes", label: "Sometimes" },
                  { value: "Frequently", label: "Frequently" },
                ]}
                value={reactionFrequency}
                onChange={(e) => setReactionFrequency(e.target.value as ReactionFrequency)}
              />
            </div>

            {/* Structurally Separate Allergies */}
            <div className="pt-4 border-t border-line">
              <span className="block text-xs font-semibold uppercase tracking-wider text-status-warning mb-2 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" /> Known Allergies / High Reaction Triggers (Separated)
              </span>
              <div className="flex flex-wrap gap-3">
                {allergiesList.map((a) => (
                  <Checkbox
                    key={a}
                    label={a}
                    checked={knownAllergies.includes(a)}
                    onChange={() => toggleAllergy(a)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="space-y-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Select Your Target Skincare Goals
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goalsList.map((g) => (
                <Checkbox
                  key={g}
                  label={g}
                  checked={selectedGoals.includes(g)}
                  onChange={() => toggleGoal(g)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ingredients to Avoid"
                placeholder="e.g. Fragrance, Parabens, Sulfates"
                value={avoidIngredientsInput}
                onChange={(e) => setAvoidIngredientsInput(e.target.value)}
              />
              <Input
                label="Preferred Active Ingredients"
                placeholder="e.g. Niacinamide, Salicylic Acid"
                value={preferredIngredientsInput}
                onChange={(e) => setPreferredIngredientsInput(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Texture Preference"
                options={[
                  { value: "Gel", label: "Gel" },
                  { value: "Cream", label: "Cream" },
                  { value: "Lotion", label: "Lotion" },
                  { value: "Foam", label: "Foam" },
                  { value: "Water based", label: "Water based" },
                  { value: "Oil based", label: "Oil based" },
                  { value: "No preference", label: "No preference" },
                ]}
                value={texturePreference}
                onChange={(e) => setTexturePreference(e.target.value as TexturePreference)}
              />

              <Select
                label="Finish Preference"
                options={[
                  { value: "Matte", label: "Matte" },
                  { value: "Dewy", label: "Dewy" },
                  { value: "Natural", label: "Natural" },
                  { value: "No preference", label: "No preference" },
                ]}
                value={finishPreference}
                onChange={(e) => setFinishPreference(e.target.value as FinishPreference)}
              />

              <Select
                label="Fragrance Preference"
                options={[
                  { value: "Fragrance free", label: "Fragrance free" },
                  { value: "Light fragrance", label: "Light fragrance" },
                  { value: "No preference", label: "No preference" },
                ]}
                value={fragrancePreference}
                onChange={(e) => setFragrancePreference(e.target.value as FragrancePreference)}
              />
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                Desired Product Properties
              </span>
              <div className="flex flex-wrap gap-2.5">
                {propertiesList.map((p) => (
                  <Checkbox
                    key={p}
                    label={p}
                    checked={selectedProperties.includes(p)}
                    onChange={() => toggleProperty(p)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Experience & Environment */}
        {step === 5 && (
          <div className="space-y-6">
            <Select
              label="Your Skincare Experience Level"
              options={[
                { value: "Beginner", label: "Beginner — Simple 2-3 step routine" },
                { value: "Intermediate", label: "Intermediate — Comfortable with active serums" },
                { value: "Experienced", label: "Experienced — Multi-step routines & strong exfoliators" },
              ]}
              value={experience}
              onChange={(e) => setExperience(e.target.value as SkincareExperience)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Sun Exposure"
                options={[
                  { value: "High sun exposure", label: "High sun exposure (Outdoor daily)" },
                  { value: "Low sun exposure", label: "Low sun exposure (Mostly indoors)" },
                ]}
                value={sunExposure}
                onChange={(e) => setSunExposure(e.target.value as SunExposure)}
              />

              <Select
                label="Climate / Environment"
                options={[
                  { value: "Hot climate", label: "Hot Climate" },
                  { value: "Humid climate", label: "Humid Climate" },
                  { value: "Dry climate", label: "Dry Climate" },
                  { value: "Air conditioned environment", label: "Air Conditioned Environment" },
                ]}
                value={climate}
                onChange={(e) => setClimate(e.target.value as ClimateType)}
              />
            </div>
          </div>
        )}

        {/* Step 6: Budget */}
        {step === 6 && (
          <div className="space-y-6">
            <Slider
              label="Maximum Price per Item"
              min={200}
              max={3000}
              step={50}
              value={maxBudget}
              onChange={setMaxBudget}
              formatValue={(v) => `₹${v}`}
            />

            <Slider
              label="Estimated Monthly Skincare Budget"
              min={500}
              max={10000}
              step={250}
              value={monthlyBudget}
              onChange={setMonthlyBudget}
              formatValue={(v) => `₹${v}`}
            />
          </div>
        )}

        {/* Step 7: Completion Summary */}
        {step === 7 && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3 p-4 rounded bg-sage-tint/40 border border-sage-deep/30">
              <CheckCircle2 className="h-6 w-6 text-sage-deep shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Skin Profile Complete!</h4>
                <p className="text-xs text-foreground-muted">Review your parameters below before saving.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded border border-line bg-background-elevated">
                <span className="text-foreground-faint block">Skin Type</span>
                <strong className="text-foreground font-mono">{skinType}</strong>
              </div>
              <div className="p-3 rounded border border-line bg-background-elevated">
                <span className="text-foreground-faint block">Sensitivity</span>
                <strong className="text-foreground font-mono">{sensitivityLevel}</strong>
              </div>
              <div className="p-3 rounded border border-line bg-background-elevated col-span-2">
                <span className="text-foreground-faint block mb-1">Target Concerns</span>
                <div className="flex flex-wrap gap-1">
                  {selectedConcerns.map((c) => (
                    <Badge key={c} variant="sage">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded border border-line bg-background-elevated col-span-2">
                <span className="text-foreground-faint block">Max Budget</span>
                <strong className="text-foreground font-mono">₹{maxBudget} / product (Monthly ₹{monthlyBudget})</strong>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-line mt-6">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <Button
              variant="accent"
              onClick={() => setStep(step + 1)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="accent"
              onClick={handleFinishOnboarding}
              rightIcon={<Sparkles className="h-4 w-4" />}
            >
              Save Skin Profile & Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
}
