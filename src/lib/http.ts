import { NextRequest, NextResponse } from "next/server";

export const MAX_JSON_BYTES = 32 * 1024;

export function jsonError(
  status: number,
  error: string,
  extra?: Record<string, unknown>,
  headers?: HeadersInit,
) {
  return NextResponse.json({ error, ...extra }, { status, headers });
}

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export type JsonBodyResult =
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse };

// Čita JSON telo sa ograničenjem veličine; nikad ne baca grešku (400/413
// umesto 500).
export async function readJsonBody(
  request: NextRequest,
  maxBytes = MAX_JSON_BYTES,
): Promise<JsonBodyResult> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) {
    return { ok: false, response: jsonError(413, "Zahtev je prevelik.") };
  }
  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, response: jsonError(400, "Neispravan zahtev.") };
  }
  if (Buffer.byteLength(text, "utf8") > maxBytes) {
    return { ok: false, response: jsonError(413, "Zahtev je prevelik.") };
  }
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, response: jsonError(400, "Telo zahteva mora biti ispravan JSON.") };
  }
}

// CSRF zaštita za zahteve koji menjaju podatke: Origin (ili Referer) mora
// biti isti kao host sajta. SameSite=Lax kolačić je prva linija odbrane.
export function isSameOrigin(request: NextRequest): boolean {
  const source = request.headers.get("origin") ?? request.headers.get("referer");
  if (!source) return false;
  try {
    return new URL(source).host === request.nextUrl.host;
  } catch {
    return false;
  }
}
