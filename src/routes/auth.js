const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { setAuthCookie, clearAuthCookie } = require('../middleware/auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;
const LOGIN_ERROR = 'Email o contraseña incorrectos.';

// Solo rutas internas, para que ?next= no sirva para mandar a otro sitio.
function safeNext(next) {
  // "/\evil.com" los navegadores lo tratan como "//evil.com", por eso se rechaza "\".
  const ok = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\');
  return ok ? next : null;
}

function homeFor(user) {
  return user.role === 'admin' ? '/admin' : '/';
}

// ---------- Registro (CU02) ----------

router.get('/registro', (req, res) => {
  if (req.user) return res.redirect(homeFor(req.user));
  res.render('registro', { title: 'Crear cuenta', errors: [], values: {} });
});

router.post('/registro', async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const phone = (req.body.phone || '').trim();
  const password = req.body.password || '';
  const password2 = req.body.password2 || '';

  const errors = [];
  if (!name) errors.push('Ingresá tu nombre.');
  if (!EMAIL_RE.test(email)) errors.push('Ingresá un email válido.');
  if (!phone) errors.push('Ingresá un teléfono de contacto.');
  if (password.length < MIN_PASSWORD) errors.push(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
  if (password !== password2) errors.push('Las contraseñas no coinciden.');
  if (!errors.length && (await User.exists({ email }))) errors.push('Ya existe una cuenta con ese email.');

  const values = { name, email, phone };
  if (errors.length) {
    return res.status(400).render('registro', { title: 'Crear cuenta', errors, values });
  }

  // El rol siempre es client: un admin no se puede registrar desde acá.
  const user = await User.create({
    name,
    email,
    phone,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'client',
  });

  setAuthCookie(res, user);
  res.redirect('/');
});

// ---------- Login / logout (CU10) ----------

router.get('/login', (req, res) => {
  if (req.user) return res.redirect(homeFor(req.user));
  res.render('login', { title: 'Ingresar', error: null, email: '', next: safeNext(req.query.next) });
});

router.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const next = safeNext(req.body.next);

  const user = email ? await User.findOne({ email }) : null;
  const ok = user && (await bcrypt.compare(password, user.passwordHash));

  if (!ok) {
    // Mismo mensaje sea cual sea el dato que falló.
    return res.status(401).render('login', { title: 'Ingresar', error: LOGIN_ERROR, email, next });
  }

  setAuthCookie(res, user);
  res.redirect(next || homeFor(user));
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  // Borra también la sesión del carrito.
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;
