# Luma: sistema web de pedidos para papelería personalizada

Proyecto de facultad. Los clientes eligen productos del catálogo, indican la
personalización y hacen el pedido. La papelería lo revisa, lo confirma o lo
rechaza, habilita el pago y lo lleva hasta la entrega.

**Stack:** Node + Express 5, MongoDB (Mongoose), vistas EJS sin framework de
front, JWT en cookie httpOnly + bcrypt, PDF con pdfkit.

## Cómo correrlo

Requisitos: Node 20 o superior y un MongoDB (local o Atlas).

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` a `.env` y completar los valores (ver abajo).
3. Cargar los datos iniciales. **Ojo: borra los datos de la base.**
   ```bash
   npm run seed
   ```
4. Levantar la app:
   ```bash
   npm run dev
   ```
   y abrir http://localhost:3000.

### Variables de entorno (`.env`)

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000). |
| `MONGODB_URI` | Conexión a Mongo. Si la URI no trae nombre de base, se usa `papeleria`. |
| `JWT_SECRET` | Secreto para firmar los tokens de login. Obligatorio. |
| `SESSION_SECRET` | Secreto de la sesión del carrito. Opcional (si falta usa `JWT_SECRET`). |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Usuario admin que crea el seed. |
| `PAYMENT_URL` | Link al que lleva el botón "Ir a pago externo". |
| `BUSINESS_NAME` | Nombre que aparece en el remito. Opcional. |
| `DNS_SERVERS` | Opcional. Ver "Problemas comunes". |

### Datos del seed

- 1 admin: `admin@papeleria.test` / `admin1234` (o lo que pongas en el `.env`).
- 15 productos en 6 categorías.
- 6 tarifas de envío por rango de CP. La de Mar del Plata (7600–7699) está
  **vencida a propósito**, para probar el caso "sin tarifa".

Los clientes se crean desde "Crear cuenta".

## Fotos de los productos

1. Copiá cada foto a `src/public/img/productos/`.
2. El nombre de archivo de cada producto está en la propiedad `image` de
   [`src/data/products.js`](src/data/products.js) (por ejemplo
   `agenda-personalizada-a5.jpg`). Nombrá tus fotos así, o cambiá esa propiedad
   para que coincida con tus archivos. Sirven `.jpg`, `.jpeg`, `.png` y `.webp`;
   si la extensión no coincide, la app encuentra el archivo igual.
3. La primera vez, y cada vez que cambies un nombre en `products.js`, corré:
   ```bash
   npm run imagenes
   ```
   Actualiza la base sin borrar usuarios ni pedidos y te lista las fotos que faltan.

Una foto nueva aparece apenas la copiás a la carpeta (no hace falta reiniciar).
Mientras falte, el producto se ve con el color de su categoría. Recomendado:
1200 × 900 px o más y menos de 400 KB. Cada categoría recorta la foto con su
forma de sticker: vertical para agendas y cuadernos, apaisada para tarjetería,
redonda para stickers, cuadrada para packaging.

## Prueba de punta a punta

Con la app corriendo, en otra terminal:

```bash
npm run e2e
```

Recorre todos los casos de uso con dos clientes y el admin (44 comprobaciones),
incluida la privacidad: un cliente que cambia el ID en la URL no ve ni cancela
pedidos ajenos. Usa emails `e2e.*@papeleria.test` y borra todo al terminar.
Para otra URL: `BASE_URL=http://localhost:3001 npm run e2e`.

## Casos de uso

