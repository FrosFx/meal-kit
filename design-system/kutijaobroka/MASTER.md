# KutijaObroka — Design System MASTER

> **How to use:** when building a page, read this file first, then `pages/<page>.md`.
> A page file **overrides** this file where they differ. Raw hex values live **only here**;
> page specs and components reference token names.

**Project:** KutijaObroka (meal-kit delivery, Serbia, UI copy in Serbian Latin)
**Stack:** Next.js 16 App Router · React 19 · Tailwind CSS v4 (CSS-first `@theme` in `src/app/globals.css`) · no UI library
**Owner:** design-lead · **Version:** 1.0 (2026-10-19)
**Generator baseline:** ui-ux-pro-max (`Food Delivery / On-Demand`, Hero-Centric pattern, variance 6 / motion 5 / density 4). Its orange + trust-blue palette and Playfair/Karla pairing were **rejected** as generic; structure, checklists and anti-patterns were kept.

---

## 1. Brief

| | |
|---|---|
| Product | Weekly meal kit: pick a plan (2 or 4 people, 2–4 meals/week), pick recipes, get measured ingredients + recipe cards delivered. |
| Audience | Urban Serbian households 25–45, couples and young families, cook on weeknights, price-aware (RSD), mobile-first. |
| Primary conversion | Home → `/meni` (choose recipes) → `/kutija` → `/checkout`. Secondary: understand price before committing. |
| Brand assets kept | Name "KutijaObroka", Serbian copy, recipe data (emoji + gradient as the recipe "photo"). Emerald-green UI and the 🍲 logo emoji are **retired**. |
| Constraint | No food photography. Visual richness must come from typography, color, texture and the **Plate** treatment (Section 6.4). No hotlinked stock images. |

## 2. Creative direction — "Pijaca Editorial"

A Saturday morning at the green market (pijaca) printed as a food magazine. Warm unbleached-paper backgrounds with a faint print grain, deep basil-green ink, and two appetite accents taken from a Serbian kitchen: **paprika** (ajvar red-orange) for action, **mustard** (dried corn, honey) for highlights. Headlines are set in Fraunces, a soft, slightly wonky display serif that feels hand-made and generous; UI and body copy are a crisp, neutral grotesque (Instrument Sans) so prices and buttons stay unmistakably functional. Recipes are presented as **plates on a table**: round gradient "dishes" with a cream rim, seen from above, slightly rotated, overlapping like a styled flat-lay. Layouts are editorial: asymmetric hero, big numerals, thin rules, generous whitespace, one strong dark band (forest green) per page for rhythm. References: Bon Appétit / Kinfolk print layouts, Ottolenghi cookbooks, market price-tag stickers. **It must NOT look like:** a SaaS template (centered hero + three icon cards + gradient blob), the old emerald/teal Tailwind look, HelloFresh's lime green, a purple/blue gradient anything, glassmorphism, emoji used as UI icons, or neon/"tech" styling. Motion is calm and tactile (plates settle onto the table), never flashy.

---

## 3. Color tokens

Define in `globals.css` as CSS variables on `:root`, swap them under `@media (prefers-color-scheme: dark)`, and expose them to Tailwind via `@theme inline` (e.g. `--color-paper: var(--paper)` gives `bg-paper`, `text-ink`, `border-line`). Components never use `dark:` color classes or raw hex — only these tokens. Recipe gradients (`recipe.color`, e.g. `from-amber-200 to-amber-400`) are the **only** exception and appear only inside the Plate.

