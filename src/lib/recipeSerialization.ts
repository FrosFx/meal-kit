import type { Recipe as DbRecipe } from "@prisma/client";
import { Recipe, Tag } from "./types";

// Baza čuva tagove kao JSON string (SQLite nema tip niza) -- ovde ih
// pretvaramo nazad u pravi niz za upotrebu u aplikaciji.
export function toAppRecipe(row: DbRecipe): Recipe {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    emoji: row.emoji,
    color: row.color,
    tags: JSON.parse(row.tags) as Tag[],
    prepMinutes: row.prepMinutes,
    calories: row.calories,
    pricePerServing: row.pricePerServing,
  };
}

export interface RecipeInput {
  name: string;
  description: string;
  emoji: string;
  color: string;
  tags: Tag[];
  prepMinutes: number;
  calories: number;
  pricePerServing: number;
}

export function toDbData(input: RecipeInput) {
  return {
    name: input.name,
    description: input.description,
    emoji: input.emoji,
    color: input.color,
    tags: JSON.stringify(input.tags),
    prepMinutes: input.prepMinutes,
    calories: input.calories,
    pricePerServing: input.pricePerServing,
  };
}
