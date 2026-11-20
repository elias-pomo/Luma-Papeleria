const Order = require('../models/Order');
const User = require('../models/User');
const Counter = require('../models/Counter');
const Notification = require('../models/Notification');

// ---------------------------------------------------------------------------
// Reglas de estado del pedido. Todo cambio de estado pasa por este archivo.
// ---------------------------------------------------------------------------

// Transiciones válidas: estado actual -> estados a los que puede pasar.
const TRANSITIONS = {
  'Solicitado': ['En revisión', 'Cancelado'],
  'En revisión': ['Confirmado', 'Rechazado', 'Cancelado'],
  'Confirmado': ['Pendiente de pago', 'Cancelado'],
  'Pendiente de pago': ['En preparación', 'Cancelado'],
  'En preparación': ['Listo para entrega'],
  'Listo para entrega': ['Enviado', 'Entregado'], // según la modalidad, ver nextStatuses
  'Enviado': ['Entregado'],
  'Entregado': [],
  'Rechazado': [],
  'Cancelado': [],
};

// Estados desde los que se puede cancelar.
const CANCELABLE = ['Solicitado', 'En revisión', 'Confirmado', 'Pendiente de pago'];

// Estados desde Confirmado en adelante (para el remito).
const CONFIRMED_OR_LATER = ['Confirmado', 'Pendiente de pago', 'En preparación', 'Listo para entrega', 'Enviado', 'Entregado'];

class StatusChangedError extends Error {
  constructor() {
    super('El estado del pedido cambió. Recargá la página y volvé a intentar.');
  }
}

class InvalidTransitionError extends Error {}

// Estados a los que puede pasar un pedido concreto. Retiro en local salta
// "Enviado" (Listo para entrega -> Entregado); envío a domicilio no puede
// saltearlo.
function nextStatuses(order) {
  const next = TRANSITIONS[order.status] || [];
  if (order.status !== 'Listo para entrega') return next;
  return next.filter((s) => (order.deliveryMode === 'retiro' ? s === 'Entregado' : s === 'Enviado'));
}

function statusMessage(order, status, reason) {
  const base = `Tu pedido #${order.number} pasó a "${status}".`;
  if (status === 'Rechazado') return `${base} Motivo: ${reason}`;
  if (status === 'Pendiente de pago') return `${base} Ya podés pagarlo desde Mis pedidos.`;
  return base;
}

// Cada notificación lleva a la página del pedido que corresponde a quien la recibe.
const clientLink = (order) => `/mis-pedidos/${order._id}`;
const adminLink = (order) => `/admin/pedidos/${order._id}`;

function notifyClient(order, message) {
  return Notification.create({ user: order.client, message, link: clientLink(order) });
}

async function notifyAdmins(order, message) {
  const admins = await User.find({ role: 'admin' }).select('_id').lean();
  if (admins.length) {
    await Notification.insertMany(admins.map((a) => ({ user: a._id, message, link: adminLink(order) })));
  }
}

/**
 * Crea un pedido en estado Solicitado.
 * items: [{ product, name, qty, unitPrice, customization }] con precios ya
 * tomados de la base (nunca del formulario).
 */
async function createOrder({ clientId, items, deliveryMode, address, postalCode, shippingCost }) {
  const number = await Counter.next('order');
  const order = await Order.create({
    number,
    client: clientId,
    items,
    deliveryMode,
    address: deliveryMode === 'domicilio' ? address : '',
    postalCode: deliveryMode === 'domicilio' ? postalCode : '',
    shippingCost: deliveryMode === 'domicilio' ? shippingCost : 0,
    status: 'Solicitado',
    history: [{ status: 'Solicitado', by: clientId }],
  });

  await Promise.all([
    notifyClient(order, `Recibimos tu pedido #${number}. Está en estado Solicitado.`),
    notifyAdmins(order, `Nuevo pedido #${number} para revisar.`),
  ]);

  return order;
}

/**
 * Cambio de estado hecho por un admin (CU05, CU07).
 * Valida la transición y la aplica de forma atómica: si otro usuario cambió
 * el estado en el medio, el update no matchea y se lanza StatusChangedError.
 */
async function changeStatus({ orderId, to, adminId, reason = '' }) {
  const order = await Order.findById(orderId);
  if (!order) return null;

  if (!nextStatuses(order).includes(to)) {
    throw new InvalidTransitionError(`No se puede pasar de "${order.status}" a "${to}".`);
  }
  if (to === 'Rechazado' && !reason.trim()) {
    throw new InvalidTransitionError('Indicá el motivo del rechazo.');
  }

  const set = { status: to };
  if (to === 'Rechazado') set.rejectReason = reason.trim();

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { $set: set, $push: { history: { status: to, by: adminId } } },
    { returnDocument: 'after' }
  );
  if (!updated) throw new StatusChangedError();

  await notifyClient(updated, statusMessage(updated, to, set.rejectReason));
  return updated;
}

/**
 * Cancelación por parte del cliente (CU11). El filtro incluye al cliente y
 * los estados cancelables, así que no puede cancelar pedidos ajenos ni
 * pedidos que ya avanzaron. Si no matchea, el estado cambió.
 */
async function cancelByClient({ orderId, clientId }) {
  const updated = await Order.findOneAndUpdate(
    { _id: orderId, client: clientId, status: { $in: CANCELABLE } },
    { $set: { status: 'Cancelado' }, $push: { history: { status: 'Cancelado', by: clientId } } },
    { returnDocument: 'after' }
  );
  if (!updated) throw new StatusChangedError();

  await Promise.all([
    notifyClient(updated, `Cancelaste el pedido #${updated.number}.`),
    notifyAdmins(updated, `El cliente canceló el pedido #${updated.number}.`),
  ]);
  return updated;
}

function orderSubtotal(order) {
  return order.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
}

module.exports = {
  TRANSITIONS,
  CANCELABLE,
  CONFIRMED_OR_LATER,
  StatusChangedError,
  InvalidTransitionError,
  nextStatuses,
  createOrder,
  changeStatus,
  cancelByClient,
  orderSubtotal,
};
