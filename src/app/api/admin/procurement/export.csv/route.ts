import { NextRequest } from "next/server";
import { adminRoute, badQuery } from "@/lib/admin/route";
import { parseUpcomingRange } from "@/lib/admin/query";
import { getProcurement, procurementCsvRows } from "@/lib/admin/procurement";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET(request: NextRequest) {
  return adminRoute(request, "procurement-csv", async () => {
    const range = parseUpcomingRange(request.nextUrl.searchParams);
    if (!range.ok) return badQuery(range.errors);
    const { header, rows, filename } = procurementCsvRows(await getProcurement(range.value));
    return csvResponse(filename, toCsv(header, rows));
  });
}
