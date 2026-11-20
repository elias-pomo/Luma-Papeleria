const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const requireRole = require('../middleware/role');
const { createOrder } = require('../services/orderService');
const { findRate, isValidPostalCode } = require('../services/shippingService');
const { DETAIL_FIELDS, productPageLocals } = require('../services/productPageService');
const { parseGuided } = require('../services/personalizationService');
const { getCart, clearCart, parseQty, parseCustomization, MAX_QTY, MAX_CUSTOMIZATION } = require('../services/cartService');

const router = express.Router();

// Solo clientes logueados hacen pedidos (no hay compra como invitado).
router.use(requireRole('client'));

const QTY_ERROR = `La cantidad debe ser un número entero entre 1 y ${MAX_QTY}.`;
const CUSTOMIZATION_ERROR = `Indicá la personalización (hasta ${MAX_CUSTOMIZATION} caracteres).`;

// Arma las líneas del carrito con nombre y precio leídos de la base.
// Saca del carrito los productos que ya no existen o se despublicaron.
async function loadCartLines(req) {
  const cart = getCart(req);
  const ids = cart.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids }, published: true })
    .select('name basePrice image imageUrl category')
    .lean();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const available = cart.filter((item) => byId.has(item.productId));
  const removedCount = cart.length - available.length;
  if (removedCount) req.session.cart = available;

  const lines = available.map((item, index) => {
    const product = byId.get(item.productId);
    return {
      index,
      productId: item.productId,
      name: product.name,
      image: product.image,
      imageUrl: product.imageUrl,
      category: product.category,
      unitPrice: product.basePrice,
      qty: item.qty,
      customization: item.customization,
      subtotal: product.basePrice * item.qty,
    };
  });
  const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
  return { lines, total, removedCount };
}

async function renderCart(req, res, errors = [], status = 200) {
  const { lines, total, removedCount } = await loadCartLines(req);
  if (removedCount) errors.push('Algunos productos ya no están disponibles y se quitaron del carrito.');
  const justAdded = req.method === 'GET' && req.query.agregado === '1' && lines.length > 0;
  res.locals.justAdded = justAdded; // para que el contador del encabezado salte
  res.status(status).render('carrito', { title: 'Carrito', lines, total, errors, justAdded });
}

function parseIndex(req) {
  const index = Number(req.params.index);
  return Number.isInteger(index) && index >= 0 && index < getCart(req).length ? index : null;
}

// ---------- Carrito (CU03) ----------

router.get('/', (req, res) => renderCart(req, res));

router.post('/agregar', async (req, res, next) => {
  const productId = String(req.body.productId || '');
  if (!mongoose.isValidObjectId(productId)) return next();
  const product = await Product.findOne({ _id: productId, published: true })
    .select(DETAIL_FIELDS)
    .lean();
  if (!product) return next();

  const qty = parseQty(req.body.qty);
  const errors = [];
  if (qty === null) errors.push(QTY_ERROR);

  // Con campos guiados se arma el texto a partir de ellos; si no, cuadro libre.
  let customization;
  let values = { qty: req.body.qty, customization: req.body.customization };
  if (product.options && product.options.length) {
    const guided = parseGuided(product, req.body);
    errors.push(...guided.errors);
    customization = guided.customization;
    values = { ...values, ...guided.values };
  } else {
    customization = parseCustomization(req.body.customization);
    if (customization === null) errors.push(CUSTOMIZATION_ERROR);
  }

  if (errors.length) {
    const extra = await productPageLocals(product, {});
    return res.status(400).render('producto', { title: product.name, product, ...extra, errors, values });
  }

  getCart(req).push({ productId, qty, customization });
  res.redirect('/carrito?agregado=1'); // la vista anima el sticker recién agregado
});

router.post('/:index/actualizar', async (req, res) => {
  const index = parseIndex(req);
  if (index === null) return res.redirect('/carrito');

  const qty = parseQty(req.body.qty);
  const customization = parseCustomization(req.body.customization);
  const errors = [];
  if (qty === null) errors.push(QTY_ERROR);
  if (customization === null) errors.push(CUSTOMIZATION_ERROR);
  if (errors.length) return renderCart(req, res, errors, 400);

  Object.assign(getCart(req)[index], { qty, customization });
  res.redirect('/carrito');
});

