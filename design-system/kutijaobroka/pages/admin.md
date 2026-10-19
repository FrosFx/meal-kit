# Admin panel spec — `/admin/*`

> Overrides MASTER.md where they differ. Same tokens, fonts, focus and contrast rules as the site; chart and status colors are in MASTER 3.4.
> **Character:** a working tool. Calmer and denser than the marketing site: no grain texture, no Plates larger than `xs`, no scroll reveals, no italic display headlines, at most one Fraunces element per screen (the page title). Desktop first (1280–1440), fully usable at 768 and 375.

---

## 0. Data contracts (aligned to backend, 2026-10-19)

Source of truth: `docs/api/admin.md` + `src/lib/admin/types.ts` (backend). Status labels come from `ORDER_STATUS_LABELS` in `src/lib/orders/rules.ts`; units from `INGREDIENT_UNITS`. Never hard-code either list in components.

| Screen | Endpoint → type | Design notes |
|---|---|---|
| Pregled | `GET /api/admin/kpi?from&to` → `KpiResponse` | Every KPI is `{ value, previous }`; delta = value vs previous; `previousRange` feeds the comparison line; `series` + `previousSeries` with `bucket` `"day"` (≤ 31 days) or `"week"` (from Monday); `statusCounts` includes zeros; `topRecipes` = 5 **by revenue**. Revenue/orders/avgBasket exclude OTKAZANA. |
| Poslednje porudžbine card | `GET /api/admin/orders?pageSize=5` → `Paged<OrderListItem>` | |
| Porudžbine | `GET /api/admin/orders` (`q`, `status=A,B`, `from`/`to` = createdAt, `window` = delivery date, `customerId`, `sort`, `page`, `pageSize` ≤ 100) → `Paged<OrderListItem>` | Sort options are only `createdAt_desc` (default), `createdAt_asc`, `total_desc`, `total_asc`, `delivery_asc`. |
| CSV | `GET /api/admin/orders/export.csv` (same filters) | Whole filtered set, max 10 000 rows; columns and filename come from the server (UTF-8 BOM, `;`). |
| Porudžbina detail | `GET/PATCH /api/admin/orders/:id` → `OrderDetail` | `address` is `{ street, city }` only; `allowedTransitions` limits the status control; PATCH 409 = disallowed transition. `items[].recipeId/emoji/color` are `null` when the recipe was deleted. `statusHistory` is oldest first with `by: "kupac" \| "admin"`. |
| Recepti | `GET /api/admin/recipes?from&to` → `AdminRecipe[]` (incl. inactive, `ingredients`, `stats.weeklyServings` 12 weeks); `POST`; `PATCH` (partial, e.g. `{ active: false }`; `ingredients` replaces the list); `DELETE` → 409 `RECIPE_HAS_ORDERS` | |
| Kupci | `GET /api/admin/customers` (`q`, `sort` = `lastOrder_desc` default, `ltv_desc`, `orders_desc`, `name_asc`) → `Paged<CustomerListItem>`; `GET /api/admin/customers/:id` → `CustomerDetail` | No new/returning filter in the API; the "Nov / Povratni" badge is derived from `orderCount` (1 = Nov). `addresses[]` are derived from orders. |
| Nabavka | `GET /api/admin/procurement/windows` → `ProcurementWindow[]` (only dates with open orders); `GET /api/admin/procurement?from&to` → `ProcurementReport`; `…/export.csv` | The server fixes the statuses (NOVA, POTVRDJENA, U_PRIPREMI). One window = `from = to = date`. `missingIngredients[]` drives the warning banner. |
| Login | `POST /api/admin/login { password }` → cookie; 401, 429 (5 tries / 15 min), 503; `POST /api/admin/logout`; `GET /api/admin/session` | |

Status lifecycle: **Nova → Potvrđena → U pripremi → Poslata → Isporučena**, plus **Otkazana** (keys `NOVA`, `POTVRDJENA`, `U_PRIPREMI`, `POSLATA`, `ISPORUCENA`, `OTKAZANA`).

