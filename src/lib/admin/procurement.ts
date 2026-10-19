import { db } from "../db";
import { DELIVERY_WINDOW, DeliveryDay, PROCUREMENT_STATUSES } from "../orders/rules";
import { todayInBelgrade } from "./dates";
import type { DateRange, IngredientUnit, ProcurementReport, ProcurementWindow } from "./types";

const DAY_NAMES: DeliveryDay[] = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak"];

function dayOf(date: string): DeliveryDay {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay(); // 1..5 za radne dane
  return DAY_NAMES[dow - 1] ?? "Ponedeljak";
}

export interface ProcurementItem {
  orderId: string;
  recipeId: string | null;
  recipeName: string; // snapshot
  servings: number;
  recipe: {
    name: string;
    emoji: string;
    color: string;
    ingredients: { name: string; quantityPerServing: number; unit: string }[];
  } | null;
}

const round3 = (n: number) => Math.round(n * 1000) / 1000;

// Čista agregacija: porcije po receptu i Σ(količina po porciji × porcije)
// po sastojku, grupisano po nazivu (bez obzira na velika slova) + jedinici.
export function aggregateProcurement(
  items: ProcurementItem[],
): Omit<ProcurementReport, "range" | "statuses"> {
  const orderIds = new Set<string>();
  const recipes = new Map<string, ProcurementReport["recipes"][number] & { orderSet: Set<string> }>();
  const ingredients = new Map<string, { name: string; unit: IngredientUnit; totalQuantity: number; recipes: Set<string> }>();
  const missing = new Set<string>();
  let servingsTotal = 0;

  for (const item of items) {
    orderIds.add(item.orderId);
    servingsTotal += item.servings;
    const name = item.recipe?.name ?? item.recipeName;
    const key = item.recipeId ?? `deleted:${item.recipeName}`;
    let r = recipes.get(key);
    if (!r) {
      r = {
        recipeId: item.recipeId,
        name,
        emoji: item.recipe?.emoji ?? null,
        color: item.recipe?.color ?? null,
        orders: 0,
        servings: 0,
        orderSet: new Set(),
      };
      recipes.set(key, r);
    }
    r.servings += item.servings;
    r.orderSet.add(item.orderId);

    const list = item.recipe?.ingredients ?? [];
    if (list.length === 0) missing.add(name);
    for (const ing of list) {
      const ingKey = `${ing.name.trim().toLowerCase()}|${ing.unit}`;
      let agg = ingredients.get(ingKey);
      if (!agg) {
        agg = { name: ing.name.trim(), unit: ing.unit as IngredientUnit, totalQuantity: 0, recipes: new Set() };
        ingredients.set(ingKey, agg);
      }
      agg.totalQuantity += ing.quantityPerServing * item.servings;
      agg.recipes.add(name);
    }
  }

  return {
    orders: orderIds.size,
    boxes: orderIds.size,
    servingsTotal,
    recipes: [...recipes.values()]
      .map(({ orderSet, ...r }) => ({ ...r, orders: orderSet.size }))
      .sort((a, b) => b.servings - a.servings || a.name.localeCompare(b.name, "sr")),
    ingredients: [...ingredients.values()]
      .map((i) => ({ ...i, totalQuantity: round3(i.totalQuantity), recipes: [...i.recipes].sort() }))
      .sort((a, b) => a.name.localeCompare(b.name, "sr") || a.unit.localeCompare(b.unit)),
    missingIngredients: [...missing].sort(),
  };
}

export async function getProcurement(range: DateRange): Promise<ProcurementReport> {
  const items = await db.orderItem.findMany({
    where: {
      order: {
        status: { in: [...PROCUREMENT_STATUSES] },
        deliveryDate: { gte: new Date(`${range.from}T00:00:00Z`), lte: new Date(`${range.to}T00:00:00Z`) },
      },
    },
    select: {
      orderId: true,
      recipeId: true,
      recipeName: true,
      servings: true,
      recipe: {
        select: {
          name: true,
          emoji: true,
          color: true,
          ingredients: { select: { name: true, quantityPerServing: true, unit: true } },
        },
      },
    },
  });
  return { range, statuses: [...PROCUREMENT_STATUSES], ...aggregateProcurement(items) };
}

// Datumi dostave od danas nadalje koji imaju porudžbine za nabavku.
export async function getProcurementWindows(now = new Date()): Promise<ProcurementWindow[]> {
  const groups = await db.order.groupBy({
    by: ["deliveryDate"],
    where: {
      status: { in: [...PROCUREMENT_STATUSES] },
      deliveryDate: { gte: new Date(`${todayInBelgrade(now)}T00:00:00Z`) },
    },
    _count: { _all: true },
    orderBy: { deliveryDate: "asc" },
  });
  return groups.map((g) => {
    const date = g.deliveryDate.toISOString().slice(0, 10);
    return { id: date, date, day: dayOf(date), ...DELIVERY_WINDOW, orderCount: g._count._all };
  });
}

export function procurementCsvRows(report: ProcurementReport) {
  const header = ["Vrsta", "Naziv", "Količina", "Jedinica", "Porcije", "Porudžbine", "Recepti"];
  const rows: unknown[][] = [
    ...report.ingredients.map((i) => ["Sastojak", i.name, i.totalQuantity, i.unit, "", "", i.recipes.join(", ")]),
    ...report.recipes.map((r) => ["Recept", r.name, "", "", r.servings, r.orders, ""]),
  ];
  return { header, rows, filename: `nabavka_${report.range.from}_${report.range.to}.csv` };
}

