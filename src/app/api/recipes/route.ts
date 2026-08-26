import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toAppRecipe, toDbData, RecipeInput } from "@/lib/recipeSerialization";
import { ADMIN_PASSWORD, ADMIN_PASSWORD_HEADER } from "@/lib/adminAuth";

function isAuthorized(request: NextRequest) {
  return request.headers.get(ADMIN_PASSWORD_HEADER) === ADMIN_PASSWORD;
}

// Javno dostupno -- nedeljni meni mora da može da učita recepte bez logina.
export async function GET() {
  const rows = await db.recipe.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(rows.map(toAppRecipe));
}

// Zaštićeno -- samo ulogovan admin panel sme da dodaje recepte.
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }
  const body: RecipeInput = await request.json();
  const row = await db.recipe.create({ data: toDbData(body) });
  return NextResponse.json(toAppRecipe(row), { status: 201 });
}
