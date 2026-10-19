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

Round 1, after frontend [HANDOFF] (homepage + restyled /meni). Dev server :3000; production measured on a temporary `next start -p 3101` (since stopped).
Screenshots: `qa/screenshots/home/`. Probes: `qa/scripts/layoutcheck.js`, `qa/scripts/contrast.js`.

### Results per check
| Check | Result | Evidence |
|---|---|---|
| tsc / eslint / `npm run build` | PASS (0 / 0 / exit 0) | |
| Console (/, /meni, /kutija, /checkout) | 0 errors. 1 warning: `scroll-behavior: smooth` on `<html>` without `data-scroll-behavior` (QA-HOME-02) | console msgid=5 |
| Network | no 4xx/5xx in the app. Dev-only: bursts of `GET /?_rsc` with `next-hmr-refresh: 1` while other agents edited/built (not an app bug) | |
| Live DB data | PASS: 8 recipes, tag counts (veg 2, bez glutena 3, brzo 4, porodično 3, niskokal. 2, začinjeno 2), "od 550", 7/8 ≤30 min; pricing ranges computed from DB prices: 2p×3 3.650–5.090, 4p×3 6.950–9.830, 2p×4 4.750–6.670, 4p×4 9.150–12.990 (verified by hand) | |
| RecipeCard "Dodaj" | PASS: aria-pressed toggles, badge "Moja kutija, N obrok/obroka" (singular correct), polite live region "U kutiji: N obroka"; pressed name "U kutiji: <recept>" | |
| Pricing radiogroup | PASS: labelled "Obroka nedeljno:", roving tabindex, ←/→ with wrap; "Izaberi plan" sets {people, meals}, goes to /meni, keeps selectedIds | |
| Tag chips → /meni?tag= | PASS: preselects (aria-pressed), 3 cards for "bez glutena"; invalid, duplicate and `<script>` tags are ignored (shows "Sve") with no injection | |
| FAQ | PASS: single-open, aria-controls → role=region + aria-labelledby, collapsed panels `inert`, all 5 answers in the SSR HTML | |
| Skip link | PASS: first Tab stop, Enter → #sadrzaj, next Tab lands in main | |
| Mobile menu (<1024) | PASS: role=dialog labelled "Meni", focus moves to the first link, Tab/Shift+Tab trapped incl. the close button, Esc closes and returns focus to "Otvori meni", body scroll locked/unlocked, hash and route links close it | home-375-menu-open.png |
| Nav hide on scroll | PASS: visible <400 px, hides scrolling down, shows scrolling up, reveals when focus enters the nav, never hides under reduced motion | |
| Reduced motion | PASS: 0 running animations, 0 transform transitions, every `.reveal` visible, `scroll-behavior: auto` | |
| Responsive 375/768/1024/1440 | PASS: no horizontal overflow, no clipped/off-screen text, no target <24 px; the desktop nav fits at 1024 | home-{375,768,1024,1440}-full.png |
| Keyboard focus | PASS: 43 tab stops, all with a 2 px mustard outline on :focus-visible | |
| Contrast | PASS: 188 text nodes, 0 below AA, dark **and** light | home-1440-full-light.png |
| Lighthouse (mobile, prod) | A11y 100, Best Practices 100, SEO 100 | screenshots/home/lighthouse/report.html |
| **Performance (prod)** | Desktop 1440: LCP **523 ms**, CLS 0.00. Mobile 375, Slow 4G + 4× CPU: LCP **3352 ms** (TTFB 78 ms, render delay 3274 ms), CLS 0.00 → **FAIL** (QA-HOME-01) | trace-home-prod-375-4g.json.gz, trace-home-prod-1440.json.gz |
| SEO | title/description unique; canonical; one h1; lang=sr; sitemap/robots 200; /kutija, /checkout and /admin are `noindex, nofollow`; /meni canonical `/meni` (also for ?tag=). OG gaps on home (QA-HOME-04) | |
| Regression /meni → /kutija → /checkout | PASS, identical to the baseline: 4010 / 7670 / 5310, empty and invalid-email submits blocked, valid order MK-…, box cleared, plan kept | regress-meni-375.png |
| 404 | still the English Next default ("This page could not be found."), homepage title (QA-HOME-03) | |

### Bugs
| ID | Sev | Page @width | Issue | Owner |
|---|---|---|---|---|
| QA-HOME-01 | **High** | / @375 (prod, Slow 4G, 4× CPU) | LCP 3352 ms > 2.5 s. First paint only at 3352 ms although the CSS finished at 1674 ms. ~535 KB of fonts are preloaded (4 Fraunces files of 103/146/127/118 KB, opsz+SOFT axes, latin+latin-ext, roman+italic) and saturate the link; the first layout takes **1293 ms** for 761 nodes | frontend |
| QA-HOME-02 | Low | all | Console warning: `scroll-behavior: smooth` on `<html>` without `data-scroll-behavior="smooth"` (Next 16) | frontend |
| QA-HOME-03 | Low | 404 | English default copy, homepage `<title>`; needs `app/not-found.tsx` in Serbian with title and links | frontend |
| QA-HOME-04 | Low | / | `src/app/page.tsx:19` `openGraph` replaces the layout's object, so the home page loses `og:type`, `og:locale`, `og:site_name`; no `og:image` although `twitter:card=summary_large_image` (`/opengraph-image` 404) | frontend (metadata in page.tsx) / backend (OG image route) |
| QA-HOME-05 | Low | / | h1 accessible name "Večera za 30 minuta ,bez odlaska…": a JSX newline before "," in `Hero.tsx:82` adds a space before the comma for screen readers | frontend |

Withdrawn during testing: the home RecipeCard label mismatch ("Dodaj X u kutiju" while showing "U kutiji"); it was fixed via HMR mid-round and is now consistent with /meni.

Observations (no bug): the public footer links to "Admin panel" and "Plaćanje" (designer to decide); `/api/recipes` is still fetched on the client on home although the data is server-rendered; /kutija briefly shows the empty state while recipes load (baseline).

### Verdict round 1
**BLOCKER**: QA-HOME-01 (High) is open. All functional, a11y, responsive and regression checks pass. [DESIGN-OK] from designer not yet seen by QA.

### Resume notes (paused 2026-10-19 19:30)
- Waiting on: frontend [FIXED] for QA-HOME-01 (High) and QA-HOME-02..05 (Low); designer [DESIGN-OK]; lead's answer on the Nabavka statuses (see admin-test-plan N0).
- Re-test QA-HOME-01 on a production build: `npm run build`, then `npx next start -p 3101` (stop it afterwards), Chrome 375 mobile, Slow 4G + 4x CPU, cold reload trace. Confirm nobody runs `next build` during the measurement.
- Then do a quick smoke of / plus the §1 regression flow (4010 / 7670 / 5310).
- Open from planning: QA-SEC-01 (High) and QA-SEC-02 (Medium) with backend; re-test per qa/admin-test-plan.md on [FIXED].
