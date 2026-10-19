import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Admin sesija: potpisan (HMAC-SHA256) kolačić bez stanja na serveru.
// Vrednost: base64url(JSON payload) + "." + base64url(potpis).
// Payload nosi i otisak lozinke, pa promena ADMIN_PASSWORD poništava sve
// postojeće sesije; promena ADMIN_SESSION_SECRET takođe.

export const ADMIN_SESSION_COOKIE = "mk_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dana, u sekundama

interface SessionPayload {
  iat: number; // sekunde
  exp: number; // sekunde
  pv: string; // otisak lozinke
}

export class AdminAuthNotConfiguredError extends Error {
  constructor() {
    super("ADMIN_PASSWORD i ADMIN_SESSION_SECRET moraju biti podešeni");
  }
}

function getConfig() {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (!password || secret.length < 32) throw new AdminAuthNotConfiguredError();
  return { password, secret };
}

export function isAdminAuthConfigured(): boolean {
  try {
    getConfig();
    return true;
  } catch {
    return false;
  }
}

const sha256 = (value: string) => createHash("sha256").update(value).digest();

// Poređenje u konstantnom vremenu, bez curenja dužine (porede se heševi).
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

function passwordFingerprint(password: string, secret: string): string {
  return createHmac("sha256", secret).update(`pw:${password}`).digest("base64url").slice(0, 16);
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function checkAdminPassword(candidate: unknown): boolean {
  const { password } = getConfig();
  return typeof candidate === "string" && safeEqual(candidate, password);
}

export function createSessionToken(now = Date.now()): string {
  const { password, secret } = getConfig();
  const iat = Math.floor(now / 1000);
  const payload: SessionPayload = {
    iat,
    exp: iat + ADMIN_SESSION_MAX_AGE,
    pv: passwordFingerprint(password, secret),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function verifySessionToken(token: string | undefined | null, now = Date.now()): boolean {
  if (!token) return false;
  let config;
  try {
    config = getConfig();
  } catch {
    return false; // bez konfiguracije niko nije admin
  }
  const dot = token.indexOf(".");
  if (dot <= 0 || dot !== token.lastIndexOf(".")) return false;
  const data = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(signature, sign(data, config.secret))) return false;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp * 1000 <= now) return false;
    return safeEqual(String(payload.pv), passwordFingerprint(config.password, config.secret));
  } catch {
    return false;
  }
}

export function sessionCookieOptions(maxAge = ADMIN_SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    // Browseri tretiraju http://localhost kao bezbedan kontekst, pa Secure
    // radi i lokalno.
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
