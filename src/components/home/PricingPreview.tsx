import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function PricingPreview({
  minPrice,
  maxPrice,
}: {
  minPrice: number | null;
  maxPrice: number | null;
}) {
  if (minPrice === null || maxPrice === null) return null;

  const deliveryFee = 350;

  const cards = [
    {
      people: 2,
      label: "2 osobe",
      low: minPrice * 2 * 3 + deliveryFee,
      high: maxPrice * 2 * 3 + deliveryFee,
    },
    {
      people: 4,
      label: "4 osobe",
      low: minPrice * 4 * 3 + deliveryFee,
      high: maxPrice * 4 * 3 + deliveryFee,
    },
  ];

  return (
    <section className="w-full max-w-4xl px-6 py-20">
      <Reveal>
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Okvirna cena
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Plaćaš samo ono što izabereš
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {cards.map((card, i) => (
          <Reveal key={card.people} delayMs={i * 100}>
            <div className="rounded-3xl border-2 border-black/10 p-8 text-center transition-all hover:border-emerald-300 hover:shadow-lg dark:border-white/10 dark:hover:border-emerald-700">
              <p className="text-sm font-medium text-zinc-500">{card.label}</p>
              <p className="mt-2 text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {card.low.toLocaleString("sr")}–{card.high.toLocaleString("sr")}
              </p>
              <p className="mt-1 text-sm text-zinc-500">RSD nedeljno</p>
              <div className="mt-4 border-t border-black/5 pt-4 text-xs text-zinc-400 dark:border-white/5">
                3 obroka nedeljno · dostava uključena
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
        Okvirno, na osnovu trenutnog menija — tačnu cenu vidiš pri sklapanju
        kutije.
      </p>

      <div className="mt-8 text-center">
        <Link
          href="/kutija"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-xl"
        >
          Sastavi svoju kutiju
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
