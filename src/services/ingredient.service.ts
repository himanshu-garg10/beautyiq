import { ingredients, products } from "@/lib/mock-data";
import type { Ingredient, IngredientCategory, Product } from "@/types";
import { ApiResponse, createSuccessResponse, createErrorResponse, simulateDelay } from "./api-client";

export class IngredientService {
  /**
   * Get all active skincare ingredients
   */
  static async getAllIngredients(): Promise<ApiResponse<Ingredient[]>> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/ingredients");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return createSuccessResponse(json.data);
          }
        }
      } catch (err) {
        console.warn("Fetch from /api/ingredients failed, using fallback", err);
      }
    }

    await simulateDelay(80);
    return createSuccessResponse(ingredients);
  }

  /**
   * Get single ingredient by ID or slug
   */
  static async getIngredientById(id: string): Promise<ApiResponse<Ingredient>> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/ingredients?q=${encodeURIComponent(id)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const q = id.toLowerCase();
            const matched = json.data.find(
              (i: Ingredient) => i.id.toLowerCase() === q || i.name.toLowerCase() === q
            );
            if (matched) return createSuccessResponse(matched);
          }
        }
      } catch (err) {
        console.warn(`Fetch ingredient ${id} failed, using fallback`, err);
      }
    }

    await simulateDelay(80);
    const q = id.toLowerCase();
    const item = ingredients.find((i) => i.id.toLowerCase() === q || i.name.toLowerCase() === q);

    if (!item) {
      return createErrorResponse("NOT_FOUND", `Ingredient with ID ${id} was not found.`);
    }

    return createSuccessResponse(item);
  }

  /**
   * Search ingredients by name, function, category, or concern tag
   */
  static async searchIngredients(
    query?: string,
    category?: IngredientCategory | string
  ): Promise<ApiResponse<Ingredient[]>> {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category) params.set("category", category);

        const res = await fetch(`/api/ingredients?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return createSuccessResponse(json.data);
          }
        }
      } catch (err) {
        console.warn("Fetch from /api/ingredients failed, using fallback", err);
      }
    }

    await simulateDelay(80);
    let result = [...ingredients];

    if (query) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.function.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.commonNames && i.commonNames.some((cn) => cn.toLowerCase().includes(q))) ||
          i.concernTags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (category) {
      const cat = category.toLowerCase();
      result = result.filter((i) => i.category.toLowerCase() === cat);
    }

    return createSuccessResponse(result);
  }

  /**
   * Get products that contain a given ingredient
   */
  static async getProductsForIngredient(ingredientName: string): Promise<ApiResponse<Product[]>> {
    await simulateDelay(80);
    const ingLower = ingredientName.toLowerCase();
    const matched = products.filter(
      (p) =>
        p.keyIngredients.some((i) => i.toLowerCase().includes(ingLower)) ||
        p.allIngredients.some((i) => i.toLowerCase().includes(ingLower))
    );

    return createSuccessResponse(matched);
  }
}
