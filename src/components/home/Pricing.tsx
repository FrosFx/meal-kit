"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useBox } from "@/context/BoxContext";
import type { Plan } from "@/lib/types";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import Icon from "@/components/icons";
import { formatNumber, formatRsd } from "@/components/format";

type Meals = Plan["mealsPerWeek"];
const MEAL_OPTIONS: Meals[] = [2, 3, 4];

const plans: {
  people: Plan["people"];
  sticker: string;
  featured: boolean;
}[] = [
  { people: 2, sticker: "Za parove", featured: true },
  { people: 4, sticker: "Za porodicu", featured: false },
];

export default function Pricing({
  minPrice,
  maxPrice,
  deliveryFee,
}: {
  minPrice: number;
  maxPrice: number;
  deliveryFee: number;
}) {
  const router = useRouter();
  const { setPlan } = useBox();
  const [meals, setMeals] = useState<Meals>(3);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Strelice pomeraju izbor (radiogroup obrazac).
  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + MEAL_OPTIONS.length) % MEAL_OPTIONS.length;
    setMeals(MEAL_OPTIONS[next]);
    optionRefs.current[next]?.focus();
  };

  const choose = (people: Plan["people"]) => {
    setPlan({ people, mealsPerWeek: meals });
    router.push("/meni");
  };

  return (
    <section id="cene" aria-labelledby="cene-naslov" className="section-y bg-paper-2">
      <div className="container-page">
        <Reveal>
          <SectionHeader
            id="cene-naslov"
            center
            eyebrow="Okvirna cena"
            title={
              <>
                Plaćaš samo ono što <em>izabereš</em>
              </>
            }
            lede={`Cena zavisi od recepata koje izabereš. Bez skrivenih troškova — dostava je ${formatRsd(deliveryFee)} po kutiji.`}
          />
        </Reveal>

        <div className="mx-auto mt-8 flex max-w-[880px] flex-col items-stretch gap-3 sm:items-center md:mt-10 lg:mt-12">
          <p id="obroka-label" className="font-semibold text-ink">
            Obroka nedeljno:
          </p>
          <div
            role="radiogroup"
            aria-labelledby="obroka-label"
            className="grid grid-cols-3 gap-1 rounded-full bg-paper p-1 sm:w-80"
          >
            {MEAL_OPTIONS.map((option, i) => {
              const checked = option === meals;
              return (
                <button
                  key={option}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked ? 0 : -1}
                  onClick={() => setMeals(option)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`tabular min-h-11 rounded-full text-[17px] transition-[background-color,box-shadow,color] duration-150 ${
                    checked
                      ? "bg-card font-semibold text-ink shadow-sm"
                      : "font-medium text-ink-muted hover:bg-card/60"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <ul className="mx-auto mt-8 grid max-w-[720px] grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:max-w-[880px]">
          {plans.map((plan, i) => {
            const low = minPrice * plan.people * meals + deliveryFee;
            const high = maxPrice * plan.people * meals + deliveryFee;
            return (
              <Reveal as="li" key={plan.people} delayMs={i * 100}>
                <div
                  className={`relative flex h-full flex-col rounded-[var(--radius-xl)] bg-card p-8 ${
                    plan.featured
                      ? "border-2 border-paprika shadow-md"
                      : "border border-line shadow-sm"
                  }`}
                >
                  <span
                    className={`sticker absolute -top-3 right-6 ${
                      plan.featured ? "" : "bg-basil-tint text-basil"
                    }`}
                  >
                    {plan.sticker}
                  </span>
                  <h3 className="t-title text-ink">{plan.people} osobe</h3>
                  <p className="mt-3">
                    <span
                      key={meals}
                      className="num-swap t-display-m tabular inline-block min-w-[9ch] text-ink"
                    >
                      {formatNumber(low)} – {formatNumber(high)}
                    </span>
                    <span className="t-meta block text-ink-muted">RSD nedeljno</span>
                  </p>
                  <ul className="t-meta mt-6 flex flex-col gap-2.5 text-ink">
                    {[
                      `${meals} obroka × ${plan.people} porcije`,
                      `od ${formatRsd(minPrice)} po porciji`,
                      `Dostava ${formatRsd(deliveryFee)} uključena`,
                      "Plan menjaš pre svake porudžbine",
                    ].map((line) => (
                      <li key={line} className="flex items-center gap-2">
                        <Icon name="check" size="sm" className="shrink-0 text-basil" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => choose(plan.people)}
                    aria-label={`Izaberi plan za ${plan.people} osobe, ${meals} obroka nedeljno`}
                    className={`btn btn-lg mt-8 w-full ${
                      plan.featured ? "btn-primary" : "btn-secondary"
                    }`}
                  >
                    Izaberi plan
                  </button>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <p className="t-meta mx-auto mt-6 max-w-[62ch] text-center text-ink-muted">
          Okvirno, na osnovu trenutnog menija — tačnu cenu vidiš pre potvrde porudžbine.
        </p>
      </div>
    </section>
  );
}
