import Link from "next/link";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import Icon, { type IconName } from "@/components/icons";

export interface Step {
  icon: IconName;
  title: string;
  text: string;
}

export default function HowItWorks({ steps }: { steps: Step[] }) {
  return (
    <section id="kako" aria-labelledby="kako-naslov" className="section-y">
      <div className="container-page">
        <Reveal>
          <SectionHeader
            id="kako-naslov"
            eyebrow="Kako funkcioniše"
            title={
              <>
                Tri koraka do <em>toplog</em> obroka
              </>
            }
            lede="Bez planiranja, bez spiska za kupovinu."
          />
        </Reveal>

        <ol className="mt-8 grid grid-cols-1 gap-8 md:mt-10 md:grid-cols-3 md:gap-6 lg:mt-12">
          {steps.map((step, i) => {
            const last = i === steps.length - 1;
            return (
              <Reveal
                as="li"
                key={step.title}
                delayMs={i * 120}
                className="relative grid grid-cols-[56px_1fr] gap-x-5 md:flex md:flex-col md:items-center md:text-center lg:items-start lg:text-left"
              >
                {!last && (
                  <>
                    {/* mobilni: vertikalna linija između krugova */}
                    <span
                      aria-hidden="true"
                      className="connector connector-y absolute top-16 -bottom-6 left-[27px] border-l-2 border-dashed border-line-strong md:hidden"
                    />
                    {/* desktop: horizontalna linija kroz centre krugova */}
                    <span
                      aria-hidden="true"
                      className="connector connector-x absolute top-7 right-[-16px] left-[72px] hidden border-t-2 border-dashed border-line-strong lg:block"
                    />
                  </>
                )}
                <span className="relative grid size-14 place-items-center rounded-full bg-mustard text-on-mustard">
                  <Icon name={step.icon} size="lg" />
                </span>
                <div className="md:mt-5">
                  <p
                    aria-hidden="true"
                    className="t-display-m tabular text-paprika italic"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="t-title mt-2 text-ink">
                    <span className="sr-only">Korak {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[36ch] text-ink-muted md:mx-auto lg:mx-0">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>

        <div className="mt-10 flex justify-center md:mt-12">
          <Link href="/meni" className="btn btn-secondary">
            Pogledaj nedeljni meni
          </Link>
        </div>
      </div>
    </section>
  );
}
