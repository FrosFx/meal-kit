import Link from "next/link";

interface HeroStat {
  value: string;
  label: string;
}

interface HeroCircle {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export default function Hero({
  stats,
  showcase,
}: {
  stats: HeroStat[];
  showcase: HeroCircle[];
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-6 pt-28 pb-24 text-center dark:from-emerald-950/40 dark:via-zinc-950 dark:to-black">
      {/* decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-700/20" />
      <div className="pointer-events-none absolute -top-12 right-0 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-600/10" />

      <div className="relative mx-auto max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Sveži sastojci · Provereni recepti
        </span>

        <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Kuvaj kao{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            profesionalac
          </span>
          ,<br className="hidden sm:block" /> bez odlaska u prodavnicu
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Svake nedelje biraš obroke, mi ti šaljemo tačno izmerene sastojke i
          jednostavne recepte — spremno za kuvanje za manje od 30 minuta.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/meni"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 sm:w-auto"
          >
            Pogledaj nedeljni meni
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/kutija"
            className="inline-flex w-full items-center justify-center rounded-full border-2 border-zinc-300 px-8 py-4 text-base font-semibold transition-all hover:border-emerald-500 hover:text-emerald-600 sm:w-auto dark:border-zinc-700 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
          >
            Moja kutija
          </Link>
        </div>
      </div>

      {/* stats row */}
      <div className="relative mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* floating recipe circles */}
      {showcase.length > 0 && (
        <div className="relative mx-auto mt-14 flex max-w-2xl flex-wrap items-center justify-center gap-4">
          {showcase.map((r, i) => (
            <div
              key={r.id}
              className={`group flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-3xl shadow-md transition-transform hover:scale-110 ${r.color} ${
                i % 2 === 0 ? "animate-[float_4s_ease-in-out_infinite]" : "animate-[float_5s_ease-in-out_infinite_0.5s]"
              }`}
              title={r.name}
              style={{
                animationDelay: `${i * 0.3}s`,
              }}
            >
              {r.emoji}
            </div>
          ))}
          <Link
            href="/meni"
            className="text-sm font-semibold text-emerald-700 underline underline-offset-4 dark:text-emerald-400"
          >
            i još…
          </Link>
        </div>
      )}

    </section>
  );
}
