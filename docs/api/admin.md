# API contract: orders + business admin

Owner: backend. Types live in `src/lib/admin/types.ts`; shared rules, labels and transitions in `src/lib/orders/rules.ts`. Both are safe to import in client components.
Status: contract **v1**. Server code that needs the DB waits on the DB drift decision (see team-lead). Field names only change by addition.

Conventions
- Money: integer RSD. Timestamps: ISO strings. `date` fields: `YYYY-MM-DD` in the Europe/Belgrade calendar.
- Errors: `{ error: string, fieldErrors?: Record<string,string> }` with 400 (validation), 401 (no session), 403 (cross-origin write), 404, 409 (conflict), 413 (body > 32 KB), 429 (rate limit, `Retry-After` header), 503 (DB unavailable). Never 500 for bad input.
- Pagination: `?page=1&pageSize=25` (max 100) → `Paged<T> { items, page, pageSize, totalCount, pageCount }`.
- Status keys: `NOVA, POTVRDJENA, U_PRIPREMI, POSLATA, ISPORUCENA, OTKAZANA`. Labels: `ORDER_STATUS_LABELS`. Allowed moves: `ORDER_STATUS_TRANSITIONS` (also returned per order as `allowedTransitions`).

## Public

### POST /api/orders
Request (prices/totals from the client are ignored; unknown fields ignored):
```json
{
  "customer": { "firstName": "Ana", "lastName": "Petrović", "phone": "060 123 4567",
                "email": "ana@example.com", "deliveryAddress": "Bulevar oslobođenja 12", "city": "Novi Sad" },
  "deliveryDay": "Sreda",              // Ponedeljak | Utorak | Sreda | Četvrtak | Petak
  "plan": { "people": 2, "mealsPerWeek": 3 },   // people 2|4, meals 2|3|4 (numbers)
  "recipeIds": ["id1", "id2", "id3"],  // 1..20, unique, active recipes
  "website": ""                        // honeypot: render hidden, must stay empty
}
```
Rules: firstName/lastName 2–50 letters (diacritics ok); phone Serbian (`060 123 4567`, `+381 60 1234567`, `060/123-4567`), stored as `+38160…`; email lower-cased; address 5–200; city 2–80.
Pricing = BoxContext formula: Σ(pricePerServing × people) over the recipes + `DELIVERY_FEE` (350). Prices are read from the DB at order time and snapshotted on each item.
Delivery date: the first chosen weekday that is ≥ 2 days after the order (Belgrade time); the delivery window is 17:00–21:00.
Responses:
- `201 { "number": "MK-482913", "total": 4010, "deliveryDate": "2026-10-21", "deliveryDay": "Sreda" }`
- `400 { error, fieldErrors: { "customer.email": "...", "plan.people": "...", "recipeIds": "..." } }`. Keys match the request paths, so you can focus the first invalid field.
- `400 { error, fieldErrors: { recipeIds }, unavailableRecipeIds: [...] }` when a recipe is unknown or inactive. Drop those ids from the box and tell the user.
- `429` with more than 5 orders per 10 min per IP; `503` when the DB is down (keep the box, allow a retry).
The customer is matched by email; their contact data is updated on every order.

### GET /api/recipes (existing, backward compatible)
Returns only **active** recipes (same `Recipe[]` shape). POST/PUT/DELETE and `/reset` now require the admin cookie (the `x-admin-password` header is retired) and validate their body (400 instead of 500).

## Admin auth
Cookie `mk_admin_session`: HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age 7 days, HMAC-signed. All admin writes must be same-origin (Origin check → 403). The proxy redirects `/admin/**` pages to `/admin/login?next=…` without a session; `/api/admin/**` returns 401.
- `POST /api/admin/login { password }` → `200 { ok: true }` + cookie | 401 `Pogrešna lozinka.` | 429 (5 tries / 15 min / IP) | 503 (env not configured)
- `POST /api/admin/logout` → `200 { ok: true }` (clears the cookie)
- `GET /api/admin/session` → `{ authenticated: boolean }` (no-store)
Required page: **`/admin/login`** (frontend). After login, `router.replace(next ?? "/admin")`. Use `fetch` with the default `credentials` (same-origin).

