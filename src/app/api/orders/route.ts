import { NextRequest, NextResponse } from "next/server";
import { clientIp, jsonError, readJsonBody } from "@/lib/http";
import { createRateLimiter } from "@/lib/rateLimit";
import { isPlainObject } from "@/lib/validation";
import { validateOrderRequest } from "@/lib/orders/validate";
import { createOrder } from "@/lib/orders/create";
import { dbErrorResponse, withRetry } from "@/lib/dbRetry";

// 5 porudžbina na 10 minuta po IP adresi.
const orderLimiter = createRateLimiter(5, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limit = orderLimiter(`order:${ip}`);
  if (!limit.ok) {
    return jsonError(
      429,
      "Previše porudžbina u kratkom roku. Pokušaj ponovo za nekoliko minuta.",
      { retryAfterSeconds: limit.retryAfterSeconds },
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  // Honeypot: skriveno polje koje ljudi ne popunjavaju.
  if (isPlainObject(parsed.body) && typeof parsed.body.website === "string" && parsed.body.website !== "") {
    console.warn("[orders] honeypot triggered", { ip });
    return jsonError(400, "Porudžbina nije prihvaćena.");
  }

  const validation = validateOrderRequest(parsed.body);
  if (!validation.ok) {
    return jsonError(400, "Proveri unete podatke.", { fieldErrors: validation.errors });
  }

  try {
    // Ponavlja se samo ako konekcija nije uspela (ništa nije upisano).
    const result = await withRetry(() => createOrder(validation.value));
    if (!result.ok) {
      return jsonError(400, "Neki recepti više nisu dostupni.", {
        fieldErrors: { recipeIds: "Neki recepti više nisu dostupni." },
        unavailableRecipeIds: result.unavailableRecipeIds,
      });
    }
    console.info("[orders] created", {
      number: result.order.number,
      total: result.order.total,
      items: validation.value.recipeIds.length,
    });
    return NextResponse.json(result.order, { status: 201 });
  } catch (error) {
    return dbErrorResponse(error, "orders");
  }
}
