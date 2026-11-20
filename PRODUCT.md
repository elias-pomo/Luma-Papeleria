# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences in equal measure, both in Argentina:

- **Particulares:** people ordering personalized agendas, notebooks, invitations, calendars or bookmarks for themselves, for school, as gifts or for events.
- **Emprendedores:** small businesses ordering business cards, labels, logo stickers and packaging (bags, souvenir boxes).

Their job: pick a product, say exactly how they want it personalized, choose pickup or home delivery, and follow the order until it arrives.

A second, internal audience is the shop's **administrador**, who reviews each order, confirms or rejects it with a reason, enables payment, moves it through production and delivery, manages shipping rates and prints the delivery note (remito).

## Product Purpose

An online ordering system for a personalized stationery shop. Customers browse a catalog, add products with a written personalization to a cart, get a shipping quote by postal code and place an order. The shop then reviews every order by hand before it is confirmed and paid.

Success: a customer can place a correct, fully specified order without help, always knows what state it is in, and the admin can run the whole order lifecycle from the panel.

Context: university project. The priority is that it works and matches the course document (11 use cases, order states as defined in the plan).

## Positioning

Everything is made to order: each item carries the customer's own text, names, logo or colors, and nothing ships before the shop has reviewed it. The catalog sells possibilities, not stock.

## Operating Context

- Order lifecycle: Solicitado → En revisión → Confirmado → Pendiente de pago → En preparación → Listo para entrega → Enviado → Entregado. Exits: Rechazado (from En revisión, with a reason) and Cancelado (client or admin, only up to Pendiente de pago). Pickup orders skip Enviado.
- Payment happens on an external link; the order stays in Pendiente de pago until the admin confirms it.
- Shipping cost comes from postal-code ranges with an expiry date; without a valid rate the customer is offered pickup.
- In-app notifications for client and admin on every order change. No email.
- The admin prints a PDF remito for confirmed orders.

## Capabilities and Constraints

- Stack already in place: Node + Express 5, MongoDB (Mongoose), server-rendered EJS views, a single stylesheet, no front-end framework. Forms must keep working without JavaScript.
- Spanish (Argentina) UI, voseo, prices in ARS.
- Personalization text is required on every cart item.
- Never show stock (there is none in the model). No payments or card data. No guest checkout, returns, international shipping, email or image upload.
- Product images: each product has an `image` filename (in `src/data/products.js`) resolved from `src/public/img/productos/`; an external `imageUrl` is the fallback. No upload UI. Without a photo the product shows its category colour.

## Brand Commitments

- The shop is named **Luma** (user decision, fictional business). Hero headline "PAPELERÍA LUMA" was written by the user.

## Evidence on Hand

- 15 seed products in 6 categories (Agendas, Cuadernos, Stickers, Tarjetería, Calendarios, Packaging) with real names, descriptions and prices (`src/seed.js`).
- The owner has real product photos, to be loaded by URL per product. Until then the seed uses placeholder images; do not present placeholders as real photography.
- No testimonials, customer logos, reviews, ratings or sales figures exist. Do not fabricate them.

## Product Principles

1. The personalization is the product: asking for it, showing it back and keeping it visible through cart, order and remito comes first.
2. No surprises: price, shipping cost and order state are always shown before the customer has to commit.
3. Two audiences, one catalog: speak plainly to a parent ordering school labels and to a business ordering packaging, without splitting the store.
4. The admin panel is a work tool: fast to scan, consistent, nothing decorative in the way.
