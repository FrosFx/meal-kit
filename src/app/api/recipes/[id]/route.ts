import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toAppRecipe, toDbData, RecipeInput } from "@/lib/recipeSerialization";
import { ADMIN_PASSWORD, ADMIN_PASSWORD_HEADER } from "@/lib/adminAuth";

function isAuthorized(request: NextRequest) {
  return request.headers.get(ADMIN_PASSWORD_HEADER) === ADMIN_PASSWORD;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }
  const { id } = await params;
  const body: RecipeInput = await request.json();
  try {
    const row = await db.recipe.update({ where: { id }, data: toDbData(body) });
    return NextResponse.json(toAppRecipe(row));
  } catch {
    return NextResponse.json({ error: "Recept nije pronađen" }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await db.recipe.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Recept nije pronađen" }, { status: 404 });
  }
}
