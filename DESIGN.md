---
name: JUAG Impresiones y Papelería Creativa
description: Personalized stationery made to order, sold from a kiss-cut sticker sheet.
colors:
  liner: "#eef1f6"
  cut-grid: "#dbe1ec"
  die-line: "#9aa5ba"
  sticker-back: "#dde3ec"
  weed-white: "#ffffff"
  panel-line: "#d3dae6"
  ink: "#17182b"
  ink-soft: "#4b5270"
  cobalt: "#2346d8"
  cobalt-dark: "#1a35a8"
  bubblegum: "#ff5fa2"
  lemon: "#ffd83d"
  mint: "#3ed598"
  orange: "#ff7a2f"
  kraft: "#d9a066"
  state-stop: "#d7264f"
  stop-wash: "#ffe3ea"
  stop-ink: "#9b1236"
  stop-edge: "#f3a5b8"
  go-wash: "#e3e9ff"
typography:
  display:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(2.6rem, 7vw, 5.25rem)"
    fontWeight: 850
    lineHeight: 0.92
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "2.441rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.1
    fontVariation: "'wdth' 105"
  sticker-face:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(0.95rem, 9cqi, 2rem)"
    fontWeight: 850
    lineHeight: 1.04
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 112"
  body:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'tnum'"
  label:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
  price:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 750
    fontVariation: "'wdth' 108"
    fontFeature: "'tnum'"
rounded:
  pill: "999px"
  sticker: "22px"
  panel: "18px"
  core: "14px"
  field: "12px"
  core-card: "8px"
  core-square: "6px"
  hero: "34px"
spacing:
  weed: "8px"
  cell: "24px"
  cell-2: "48px"
  cell-3: "72px"
  column: "240px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.weed-white}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.35rem"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-dark}"
    textColor: "{colors.weed-white}"
  button-secondary:
    backgroundColor: "{colors.weed-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.35rem"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.weed-white}"
  button-danger:
    backgroundColor: "{colors.weed-white}"
    textColor: "{colors.state-stop}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.35rem"
  button-danger-hover:
    backgroundColor: "{colors.state-stop}"
    textColor: "{colors.weed-white}"
  chip:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.35rem 1rem 0.4rem"
  chip-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.weed-white}"
  product-sticker:
    backgroundColor: "{colors.weed-white}"
    rounded: "{rounded.sticker}"
    padding: "{spacing.weed}"
    width: "{spacing.column}"
  panel:
    backgroundColor: "{colors.weed-white}"
    rounded: "{rounded.panel}"
    padding: "clamp(1.1rem, 3vw, 1.5rem)"
  input:
    backgroundColor: "{colors.weed-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0.65rem 0.8rem"
  status:
    backgroundColor: "{colors.weed-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.2rem 0.7rem 0.2rem 0.45rem"
  price-tag:
    backgroundColor: "{colors.lemon}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 1.1rem 0.5rem"
  tab:
    backgroundColor: "{colors.weed-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 1rem"
  tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.weed-white}"
---

# Design System: JUAG Impresiones y Papelería Creativa

## Overview

**Creative North Star: "The Kiss-Cut Sticker Sheet"**

The whole store is one sheet of die-cut stickers still on its backing liner. The page ground is the cool silicone liner with its 24px cut grid printed on it; every product is a flat vinyl sticker with a white weed border and a dashed die line ringing it; choosing a product is peeling it off. The grid is not decoration: catalog columns are exactly ten cells wide with one-cell gutters, measured from the sheet edge, so every sticker lands on a cut line.

The system has two registers that share every token. **Persuade** (catalog home, filtered results, product page, order-received) is the sheet itself: saturated vinyl fields, die lines, stickers set slightly askew, expanded heavy Archivo. **Operate** (cart, checkout, Mis pedidos, order detail, notifications, admin panel, rates, login) is the work bench beside the sheet: white panels with a hairline edge, square to the grid, no die lines and no rotation, colour reduced to status dots, the cobalt action and the occasional lemon count. The quiet register is the same material, used less.

Colour is flat and opaque everywhere. Active states are flat colour swaps; depth comes from the white weed border sitting on the liner, never from blur. Motion answers the visitor: one load moment on the home (the hero sticker settling), and everything else is a response to filtering, hovering, adding or progressing an order.

