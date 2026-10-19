import { db } from "../db";
import { ORDER_STATUSES } from "../orders/rules";
import { bucketFor, buildSeries, previousRange, rangeToInstants } from "./dates";
import { recipeStats } from "./recipes";
import type { DateRange, KpiResponse } from "./types";

interface Row {
  createdAt: Date;
  total: number;
  customerId: string;
}

function summarize(rows: Row[], firstOrderAt: Map<string, Date>, rangeStart: Date) {
  const revenue = rows.reduce((sum, r) => sum + r.total, 0);
  const customers = new Set(rows.map((r) => r.customerId));
  let fresh = 0;
  for (const id of customers) if (firstOrderAt.get(id)! >= rangeStart) fresh++;
  return {
    revenue,
    orders: rows.length,
    avgBasket: rows.length ? Math.round(revenue / rows.length) : 0,
    newCustomers: fresh,
    returningCustomers: customers.size - fresh,
  };
}

// KPI za opseg i isti takav prethodni opseg. Prihod i porudžbine ne
// uključuju otkazane. Kupac je "nov" ako mu je prva (neotkazana) porudžbina
// ikada u tom opsegu, inače je "povratni".
export async function getKpis(range: DateRange): Promise<KpiResponse> {
  const prev = previousRange(range);
  const cur = rangeToInstants(range);
  const old = rangeToInstants(prev);

  const [rows, statusGroups, topRecipes] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: old.gte, lt: cur.lt }, status: { not: "OTKAZANA" } },
      select: { createdAt: true, total: true, customerId: true },
    }),
    db.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: cur.gte, lt: cur.lt } },
      _count: { _all: true },
    }),
    recipeStats(range),
  ]);

  const customerIds = [...new Set(rows.map((r) => r.customerId))];
  const firsts = customerIds.length
    ? await db.order.groupBy({
        by: ["customerId"],
        where: { customerId: { in: customerIds }, status: { not: "OTKAZANA" } },
        _min: { createdAt: true },
      })
    : [];
  const firstOrderAt = new Map(firsts.map((f) => [f.customerId, f._min.createdAt!]));

  const curRows = rows.filter((r) => r.createdAt >= cur.gte);
  const prevRows = rows.filter((r) => r.createdAt < cur.gte);
  const a = summarize(curRows, firstOrderAt, cur.gte);
  const b = summarize(prevRows, firstOrderAt, old.gte);
  const bucket = bucketFor(range);
  const counts = new Map(statusGroups.map((g) => [g.status, g._count._all]));

  return {
    range,
    previousRange: prev,
    bucket,
    revenue: { value: a.revenue, previous: b.revenue },
    orders: { value: a.orders, previous: b.orders },
    avgBasket: { value: a.avgBasket, previous: b.avgBasket },
    customers: {
      new: { value: a.newCustomers, previous: b.newCustomers },
      returning: { value: a.returningCustomers, previous: b.returningCustomers },
    },
    series: buildSeries(range, bucket, curRows),
    previousSeries: buildSeries(prev, bucket, prevRows),
    statusCounts: ORDER_STATUSES.map((status) => ({ status, count: counts.get(status) ?? 0 })),
    topRecipes: topRecipes.slice(0, 5),
  };
}
