"use client";

import { useMemo, useState } from "react";
import { Tag } from "@/lib/types";
import { ALL_TAGS } from "@/lib/tags";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import { useBox } from "@/context/BoxContext";
import { useRecipes } from "@/context/RecipeContext";

export default function MeniPage() {
  const [activeTag, setActiveTag] = useState<Tag | null>(null);
  const { selectedRecipes, plan, isBoxComplete } = useBox();
  const { recipes, isLoading, error } = useRecipes();

  const filtered = useMemo(
    () =>
      activeTag ? recipes.filter((r) => r.tags.includes(activeTag)) : recipes,
    [activeTag, recipes]
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Nedeljni meni</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Izaberi obroke za ovu nedelju. Tvoj plan: {plan.people} osobe,{" "}
          {plan.mealsPerWeek} obroka nedeljno.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTag === null
              ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300"
          }`}
        >
          Sve
        </button>
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTag === tag
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-zinc-500">Učitavanje menija…</p>
      ) : error ? (
        <p className="py-16 text-center text-red-500">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">
          Nema recepata za izabrani filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {selectedRecipes.length > 0 && (
        <div className="sticky bottom-4 mt-8 flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-zinc-900">
          <span className="text-sm font-medium">
            {selectedRecipes.length} od {plan.mealsPerWeek} obroka izabrano
            {isBoxComplete ? " — kutija je spremna! ✅" : ""}
          </span>
          <Link
            href="/kutija"
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Idi na kutiju →
          </Link>
        </div>
      )}
    </div>
  );
}
