import Link from "next/link";
import type { HomeData } from "@/lib/home";
import Reveal from "@/components/Reveal";
import RecipeCard from "@/components/RecipeCard";
import SectionHeader from "@/components/SectionHeader";
import Plate from "@/components/Plate";
import Icon from "@/components/icons";
import RetryButton from "@/components/home/RetryButton";

// 375: prva 3, 768: prva 4, od 1024: svih 6.
function visibility(i: number) {
  if (i >= 4) return "hidden lg:block";
  if (i >= 3) return "hidden md:block";
  return "";
}

export default function MenuSection({ data }: { data: HomeData }) {
  const { status, featured, stats, tags } = data;
  const ok = status === "ok";
  const chips = tags.filter((t) => t.count > 0);

  return (
    <section id="meni" aria-labelledby="meni-naslov" className="section-y bg-paper">
      <div className="container-page">
        <Reveal className="flex items-end justify-between gap-6">
          <SectionHeader
            id="meni-naslov"
            eyebrow="Ova nedelja"
            title={
              <>
                Šta se kuva <em>ove</em> nedelje
              </>
            }
          />
          {ok && (
            <Link href="/meni" className="group btn btn-ghost hidden shrink-0 md:inline-flex">
              Ceo meni ({stats.recipeCount})
              <Icon name="arrow-right" className="btn-arrow group-hover:translate-x-1" />
            </Link>
          )}
        </Reveal>

        {ok ? (
          <>
            {chips.length > 0 && (
              <Reveal fade className="mt-6">
                <ul className="flex flex-wrap gap-2" aria-label="Filtriraj meni po oznaci">
                  {chips.map(({ tag, count }) => (
                    <li key={tag}>
                      <Link href={`/meni?tag=${encodeURIComponent(tag)}`} className="chip gap-0">
                        {tag}
                        <span className="tabular font-medium text-ink-muted">
                          {" · "}
                          {count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <ul className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-2 md:gap-6 lg:mt-12 lg:grid-cols-3 xl:gap-8">
              {featured.map((recipe, i) => (
                <Reveal
                  as="li"
                  key={recipe.id}
                  delayMs={(i % 3) * 70}
                  className={visibility(i)}
                >
                  <RecipeCard recipe={recipe} index={i} />
                </Reveal>
              ))}
            </ul>

            <div className="mt-10 flex justify-center md:mt-12">
              <Link href="/meni" className="group btn btn-primary btn-lg w-full sm:w-auto">
                Pogledaj svih {stats.recipeCount} recepata
                <Icon name="arrow-right" className="btn-arrow group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        ) : status === "empty" ? (
          <div className="mt-8 flex flex-col items-center rounded-[var(--radius-xl)] border-[1.5px] border-dashed border-line-strong bg-card p-8 text-center md:mt-10 md:p-12">
            <div className="flex -space-x-3">
              {[-8, 6, -4].map((tilt) => (
                <Plate key={tilt} recipe={null} tilt={tilt} className="size-20 md:size-24" />
              ))}
            </div>
            <h3 className="t-title mt-6 text-ink">Meni za ovu nedelju se upravo sprema</h3>
            <p className="mt-2 max-w-[48ch] text-ink-muted">
              Novi recepti stižu uskoro. Pogledaj kako funkcioniše ili se vrati za koji dan.
            </p>
            <Link href="#kako" className="btn btn-secondary mt-6">
              Kako funkcioniše
            </Link>
          </div>
        ) : (
          <div
            role="status"
            className="mt-8 flex flex-col items-center rounded-[var(--radius-xl)] border border-danger bg-danger-tint p-8 text-center md:mt-10 md:p-12"
          >
            <Icon name="alert-circle" size="lg" className="text-danger" />
            <h3 className="t-title mt-4 text-ink">Meni trenutno nije dostupan</h3>
            <p className="mt-2 max-w-[48ch] text-ink-muted">
              Došlo je do greške pri učitavanju recepata. Pokušaj ponovo za nekoliko trenutaka.
            </p>
            <RetryButton />
          </div>
        )}
      </div>
    </section>
  );
}
