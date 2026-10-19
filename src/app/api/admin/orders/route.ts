import { NextRequest, NextResponse } from "next/server";
import { adminRoute, badQuery, NO_STORE } from "@/lib/admin/route";
import { parseOrderFilters } from "@/lib/admin/query";
import { listOrders } from "@/lib/admin/orders";

export async function GET(request: NextRequest) {
  return adminRoute(request, "orders", async () => {
    const filters = parseOrderFilters(request.nextUrl.searchParams);
    if (!filters.ok) return badQuery(filters.errors);
    return NextResponse.json(await listOrders(filters.value), { headers: NO_STORE });
  });
}
