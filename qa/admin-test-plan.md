# Test plan: orders (POST /api/orders) and business admin panel

Owner: qa. Status: planned; runs after the [HANDOFF]s. The homepage test comes first.
Environment: dev server http://localhost:3000, shared Neon DB, so every test order uses the email `qa+<case>@example.com` and the name prefix `QA-`, which makes cleanup easy.
Tools: curl (API, headers, cookies), Chrome DevTools MCP (UI, network, console, bundle search), `npx tsc`, `npm run lint`, `npm run build`.

## 0. Current state found while planning (2026-10-19)
- `src/lib/adminAuth.ts` hardcodes `ADMIN_PASSWORD = "meal-kit-admin"`, and it is served to the browser in `/_next/static/chunks/*.js` (confirmed with a grep of the chunks loaded on `/admin`). Any visitor can read it and call `POST/PUT/DELETE /api/recipes*` and `POST /api/recipes/reset` (which wipes the recipes) with `x-admin-password`. Reported as **QA-SEC-01 (High)** to backend.
- `POST /api/recipes` with a valid header and body `null` returns **500** (no input validation). **QA-SEC-02 (Medium)**.
- Without the header, all four mutating recipe routes return 401 (correct).
- The schema has only `Recipe` (no `active` flag, no `Order`/`Customer`), so the cases below assume the models the backend adds; I'll adjust the field names on handoff.

## 1. Pre-flight (each handoff)
| ID | Step | Expected |
|---|---|---|
| P1 | `npx tsc --noEmit`, `npm run lint`, `npm run build` | all pass |
| P2 | `npx prisma migrate status` (read-only) | no drift; migration committed |
| P3 | Baseline regression from `qa/home-report.md` §1 (/meni → /kutija → /checkout) | totals unchanged (4010 / 7670) |
| P4 | `npm audit --omit=dev` | no new high/critical |

## 2. Orders: POST /api/orders

### 2.1 Server-side price recalculation (tampering)
Reference box: rižoto 690 + tacos 590 + veggie 550, 2 people → subtotal 3660, delivery 350, total **4010**.
| ID | Tamper | Expected |
|---|---|---|
| O1 | Valid order through the UI | 201; the stored order total is 4010; the line prices come from the DB |
| O2 | curl with `total: 1`, `subtotal: 1` | stored/returned total 4010 (client totals ignored) or 400; never 1 |
| O3 | `pricePerServing: 1` on the items | stored line price 690/590/550 |
| O4 | `deliveryFee: 0` | stored 350 (`DELIVERY_FEE` from `src/lib/pricing.ts`) |
| O5 | `people: 3`, `0`, `-2`, `100`, `"2"` | 400 (only 2 or 4 allowed) |
| O6 | `mealsPerWeek` outside 2/3/4 | 400 |
| O7 | Unknown or garbage recipe id | 400, nothing stored |
| O8 | Inactive recipe id (see §6) | 400, nothing stored |
| O9 | Duplicate recipe ids `[a,a,a]` | 400, or deduplicated so it is priced once (document which) |
| O10 | Empty `items: []` | 400 |
| O11 | Quantity/servings field negative or fractional, if one exists | 400 |
| O12 | Extra fields (`status: "isporuceno"`, `id`, `createdAt`) | ignored; a new order is always `nova` / the default status |
| O13 | Change a recipe price in admin, then order with the old cached price | the new order uses the new DB price |
| O14 | Price snapshot (decided: `OrderItem.recipeName` + `pricePerServing` are snapshots). Place a QA order with rižoto at 690 → note the order total, its line prices, KPI revenue and Nabavka. Change rižoto to 990 and rename it to "QA rižoto". Re-read the order (admin detail, GET API, CSV) and KPI/revenue | the old order still shows "Teleći rižoto sa pečurkama", 690/serving, the same total; KPI revenue for past orders unchanged; only new orders use 990. Restore the price and name afterwards |
| O15 | Delete or deactivate the recipe after O14 | the old order still renders from its snapshot (no crash, no missing name) |