### 3.1 Light (default)

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FBF6EC` | Page background |
| `--paper-2` | `#F2E9D8` | Alternate section background, plate stage, inputs |
| `--card` | `#FFFDF8` | Cards, menus, sheets |
| `--ink` | `#1C2A1F` | Primary text, headings |
| `--ink-muted` | `#585E52` | Secondary text, meta (min 4.5:1 on paper, paper-2, card) |
| `--line` | `#E2D6BF` | Hairlines, card borders, dividers (decorative) |
| `--line-strong` | `#8A8270` | Input borders, outline-button borders (3:1 non-text) |
| `--basil` | `#2D5A37` | Brand green: links, secondary buttons, selected states, eyebrow text |
| `--basil-deep` | `#1F4228` | Hover of basil, **focus ring** on light surfaces |
| `--basil-tint` | `#E2EBD9` | Selected chip bg, success bg |
| `--forest` | `#1B3A24` | Dark band background (Final CTA, bento hero tile) |
| `--on-forest` | `#FBF6EC` | Text on forest |
| `--on-forest-muted` | `#CFE0C6` | Secondary text on forest |
| `--paprika` | `#B5360E` | **Primary CTA** fill, price emphasis, numerals |
| `--paprika-deep` | `#93290A` | Primary CTA hover/active |
| `--on-paprika` | `#FBF6EC` | Text on paprika |
| `--mustard` | `#EBB54F` | Highlights: underline swash, stickers, badges, focus ring on dark |
| `--on-mustard` | `#1C2A1F` | Text on mustard (always ink) |
| `--footer` | `#1C2A1F` | Footer background (= ink) |
| `--on-footer` | `#FBF6EC` | Footer text |
| `--on-footer-muted` | `#B7BBAC` | Footer secondary text |
| `--danger` | `#B42318` | Errors (always with icon + text) |
| `--danger-tint` | `#FDECEA` | Error background |

### 3.2 Dark (`prefers-color-scheme: dark`)

| Token | Hex |
|---|---|
| `--paper` | `#121813` |
| `--paper-2` | `#202A21` |
| `--card` | `#1A221B` |
| `--ink` | `#F2E9D8` |
| `--ink-muted` | `#ADB3A4` |
| `--line` | `#2E3A2F` |
| `--line-strong` | `#6F7866` |
| `--basil` | `#9CC79A` |
| `--basil-deep` | `#B9DAB6` |
| `--basil-tint` | `#24372A` |
| `--forest` | `#0E1F13` |
| `--on-forest` / `--on-forest-muted` | `#F2E9D8` / `#CFE0C6` |
| `--paprika` | `#F07A4A` |
| `--paprika-deep` | `#F4875A` |
| `--on-paprika` | `#121813` (dark text on light paprika) |
| `--mustard` / `--on-mustard` | `#EBB54F` / `#121813` |
| `--footer` / `--on-footer` / `--on-footer-muted` | `#0B100C` / `#F2E9D8` / `#ADB3A4` |
| `--danger` / `--danger-tint` | `#F97066` / `#3A1A17` |

Dark-mode focus ring: `--mustard`.

### 3.3 Verified contrast (WCAG 2.x)

| Pair | Ratio |
|---|---|
| ink / paper | 13.92 |
| ink-muted / paper · paper-2 · card | 6.21 · 5.55 · 6.58 |
| on-paprika / paprika (CTA label) | 5.57 (hover 7.61) |
| paprika text / paper · card | 5.57 · 5.90 |
| basil / paper · paper-2 · basil-tint | 7.41 · 6.63 · 6.51 |
| on-mustard / mustard | 8.04 |
| on-forest / forest · on-forest-muted / forest · mustard / forest | 11.62 · 9.02 · 6.71 |
| on-footer-muted / footer | 7.65 |
| line-strong / paper (non-text) | 3.54 |
| Dark: ink / paper · ink-muted / card · on-paprika / paprika · basil / paper | 14.95 · 7.58 · 6.51 · 9.48 |
| Ink on the lightest/darkest recipe gradient stops (amber-200 / red-400) | 12.04 / 5.42 |

### 3.4 Data-viz and status tokens (admin)

