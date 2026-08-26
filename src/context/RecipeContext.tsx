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
import { RecipeInput } from "@/lib/recipeSerialization";
import { ADMIN_AUTH_STORAGE_KEY, ADMIN_PASSWORD_HEADER } from "@/lib/adminAuth";

interface RecipeContextValue {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  addRecipe: (recipe: RecipeInput) => Promise<void>;
  updateRecipe: (id: string, patch: RecipeInput) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const RecipeContext = createContext<RecipeContextValue | null>(null);

function adminHeaders(): HeadersInit {
  let password = "";
  try {
    password = window.sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY) ?? "";
  } catch {
    // sessionStorage možda nije dostupan
  }
  return {
    "Content-Type": "application/json",
    [ADMIN_PASSWORD_HEADER]: password,
  };
}

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipes");
      if (!res.ok) throw new Error("Greška pri učitavanju recepata.");
      const data: Recipe[] = await res.json();
      setRecipes(data);
    } catch {
      setError(
        "Nije moguće učitati recepte sa servera. Proveri da li baza radi."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Namerno: učitavamo recepte sa servera nakon mount-a. loadRecipes
    // interno postavlja state (recipes/isLoading/error) kad odgovor stigne.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRecipes();
  }, [loadRecipes]);

  const addRecipe = useCallback(async (recipe: RecipeInput) => {
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(recipe),
    });
    if (!res.ok) throw new Error("Dodavanje recepta nije uspelo.");
    const created: Recipe = await res.json();
    setRecipes((prev) => [...prev, created]);
  }, []);

  const updateRecipe = useCallback(async (id: string, patch: RecipeInput) => {
    const res = await fetch(`/api/recipes/${id}`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Izmena recepta nije uspela.");
    const updated: Recipe = await res.json();
    setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const deleteRecipe = useCallback(async (id: string) => {
    const res = await fetch(`/api/recipes/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error("Brisanje recepta nije uspelo.");
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const resetToDefaults = useCallback(async () => {
    const res = await fetch("/api/recipes/reset", {
      method: "POST",
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error("Resetovanje menija nije uspelo.");
    const data: Recipe[] = await res.json();
    setRecipes(data);
  }, []);

  const value = useMemo(
    () => ({
      recipes,
      isLoading,
      error,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      resetToDefaults,
    }),
    [recipes, isLoading, error, addRecipe, updateRecipe, deleteRecipe, resetToDefaults]
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