Delivery window display: `{ date, day, from, to }` is a fixed 17–21 h window, shown as "sre 22. 10. · 17–21 h".

Deleted recipes (`recipeId: null`): show an **empty-rim Plate** `xs` and the snapshot name followed by `meta` "(obrisan recept)"; no link.

Formatting: money `sr-RS` + " RSD" (`12.480 RSD`); compact on axes and sparklines only (`Intl.NumberFormat("sr-RS", { notation: "compact" })` gives "120 hilj."); dates `d. M. yyyy.` ("19. 10. 2026."), weekday short in delivery windows ("sre 22. 10. · 17–21 h"); phone shown as entered, linked `tel:`.

---

## 1. Shell (all screens after login)

The admin **does not render** the marketing Navbar and Footer (frontend: use a route group or an admin layout so `/admin/*` gets its own chrome).

**Sidebar** (≥1024): width 240px (1440: 256), bg `--card`, right border `--line`. Top: Logo (24px) + "Admin" `meta` badge. Nav items (44px high, radius `--radius-sm`, icon 20 + label `ui` 15px):
`layout-dashboard` Pregled · `receipt` Porudžbine (count badge of status Nova) · `chef-hat` Recepti i meni · `users` Kupci · `clipboard-list` Nabavka.
Active item: bg `--basil-tint`, text `--basil`, 3px left bar `--basil`, `aria-current="page"`. Hover: bg `--paper-2`. Bottom: "Otvori sajt" (`external-link`) → `/` in a new tab, and "Odjavi se" (`log-out`), separated by a rule from the main nav.

**Top bar**: height 56px, bg `--paper`, bottom border `--line`, sticky. Left: page title h1 Fraunces 600 26px (`display-m` at its min). Right: page-level primary action (e.g. "Novi recept"). <1024: a menu button (44px) on the left opens the sidebar as a drawer (focus trap, Esc, scroll lock).

**Content**: bg `--paper`, padding 32 (1440: 40; 768: 24; 375: 16), max-width 1360px.
**Filter row** (MASTER rule from dataviz: one row, above the content it scopes, date range first): height 44 controls, gap 12, wraps on small screens; the right end holds exports.

**Admin type scale** (overrides MASTER 4.1 inside admin):
| Role | Spec |
|---|---|
| Page title | Fraunces 600 26px / 1.2 |
| Card/section title | Instrument Sans 600 18px / 1.3 |
| KPI value (hero figure) | Instrument Sans 600 32px (1440: 36px), proportional figures (no tabular) |
| Body, table cells, form text | Instrument Sans 400 16px / 1.5. **Numbers in table columns: tabular-nums, right-aligned** |
| Meta / table secondary line / axis ticks | 14px `--ink-muted` (axis ticks 13px tabular) |

**Density**: cards padding 20 (1440: 24), radius `--radius-lg`, shadow `--shadow-sm`, gaps 16 / 24. Table rows 52px, header row 44px.

**Global states**:
- Loading (first load only): skeleton blocks with the final dimensions (KPI tiles, chart frame, 8 table rows).
- Refetch (filter change): keep the previous render at `opacity: 0.5` + `aria-busy="true"` on the region; no skeleton and no jump.
- Error: inline card `--danger-tint`, 1px `--danger`, icon `circle-alert` + "Podaci nisu učitani." + `secondary md` "Pokušaj ponovo". Never a blank screen.
- Toasts (bottom-right, 375: bottom full width): `--ink` bg, `--paper` text, 4s, `role="status"`, used for "Status je promenjen", "Recept je sačuvan", "CSV je preuzet".

**Motion**: only functional. Drawer slides in from the right (translateX 24px → 0 + opacity, 240ms `--ease-out`, exit 160ms); toasts fade/slide 8px; the sidebar drawer slides from the left. No reveals and no chart entrance animation. Reduced motion: everything instant.

---

## 2. Login — `/admin/login` (or the gate on `/admin`)