Validated with the dataviz skill's `validate_palette.js` (light on `--card` #FFFDF8, dark on `--card` #1A221B): lightness band, chroma ≥ 0.10, CVD ΔE (worst adjacent 15.9 light / 15.1 dark), normal-vision ΔE ≥ 15 (23.6 / 24.3), and mark contrast ≥ 3:1 all **PASS**. Brand basil + paprika as a series pair **FAILS** protan (ΔE 4.8), so paprika is never a chart series.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--viz-1` | `#2E7D4F` | `#3E9963` | Single-series default, the "current period" accent, all bar lists |
| `--viz-2` | `#7A55B0` | `#9C6CC6` | 2nd categorical series (reserve) |
| `--viz-3` | `#C8841C` | `#BC8626` | 3rd categorical series (reserve). Max 3 series; beyond that fold into "Ostalo" or use small multiples |
| `--viz-muted` | `#9A9384` | `#6F7866` | De-emphasis: previous period line, sparkline body, bar tracks at 25% opacity |
| `--viz-grid` | `#EDE5D5` | `#2A342B` | 1px solid gridlines/axes (never dashed) |
| `--viz-area` | `--viz-1` at 10% | `--viz-1` at 14% | Area wash under a line |

Order-status badges (status meaning is reserved; always icon + label, never color alone):

| Status | Badge bg / text (light) | Badge bg / text (dark) | Icon | Ratio light / dark |
|---|---|---|---|---|
| Nova | `#EEE7F5` / `#5B3E8A` | `#2C2440` / `#CDB4F0` | `sparkle` | 6.95 / 7.94 |
| Potvrđena | `--paper-2` / `--ink` | `--paper-2` / `--ink` | `circle-check` | 12.4 / 12.3 |
| U pripremi | `#FBEFD3` / `#7A4E00` | `#3A2F14` / `#EBB54F` | `chef-hat` | 6.30 / 7.05 |
| Poslata | `--paper-2` / `--ink-muted` | `--paper-2` / `--ink-muted` | `truck` | 5.55 / 6.90 |
| Isporučena | `--basil-tint` / `--basil` | `--basil-tint` / `--basil` | `package-check` | 6.51 / 6.68 |
| Otkazana | `--danger-tint` / `--danger` | `--danger-tint` / `--danger` | `circle-x` | 5.75 / 5.62 |

Delta colors in KPI tiles: good direction = `--basil` + `trending-up`/`trending-down` icon, bad direction = `--danger` + icon. The sign and the icon carry the meaning; the color only reinforces it.

`--line` is decorative only (1.33:1). Anything a user must perceive as a boundary (inputs, outline buttons, unselected chips) uses `--line-strong`.

---

## 4. Typography

**Two families only**, both via `next/font/google` with `subsets: ["latin", "latin-ext"]` (č ć š ž đ verified in both), `display: "swap"`:

| Role | Family | next/font | Variable | Axes to load |
|---|---|---|---|---|
| Display (h1–h3, numerals, prices, logo) | **Fraunces** | `Fraunces` | `--font-display` | `wght` + `opsz` + `SOFT` (use `axes: ["opsz", "SOFT"]`) |
| UI + body | **Instrument Sans** | `Instrument_Sans` | `--font-sans` | `wght` 400–700 |

Remove Geist and Geist Mono. Set `body { font-family: var(--font-sans) }` (currently Arial; fix). Fraunces settings for display: `font-variation-settings: "SOFT" 50, "WONK" 0;` italic used sparingly for one emphasized word per headline.

### 4.1 Type scale (fluid; mobile → 1440)

