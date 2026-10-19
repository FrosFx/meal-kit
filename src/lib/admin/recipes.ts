import { Prisma } from "@prisma/client";
import { db } from "../db";
import { toAppRecipe } from "../recipeSerialization";
import { validateRecipeInput } from "../recipeValidation";
import { FieldErrors, isPlainObject, ValidationResult, cleanText } from "../validation";
import { addDays, rangeToInstants, todayInBelgrade, weekStart } from "./dates";
import {
  INGREDIENT_UNITS,
  type AdminRecipe,
  type AdminRecipeInput,
  type DateRange,
  type IngredientDto,
  type IngredientUnit,
  type RecipeStatsRow,
} from "./types";

const MAX_INGREDIENTS = 50;

// ---------- Statistika ----------

// Prodaja po receptu u opsegu (bez otkazanih). Obrisani recepti se grupišu
// pod nazivom iz snapshot-a.
export async function recipeStats(range: DateRange): Promise<RecipeStatsRow[]> {
  const { gte, lt } = rangeToInstants(range);
  return db.$queryRaw<RecipeStatsRow[]>`
    SELECT oi."recipeId" AS "recipeId",
           COALESCE(MAX(r.name), MAX(oi."recipeName")) AS name,
           MAX(r.emoji) AS emoji,
           MAX(r.color) AS color,
           COUNT(DISTINCT oi."orderId")::int AS orders,
           SUM(oi.servings)::int AS servings,
           SUM(oi.servings * oi."pricePerServing")::int AS revenue
    FROM "OrderItem" oi
    JOIN "Order" o ON o.id = oi."orderId"
    LEFT JOIN "Recipe" r ON r.id = oi."recipeId"
    WHERE o."createdAt" >= ${gte} AND o."createdAt" < ${lt} AND o.status <> 'OTKAZANA'
    GROUP BY oi."recipeId", CASE WHEN oi."recipeId" IS NULL THEN oi."recipeName" ELSE '' END
    ORDER BY revenue DESC, servings DESC`;
}

// Porcije po receptu i nedelji (ponedeljak, beogradsko vreme), poslednjih 12 nedelja.
async function weeklyServings(now = new Date()) {
  const lastWeek = weekStart(todayInBelgrade(now));
  const firstWeek = addDays(lastWeek, -7 * 11);
  const { gte } = rangeToInstants({ from: firstWeek, to: firstWeek });
  const rows = await db.$queryRaw<{ recipeId: string; week: Date; servings: number }[]>`
    SELECT oi."recipeId" AS "recipeId",
           date_trunc('week', (o."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Belgrade')::date AS week,
           SUM(oi.servings)::int AS servings
    FROM "OrderItem" oi
    JOIN "Order" o ON o.id = oi."orderId"
    WHERE o."createdAt" >= ${gte} AND o.status <> 'OTKAZANA' AND oi."recipeId" IS NOT NULL
    GROUP BY 1, 2`;
  const weeks = Array.from({ length: 12 }, (_, i) => addDays(firstWeek, 7 * i));
  const byRecipe = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const key = r.week.toISOString().slice(0, 10);
    if (!byRecipe.has(r.recipeId)) byRecipe.set(r.recipeId, new Map());
    byRecipe.get(r.recipeId)!.set(key, r.servings);
  }
  return (recipeId: string) =>
    weeks.map((week) => ({ week, servings: byRecipe.get(recipeId)?.get(week) ?? 0 }));
}

// ---------- Lista i CRUD ----------

const recipeInclude = {
  ingredients: { orderBy: { id: "asc" } },
} satisfies Prisma.RecipeInclude;

type RecipeRow = Prisma.RecipeGetPayload<{ include: typeof recipeInclude }>;

function toIngredientDtos(row: RecipeRow): IngredientDto[] {
  return row.ingredients.map((i) => ({
    name: i.name,
    quantity: i.quantityPerServing,
    unit: i.unit as IngredientUnit,
  }));
}

function toAdminRecipe(
  row: RecipeRow,
  stats?: RecipeStatsRow,
  weekly: AdminRecipe["stats"]["weeklyServings"] = [],
): AdminRecipe {
  return {
    ...toAppRecipe(row),
    active: row.active,
    ingredients: toIngredientDtos(row),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    stats: {
      orders: stats?.orders ?? 0,
      servings: stats?.servings ?? 0,
      revenue: stats?.revenue ?? 0,
      weeklyServings: weekly,
    },
  };
}

export async function listAdminRecipes(range: DateRange): Promise<AdminRecipe[]> {
  const [rows, stats, weekly] = await Promise.all([
    db.recipe.findMany({ orderBy: { createdAt: "asc" }, include: recipeInclude }),
    recipeStats(range),
    weeklyServings(),
  ]);
  const statsById = new Map(stats.filter((s) => s.recipeId).map((s) => [s.recipeId!, s]));
  return rows.map((r) => toAdminRecipe(r, statsById.get(r.id), weekly(r.id)));
}

