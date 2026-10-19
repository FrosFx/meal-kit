import { NextRequest, NextResponse } from "next/server";
import { adminRoute, badQuery, NO_STORE } from "@/lib/admin/route";
import { parseUpcomingRange } from "@/lib/admin/query";
import { getProcurement } from "@/lib/admin/procurement";

// Opseg datuma dostave; bez parametara: narednih 7 dana od danas.
// Jedan prozor: from=to=datum.
export async function GET(request: NextRequest) {
  return adminRoute(request, "procurement", async () => {
    const range = parseUpcomingRange(request.nextUrl.searchParams);
    if (!range.ok) return badQuery(range.errors);
    return NextResponse.json(await getProcurement(range.value), { headers: NO_STORE });
  });
}
