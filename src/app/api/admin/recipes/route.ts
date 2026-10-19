import { NextRequest, NextResponse } from "next/server";
import { adminRoute, badQuery, NO_STORE } from "@/lib/admin/route";
import { parseRange } from "@/lib/admin/query";
import { createAdminRecipe, listAdminRecipes, validateAdminRecipe } from "@/lib/admin/recipes";
import { jsonError, readJsonBody } from "@/lib/http";

// Svi recepti (i neaktivni), sa sastojcima i statistikom za opseg.
export async function GET(request: NextRequest) {
  return adminRoute(request, "recipes", async () => {
    const range = parseRange(request.nextUrl.searchParams);
    if (!range.ok) return badQuery(range.errors);
    return NextResponse.json(await listAdminRecipes(range.value), { headers: NO_STORE });
  });
}

export async function POST(request: NextRequest) {
  return adminRoute(request, "recipe-create", async () => {
    const parsed = await readJsonBody(request);
    if (!parsed.ok) return parsed.response;
    const input = validateAdminRecipe(parsed.body);
    if (!input.ok) return jsonError(400, "Proveri unete podatke.", { fieldErrors: input.errors });
    return NextResponse.json(await createAdminRecipe(input.value), { status: 201 });
  });
}
