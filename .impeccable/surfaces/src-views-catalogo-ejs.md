---
version: 1
slug: "src-views-catalogo-ejs"
primary_target: "src/views/catalogo.ejs"
related_targets: ["src/views/producto.ejs","src/views/partials/header.ejs","src/public/styles.css"]
---

# Storefront (catálogo, ficha, carrito, checkout, pedidos) + panel admin

Scope: the whole web app. Visitor mode: Persuade on the catalog and product page (the visitor decides and adds to cart); Operate on cart, checkout, Mis pedidos, notifications and the admin panel.

Audience and job: particulares and emprendedores in Argentina choosing a personalized stationery product, writing the personalization and placing the order; the admin running the order lifecycle.

Constraints: server-rendered EJS, one stylesheet, forms work without JavaScript, Spanish (AR) voseo, ARS prices, no stock, no invented claims. Product photos arrive later by URL; seed images are placeholders.

Brand: the shop is named **Luma** (user decision; replaced the designer's first pick "Calco").

## Direction contract

THESIS: The store is a kiss-cut sticker sheet. Every product is a die-cut sticker sitting on its backing liner, the cut grid is the layout, and choosing a product is peeling it off. Refuses the category default of a banner over a row of identical shadowed cards.

OWN-WORLD: Silicone-liner ground (cool #eef1f6) printed with a visible cut grid; stickers are flat vinyl colour fields (cobalt #2346d8, bubblegum #ff5fa2, lemon #ffd83d, mint #3ed598, orange #ff7a2f) inside a white weed border with a dashed die line around them; ink #17182b for type. Zero gradients as decoration, zero diffuse shadows; active state is a flat colour swap. One Argentine family, Archivo (Omnibus-Type): expanded heavy for display, normal width for UI. Pills for actions, die-cut radii for stickers, circles for status dots.

STORY: The visitor sees in one look that everything here is made with their own text, that the shop reviews each order, and that delivery is pickup or shipping; they filter by category or search, open a product, write the personalization and add it to the cart, then follow the order as a production record.

FIRST VIEWPORT: Header with the Luma wordmark as a small pink sticker and plain links. On the liner grid, a large cobalt sticker (slightly rotated) holds the user's headline "PAPELERÍA LUMA" in white expanded type, one line of subcopy and the working search field with its button. Beside it two small round stickers state true facts (each order is reviewed before production; pickup or shipping). Under it a row of category stickers in their vinyl colours (pill die shape, because labels such as Calendarios do not fit a legible round sticker), then the first row of product stickers starts above the fold.

FORM: Plancha de stickers troquelada, position 4 of the ordered list (1 tapa de cuaderno escolar, 2 pliego de prueba de imprenta, 3 encomienda de correo, 4 plancha de stickers, 5 riso, 6 cinta Dymo, 7 muestrario de papeles); seed:4e5ab713bd12414e. Raises kept: visible cut grid as the real armature (Crouwel), one strict state vocabulary across screens (one-bit desktop), total flat colour with no gradients or glows (elbow panel), order history as a production record that grows step by step (coiled clay). Signature interaction: hovering or focusing a product sticker lifts its corner as if peeling it off the liner. Motion grammar: one load moment, the hero sticker settling onto the sheet; everything else answers the visitor's action.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Real product photography replaces the category-coloured placeholders when the owner loads it.
