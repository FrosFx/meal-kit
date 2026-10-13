import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { Recipe } from "@/lib/types";

export default function RecipeShowcase({ recipes }: { recipes: Recipe[] }) {
  if (recipes.length === 0) return null;

  return (
    <section className="w-full max-w-6xl px-6 py-20">
      <Reveal>
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Ova nedelja
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Iz nedeljnog menija
            </h2>
          </div>
          <Link
            href="/meni"
            className="hidden shrink-0 rounded-full border-2 border-zinc-200 px-5 py-2 text-sm font-semibold transition-colors hover:border-emerald-500 hover:text-emerald-600 sm:inline-block dark:border-zinc-700 dark:hover:border-emerald-500"
          >
            Ceo meni →
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe, i) => (
          <Reveal key={recipe.id} delayMs={i * 100}>
            <article className="group flex flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-zinc-950">
              <div
                className={`relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br ${recipe.color}`}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 2px, transparent 2px), radial-gradient(circle at 75% 65%, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 3px, transparent 3px)",
                    backgroundSize: "32px 32px, 44px 44px",
                  }}
                />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/40 text-6xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 dark:bg-black/20">
                  {recipe.emoji}
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {recipe.prepMinutes} min
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold leading-snug">
                    {recipe.name}
                  </h3>
                  <span className="shrink-0 whitespace-nowrap text-lg font-bold text-emerald-600">
                    {recipe.pricePerServing} RSD
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {recipe.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>🔥 {recipe.calories} kcal</span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Link
        href="/meni"
        className="mt-8 block text-center text-sm font-semibold text-emerald-700 underline underline-offset-4 sm:hidden dark:text-emerald-400"
      >
        Ceo meni →
      </Link>
    </section>
  );
}
