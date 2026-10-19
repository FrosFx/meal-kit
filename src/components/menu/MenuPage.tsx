"use client";

import { useMemo, useState } from "react";
import { Tag } from "@/lib/types";
import { ALL_TAGS } from "@/lib/tags";
import RecipeCard, { RecipeCardSkeleton } from "@/components/RecipeCard";
import Link from "next/link";
import { useBox } from "@/context/BoxContext";
import { useRecipes } from "@/context/RecipeContext";
import Icon from "@/components/icons";

export default function MenuPage({ initialTag = null }: { initialTag?: Tag | null }) {
  const [activeTag, setActiveTag] = useState<Tag | null>(initialTag);
  const { selectedRecipes, plan, isBoxComplete } = useBox();
  const { recipes, isLoading, error } = useRecipes();

  const filtered = useMemo(
    () =>
      activeTag ? recipes.filter((r) => r.tags.includes(activeTag)) : recipes,
    [activeTag, recipes]
  );

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-3">
        <p className="t-eyebrow text-basil">Ova nedelja</p>
        <h1 className="t-display-l text-ink">Nedeljni meni</h1>
        <p className="t-body-l max-w-[52ch] text-ink-muted">
          Izaberi obroke za ovu nedelju. Tvoj plan: {plan.people} osobe,{" "}
          {plan.mealsPerWeek} obroka nedeljno.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2" aria-label="Filtriraj po oznaci" role="group">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          aria-pressed={activeTag === null}
          className="chip"
        >
          {activeTag === null && <Icon name="check" size="sm" />}
          Sve
        </button>
        {ALL_TAGS.map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            aria-pressed={activeTag === tag}
            className="chip"
          >
            {activeTag === tag && <Icon name="check" size="sm" />}
            {tag}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-8">
          <p className="sr-only" role="status">
            Učitavanje menija…
          </p>
          {[0, 1, 2].map((i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <p
          role="alert"
          className="flex items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-danger bg-danger-tint px-6 py-12 text-center text-ink"
        >
          <Icon name="alert-circle" className="shrink-0 text-danger" />
          {error}
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">
          Nema recepata za izabrani filter.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-8">
          {filtered.map((recipe, i) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} index={i} />
            </li>
          ))}
        </ul>
      )}

      {selectedRecipes.length > 0 && (
        <div className="sticky bottom-4 z-30 mt-8 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-line bg-card p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-medium text-ink">
            {isBoxComplete && <Icon name="check" className="text-basil" />}
            {selectedRecipes.length} od {plan.mealsPerWeek} obroka izabrano
            {isBoxComplete ? " — kutija je spremna!" : ""}
          </span>
          <Link href="/kutija" className="group btn btn-primary">
            Idi na kutiju
            <Icon name="arrow-right" className="btn-arrow group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
