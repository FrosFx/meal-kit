"use client";

import Link from "next/link";
import { useBox } from "@/context/BoxContext";

const peopleOptions: (2 | 4)[] = [2, 4];
const mealOptions: (2 | 3 | 4)[] = [2, 3, 4];

export default function KutijaPage() {
  const {
    plan,
    setPlan,
    selectedRecipes,
    removeRecipe,
    subtotal,
    deliveryFee,
    total,
    isBoxComplete,
  } = useBox();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Moja kutija</h1>

      <div className="mb-8 rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <h2 className="mb-4 font-semibold">Podesi plan</h2>
        <div className="mb-4">
          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            Broj osoba
          </p>
          <div className="flex gap-2">
            {peopleOptions.map((p) => (
              <button
                key={p}
                onClick={() => setPlan({ ...plan, people: p })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  plan.people === p
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300"
                }`}
              >
                {p} osobe
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            Obroka nedeljno
          </p>
          <div className="flex gap-2">
            {mealOptions.map((m) => (
              <button
                key={m}
                onClick={() => setPlan({ ...plan, mealsPerWeek: m })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  plan.mealsPerWeek === m
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 font-semibold">
          Izabrani obroci ({selectedRecipes.length}/{plan.mealsPerWeek})
        </h2>
        {selectedRecipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-zinc-500 dark:border-white/15">
            Kutija je prazna.{" "}
            <Link href="/meni" className="text-emerald-600 underline">
              Pogledaj nedeljni meni
            </Link>{" "}
            i dodaj obroke.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {selectedRecipes.map((recipe) => (
              <li
                key={recipe.id}
                className="flex items-center gap-4 rounded-xl border border-black/10 p-3 dark:border-white/10"
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-2xl ${recipe.color}`}
                >
                  {recipe.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{recipe.name}</p>
                  <p className="text-xs text-zinc-500">
                    {recipe.pricePerServing} RSD / porcija ×{" "}
                    {plan.people} ={" "}
                    {recipe.pricePerServing * plan.people} RSD
                  </p>
                </div>
                <button
                  onClick={() => removeRecipe(recipe.id)}
                  className="text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Ukloni
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedRecipes.length > 0 && (
        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Međuzbir</span>
            <span>{subtotal} RSD</span>
          </div>
          <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Dostava</span>
            <span>{deliveryFee} RSD</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2 font-semibold dark:border-white/10">
            <span>Ukupno</span>
            <span>{total} RSD</span>
          </div>

          {!isBoxComplete && (
            <p className="mt-3 text-sm text-amber-600">
              Dodaj još {plan.mealsPerWeek - selectedRecipes.length} obrok
              (a) da popuniš plan od {plan.mealsPerWeek} obroka nedeljno.
            </p>
          )}

          <Link
            href="/checkout"
            className="mt-4 block w-full rounded-full bg-emerald-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Nastavi na plaćanje →
          </Link>
        </div>
      )}
    </div>
  );
}
