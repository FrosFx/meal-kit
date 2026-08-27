import Link from "next/link";
import nextDynamic from "next/dynamic";
import { db } from "@/lib/db";
import { toAppRecipe } from "@/lib/recipeSerialization";
import RecipeCard from "@/components/RecipeCard";
import Reveal from "@/components/Reveal";

// Stranica čita recepte direktno iz baze -- bez ovoga bi Next.js
// "zamrzao" ove brojke u trenutku build-a umesto da ih osvežava pri
// svakoj poseti (a admin panel menja recepte u bilo kom trenutku).
// Napomena: ime "dynamic" je rezervisano za ovaj izvoz od strane
// Next.js-a, zato je next/dynamic uvezen ovde kao nextDynamic.
export const dynamic = "force-dynamic";

// FAQ nosi sopstveni state (koja stavka je otvorena) i nije potreban za
// prvi prikaz stranice, pa se lenjo učitava kao poseban JS paket -- učita
// se tek kad je stranica spremna, umesto da uveća početni bandl.
const FaqAccordion = nextDynamic(() => import("@/components/FaqAccordion"), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/5" />
  ),
});

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

const benefits = [
  {
    emoji: "🥕",
    title: "Sveži, izmereni sastojci",
    text: "Tačno onoliko koliko receptu treba — bez pogađanja količina i bez bačene hrane.",
  },
  {
    emoji: "⏱️",
    title: "Manje vremena u kuhinji",
    text: "Većina recepata je gotova za manje od 30 minuta, uz jasna uputstva korak po korak.",
  },
  {
    emoji: "🗓️",
    title: "Fleksibilan plan",
    text: "Menjaš broj obroka i veličinu porcija iz nedelje u nedelju, bez dugoročne obaveze.",
  },
  {
    emoji: "🌱",
    title: "Nešto za svakoga",
    text: "Vegetarijansko, bez glutena, brzo za pripremu, porodično — filtriraš po tome šta ti treba.",
  },
];

const faqItems = [
  {
    question: "Kako biram obroke svake nedelje?",
    answer:
      "Meni se menja nedeljno. Pregledaš ponudu, filtriraš po tagovima (vegetarijansko, brzo, bez glutena...) i dodaješ obroke u kutiju dok ne popuniš plan.",
  },
  {
    question: "Mogu li da promenim broj obroka ili osoba?",
    answer:
      "Da, plan (broj osoba i broj obroka nedeljno) menjaš u svakom trenutku u sekciji \"Moja kutija\", pre nego što potvrdiš porudžbinu.",
  },
  {
    question: "Ima li vegetarijanskih ili bezglutenskih opcija?",
    answer:
      "Da — svaki recept je označen tagovima, tako da lako filtriraš meni po ishrani koja ti odgovara.",
  },
  {
    question: "Koliko traje priprema obroka?",
    answer:
      "Većina recepata je spremna za manje od 30 minuta, uz sastojke koji stižu već izmereni.",
  },
  {
    question: "Kako se formira cena?",
    answer:
      "Cena zavisi od izabranih recepata (varira po porciji) i broja osoba, plus fiksna dostava po kutiji. Tačan iznos vidiš pre potvrde porudžbine.",
  },
];

export default async function Home() {
  const rows = await db.recipe.findMany({ orderBy: { createdAt: "asc" } });
  const recipes = rows.map(toAppRecipe);
  const prices = recipes.map((r) => r.pricePerServing);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const showcase = recipes.slice(0, 5);
  const preview = recipes.slice(0, 3);

  const stats = [
    { value: `${recipes.length || "—"}`, label: "recepata na meniju" },
    { value: minPrice ? `od ${minPrice} RSD` : "—", label: "po porciji" },
    { value: "< 30 min", label: "do gotovog obroka" },
  ];

  const deliveryFee = 350;
  const weeklyEstimate = (people: 2 | 4) =>
    minPrice && maxPrice
      ? {
          low: minPrice * people * 3 + deliveryFee,
          high: maxPrice * people * 3 + deliveryFee,
        }
      : null;

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

      {preview.length > 0 && (
        <Reveal className="w-full max-w-5xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                Ova nedelja
              </p>
              <h2 className="text-2xl font-bold">Iz nedeljnog menija</h2>
            </div>
            <Link
              href="/meni"
              className="hidden shrink-0 text-sm font-medium text-emerald-700 underline underline-offset-2 sm:inline dark:text-emerald-400"
            >
              Ceo meni →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {preview.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <Link
            href="/meni"
            className="mt-6 block text-center text-sm font-medium text-emerald-700 underline underline-offset-2 sm:hidden dark:text-emerald-400"
          >
            Ceo meni →
          </Link>
        </Reveal>
      )}

      <Reveal className="w-full bg-white px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Zašto KutijaObroka
          </p>
          <h2 className="mb-10 text-center text-2xl font-bold">
            Kuvanje bez glavobolje oko planiranja
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <div className="mb-3 text-3xl">{b.emoji}</div>
                <h3 className="mb-1 font-semibold">{b.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {minPrice !== null && maxPrice !== null && (
        <Reveal className="w-full max-w-3xl px-6 py-16">
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Okvirna cena
          </p>
          <h2 className="mb-8 text-center text-2xl font-bold">
            Plaćaš samo ono što izabereš
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {([2, 4] as const).map((people) => {
              const estimate = weeklyEstimate(people);
              return (
                <div
                  key={people}
                  className="rounded-2xl border border-black/10 p-6 text-center dark:border-white/10"
                >
                  <p className="text-sm text-zinc-500">{people} osobe</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {estimate ? `${estimate.low}–${estimate.high} RSD` : "—"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    nedeljno · 3 obroka · dostava uključena
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
            Okvirno, na osnovu trenutnog menija — tačnu cenu vidiš pri
            sklapanju kutije.
          </p>
          <div className="mt-6 text-center">
            <Link
              href="/kutija"
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Sastavi svoju kutiju
            </Link>
          </div>
        </Reveal>
      )}

      <Reveal className="w-full bg-white px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Pitanja
          </p>
          <h2 className="mb-8 text-center text-2xl font-bold">
            Najčešća pitanja
          </h2>
          <FaqAccordion items={faqItems} />
        </div>
      </Reveal>

      <Reveal className="w-full px-6 py-20 text-center">
        <h2 className="mb-3 text-2xl font-bold">Spreman/na da probaš?</h2>
        <p className="mx-auto mb-6 max-w-md text-zinc-600 dark:text-zinc-400">
          Pogledaj nedeljni meni i sastavi svoju prvu kutiju za manje od dva
          minuta.
        </p>
        <Link
          href="/meni"
          className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Pogledaj nedeljni meni
        </Link>
      </Reveal>
    </div>
  );
}
