const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const requireRole = require('../middleware/role');
const { CANCELABLE, StatusChangedError, cancelByClient } = require('../services/orderService');

const router = express.Router();

// Mis pedidos: solo clientes, y siempre filtrando por client = req.user.id.
router.use(requireRole('client'));

// ---------- Listado (CU06) ----------

router.get('/', async (req, res) => {
  const orders = await Order.find({ client: req.user.id })
    .select('number status deliveryMode items shippingCost createdAt')
    .sort({ createdAt: -1 })
    .lean();
  res.render('mis-pedidos', { title: 'Mis pedidos', orders });
});

// ---------- Detalle con historial (CU06) ----------

async function findOwnOrder(req) {
  if (!mongoose.isValidObjectId(req.params.id)) return null;
  return Order.findOne({ _id: req.params.id, client: req.user.id }).populate('history.by', 'name role').lean();
}

async function renderDetail(req, res, next, { error = null, status = 200 } = {}) {
  const order = await findOwnOrder(req);
  if (!order) return next(); // ajeno o inexistente: 404, sin revelar si existe
  res.status(status).render('mi-pedido', {
    title: `Pedido #${order.number}`,
    order,
    canCancel: CANCELABLE.includes(order.status),
    paymentUrl: process.env.PAYMENT_URL || '',
    error,
    cancelled: req.query.cancelado === '1',
  });
}

router.get('/:id', (req, res, next) => renderDetail(req, res, next));

// ---------- Cancelar (CU11) ----------

router.post('/:id/cancelar', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next();
  try {
    await cancelByClient({ orderId: req.params.id, clientId: req.user.id });
    res.redirect(`/mis-pedidos/${req.params.id}?cancelado=1`);
  } catch (err) {
    if (!(err instanceof StatusChangedError)) throw err;
    renderDetail(req, res, next, { error: err.message, status: 409 });
  }
});

module.exports = router;
