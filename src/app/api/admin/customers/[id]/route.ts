import { NextRequest, NextResponse } from "next/server";
import { adminRoute, NO_STORE } from "@/lib/admin/route";
import { getCustomerDetail } from "@/lib/admin/customers";
import { jsonError } from "@/lib/http";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/admin/customers/[id]">) {
  return adminRoute(request, "customer", async () => {
    const { id } = await ctx.params;
    const customer = await getCustomerDetail(id);
    if (!customer) return jsonError(404, "Kupac nije pronađen.");
    return NextResponse.json(customer, { headers: NO_STORE });
  });
}