**Key Characteristics:**
- Liner ground (#eef1f6) with a visible 24px cut grid on every page.
- Vinyl stickers: tone fill, white weed border, 1.5px dashed die line offset outside it.
- One family, Archivo variable: width axis carries the voice (125% display, 100% UI).
- Die shape follows category: portrait 3:4, card 16:10, square, round, 4:3 default.
- Pills for every action, chip, tab and status.
- One fixed state vocabulary: vinyl dot plus label.
- No diffuse shadows, no decorative gradients.

## Colors

A cool neutral liner and deep ink carry the structure; six saturated vinyls carry identity, one per product category, and never mix inside one sticker.

### Primary
- **Cobalt Vinyl** (cobalt): the one action colour. Primary buttons, links, focus rings, caret, the checked radio, the hero sticker, the Agendas category, and the "confirmed / payment" state. **Cobalt Pressed** (cobalt-dark) is its hover and the notice text.

### Secondary
- **Bubblegum** (bubblegum): the JUAG wordmark sticker, the Cuadernos category, unread notification dots and badge, and the current step of an order history.
- **Lemon** (lemon): Stickers category, the price-tag sticker, the personalization preview label, cart and tab counts, text selection, the order-received sticker and the "waiting for review" state.

### Tertiary
- **Mint** (mint): Tarjetería category and the "delivered" state.
- **Safety Orange** (orange): Calendarios category and the "in production" state.
- **Kraft** (kraft): Packaging only; it is brown paper, not a vinyl, and is never used for state.

### Neutral
- **Silicone Liner** (liner): page ground, inner sheet ground, hover wash for menu rows.
- **Cut Grid** (cut-grid): the 1px grid lines printed on the liner.
- **Die Line** (die-line): every dashed die line, registration marks, input hover border, empty-sticker outlines.
- **Sticker Back** (sticker-back): the grey underside revealed when a corner peels.
- **Weed White** (weed-white): weed borders, panels, header, inputs.
- **Panel Line** (panel-line): panel and input edges, table rules, dashed summary rules.
- **Press Ink** (ink): all type, the footer band, current chip and active tab fill.
- **Soft Ink** (ink-soft): secondary text, category labels, table headers.

### Status
- **Stop Red** (state-stop) with **Stop Wash** (stop-wash), **Stop Ink** (stop-ink) and **Stop Edge** (stop-edge): rejected, cancelled, expired, errors, danger buttons.
- **Go Wash** (go-wash): notices, the payment panel, the checked radio row.

### Named Rules
**The One Vinyl Per Category Rule.** Each category owns one tone (Agendas cobalt, Cuadernos bubblegum, Stickers lemon, Tarjetería mint, Calendarios orange, Packaging kraft); a new category takes a fixed tone hashed from its name. A sticker is one tone; tones never blend or gradient into each other.

**The Fixed State Vocabulary Rule.** Order state is always a vinyl dot plus its label: lemon = waiting (Solicitado, En revisión), cobalt = go (Confirmado, Pendiente de pago, rate Vigente), orange = making (En preparación, Listo para entrega, Enviado), mint = done (Entregado), stop red = stopped (Rechazado, Cancelado, rate Vencida). No screen invents another mapping.

**The Ink On Vinyl Rule.** Type on bubblegum, lemon, mint, orange and kraft is ink; only cobalt and ink fills take white type.

## Typography

**Display Font:** Archivo variable, self-hosted (wght 100-900, wdth 62-125), with system-ui fallback
**Body Font:** Archivo variable, same file

**Character:** One Argentine grotesque doing everything through its width axis: stretched to 112-125% and pushed to 800-850 it is the printed sticker face; at 100% and 400-600 it is quiet UI. Numbers are tabular throughout.

### Hierarchy
- **Display** (850, clamp(2.6rem, 7vw, 5.25rem), 0.92, width 125%): the hero sticker headline only, in white on cobalt, uppercase as written by the owner.
- **Headline** (800, 2.441rem, 1.1, width 112%): page h1. The product page widens it to 118% at clamp(2rem, 4.5vw, 3rem); results headings drop to 1.953rem; "Cómo pedir" uses 1.953rem at 850 / 118%.
- **Title** (700, 1.25rem, 1.1, width 105%): section h2 inside panels. Product names on the sheet use 1.075rem at 700 / 104%.
- **Sticker Face** (850, container-relative clamp, 1.04, width 112%): the product name printed on a placeholder sticker core; 88% width in the cart thumbnail.
- **Body** (400, 1rem, 1.55): running text; leads at 1.25rem / 1.45, max 34em.
- **Label** (600-700, 0.875rem): form labels, chips, tabs, category lines, hints. Status pills use 0.8125rem at 650.
- **Price** (750, width 108%): every price; the cart total grows to 1.953rem at 115%.

### Named Rules
**The Width Is The Voice Rule.** Hierarchy is expressed by stretch and weight together, not size alone. Display and sticker faces are expanded; anything a person reads to operate (labels, inputs, links, table cells) stays at 100% width.

## Layout

The 24px cell is the unit. Page container max 1128px, with clamp(1rem, 4vw, 2rem) side padding; top margin two cells, bottom three. The catalog sheet is a padded liner block (one cell top/bottom, 16px sides) that redraws the grid from its content edge, with printer registration marks at its four corners; its grid uses auto-fill columns of ten cells (240px), one-cell column gutters and two-cell row gutters. Under 600px the sheet holds exactly two columns of six cells (144px).

The home hero is a two-column grid (cobalt sticker plus a column of two round fact stickers); it stacks at 860px, where the facts become a row. Under 600px the category chips become one horizontal, edge-bleeding scroll row.

Operate layouts are simple two-column grids that stack: cart (content plus a 320px sticky total, stacks at 880px), checkout (1:1, 780px), order detail (3:2, 780px), product page (1.05:1, 760px). Panels stack with a 24px gap. Breakpoints in use: 600, 640, 760, 780, 860, 880px.

## Elevation & Depth

The system is flat. There are no diffuse shadows anywhere. Depth is the sticker on the liner: a white weed border (3-10px) on the cool ground, with the dashed die line sitting a few pixels outside it on the paper. Operate panels separate from the liner by white fill and a 1px panel-line edge only. Zero-blur, zero-offset `box-shadow` rings are used as extra borders on small circles (category dot, current history step); they are outlines, not elevation.

### Named Rules
**The Weed Border Is The Shadow Rule.** If something must read as raised, give it a white weed border and a die line, never a blur or an offset shadow.

**The Hard-Stop Only Rule.** Gradients appear only as hard-stop drawing tools for the world's own materials: the cut-grid lines, the registration crosshairs and the folded peel corner. A gradient that blends one colour into another is never used.

## Shapes

Die shapes vary by what the product is, as on a real sheet: portrait 3:4 for agendas and cuadernos, 16:10 with an 8px core radius for tarjetería, square with a 6px core for packaging, a circle for stickers, and 4:3 for everything else. A product sticker has a 22px outer radius around a 14px core. Round stickers carry the weed border and die line on the circle itself; their category and price sit below, printed on the liner, outside the cut.

Every action, chip, tab, status, count and price tag is a pill (999px). Inputs and alerts take 12px; panels 18px. The hero sticker is the one large radius (34px, 26px under 600px). Persuade stickers sit slightly askew (hero -1.2deg, facts 7 / -6deg, product media -1.5deg, price tag -2deg, preview label -1deg, wordmark -3deg, order-received -8deg); Operate panels are never rotated.

## Components

### Buttons
Vinyl pills: confident, flat, heavy.
- **Shape:** pill (999px), min height 44px, 2px border in the fill colour.
- **Primary:** cobalt fill, white type, 700 at 108% width.
- **Hover / Focus / Active:** hover swaps to cobalt-dark; focus is a 3px cobalt outline at 3px offset; active scales to 0.97.
- **Secondary:** white fill, ink border and type; hover inverts to ink.
- **Danger:** white fill, stop-red border and type; hover fills stop red.
- **Link button:** no box, cobalt underlined text at 600, used for Salir and mark-all-read.
- **On the hero:** the search button is lemon with ink type; hover goes white.

### Chips
- **Style:** small category stickers: tone fill, ink type (white on cobalt), 3px white weed border, 1.5px dashed die line at 2px offset, 0.875rem at 700.
- **State:** hover tilts -3deg and scales 1.04. The current chip fills ink with white type, its die line turns solid ink, and a masked check mark precedes the label. "Todo" is the untinted white chip.

### Cards / Containers
- **Product sticker:** white 8px weed around a tone-filled core of the category's die shape; 22px outer radius; 1.5px dashed die line 5px outside. Body below holds a category dot and label, the name, and the price.
- **Panel (Operate):** white, 1px panel-line edge, 18px radius, clamp(1.1rem, 3vw, 1.5rem) padding, no die line. The payment panel adds a 2px cobalt edge on go-wash.

### Inputs / Fields
- **Style:** white, 1.5px panel-line border, 12px radius, 0.65rem 0.8rem padding; hover darkens the border to die-line.
- **Focus:** 3px cobalt outline at 1px offset plus cobalt border.
- **Choice rows:** radios are full-width rows; checked rows get a cobalt border on go-wash and a custom cobalt circle with a white check that scales in.
- **Hero search:** white pill with an inline magnifier, lemon focus ring on cobalt.

### Navigation
- **Top bar:** white band with a 1px bottom rule. The wordmark is an uppercase "JUAG" pink pill sticker, 850 at 125%, rotated -3deg, with "impresiones y papelería creativa" beside it. Links are ink at 600, cobalt on hover; the current page is cobalt with a 2px underline. Cart count is a lemon pill; the notification bell opens a white panel with a 1.5px ink edge.
- **Admin tabs:** pills with a 1.5px edge; active fills ink with a lemon count.
- **Footer:** solid ink band.

### Status Pill
White pill with a 1.5px panel-line edge, a 0.7rem vinyl dot and the state name at 0.8125rem / 650. Stopped states also switch to stop-ink text and stop-edge border.

### Production Record
Order history is a vertical list that grows downward: hollow die-line circles joined by a 2px dashed rule, each step carrying its status pill and date. The current step is a bubblegum circle in a white ring that stamps in once (scale 1.8 to 1, 0.5s).

### Price Tag and Preview Label
Lemon stickers in the product page: the price tag is a pill (4px weed, die line, -2deg); the personalization preview is a 14px-radius label (5px weed, -1deg) that echoes the textarea as the person types and settles once when it first gets text.

### Motion
All motion uses one curve, cubic-bezier(0.16, 1, 0.3, 1), with no bounce. The hero settles once on load (0.7s). Filtered results stick down in a cascade (0.5s each, 45ms stagger, capped at ten). A cross-document view transition (0.42s) carries the product core from sheet to product page. Hover peels the top-right corner, revealing sticker-back over liner (0.3s in, 0.16s out); round stickers rotate -8deg and lift instead. A just-added cart line sticks down and its thumbnail peels in; the cart count and badge bump. Alerts drop 4px in. Reduced motion removes every animation, transition and view transition; end states are static, so state is kept.

## Do's and Don'ts

### Do:
- **Do** lay every Persuade surface on the liner with the 24px cut grid visible, and size catalog columns in whole cells (240px, 144px on phones).
- **Do** give every sticker a white weed border plus a 1.5px dashed die-line outline offset outside it.
- **Do** pick the die shape from the category (3:4, 16:10, square, round, 4:3) and the tone from the category map.
- **Do** show order state only as vinyl dot plus label, using the fixed five-colour vocabulary.
- **Do** keep Operate surfaces as square white panels on the same tokens: no die lines, no rotation. The only stickers there are product thumbnails (cart line) and blank-sticker empty states.
- **Do** make every action a pill, cobalt for primary, with a 3px cobalt focus ring.
- **Do** use expanded heavy Archivo (112-125%, 800-850) for display and sticker faces, and 100% width for UI.

### Don't:
- **Don't** use diffuse or offset shadows; depth is the weed border.
- **Don't** use gradients that blend colours; hard-stop gradients drawing the grid, registration marks and peel corner are the only gradients.
- **Don't** put two vinyl tones in one sticker or reuse kraft for anything but Packaging.
- **Don't** invent a new state colour or a status badge without its dot.
- **Don't** add load animations beyond the hero settle; motion answers the person's action.
- **Don't** force long category labels into round stickers; categories are pill chips.
