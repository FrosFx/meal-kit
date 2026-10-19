import { NextRequest, NextResponse } from "next/server";
import { adminRoute } from "@/lib/admin/route";
import {
  deleteAdminRecipe,
  existingAdminInput,
  updateAdminRecipe,
  validateAdminRecipe,
} from "@/lib/admin/recipes";
import { jsonError, readJsonBody } from "@/lib/http";

// Delimična izmena; "ingredients", ako je poslato, zamenjuje celu listu.
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/recipes/[id]">) {
  return adminRoute(request, "recipe-update", async () => {
    const { id } = await ctx.params;
    const parsed = await readJsonBody(request);
    if (!parsed.ok) return parsed.response;
    const existing = await existingAdminInput(id);
    if (!existing) return jsonError(404, "Recept nije pronađen.");
    const input = validateAdminRecipe(parsed.body, existing);
    if (!input.ok) return jsonError(400, "Proveri unete podatke.", { fieldErrors: input.errors });
    return NextResponse.json(await updateAdminRecipe(id, input.value));
  });
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/admin/recipes/[id]">) {
  return adminRoute(request, "recipe-delete", async () => {
    const { id } = await ctx.params;
    const result = await deleteAdminRecipe(id);
    if (result.ok) return NextResponse.json({ ok: true });
    if (result.reason === "not_found") return jsonError(404, "Recept nije pronađen.");
    return jsonError(409, "Recept se nalazi u porudžbinama. Deaktiviraj ga umesto brisanja.", {
      code: "RECIPE_HAS_ORDERS",
      orderCount: result.orderCount,
    });
  });
}
