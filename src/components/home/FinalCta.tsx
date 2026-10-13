import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function FinalCta() {
  return (
    <section className="w-full px-6 py-24">
      <Reveal>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-600 px-8 py-16 text-center shadow-2xl shadow-emerald-600/20">
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Spreman/na da probaš?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-emerald-50">
              Pogledaj nedeljni meni i sastavi svoju prvu kutiju za manje od dva
              minuta.
            </p>
            <Link
              href="/meni"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Pogledaj nedeljni meni
              <span>→</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