| CU | Qué hace | Dónde |
|---|---|---|
| CU01 | Catálogo con buscador por nombre y categoría, ficha de producto. Sin stock. | `/`, `/productos/:id` |
| CU02 | Registro de cliente. | `/registro` |
| CU03 | Carrito: agregar con cantidad y personalización, editar, quitar. | `/carrito` |
| CU04 | Costo de envío según la tarifa vigente del CP. Sin tarifa, se ofrece retiro. | `/carrito/checkout` |
| CU05 | Admin: revisar pedidos, tomarlos, confirmarlos o rechazarlos con motivo. | `/admin`, `/admin/pedidos/:id` |
| CU06 | Mis pedidos: listado, detalle e historial de estados (solo los propios). | `/mis-pedidos` |
| CU07 | Admin: avanzar estados, habilitar pago y ABM de tarifas. | `/admin/pedidos/:id`, `/admin/tarifas` |
| CU08 | Remito en PDF (desde Confirmado en adelante). | `/admin/pedidos/:id/remito` |
| CU09 | Confirmar el pedido con modalidad de entrega; queda en Solicitado. | `/carrito/checkout` |
| CU10 | Login y logout. | `/login` |
| CU11 | Cancelar un pedido propio, con confirmación. | `/mis-pedidos/:id` |

Además: notificaciones in-app (campana en el encabezado y `/notificaciones`)
para cliente y admin cada vez que cambia un pedido.

## Estados del pedido

```
Solicitado → En revisión → Confirmado → Pendiente de pago → En preparación
           → Listo para entrega → Enviado → Entregado
```

- **Rechazado:** solo desde En revisión, con motivo obligatorio.
- **Cancelado:** solo desde Solicitado, En revisión, Confirmado o Pendiente de pago.
- **Retiro en el local:** Listo para entrega → Entregado (salta Enviado).
  Un envío a domicilio no puede saltear Enviado.

Las transiciones válidas están en un solo objeto (`TRANSITIONS` en
`src/services/orderService.js`) y todo cambio de estado pasa por ahí. Cada
cambio agrega una entrada al historial y crea una notificación. Los cambios son
atómicos: si dos personas cambian el mismo pedido a la vez, solo vale el
primero y el otro recibe "el estado cambió".

## Reglas de negocio

- Las contraseñas se guardan con hash bcrypt.
- El login responde siempre el mismo error, sin decir qué dato falló.
- El registro siempre crea clientes; el admin sale del seed.
- Un cliente solo ve y cancela sus pedidos: todas las consultas filtran por
  `client = usuario logueado`. Un pedido ajeno responde 404.
- Solo el admin revisa, cambia estados, administra tarifas y descarga remitos.
- No hay stock: el modelo de producto no tiene ese campo y el catálogo no lo muestra.
- No hay cobros: "Ir a pago externo" abre `PAYMENT_URL` y el pedido queda en
  Pendiente de pago hasta que el admin confirma el pago.
- Los precios y el costo de envío siempre los calcula el servidor; lo que mande
  el formulario se ignora. El cliente ve el costo de envío antes de confirmar.
- Una tarifa vale hasta el final de su día de vigencia. Si dos tarifas vigentes
  se superponen, se usa la cargada más recientemente.

## Estructura

```
src/
  app.js            Express, middlewares y rutas
  db.js             Conexión a Mongo
  seed.js           Datos iniciales
  models/           User, Product, Order, ShippingRate, Notification, Counter
  middleware/       auth.js (JWT en cookie), role.js (requireRole)
  services/         orderService (estados), shippingService (tarifas),
                    remitoService (PDF), cartService (carrito en sesión)
  routes/           auth, products, cart, orders, admin, notifications
  views/            Vistas EJS (+ partials/)
  public/           styles.css
scripts/
  e2e.js            Prueba de punta a punta
```

`Counter` numera los pedidos (1, 2, 3…) sin repetir aunque entren dos a la vez.

## Problemas comunes

- **`querySrv ECONNREFUSED` al conectar a Atlas (Windows):** Node a veces toma
  `127.0.0.1` como DNS y no puede resolver las URIs `mongodb+srv://`. La app lo
  detecta y usa DNS públicos (8.8.8.8 y 1.1.1.1). Para usar otros, ponelos en
  `DNS_SERVERS=1.1.1.1,8.8.8.8`.
- **Se vació el carrito:** el carrito vive en la memoria del servidor y se
  pierde al reiniciar (con `npm run dev`, cada vez que se guarda un archivo).

## Fuera de alcance

Compra como invitado, stock, cobros, devoluciones, envíos internacionales,
mail y subida de imágenes (los productos usan URL).