Centered card on `--paper` **with** the grain (the only admin screen with it, as a brand moment). Card: `--card`, width 400px (375: full width minus 32), padding 40 / 24, radius `--radius-xl`, `--shadow-lg`.
- Logo 32px centered, h1 Fraunces 600 28px "Admin panel", `meta` muted "Prijavi se da upravljaš porudžbinama i menijem."
- Field "Lozinka" (visible label; input 48px; `autocomplete="current-password"`, show/hide toggle button `eye`/`eye-off` with `aria-label="Prikaži lozinku"` and `aria-pressed`). Password only (current contract). Add a visually hidden `username` field with the value "admin" and `autocomplete="username"` so password managers can save the credential.
- `primary lg` full width "Prijavi se"; loading: spinner + "Prijavljivanje…", disabled.
- Error below the field: `circle-alert` + "Pogrešna lozinka. Pokušaj ponovo.", `aria-describedby`, focus returns to the field, field gets `aria-invalid`. Too many attempts (429): "Previše pokušaja. Pokušaj ponovo za 15 minuta." with the submit disabled. Not configured (503): "Admin pristup nije podešen na serveru." (no retry). The session check (`GET /api/admin/session`) runs before the form renders, so a logged-in admin goes straight to Pregled; while it runs, show only the card frame (no flash of the form).
- Footer link (ghost, `meta`): "← Nazad na sajt".
- Password managers and paste must work (WCAG 3.3.8).

---

## 3. Pregled — `/admin`

**Filter row:** date-range picker (below) · right: "Izvezi CSV" (`download`, secondary md) for the KPIs and series.

### 3.1 Date-range picker
Trigger button: `calendar` icon + current label ("Poslednjih 30 dana") + `chevron-down`, 44px. Popover (`--card`, `--shadow-lg`, radius `--radius-md`, 280px):
- Preset rows (44px, `role="menuitemradio"` or radio list): Danas · Juče · Poslednjih 7 dana · **Poslednjih 30 dana** (default) · Poslednjih 90 dana · Ovaj mesec · Prošli mesec. The selected row has a 16px bold `check`; hover is a `--paper-2` wash.
- Footer, after a hairline: "Prilagođeno": two native `<input type="date">` fields (Od / Do, labeled) + `secondary md` "Primeni". Validation: "Datum početka mora biti pre datuma kraja."
- The comparison line under the trigger (`meta`): "Poređenje sa: 20. 8. – 18. 9. 2026."
- State in the URL (`?od=2026-09-20&do=2026-10-19`) so views can be shared. Esc closes, focus returns to the trigger.

### 3.2 KPI row
4 stat tiles (`--card`). Contract: label (sentence case, no colon, `meta` 600 `--ink-muted`) · value (KPI value style) · delta · sparkline.

| Tile | Value | Delta (vs previous period) | Sparkline |
|---|---|---|---|
| Prihod | "482.300 RSD" | "+12,4 %" with `trending-up` in `--basil`; label "u odnosu na prethodni period" (`meta`) | 12 points, `--viz-muted` 1.5px line, last point 8px dot `--viz-1` with a 2px `--card` ring |
| Porudžbine | "137" | same pattern | same |
| Prosečna korpa | "3.520 RSD" | same | same |
| Kupci | **meter** instead of a sparkline: "38 novih · 62 povratna" (value line "100 kupaca"); a 8px track `--viz-1` at 20% with the returning share filled in `--viz-1`, plus a legend line "■ Povratni 62 % · □ Novi 38 %" in text tokens | delta on the total | — |

Delta rules: up is good for all four. 0 → "bez promene" in `--ink-muted` with `minus`. No previous data → "nema podataka za poređenje".

| 375 | 768 | 1024 | 1440 |
|---|---|---|---|
| 1 column (2×2 is too tight for the RSD values) | 2×2 | 4 in a row | 4 in a row |

