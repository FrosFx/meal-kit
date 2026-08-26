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
import { Plan, Recipe } from "@/lib/types";
import { useRecipes } from "./RecipeContext";

const STORAGE_KEY = "meal-kit-box";
const DELIVERY_FEE = 350;

interface StoredState {
  plan: Plan;
  selectedIds: string[];
}

interface BoxContextValue {
  plan: Plan;
  setPlan: (plan: Plan) => void;
  selectedRecipes: Recipe[];
  selectedIds: string[];
  toggleRecipe: (id: string) => void;
  isSelected: (id: string) => boolean;
  removeRecipe: (id: string) => void;
  clearBox: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  isBoxComplete: boolean;
}

const defaultPlan: Plan = { people: 2, mealsPerWeek: 3 };

const BoxContext = createContext<BoxContextValue | null>(null);

export function BoxProvider({ children }: { children: ReactNode }) {
  const { recipes } = useRecipes();
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Učitaj sačuvano stanje iz localStorage pri prvom renderu (samo na klijentu).
  // Namerno postavljamo state ovde: localStorage ne postoji na serveru, pa
  // moramo prvo da renderujemo podrazumevano stanje pa tek onda da ga
  // uskladimo sa sačuvanim stanjem, kako bismo izbegli hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredState = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.plan) setPlan(parsed.plan);
        if (Array.isArray(parsed.selectedIds)) setSelectedIds(parsed.selectedIds);
      }
    } catch {
      // ignoriši neispravne podatke u localStorage
    } finally {
      setHydrated(true);
    }
  }, []);

  // Sačuvaj promene u localStorage.
  useEffect(() => {
    if (!hydrated) return;
    const state: StoredState = { plan, selectedIds };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage možda nije dostupan (privatni režim, itd.)
    }
  }, [plan, selectedIds, hydrated]);

  const toggleRecipe = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }, []);

  const removeRecipe = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((r) => r !== id));
  }, []);

  const clearBox = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectedRecipes = useMemo(
    () => recipes.filter((r) => selectedIds.includes(r.id)),
    [recipes, selectedIds]
  );

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const subtotal = useMemo(
    () =>
      selectedRecipes.reduce(
        (sum, r) => sum + r.pricePerServing * plan.people,
        0
      ),
    [selectedRecipes, plan.people]
  );

  const deliveryFee = selectedRecipes.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;
  const isBoxComplete = selectedRecipes.length >= plan.mealsPerWeek;

  const value: BoxContextValue = {
    plan,
    setPlan,
    selectedRecipes,
    selectedIds,
    toggleRecipe,
    isSelected,
    removeRecipe,
    clearBox,
    subtotal,
    deliveryFee,
    total,
    isBoxComplete,
  };

  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>;
}

export function useBox() {
  const ctx = useContext(BoxContext);
  if (!ctx) throw new Error("useBox mora biti korišćen unutar BoxProvider-a");
  return ctx;
}
