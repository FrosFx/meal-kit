import Reveal from "@/components/Reveal";

interface Benefit {
  emoji: string;
  title: string;
  text: string;
}

export default function WhyUs({ benefits }: { benefits: Benefit[] }) {
  return (
    <section className="w-full bg-white px-6 py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Zašto KutijaObroka
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Kuvanje bez glavobolje oko planiranja
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delayMs={i * 100}>
              <div className="group h-full rounded-2xl border border-black/5 bg-gradient-to-b from-zinc-50 to-white p-6 text-center transition-all hover:border-emerald-200 hover:shadow-lg dark:border-white/5 dark:from-zinc-900 dark:to-zinc-950 dark:hover:border-emerald-800">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl transition-transform group-hover:scale-110 dark:bg-emerald-900/40">
                  {b.emoji}
                </div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {b.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