router.post('/:index/eliminar', (req, res) => {
  const index = parseIndex(req);
  if (index !== null) getCart(req).splice(index, 1);
  res.redirect('/carrito');
});

// ---------- Confirmar pedido (CU09) ----------

// shipping: null (sin cotizar), { postalCode, cost } o { postalCode, noCoverage: true }
async function renderCheckout(req, res, { errors = [], values = {}, shipping = null, notice = null, status = 200 } = {}) {
  const { lines, total, removedCount } = await loadCartLines(req);
  if (!lines.length) return res.redirect('/carrito');
  if (removedCount) errors.push('Algunos productos ya no están disponibles y se quitaron del carrito.');
  res.status(status).render('checkout', { title: 'Confirmar pedido', lines, total, errors, values, shipping, notice });
}

router.get('/checkout', (req, res) => renderCheckout(req, res));

// El mismo formulario sirve para "Calcular envío" (action=cotizar) y para
// "Confirmar pedido". El costo de envío siempre lo calcula el servidor.
router.post('/checkout', async (req, res) => {
  const quoting = req.body.action === 'cotizar';
  const deliveryMode = quoting ? 'domicilio' : req.body.deliveryMode;
  const address = typeof req.body.address === 'string' ? req.body.address.trim() : '';
  const postalCode = typeof req.body.postalCode === 'string' ? req.body.postalCode.trim() : '';
  const values = { deliveryMode, address, postalCode };

  const errors = [];
  let shipping = null;
  if (!['domicilio', 'retiro'].includes(deliveryMode)) errors.push('Elegí una modalidad de entrega.');
  if (deliveryMode === 'domicilio') {
    if (!quoting && !address) errors.push('Ingresá la dirección de entrega.');
    if (!isValidPostalCode(postalCode)) {
      errors.push('Ingresá un código postal de 4 números.');
    } else {
      const rate = await findRate(postalCode);
      shipping = rate ? { postalCode, cost: rate.cost } : { postalCode, noCoverage: true };
    }
  }

  const { lines, removedCount } = await loadCartLines(req);
  if (!lines.length) return res.redirect('/carrito');
  if (removedCount) errors.push('Algunos productos ya no están disponibles y se quitaron del carrito. Revisá el pedido.');
  if (errors.length) return renderCheckout(req, res, { errors, values, shipping, status: 400 });

  // Sin cobertura: se avisa y se ofrece retiro en el local (CU04).
  if (shipping && shipping.noCoverage) {
    return renderCheckout(req, res, { values, shipping, status: quoting ? 200 : 400 });
  }

  // El cliente tiene que ver el costo de envío antes de confirmar. Si todavía
  // no lo vio (o cambió el CP o la tarifa), se muestra y se pide confirmar.
  const quoteSeen =
    !shipping || (req.body.quotedCp === shipping.postalCode && Number(req.body.quotedCost) === shipping.cost);
  if (quoting || !quoteSeen) {
    const notice = quoting ? null : 'Revisá el costo de envío y el total, y confirmá el pedido.';
    return renderCheckout(req, res, { values, shipping, notice });
  }

  const order = await createOrder({
    clientId: req.user.id,
    items: lines.map((l) => ({
      product: l.productId,
      name: l.name,
      qty: l.qty,
      unitPrice: l.unitPrice,
      customization: l.customization,
    })),
    deliveryMode,
    address,
    postalCode,
    shippingCost: shipping ? shipping.cost : 0,
  });

  clearCart(req);
  res.redirect(`/carrito/confirmado/${order.number}`);
});

router.get('/confirmado/:number', async (req, res, next) => {
  const number = Number(req.params.number);
  if (!Number.isInteger(number)) return next();
  // Solo el dueño del pedido puede ver esta página.
  const order = await Order.findOne({ number, client: req.user.id }).lean();
  if (!order) return next();
  res.render('pedido-confirmado', { title: `Pedido #${order.number}`, order });
});

module.exports = router;
