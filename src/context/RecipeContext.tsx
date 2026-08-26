"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Recipe } from "@/lib/types";
import { defaultRecipes } from "@/lib/recipes";

const STORAGE_KEY = "meal-kit-recipes";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // skini dijakritike (č, ć, š, ž, đ...)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeUniqueId(name: string, existing: Recipe[]) {
  const base = slugify(name) || "recept";
  let id = base;
  let counter = 2;
  while (existing.some((r) => r.id === id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  return id;
}

interface RecipeContextValue {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, "id">) => void;
  updateRecipe: (id: string, patch: Omit<Recipe, "id">) => void;
  deleteRecipe: (id: string) => void;
  resetToDefaults: () => void;
}

const RecipeContext = createContext<RecipeContextValue | null>(null);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(defaultRecipes);
  const [hydrated, setHydrated] = useState(false);

  // Učitaj sačuvane recepte iz localStorage nakon mount-a (izbegavamo
  // hydration mismatch jer localStorage ne postoji na serveru).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Recipe[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setRecipes(parsed);
        }
      }
    } catch {
      // ignoriši neispravne podatke u localStorage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch {
      // localStorage možda nije dostupan (privatni režim, itd.)
    }
  }, [recipes, hydrated]);

  const addRecipe = useCallback((recipe: Omit<Recipe, "id">) => {
    setRecipes((prev) => [
      ...prev,
      { ...recipe, id: makeUniqueId(recipe.name, prev) },
    ]);
  }, []);

  const updateRecipe = useCallback((id: string, patch: Omit<Recipe, "id">) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...patch, id } : r))
    );
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    setRecipes(defaultRecipes);
  }, []);

  const value = useMemo(
    () => ({ recipes, addRecipe, updateRecipe, deleteRecipe, resetToDefaults }),
    [recipes, addRecipe, updateRecipe, deleteRecipe, resetToDefaults]
  );

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error("useRecipes mora biti korišćen unutar RecipeProvider-a");
  return ctx;
}
