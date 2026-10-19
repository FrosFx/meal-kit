import { Prisma } from "@prisma/client";
import { db } from "../db";
import {
  canTransition,
  DELIVERY_WINDOW,
  DeliveryDay,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  OrderStatusKey,
} from "../orders/rules";
import { belgradeDateString } from "../orders/rules";
import { rangeToInstants } from "./dates";
import type { OrderDetail, OrderFilters, OrderListItem, OrderSort, Paged } from "./types";

export const CSV_MAX_ROWS = 10_000;

// ILIKE šablon sa escape-ovanim % i _ iz korisničkog unosa.
export function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export function buildOrderWhere(f: OrderFilters): Prisma.OrderWhereInput {
  const and: Prisma.OrderWhereInput[] = [];
  if (f.status?.length) and.push({ status: { in: f.status } });
  if (f.from || f.to) {
    const range = rangeToInstants({ from: f.from ?? "2000-01-01", to: f.to ?? "2100-01-01" });
    and.push({ createdAt: { gte: range.gte, lt: range.lt } });
  }
  if (f.window) and.push({ deliveryDate: new Date(`${f.window}T00:00:00Z`) });
  if (f.customerId) and.push({ customerId: f.customerId });
  if (f.q) {
    const contains = { contains: f.q, mode: "insensitive" as const };
    const digits = f.q.replace(/\D/g, "");
    and.push({
      OR: [
        { number: contains },
        { customer: { firstName: contains } },
        { customer: { lastName: contains } },
        { customer: { email: contains } },
        // Telefon se čuva kao +381..., pa tražimo po ciframa bez vodeće nule.
        ...(digits.length >= 4 ? [{ customer: { phone: { contains: digits.replace(/^0+/, "") } } }] : []),
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

const ORDER_BY: Record<OrderSort, Prisma.OrderOrderByWithRelationInput[]> = {
  createdAt_desc: [{ createdAt: "desc" }],
  createdAt_asc: [{ createdAt: "asc" }],
  total_desc: [{ total: "desc" }, { createdAt: "desc" }],
  total_asc: [{ total: "asc" }, { createdAt: "desc" }],
  delivery_asc: [{ deliveryDate: "asc" }, { createdAt: "asc" }],
};

const listSelect = {
  id: true,
  number: true,
  createdAt: true,
  deliveryDay: true,
  deliveryDate: true,
  total: true,
  status: true,
  customer: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { items: true } },
} satisfies Prisma.OrderSelect;

type ListRow = Prisma.OrderGetPayload<{ select: typeof listSelect }>;

function toListItem(row: ListRow): OrderListItem {
  return {
    id: row.id,
    number: row.number,
    createdAt: row.createdAt.toISOString(),
    customer: row.customer,
    deliveryWindow: {
      date: row.deliveryDate.toISOString().slice(0, 10),
      day: row.deliveryDay as DeliveryDay,
      ...DELIVERY_WINDOW,
    },
    itemCount: row._count.items,
    total: row.total,
    status: row.status,
  };
}

export async function listOrders(
  f: OrderFilters & { page: number; pageSize: number; sort: OrderSort },
): Promise<Paged<OrderListItem>> {
  const where = buildOrderWhere(f);
  const [rows, totalCount] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: ORDER_BY[f.sort],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
      select: listSelect,
    }),
    db.order.count({ where }),
  ]);
  return {
    items: rows.map(toListItem),
    page: f.page,
    pageSize: f.pageSize,
    totalCount,
    pageCount: Math.max(1, Math.ceil(totalCount / f.pageSize)),
  };
}

export async function listOrdersForCustomer(customerId: string): Promise<OrderListItem[]> {
  const rows = await db.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    select: listSelect,
  });
  return rows.map(toListItem);
}

