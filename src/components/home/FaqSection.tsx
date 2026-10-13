import nextDynamic from "next/dynamic";
import Reveal from "@/components/Reveal";

const FaqAccordion = nextDynamic(() => import("@/components/FaqAccordion"), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/5" />
  ),
});

export interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section className="w-full bg-white px-6 py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Pitanja
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Najčešća pitanja
            </h2>
          </div>
        </Reveal>
        <Reveal delayMs={100}>
          <FaqAccordion items={items} />
        </Reveal>
      </div>
    </section>
  );
}
