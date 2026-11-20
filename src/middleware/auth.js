const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 día

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL_SECONDS }
  );
}

function setAuthCookie(res, user) {
  res.cookie(COOKIE_NAME, signToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_TTL_SECONDS * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

// Corre en todas las rutas: si hay un token válido, deja el usuario en
// req.user y en res.locals.user (para las vistas). Si no, sigue sin usuario.
function loadUser(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  req.user = null;
  if (token) {
    try {
      const { id, role, name } = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id, role, name };
    } catch {
      clearAuthCookie(res); // vencido o adulterado
    }
  }
  res.locals.user = req.user;
  next();
}

// Exige estar logueado. Si no, manda al login y vuelve después.
function requireAuth(req, res, next) {
  if (req.user) return next();
  // Solo se vuelve a páginas (GET); un POST no se puede repetir por redirección.
  const back = req.method === 'GET' ? `?next=${encodeURIComponent(req.originalUrl)}` : '';
  res.redirect(`/login${back}`);
}

module.exports = { loadUser, requireAuth, setAuthCookie, clearAuthCookie };