### 3.3 Trend chart — "Prihod i porudžbine"
Card spanning the full width (≥1024: 8 of 12 columns, with the status breakdown in 4).
- Header: title + segmented control **Prihod | Porudžbine** (`role="radiogroup"`). **One measure at a time, one y-axis** (no dual axis).
- Form: line 2px `--viz-1` with a `--viz-area` wash for the current period; the previous period is a 1.5px `--viz-muted` line without area, aligned by day index.
- Legend (2 series, always shown, top-left under the title): line key `--viz-1` "Ovaj period", line key `--viz-muted` "Prethodni period". Text in `--ink-muted`, never in the series color.
- Direct label: only the last value of the current period, at the line end (`meta` 600 `--ink`).
- Axes: 1px solid `--viz-grid` gridlines (4 horizontal); y ticks compact ("120 hilj."), x ticks every 7th day ("13. 10."); with `bucket: "week"` every point is a week, ticks show the Monday ("od 13. 10."), and the tooltip header says "Nedelja od 13. 10.". Chart height 280 (375: 220) **including** the x-axis band.
- Hover/focus: a vertical crosshair hairline snaps to the nearest date; tooltip shows the date, then both series with **values first** (bold `--ink`) and line keys. Keyboard: the plot is focusable (`tabindex=0`); ←/→ move the crosshair; the tooltip appears on focus too.
- "Prikaži tabelu" ghost toggle under the chart reveals a `<table>` with the same data (date, revenue, orders, previous). Screen-reader summary in `<figcaption>`: "Prihod u izabranom periodu: 482.300 RSD, 12 % više nego u prethodnom."

### 3.4 Status breakdown — "Porudžbine po statusu"
Horizontal bar list (not a donut): one row per status in lifecycle order, Otkazana last after a hairline. Row: status badge (MASTER 3.4) · bar (`--viz-1`, ≤ 16px thick, 4px rounded end, track `--viz-muted` at 15%) · count + share `meta` ("42 · 31 %") right-aligned tabular. Every bar uses the same hue (nominal categories, length carries the value). The whole row is a link → Porudžbine filtered by that status (hover `--paper-2`, focus ring).

### 3.5 Top recipes — "Najpopularniji recepti"
Card (≥1024: 6 of 12 columns, next to a "Poslednje porudžbine" card listing the 5 latest orders with status badges and a "Sve porudžbine →" ghost link). Sorted **by revenue** (backend order). Rows: rank (`meta` tabular) · Plate `xs` 32px · name (16px) · bar `--viz-1` scaled to the max **revenue** · "48.200 RSD" (600, tabular) + "86 porcija" (`meta`). The row links to the recipe's edit page; a deleted recipe follows the §0 rule and is not a link.

### 3.6 Layout

| 375 | 768 | 1024 | 1440 |
|---|---|---|---|
| filter row wraps (picker full width, export as an icon button with `aria-label`) → KPIs stacked → trend → status → top recipes → latest orders | KPI 2×2 → trend full → status + top recipes stacked | KPIs 4 → trend 8/12 + status 4/12 → top recipes 6/12 + latest orders 6/12 | same at max-width 1360 |

### 3.7 Empty state (zero orders in range)
- KPI tiles show "0" / "0 RSD", the delta reads "nema podataka za poređenje", and the sparkline is a flat `--viz-grid` line.
- Trend card: keep the frame and axes (baseline only, no gridlines). Centered message: `receipt` icon 28 `--ink-muted`, title "Još nema porudžbina u ovom periodu", `meta` "Kada kupci naruče, ovde ćeš videti prihod i broj porudžbina po danima.", plus `secondary md` "Poslednjih 90 dana" (widens the range) and the ghost link "Otvori sajt".
- Status and top-recipe cards: one line "Nema podataka za izabrani period." with no bars.
- If there have **never** been orders, the whole Pregled shows a single welcome card above the tiles: "Prodavnica je spremna. Prva porudžbina će se pojaviti ovde." + `primary md` "Proveri meni" → Recepti.

---

## 4. Porudžbine — `/admin/porudzbine`

