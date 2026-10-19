import type { HomeData } from "@/lib/home";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import Plate, { plateTilt } from "@/components/Plate";
import Icon from "@/components/icons";

const tile = "h-full rounded-[var(--radius-xl)] p-7 lg:p-10";

export default function WhyUs({ data }: { data: HomeData }) {
  const { status, featured, stats, tags } = data;
  const ok = status === "ok";
  const plates = [0, 1, 2].map((i) => (ok ? (featured[i] ?? null) : null));
  const tagBadges = ok ? tags.filter((t) => t.count > 0) : [];

  return (
    <section aria-labelledby="zasto-naslov" className="section-y">
      <div className="container-page">
        <Reveal>
          <SectionHeader
            id="zasto-naslov"
            eyebrow="Zašto KutijaObroka"
            title={
              <>
                Kuvanje bez <em>glavobolje</em> oko planiranja
              </>
            }
          />
        </Reveal>

        <ul className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-2 md:gap-6 lg:mt-12 xl:grid-cols-4 xl:grid-rows-[auto_auto] xl:gap-8">
          {/* A — izmereni sastojci */}
          <Reveal as="li" className="md:col-span-2 lg:col-span-1 xl:col-span-2 xl:row-span-2">
            <div
              className={`${tile} on-dark relative min-h-[360px] overflow-hidden bg-forest text-on-forest xl:min-h-[520px]`}
            >
              <Icon name="scale" size="lg" className="text-mustard" />
              <h3 className="t-display-m mt-6 max-w-[16ch] italic">
                Tačno onoliko koliko receptu treba.
              </h3>
              <p className="mt-4 max-w-[36ch] text-on-forest-muted">
                Sveži, izmereni sastojci. Bez pogađanja količina i bez bačene hrane.
              </p>
              <div aria-hidden="true" className="absolute -right-8 -bottom-10 flex items-end -space-x-6 xl:right-0 xl:-bottom-[72px] xl:left-0 xl:justify-center">
                {plates.map((recipe, i) => (
                  <span
                    key={i}
                    className="rise-child"
                    style={{ transitionDelay: `${150 + i * 90}ms` }}
                  >
                    <Plate
                      recipe={recipe}
                      tilt={plateTilt(i)}
                      className={i === 1 ? "size-32 lg:size-40 xl:size-60" : "size-24 lg:size-32 xl:size-[180px]"}
                    />
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* B — manje vremena */}
          <Reveal as="li" delayMs={90} className="xl:col-span-2">
            <div className={`${tile} bg-mustard text-on-mustard`}>
              {ok ? (
                <>
                  <h3 className="t-title">Manje vremena u kuhinji</h3>
                  <p className="t-display-l tabular mt-3">
                    {stats.quickRecipeCount}/{stats.recipeCount}
                  </p>
                  <p className="mt-2 max-w-[44ch]">
                    recepata je gotovo za 30 minuta ili manje, uz jasna uputstva korak po korak.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="t-display-m">Većina recepata za 30 minuta</h3>
                  <p className="mt-3 max-w-[44ch]">
                    Manje vremena u kuhinji, uz jasna uputstva korak po korak.
                  </p>
                </>
              )}
            </div>
          </Reveal>

          {/* C — fleksibilan plan */}
          <Reveal as="li" delayMs={180}>
            <div className={`${tile} card`}>
              <Icon name="calendar-sync" size="lg" className="text-basil" />
              <h3 className="t-title mt-4 text-ink">Fleksibilan plan</h3>
              <p className="mt-2 text-ink-muted">
                Menjaš broj obroka i veličinu porcija iz nedelje u nedelju, bez dugoročne obaveze.
              </p>
            </div>
          </Reveal>

          {/* D — nešto za svakoga */}
          <Reveal as="li" delayMs={270} className="md:col-span-2 lg:col-span-1">
            <div className={`${tile} card`}>
              <Icon name="leaf" size="lg" className="text-basil" />
              <h3 className="t-title mt-4 text-ink">Nešto za svakoga</h3>
              <p className="mt-2 text-ink-muted">
                Vegetarijansko, bez glutena, brzo, porodično — filtriraš po tome šta ti treba.
              </p>
              {tagBadges.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Oznake na meniju">
                  {tagBadges.map(({ tag }) => (
                    <li key={tag} className="badge">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </ul>
      </div>
    </section>
  );
}
