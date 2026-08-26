import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toAppRecipe } from "@/lib/recipeSerialization";
import { ADMIN_PASSWORD, ADMIN_PASSWORD_HEADER } from "@/lib/adminAuth";
import { defaultRecipes } from "@/lib/recipes";

export async function POST(request: NextRequest) {
  if (request.headers.get(ADMIN_PASSWORD_HEADER) !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  await db.recipe.deleteMany();
  for (const { id: _id, tags, ...rest } of defaultRecipes) {
    await db.recipe.create({ data: { ...rest, tags: JSON.stringify(tags) } });
  }

  const rows = await db.recipe.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(rows.map(toAppRecipe));
}
