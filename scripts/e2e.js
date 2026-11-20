/* eslint-disable no-console */
// Prueba de punta a punta contra la app corriendo.
//   1) npm run dev        (en otra terminal)
//   2) npm run e2e        (BASE_URL=http://localhost:3000 por defecto)
// Crea usuarios y pedidos de prueba (emails e2e.*@papeleria.test) y los
// borra al terminar. Usa el admin del seed (SEED_ADMIN_EMAIL / PASSWORD).
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../src/db');
const User = require('../src/models/User');
const Order = require('../src/models/Order');
const Product = require('../src/models/Product');
const Counter = require('../src/models/Counter');
const Notification = require('../src/models/Notification');
const ShippingRate = require('../src/models/ShippingRate');
const { findRate } = require('../src/services/shippingService');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const EMAILS = ['e2e.ana@papeleria.test', 'e2e.beto@papeleria.test'];
const PASSWORD = 'e2e-secreto';

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? '  ✔' : '  ✘'} ${name}${!ok && detail ? `  → ${detail}` : ''}`);
}
const section = (t) => console.log(`\n${t}`);

// Completa los campos guiados de un producto (o el cuadro libre si no tiene).
function personalize(product, text) {
  if (!product.options || !product.options.length) return { customization: text };
  const body = { notes: text };
  for (const o of product.options) {
    if (o.type === 'select' || o.type === 'color') body[`opt_${o.key}`] = o.choices[0];
    else if (o.type === 'date') body[`opt_${o.key}`] = '2027-03-15';
    else if (o.type === 'url') body[`opt_${o.key}`] = 'https://example.com/logo.png';
    else body[`opt_${o.key}`] = text.slice(0, o.maxLength || 60);
  }
  return body;
}

// Navegador mínimo con cookies.
function browser() {
  const jar = new Map();
  return async (path, body) => {
    const opts = { redirect: 'manual', headers: { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') } };
    if (body) {
      opts.method = 'POST';
      opts.headers['content-type'] = 'application/x-www-form-urlencoded';
      opts.body = new URLSearchParams(body);
    }
    const r = await fetch(BASE + path, opts);
    for (const c of r.headers.getSetCookie()) {
      const [k, v] = c.split(';')[0].split('=');
      if (!v || /Expires=Thu, 01 Jan 1970/.test(c)) jar.delete(k);
      else jar.set(k, v);
    }
    const type = r.headers.get('content-type') || '';
    const buf = Buffer.from(await r.arrayBuffer());
    return { status: r.status, location: r.headers.get('location'), type, html: type.includes('html') ? buf.toString() : '', buf };
  };
}

async function cleanup() {
  const ids = (await User.find({ email: { $in: EMAILS } }).select('_id')).map((u) => u._id);
  const orders = await Order.find({ client: { $in: ids } }).select('_id');
  const links = orders.flatMap((o) => [`/mis-pedidos/${o._id}`, `/admin/pedidos/${o._id}`]);
  await Notification.deleteMany({ $or: [{ user: { $in: ids } }, { link: { $in: links } }] });
  await Order.deleteMany({ client: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });
  if (!(await Order.exists({}))) await Counter.deleteOne({ _id: 'order' });
}

async function main() {
  await connectDB();
  await cleanup(); // por si quedó algo de una corrida anterior

  const product = await Product.findOne({ published: true });
  const rate = await ShippingRate.findOne({ validUntil: { $gte: new Date() } });
  if (!product || !rate) throw new Error('Faltan productos o tarifas vigentes: corré "npm run seed".');
  const cp = String(rate.cpFrom);

  const anon = browser();
  const ana = browser();
  const beto = browser();
  const admin = browser();

  section('Catálogo (CU01)');
  let r = await anon('/');
  check('el catálogo es público', r.status === 200 && /class="product[ "]/.test(r.html));
  check('no expone stock', !/stock/i.test(r.html));
  r = await anon(`/?q=${encodeURIComponent(product.name.split(' ')[0])}`);
  check('el buscador encuentra por nombre', r.html.includes(product.name));

  section('Registro y login (CU02, CU10)');
  r = await ana('/registro', { name: 'Ana E2E', email: EMAILS[0], phone: '1111', password: PASSWORD, password2: PASSWORD });
  check('registro de cliente', r.status === 302);
  await beto('/registro', { name: 'Beto E2E', email: EMAILS[1], phone: '2222', password: PASSWORD, password2: PASSWORD });
  const stored = await User.findOne({ email: EMAILS[0] }).lean();
  check('la contraseña se guarda con hash', stored.passwordHash !== PASSWORD && stored.passwordHash.startsWith('$2'));
  check('el registro siempre crea clientes', stored.role === 'client');
  const bad1 = await anon('/login', { email: EMAILS[0], password: 'mala' });
  const bad2 = await anon('/login', { email: 'nadie@papeleria.test', password: 'mala' });
  const msg = (h) => (h.match(/class="alert">([^<]+)/) || [])[1];
  check('error de login genérico (mismo mensaje)', bad1.status === 401 && msg(bad1.html) === msg(bad2.html));
  r = await admin('/login', { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD });
  check('login de admin', r.status === 302 && r.location === '/admin');

  section('Carrito y pedido (CU03, CU04, CU09)');
  r = await ana('/carrito/agregar', { productId: product._id, qty: '1.5', ...personalize(product, 'x') });
  check('rechaza cantidad no entera', r.status === 400);
  r = await ana('/carrito/agregar', { productId: product._id, qty: '2', customization: '' });
  check('exige personalización', r.status === 400);
  await ana('/carrito/agregar', { productId: product._id, qty: '2', ...personalize(product, 'Ana') });
  r = await ana('/carrito/checkout', { action: 'cotizar', postalCode: cp });
  check('cotiza el envío con la tarifa vigente', r.html.includes(`Envío a CP ${cp}`));
  r = await ana('/carrito/checkout', { action: 'cotizar', postalCode: '0001' });
  check('sin tarifa avisa y ofrece retiro', r.html.includes('Confirmar con retiro en el local'));
  r = await ana('/carrito/checkout', { deliveryMode: 'domicilio', address: 'Calle 123', postalCode: cp, action: 'confirmar' });
  check('no confirma sin mostrar antes el costo de envío', r.status === 200 && !(await Order.exists({ client: stored._id })));
  r = await ana('/carrito/checkout', {
    deliveryMode: 'domicilio', address: 'Calle 123', postalCode: cp, quotedCp: cp, quotedCost: String((await findRate(cp)).cost), action: 'confirmar',
  });
  const orderA = await Order.findOne({ client: stored._id }).lean();
  check('crea el pedido en Solicitado', r.status === 302 && orderA && orderA.status === 'Solicitado');
  check('guarda precio de la base y costo de envío', orderA.items[0].unitPrice === product.basePrice && orderA.shippingCost === (await findRate(cp)).cost);
  if (product.options && product.options.length) {
    const first = product.options[0];
    check('guarda la personalización guiada en líneas', orderA.items[0].customization.startsWith(`${first.label}: `) && orderA.items[0].customization.includes('Aclaraciones: Ana'));
  }

  section('Ficha de producto');
  r = await anon(`/productos/${product._id}`);
  check('muestra el plazo de producción', !product.productionDays || r.html.includes(product.productionDays));
  check('muestra "Combiná con" con otros productos', r.html.includes('Combiná con') && /class="product[ "]/.test(r.html));
  r = await anon(`/productos/${product._id}?cp=${cp}`);
  check('cotiza el envío desde la ficha', r.html.includes(`Envío a CP ${cp}`));
  r = await anon(`/productos/${product._id}?cp=0001`);
  check('avisa si no hay envío a ese CP', r.html.includes('No tenemos envío al CP 0001'));
  r = await anon(`/productos/${product._id}?cp=12ab`);
  check('rechaza un CP inválido en la ficha', r.html.includes('tiene que tener 4 números'));
  const choiceOpt = (product.options || []).find((o) => o.type === 'select' || o.type === 'color');
  if (choiceOpt) {
    r = await ana('/carrito/agregar', { productId: product._id, qty: '1', ...personalize(product, 'x'), [`opt_${choiceOpt.key}`]: 'Inventado' });
    check('rechaza una opción que no está en la lista', r.status === 400);
  }

  await beto('/carrito/agregar', { productId: product._id, qty: '1', ...personalize(product, 'Beto') });
  await beto('/carrito/checkout', { deliveryMode: 'retiro', action: 'confirmar' });
  const betoUser = await User.findOne({ email: EMAILS[1] }).lean();
  const orderB = await Order.findOne({ client: betoUser._id }).lean();
  check('pedido con retiro en el local', orderB && orderB.deliveryMode === 'retiro' && orderB.shippingCost === 0);

  section('Mis pedidos y privacidad (CU06)');
  r = await ana('/mis-pedidos');
  check('lista solo pedidos propios', r.html.includes(String(orderA._id)) && !r.html.includes(String(orderB._id)));
  r = await ana(`/mis-pedidos/${orderB._id}`);
  check('cambiar el ID en la URL no muestra pedidos ajenos (404)', r.status === 404);
  r = await ana(`/mis-pedidos/${orderB._id}/cancelar`, {});
  check('no puede cancelar pedidos ajenos', r.status === 404 && (await Order.findById(orderB._id)).status === 'Solicitado');
  r = await beto(`/carrito/confirmado/${orderA.number}`);
  check('tampoco ve la confirmación de un pedido ajeno', r.status === 404);
  r = await ana('/admin');
  check('un cliente no entra al panel admin (403)', r.status === 403);
  r = await ana(`/admin/pedidos/${orderA._id}/remito`);
  check('un cliente no descarga remitos (403)', r.status === 403);

  section('Panel admin y estados (CU05, CU07, CU08)');
  const to = (id, status, extra = {}) => admin(`/admin/pedidos/${id}/estado`, { to: status, ...extra });
  r = await admin(`/admin/pedidos/${orderA._id}/remito`);
  check('remito bloqueado antes de Confirmado', r.status === 400);
  check('tomar pedido', (await to(orderA._id, 'En revisión')).status === 302);
  check('no permite saltar estados', (await to(orderA._id, 'Entregado')).status === 400);
  check('confirmar', (await to(orderA._id, 'Confirmado')).status === 302);
  r = await admin(`/admin/pedidos/${orderA._id}/remito`);
  check('remito PDF desde Confirmado', r.status === 200 && r.type.includes('application/pdf') && r.buf.subarray(0, 4).toString() === '%PDF');
  check('habilitar pago', (await to(orderA._id, 'Pendiente de pago')).status === 302);
  r = await ana(`/mis-pedidos/${orderA._id}`);
  check('el cliente ve "Ir a pago externo"', r.html.includes('Ir a pago externo'));
  for (const s of ['En preparación', 'Listo para entrega']) await to(orderA._id, s);
  check('envío a domicilio no saltea "Enviado"', (await to(orderA._id, 'Entregado')).status === 400);
  await to(orderA._id, 'Enviado');
  check('entregado', (await to(orderA._id, 'Entregado')).status === 302);
  const finalA = await Order.findById(orderA._id).lean();
  check('historial completo', finalA.history.map((h) => h.status).join('>') ===
    'Solicitado>En revisión>Confirmado>Pendiente de pago>En preparación>Listo para entrega>Enviado>Entregado');

  await to(orderB._id, 'En revisión');
  check('rechazar exige motivo', (await to(orderB._id, 'Rechazado', { reason: '' })).status === 400);
  check('rechazar con motivo', (await to(orderB._id, 'Rechazado', { reason: 'Diseño no disponible' })).status === 302);
  r = await beto(`/mis-pedidos/${orderB._id}`);
  check('el cliente ve el motivo del rechazo', r.html.includes('Diseño no disponible'));

  section('Cancelación (CU11)');
  await beto('/carrito/agregar', { productId: product._id, qty: '1', ...personalize(product, 'Cancelar') });
  await beto('/carrito/checkout', { deliveryMode: 'retiro', action: 'confirmar' });
  const orderC = await Order.findOne({ client: betoUser._id, status: 'Solicitado' }).lean();
  r = await beto(`/mis-pedidos/${orderC._id}/cancelar`, {});
  check('el cliente cancela un pedido Solicitado', r.status === 302 && (await Order.findById(orderC._id)).status === 'Cancelado');
  r = await beto(`/mis-pedidos/${orderC._id}/cancelar`, {});
  check('cancelar de nuevo avisa que el estado cambió (409)', r.status === 409);
  r = await ana(`/mis-pedidos/${orderA._id}/cancelar`, {});
  check('no se puede cancelar un pedido entregado', r.status === 409);

  section('Notificaciones');
  r = await ana('/');
  const badge = Number((r.html.match(/class="badge">(\d+)/) || [])[1] || 0);
  check('la campana muestra no leídas', badge > 0, `badge=${badge}`);
  const notif = await Notification.findOne({ user: stored._id, read: false }).lean();
  r = await beto(`/notificaciones/${notif._id}/leer`, {});
  check('no puede marcar notificaciones ajenas', r.status === 404);
  r = await ana(`/notificaciones/${notif._id}/leer`, {});
  check('marcar leída lleva al pedido', r.status === 302 && r.location === `/mis-pedidos/${orderA._id}`);
  await ana('/notificaciones/leer-todas', {});
  check('marcar todas como leídas', (await Notification.countDocuments({ user: stored._id, read: false })) === 0);
  r = await admin('/notificaciones');
  check('el admin recibe aviso de pedidos nuevos', r.html.includes(`Nuevo pedido #${orderA.number}`));

  section('Logout');
  await ana('/logout', {});
  r = await ana('/mis-pedidos');
  check('después de salir pide login', r.status === 302 && r.location.startsWith('/login'));
}

main()
  .catch((err) => {
    failed++;
    console.error('\nError:', err.message);
  })
  .finally(async () => {
    try {
      await cleanup();
      console.log('\nDatos de prueba borrados.');
    } catch (e) {
      console.error('No se pudieron borrar los datos de prueba:', e.message);
    }
    await mongoose.disconnect();
    console.log(`\nResultado: ${passed} OK, ${failed} con error.`);
    process.exitCode = failed ? 1 : 0;
  });