**Filter row**: search input (`search` icon, labeled visually-hidden "Pretraži porudžbine", placeholder "Broj, ime, email ili telefon", 320px, debounce 300ms) · status filter (a multi-select popover with checkbox rows and badges; the trigger shows "Status: 2") · date-range picker (3.1) · delivery-window select · "Poništi filtere" ghost (only when a filter is active) · right: "Izvezi CSV" (secondary md; exports **the current filtered set**, all pages; the button label shows the count "Izvezi CSV (137)").
Filters live in the URL.

### 4.1 Table (≥1024)
Columns: [checkbox 44] · **Broj** (MK-xxxxxx, 600, tabular) · **Datum** (date + time `meta`) · **Kupac** (full name; email `meta` below) · **Termin dostave** · **Stavke** (right, tabular) · **Iznos** (right, tabular, 600) · **Status** (badge) · [chevron 44].
- Sortable (only what the API sorts): **Datum** (`createdAt`), **Iznos** (`total`), **Termin dostave** (`delivery_asc`, ascending only). Broj, Kupac and Status are not sortable. The header button shows `arrow-up`/`arrow-down` and sets `aria-sort` on the `th`.
- Row: 52px, hover `--paper-2`. Clicking the row or pressing Enter on the focused number link opens the drawer. The checkbox stops propagation. Zebra stripes are not used; rows are separated by 1px `--line`.
- Sticky header row (top: 56px top bar).
- Pagination under the table: "1–25 od 137" + previous/next icon buttons (44px, labeled) + page-size select (25 / 50 / 100).
- **Bulk bar** (appears when ≥1 row is checked; sticky at the bottom of the viewport, `--ink` bg, `--paper` text, radius `--radius-md`, `--shadow-lg`): "3 izabrane" · "Promeni status" (menu) · "Izvezi izabrane" · "Poništi izbor". Its focus ring is `--mustard`.

| 768 | 375 |
|---|---|
| Hide Termin and Stavke; Kupac drops the email line | **Cards** instead of rows: line 1 number + status badge; line 2 customer name; line 3 `meta` date · window; right column amount 600. Whole card is a button opening the drawer (full screen). Checkbox top-left for bulk. Sort via a "Sortiraj" select above the list |

### 4.2 Order drawer (`?porudzbina=<id>`, deep-linkable)
Right panel 520px (1024: 480; <768: full-screen sheet), `--card`, `--shadow-lg`, scrim `rgb(28 42 31 / 0.4)`. `role="dialog"`, `aria-modal`, labelled by its title. Focus goes to the title on open, focus is trapped, Esc closes, and focus returns to the originating row. Prev/next order buttons (`chevron-up`/`chevron-down`, labeled "Prethodna porudžbina" / "Sledeća porudžbina") in the header.
1. **Header**: "MK-48213" (Instrument Sans 600 20px) + status badge; `meta` "Naručeno 19. 10. 2026. u 14:32"; close `x` 44px.
2. **Kupac**: the customer's full name (link → customer detail) · Telefon (`tel:` link + copy button `copy`, labeled "Kopiraj telefon") · Email (`mailto:` + copy) · **Adresa dostave**: `street`, then `city` on the next line, + copy button (the data has no postal code or note). Field labels `meta` `--ink-muted`, values 16px `--ink`. A definition list (`<dl>`).
3. **Dostava**: termin ("sre 22. 10. · 17–21 h"), plan "2 osobe · 3 obroka".
4. **Stavke**: rows Plate `xs` · name · "2 porcije × 690 RSD" `meta` · line total right tabular. Then Međuzbir, Dostava, **Ukupno** (600, 18px).
5. **Status**: a native `<select>` (labeled "Status porudžbine") listing the current status (selected, first) **and only the statuses in `allowedTransitions`**, with the badges' text; when `allowedTransitions` is empty, the control is replaced by the `meta` text "Status je konačan." A PATCH 409 shows an inline error under the control: `circle-alert` + "Ova promena statusa više nije dozvoljena. Osveži porudžbinu." with a ghost "Osveži" + `primary md` "Sačuvaj status" (disabled until the value changes; loading spinner; success toast). Choosing **Otkazana** opens a confirm dialog: "Otkazati porudžbinu MK-48213?", body "Kupac neće dobiti kutiju. Ovo se može vratiti promenom statusa.", buttons "Odustani" (secondary) / "Otkaži porudžbinu" (bg `--danger`, text `--paper`; 6.1:1 light, dark mode uses `--paper` text #121813 on #F97066 = 6.47:1).
6. **Istorija**: a vertical timeline of `statusHistory` (8px dots in the badge text color + label + time `meta` + who: "kupac" / "admin"), rendered newest first (the reverse of the API order).
PII: personal data appears only in the drawer and in the CSV; the list shows the name and email only.

