"use client";

import { Recipe } from "@/lib/types";
import { useBox } from "@/context/BoxContext";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { isSelected, toggleRecipe } = useBox();
  const selected = isSelected(recipe.id);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border transition-shadow ${
        selected
          ? "border-emerald-500 shadow-md shadow-emerald-100 dark:shadow-none"
          : "border-black/10 dark:border-white/10"
      }`}
    >
      <div
        className={`flex h-32 items-center justify-center bg-gradient-to-br text-5xl ${recipe.color}`}
      >
        {recipe.emoji}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-snug">{recipe.name}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {recipe.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>⏱ {recipe.prepMinutes} min</span>
          <span>🔥 {recipe.calories} kcal</span>
          <span>{recipe.pricePerServing} RSD / porcija</span>
        </div>
        <button
          onClick={() => toggleRecipe(recipe.id)}
          className={`mt-2 w-full rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            selected
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          }`}
        >
          {selected ? "Dodato u kutiju ✓" : "Dodaj u kutiju"}
        </button>
      </div>
    </div>
  );
}
