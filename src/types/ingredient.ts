import type { DetailedSkinConcern, SkinType } from "./user";

export type IngredientCategory =
  | "Humectant"
  | "Emollient"
  | "Occlusive"
  | "Antioxidant"
  | "Exfoliant"
  | "Skin conditioning"
  | "Soothing agent"
  | "Surfactant"
  | "Preservative"
  | "Solvent"
  | "UV filter"
  | "Active ingredient";

export interface Ingredient {
  id: string;
  name: string;
  commonNames?: string[];
  synonyms?: string[];
  description: string;
  function: string;
  category: IngredientCategory;
  concentration: string;
  concernTags: DetailedSkinConcern[];
  safetyRating: "Low Hazard" | "Moderate Hazard" | "High Hazard";
  comedogenicRating: number; // 0 to 5
  suitableSkinTypes: SkinType[];
  contraindications: string[];
  status?: "active" | "inactive";
}
