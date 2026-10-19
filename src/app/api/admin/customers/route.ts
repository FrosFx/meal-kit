import { NextRequest, NextResponse } from "next/server";
import { adminRoute, badQuery, NO_STORE } from "@/lib/admin/route";
import { parseCustomerQuery } from "@/lib/admin/query";
import { listCustomers } from "@/lib/admin/customers";

export async function GET(request: NextRequest) {
  return adminRoute(request, "customers", async () => {
    const query = parseCustomerQuery(request.nextUrl.searchParams);
    if (!query.ok) return badQuery(query.errors);
    return NextResponse.json(await listCustomers(query.value), { headers: NO_STORE });
  });
}
