import { Prisma } from "@prisma/client";
import { db } from "../db";
import { likePattern, listOrdersForCustomer } from "./orders";
import type { CustomerDetail, CustomerListItem, CustomerSort, Paged } from "./types";

// Lista kupaca sa agregatima (broj porudžbina, LTV bez otkazanih) u jednom
// SQL upitu, da sortiranje po LTV-u radi na celom skupu, ne samo na strani.

const ORDER_BY_SQL: Record<CustomerSort, Prisma.Sql> = {
  lastOrder_desc: Prisma.sql`"lastOrderAt" DESC NULLS LAST, c."createdAt" DESC`,
  ltv_desc: Prisma.sql`"lifetimeValue" DESC, c."createdAt" DESC`,
  orders_desc: Prisma.sql`"orderCount" DESC, c."createdAt" DESC`,
  name_asc: Prisma.sql`c."lastName" ASC, c."firstName" ASC`,
};

interface CustomerRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  orderCount: number;
  lifetimeValue: number;
  firstOrderAt: Date | null;
  lastOrderAt: Date | null;
}

function whereSql(q?: string): Prisma.Sql {
  if (!q) return Prisma.sql`TRUE`;
  const like = likePattern(q);
  const digits = q.replace(/\D/g, "").replace(/^0+/, "");
  return Prisma.sql`(
    c."firstName" ILIKE ${like} OR c."lastName" ILIKE ${like} OR c.email ILIKE ${like}
    OR (c."firstName" || ' ' || c."lastName") ILIKE ${like}
    ${digits.length >= 4 ? Prisma.sql`OR c.phone LIKE ${`%${digits}%`}` : Prisma.empty}
  )`;
}

function toItem(r: CustomerRow): CustomerListItem {
  return {
    ...r,
    firstOrderAt: r.firstOrderAt ? r.firstOrderAt.toISOString() : null,
    lastOrderAt: r.lastOrderAt ? r.lastOrderAt.toISOString() : null,
  };
}

function aggregateQuery(where: Prisma.Sql, orderBy: Prisma.Sql, take: number, skip: number) {
  return db.$queryRaw<CustomerRow[]>`
    SELECT c.id, c."firstName", c."lastName", c.email, c.phone, c.city,
           COUNT(o.id)::int AS "orderCount",
           COALESCE(SUM(o.total) FILTER (WHERE o.status <> 'OTKAZANA'), 0)::int AS "lifetimeValue",
           MIN(o."createdAt") AS "firstOrderAt",
           MAX(o."createdAt") AS "lastOrderAt"
    FROM "Customer" c
    LEFT JOIN "Order" o ON o."customerId" = c.id
    WHERE ${where}
    GROUP BY c.id
    ORDER BY ${orderBy}
    LIMIT ${take} OFFSET ${skip}`;
}

export async function listCustomers(query: {
  q?: string;
  sort: CustomerSort;
  page: number;
  pageSize: number;
}): Promise<Paged<CustomerListItem>> {
  const where = whereSql(query.q);
  const [rows, countRows] = await Promise.all([
    aggregateQuery(where, ORDER_BY_SQL[query.sort], query.pageSize, (query.page - 1) * query.pageSize),
    db.$queryRaw<{ n: number }[]>`SELECT COUNT(*)::int AS n FROM "Customer" c WHERE ${where}`,
  ]);
  const totalCount = countRows[0]?.n ?? 0;
  return {
    items: rows.map(toItem),
    page: query.page,
    pageSize: query.pageSize,
    totalCount,
    pageCount: Math.max(1, Math.ceil(totalCount / query.pageSize)),
  };
}

export async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  const [customer, aggregates, orders] = await Promise.all([
    db.customer.findUnique({ where: { id } }),
    aggregateQuery(Prisma.sql`c.id = ${id}`, Prisma.sql`c.id`, 1, 0),
    listOrdersForCustomer(id),
  ]);
  if (!customer || !aggregates[0]) return null;

  const addressRows = await db.order.groupBy({
    by: ["deliveryAddress", "city"],
    where: { customerId: id },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
  });

  return {
    ...toItem(aggregates[0]),
    deliveryAddress: customer.deliveryAddress,
    createdAt: customer.createdAt.toISOString(),
    addresses: addressRows.map((a) => ({
      street: a.deliveryAddress,
      city: a.city,
      lastUsedAt: a._max.createdAt!.toISOString(),
    })),
    orders,
  };
}