export async function getAdminRecipe(id: string): Promise<AdminRecipe | null> {
  const row = await db.recipe.findUnique({ where: { id }, include: recipeInclude });
  return row ? toAdminRecipe(row) : null;
}

export function validateIngredients(raw: unknown, errors: FieldErrors): IngredientDto[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw) || raw.length > MAX_INGREDIENTS) {
    errors.ingredients = `Sastojci moraju biti lista (najviše ${MAX_INGREDIENTS}).`;
    return undefined;
  }
  const out: IngredientDto[] = [];
  raw.forEach((item, i) => {
    const obj = isPlainObject(item) ? item : {};
    const name = cleanText(obj.name) ?? "";
    const quantity = obj.quantity;
    if (name.length < 1 || name.length > 80) errors[`ingredients.${i}.name`] = "Naziv sastojka: 1–80 karaktera.";
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0 || quantity > 100000) {
      errors[`ingredients.${i}.quantity`] = "Količina mora biti broj veći od 0.";
    }
    if (!(INGREDIENT_UNITS as readonly unknown[]).includes(obj.unit)) {
      errors[`ingredients.${i}.unit`] = `Jedinica mora biti jedna od: ${INGREDIENT_UNITS.join(", ")}.`;
    }
    out.push({ name, quantity: Math.round(Number(quantity) * 1000) / 1000, unit: obj.unit as IngredientUnit });
  });
  return out;
}

// Validira kompletan ili delimičan unos (PATCH spaja sa postojećim receptom).
export function validateAdminRecipe(
  body: unknown,
  existing?: AdminRecipeInput,
): ValidationResult<AdminRecipeInput> {
  if (!isPlainObject(body)) return { ok: false, errors: { body: "Neispravan zahtev." } };
  const merged = existing ? { ...existing, ...body } : body;
  const base = validateRecipeInput(merged);
  const errors: FieldErrors = base.ok ? {} : { ...base.errors };
  if (body.active !== undefined && typeof body.active !== "boolean") errors.active = "active mora biti true ili false.";
  const ingredients = validateIngredients(body.ingredients, errors);
  if (!base.ok || Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      ...base.value,
      active: typeof body.active === "boolean" ? body.active : existing?.active,
      ingredients,
    },
  };
}

function toRecipeData(input: AdminRecipeInput) {
  return {
    name: input.name,
    description: input.description,
    emoji: input.emoji,
    color: input.color,
    tags: JSON.stringify(input.tags),
    prepMinutes: input.prepMinutes,
    calories: input.calories,
    pricePerServing: input.pricePerServing,
    ...(input.active !== undefined ? { active: input.active } : {}),
  };
}

function ingredientRows(list: IngredientDto[]) {
  return list.map((i) => ({ name: i.name, quantityPerServing: i.quantity, unit: i.unit }));
}

export async function createAdminRecipe(input: AdminRecipeInput): Promise<AdminRecipe> {
  const row = await db.recipe.create({
    data: {
      ...toRecipeData(input),
      ingredients: { create: ingredientRows(input.ingredients ?? []) },
    },
    include: recipeInclude,
  });
  return toAdminRecipe(row);
}

export async function existingAdminInput(id: string): Promise<AdminRecipeInput | null> {
  const row = await db.recipe.findUnique({ where: { id } });
  if (!row) return null;
  const app = toAppRecipe(row);
  return {
    name: app.name,
    description: app.description,
    emoji: app.emoji,
    color: app.color,
    tags: app.tags,
    prepMinutes: app.prepMinutes,
    calories: app.calories,
    pricePerServing: app.pricePerServing,
    active: row.active,
  };
}

export async function updateAdminRecipe(id: string, input: AdminRecipeInput): Promise<AdminRecipe> {
  const row = await db.$transaction(async (tx) => {
    if (input.ingredients) {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      await tx.recipeIngredient.createMany({
        data: ingredientRows(input.ingredients).map((i) => ({ ...i, recipeId: id })),
      });
    }
    return tx.recipe.update({ where: { id }, data: toRecipeData(input), include: recipeInclude });
  });
  return toAdminRecipe(row);
}

export type DeleteRecipeResult = { ok: true } | { ok: false; reason: "not_found" | "has_orders"; orderCount?: number };

export async function deleteAdminRecipe(id: string): Promise<DeleteRecipeResult> {
  const recipe = await db.recipe.findUnique({ where: { id }, select: { _count: { select: { orderItems: true } } } });
  if (!recipe) return { ok: false, reason: "not_found" };
  if (recipe._count.orderItems > 0) {
    return { ok: false, reason: "has_orders", orderCount: recipe._count.orderItems };
  }
  await db.recipe.delete({ where: { id } });
  return { ok: true };
}
