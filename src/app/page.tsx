import Link from "next/link";
import { db } from "@/lib/db";

const steps = [
  {
    emoji: "📋",
    title: "Izaberi plan",
    text: "Odaberi veličinu domaćinstva i koliko obroka nedeljno želiš da kuvaš.",
  },
  {
    emoji: "🍽️",
    title: "Izaberi recepte",
    text: "Pregledaj nedeljni meni i dodaj obroke koji te zanimaju u kutiju.",
  },
  {
    emoji: "🚚",
    title: "Dostava do vrata",
    text: "Sastojci i recepti stižu isečeni, izmereni i spremni za kuvanje.",
  },
];

export default async function Home() {
  const recipes = await db.recipe.findMany();
  const prices = recipes.map((r) => r.pricePerServing);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const showcase = recipes.slice(0, 5);

  const stats = [
    { value: `${recipes.length || "—"}`, label: "recepata na meniju" },
    { value: minPrice ? `od ${minPrice} RSD` : "—", label: "po porciji" },
    { value: "< 30 min", label: "do gotovog obroka" },
  ];

  return (
    <div className="flex flex-col items-center">
      <section className="w-full bg-gradient-to-b from-emerald-50 to-zinc-50 px-6 py-20 text-center dark:from-emerald-950/30 dark:to-black">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Sveži sastojci · Provereni recepti
        </p>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Kuvaj kao profesionalac, bez odlaska u prodavnicu
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Svake nedelje biraš obroke, mi ti šaljemo tačno izmerene sastojke i
          jednostavne recepte — spremno za kuvanje za manje od 30 minuta.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/meni"
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Pogledaj nedeljni meni
          </Link>
          <Link
            href="/kutija"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold transition-colors hover:bg-white dark:border-zinc-700 dark:hover:bg-white/10"
          >
            Moja kutija
          </Link>
        </div>

        <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {stat.value}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {showcase.length > 0 && (
          <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-3">
            {showcase.map((r) => (
              <div
                key={r.id}
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-2xl shadow-sm ${r.color}`}
                title={r.name}
              >
                {r.emoji}
              </div>
            ))}
            <Link
              href="/meni"
              className="text-sm font-medium text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
            >
              i još...
            </Link>
          </div>
        )}
      </section>

      <section className="grid w-full max-w-5xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="text-center">
            <div className="mb-3 text-4xl">{step.emoji}</div>
            <h2 className="mb-1 font-semibold">{step.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {step.text}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
