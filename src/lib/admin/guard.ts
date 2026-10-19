import { NextRequest, NextResponse } from "next/server";
import { jsonError, isSameOrigin } from "../http";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "./session";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isAdminRequest(request: NextRequest): boolean {
  return verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

// Provera unutar svake admin rute (proxy je samo prva linija odbrane).
// Vraća odgovor sa greškom, ili null kad je zahtev dozvoljen.
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (!isAdminRequest(request)) return jsonError(401, "Neautorizovano");
  if (!SAFE_METHODS.has(request.method) && !isSameOrigin(request)) {
    return jsonError(403, "Zahtev nije dozvoljen sa drugog porekla.");
  }
  return null;
}
