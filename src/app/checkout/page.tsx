"use client";

import { useState } from "react";
import Link from "next/link";
import { useBox } from "@/context/BoxContext";

function generateOrderNumber() {
  return `MK-${Math.floor(100000 + Math.random() * 900000)}`;
}

export default function CheckoutPage() {
  const { selectedRecipes, plan, subtotal, deliveryFee, total, clearBox } =
    useBox();

  const [form, setForm] = useState({
    ime: "",
    email: "",
    adresa: "",
    grad: "",
    telefon: "",
    dan: "Ponedeljak",
  });
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ovo je mock checkout — ne postoji pravo plaćanje niti čuvanje porudžbine.
    const number = generateOrderNumber();
    setOrderNumber(number);
    clearBox();
  };

  if (orderNumber) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="mb-2 text-2xl font-bold">Porudžbina je potvrđena!</h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Broj porudžbine <span className="font-mono font-semibold">{orderNumber}</span>.
          Poslaćemo ti potvrdu i detalje dostave na email.
        </p>
        <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-500">
          Ovo je rani pregled proizvoda — plaćanje u ovom koraku nije izvršeno.
        </p>
        <Link
          href="/meni"
          className="inline-block rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Nazad na meni
        </Link>
      </div>
    );
  }

  if (selectedRecipes.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold">Kutija je prazna</h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Dodaj obroke pre nego što nastaviš na plaćanje.
        </p>
        <Link
          href="/meni"
          className="inline-block rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Pogledaj nedeljni meni
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="mb-6 text-2xl font-bold">Podaci za dostavu</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            required
            name="ime"
            value={form.ime}
            onChange={handleChange}
            placeholder="Ime i prezime"
            className="rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
          />
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email adresa"
            className="rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
          />
          <input
            required
            name="adresa"
            value={form.adresa}
            onChange={handleChange}
            placeholder="Ulica i broj"
            className="rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
          />
          <input
            required
            name="grad"
            value={form.grad}
            onChange={handleChange}
            placeholder="Grad"
            className="rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
          />
          <input
            required
            name="telefon"
            value={form.telefon}
            onChange={handleChange}
            placeholder="Broj telefona"
            className="rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
          />
          <div>
            <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              Željeni dan dostave
            </label>
            <select
              name="dan"
              value={form.dan}
              onChange={handleChange}
              className="w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
            >
              {["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak"].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Potvrdi porudžbinu ({total} RSD)
          </button>
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            Rani pregled proizvoda — plaćanje u ovom koraku nije izvršeno.
          </p>
        </form>
      </div>

      <div className="h-fit rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <h2 className="mb-4 font-semibold">Pregled porudžbine</h2>
        <p className="mb-3 text-sm text-zinc-500">
          Plan: {plan.people} osobe · {plan.mealsPerWeek} obroka nedeljno
        </p>
        <ul className="mb-4 flex flex-col gap-2">
          {selectedRecipes.map((r) => (
            <li key={r.id} className="flex justify-between text-sm">
              <span>
                {r.emoji} {r.name}
              </span>
              <span>{r.pricePerServing * plan.people} RSD</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-black/10 pt-2 text-sm dark:border-white/10">
          <span className="text-zinc-500">Međuzbir</span>
          <span>{subtotal} RSD</span>
        </div>
        <div className="flex justify-between pt-1 text-sm">
          <span className="text-zinc-500">Dostava</span>
          <span>{deliveryFee} RSD</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-black/10 pt-2 font-semibold dark:border-white/10">
          <span>Ukupno</span>
          <span>{total} RSD</span>
        </div>
      </div>
    </div>
  );
}
