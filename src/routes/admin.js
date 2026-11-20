const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const ShippingRate = require('../models/ShippingRate');
const requireRole = require('../middleware/role');
const {
  CONFIRMED_OR_LATER,
  nextStatuses,
  changeStatus,
  StatusChangedError,
  InvalidTransitionError,
} = require('../services/orderService');
const { writeRemito } = require('../services/remitoService');

const router = express.Router();

// Todo /admin es solo para administradores.
router.use(requireRole('admin'));

// ===========================================================================
// Pedidos (CU05, CU07)
// ===========================================================================

const VIEWS = {
  pendientes: { label: 'Pendientes', statuses: ['Solicitado', 'En revisión'] },
  'en-curso': { label: 'En curso', statuses: ['Confirmado', 'Pendiente de pago', 'En preparación', 'Listo para entrega', 'Enviado'] },
  cerrados: { label: 'Cerrados', statuses: ['Entregado', 'Rechazado', 'Cancelado'] },
  todos: { label: 'Todos', statuses: null },
};

router.get('/', async (req, res) => {
  const vista = VIEWS[req.query.vista] ? req.query.vista : 'pendientes';
  const { statuses } = VIEWS[vista];
  const filter = statuses ? { status: { $in: statuses } } : {};

  const [orders, counts] = await Promise.all([
    Order.find(filter)
      .select('number status deliveryMode client createdAt items shippingCost')
      .populate('client', 'name')
      .sort({ createdAt: vista === 'pendientes' ? 1 : -1 }) // pendientes: el más viejo primero
      .lean(),
    Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);

  const byStatus = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  const viewCounts = Object.fromEntries(
    Object.entries(VIEWS).map(([key, v]) => [
      key,
      v.statuses ? v.statuses.reduce((s, st) => s + (byStatus[st] || 0), 0) : counts.reduce((s, c) => s + c.n, 0),
    ])
  );

  res.render('admin-pedidos', { title: 'Pedidos', orders, vista, views: VIEWS, viewCounts });
});

async function renderOrder(req, res, next, { error = null, status = 200 } = {}) {
  if (!mongoose.isValidObjectId(req.params.id)) return next();
  const order = await Order.findById(req.params.id)
    .populate('client', 'name email phone')
    .populate('history.by', 'name role')
    .lean();
  if (!order) return next();
  res.status(status).render('admin-pedido', {
    title: `Pedido #${order.number}`,
    order,
    actions: nextStatuses(order),
    canRemito: CONFIRMED_OR_LATER.includes(order.status),
    error,
    ok: req.query.ok === '1',
  });
}

router.get('/pedidos/:id', (req, res, next) => renderOrder(req, res, next));

// ---------- Remito PDF (CU08) ----------

router.get('/pedidos/:id/remito', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next();
  const order = await Order.findById(req.params.id).populate('client', 'name email phone').lean();
  if (!order) return next();
  if (!CONFIRMED_OR_LATER.includes(order.status)) {
    return renderOrder(req, res, next, {
      error: 'El remito solo se puede generar para pedidos en estado Confirmado o posterior.',
      status: 400,
    });
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="remito-${order.number}.pdf"`);
  writeRemito(order, res);
});

router.post('/pedidos/:id/estado', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next();
  const to = typeof req.body.to === 'string' ? req.body.to : '';
  const reason = typeof req.body.reason === 'string' ? req.body.reason.slice(0, 500) : '';
  try {
    const updated = await changeStatus({ orderId: req.params.id, to, adminId: req.user.id, reason });
    if (!updated) return next();
    res.redirect(`/admin/pedidos/${req.params.id}?ok=1`);
  } catch (err) {
    if (err instanceof InvalidTransitionError) return renderOrder(req, res, next, { error: err.message, status: 400 });
    if (err instanceof StatusChangedError) return renderOrder(req, res, next, { error: err.message, status: 409 });
    throw err;
  }
});

// ===========================================================================
// Tarifas de envío (ABM)
// ===========================================================================

const CP_RE = /^\d{4}$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// "2026-12-31" -> medianoche en hora local, igual que compara shippingService.
function parseLocalDate(text) {
  const m = DATE_RE.exec(text || '');
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null; // descarta 2026-02-31
}

function toInputDate(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseRate(body) {
  const values = {
    cpFrom: String(body.cpFrom ?? '').trim(),
    cpTo: String(body.cpTo ?? '').trim(),
    cost: String(body.cost ?? '').trim(),
    validUntil: String(body.validUntil ?? '').trim(),
  };
  const errors = [];
  if (!CP_RE.test(values.cpFrom)) errors.push('El CP "desde" debe tener 4 números.');
  if (!CP_RE.test(values.cpTo)) errors.push('El CP "hasta" debe tener 4 números.');
  if (!errors.length && Number(values.cpFrom) > Number(values.cpTo)) errors.push('El CP "desde" no puede ser mayor que el CP "hasta".');
  if (!/^\d+$/.test(values.cost)) errors.push('El costo debe ser un número entero mayor o igual a 0.');
  const validUntil = parseLocalDate(values.validUntil);
  if (!validUntil) errors.push('Ingresá una fecha de vigencia válida.');

  const data = errors.length
    ? null
    : { cpFrom: Number(values.cpFrom), cpTo: Number(values.cpTo), cost: Number(values.cost), validUntil };
  return { values, errors, data };
}

async function renderRates(res, { errors = [], values = {}, status = 200 } = {}) {
  const rates = await ShippingRate.find().sort({ cpFrom: 1, createdAt: -1 }).lean();
  const today = startOfToday();
  rates.forEach((r) => (r.active = r.validUntil >= today));
  res.status(status).render('admin-tarifas', { title: 'Tarifas de envío', rates, errors, values, toInputDate });
}

router.get('/tarifas', (req, res) => renderRates(res));

router.post('/tarifas', async (req, res) => {
  const { values, errors, data } = parseRate(req.body);
  if (errors.length) return renderRates(res, { errors, values, status: 400 });
  await ShippingRate.create(data);
  res.redirect('/admin/tarifas');
});

async function findRate(req) {
  if (!mongoose.isValidObjectId(req.params.id)) return null;
  return ShippingRate.findById(req.params.id).lean();
}

router.get('/tarifas/:id/editar', async (req, res, next) => {
  const rate = await findRate(req);
  if (!rate) return next();
  const values = { cpFrom: rate.cpFrom, cpTo: rate.cpTo, cost: rate.cost, validUntil: toInputDate(rate.validUntil) };
  res.render('admin-tarifa-editar', { title: 'Editar tarifa', rate, values, errors: [] });
});

router.post('/tarifas/:id', async (req, res, next) => {
  const rate = await findRate(req);
  if (!rate) return next();
  const { values, errors, data } = parseRate(req.body);
  if (errors.length) {
    return res.status(400).render('admin-tarifa-editar', { title: 'Editar tarifa', rate, values, errors });
  }
  await ShippingRate.updateOne({ _id: rate._id }, data);
  res.redirect('/admin/tarifas');
});

router.post('/tarifas/:id/eliminar', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next();
  await ShippingRate.deleteOne({ _id: req.params.id });
  res.redirect('/admin/tarifas');
});

module.exports = router;
