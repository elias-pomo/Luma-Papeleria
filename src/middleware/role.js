const { requireAuth } = require('./auth');

// Uso: router.use(requireRole('admin'))
function requireRole(...roles) {
  return [
    requireAuth,
    (req, res, next) => {
      if (roles.includes(req.user.role)) return next();
      res.status(403).render('error', {
        title: 'Acceso denegado',
        message: 'No tenés permiso para ver esta página.',
      });
    },
  ];
}

module.exports = requireRole;
