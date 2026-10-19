import { NextRequest, NextResponse } from "next/server";
import { adminRoute, badQuery, NO_STORE } from "@/lib/admin/route";
import { parseRange } from "@/lib/admin/query";
import { getKpis } from "@/lib/admin/kpi";

export async function GET(request: NextRequest) {
  return adminRoute(request, "kpi", async () => {
    const range = parseRange(request.nextUrl.searchParams);
    if (!range.ok) return badQuery(range.errors);
    return NextResponse.json(await getKpis(range.value), { headers: NO_STORE });
  });
}
