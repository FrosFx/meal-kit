# Home page spec — `/`

> Overrides MASTER.md where they differ. Tokens, components and motion tokens are defined in `../MASTER.md`.
> Route: `src/app/page.tsx` (server component, `dynamic = "force-dynamic"` stays). Sections live in `src/components/home/*`.

**Page goal:** get a first-time visitor to `/meni` (primary) or to understand price and pick a plan (`#cene`). Every section ends with a clear next step.
**Pattern:** Hero-centric editorial landing: Hero → value strip → how it works → this week's menu → why us (bento) → pricing → FAQ → final CTA → footer.

---

## 0. Data contract (backend provides, page consumes)

`getHomeData()` in `src/lib/home.ts` (backend owns it) returns:

| Field | Type | Used in |
|---|---|---|
| `status` | `"ok" \| "empty" \| "error"` | Picks the state variant (table below) |
| `featured` | `Recipe[]`, 6, `createdAt asc`, guarantees 1 vegetarian if one exists | **All recipe visuals on home:** hero plates (first 3), menu grid (3 / 4 / 6 by breakpoint), bento tile A (3), final CTA plates (5) |
| `recipes` | `Recipe[]` (backend's showcase list) | Not used on home v1; use `featured` |
| `stats.recipeCount` | number \| null | Hero eyebrow + stat, "Ceo meni (8)", final CTA lede |
| `stats.minPrice` / `stats.maxPrice` | number \| null (RSD per serving) | Hero stat + sticker + receipt, pricing ranges |
| `stats.quickRecipeCount` | number \| null (`prepMinutes <= 30`) | Hero stat, bento tile B |
| `stats.minPrepMinutes`, `stats.avgPrepMinutes` | number \| null | Not used on home v1 (fine to keep for /meni) |
| `tags` | `{ tag, count }[]`, all tags in `ALL_TAGS` order, zero counts included | Menu chips and bento tile D. **Frontend hides chips/badges with count 0.** |
| `deliveryFee` | number (350, from `DELIVERY_FEE` in `src/lib/pricing.ts`; `BoxContext` must import the same constant) | Receipt card, pricing |

No image field and no schema change: the Plate (MASTER 6.4) is the recipe visual everywhere.

### 0.1 Empty and error states (designed, no "—" placeholders)

Static sections (value strip, how it works, bento C, FAQ, footer) always render. The data-driven parts switch as follows:

| Section | `ok` | `empty` (0 recipes) | `error` (DB failed) |
|---|---|---|---|
| Hero eyebrow | "Nedeljni meni · {n} recepata" | "Novi meni stiže uskoro" | "Nedeljni meni" (no count) |
| Hero stats row | 3 stats | **Replaced** by 3 promise items in the same slot and size (no numbers): `scale` "Izmereni sastojci" · `chef-hat` "Recepti korak po korak" · `truck` "Dostava do vrata" | same as `empty` |
| Hero plates | featured[0–2] + sticker | 3 **empty rims** (Plate with the dish in `--paper-2` and a `utensils` icon 28% in `--line-strong`), no sticker; receipt card hidden | same as `empty` |
| Hero CTA | "Pogledaj nedeljni meni" | unchanged (the /meni page has its own empty state) | unchanged |
| Menu section | chips + grid + CTA | **Empty card** spanning the grid: `--card`, dashed 1.5px `--line-strong` border, radius `--radius-xl`, padding 48, centered: row of 3 `sm` empty rims, `title` "Meni za ovu nedelju se upravo sprema", `body` muted "Novi recepti stižu uskoro. Pogledaj kako funkcioniše ili se vrati za koji dan.", `secondary md` "Kako funkcioniše" → `#kako`. No chips. | **Error card**, same frame but solid 1px `--danger` border and bg `--danger-tint`: `alert-circle` icon `--danger` 28px, `title` "Meni trenutno nije dostupan", `body` "Došlo je do greške pri učitavanju recepata. Pokušaj ponovo za nekoliko trenutaka.", `secondary md` "Pokušaj ponovo" (`rotate-cw` icon) = `router.refresh()`; card has `role="status"`. No chips. |
| Bento A plates | 3 featured | empty rims | empty rims |
| Bento B (time) | "{quick}/{n}" | number hidden, the title is promoted to `display-m`: "Većina recepata za 30 minuta" | same as `empty` |
| Bento D (tags) | non-zero tag badges | text only, no badges | same |
| Pricing (`#cene`) | full | **hidden**, including the "Cene" nav/footer anchors on home (otherwise they point to nothing) | hidden, same |
| Final CTA | lede with count + 5 plates | lede without count: "Pogledaj nedeljni meni i sastavi svoju prvu kutiju za manje od dva minuta." Plates → 5 empty rims | same as `empty` |

Add `alert-circle` and `rotate-cw` to the icon module. Error styling uses icon + text, never color alone.

Static copy (steps, benefits, FAQ) stays in `page.tsx` as today; icon names replace emoji fields (`icon: "scale"` etc.).

---

## 1. Navbar
Per MASTER 6.7. On home, "Kako funkcioniše" / "Cene" / "Pitanja" are same-page anchors (`#kako`, `#cene`, `#pitanja`) with `scroll-behavior: smooth` (auto under reduced motion).

---

## 2. Hero — "Večera je rešena"

**Job:** say what it is, show the food, one primary action.
**Background:** `--paper` + grain. A large `--mustard` circle outline (2px stroke, ~1.25× the big plate, 35% opacity) sits behind the plate cluster like a charger plate. Nothing else decorative.

**Content (in order):**
1. Eyebrow chip: pill, bg `--basil-tint`, text `--basil`, `meta` 600: `leaf` icon + "Nedeljni meni · {recipeCount} recepata".
2. **h1** (`display-xl`): "Večera za *30 minuta*, bez odlaska u prodavnicu." — "30 minuta" in Fraunces italic with a hand-drawn mustard swash under it (inline SVG path, stroke `--mustard` 6px, round caps, sits behind the text baseline).
3. Lede (`body-l`, `--ink-muted`, max 46ch): "Svake nedelje biraš obroke, a mi ti šaljemo tačno izmerene sastojke i jednostavne recepte korak po korak."
4. Actions: `primary lg` "Pogledaj nedeljni meni" + `arrow-right` → `/meni`; `ghost` "Kako funkcioniše" → `#kako`.
5. Stats row (3 items, divided by 1px `--line` vertical rules; number in `display-m` `--ink`, label `meta` `--ink-muted`):
   - "{recipeCount}" / "recepata ove nedelje"
   - "od {minPrice}" / "RSD po porciji"
   - "≤ 30 min" / "{quickRecipeCount} od {recipeCount} recepata"
6. **Plate cluster** (visual): featured[0] large, featured[1] and [2] medium. Each Plate `aria-hidden`; the cluster has one `role="img"` wrapper with `aria-label="Recepti ove nedelje: {names joined}"`. Sticker on the large plate: "od {minPrice} RSD".
7. **Receipt card** (≥768 only): small `--card` card, `--shadow-lg`, rotated -3°, `meta` lines in tabular nums:
   "Kutija za 2 osobe" / "3 obroka × 2 porcije" / "Dostava {deliveryFee} RSD" / rule / "od {2*3*minPrice + deliveryFee} RSD" (Fraunces 600 20px `--paprika`). Decorative copy of pricing math; `aria-hidden` is NOT used (it is real info) but it is not interactive.

**Layout:**

| | 375 | 768 | 1024 | 1440 |
|---|---|---|---|---|
| Grid | 1 col | 1 col, text max 600px | 12 col: text 1–6, visual 7–12, vertically centered | same, container 1240 |
| Padding | top 32, bottom 64 | top 48, bottom 80 | `min-height: min(calc(100dvh - 72px), 860px)`, padding-y 64 | padding-y 80 |
| h1 size | 44px, ~4 lines | 60px | 72px | 88px |
| Actions | stacked, primary full-width, ghost centered below | inline row | inline row | inline row |
| Stats | 3 cols, numbers 26px | 3 cols | 3 cols, max 520px | same |
| Plates | below stats, centered row: 96 / 160 / 96, overlapping by 16px, middle one in front | 140 / 220 / 140 | cluster: large 320 center-left, medium 180 top-right, medium 160 bottom-left, overlapping | large 400, medium 220 / 190 |
| Receipt | hidden | right of plate row, bottom aligned | bottom-right of cluster, overlapping the large plate rim | same |

Order on mobile: eyebrow, h1, lede, actions, stats, plates. The first section hint must be visible: on 1024+ the hero is at most 860px tall so the value strip peeks.

**Motion (load, plays once):**
- h1 and lede: **no entrance animation** (LCP).
- Swash under "30 minuta": SVG `stroke-dashoffset` 100% → 0, 700ms, `--ease-out`, delay 300ms.
- Eyebrow, actions, stats: opacity 0→1 + y 12→0, `--dur-slow`, `--ease-out`, delays 0 / 150 / 250ms.
- Plates: scale 0.85→1, rotate (tilt −12°)→tilt, opacity 0→1, 800ms `--ease-spring`, stagger 90ms, start 200ms. GSAP: `gsap.from(".hero-plate", { scale: .85, rotate: "-=12", opacity: 0, duration: .8, ease: "back.out(1.4)", stagger: .09, delay: .2 })`.
- Receipt: y 24→0 + opacity, 480ms, delay 600ms.
- Pointer parallax (≥1024, `hover: hover`): plates translate ±8px opposite to cursor (lerp 0.1), via `transform` only. Optional; skip if it costs more than ~1kb JS.
- Reduced motion: everything visible in final state, swash drawn, no parallax.

---

## 3. Value strip

**Job:** four promises scanned in 3 seconds.
Full-width band, bg `--paper-2`, top and bottom 1px `--line`, padding-y 24 (32 ≥1024). Inside the container: 4 items, each `icon-lg` in `--basil` + `ui` 600 `--ink` label:
`scale` "Tačno izmereni sastojci" · `chef-hat` "Recepti korak po korak" · `truck` "Dostava na kućnu adresu" · `calendar-sync` "Bez dugoročne obaveze".

| 375 | 768 | ≥1024 |
|---|---|---|
| 2×2 grid, gap 16, icon above label | 4 cols, icon above label, centered | 4 cols, icon left of label, separated by mustard dots (6px) |

Static, no marquee. Reveal: fade only, stagger 70ms.

---

## 4. Kako funkcioniše — `id="kako"`

**Job:** reduce perceived effort to 3 steps.
Section header (left aligned): eyebrow "Kako funkcioniše", h2 "Tri koraka do *toplog* obroka", lede "Bez planiranja, bez spiska za kupovinu."

Steps (existing copy, keep):
1. `utensils` "Izaberi plan" — "Odaberi veličinu domaćinstva i koliko obroka nedeljno želiš da kuvaš."
2. `shopping-basket` "Izaberi recepte" — "Pregledaj nedeljni meni i dodaj obroke koji te zanimaju u kutiju."
3. `truck` "Dostava do vrata" — "Sastojci i recepti stižu isečeni, izmereni i spremni za kuvanje."

Step anatomy: number "01" in Fraunces italic 600 `display-m` `--paprika`; 56px circle bg `--mustard` with `icon-lg` `--on-mustard`; title `title` (h3); text `body` `--ink-muted`.

| 375 | 768 | ≥1024 |
|---|---|---|
| vertical list; dashed 2px `--line-strong` line connects circles on the left; number + circle left, text right | 3 cols, text centered under circle, connector hidden | 3 cols left-aligned, dashed connector runs horizontally through circle centers (between circles, not behind them) |

After steps: centered `secondary md` "Pogledaj nedeljni meni" → `/meni`.

**Motion:** header reveal; steps reveal stagger 120ms; connector `scaleX` (mobile `scaleY`) 0→1, 900ms `--ease-in-out`, origin start, starts with step 1. Reduced motion: static.

---

## 5. Ove nedelje na meniju — `id="meni"`

**Job:** show real food + let them start a box from the homepage.
Header row: left eyebrow "Ova nedelja", h2 "Šta se kuva *ove* nedelje"; right (≥768) ghost link "Ceo meni ({recipeCount})" + `arrow-right` → `/meni`.

**Filter chips** below header: one chip per `tags` item, label "{tag}" + muted "{count}", each a link to `/meni?tag={encodeURIComponent(tag)}` (frontend: `/meni` must read the `tag` search param as its initial `activeTag`). Chips wrap; no horizontal scroll.

**Grid:** shared **RecipeCard** (MASTER 6.5) with working "Dodaj" (BoxContext).

| 375 | 768 | 1024 | 1440 |
|---|---|---|---|
| 1 col, first 3 recipes | 2 cols, first 4 | 3 cols, all 6 | 3 cols, all 6, gap 32 |

Below grid: centered `primary lg` "Pogledaj svih {recipeCount} recepata" → `/meni` (on 375 full-width). On ≥768 the header ghost link already exists; keep the button anyway (end-of-section CTA).

**Motion:** cards reveal stagger 70ms (grid wave). Hover per MASTER 6.5. Adding to box: button crossfades label 150ms; the nav badge pops (MASTER 6.7).

---

## 6. Zašto KutijaObroka — bento

**Job:** handle objections (waste, time, commitment, diet).
Section bg `--paper`. Header: eyebrow "Zašto KutijaObroka", h2 "Kuvanje bez *glavobolje* oko planiranja".

Tiles (radius `--radius-xl`, padding 28 / 40 ≥1024):
- **A — Sveži, izmereni sastojci** (feature tile): bg `--forest`, text `--on-forest`. Icon `scale` in `--mustard`. Big Fraunces line (`display-m`, italic): "Tačno onoliko koliko receptu treba." + body (`--on-forest-muted`): "Bez pogađanja količina i bez bačene hrane." Decorative: three `sm` Plates from featured cropped off the bottom-right edge (`aria-hidden`).
- **B — Manje vremena u kuhinji**: bg `--mustard`, text `--on-mustard`. Huge number `display-l` "{quickRecipeCount}/{recipeCount}" + "recepata je gotovo za 30 minuta ili manje, uz jasna uputstva korak po korak."
- **C — Fleksibilan plan**: `--card` tile, `calendar-sync` icon `--basil`, title + "Menjaš broj obroka i veličinu porcija iz nedelje u nedelju, bez dugoročne obaveze."
- **D — Nešto za svakoga**: `--card` tile, `leaf` icon, title + "Vegetarijansko, bez glutena, brzo, porodično — filtriraš po tome šta ti treba." + the `tags` as static Badges.

| 375 | 768 | ≥1024 | 1440 |
|---|---|---|---|
| stack A, B, C, D, gap 16 | 2 cols: A spans 2 cols, then B / C, D spans 2 | 4 cols × 2 rows: A cols 1–2 rows 1–2 (tall), B cols 3–4 row 1, C col 3 row 2, D col 4 row 2 | same, gap 32 |

Motion: tiles reveal stagger 90ms; Plates in tile A rise y 32→0 when the tile enters. No hover lift (tiles are not links).

---

## 7. Cene — `id="cene"`

**Job:** transparent price expectation + plan selection.
Section bg `--paper-2`. Header centered (exception to left-aligned rule): eyebrow "Okvirna cena", h2 "Plaćaš samo ono što *izabereš*", lede "Cena zavisi od recepata koje izabereš. Bez skrivenih troškova — dostava je {deliveryFee} RSD po kutiji."

**Meals selector** (client component): segmented control (MASTER 6.11) "Obroka nedeljno:" options 2 · 3 · 4, default 3, `role="radiogroup"`, arrow keys move selection.

**Plan cards** (2): `--card`, radius `--radius-xl`, padding 32.
- Card **2 osobe** (recipes): 2px border `--paprika`, mustard sticker top-right "Za parove". Card **4 osobe**: 1px `--line` border, sticker "Za porodicu" (bg `--basil-tint`, text `--basil`).
- Content: title `title` "2 osobe"; range `display-m` tabular `--ink`: "{low} – {high}" + `meta` "RSD nedeljno"; below, `meta` list with `check` icons in `--basil`: "{meals} obroka × {people} porcije", "od {minPrice} RSD po porciji", "Dostava {deliveryFee} RSD uključena", "Preskoči ili otkaži bilo kada" (only if true for the flow; otherwise "Plan menjaš pre svake porudžbine").
- Math (unchanged from current): `low = minPrice × people × meals + deliveryFee`, `high = maxPrice × people × meals + deliveryFee`, formatted `sr-RS`.
- CTA: featured `primary lg` "Izaberi plan", other `secondary lg` "Izaberi plan". Action: `setPlan({ people, mealsPerWeek: meals })` from BoxContext, then navigate to `/meni`. Accessible name: "Izaberi plan za 2 osobe, 3 obroka nedeljno".
- Footnote `meta` `--ink-muted` centered: "Okvirno, na osnovu trenutnog menija — tačnu cenu vidiš pre potvrde porudžbine."

| 375 | 768 | ≥1024 | 1440 |
|---|---|---|---|
| selector full-width; cards stacked, featured first | cards 2 cols, max-width 720 centered | cards 2 cols max-width 880; selector centered above | same |

Motion: on meal change, numbers crossfade (opacity 1→0 80ms, swap, 0→1 150ms); widths stable thanks to tabular nums + `min-width` on the range. Cards reveal stagger 100ms. Reduced motion: instant swap.

---

## 8. Najčešća pitanja — `id="pitanja"`

**Job:** last objections before CTA.
Existing 5 FAQ items, copy unchanged except: answer 2 keep "Moja kutija" in quotes as „Moja kutija" (Serbian quotes).

| 375 / 768 | ≥1024 |
|---|---|
| header then accordion, max 720 | 12-col: left cols 1–4 sticky (`top: 112px`) header: eyebrow "Pitanja", h2 "Najčešća *pitanja*", lede "Tačnu cenu i sadržaj kutije uvek vidiš pre nego što potvrdiš porudžbinu." + ghost link "Sastavi kutiju" → `/meni`; right cols 6–12 accordion |

Accordion per MASTER 6.9, server-rendered (remove the `next/dynamic` lazy load and skeleton).

---

## 9. Final CTA

**Job:** convert the scroller.
Full-bleed band bg `--forest` (not a rounded box inside the container; edge to edge), padding-y 96 (128 ≥1024), overflow hidden.
- Eyebrow `--mustard`: "Ove nedelje"
- h2 `display-l` `--on-forest`, centered, max 18ch: "Ti kuvaš. Sve ostalo je *već u kutiji*."
- Lede `body-l` `--on-forest-muted`: "Pogledaj {recipeCount} recepata ove nedelje i sastavi svoju prvu kutiju za manje od dva minuta."
- `primary lg` "Pogledaj nedeljni meni" + arrow → `/meni`. Focus ring `--mustard` here.
- Plate row along the bottom edge, cropped by 40% of its height: 5 plates (`md`, 375: 3 plates `sm`), alternating tilts, `aria-hidden`.

Motion: plates slide up y 48→0 with stagger 80ms when band enters (`start: "top 75%"`); h2 reveal. Reduced motion: static.

---

## 10. Footer
Per MASTER 6.10. Footer anchor links point to `/#kako`, `/#cene`, `/#pitanja`.

---

## 11. States checklist (home)

| Element | hover | focus-visible | active | disabled | loading | empty | error |
|---|---|---|---|---|---|---|---|
| Primary button | paprika-deep, arrow +4px | ring 2px offset 3 | scale .98 | — | — | — | — |
| Recipe card "Dodaj" | basil-tint | ring | scale .98 | — | — | — | — |
| Filter chip (link) | paper-2 | ring | — | — | — | hidden if count 0 | — |
| Segmented control | paper on option | ring on option | — | — | — | — | — |
| Accordion trigger | ink → basil text | ring (full row) | — | — | — | — | — |
| Menu grid | — | — | — | — | none (server-rendered; no skeleton) | empty card, section 0.1 | error card + "Pokušaj ponovo", section 0.1 |

## 12. Anti-patterns specific to this page

- Do not center the hero text on desktop; the asymmetric text/plates split is the identity.
- Do not reintroduce the old floating emoji circles, the "i još…" link, or gradient text on "profesionalac".
- Do not put more than one `primary` button per section (hero, menu, pricing-featured, final CTA each have exactly one).
- Do not lazy-load hero or FAQ with skeletons; below-the-fold sections may be split only if they render a same-size placeholder.
- Do not add testimonials, ratings or "10.000 zadovoljnih korisnika" — there is no data for it.

## 13. QA baseline items (qa/home-report.md section 1) covered by this redesign

| QA finding | Spec answer |
|---|---|
| Navbar has no mobile menu | Below 1024px: logo · basket icon button with count · menu button opening a full-screen sheet (MASTER 6.7: focus trap, Esc, scroll lock, closes on route change). |
| Hero overflows ~16px at 375 | Hero `section` gets `overflow-x: clip` (not `hidden`, so sticky children keep working); the mustard charger circle and plate cluster are sized from the container (`max-width: 100%`), never from fixed px beyond it. At 375 the plate row is 96 + 160 + 96 − 32 overlap = 320px ≤ 335px content width. **Acceptance: `document.documentElement.scrollWidth === 375` at 375.** Same rule for the final CTA plate row and bento tile A (both `overflow: clip`). |
| Toggle buttons lack a pressed state / `aria-pressed` | Every toggle has a visible **and** semantic state: RecipeCard "Dodaj" ↔ "U kutiji" (`aria-pressed`, `selected` variant with `check` icon); /meni filter chips (`aria-pressed`, `--basil-tint` + `check`); pricing meals selector and /kutija plan pickers are segmented controls (`role="radiogroup"` / `role="radio"` + `aria-checked`, selected = `--card` + shadow + 600 weight). Color is never the only signal. |
| 404 is the default English page | Out of scope for home v1. A branded `not-found` will get its own spec (`pages/not-found.md`): "Ova stranica nije na meniju", empty Plate, primary "Nazad na početnu" + ghost "Nedeljni meni". |
| Placeholder-only checkout inputs, "obrok (a)" copy | Not home; covered later by MASTER 6.11 when /checkout and /kutija are redesigned. |

## 14. Acceptance (design review will check)

- Screens at 375 / 768 / 1024 / 1440 match the tables above; no horizontal scroll; value strip visible above the fold at 1440×900.
- Fraunces + Instrument Sans load (latin-ext), no fallback flash longer than swap; CLS < 0.1; LCP = h1 text.
- All icons SVG; no emoji outside Plates.
- Keyboard: skip link → nav → hero CTA → … → footer, all with visible rings; mobile menu traps focus and closes on Esc.
- Reduced motion: page fully static and complete.
