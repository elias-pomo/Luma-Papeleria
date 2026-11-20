const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const BELL_LIMIT = 5;
const PAGE_LIMIT = 50;

// Para la campana del encabezado: no leídas + las últimas 5.
// Corre en todas las páginas cuando hay usuario logueado.
async function loadNotifications(req, res, next) {
  res.locals.unreadCount = 0;
  res.locals.latestNotifications = [];
  if (!req.user) return next();
  const [unreadCount, latest] = await Promise.all([
    Notification.countDocuments({ user: req.user.id, read: false }),
    Notification.find({ user: req.user.id }).sort({ date: -1 }).limit(BELL_LIMIT).lean(),
  ]);
  res.locals.unreadCount = unreadCount;
  res.locals.latestNotifications = latest;
  next();
}

// Solo se redirige a rutas internas.
const safeLink = (link) => (typeof link === 'string' && link.startsWith('/') && !link.startsWith('//') ? link : null);

router.use(requireAuth);

router.get('/', async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ date: -1 }).limit(PAGE_LIMIT).lean();
  res.render('notificaciones', { title: 'Notificaciones', notifications });
});

// Marca una como leída y lleva a su página (siempre filtrando por usuario).
router.post('/:id/leer', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next();
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: { read: true } },
    { returnDocument: 'after' }
  ).lean();
  if (!n) return next();
  res.redirect(safeLink(n.link) || '/notificaciones');
});

router.post('/leer-todas', async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
  res.redirect(safeLink(req.body.back) || '/notificaciones');
});

module.exports = router;
module.exports.loadNotifications = loadNotifications;
