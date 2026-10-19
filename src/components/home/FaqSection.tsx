import Link from "next/link";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import FaqAccordion, { type FaqItem } from "@/components/FaqAccordion";

export default function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section id="pitanja" aria-labelledby="pitanja-naslov" className="section-y">
      <div className="container-page grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-12 lg:gap-6 xl:gap-8">
        <div className="max-w-[720px] lg:col-span-4">
          <Reveal className="lg:sticky lg:top-28">
            <SectionHeader
              id="pitanja-naslov"
              eyebrow="Pitanja"
              title={
                <>
                  Najčešća <em>pitanja</em>
                </>
              }
              lede="Tačnu cenu i sadržaj kutije uvek vidiš pre nego što potvrdiš porudžbinu."
            />
            <Link href="/meni" className="btn btn-ghost -ml-2 mt-4 hidden lg:inline-flex">
              Sastavi kutiju
            </Link>
          </Reveal>
        </div>
        <div className="max-w-[720px] lg:col-span-7 lg:col-start-6">
          <FaqAccordion items={items} />
        </div>
      </div>
    </section>
  );
}