## Admin endpoints (all require the session)
| Method + path | Query / body | Response |
|---|---|---|
| GET `/api/admin/kpi` | `from`, `to` (default: last 30 days incl. today) | `KpiResponse` (previous equal-length period, daily buckets ≤ 31 days else weekly from Monday, statusCounts for all statuses, topRecipes 5 by revenue). Revenue/orders/avgBasket exclude OTKAZANA. "New" customer = first-ever order inside the range; "returning" = ordered in range and had an earlier order. |
| GET `/api/admin/orders` | `q`, `status=NOVA,U_PRIPREMI`, `from`, `to` (createdAt), `window` (deliveryDate), `customerId`, `sort` (`createdAt_desc` default, `createdAt_asc`, `total_desc`, `total_asc`, `delivery_asc`), `page`, `pageSize` | `Paged<OrderListItem>` |
| GET `/api/admin/orders/export.csv` | same filters, no paging (whole filtered set, max 10 000 rows) | CSV, one row per order; headers `X-Total-Count` (matches the list `totalCount`) and `X-Truncated: 1` when capped |
| GET `/api/admin/orders/:id` | | `OrderDetail` |
| PATCH `/api/admin/orders/:id` | `{ status }` | `OrderDetail`; 400 unknown status; 409 disallowed transition; 404 |
| GET `/api/admin/customers` | `q`, `sort` (`lastOrder_desc` default, `ltv_desc`, `orders_desc`, `name_asc`), `page`, `pageSize` | `Paged<CustomerListItem>` |
| GET `/api/admin/customers/:id` | | `CustomerDetail` (order history + LTV) |
| GET `/api/admin/recipes` | `from`, `to` for stats (default last 30 days) | `AdminRecipe[]`, inactive included, with ingredients + stats (`weeklyServings`: last 12 weeks) |
| POST `/api/admin/recipes` | `AdminRecipeInput` | `201 AdminRecipe` |
| PATCH `/api/admin/recipes/:id` | partial `AdminRecipeInput` (e.g. `{ active: false }`; `ingredients` replaces the whole list) | `AdminRecipe` |
| DELETE `/api/admin/recipes/:id` | | `{ ok: true }`; **409 `{ code: "RECIPE_HAS_ORDERS" }`** if it appears in orders, so offer "Deaktiviraj" instead |
| GET `/api/admin/recipe-stats` | `from`, `to` | `RecipeStatsRow[]` sorted by revenue (deleted recipes grouped under their snapshot name) |
| GET `/api/admin/procurement/windows` | | `ProcurementWindow[]`: delivery dates from today on that have orders in NOVA/POTVRDJENA/U_PRIPREMI, upcoming first |
| GET `/api/admin/procurement` | `from`, `to` (deliveryDate, inclusive; one window = `from=to=date`) | `ProcurementReport`: servings per recipe, ingredients Σ(quantity × servings) grouped by name+unit, `missingIngredients` |
| GET `/api/admin/procurement/export.csv` | same | CSV (ingredients, then the per-recipe summary) |

Ingredient units (fixed): `g, kg, ml, l, kom, kašika, kašičica, prstohvat` (`INGREDIENT_UNITS`). Quantities are per serving, > 0, up to 3 decimals.

CSV format: UTF-8 with BOM, `;` separator, CRLF; cells starting with `= + - @` are prefixed with `'`; `Content-Disposition: attachment`.

Order CSV columns: `Broj; Kreirana; Status; Ime; Prezime; Email; Telefon; Adresa; Grad; Dan dostave; Datum dostave; Osobe; Obroka nedeljno; Recepti; Međuzbir; Dostava; Ukupno`.

## Decisions (for QA)
- Price snapshot: `OrderItem.recipeName` + `pricePerServing` (+ `servings`, line total derived) are frozen at order time. Old orders, KPIs and CSV never change when a recipe is renamed, re-priced, deactivated or deleted.
- Nabavka counts NOVA + POTVRDJENA + U_PRIPREMI. OTKAZANA, POSLATA and ISPORUCENA are excluded.
- Duplicate recipe ids in an order → 400 (the box cannot hold duplicates).
- New orders always start as NOVA, with a status-history entry `by: "kupac"`; admin changes add `by: "admin"`.
