import { NextRequest, NextResponse } from "next/server";
import { adminRoute, NO_STORE } from "@/lib/admin/route";
import { getOrderDetail, updateOrderStatus } from "@/lib/admin/orders";
import { jsonError, readJsonBody } from "@/lib/http";
import { isPlainObject } from "@/lib/validation";
import { ORDER_STATUSES, OrderStatusKey } from "@/lib/orders/rules";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]">) {
  return adminRoute(request, "order", async () => {
    const { id } = await ctx.params;
    const order = await getOrderDetail(id);
    if (!order) return jsonError(404, "Porudžbina nije pronađena.");
    return NextResponse.json(order, { headers: NO_STORE });
  });
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]">) {
  return adminRoute(request, "order-status", async () => {
    const { id } = await ctx.params;
    const parsed = await readJsonBody(request, 1024);
    if (!parsed.ok) return parsed.response;
    const status = isPlainObject(parsed.body) ? parsed.body.status : undefined;
    if (typeof status !== "string" || !(ORDER_STATUSES as readonly string[]).includes(status)) {
      return jsonError(400, "Nepoznat status.", { fieldErrors: { status: "Nepoznat status." } });
    }
    const result = await updateOrderStatus(id, status as OrderStatusKey);
    if (result.ok) return NextResponse.json(result.order);
    if (result.reason === "not_found") return jsonError(404, "Porudžbina nije pronađena.");
    if (result.reason === "transition") {
      return jsonError(409, `Prelaz iz statusa ${result.from} u ${status} nije dozvoljen.`, {
        code: "INVALID_TRANSITION",
        from: result.from,
      });
    }
    return jsonError(409, "Porudžbinu je u međuvremenu izmenio neko drugi. Osveži stranu.", {
      code: "CONFLICT",
      from: result.from,
    });
  });
}
