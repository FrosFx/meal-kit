import { NextRequest } from "next/server";
import { adminRoute, badQuery } from "@/lib/admin/route";
import { parseOrderFilters } from "@/lib/admin/query";
import { exportOrders, ORDER_CSV_HEADER } from "@/lib/admin/orders";
import { csvResponse, toCsv } from "@/lib/csv";

// Ceo filtrirani skup (bez straničenja), najviše CSV_MAX_ROWS redova.
export async function GET(request: NextRequest) {
  return adminRoute(request, "orders-csv", async () => {
    const filters = parseOrderFilters(request.nextUrl.searchParams);
    if (!filters.ok) return badQuery(filters.errors);
    const result = await exportOrders(filters.value);
    const response = csvResponse(
      `porudzbine_${result.filenameDate}.csv`,
      toCsv(ORDER_CSV_HEADER, result.rows),
    );
    response.headers.set("X-Total-Count", String(result.totalCount));
    if (result.truncated) response.headers.set("X-Truncated", "1");
    return response;
  });
}