### 4.3 CSV export
The button requests `/api/admin/orders/export.csv` with the current filters; the server sets the filename, columns, BOM and `;` separator. If the filtered set is over 10 000 rows, the button is disabled with helper text "Suzi filtere — izvoz je ograničen na 10.000 porudžbina." While it's preparing, the button shows a spinner and "Pripremam…". Then a toast "CSV je preuzet".

### 4.4 Empty and filtered-empty states
- No orders at all: centered in the table area, an empty Plate `sm` (rim only) + "Još nema porudžbina" + `meta` "Nove porudžbine sa sajta pojaviće se ovde automatski." + ghost link "Otvori sajt". The filter row is still shown but disabled, and export is disabled with the tooltip text "Nema podataka za izvoz".
- Filters with no results: "Nema porudžbina za izabrane filtere" + `secondary md` "Poništi filtere".

---

## 5. Recepti i meni — `/admin/recepti`

### 5.1 List
Filter row: search "Pretraži recepte" · tag chips (filter chips, `aria-pressed`) · "Aktivni / Neaktivni / Svi" segmented · right: `primary md` "Novi recept" (`plus`) in the top bar.
Table columns: Recept (Plate `xs` 32 + name; tags `meta` below) · Cena/porcija (right) · Vreme (right, "25 min") · kcal (right) · Porcije (30 d) (right) · **Aktivan** (switch, see 5.3; toggling saves immediately with toast "Recept je skinut sa menija" + "Poništi" action in the toast for 6s) · actions: "Izmeni" link + overflow `ellipsis` menu (Dupliraj, Obriši).
Inactive rows: name in `--ink-muted` + a "Neaktivan" badge (`--paper-2`) so the state isn't color-only.
768: hide kcal and Vreme. 375: cards (Plate xs, name, price, switch, "Izmeni").
Empty: "Još nema recepata" + `primary md` "Dodaj prvi recept".

### 5.2 Create / edit — `/admin/recepti/novi`, `/admin/recepti/[id]`
A page, not a modal (long form). Layout ≥1024: form 7/12 + **live preview** 5/12 sticky (top 88): the public RecipeCard (MASTER 6.5) rendered with the current values, label "Pregled na sajtu". <1024: preview collapses into a "Pregled" disclosure above the save bar.

Form sections (each in a card with a section title; labels above fields, MASTER 6.11):
1. **Osnovno**: Naziv* (max 60, counter) · Opis* (textarea 3 rows, max 160, counter "112 / 160") · Emoji* (a text input 1 char + a row of 12 suggested food emoji as buttons) · Boja* (a radiogroup of COLOR_PRESETS swatches 44px circles, each a mini Plate dish; the selected swatch gets a 2px `--ink` ring + `check`; the label name is visible under the selected one and is in `aria-label` for all) · Tagovi (filter chips with `aria-pressed`).
2. **Detalji**: Vreme pripreme (min)* · Kalorije (kcal)* · Cena po porciji (RSD)* (number inputs with a suffix unit inside the field and `inputmode="numeric"`), in 3 columns ≥768.
3. **Sastojci (po porciji)** — the ingredients editor:
   - Header row labels: Sastojak · Količina · Jedinica · (actions). On 375 each row becomes a stacked mini-card.
   - Row: text input (with `<datalist>` suggestions from existing ingredient names so the procurement aggregation matches) · number input (step 0.1, 96px) · select of `INGREDIENT_UNITS` · move up / move down icon buttons (`chevron-up`/`chevron-down`, labeled "Pomeri gore" / "Pomeri dole"; the keyboard and single-pointer alternative to drag) · remove `trash-2` (labeled "Ukloni sastojak {name}").
   - "Dodaj sastojak" (`plus`, secondary md) under the list; Enter in the last row's quantity adds a new row and focuses it.
   - Validation on blur: name required, quantity > 0. Errors inline under the field. Duplicate names get the warning "Ovaj sastojak je već na listi."
   - Empty: "Dodaj bar jedan sastojak da bi recept ušao u nabavku." (`meta`, `--ink-muted`), and the first empty row is already present.
