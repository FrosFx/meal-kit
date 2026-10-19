import { connection } from "next/server";
import { db } from "./db";
import { withRetry } from "./dbRetry";
import { DELIVERY_FEE } from "./pricing";
import { toAppRecipe } from "./recipeSerialization";
import { ALL_TAGS } from "./tags";
import { Recipe, Tag } from "./types";

// Podaci za početnu stranu. Sve se računa iz jednog upita nad tabelom
// recepata (mala tabela, pa agregacija u memoriji nije problem).

export const SHOWCASE_LIMIT = 6;
export const FEATURED_LIMIT = 6;
// Granica za "brz" recept -- ista kao obećanje "< 30 min" u tekstu na sajtu.
export const QUICK_PREP_MINUTES = 30;

export interface HomeStats {
  recipeCount: number;
  minPrice: number | null; // RSD po porciji, null kad je meni prazan
  maxPrice: number | null;
  minPrepMinutes: number | null;
  avgPrepMinutes: number | null; // zaokruženo na ceo broj
  quickRecipeCount: number; // prepMinutes <= QUICK_PREP_MINUTES
}

export interface TagCount {
  tag: Tag;
  count: number;
}

export type HomeDataStatus = "ok" | "empty" | "error";

export interface HomeData {
  status: HomeDataStatus;
  // Prvih SHOWCASE_LIMIT recepata, najstariji prvi (isti redosled kao meni).
  showcase: Recipe[];
  stats: HomeStats;
  // FEATURED_LIMIT recepata, createdAt asc, sa bar jednim vegetarijanskim
  // ako takav postoji u bazi.
  featured: Recipe[];
  // Svi tagovi redom iz ALL_TAGS, uključujući one sa count 0.
  tags: TagCount[];
  deliveryFee: number; // RSD po kutiji
}

// Prvih N recepata; ako među njima nema vegetarijanskog, poslednji se menja
// prvim vegetarijanskim iz ostatka, pa se vraća redosled po bazi.
export function pickFeatured(recipes: Recipe[], limit = FEATURED_LIMIT): Recipe[] {
  const picked = recipes.slice(0, limit);
  const isVeg = (r: Recipe) => r.tags.includes("vegetarijansko");
  if (picked.length === 0 || picked.some(isVeg)) return picked;
  const veg = recipes.slice(limit).find(isVeg);
  if (!veg) return picked;
  const chosen = new Set([...picked.slice(0, -1), veg]);
  return recipes.filter((r) => chosen.has(r));
}

export function summarizeRecipes(recipes: Recipe[]): Omit<HomeData, "status"> {
  const prices = recipes.map((r) => r.pricePerServing);
  const preps = recipes.map((r) => r.prepMinutes);
  const has = recipes.length > 0;

  return {
    showcase: recipes.slice(0, SHOWCASE_LIMIT),
    featured: pickFeatured(recipes),
    deliveryFee: DELIVERY_FEE,
    stats: {
      recipeCount: recipes.length,
      minPrice: has ? Math.min(...prices) : null,
      maxPrice: has ? Math.max(...prices) : null,
      minPrepMinutes: has ? Math.min(...preps) : null,
      avgPrepMinutes: has
        ? Math.round(preps.reduce((a, b) => a + b, 0) / preps.length)
        : null,
      quickRecipeCount: preps.filter((m) => m <= QUICK_PREP_MINUTES).length,
    },
    tags: ALL_TAGS.map((tag) => ({
      tag,
      count: recipes.filter((r) => r.tags.includes(tag)).length,
    })),
  };
}

// Jedan pokvaren red (npr. neispravan JSON u tags) ne sme da obori stranu.
function parseRows(rows: Parameters<typeof toAppRecipe>[0][]): Recipe[] {
  const recipes: Recipe[] = [];
  for (const row of rows) {
    try {
      recipes.push(toAppRecipe(row));
    } catch (error) {
      console.error("[home] skipping malformed recipe row", {
        id: row.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return recipes;
}

export async function getHomeData(): Promise<HomeData> {
  // Uvek čitamo pri zahtevu, nikad u build-u -- admin menja recepte bilo kada.
  // Mora biti van try/catch-a da Next može da prekine prerender.
  await connection();

  try {
    const rows = await withRetry(() =>
      db.recipe.findMany({ orderBy: { createdAt: "asc" } }),
    );
    const recipes = parseRows(rows);
    return {
      status: recipes.length ? "ok" : "empty",
      ...summarizeRecipes(recipes),
    };
  } catch (error) {
    console.error("[home] failed to load recipes", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { status: "error", ...summarizeRecipes([]) };
  }
}

// Zadržano radi kompatibilnosti uvoza.
export { isTransientDbError, withRetry } from "./dbRetry";
