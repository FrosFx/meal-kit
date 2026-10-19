import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/guard";

// Da li je trenutni korisnik prijavljen kao admin (za UI). Uvek 200.
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { authenticated: isAdminRequest(request) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
