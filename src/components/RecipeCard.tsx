"use client";

import { Recipe } from "@/lib/types";
import { useBox } from "@/context/BoxContext";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { isSelected, toggleRecipe } = useBox();
  const selected = isSelected(recipe.id);

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all dark:bg-zinc-950 ${
        selected
          ? "border-emerald-500 shadow-lg shadow-emerald-100 dark:shadow-none"
          : "border-black/10 shadow-sm hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10"
      }`}
    >
      <div
        className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${recipe.color}`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.35) 2px, transparent 2px), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 3px, transparent 3px)",
          backgroundSize: "28px 28px, 40px 40px",
        }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/40 text-5xl backdrop-blur-sm drop-shadow-sm transition-transform group-hover:scale-105 dark:bg-black/15">
          {recipe.emoji}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/10 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{recipe.name}</h3>
          <span className="shrink-0 whitespace-nowrap text-sm font-bold text-emerald-600">
            {recipe.pricePerServing} RSD
          </span>
        </div>
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
        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>⏱ {recipe.prepMinutes} min</span>
          <span>🔥 {recipe.calories} kcal</span>
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