### 2.2 Customer field validation (server, not only HTML `required`)
For each case: one curl request bypassing the form, plus the UI (inline error, focus moves to the first invalid field, data is kept).
| ID | Field | Input | Expected |
|---|---|---|---|
| V1 | all | missing / `""` / only spaces | 400, an error per field, nothing stored |
| V2 | ime, prezime | 1 char; 101+ chars; `<script>alert(1)</script>`; `Đorđe`, `Šćepanović` | min/max enforced; Serbian diacritics accepted; HTML stored and rendered escaped in admin (no XSS) |
| V3 | telefon | `0601234567`, `+381 60 123 4567`, `060/123-4567` | accepted (normalized) |
| V4 | telefon | `abc`, `123`, 30 digits | 400 |
| V5 | email | `test@example.com`, `t.t+qa@example.rs` | accepted |
| V6 | email | `nije-email`, `a@`, `@b.rs`, `a b@c.rs` | 400 |
| V7 | adresa | empty, 2 chars, 300+ chars | 400 |
| V8 | body | non-JSON, `null`, 1 MB payload | 400/413, never 500 |
| V9 | spam | honeypot / rate limit (e.g. 20 POSTs in 10 s) | blocked or 429 (record what exists) |
| V10 | UI | after success: confirmation shows the **server** order number; box cleared; double-click submit creates **one** order | |
| V11 | UI | API down / 500 | error message shown, box **not** cleared, can retry |

