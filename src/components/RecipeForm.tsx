"use client";

import { useState } from "react";
import { Recipe, Tag } from "@/lib/types";
import { ALL_TAGS } from "@/lib/tags";
import { COLOR_PRESETS } from "@/lib/colorPresets";

type RecipeFormData = Omit<Recipe, "id">;

const emptyForm: RecipeFormData = {
  name: "",
  description: "",
  emoji: "🍽️",
  color: COLOR_PRESETS[0].value,
  tags: [],
  prepMinutes: 20,
  calories: 500,
  pricePerServing: 600,
};

export default function RecipeForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Recipe;
  onSubmit: (data: RecipeFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<RecipeFormData>(initial ?? emptyForm);

  const toggleTag = (tag: Tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-black/10 p-5 dark:border-white/10"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[80px_1fr]">
        <div>
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            Emoji
          </label>
          <input
            required
            maxLength={4}
            value={form.emoji}
            onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-center text-xl outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            Naziv recepta
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          Opis
        </label>
        <textarea
          required
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          Boja placeholder &quot;fotografije&quot;
        </label>
        <select
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
        >
          {COLOR_PRESETS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-600 dark:text-zinc-400">
          Tagovi
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                form.tags.includes(tag)
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            Priprema (min)
          </label>
          <input
            required
            type="number"
            min={1}
            value={form.prepMinutes}
            onChange={(e) =>
              setForm({ ...form, prepMinutes: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            Kalorije
          </label>
          <input
            required
            type="number"
            min={0}
            value={form.calories}
            onChange={(e) =>
              setForm({ ...form, calories: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            Cena/porcija (RSD)
          </label>
          <input
            required
            type="number"
            min={0}
            value={form.pricePerServing}
            onChange={(e) =>
              setForm({ ...form, pricePerServing: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          {initial ? "Sačuvaj izmene" : "Dodaj recept"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold transition-colors hover:bg-white dark:border-zinc-700 dark:hover:bg-white/10"
        >
          Otkaži
        </button>
      </div>
    </form>
  );
}
