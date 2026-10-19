import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "../db";
import { computeDeliveryDate, priceOrder } from "./rules";
import type { OrderRequest } from "./validate";

export type CreateOrderResult =
  | {
      ok: true;
      order: { number: string; total: number; deliveryDate: string; deliveryDay: string };
    }
  | { ok: false; unavailableRecipeIds: string[] };

const MAX_NUMBER_ATTEMPTS = 5;

export function generateOrderNumber(): string {
  return `MK-${randomInt(100000, 1000000)}`;
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

// Pravi porudžbinu: cene čita iz baze (nikad od klijenta), kupca prepoznaje
// po email-u i ažurira mu kontakt, a porudžbinu, stavke i prvi unos u
// istoriji statusa upisuje u jednoj transakciji.
export async function createOrder(
  request: OrderRequest,
  now = new Date(),
): Promise<CreateOrderResult> {
  const recipes = await db.recipe.findMany({
    where: { id: { in: request.recipeIds } },
    select: { id: true, name: true, pricePerServing: true, active: true },
  });
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const unavailableRecipeIds = request.recipeIds.filter((id) => !byId.get(id)?.active);
  if (unavailableRecipeIds.length > 0) return { ok: false, unavailableRecipeIds };

  const totals = priceOrder(
    request.recipeIds.map((id) => byId.get(id)!),
    request.plan.people,
  );
  const deliveryDate = computeDeliveryDate(request.deliveryDay, now);
  const { customer } = request;

  for (let attempt = 1; ; attempt++) {
    try {
      const order = await db.$transaction(async (tx) => {
        const saved = await tx.customer.upsert({
          where: { email: customer.email },
          create: customer,
          update: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            deliveryAddress: customer.deliveryAddress,
            city: customer.city,
          },
          select: { id: true },
        });
        return tx.order.create({
          data: {
            number: generateOrderNumber(),
            status: "NOVA",
            deliveryDay: request.deliveryDay,
            deliveryDate,
            deliveryAddress: customer.deliveryAddress,
            city: customer.city,
            people: request.plan.people,
            mealsPerWeek: request.plan.mealsPerWeek,
            subtotal: totals.subtotal,
            deliveryFee: totals.deliveryFee,
            total: totals.total,
            customerId: saved.id,
            items: {
              create: totals.lines.map((l) => ({
                recipeId: l.recipeId,
                recipeName: l.recipeName,
                pricePerServing: l.pricePerServing,
                servings: l.servings,
              })),
            },
            statusChanges: { create: { status: "NOVA", byAdmin: false } },
          },
          select: { number: true, total: true, deliveryDay: true, deliveryDate: true },
        });
      });
      return {
        ok: true,
        order: {
          number: order.number,
          total: order.total,
          deliveryDay: order.deliveryDay,
          deliveryDate: order.deliveryDate.toISOString().slice(0, 10),
        },
      };
    } catch (error) {
      // Sudar broja porudžbine (ili istovremeni upis istog kupca) -- pokušaj ponovo.
      if (isUniqueViolation(error) && attempt < MAX_NUMBER_ATTEMPTS) continue;
      throw error;
    }
  }
}