## 3. Admin authentication
Admin areas: Pregled/KPI, Porudžbine, Recepti i meni, Kupci, Nabavka.
| ID | Step | Expected |
|---|---|---|
| A1 | Open each admin page URL in a fresh isolated context | redirect to login (or 401 page) **from the server**; no admin data in the HTML/RSC payload (`curl` the URL, grep for order emails) |
| A2 | Every `/api/admin/**` route and method (GET/POST/PATCH/DELETE, CSV export) without a cookie | 401/403 JSON, no data |
| A3 | Same with a forged cookie (`admin_session=1`, a random value, an expired one, a tampered signature) | 401 |
| A4 | Old `x-admin-password` header against the new routes | 401 (the header scheme is retired) |
| A5 | Login with the wrong password ×N | generic error; rate limit / delay after ~5 tries |
| A6 | Login OK: inspect `Set-Cookie` | `HttpOnly`, `Secure` (prod; acceptable to omit on http://localhost only), `SameSite=Lax` or `Strict`, `Path=/`, a sensible `Max-Age`; value is random/signed, **not** the password |
| A7 | `document.cookie` in the console | session cookie not visible (HttpOnly) |
| A8 | Password in the bundle: `npm run build` then grep `.next/static` for the password value and for `ADMIN_PASSWORD`; also grep the chunks served on /admin | 0 matches; the password only in a server env var (`ADMIN_PANEL`/`ADMIN_PASSWORD`), not a `NEXT_PUBLIC_` one |
| A9 | `sessionStorage`/`localStorage` after login | no password stored |
| A10 | Logout | cookie cleared/invalidated server-side; Back button shows no data; A1/A2 hold again |
| A11 | CSRF: a state-changing admin request from another origin (curl with `Origin: http://evil.test`, no custom header) | rejected, or SameSite blocks it; document the mechanism |
| A12 | `robots.txt` disallows /admin; admin pages have `noindex` | |
| A13 | Admin routes with a session behave normally; the session expires after Max-Age | |

## 4. Order status changes and CSV export
| ID | Step | Expected |
|---|---|---|
| S1 | Change a QA order's status through every allowed transition (e.g. nova → u pripremi → poslato → isporučeno, otkazano) | persisted (reload page + GET API); list/filter/KPI update |
| S2 | PATCH to an invalid status `"xyz"` or a disallowed transition (isporučeno → nova, if the rules forbid it) | 400 |
| S3 | PATCH an unknown order id | 404 |
| S4 | Two tabs change the same order | last write wins without a crash, or a conflict message |
| S5 | CSV export with no filter | `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename=...csv`; header row; one row per order; same count as the admin list |
| S6 | CSV encoding | Serbian diacritics correct when opened in Excel (UTF-8 BOM or `;` separator, whichever is chosen); totals as plain numbers |
| S7 | CSV with the current filter (status/date) | exported rows = filtered rows |
| S8 | CSV injection: customer name `=HYPERLINK("http://x","y")`, `+1`, `-1`, `@SUM` | cell escaped (prefixed with `'`) |
| S9 | Commas, quotes and newlines in the address | correctly quoted |
| S10 | CSV endpoint without a session | 401 (part of A2) |

## 5. Nabavka (procurement) totals vs orders
Setup: create a known set of QA orders through the API, for example
- Order 1: 2 people, rižoto + tacos + veggie
- Order 2: 4 people, rižoto + veggie
- Order 3: 2 people, tacos, status **otkazano**

| ID | Check | Expected |
|---|---|---|
| N0 | Rule: team-lead said Nabavka counts only `NOVA` and `U_PRIPREMI`, but the later project note lists the statuses NOVA, POTVRDJENA, U_PRIPREMI, POSLATA, ISPORUCENA, OTKAZANA with "Nabavka counts the first three" (incl. POTVRDJENA). **Confirm with lead before running**; add a POTVRDJENA order to the fixture either way. Run order 1 = NOVA, order 2 = U_PRIPREMI, order 3 = OTKAZANO, plus order 4 (2 people, tacos) moved to a shipped/delivered status | only orders 1 and 2 counted |
| N1 | Portions per recipe | rižoto 2+4 = 6, veggie 2+4 = 6, tacos 2 (order 1 only; orders 3 and 4 excluded) |
| N2 | Ingredient/quantity totals (if per-ingredient) | = Σ(portions × quantity per portion); recompute in a script from the DB/API |
| N3 | Revenue/cost totals on Nabavka and KPI | = Σ order totals of the counted statuses (order 1 4010 + order 2 (690+550)×4+350 = 5310 → 9320) |
| N4 | Date range / week boundaries (an order at 23:59 Sunday, Europe/Belgrade) | counted in the correct week; no UTC off-by-one |
| N5 | Move order 2 U_PRIPREMI → OTKAZANO, then order 3 OTKAZANO → NOVA (if that transition is allowed) | Nabavka drops order 2 and adds order 3 right away; KPI follows its own documented rule |
| N8 | After O14 (price change) | Nabavka quantities unchanged; Nabavka/KPI money values for existing orders still use the snapshot prices |
| N6 | Empty week | zero state, no NaN/undefined |
| N7 | Kupci: customer count and per-customer order count/total match the orders; same email → one customer | |

## 6. Inactive recipes
| ID | Step | Expected |
|---|---|---|
| R1 | Deactivate one recipe in "Recepti i meni" | hidden from `/meni`, from the homepage showcase and pricing preview, and from public `GET /api/recipes` |
| R2 | Recipe already in a user's box (localStorage), then deactivated | removed from /kutija and /checkout totals (or a clear "not available" notice); the order cannot be placed with it (O8) |
| R3 | Admin still lists it (with an "Neaktivan" badge) and can reactivate it | reappears on /meni and the homepage |
| R4 | Old orders containing it still show the name/price in Porudžbine and CSV | |
| R5 | Homepage caching/ISR | the change shows within the documented revalidate window (record the delay) |

## 7. Cross-cutting checks for each admin page
- 375/768/1024/1440 screenshots → `qa/screenshots/admin/`; tables scroll horizontally inside their container, not the page.
- Keyboard: login form, table actions, the status select, the export button; visible focus; labels on all inputs.
- Console: 0 errors; no 4xx/5xx except the expected 401s.
- No PII in the URL query string; no customer data in client logs.

## 8. Cleanup
Delete the QA orders/customers (`QA-` prefix, `qa+*@example.com`) through the admin UI or ask backend; never run `/api/recipes/reset` against the shared DB.

## Exit criteria (approved by team-lead 2026-10-19)
No open Critical/High. In particular all of the following pass: O2–O8, V1, V8, A1–A3, A6, A8 and N1–N3. O14 and N0 are also required (the snapshot and Nabavka rules are product decisions).

## Open bug tracking
| ID | Sev | Owner | Status | Re-test |
|---|---|---|---|---|
| QA-SEC-01 | High | backend | open, covered by the auth rework | on [FIXED]: A1–A3, A6–A9, plus a grep of the build and served chunks for the password; the old `x-admin-password` scheme rejected |
| QA-SEC-02 | Medium | backend | open, part of the API validation work | on [FIXED]: V8 against /api/recipes and /api/orders (null, non-JSON, wrong types → 400) |