| Token | Family / weight | Size | Line height | Tracking | Use |
|---|---|---|---|---|---|
| `display-xl` | Fraunces 560, opsz 144 | `clamp(2.75rem, 1.6rem + 4.9vw, 5.5rem)` (44→88px) | 0.98 | -0.025em | Hero h1 only |
| `display-l` | Fraunces 560, opsz 96 | `clamp(2.125rem, 1.5rem + 2.6vw, 3.75rem)` (34→60px) | 1.04 | -0.02em | Section h2 |
| `display-m` | Fraunces 600, opsz 48 | `clamp(1.625rem, 1.35rem + 1.1vw, 2.25rem)` (26→36px) | 1.12 | -0.015em | Large h3, stat numbers, prices in pricing |
| `title` | Fraunces 600, opsz 24 | 1.25rem (20px) | 1.25 | -0.01em | Card titles, step titles |
| `body-l` | Instrument Sans 400 | 1.125rem (18px), 1.25rem ≥1024 | 1.6 | 0 | Hero lede, section ledes |
| `body` | Instrument Sans 400 | 1rem (16px) | 1.6 | 0 | All paragraphs, card descriptions, FAQ answers |
| `ui` | Instrument Sans 600 | 1rem (16px) | 1.25 | 0 | Buttons, nav links, accordion questions (1.0625rem) |
| `meta` | Instrument Sans 500 | 0.875rem (14px) | 1.4 | 0 | Prep time, kcal, helper text. Never for paragraphs. |
| `eyebrow` | Instrument Sans 600 uppercase | 0.8125rem (13px) | 1.2 | 0.14em | Section kickers, always `--basil` (or `--mustard` on forest) |

Rules: body never below 16px; paragraph measure `max-width: 62ch`; prices and counts use `font-variant-numeric: tabular-nums`; headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`; heading order h1 → h2 → h3 with no skips; one h1 per page.

---

## 5. Space, layout, radius, elevation

### 5.1 Spacing (4px base)

`--space-1` 4 · `2` 8 · `3` 12 · `4` 16 · `5` 20 · `6` 24 · `8` 32 · `10` 40 · `12` 48 · `16` 64 · `20` 80 · `24` 96 · `32` 128. Use Tailwind's default spacing scale (it is 4px based); no arbitrary values off this scale.

| Context | 375 | 768 | 1024 | 1440 |
|---|---|---|---|---|
| Page gutter | 20 | 32 | 48 | 64 |
| Section padding (y) | 64 | 96 | 112 | 128 |
| Section header → content | 32 | 40 | 48 | 48 |
| Grid gap (cards) | 16 | 24 | 24 | 32 |

### 5.2 Grid and containers

- Breakpoints: Tailwind defaults `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Review widths: 375 / 768 / 1024 / 1440.
- Container: `max-width: 1240px` (`--container`), centered, with the gutters above. Text-only blocks: `max-width: 62ch`.
- Desktop grid: 12 columns, 24px gap (32px ≥1280). Tablet: 8 columns. Mobile: 4 columns.
- Sticky nav height: 64px (<1024), 72px (≥1024). Anchor targets get `scroll-margin-top: 96px`.

### 5.3 Radius

`--radius-sm` 8px (badges, inputs) · `--radius-md` 14px (small cards, menu sheet items) · `--radius-lg` 24px (cards) · `--radius-xl` 32px (feature tiles, dark bands inside the container) · `--radius-pill` 999px (buttons, chips) · plates are circles.

