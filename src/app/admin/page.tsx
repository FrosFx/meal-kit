"use client";

import { useEffect, useState } from "react";
import { useRecipes } from "@/context/RecipeContext";
import { Recipe } from "@/lib/types";
import RecipeForm from "@/components/RecipeForm";

// NAPOMENA: Ovo je samo osnovna zaštita za prototip, ne prava
// autentifikacija. Lozinka je vidljiva u izvornom kodu i proverava se
// na klijentu — ne koristiti ovako u pravoj (produkcionoj) aplikaciji.
const ADMIN_PASSWORD = "meal-kit-admin";
const AUTH_KEY = "meal-kit-admin-auth";

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      try {
        window.sessionStorage.setItem(AUTH_KEY, "true");
      } catch {
        // sessionStorage možda nije dostupan
      }
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="mb-4 text-xl font-bold">Admin panel</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          autoFocus
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Lozinka"
          className="rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-zinc-900"
        />
        {error && (
          <p className="text-sm text-red-500">Pogrešna lozinka, pokušaj ponovo.</p>
        )}
        <button
          type="submit"
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Uloguj se
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { recipes, addRecipe, updateRecipe, deleteRecipe, resetToDefaults } =
    useRecipes();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthed(window.sessionStorage.getItem(AUTH_KEY) === "true");
    } catch {
      // sessionStorage možda nije dostupan
    } finally {
      setCheckedAuth(true);
    }
  }, []);

  const handleLogout = () => {
    try {
      window.sessionStorage.removeItem(AUTH_KEY);
    } catch {
      // ignoriši
    }
    setAuthed(false);
  };

  if (!checkedAuth) return null;
  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;

  const editingRecipe: Recipe | undefined = recipes.find(
    (r) => r.id === editingId
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin panel — recepti</h1>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Izloguj se
        </button>
      </div>

      <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        Izmene se čuvaju samo u ovom browseru (localStorage) — ovo je
        prototip bez prave baze podataka.
      </div>

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => {
            setShowAddForm((v) => !v);
            setEditingId(null);
          }}
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          {showAddForm ? "Zatvori formu" : "+ Dodaj novi recept"}
        </button>
        <button
          onClick={() => {
            if (confirm("Vratiti meni na podrazumevane recepte? Sve izmene će biti izgubljene.")) {
              resetToDefaults();
            }
          }}
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold transition-colors hover:bg-white dark:border-zinc-700 dark:hover:bg-white/10"
        >
          Resetuj na podrazumevano
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8">
          <RecipeForm
            onSubmit={(data) => {
              addRecipe(data);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {recipes.map((recipe) =>
          editingId === recipe.id ? (
            <li key={recipe.id}>
              <RecipeForm
                initial={editingRecipe}
                onSubmit={(data) => {
                  updateRecipe(recipe.id, data);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li
              key={recipe.id}
              className="flex items-center gap-4 rounded-xl border border-black/10 p-3 dark:border-white/10"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-2xl ${recipe.color}`}
              >
                {recipe.emoji}
              </div>
              <div className="flex-1">
                <p className="font-medium">{recipe.name}</p>
                <p className="text-xs text-zinc-500">
                  {recipe.pricePerServing} RSD / porcija · {recipe.tags.join(", ") || "bez tagova"}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingId(recipe.id);
                  setShowAddForm(false);
                }}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Izmeni
              </button>
              <button
                onClick={() => {
                  if (confirm(`Obrisati recept "${recipe.name}"?`)) {
                    deleteRecipe(recipe.id);
                  }
                }}
                className="text-sm font-medium text-red-500 hover:text-red-600"
              >
                Obriši
              </button>
            </li>
          )
        )}
        {recipes.length === 0 && (
          <p className="py-8 text-center text-zinc-500">
            Nema recepata. Dodaj prvi recept iznad.
          </p>
        )}
      </ul>
    </div>
  );
}
