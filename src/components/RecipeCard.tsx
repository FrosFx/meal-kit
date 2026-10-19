"use client";

import { Recipe, Tag } from "@/lib/types";
import { useBox } from "@/context/BoxContext";
import Plate, { plateTilt } from "@/components/Plate";
import Icon from "@/components/icons";

const DIET_TAGS: Tag[] = ["vegetarijansko", "bez glutena"];

// Jedna kartica recepta za početnu i /meni (MASTER 6.5).
export default function RecipeCard({
  recipe,
  index = 0,
}: {
  recipe: Recipe;
  index?: number;
}) {
  const { isSelected, toggleRecipe } = useBox();
  const selected = isSelected(recipe.id);

  return (
    <article
      className={`recipe-card card flex h-full flex-col gap-4 p-5 lg:p-6 ${
        selected ? "border-basil ring-1 ring-basil" : ""
      }`}
    >
      <div
        className={`relative grid aspect-[4/3] place-items-center rounded-[var(--radius-md)] transition-colors ${
          selected ? "bg-basil-tint" : "bg-paper-2"
        }`}
      >
        <Plate recipe={recipe} tilt={plateTilt(index)} className="w-[62%]" />
        <span className="badge absolute top-3 left-3 bg-card text-ink">
          <Icon name="clock" size="sm" />
          {recipe.prepMinutes} min
        </span>
      </div>

      {recipe.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Oznake">
          {recipe.tags.map((tag) => (
            <li
              key={tag}
              className={`badge ${DIET_TAGS.includes(tag) ? "badge-diet" : ""}`}
            >
              {DIET_TAGS.includes(tag) && <Icon name="leaf" size={14} />}
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="t-title text-ink">{recipe.name}</h3>
        <p className="text-ink-muted">{recipe.description}</p>
      </div>

      <p className="t-meta mt-auto flex items-center gap-1.5 text-ink-muted">
        <Icon name="flame" size="sm" />
        {recipe.calories} kcal
      </p>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          <span className="fraunces tabular text-[22px] leading-none font-semibold whitespace-nowrap text-paprika">
            {recipe.pricePerServing.toLocaleString("sr-RS")} RSD
          </span>
          <span className="t-meta whitespace-nowrap text-ink-muted">/ porcija</span>
        </p>
        <button
          type="button"
          onClick={() => toggleRecipe(recipe.id)}
          aria-pressed={selected}
          className={`btn shrink-0 ${selected ? "btn-selected" : "btn-secondary"}`}
        >
          <Icon name={selected ? "check" : "plus"} />
          <span key={String(selected)} className="num-swap">
            {selected ? (
              <>
                U kutiji<span className="sr-only">: {recipe.name}</span>
              </>
            ) : (
              <>
                Dodaj<span className="sr-only"> {recipe.name}</span>
              </>
            )}
          </span>
        </button>
      </div>
    </article>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="card flex flex-col gap-4 p-5 lg:p-6" aria-hidden="true">
      <div className="skeleton-pulse aspect-[4/3] rounded-[var(--radius-md)] bg-paper-2" />
      <div className="skeleton-pulse h-6 w-32 rounded-full bg-paper-2" />
      <div className="skeleton-pulse h-6 w-3/4 rounded-[var(--radius-sm)] bg-paper-2" />
      <div className="skeleton-pulse h-12 rounded-[var(--radius-sm)] bg-paper-2" />
      <div className="skeleton-pulse mt-4 h-11 rounded-full bg-paper-2" />
    </div>
  );
}
