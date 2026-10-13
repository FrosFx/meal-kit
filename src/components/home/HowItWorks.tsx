import Reveal from "@/components/Reveal";

interface Step {
  emoji: string;
  title: string;
  text: string;
}

export default function HowItWorks({ steps }: { steps: Step[] }) {
  return (
    <section className="w-full max-w-5xl px-6 py-20">
      <Reveal>
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Kako funkcioniše
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Tri koraka do toplog obroka
          </h2>
        </div>
      </Reveal>

      <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-3">
        {/* connecting line on desktop */}
        <div className="pointer-events-none absolute top-12 left-1/6 hidden h-px w-2/3 bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 sm:block dark:from-emerald-800 dark:via-emerald-700 dark:to-emerald-800" />

        {steps.map((step, i) => (
          <Reveal key={step.title} delayMs={i * 150}>
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
                <span className="text-4xl">{step.emoji}</span>
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {step.text}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
