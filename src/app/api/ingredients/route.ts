import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || searchParams.get("search");
    const category = searchParams.get("category");
    const safetyRating = searchParams.get("safetyRating");

    const where: any = {};

    if (category && category !== "All" && category !== "") {
      where.category = { equals: category };
    }

    if (safetyRating && safetyRating !== "All" && safetyRating !== "") {
      where.safetyRating = { equals: safetyRating };
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      where.OR = [
        { name: { contains: q } },
        { slug: { contains: q } },
        { description: { contains: q } },
        { function: { contains: q } },
        { commonNames: { contains: q } },
        { synonyms: { contains: q } },
      ];
    }

    const rawIngredients = await prisma.ingredient.findMany({
      where,
      orderBy: { name: "asc" },
    });

    const formatted = rawIngredients.map((ing: any) => {
      let commonNames: string[] = [];
      let synonyms: string[] = [];
      let concernTags: string[] = [];
      let suitableSkinTypes: string[] = [];
      let contraindications: string[] = [];

      try { commonNames = ing.commonNames ? JSON.parse(ing.commonNames) : []; } catch {}
      try { synonyms = ing.synonyms ? JSON.parse(ing.synonyms) : []; } catch {}
      try { concernTags = JSON.parse(ing.concernTags); } catch {}
      try { suitableSkinTypes = JSON.parse(ing.suitableSkinTypes); } catch {}
      try { contraindications = ing.contraindications ? JSON.parse(ing.contraindications) : []; } catch {}

      const stableId = ing.slug || ing.legacyId || ing.id;

      return {
        id: stableId,
        slug: stableId,
        name: ing.name,
        commonNames,
        synonyms,
        description: ing.description,
        function: ing.function,
        category: ing.category,
        concentration: ing.concentration,
        concernTags,
        safetyRating: ing.safetyRating,
        comedogenicRating: ing.comedogenicRating,
        suitableSkinTypes,
        contraindications,
        status: ing.status,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      ingredients: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    console.error("GET /api/ingredients error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error fetching ingredients" },
      { status: 500 }
    );
  }
}
