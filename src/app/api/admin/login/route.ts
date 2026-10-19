import { NextRequest, NextResponse } from "next/server";
import { clientIp, isSameOrigin, jsonError, readJsonBody } from "@/lib/http";
import { createRateLimiter } from "@/lib/rateLimit";
import {
  ADMIN_SESSION_COOKIE,
  AdminAuthNotConfiguredError,
  checkAdminPassword,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/admin/session";

// 5 pokušaja na 15 minuta po IP adresi.
const loginLimiter = createRateLimiter(5, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Zahtev nije dozvoljen sa drugog porekla.");
  }
  const limit = loginLimiter(`login:${clientIp(request)}`);
  if (!limit.ok) {
    return jsonError(
      429,
      "Previše pokušaja. Pokušaj ponovo kasnije.",
      { retryAfterSeconds: limit.retryAfterSeconds },
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const parsed = await readJsonBody(request, 1024);
  if (!parsed.ok) return parsed.response;
  const password = (parsed.body as { password?: unknown } | null)?.password;

  try {
    if (!checkAdminPassword(password)) {
      console.warn("[admin] failed login", { ip: clientIp(request) });
      return jsonError(401, "Pogrešna lozinka.");
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(), sessionCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof AdminAuthNotConfiguredError) {
      console.error("[admin] auth env vars missing");
      return jsonError(503, "Admin prijava trenutno nije dostupna.");
    }
    throw error;
  }
}
