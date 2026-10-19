import Link from "next/link";
import type { CSSProperties } from "react";
import type { HomeData } from "@/lib/home";
import { formatNumber, formatRsd } from "@/components/format";
import Plate, { plateTilt } from "@/components/Plate";
import Icon, { type IconName } from "@/components/icons";

const promises: { icon: IconName; label: string }[] = [
  { icon: "scale", label: "Izmereni sastojci" },
  { icon: "chef-hat", label: "Recepti korak po korak" },
  { icon: "truck", label: "Dostava do vrata" },
];

// Raspored tanjira: mobilni/tablet red (srednji najveći, napred),
// od 1024 slobodna kompozicija. Redosled u DOM-u: mali, veliki, mali.
const plateSlots = [
  {
    recipeIndex: 1,
    className:
      "size-24 md:size-[140px] lg:absolute lg:right-0 lg:top-0 lg:size-[180px] xl:size-[220px]",
  },
  {
    recipeIndex: 0,
    className:
      "z-10 size-40 md:size-[220px] lg:absolute lg:left-[6%] lg:top-[90px] lg:size-80 xl:top-[90px] xl:size-[400px]",
  },
  {
    recipeIndex: 2,
    className:
      "z-20 size-24 md:size-[140px] lg:absolute lg:bottom-0 lg:left-0 lg:size-40 xl:size-[190px]",
  },
];

export default function Hero({ data }: { data: HomeData }) {
  const { status, stats, featured, deliveryFee } = data;
  const ok = status === "ok";
  const plates = featured.slice(0, 3);
  const minPrice = stats.minPrice;

  const eyebrow =
    status === "ok"
      ? `Nedeljni meni · ${stats.recipeCount} recepata`
      : status === "empty"
        ? "Novi meni stiže uskoro"
        : "Nedeljni meni";

  return (
    <section
      aria-labelledby="hero-naslov"
      className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-20 lg:flex lg:min-h-[min(calc(100dvh-120px),860px)] lg:items-center lg:py-16 xl:min-h-[min(calc(100dvh-140px),860px)] xl:py-12"
    >
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-6 xl:gap-8">
        {/* Tekst */}
        <div className="max-w-[600px] lg:col-span-6 lg:max-w-none">
          <p className="anim-rise t-meta inline-flex items-center gap-2 rounded-full bg-basil-tint px-3.5 py-1.5 font-semibold text-basil">
            <Icon name="leaf" size="sm" />
            {eyebrow}
          </p>

          <h1 id="hero-naslov" className="t-display-xl mt-6 text-ink xl:mt-5">
            Večera za{" "}
            <span className="whitespace-nowrap">
            <em className="relative inline-block italic">
              30 minuta
              <svg
                aria-hidden="true"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
                className="absolute -bottom-[0.1em] left-[-2%] -z-10 h-[0.32em] w-[104%] text-mustard"
              >
                <path
                  className="swash-path"
                  pathLength={1}
                  d="M4 15 C 50 6, 120 3, 196 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                />
              </svg>
            </em>
            ,
            </span>{" "}
            bez odlaska u prodavnicu.
          </h1>

          <p className="t-body-l mt-6 max-w-[46ch] text-ink-muted xl:mt-5">
            Svake nedelje biraš obroke, a mi ti šaljemo tačno izmerene sastojke
            i jednostavne recepte korak po korak.
          </p>

          <div
            className="anim-rise mt-8 flex flex-col xl:mt-7 items-center gap-2 sm:flex-row sm:gap-4"
            style={{ animationDelay: "150ms" }}
          >
            <Link href="/meni" className="group btn btn-primary btn-lg w-full sm:w-auto">
              Pogledaj nedeljni meni
              <Icon name="arrow-right" className="btn-arrow group-hover:translate-x-1" />
            </Link>
            <Link href="#kako" className="btn btn-ghost">
              Kako funkcioniše
            </Link>
          </div>

          {ok ? (
            <dl
              className="anim-rise mt-10 grid max-w-[520px] xl:mt-8 grid-cols-[repeat(3,auto)] justify-start divide-x divide-line sm:grid-cols-3"
              style={{ animationDelay: "250ms" }}
            >
              <Stat value={formatNumber(stats.recipeCount)} label="recepata ove nedelje" />
              <Stat
                value={minPrice !== null ? `od ${formatNumber(minPrice)}` : "—"}
                label="RSD po porciji"
              />
              <Stat
                value="≤ 30 min"
                label={`${stats.quickRecipeCount} od ${stats.recipeCount} recepata`}
              />
            </dl>
          ) : (
            <ul
              className="anim-rise mt-10 grid max-w-[520px] xl:mt-8 grid-cols-[repeat(3,auto)] justify-start divide-x divide-line sm:grid-cols-3"
              style={{ animationDelay: "250ms" }}
            >
              {promises.map((p) => (
                <li key={p.label} className="flex flex-col gap-2 px-3 first:pl-0 sm:px-5">
                  <Icon name={p.icon} size="lg" className="text-basil" />
                  <span className="t-meta text-ink">{p.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tanjiri */}
        <div className="relative lg:col-span-6">
          <div
            role="img"
            aria-label={
              ok
                ? `Recepti ove nedelje: ${plates.map((r) => r.name).join(", ")}`
                : "Prazni tanjiri — novi meni stiže uskoro"
            }
            className="relative flex items-center justify-center -space-x-4 md:justify-start lg:h-[540px] lg:space-x-0 xl:h-[600px]"
          >
            {/* "podmetač" iza velikog tanjira */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute hidden rounded-full border-2 border-mustard opacity-35 lg:block lg:top-[50px] lg:left-[calc(6%-40px)] lg:size-[400px] xl:top-[40px] xl:left-[calc(6%-50px)] xl:size-[500px]"
            />
            {plateSlots.map((slot, i) => {
              const recipe = ok ? (plates[slot.recipeIndex] ?? null) : null;
              const tilt = plateTilt(slot.recipeIndex);
              const style = {
                animationDelay: `${200 + i * 90}ms`,
              } as CSSProperties;
              return (
                <Plate
                  key={slot.recipeIndex}
                  recipe={recipe}
                  tilt={tilt}
                  className={`anim-plate relative ${slot.className}`}
                  style={style}
                  sticker={
                    slot.recipeIndex === 0 && ok && minPrice !== null
                      ? `od ${formatRsd(minPrice)}`
                      : undefined
                  }
                />
              );
            })}
          </div>

          {ok && minPrice !== null && (
            <div className="anim-receipt card absolute right-0 bottom-0 z-30 hidden w-56 -rotate-3 p-5 shadow-lg md:block lg:bottom-6 xl:bottom-10">
              <p className="t-meta font-semibold text-ink">Kutija za 2 osobe</p>
              <ul className="t-meta tabular mt-2 flex flex-col gap-1 text-ink-muted">
                <li>3 obroka × 2 porcije</li>
                <li>Dostava {formatRsd(deliveryFee)}</li>
              </ul>
              <p className="fraunces tabular mt-3 border-t border-dashed border-line-strong pt-3 text-xl font-semibold text-paprika">
                od {formatRsd(2 * 3 * minPrice + deliveryFee)}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-1 px-3 first:pl-0 last:pr-0 sm:px-5">
      <dt className="t-meta text-ink-muted">{label}</dt>
      <dd className="t-display-m tabular whitespace-nowrap text-ink">{value}</dd>
    </div>
  );
}