### 5.4 Elevation (warm-tinted, never grey-blue)

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgb(60 40 10 / 0.06), 0 1px 1px rgb(60 40 10 / 0.04)` | Cards at rest, chips |
| `--shadow-md` | `0 10px 24px -10px rgb(60 40 10 / 0.20)` | Card hover, nav when scrolled, sticker |
| `--shadow-lg` | `0 28px 56px -20px rgb(40 30 10 / 0.30)` | Hero receipt card, mobile menu sheet |
| `--shadow-plate` | `0 18px 30px -12px rgb(60 30 10 / 0.35), inset 0 -6px 14px rgb(0 0 0 / 0.08)` | Plates |

Dark mode: same shadows at double alpha, plus 1px `--line` border on cards (shadows read weakly on dark).

### 5.5 Z-index

`0` content · `10` raised (stickers on cards) · `40` sticky nav · `50` mobile menu sheet + scrim · `60` toast. Skip link `100` when focused.

### 5.6 Texture

One page-wide grain layer: a fixed, `pointer-events: none`, `aria-hidden` element covering the viewport with an inline SVG `feTurbulence` noise (baseFrequency ~0.9, 2 octaves) as a data-URI background, `opacity: 0.035`, `mix-blend-mode: multiply` (dark mode: `0.05`, `screen`). The same noise at `opacity: 0.12` overlays every Plate. No other decorative effects (no blurred blobs, no glass).

---

## 6. Components

All interactive components: min target 44×44px, `cursor: pointer`, visible `:focus-visible` ring = `outline: 2px solid var(--ring); outline-offset: 3px` where `--ring` is `--basil-deep` on light surfaces and `--mustard` on forest/footer/dark mode. Never remove outlines without this replacement. Disabled: `opacity: 0.45`, `cursor: not-allowed`, native `disabled` / `aria-disabled`.

### 6.1 Icons

Inline SVG only, no emoji in UI chrome, no icon package (no new dependency). Frontend creates one local module (e.g. `src/components/icons.tsx`) by copying the needed **Lucide** paths (ISC license): `arrow-right`, `clock`, `flame`, `plus`, `check`, `minus`, `menu`, `x`, `shopping-basket`, `chevron-down`, `leaf`, `scale` (measured), `chef-hat`, `truck`, `calendar-sync`, `utensils`. Spec: 24 viewBox, `stroke-width: 1.75`, `stroke: currentColor`, round caps/joins. Sizes: `--icon-sm` 16px (meta), `--icon-md` 20px (buttons, nav), `--icon-lg` 28px (feature icons). Decorative icons next to text: `aria-hidden="true"`. Icon-only buttons: `aria-label` in Serbian.

Recipe emoji is **content**, not an icon: it is allowed only inside the Plate.

### 6.2 Button

| Variant | Rest | Hover | Active | Notes |
|---|---|---|---|---|
| `primary` | bg `--paprika`, text `--on-paprika`, `--shadow-sm` | bg `--paprika-deep`, `--shadow-md`, trailing arrow `translateX(4px)` | `scale(0.98)` | One per viewport section. Label + optional trailing `arrow-right`. |
| `secondary` | transparent, 1.5px border `--basil`, text `--basil` | bg `--basil-tint` | `scale(0.98)` | |
| `selected` (toggle on) | bg `--basil`, text `--paper`, leading `check` | bg `--basil-deep` | | Used for "U kutiji" state, `aria-pressed="true"` |
| `ghost` / link | text `--basil`, underline 1px offset 4px on hover | text `--basil-deep` | | Inline "Ceo meni →" links |
| `on-dark` | bg `--mustard`, text `--on-mustard` | bg `#F2C66E`-equivalent: `filter: brightness(1.06)` | | Only on forest/footer if paprika is not wanted |

Sizes: `md` height 44px, padding-x 20px, `ui` 16px; `lg` height 56px, padding-x 28px, `ui` 17px. Shape: pill. Full-width below 640px when it is the section's main CTA. Loading: label kept, spinner (16px, `currentColor`) replaces trailing icon, `aria-busy="true"`, disabled. Transition: `background-color, box-shadow, transform` 150ms `--ease-out`.

### 6.3 Card (base)

bg `--card`, 1px `--line` border, `--radius-lg`, padding 20px (24px ≥1024), `--shadow-sm`. Interactive cards: hover `translateY(-4px)` + `--shadow-md`, 240ms. Only the inner link/button is focusable (no nested interactive elements inside a link).

### 6.4 Plate (recipe visual placeholder) — signature element