4. **Dostupnost**: "Aktivan na meniju" switch + helper "Neaktivni recepti se ne prikazuju kupcima, ali ostaju u starim porudžbinama."
5. **Statistika** (edit only; uses the Pregled date range, default 30 days): 3 mini stat tiles (Porudžbine, Porcije, Prihod) + a 12-week column chart of servings (single series `--viz-1`, columns ≤ 24px with 4px rounded tops, a value label on the last column only, hover tooltip "Nedelja 13. 10.: 42 porcije", table toggle). Empty: "Ovaj recept još nije naručen."
6. **Opasna zona** (edit only): a card with a `--danger` 1px border: "Obriši recept" (danger button) → confirm dialog naming the recipe. If DELETE returns 409 `RECIPE_HAS_ORDERS`, the dialog switches in place to: "Ovaj recept postoji u porudžbinama, pa ne može da se obriše. Deaktiviraj ga da ga skloniš sa menija." with `primary md` "Deaktiviraj" (PATCH `{ active: false }`) and "Odustani". Old orders keep their snapshot name and price.

**Save bar**: sticky bottom, `--card`, top border `--line`, `--shadow-md`. Left `meta` "Nesačuvane izmene" (shown only when dirty). Right: "Otkaži" (ghost) · "Sačuvaj recept" (primary md; loading; on success toast + stays on the page). An error summary at the top of the form after a failed submit (focus moves to it, links to the fields). Leaving with unsaved changes shows the confirmation "Imaš nesačuvane izmene. Napusti stranicu?".

### 5.3 Switch component (new, MASTER-level)
44×24 track, `role="switch"`, `aria-checked`, visible label. Off: track `--line-strong` with a `--card` knob. On: track `--basil` with a `--card` knob + a tiny `check` inside the knob. Knob slides 150ms (instant under reduced motion). Focus ring as MASTER.

---

## 6. Kupci — `/admin/kupci`

List: search ("Ime, email ili telefon") · sort select "Sortiraj: Poslednja porudžbina (default) / Ukupno potrošeno / Broj porudžbina / Ime". The API has no new/returning filter and no customer CSV, so the UI shows neither.
Columns: Kupac (name + email `meta`) · Telefon · Grad · Porudžbine (right) · Poslednja porudžbina (date; "—" when null) · **Ukupno potrošeno** (right, 600, tabular) · Tip (badge derived from `orderCount`: 1 = "Nov" `--paper-2`, 2+ = "Povratni" `--basil-tint`, 0 = no badge). Sorting is via the select; column headers mirror it with `aria-sort`.
768: hide Telefon and Grad. 375: cards (name, LTV right, "4 porudžbine · poslednja 12. 10.").
Empty: "Još nema kupaca. Pojaviće se ovde posle prve porudžbine."

Detail — `/admin/kupci/[id]`: a back link "← Kupci". Header: the customer's full name (page title), contact line with `tel:`/`mailto:` + copy buttons. KPI row (4 tiles, no sparklines): **Ukupno potrošeno** (LTV) · Broj porudžbina · Prosečna korpa · Kupac od (date of first order). Then "Adrese" (derived from orders: `street`, `city`, `meta` "poslednji put 12. 10."; the most recent gets the badge "Poslednja") and "Istorija porudžbina": the order table (4.1 without the Kupac column) opening the same drawer.

---

## 7. Nabavka — `/admin/nabavka`

