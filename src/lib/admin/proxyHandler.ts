import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "./session";

// Prva linija zaštite admin dela. Svaka admin ruta i dalje sama proverava
// sesiju (requireAdmin), jer matcher može nenamerno da izostavi putanju.

const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/session",
]);

export function adminProxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();

  // Javno čitanje recepata ostaje otvoreno; izmene traže admin sesiju.
  if (pathname.startsWith("/api/recipes") && request.method === "GET") {
    return NextResponse.next();
  }

  const authed = verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

