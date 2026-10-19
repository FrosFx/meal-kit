import Link from "next/link";
import type { CSSProperties } from "react";
import type { HomeData } from "@/lib/home";
import Reveal from "@/components/Reveal";
import Plate, { plateTilt } from "@/components/Plate";
import Icon from "@/components/icons";

export default function FinalCta({ data }: { data: HomeData }) {
  const { status, featured, stats } = data;
  const ok = status === "ok";
  // 5 tanjira (na 375 samo 3); recepti se ponavljaju ako ih ima manje.
  const plates = Array.from({ length: 5 }, (_, i) =>
    ok && featured.length ? featured[i % featured.length] : null
  );

  return (
    <section
      aria-labelledby="cta-naslov"
      className="on-dark relative overflow-hidden bg-forest pt-24 pb-44 text-center md:pb-52 lg:pt-32 lg:pb-56"
    >
      <Reveal className="container-page relative z-10 flex flex-col items-center">
        <p className="t-eyebrow text-mustard">Ove nedelje</p>
        <h2 id="cta-naslov" className="t-display-l mt-3 max-w-[18ch] text-on-forest">
          Ti kuvaš. Sve ostalo je <em className="italic">već u kutiji</em>.
        </h2>
        <p className="t-body-l mt-5 max-w-[48ch] text-on-forest-muted">
          {ok
            ? `Pogledaj ${stats.recipeCount} recepata ove nedelje i sastavi svoju prvu kutiju za manje od dva minuta.`
            : "Pogledaj nedeljni meni i sastavi svoju prvu kutiju za manje od dva minuta."}
        </p>
        <Link href="/meni" className="group btn btn-primary btn-lg mt-8 w-full sm:w-auto">
          Pogledaj nedeljni meni
          <Icon name="arrow-right" className="btn-arrow group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <Reveal
        fade
        className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-[40%] justify-center gap-4 md:gap-6"
      >
        {plates.map((recipe, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`rise-child ${i >= 3 ? "hidden md:block" : ""}`}
            style={{ "--rise": "48px", transitionDelay: `${i * 80}ms` } as CSSProperties}
          >
            <Plate recipe={recipe} tilt={plateTilt(i)} className="size-24 md:size-40" />
          </span>
        ))}
      </Reveal>
    </section>
  );
}
