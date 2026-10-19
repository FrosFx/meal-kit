import { NextRequest } from "next/server";
import { dbErrorResponse } from "../dbRetry";
import { jsonError } from "../http";
import type { FieldErrors } from "../validation";
import { requireAdmin } from "./guard";

// Zajednički omotač admin ruta: provera sesije (i porekla za izmene), pa
// pretvaranje grešaka baze u 503/500 bez detalja.
export async function adminRoute(
  request: NextRequest,
  context: string,
  handler: () => Promise<Response>,
): Promise<Response> {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return await handler();
  } catch (error) {
    return dbErrorResponse(error, `admin:${context}`);
  }
}

export function badQuery(errors: FieldErrors) {
  return jsonError(400, "Neispravni parametri.", { fieldErrors: errors });
}

export const NO_STORE = { "Cache-Control": "no-store" };