export async function getOrderDetail(id: string): Promise<OrderDetail | null> {
  const row = await db.order.findUnique({
    where: { id },
    select: {
      ...listSelect,
      deliveryAddress: true,
      city: true,
      people: true,
      mealsPerWeek: true,
      subtotal: true,
      deliveryFee: true,
      customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      items: {
        orderBy: { id: "asc" },
        select: {
          recipeId: true,
          recipeName: true,
          pricePerServing: true,
          servings: true,
          recipe: { select: { emoji: true, color: true } },
        },
      },
      statusChanges: { orderBy: { createdAt: "asc" }, select: { status: true, byAdmin: true, createdAt: true } },
    },
  });
  if (!row) return null;
  return {
    ...toListItem(row),
    customer: row.customer,
    address: { street: row.deliveryAddress, city: row.city },
    items: row.items.map((i) => ({
      recipeId: i.recipeId,
      name: i.recipeName,
      emoji: i.recipe?.emoji ?? null,
      color: i.recipe?.color ?? null,
      servings: i.servings,
      pricePerServing: i.pricePerServing,
      lineTotal: i.pricePerServing * i.servings,
    })),
    people: row.people,
    mealsPerWeek: row.mealsPerWeek,
    subtotal: row.subtotal,
    deliveryFee: row.deliveryFee,
    statusHistory: row.statusChanges.map((c) => ({
      status: c.status,
      at: c.createdAt.toISOString(),
      by: c.byAdmin ? ("admin" as const) : ("kupac" as const),
    })),
    allowedTransitions: [...ORDER_STATUS_TRANSITIONS[row.status]],
  };
}

export type UpdateStatusResult =
  | { ok: true; order: OrderDetail }
  | { ok: false; reason: "not_found" | "transition" | "conflict"; from?: OrderStatusKey };

// Promena statusa sa proverom dozvoljenog prelaza. updateMany sa uslovom na
// trenutni status sprečava da dve istovremene izmene obe prođu.
export async function updateOrderStatus(id: string, to: OrderStatusKey): Promise<UpdateStatusResult> {
  const current = await db.order.findUnique({ where: { id }, select: { status: true } });
  if (!current) return { ok: false, reason: "not_found" };
  if (!canTransition(current.status, to)) return { ok: false, reason: "transition", from: current.status };

  const changed = await db.$transaction(async (tx) => {
    const res = await tx.order.updateMany({ where: { id, status: current.status }, data: { status: to } });
    if (res.count === 0) return false;
    await tx.orderStatusChange.create({ data: { orderId: id, status: to, byAdmin: true } });
    return true;
  });
  if (!changed) return { ok: false, reason: "conflict", from: current.status };
  console.info("[admin] order status changed", { id, from: current.status, to });
  return { ok: true, order: (await getOrderDetail(id))! };
}

export const ORDER_CSV_HEADER = [
  "Broj", "Kreirana", "Status", "Ime", "Prezime", "Email", "Telefon", "Adresa", "Grad",
  "Dan dostave", "Datum dostave", "Osobe", "Obroka nedeljno", "Recepti", "Međuzbir", "Dostava", "Ukupno",
];

export async function exportOrders(f: OrderFilters & { sort: OrderSort }) {
  const where = buildOrderWhere(f);
  const [rows, totalCount] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: ORDER_BY[f.sort],
      take: CSV_MAX_ROWS,
      select: {
        number: true, createdAt: true, status: true, deliveryDay: true, deliveryDate: true,
        deliveryAddress: true, city: true, people: true, mealsPerWeek: true,
        subtotal: true, deliveryFee: true, total: true,
        customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
        items: { orderBy: { id: "asc" }, select: { recipeName: true, servings: true } },
      },
    }),
    db.order.count({ where }),
  ]);
  const fmtTime = new Intl.DateTimeFormat("sr-RS", {
    timeZone: "Europe/Belgrade", dateStyle: "short", timeStyle: "short",
  });
  return {
    totalCount,
    truncated: totalCount > rows.length,
    rows: rows.map((o) => [
      o.number,
      fmtTime.format(o.createdAt),
      ORDER_STATUS_LABELS[o.status],
      o.customer.firstName,
      o.customer.lastName,
      o.customer.email,
      o.customer.phone,
      o.deliveryAddress,
      o.city,
      o.deliveryDay,
      o.deliveryDate.toISOString().slice(0, 10),
      o.people,
      o.mealsPerWeek,
      o.items.map((i) => `${i.recipeName} ×${i.servings}`).join(", "),
      o.subtotal,
      o.deliveryFee,
      o.total,
    ]),
    filenameDate: belgradeDateString(new Date()),
  };
}