Job: tell the kitchen what to buy and prep for one delivery window.
**Filter row**: **Termin** picker: a select or popover listing `ProcurementWindow[]` (only dates with open orders, upcoming first), each "sre 22. 10. · 17–21 h — 24 porudžbine"; the first one is the default. Its last option, "Više dana…", reveals two date inputs (Od / Do) for a combined report (`from`/`to`). Next to it, a static `meta` note: "Uračunate porudžbine: Nova, Potvrđena, U pripremi" (the server fixes the statuses, so there is no control). Right: "Izvezi CSV" (secondary) + "Štampaj" (`printer`, secondary).

1. **Summary tiles** (3): Porudžbine · Kutije · Porcija ukupno.
2. **Porcije po receptu**: a table + inline bar: Plate `xs` · Recept · Porudžbine (right) · Porcije (right, 600) · bar `--viz-1` scaled to the max. Sorted by servings desc. Footer row "Ukupno".
3. **Ukupni sastojci**: a table: [checkbox for the picking list, print only] · Sastojak · Ukupna količina (right, tabular, normalized: ≥1000 g → kg with 1 decimal, ≥1000 ml → l) · Jedinica · Koristi se u (recipe names `meta`, comma-separated, wraps). Sorted alphabetically (Serbian collation `localeCompare(..., "sr-Latn")` so č/ć/š/ž/đ sort correctly). A sticky search "Pronađi sastojak" filters the rows.
- **Print** (`@media print`): hide the sidebar, top bar, filters and buttons; black on white; the header "Nabavka · sre 22. 10. 2026. · 17–21 h · 24 porudžbine · generisano 19. 10. 2026. 15:04"; both tables full width, 12pt, rows never split across pages (`break-inside: avoid`), a checkbox square column on the ingredients table, page numbers in the footer.
- CSV: `/api/admin/procurement/export.csv` with the same `from`/`to` (server-defined columns: ingredients, then the per-recipe summary).
- Empty: with no windows (`[]`): empty-rim Plate `sm` + "Nema otvorenih porudžbina za predstojeće termine." + `meta` "Nabavka se računa iz porudžbina u statusu Nova, Potvrđena i U pripremi." A custom range with 0 orders: "Nema porudžbina u izabranom periodu." + ghost "Izaberi drugi termin".
- Missing ingredients: when `missingIngredients` is non-empty, show one warning banner above the tables (U pripremi badge colors, MASTER 3.4; `circle-alert`): "Bez unetih sastojaka (nisu uračunati u listu): Veggie bowl, Curry od povrća." Each name links to its recipe editor.

---

## 8. Keyboard and accessibility (all admin screens)

- Skip link "Preskoči na sadržaj" → main region. Sidebar is a `<nav aria-label="Admin">`.
- Tables: real `<table>` with `<th scope>`, a caption (visually hidden: "Porudžbine, strana 1 od 6"), `aria-sort` on sortable headers. The row-click convenience is mirrored by a real link/button in the row.
- Every icon-only button has an `aria-label`; tooltips show the same text on hover **and** focus.
- Charts: focusable plot, keyboard crosshair, `<figcaption>` summary, table view toggle. Values are never tooltip-only.
- Focus is managed for the drawer, dialogs, popovers and the sidebar drawer (trap, Esc, return focus).
- Live regions: toasts `role="status"`; the bulk bar count `aria-live="polite"`.
- Targets ≥ 44px (table checkboxes get a 44px hit area around the 20px box). Contrast per MASTER 3.3 / 3.4 in both themes.

## 9. Anti-patterns specific to admin

- Dual-axis revenue + orders chart; donut for status; a number on every chart point; dashed gridlines; series text colored like the series.
- Paprika as a chart color (fails CVD next to green); a status color reused as a series color.
- Marketing flourishes inside the tool: grain (except login), big Plates, reveal animations, italic Fraunces headlines.
- Modals for long forms (the recipe editor is a page); drag-only reordering.
- Skeleton flashes on refetch; layout jumps when filters change.
- Horizontal page scroll on mobile: tables become cards at 375.
- Personal data (phone, address) in list views or URLs.
