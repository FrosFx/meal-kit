# QA report: KutijaObroka homepage redesign

Branch: `web-team/redizajn` (baseline taken at `a007019`, clean tree), 2026-10-19
Tooling: Chrome DevTools MCP (isolated context `qa-baseline`), mobile emulation via `emulate` (window resize clamps at 500 px).

## 1. Baseline (before redesign handoff)

### Static
| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass, 0 errors |
| `npm run lint` | pass, 0 problems |
| Unit tests | none in project (no test script) |
| E2E runner | none installed (no Playwright Test); no deps added |

### Regression flow (steps to repeat after handoff)
Start with empty `localStorage` (`meal-kit-box`). Default plan 2 people / 3 meals.

1. `/` loads, recipe showcase shows live DB recipes (rižoto, tacos, veggie bowl). `GET /api/recipes` 200.
2. `/meni` shows 8 DB recipes. Click "Dodaj u kutiju" on Teleći rižoto (690) and Pileći tacos (590). Navbar "Moja kutija" badge = 2.
3. Filter "vegetarijansko" shows exactly 2 cards (Veggie bowl, Curry). Add Veggie bowl (550). Button reads "Dodato u kutiju ✓"; sticky bar "3 od 3 obroka izabrano — kutija je spremna! ✅".
4. "Idi na kutiju →" goes to `/kutija`: lines 1380 / 1180 / 1100, Međuzbir 3660, Dostava 350, Ukupno **4010 RSD**.
5. Set 4 osobe + 4 obroka: Međuzbir **7320**, Ukupno **7670**, warning "Dodaj još 1 obrok (a)…".
6. "Ukloni" tacos: Međuzbir **4960**, Ukupno **5310**, badge = 2, warning "Dodaj još 2…".
7. `/checkout`: summary "Plan: 4 osobe · 4 obroka nedeljno", rižoto 2760, veggie 2200, total 5310; button "Potvrdi porudžbinu (5310 RSD)".
8. Submit empty: blocked by native `required` on all 5 inputs. Email `nije-email`: blocked (`type=email`).
9. Valid data (Sreda): "Porudžbina je potvrđena!" with `MK-xxxxxx`; badge cleared; localStorage `selectedIds: []`, plan 4/4 kept.
10. Reload `/checkout` with empty box: "Kutija je prazna" + "Pogledaj nedeljni meni".

Screenshots: `qa/screenshots/baseline/` (home-1440, home-375, meni-1440-3selected, kutija-1440, checkout-1440-filled).

### Baseline observations (pre-existing, not regressions)
- Console: 0 errors/warnings on `/`, `/meni`, `/kutija`, `/checkout`. No 4xx/5xx (except a deliberate 404 probe).
- `/api/recipes` is fetched twice on load (dev StrictMode likely).
- Home SEO: title "KutijaObroka — meal-kit dostava" (same on every page), description "Prototip aplikacije… po uzoru na HelloFresh.", no canonical, no Open Graph tags. One h1. `lang="sr"`.
- `sitemap.xml` and `robots.txt` return 200 (robots disallows /admin, /api/, /checkout).
- 404 is the default English Next.js page.
- Old homepage at 375 px (mobile emulation): layout viewport 391 px, hero `section` decorative blobs overflow by ~16 px. `/meni`, `/kutija`, `/checkout` have no overflow at 375.
- A11y: checkout inputs use placeholder only (accessible name comes from placeholder, no visible `<label>`); filter and plan toggle buttons have no `aria-pressed`; copy "obrok (a)" has a stray space.
- No mobile menu button in the navbar (links shown inline).

### Re-run: backend DELIVERY_FEE refactor (`src/lib/pricing.ts`)
Diff check: `BoxContext.tsx` only swaps the local `const DELIVERY_FEE = 350` for an import from `@/lib/pricing` (still 350). tsc 0 errors, eslint clean.
Fresh isolated context `qa-pricing-rerun`:
| Case | /kutija | /checkout |
|---|---|---|
| 1 recipe, 2p | 1380 + 350 = 1730 | n/a |
| 3 recipes, 2p/3m | 3660 + 350 = **4010** | 3660 + 350 = **4010**, button "(4010 RSD)" |
| 3 recipes, 4p/4m | 7320 + 350 = **7670** | 2760/2360/2200, **7670**, button "(7670 RSD)" |
| Box emptied | totals panel hidden, "Kutija je prazna" | (empty state, per baseline) |
Result: PASS, no behaviour change. 0 console errors. The 0 RSD fee for an empty box is never rendered (the totals panel is hidden), so it was confirmed in code at `BoxContext.tsx:112`.
Evidence: `qa/screenshots/baseline/checkout-rerun-pricing-4p4m.png`.

Notes from the re-run (pre-existing, not caused by this change):
- `src/components/home/PricingPreview.tsx:13` still hardcodes `deliveryFee = 350` instead of using `DELIVERY_FEE`. Low.
- `/kutija` briefly shows "Kutija je prazna (0/N)" on a hard load until `/api/recipes` resolves (no loading state), while the navbar badge already shows the count. Low.
- `kutija/page.tsx` plan buttons use `setPlan({ ...plan, … })` (stale closure); two updates in the same tick lose the first. Real clicks don't hit this. Info.

## 2. Homepage redesign test (after handoff)

_Pending [HANDOFF] from frontend._
