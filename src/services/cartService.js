// Carrito guardado en la sesión: [{ productId, qty, customization }].
// Precio y nombre NO se guardan acá: se leen de la base al mostrar y al
// confirmar, así nadie puede cambiar un precio desde el navegador.

const MAX_QTY = 1000;
const MAX_CUSTOMIZATION = 800;

// Devuelve el carrito del usuario logueado. Si la sesión quedó con el
// carrito de otro usuario (mismo navegador), lo descarta.
function getCart(req) {
  const owner = req.user ? req.user.id : null;
  if (!req.session.cart || req.session.cartOwner !== owner) {
    req.session.cart = [];
    req.session.cartOwner = owner;
  }
  return req.session.cart;
}

function clearCart(req) {
  req.session.cart = [];
}

// Cantidad entera mayor a 0. Devuelve el número o null si no es válida.
function parseQty(value) {
  const text = String(value ?? '').trim();
  if (!/^\d+$/.test(text)) return null;
  const qty = Number(text);
  return qty > 0 && qty <= MAX_QTY ? qty : null;
}

function parseCustomization(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text && text.length <= MAX_CUSTOMIZATION ? text : null;
}

// Para el contador del encabezado.
function loadCartCount(req, res, next) {
  const owner = req.user ? req.user.id : null;
  const cart = req.session.cartOwner === owner ? req.session.cart || [] : [];
  res.locals.cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  next();
}

module.exports = { getCart, clearCart, parseQty, parseCustomization, loadCartCount, MAX_QTY, MAX_CUSTOMIZATION };