The recipe "photo". A circle seen from above:
- Outer **rim**: circle, bg `--plate-rim` (light `#FFFDF8`; dark `#2E3A2F` plus `inset 0 0 0 1px rgb(255 255 255 / 0.06)`, because `--card` vanishes on dark stages), `--shadow-plate`, padding = 7% of diameter **at every size** (the dish is always 86% of the plate; derive from the plate's own size, not per-breakpoint classes).
- Inner **dish**: circle with `bg-gradient-to-br {recipe.color}` (Tailwind v4 equivalent `bg-linear-to-br` is fine), plus the grain overlay (opacity 0.12, `mix-blend-mode: multiply`) and a soft highlight `radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.45), transparent 55%)`.
- **Emoji** centered, `font-size: 42%` of diameter, `filter: drop-shadow(0 6px 8px rgb(0 0 0 / 0.18))`, `role="img"` + `aria-label` = recipe name only when the plate is the sole representation of the recipe; otherwise `aria-hidden="true"`.
- Rest rotation: `rotate(var(--plate-tilt))`, where tilt alternates -8°, 6°, -4° by index (static, gives a hand-placed look).
- Sizes: `xs` 56, `sm` 96, `md` 160, `lg` 240, `xl` 320 (hero ≥1024), `2xl` 400 (hero 1440). Always fixed `width/height` (aspect-ratio 1) → zero CLS.
- Optional **sticker**: mustard pill, `--on-mustard` text, `meta` 600, `--shadow-md`, rotated 6°, positioned top-right overlapping the rim, e.g. "od 550 RSD".

### 6.5 Recipe card (shared by home and `/meni`)

Replace `src/components/RecipeCard.tsx` with this anatomy (one component, used everywhere):
1. **Stage**: `--paper-2` area, aspect-ratio 4/3, radius `--radius-md`, Plate `sm`–`md` (≈62% of stage width) centered. Top-left: time badge (`clock` 16 + "25 min", bg `--card`, `meta`, pill).
2. **Tags**: up to 2 badges + "+N" badge (Section 6.6), wraps.
3. **Title** `title` (h3), color `--ink`.
4. **Description** `body`, `--ink-muted`, full text (no clamp; current copy is ≤ 2 lines).
5. **Meta row** `meta` `--ink-muted`: `flame` + "540 kcal".
6. **Footer row** (top border `--line`, 16px padding-top): price `display-m`-small: Fraunces 600 22px `--paprika`, tabular + `meta` "/ porcija"; right: `secondary` `md` button "Dodaj" (`plus`) ↔ `selected` "U kutiji" (`check`), `aria-pressed`. Accessible name includes recipe: `aria-label="Dodaj {name} u kutiju"`.
- Selected card: border 2px `--basil`, stage bg `--basil-tint`.
- Hover (pointer: fine): card lift (6.3) + plate rotates to `calc(var(--plate-tilt) + 10deg)` with `--ease-spring` 480ms.
- Loading skeleton: same box sizes, `--paper-2` blocks, 1.2s opacity pulse 0.6↔1 (no pulse under reduced motion).

### 6.6 Badge / Tag / Chip

- **Badge** (static tag on card): pill, height 24px, padding-x 10px, `meta` 500 13px, bg `--paper-2`, text `--ink-muted`; diet tags (`vegetarijansko`, `bez glutena`) get a leading `leaf` 14px and text `--basil`.
- **Filter chip** (interactive, links or toggles): height 44px, padding-x 16px, `ui` 15px, 1.5px border `--line-strong`, bg `--card`; hover bg `--paper-2`; selected bg `--basil-tint`, border `--basil`, text `--basil`, leading `check`, `aria-pressed`/`aria-current`. Optional count in `--ink-muted` ("brzo · 4").
- **Count badge** (nav basket): min 20px circle, bg `--paprika`, text `--on-paprika`, 12px 700, tabular.

### 6.7 Navigation (Navbar)

- Sticky top, height 64/72px. At top of page: transparent over `--paper`. After 8px scroll: bg `--paper` at 88% + `backdrop-filter: blur(12px)` + bottom 1px `--line` + `--shadow-sm` (bg must stay ≥ 88% opaque so text keeps contrast).
- Hide on scroll down after 400px, reveal on any scroll up (translateY(-100%), 240ms). Never hide while focus is inside the nav, while the mobile menu is open, or under reduced motion.
- **Logo**: inline SVG mark (simple open box with a steam curl, 28px, `--paprika` stroke) + wordmark "Kutija*Obroka*": Fraunces 600 22px `--ink`, "Obroka" in Fraunces italic. Links to `/`, `aria-label="KutijaObroka — početna"`.
- **≥1024**: center links `ui` 15px `--ink`: "Nedeljni meni" (/meni), "Kako funkcioniše" (/#kako), "Cene" (/#cene), "Pitanja" (/#pitanja). Active route: `--basil` + 2px mustard underline bar. Right: basket button (`shopping-basket` 20 + "Kutija" label + count badge) → /kutija, then `primary md` "Sastavi kutiju" → /meni.
- **<1024**: logo · basket icon button (44px, `aria-label="Moja kutija, {n} obroka"`) · menu button (44px, `menu` icon, `aria-expanded`, `aria-controls`).
- **Mobile menu sheet**: full-screen `--paper` panel slides down (translateY(-8px)+opacity, 240ms), links as Fraunces 32px stacked with 8px rules between, `primary lg` full-width CTA pinned at bottom. Focus trapped, `Esc` closes, focus returns to the menu button, body scroll locked, closes on route change.
- Count change: badge pops `scale 1 → 1.2 → 1` 240ms; a visually-hidden `aria-live="polite"` region announces "U kutiji: {n} obroka".
- Skip link "Preskoči na sadržaj" as first focusable element, visible on focus (top-left, `primary md`), targets `<main id="sadrzaj">`.

### 6.8 Section header

Eyebrow (`eyebrow`, `--basil`) → h2 (`display-l`, one optional italic word) → optional lede (`body-l`, `--ink-muted`, max 52ch) → optional right-aligned ghost link on ≥768. Left-aligned by default (editorial); center only where a page spec says so.

### 6.9 Accordion (FAQ)

- Rows separated by 1px `--line`; no outer box.
- Trigger: `<button>` full width, min-height 64px, padding-y 20px, `ui` 17px 600 `--ink`, left text, right 32px circle with `plus` icon (border `--line-strong`) that rotates 45° when open (open: circle bg `--basil`, icon `--paper`). `aria-expanded`, `aria-controls` → panel `id`, panel `role="region"` `aria-labelledby`.
- Panel: `body` `--ink-muted`, max 62ch, padding-bottom 24px. Open/close via `grid-template-rows: 0fr → 1fr` + opacity, 240ms `--ease-out` (exit 160ms). Reduced motion: instant.
- Single-open, first item open by default. Render server-side (no `next/dynamic` lazy loading for this small component; it currently causes a skeleton swap).

### 6.10 Footer

bg `--footer`, text `--on-footer`, padding-y 64 (96 ≥1024).
- Top: logo (paper colors, "Obroka" italic in `--mustard`) + one line `--on-footer-muted`: "Sveži sastojci i provereni recepti, svake nedelje na tvojim vratima."
- Columns (`eyebrow` headings in `--mustard`, links `body` `--on-footer` with underline on hover): **Kuvaj** — Nedeljni meni, Moja kutija, Plaćanje (/checkout); **Saznaj** — Kako funkcioniše, Cene, Pitanja.
- Bottom row after 1px rule (`rgb(255 255 255 / 0.12)`): "© 2026 KutijaObroka · prototip" (`meta`, muted) and "Admin panel" (`meta`, muted, underline) → /admin.
- Layout: 375 stacked; 768 brand full width + 2 columns; ≥1024 4-col grid (brand spans 2).

### 6.11 Forms (for /kutija, /checkout, /admin later)

Label above field (`ui` 15px), input height 48px, bg `--card`, 1.5px border `--line-strong`, radius `--radius-sm`, focus border `--basil` + ring. Helper text `meta` `--ink-muted`. Error: border `--danger`, message below with alert icon, `aria-describedby`, `aria-invalid`. Segmented control (plan pickers): pill track `--paper-2`, options 44px high, selected = `--card` + `--shadow-sm` + `--ink` 600, `role="radiogroup"`.

---

## 7. Motion

**Implementation:** GSAP is **not** installed and no animation library may be added without team-lead approval. Default implementation is CSS transitions + the existing `IntersectionObserver` `Reveal` component (updated to these tokens). GSAP equivalents are given so the spec stays valid if GSAP is approved later.

| Token | Value | GSAP equivalent |
|---|---|---|
| `--dur-fast` | 150ms | 0.15 |
| `--dur-base` | 240ms | 0.24 |
| `--dur-slow` | 480ms | 0.48 |
| `--dur-reveal` | 700ms | 0.7 |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | `power3.out` / `expo.out` |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | `power2.inOut` |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `back.out(1.4)` |
| `--stagger` | 70ms | `stagger: 0.07` |

Rules:
1. Animate only `transform` and `opacity` (accordion `grid-template-rows` is the single allowed exception).
2. Scroll reveals: `opacity 0 → 1`, `translateY(24px → 0)`, `--dur-reveal`, `--ease-out`, trigger when the element top crosses 85% of the viewport (`start: "top 85%"`), play once. Grids stagger children by `--stagger`, max 6 children staggered.
3. **Never** hide the LCP element (hero h1, hero lede) behind an opacity-0 start state.
4. No infinite/looping animations (the current `float` keyframes are removed). No auto-playing carousels or marquees.
5. Hover motion only under `@media (hover: hover) and (pointer: fine)`.
6. Exit = ~65% of enter duration.
7. **Reduced motion** (`prefers-reduced-motion: reduce`): all reveals render in final state immediately, no translate/rotate/scale on hover (color and shadow changes stay), nav never auto-hides, accordion and menu open instantly, the hero underline swash is drawn statically. Use one global CSS guard plus the `matchMedia` check already in `Reveal`.

---

## 8. Content and voice

Serbian Latin, informal "ti", warm and concrete, short sentences. Prices: `toLocaleString("sr-RS")` + " RSD" (e.g. "2.420 RSD"), ranges with en dash and thin spaces "1.990 – 3.150 RSD". Times: "25 min". Gender-neutral phrasing preferred over slashes ("Spreman/na" → "Hajde da kuvamo"). Never invent social proof, ratings, delivery cities or statistics that the data cannot back.

---

## 9. Anti-patterns (do NOT use)

- Emoji as UI icons (nav, buttons, step icons, benefit icons, kcal/time meta) — SVG only. Emoji only inside Plates.
- Emerald/teal Tailwind defaults, `zinc-*` greys, raw hex or `dark:` color classes in components.
- Gradient text, purple/blue gradients, blurred decorative blobs, glassmorphism cards.
- Centered-everything SaaS layout; three identical icon cards in a row as the main visual.
- Infinite float/pulse animations; marquee tickers; opacity-0 hero headline.
- Layout-shifting hovers (`scale` on elements in flow without transform containment); width/height animation.
- Text below 16px for paragraphs; `--line` used as a functional border; color-only state.
- Fake reviews, fake counters, invented delivery coverage.
- Lazy-loading above-the-fold or tiny components with skeletons that swap in (CLS).

## 10. Pre-delivery checklist

- [ ] Tokens only (no raw hex outside `globals.css`), fonts Fraunces + Instrument Sans with latin-ext; "č ć š ž đ" render in both
- [ ] No emoji outside Plates; all icons from the local Lucide-path module
- [ ] Focus ring visible on every interactive element, on light and dark surfaces
- [ ] Targets ≥ 44px, `cursor: pointer`, 8px+ between targets
- [ ] Contrast per Section 3.3 in light **and** dark
- [ ] `prefers-reduced-motion` path verified
- [ ] 375 / 768 / 1024 / 1440: no horizontal scroll, no content under the sticky nav, anchors offset correctly
- [ ] Plates and all data-driven blocks have fixed dimensions (CLS < 0.1); LCP (hero h1) < 2.5 s
